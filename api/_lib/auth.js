import { createRemoteJWKSet, jwtVerify } from "jose";

const JWKS = createRemoteJWKSet(
  new URL("https://www.googleapis.com/service_accounts/v1/jwk/securetoken@system.gserviceaccount.com"),
);

export function send(res, status, body) {
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.setHeader("Cache-Control", "no-store");
  res.status(status).send(JSON.stringify(body));
}

/** Corpo JSON da requisição; `null` se estiver malformado (o handler responde 400). */
export function readBody(req) {
  try {
    const body = typeof req.body === "string" ? JSON.parse(req.body || "{}") : (req.body || {});
    return body && typeof body === "object" && !Array.isArray(body) ? body : null;
  } catch { return null; }
}

/** Verifica o Firebase ID token. Nunca confie em um userId enviado pelo cliente. */
export async function requireUser(req, res) {
  const projectId = process.env.FIREBASE_PROJECT_ID || process.env.VITE_FIREBASE_PROJECT_ID;
  const token = String(req.headers.authorization || "").replace(/^Bearer\s+/i, "");
  if (!projectId || !token) {
    send(res, 401, { error: "Faça login para acessar os arquivos." });
    return null;
  }
  try {
    const { payload } = await jwtVerify(token, JWKS, {
      issuer: `https://securetoken.google.com/${projectId}`,
      audience: projectId,
    });
    return { uid: payload.sub, token, projectId };
  } catch {
    send(res, 401, { error: "Sua sessão expirou. Entre novamente." });
    return null;
  }
}

/** Usuário autenticado, com perfil existente e ativo. Devolve também o `role` do perfil (admin/user). */
export async function requireActiveUser(req, res) {
  const user = await requireUser(req, res);
  if (!user) return null;
  try {
    const url = `https://firestore.googleapis.com/v1/projects/${encodeURIComponent(user.projectId)}/databases/(default)/documents/users/${encodeURIComponent(user.uid)}`;
    const profile = await fetch(url, { headers: { Authorization: `Bearer ${user.token}` } });
    if (!profile.ok) throw new Error("profile-not-found");
    const data = await profile.json();
    if (data?.fields?.disabled?.booleanValue === true) throw new Error("disabled");
    return { ...user, role: data?.fields?.role?.stringValue === "admin" ? "admin" : "user" };
  } catch {
    send(res, 403, { error: "Sua conta não tem acesso aos arquivos." });
    return null;
  }
}
