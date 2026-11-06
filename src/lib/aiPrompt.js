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
    guias: resumoGuias(res?.cruzamento),
  };
}

/**
 * Guias de convênio não enviadas e quem lançou, só em números: nenhum nome de paciente nem de funcionário
 * sai do app. `null` quando a auditoria não tem o cruzamento.
 */
function resumoGuias(cz) {
  const g = cz?.guiasNaoEnviadas;
  if (!g) return null;
  const rk = Array.isArray(cz.ranking) ? cz.ranking.filter((r) => num(r.guiasNaoEnviadas) > 0) : [];
  const totalNE = rk.reduce((s, r) => s + num(r.guiasNaoEnviadas), 0);
  const top3 = rk.slice(0, 3).reduce((s, r) => s + num(r.guiasNaoEnviadas), 0);
  return {
    n: num(g.total?.n), v: num(g.total?.valor),
    atrasadas: { n: num(g.faixas?.atrasada?.n), v: num(g.faixas?.atrasada?.valor) },
    emLote: { n: num(g.faixas?.em_lote?.n), v: num(g.faixas?.em_lote?.valor) },
    comCaixa: Boolean(cz.comCaixa),
    pessoas: rk.length,
    concentracaoTop3: totalNE ? Math.round((top3 / totalNE) * 100) : 0,
    porProfissional: rk.filter((r) => r.tipo === "profissional").reduce((s, r) => s + num(r.guiasNaoEnviadas), 0),
    multiDiaIncompletas: num(cz.guiasMultiDia?.comEnvioIncompleto),
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
    guias: r.guias && typeof r.guias === "object" ? {
      n: num(r.guias.n), v: num(r.guias.v),
      atrasadas: { n: num(r.guias.atrasadas?.n), v: num(r.guias.atrasadas?.v) },
      emLote: { n: num(r.guias.emLote?.n), v: num(r.guias.emLote?.v) },
      comCaixa: Boolean(r.guias.comCaixa),
      pessoas: num(r.guias.pessoas),
      concentracaoTop3: Math.min(100, Math.max(0, num(r.guias.concentracaoTop3))),
      porProfissional: num(r.guias.porProfissional),
      multiDiaIncompletas: num(r.guias.multiDiaIncompletas),
    } : null,
  };
}

/** Linha do prompt sobre as guias não enviadas (vazia em auditorias sem o cruzamento). */
function linhaGuias(g) {
  if (!g) return "";
  if (!g.n) return "- Guias de convenio: todas enviadas ao faturamento\n";
  return "- Guias de convenio NAO enviadas ao faturamento: " + g.n + " atendimentos, " + brl(g.v)
    + " (atrasadas alem do prazo do convenio: " + g.atrasadas.n + ", " + brl(g.atrasadas.v)
    + "; em lote sem envio: " + g.emLote.n + ")"
    + (g.comCaixa ? "; lancadas por " + g.pessoas + " pessoas, as 3 maiores concentram " + g.concentracaoTop3 + "%"
      + (g.porProfissional ? "; " + Math.round(g.porProfissional) + " lancadas pelo proprio profissional" : "") : "")
    + (g.multiDiaIncompletas ? "; " + g.multiDiaIncompletas + " guias usadas em mais de um dia com envio incompleto" : "")
    + ". Guia nao enviada nao aparece como divergencia Producao x Repasse: e receita a cobrar do convenio.\n";
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
    + "- Tipos de divergencia: " + JSON.stringify(r.tipos) + "\n"
    + linhaGuias(r.guias) + "\n"
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
