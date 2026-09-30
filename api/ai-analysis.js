// Função de servidor (Vercel): gera a análise do relatório IA sem expor a chave da OpenAI no navegador.
//
// Variáveis de ambiente (no painel da Vercel, SEM o prefixo VITE_ para a chave não ir para o bundle):
//   OPENAI_API_KEY        chave da OpenAI (enquanto não existir, usa VITE_OPENAI_API_KEY, se houver)
//   FIREBASE_PROJECT_ID   opcional; por padrão usa VITE_FIREBASE_PROJECT_ID
//
// Só atende usuários logados e ativos: confere o token do Firebase Auth (assinatura do Google)
// e lê o próprio perfil no Firestore com esse token (as regras do Firestore valem aqui também).
import { createRemoteJWKSet, jwtVerify } from "jose";
import { sanitizeResumo, buildPrompt, callOpenAI } from "../src/lib/aiPrompt.js";

const JWKS = createRemoteJWKSet(
  new URL("https://www.googleapis.com/service_accounts/v1/jwk/securetoken@system.gserviceaccount.com"),
);

const send = (res, status, body) => {
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.setHeader("Cache-Control", "no-store");
  res.status(status).send(JSON.stringify(body));
};

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return send(res, 405, { error: "Método não permitido." });
  }

  const apiKey = process.env.OPENAI_API_KEY || process.env.VITE_OPENAI_API_KEY;
  const projectId = process.env.FIREBASE_PROJECT_ID || process.env.VITE_FIREBASE_PROJECT_ID;
  if (!apiKey || !projectId) {
    return send(res, 503, { code: "not-configured", error: "A análise por IA não está configurada no servidor." });
  }

  const token = String(req.headers.authorization || "").replace(/^Bearer\s+/i, "");
  if (!token) return send(res, 401, { error: "Faça login para gerar o relatório IA." });

  let uid;
  try {
    const { payload } = await jwtVerify(token, JWKS, {
      issuer: `https://securetoken.google.com/${projectId}`,
      audience: projectId,
    });
    uid = payload.sub;
  } catch {
    return send(res, 401, { error: "Sua sessão expirou. Entre de novo para gerar o relatório IA." });
  }

  try {
    const url = `https://firestore.googleapis.com/v1/projects/${encodeURIComponent(projectId)}/databases/(default)/documents/users/${encodeURIComponent(uid)}`;
    const perfil = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
    if (!perfil.ok) return send(res, 403, { error: "Sua conta não tem acesso ao relatório IA." });
    const doc = await perfil.json();
    if (doc?.fields?.disabled?.booleanValue === true) return send(res, 403, { error: "Esta conta foi desativada." });
  } catch {
    return send(res, 502, { error: "Não foi possível confirmar sua conta. Tente novamente." });
  }

  let body = req.body;
  if (typeof body === "string") { try { body = JSON.parse(body); } catch { body = null; } }
  const resumo = sanitizeResumo(body?.resumo);
  if (!resumo) return send(res, 400, { error: "Dados da auditoria inválidos." });

  try {
    const ai = await callOpenAI(buildPrompt(resumo), apiKey);
    return send(res, 200, { ai });
  } catch (err) {
    return send(res, 502, { error: `Não foi possível gerar a análise: ${String(err?.message || err).slice(0, 300)}` });
  }
}
