// Análise do relatório IA (OpenAI): resumo dos dados, prompt e chamada.
// Compartilhado entre o navegador e a função de servidor api/ai-analysis.js.
// Não importa nada do app (nem import.meta.env) para rodar também no servidor.

const BRL = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });
const brl = (n) => BRL.format(Number(n) || 0);
const str = (v, max = 200) => String(v ?? "").slice(0, max);
const num = (v) => (Number.isFinite(Number(v)) ? Number(v) : 0);

/**
 * Resumo mínimo da auditoria que vai para a IA: contagens, totais por direção,
 * os 5 maiores casos e a contagem por tipo. Nenhum nome de paciente sai do app.
 */
export function resumoParaIA(res) {
  const divs = Array.isArray(res?.divergencias) ? res.divergencias : [];
  const sobre = divs.filter((d) => d.sentido === "rep_maior");
  const sub = divs.filter((d) => d.sentido === "prod_maior");
  const tipos = {};
  divs.flatMap((d) => (d.detalhes || []).map((p) => p.tipo)).forEach((t) => { if (t) tipos[t] = (tipos[t] || 0) + 1; });
  return {
    referencia: str(res?.referencia),
    totalMedicos: num(res?.totalMedicos),
    medicosComDivergencia: num(res?.medicosComDivergencia),
    valorTotal: str(res?.valorTotal, 40),
    sobre: { n: sobre.length, v: sobre.reduce((s, d) => s + num(d.diferencaRaw), 0) },
    sub: { n: sub.length, v: sub.reduce((s, d) => s + num(d.diferencaRaw), 0) },
    top5: divs.slice(0, 5).map((d) => ({ medico: str(d.medico, 120), sentido: d.sentido === "rep_maior" ? "rep_maior" : "prod_maior", diferenca: str(d.diferenca, 40) })),
    tipos,
  };
}

/** Valida e limita um resumo recebido de fora (servidor). null = inválido. */
export function sanitizeResumo(r) {
  if (!r || typeof r !== "object") return null;
  const tipos = {};
  if (r.tipos && typeof r.tipos === "object") {
    Object.entries(r.tipos).slice(0, 30).forEach(([k, v]) => { tipos[str(k, 80)] = num(v); });
  }
  return {
    referencia: str(r.referencia),
    totalMedicos: num(r.totalMedicos),
    medicosComDivergencia: num(r.medicosComDivergencia),
    valorTotal: str(r.valorTotal, 40),
    sobre: { n: num(r.sobre?.n), v: num(r.sobre?.v) },
    sub: { n: num(r.sub?.n), v: num(r.sub?.v) },
    top5: (Array.isArray(r.top5) ? r.top5 : []).slice(0, 5).map((d) => ({
      medico: str(d?.medico, 120), sentido: d?.sentido === "rep_maior" ? "rep_maior" : "prod_maior", diferenca: str(d?.diferenca, 40),
    })),
    tipos,
  };
}

/** Prompt da análise (mesmo texto de antes, agora montado a partir do resumo). */
export function buildPrompt(r) {
  const pct = r.totalMedicos ? Math.round((r.medicosComDivergencia / r.totalMedicos) * 100) : 0;
  const top5 = r.top5.map((d) => d.medico + ": " + (d.sentido === "rep_maior" ? "Rep" : "Prod") + " maior em " + d.diferenca).join("; ");
  return "Voce e um auditor financeiro senior especialista em clinicas medicas no Brasil.\n"
    + "Analise os dados de auditoria abaixo e responda APENAS com JSON valido (sem markdown).\n\n"
    + "DADOS:\n"
    + "- Referencia: " + r.referencia + "\n"
    + "- " + r.totalMedicos + " medicos, " + r.medicosComDivergencia + " com divergencia (" + pct + "%)\n"
    + "- Valor divergente: " + r.valorTotal + "\n"
    + "- Repasse>Producao (sobrepagamento): " + r.sobre.n + " medicos, " + brl(r.sobre.v) + "\n"
    + "- Producao>Repasse (subpagamento): " + r.sub.n + " medicos, " + brl(r.sub.v) + "\n"
    + "- Top casos: " + top5 + "\n"
    + "- Tipos de divergencia: " + JSON.stringify(r.tipos) + "\n\n"
    + "Responda EXATAMENTE neste JSON (todos campos obrigatorios, portugues, profissional):\n"
    + JSON.stringify({
      resumoExecutivo: "1-2 frases executivas",
      interpretacaoRisco: "1 frase sobre o nivel de risco",
      analisesPorTipo: [{ tipo: "nome exato", interpretacao: "significado em 1-2 frases", prevencao: "como prevenir" }],
      planoDeAcao: [{ acao: "acao concreta", prazo: "48 horas", responsavel: "Equipe de Faturamento", impacto: "impacto esperado", urgencia: "alta" }],
      insights: ["observacao 1", "observacao 2", "observacao 3"],
      anomalias: ["padrao 1", "padrao 2"],
      recomendacoes: ["recomendacao 1", "recomendacao 2", "recomendacao 3"],
      conclusao: "1-2 frases de conclusao",
    }, null, 2);
}

/** Chama a OpenAI e devolve o JSON da análise. */
export async function callOpenAI(prompt, apiKey) {
  const r = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: "Bearer " + apiKey },
    body: JSON.stringify({
      model: "gpt-4o",
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" },
      max_tokens: 2500,
      temperature: 0.25,
    }),
  });
  if (!r.ok) {
    const e = await r.json().catch(() => ({}));
    throw new Error(e?.error?.message ?? "Erro " + r.status + " na API OpenAI");
  }
  const d = await r.json();
  return JSON.parse(d.choices[0].message.content);
}
