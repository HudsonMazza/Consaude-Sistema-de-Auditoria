// Cruzamento Produção × Repasse × Fechamento de Caixa (relatórios do Sistema Amigo).
//
// - Atendimentos: Produção e Repasse compartilham o "Código Atendimento"; quando as duas planilhas têm essa
//   coluna, cada paciente divergente é detalhado atendimento a atendimento, com o motivo da diferença.
// - "Lançado por": o Fechamento de Caixa (opcional) não tem código; cada atendimento é casado com a linha do
//   Caixa de mesmo paciente e data, desempatando por valor, procedimento e executante. A pessoa vem da coluna
//   "Editor financeiro" (quem registrou o atendimento). Não afirmamos que é quem ficou com a guia: a tela diz
//   "lançado por".
// - Guias não enviadas: atendimentos de convênio (Grupo de Convênio = FATURADO) ainda não faturados na Produção.
//   É o sinal da guia que não chegou ao faturamento — Produção × Repasse não enxerga, porque o Repasse traz o
//   atendimento com o mesmo valor de qualquer jeito.
// - Escopo: a auditoria olha só o que ainda não foi faturado. Linha não faturada = "Número lote" e "Quem enviou"
//   vazios na Produção (linhaNaoFaturada / escopoNaoFaturado). O já faturado serve só de referência (prazos de
//   envio, taxa da equipe, casamento com o Caixa).
//
// Módulo puro (sem React nem Firebase): roda no navegador e nos testes em Node.
import { normalizeName, parseValue, isPix } from "./engine.js";

// ─── Utilitários ──────────────────────────────────────────────────────────────

const r2 = (n) => Math.round(n * 100) / 100;
const semAcento = (s) => String(s ?? "").toUpperCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/\s+/g, " ").trim();
const vazio = (v) => String(v ?? "").trim() === "" || String(v ?? "").trim() === "-";
const DIA = 86400000;

/** Data como "dd/mm/aaaa" (aceita texto ou número serial do Excel). */
export function toDataStr(v) {
  if (typeof v === "number" && v > 20000 && v < 80000) {
    const d = new Date(Math.round((v - 25569) * DIA));
    return `${String(d.getUTCDate()).padStart(2, "0")}/${String(d.getUTCMonth() + 1).padStart(2, "0")}/${d.getUTCFullYear()}`;
  }
  if (v instanceof Date && !isNaN(v)) {
    return `${String(v.getDate()).padStart(2, "0")}/${String(v.getMonth() + 1).padStart(2, "0")}/${v.getFullYear()}`;
  }
  const s = String(v ?? "").trim();
  const m = s.match(/^(\d{1,2})\/(\d{1,2})\/(\d{2,4})/);
  if (!m) return s;
  const y = m[3].length === 2 ? "20" + m[3] : m[3];
  return `${m[1].padStart(2, "0")}/${m[2].padStart(2, "0")}/${y}`;
}

function dataToTime(s) {
  const m = String(s ?? "").match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  return m ? Date.UTC(+m[3], +m[2] - 1, +m[1]) : NaN;
}

const timeToData = (t) => {
  const d = new Date(t);
  return `${String(d.getUTCDate()).padStart(2, "0")}/${String(d.getUTCMonth() + 1).padStart(2, "0")}/${d.getUTCFullYear()}`;
};

/** Procedimento normalizado: sem código TUSS no início e sem sufixos de tabela ("- CONVÊNIO" etc.). */
export function normProc(s) {
  return normalizeName(s)
    .replace(/^\d{6,10}\s*-\s*/, "")
    .replace(/\s*-\s*(CONVENIO|CONSAUDE FLEX|PARTICULAR|SADT|UNIMED)\s*$/, "")
    .replace(/[^A-Z0-9 ]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/** "1 - Proc A, 2 - Proc B" (coluna "Qtd / Procedimento" do Caixa) → [{ q, nome, n }]. */
export function parseProcsCaixa(s) {
  s = String(s ?? "");
  const re = /(?:^|,\s*)(\d+)\s*-\s*/g;
  const idx = [];
  let m;
  while ((m = re.exec(s))) idx.push({ q: +m[1], start: m.index, end: re.lastIndex });
  return idx.map((x, i) => {
    const txt = s.slice(x.end, i + 1 < idx.length ? idx[i + 1].start : s.length).trim();
    return { q: x.q, nome: txt, n: normProc(txt) };
  });
}

const tokens = (s) => new Set(s.split(" ").filter((w) => w.length > 2));

/** Dois procedimentos "batem": iguais, um contém o outro ou ≥ 60% das palavras em comum. */
export function procBate(a, b) {
  if (!a || !b) return false;
  if (a === b || a.includes(b) || b.includes(a)) return true;
  const A = tokens(a), B = tokens(b);
  if (!A.size || !B.size) return false;
  let i = 0;
  for (const x of A) if (B.has(x)) i++;
  return i / Math.min(A.size, B.size) >= 0.6;
}

const normHead = (h) => String(h).normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/\s+/g, " ").trim();

/** Primeira coluna cujo cabeçalho (sem acento, minúsculo) casa com algum dos padrões, na ordem dos padrões. */
function achaCol(rows, regexes) {
  const heads = Object.keys(rows?.[0] || {});
  for (const re of regexes) {
    const h = heads.find((x) => re.test(normHead(x)));
    if (h) return h;
  }
  return null;
}

// ─── Colunas dos relatórios do Sistema Amigo ──────────────────────────────────

export function colunasProducao(rows) {
  return {
    codigo: achaCol(rows, [/^codigo (de )?atendimento$/, /^cod\.? (de )?atendimento$/]),
    data: achaCol(rows, [/^data (do )?atendimento$/, /^data atend/]),
    paciente: achaCol(rows, [/^paciente$/]),
    profissional: achaCol(rows, [/^profissional$/]),
    executante: achaCol(rows, [/^executante$/]),
    grupo: achaCol(rows, [/^grupo de convenio$/]),
    convenio: achaCol(rows, [/^conv\.? cadastrado$/]),
    forma: achaCol(rows, [/^forma de pagamento$/]),
    tipoAtend: achaCol(rows, [/^tipo atendimento$/]),
    item: achaCol(rows, [/^item$/]),
    qtd: achaCol(rows, [/^quantidade$/]),
    valorItem: achaCol(rows, [/^valor do item/]),
    desconto: achaCol(rows, [/^desconto/]),
    valor: achaCol(rows, [/^valor total do item/]),
    guia: achaCol(rows, [/^numero da guia$/]),
    lote: achaCol(rows, [/^numero (do )?lote$/]),
    quemEnviou: achaCol(rows, [/^quem enviou$/]),
    dataEnvio: achaCol(rows, [/^data (de )?envio$/]),
    quemBaixou: achaCol(rows, [/^quem baixou$/]),
  };
}

export function colunasRepasse(rows) {
  return {
    codigo: achaCol(rows, [/^cod\.? (de )?atendimento$/, /^codigo (de )?atendimento$/]),
    data: achaCol(rows, [/^data atend/]),
    paciente: achaCol(rows, [/^paciente$/]),
    executante: achaCol(rows, [/^profissional executante$/]),
    proc: achaCol(rows, [/^procedimento/]),
    forma: achaCol(rows, [/^forma de pagamento$/]),
    faturado: achaCol(rows, [/^faturado$/]),
    desconto: achaCol(rows, [/^desconto$/]),
    valor: achaCol(rows, [/^liquido$/]),
  };
}

/** Colunas do Fechamento de Caixa. O detectColumns do motor não serve: pegaria "Data Transação" como médico. */
export function detectCaixaColumns(rows) {
  return {
    pacienteCol: achaCol(rows, [/^paciente$/, /paciente|beneficiario/]),
    atendenteCol: achaCol(rows, [/editor.*financ/, /atendente/, /recepcion/]),
    dataCol: achaCol(rows, [/^data (do )?atendimento$/, /^data atend/]),
    dataTransacaoCol: achaCol(rows, [/^data (da )?transacao$/]),
    executanteCol: achaCol(rows, [/^executante$/, /executante/]),
    procCol: achaCol(rows, [/procedimento/]),
    formaCol: achaCol(rows, [/^forma de pagamento$/, /forma.*pag/]),
    valorCol: achaCol(rows, [/^valor/]),
  };
}

/** Problemas que impedem usar o Fechamento de Caixa (mensagens no mesmo tom do validateFile). */
export function validateCaixa(rows, cols) {
  if (!rows.length) return ["A planilha está vazia ou não tem dados legíveis. Envie outro arquivo."];
  const falta = [];
  if (!cols.pacienteCol) falta.push("paciente");
  if (!cols.dataCol) falta.push("data do atendimento");
  if (!cols.atendenteCol) falta.push("quem lançou (Editor financeiro)");
  if (falta.length) {
    return [`Não encontramos a coluna de ${falta.join(", ")}. Envie o relatório "Fechamento de caixa diário" exportado do Sistema Amigo.`];
  }
  return [];
}

/** Rótulos curtos (tela, exportação e IA) de cada motivo de divergência por atendimento. */
export const MOTIVOS = {
  AUSENTE_REPASSE_PENDENTE: "Pagamento pendente (ausente no Repasse)",
  AUSENTE_REPASSE: "Ausente no Repasse",
  AUSENTE_PRODUCAO: "Ausente na Produção",
  CENTAVOS: "Diferença de centavos",
  DESCONTO_SO_PRODUCAO: "Desconto só na Produção",
  ACRESCIMO_SO_PRODUCAO: "Acréscimo só na Produção",
  DESCONTO_DIFERENTE: "Desconto diferente",
  DESCONTO_SO_REPASSE: "Desconto só no Repasse",
  MAIOR_PRODUCAO: "Maior na Produção",
  MAIOR_REPASSE: "Maior no Repasse",
  SEM_CODIGO: "Lançamento sem código",
};

/** Rótulos do tipo de quem lançou. */
export const TIPOS_LANCADOR = {
  atendente: "Atendente",
  profissional: "O próprio profissional",
  secretaria: "Secretária do médico",
  sistema: "Conta do sistema",
};

/** Situação de uma guia não enviada. */
export const FAIXAS_GUIA = {
  atrasada: "Atrasada além do histórico",
  em_lote: "Em lote, sem envio registrado",
  no_prazo: "Dentro do prazo usual",
};

export const OPCOES_PADRAO = Object.freeze({
  /** Diferença por atendimento abaixo disso = arredondamento do rateio (continua listada, marcada como centavos). */
  limiarRuido: 1,
  /** Convênios cujas guias o próprio médico fatura: nunca têm "Quem enviou". Prefixos por palavra, sem pontos. */
  conveniosMedico: ["UNIMED DR", "UNIMED DRA"],
  contasSistema: ["EQUIPE CARDIO", "MEDICAL HUB"],
  /** Limite de itens de guias não enviadas guardados na auditoria (o documento do Firestore tem teto de ~1 MiB). */
  maxGuias: 1500,
});

/** Convênio pertence à lista de "faturados pelo próprio médico"? Casa por palavras iniciais, sem pontos e acentos. */
export function convenioDoMedico(convenio, lista) {
  const palavras = semAcento(convenio).replace(/\./g, " ").split(" ").filter(Boolean);
  return (lista || []).some((p) => {
    const pp = semAcento(p).replace(/\./g, " ").split(" ").filter(Boolean);
    return pp.length > 0 && pp.length <= palavras.length && pp.every((w, i) => palavras[i] === w);
  });
}

// ─── Escopo: só o que ainda não foi faturado ──────────────────────────────────

/** Linha da Produção ainda não faturada: "Número lote" e "Quem enviou" vazios (coluna ausente conta como vazia). */
export function linhaNaoFaturada(r, cP) {
  return vazio(r[cP.lote]) && vazio(r[cP.quemEnviou]);
}

/**
 * Limita Produção e Repasse ao que ainda não foi faturado (regra de negócio: o já faturado não é auditado).
 * - Produção: fica a linha não faturada. Com o Código de atendimento, o atendimento é a unidade: se ainda tem algum
 *   item não faturado, entra inteiro (o Repasse não tem lote nem envio, então só dá para comparar o atendimento todo).
 * - Repasse: sai a linha cujo atendimento existe na Produção e está todo faturado. Linha sem código ou com
 *   atendimento que não aparece na Produção continua (é divergência a conferir).
 * Sem as colunas de faturamento na Produção, nada muda. Sem o código nas duas planilhas, o Repasse não pode ser
 * limitado: nada muda e `motivo` explica (comparar só um lado criaria divergências falsas).
 * Devolve { aplicado, motivo, prod, rep, foraProd, foraRep, atendimentosFora }.
 */
export function escopoNaoFaturado(prodRows, repRows) {
  const nada = (motivo) => ({ aplicado: false, motivo, prod: prodRows, rep: repRows, foraProd: [], foraRep: [], atendimentosFora: 0 });
  if (!prodRows?.length) return nada(null);
  const cP = colunasProducao(prodRows);
  if (!cP.lote && !cP.quemEnviou) return nada("sem_colunas");
  const faturadas = prodRows.filter((r) => !linhaNaoFaturada(r, cP));
  if (!faturadas.length) return { ...nada(null), aplicado: true };
  const cR = colunasRepasse(repRows || []);
  if (!cP.codigo || (repRows?.length && !cR.codigo)) return nada("sem_codigo");

  const cod = (v) => String(v ?? "").trim();
  const abertos = new Set(), todos = new Set();
  for (const r of prodRows) {
    const c = cod(r[cP.codigo]);
    if (!c) continue;
    todos.add(c);
    if (linhaNaoFaturada(r, cP)) abertos.add(c);
  }
  const prod = [], foraProd = [];
  for (const r of prodRows) {
    const c = cod(r[cP.codigo]);
    (linhaNaoFaturada(r, cP) || (c && abertos.has(c)) ? prod : foraProd).push(r);
  }
  const rep = [], foraRep = [];
  for (const r of repRows || []) {
    const c = cod(r[cR.codigo]);
    (c && todos.has(c) && !abertos.has(c) ? foraRep : rep).push(r);
  }
  const atendimentosFora = new Set(foraProd.map((r) => cod(r[cP.codigo])).filter(Boolean)).size;
  return { aplicado: true, motivo: null, prod, rep, foraProd, foraRep, atendimentosFora };
}

// ─── Atendimentos (Produção × Repasse por código) ─────────────────────────────

/**
 * Prepara o detalhamento por atendimento. `porCodigo` = as duas planilhas têm o Código de atendimento;
 * sem ele o app continua comparando pacientes pelo nome (comparePatients).
 */
export function prepararAtendimentos(prodRows, repRows) {
  const cP = colunasProducao(prodRows);
  const cR = colunasRepasse(repRows);
  return { cP, cR, porCodigo: Boolean(cP.codigo && cR.codigo) };
}

function motivoDivergencia(p, r, d, opc) {
  if (p && !r) {
    const pend = p.linhas.some((x) => semAcento(x.forma) === "PENDENTE");
    return pend ? ["AUSENTE_REPASSE_PENDENTE", 'Ausente no Repasse: a forma de pagamento é "Pendente" (pagamento não registrado no caixa)']
      : ["AUSENTE_REPASSE", "Ausente no Repasse"];
  }
  if (r && !p) return ["AUSENTE_PRODUCAO", "Ausente na Produção"];
  if (Math.abs(d) < opc.limiarRuido) return ["CENTAVOS", "Diferença de centavos (arredondamento do rateio)"];
  const temBruto = p.linhas.some((x) => x.valorItem);
  const bruto = p.linhas.reduce((s, x) => s + x.valorItem * x.qtd, 0);
  const descProd = p.linhas.reduce((s, x) => s + x.desconto, 0);
  const descRep = r.linhas.reduce((s, x) => s + x.desconto, 0);
  const brl = (n) => n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
  if (temBruto && p.valor < bruto - 0.005 && Math.abs(r.valor - bruto) < 0.02)
    return ["DESCONTO_SO_PRODUCAO", `Desconto de ${brl(bruto - p.valor)} lançado só na Produção`];
  if (temBruto && p.valor > bruto + 0.005 && Math.abs(r.valor - bruto) < 0.02)
    return ["ACRESCIMO_SO_PRODUCAO", `Acréscimo de ${brl(p.valor - bruto)} lançado só na Produção (coluna "Desconto")`];
  if (Math.abs(descProd - descRep) > 0.005 && Math.abs(p.valor + descProd - (r.valor + descRep)) < 0.05)
    return ["DESCONTO_DIFERENTE", `Desconto de ${brl(descProd)} na Produção e de ${brl(descRep)} no Repasse`];
  if (temBruto && descRep > 0.005 && Math.abs(p.valor - bruto) < 0.02)
    return ["DESCONTO_SO_REPASSE", `Desconto de ${brl(descRep)} lançado só no Repasse`];
  return d < 0 ? ["MAIOR_REPASSE", "Valor maior no Repasse"] : ["MAIOR_PRODUCAO", "Valor maior na Produção"];
}

/** Prefixo da chave dos lançamentos sem Código de atendimento (agrupados por paciente). */
const SEM_CODIGO = "SEM-CODIGO|";

function agruparAtendimentos(rows, lado, c, valorCol, pacienteCol) {
  const m = new Map();
  for (const r of rows) {
    // Linha sem código (ajuste manual, por exemplo) não some: vira um "atendimento" por paciente, para a soma
    // dos atendimentos continuar igual à diferença do médico.
    const codigoLinha = String(r[c.codigo] ?? "").trim();
    const codigo = codigoLinha || `${SEM_CODIGO}${normalizeName(r[pacienteCol])}`;
    let o = m.get(codigo);
    if (!o) {
      o = { codigo, semCodigo: !codigoLinha, data: toDataStr(r[c.data]), pacienteRaw: String(r[pacienteCol] ?? "").trim(), linhas: [], valor: 0 };
      m.set(codigo, o);
    }
    const linha = lado === "prod"
      ? { forma: String(r[c.forma] ?? "").trim(), proc: String(r[c.item] ?? r[c.tipoAtend] ?? "").trim(), valorItem: parseValue(r[c.valorItem]),
          qtd: parseValue(r[c.qtd]) || 1, desconto: parseValue(r[c.desconto]), valor: parseValue(r[valorCol]),
          grupo: semAcento(r[c.grupo]), convenio: String(r[c.forma] ?? r[c.convenio] ?? "").trim(), guia: String(r[c.guia] ?? "").trim() }
      : { forma: String(r[c.forma] ?? "").trim(), proc: String(r[c.proc] ?? "").trim(), desconto: parseValue(r[c.desconto]), valor: parseValue(r[valorCol]) };
    o.linhas.push(linha);
    o.valor += linha.valor;
  }
  return m;
}

/**
 * Pacientes divergentes de UM médico, detalhados por atendimento (código). Mesmo formato do comparePatients
 * (paciente, producao, repasse, diferenca, diferencaRaw, tipo) + `atendimentos` com o motivo de cada um.
 * Entra todo paciente com algum atendimento diferente — mesmo que as diferenças se anulem no total dele.
 */
export function compararAtendimentos(prodRows, repRows, pCols, rCols, prep, opcoes = {}) {
  const opc = { ...OPCOES_PADRAO, ...opcoes };
  const { cP, cR } = prep;
  const pm = agruparAtendimentos(prodRows, "prod", cP, pCols.valorCol, pCols.pacienteCol || cP.paciente);
  const rm = agruparAtendimentos(repRows, "rep", cR, rCols.valorCol, rCols.pacienteCol || cR.paciente);
  const pacientes = new Map();
  for (const codigo of new Set([...pm.keys(), ...rm.keys()])) {
    const p = pm.get(codigo), r = rm.get(codigo);
    const vp = p ? p.valor : 0, vr = r ? r.valor : 0, d = vp - vr;
    if (Math.round(Math.abs(d) * 100) === 0) continue;
    const base = p || r;
    const semCodigo = Boolean(p?.semCodigo || r?.semCodigo);
    const [motivo, motivoTexto] = semCodigo
      ? ["SEM_CODIGO", "Lançamento sem Código de atendimento: confira na planilha"]
      : motivoDivergencia(p, r, d, opc);
    const linhasBase = p ? p.linhas : r.linhas;
    const fat = p ? p.linhas.find((x) => x.grupo === "FATURADO") : null;
    const atendimento = {
      codigo, ...(semCodigo ? { semCodigo: true } : {}), data: base.data,
      procedimentos: [...new Set(linhasBase.map((x) => x.proc).filter(Boolean))].slice(0, 4),
      forma: [...new Set(linhasBase.map((x) => x.forma).filter(Boolean))].join(", "),
      convenio: fat ? fat.convenio : null,
      guia: fat?.guia || null,
      producao: r2(vp), repasse: r2(vr), diferenca: r2(d),
      motivo, motivoTexto, ruido: motivo === "CENTAVOS",
    };
    const chave = normalizeName(base.pacienteRaw) || base.pacienteRaw || codigo;
    let pa = pacientes.get(chave);
    if (!pa) { pa = { paciente: base.pacienteRaw || "(sem nome)", pv: 0, rv: 0, atendimentos: [] }; pacientes.set(chave, pa); }
    pa.pv += vp; pa.rv += vr;
    pa.atendimentos.push(atendimento);
  }
  const fmt = (n) => n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
  return [...pacientes.values()].map((pa) => {
    const diff = pa.pv - pa.rv;
    const motivos = [...new Set(pa.atendimentos.map((a) => a.motivo))];
    pa.atendimentos.sort((a, b) => dataToTime(a.data) - dataToTime(b.data) || Math.abs(b.diferenca) - Math.abs(a.diferenca));
    return {
      paciente: pa.paciente,
      producao: fmt(pa.pv),
      repasse: fmt(pa.rv),
      diferenca: fmt(Math.abs(diff)),
      diferencaRaw: Math.abs(diff),
      // Diferença do paciente (Produção − Repasse). Sem ela o sinal se perde quando as diferenças se anulam.
      diferencaSigned: r2(diff),
      tipo: motivos.length === 1 ? MOTIVOS[motivos[0]] : "Vários motivos",
      atendimentos: pa.atendimentos,
    };
  }).sort((a, b) => b.diferencaRaw - a.diferencaRaw || b.atendimentos.length - a.atendimentos.length);
}

// ─── Casamento com o Fechamento de Caixa ──────────────────────────────────────

function prepCaixa(rows, c) {
  return rows.map((r, i) => {
    const forma = String(r[c.formaCol] ?? "").trim();
    const f = semAcento(forma);
    const status = f === "CANCELOU" ? "CANCELOU" : f === "FALTOU" ? "FALTOU" : f === "VOLTA" ? "VOLTA" : "OK";
    return {
      i,
      data: toDataStr(r[c.dataCol]),
      paciente: normalizeName(r[c.pacienteCol]),
      executante: normalizeName(r[c.executanteCol]),
      executanteRaw: String(r[c.executanteCol] ?? "").replace(/s+/g, " ").trim(),
      editor: normalizeName(r[c.atendenteCol]),
      editorRaw: String(r[c.atendenteCol] ?? "").replace(/\s+/g, " ").trim(),
      procs: parseProcsCaixa(r[c.procCol]),
      forma,
      // PIX no Caixa inclui pagamentos combinados ("Dinheiro, Pix"), que o isPix exato não reconhece.
      temPix: /(^|[,\s])PIX($|[,\s])/.test(f),
      status,
      valor: parseValue(r[c.valorCol]),
    };
  }).filter((r) => r.editor);
}

/** Atendimentos (com PIX) por código, com o que o casamento precisa: médicos, procedimentos e valor. */
function atendimentosParaCaixa(rows, c, lado) {
  const m = new Map();
  for (const r of rows) {
    const codigo = String(r[c.codigo] ?? "").trim();
    if (!codigo) continue;
    let o = m.get(codigo);
    if (!o) {
      o = { codigo, lado, data: toDataStr(r[c.data]), paciente: normalizeName(r[c.paciente]), medicos: new Set(), procs: new Set(), valorCaixa: 0 };
      m.set(codigo, o);
    }
    if (lado === "prod") {
      [r[c.executante], r[c.profissional]].map(normalizeName).filter(Boolean).forEach((n) => o.medicos.add(n));
      [r[c.item], r[c.tipoAtend]].map(normProc).filter(Boolean).forEach((n) => o.procs.add(n));
      o.valorCaixa += parseValue(r[c.valor]);
    } else {
      const ex = normalizeName(r[c.executante]);
      if (ex) o.medicos.add(ex);
      const pr = normProc(r[c.proc]);
      if (pr) o.procs.add(pr);
      o.valorCaixa += parseValue(r[c.faturado] ?? r[c.valor]);
    }
  }
  return m;
}

/**
 * Para cada grupo (paciente + data do atendimento), pontua cada par (atendimento, linha do Caixa):
 *   valor igual (±0,01) 8 · todos os procedimentos batem 4 · algum bate 2 · executante bate 3 · linha válida 1
 * e atribui cada linha do Caixa a um único atendimento, das maiores pontuações para as menores.
 * Empate com pessoas diferentes → "ambigua" (mostra todas). O valor decide quase sempre: é ele que separa
 * HOLTER/MAPA/ECG (agenda no Caixa) do médico executante na Produção.
 */
function casarComCaixa(atendimentos, caixa) {
  const porPacData = new Map();
  for (const r of caixa) {
    const k = r.paciente + "|" + r.data;
    if (!porPacData.has(k)) porPacData.set(k, []);
    porPacData.get(k).push(r);
  }
  const grupos = new Map();
  for (const o of atendimentos) {
    const k = o.paciente + "|" + o.data;
    if (!grupos.has(k)) grupos.set(k, []);
    grupos.get(k).push(o);
  }
  const mapa = new Map();
  const usadas = new Set();
  for (const [k, os] of grupos) {
    const cands = porPacData.get(k) || [];
    const arestas = os.map((o) => cands.map((r) => {
      const procs = [...o.procs];
      const ex = o.medicos.has(r.executante);
      const algum = r.procs.some((p) => procs.some((x) => procBate(p.n, x)));
      const todos = r.procs.length > 0 && r.procs.every((p) => procs.some((x) => procBate(p.n, x)));
      const val = Math.abs(r.valor - o.valorCaixa) < 0.011;
      const valido = r.status === "OK" || r.status === "VOLTA";
      return { r, s: (val ? 8 : 0) + (todos ? 4 : 0) + (algum ? 2 : 0) + (ex ? 3 : 0) + (valido ? 1 : 0), ex, algum, val };
    }));
    const todas = [];
    arestas.forEach((es, i) => es.forEach((e) => todas.push({ i, e })));
    todas.sort((a, b) => b.e.s - a.e.s);
    const usadasG = new Set(), atrib = new Map();
    for (const { i, e } of todas) {
      if (atrib.has(i) || usadasG.has(e.r.i)) continue;
      atrib.set(i, e);
      usadasG.add(e.r.i);
    }
    os.forEach((o, i) => {
      let e = atrib.get(i);
      if (!e && arestas[i].length) e = [...arestas[i]].sort((a, b) => b.s - a.s)[0]; // linha dividida com outro atendimento
      if (!e) { mapa.set(o.codigo, { editores: [], confianca: "sem" }); return; }
      usadas.add(e.r.i);
      const empate = arestas[i].filter((x) => x.s === e.s);
      const editores = [...new Set(empate.map((x) => x.r.editor))];
      // "exata" só quando o valor bate e há mais um critério; valor sozinho ou critério fraco = "provavel".
      const confianca = editores.length > 1 ? "ambigua" : e.val && (e.ex || e.algum) ? "exata" : "provavel";
      mapa.set(o.codigo, { editores, confianca, linhaCaixa: e.r.i });
    });
  }
  return { mapa, usadas };
}

// ─── Análise completa ─────────────────────────────────────────────────────────

/**
 * Cruza as três planilhas. Recebe as linhas COM PIX (o casamento com o Caixa precisa consumir a linha certa);
 * as análises de valor excluem PIX, como o resto da auditoria.
 *   prodTodas, repTodas: linhas lidas da Produção e do Repasse
 *   caixaRows, caixaCols: Fechamento de Caixa (opcional) e as colunas detectadas
 *   divergencias: o array de médicos já montado pelo app (os atendimentos ganham "lancadoPor")
 * Devolve o objeto `cruzamento` que vai para os resultados da auditoria (ou null se não houver colunas do Sistema Amigo).
 */
export function analisarCruzamento({ prodTodas, repTodas, caixaRows = null, caixaCols = null, divergencias = [], opcoes = {} }) {
  const opc = { ...OPCOES_PADRAO, ...opcoes };
  const cP = colunasProducao(prodTodas);
  const cR = colunasRepasse(repTodas);
  const temGuias = Boolean(cP.codigo && cP.grupo && cP.quemEnviou);
  const comCaixa = Boolean(caixaRows?.length && caixaCols && cP.codigo);
  if (!temGuias && !comCaixa) return null;

  // 1) Quem lançou cada atendimento (Caixa).
  const C = comCaixa ? prepCaixa(caixaRows, caixaCols) : [];
  let mapa = new Map(), usadas = new Set();
  if (comCaixa) {
    const ap = atendimentosParaCaixa(prodTodas, cP, "prod");
    const a = casarComCaixa([...ap.values()], C);
    mapa = a.mapa; usadas = a.usadas;
    if (cR.codigo) {
      const soRep = [...atendimentosParaCaixa(repTodas, cR, "rep").values()].filter((o) => !ap.has(o.codigo));
      const b = casarComCaixa(soRep, C.filter((r) => !usadas.has(r.i)));
      for (const [k, v] of b.mapa) mapa.set(k, v);
      for (const u of b.usadas) usadas.add(u);
    }
  }

  // 2) Tipo de cada pessoa que lança: profissional (o nome aparece como executante), conta do sistema,
  //    secretária dedicada (≥ 70% dos lançamentos de um só executante) ou atendente; + marca de faturamento.
  const profissionais = new Set();
  for (const r of prodTodas) [r[cP.executante], r[cP.profissional]].map(normalizeName).filter(Boolean).forEach((n) => profissionais.add(n));
  for (const r of repTodas) { const n = normalizeName(r[cR.executante]); if (n) profissionais.add(n); }
  for (const r of C) if (r.executante) profissionais.add(r.executante);
  const faturamento = new Set();
  for (const r of prodTodas) [r[cP.quemEnviou], r[cP.quemBaixou]].map(normalizeName).filter(Boolean).forEach((n) => faturamento.add(n));
  const sistema = new Set(opc.contasSistema.map(normalizeName));
  const nomeExibicao = new Map();
  const porEditor = new Map();
  for (const r of C) {
    if (!nomeExibicao.has(r.editor)) nomeExibicao.set(r.editor, r.editorRaw);
    const o = porEditor.get(r.editor) || { n: 0, ex: new Map() };
    o.n++;
    if (r.executante) o.ex.set(r.executante, (o.ex.get(r.executante) || 0) + 1);
    porEditor.set(r.editor, o);
  }
  const tipoCache = new Map();
  const tipoDe = (nome) => {
    if (tipoCache.has(nome)) return tipoCache.get(nome);
    let tipo = "atendente";
    if (sistema.has(nome) || /^EQUIPE\b|\bHUB\b|\bSISTEMA\b/.test(nome)) tipo = "sistema";
    else if (profissionais.has(nome)) tipo = "profissional";
    else {
      const o = porEditor.get(nome);
      const top = o ? Math.max(0, ...o.ex.values()) : 0;
      if (o && o.n >= 5 && top / o.n >= 0.7) tipo = "secretaria";
    }
    tipoCache.set(nome, tipo);
    return tipo;
  };
  const pessoa = (nome) => ({ nome: nomeExibicao.get(nome) || nome, tipo: tipoDe(nome), ...(faturamento.has(nome) ? { faturamento: true } : {}) });
  const lancadoPor = (codigo) => {
    if (!comCaixa) return { lancadoPor: [], confianca: "sem_caixa" };
    const m = mapa.get(codigo);
    if (!m || !m.editores.length) return { lancadoPor: [], confianca: "sem" };
    return { lancadoPor: m.editores.slice(0, 3).map(pessoa), confianca: m.confianca };
  };

  // 3) Atendimentos divergentes ganham "lançado por".
  let divReais = 0;
  const contaConf = {};
  for (const d of divergencias) {
    for (const p of d.detalhes || []) {
      if (!Array.isArray(p.atendimentos)) continue;
      const nomes = new Map();
      for (const a of p.atendimentos) {
        // Lançamento sem código não tem atendimento para casar com o Caixa.
        Object.assign(a, a.semCodigo ? { lancadoPor: [], confianca: comCaixa ? "sem_codigo" : "sem_caixa" } : lancadoPor(a.codigo));
        if (!a.ruido) { divReais++; contaConf[a.confianca] = (contaConf[a.confianca] || 0) + 1; }
        for (const l of a.lancadoPor) nomes.set(l.nome, l);
      }
      p.lancadoPor = [...nomes.values()];
    }
  }

  // 4) Guias de convênio não enviadas ao faturamento: só as linhas ainda não faturadas (lote e envio vazios).
  //    As já faturadas servem de referência: prazo de envio de cada convênio, guia parcial e base da taxa da equipe.
  const P = temGuias ? prodTodas.filter((r) => !isPix(r[cP.forma]) && semAcento(r[cP.grupo]) === "FATURADO") : [];
  const datasValidasEnvio = [];
  const limitePorConvenio = new Map();
  const statusGuia = new Map(); // convênio|guia → { env, nao, pacientes:Set }
  const envioPorConvenio = new Map();
  for (const r of P) {
    const conv = semAcento(r[cP.forma]) || semAcento(r[cP.convenio]);
    const guia = String(r[cP.guia] ?? "").trim();
    const enviado = Boolean(normalizeName(r[cP.quemEnviou]));
    const faturada = !linhaNaoFaturada(r, cP);
    const ec = envioPorConvenio.get(conv) || { linhas: 0, enviadas: 0, nome: String(r[cP.forma] ?? r[cP.convenio] ?? "").trim() };
    ec.linhas++; if (faturada) ec.enviadas++;
    envioPorConvenio.set(conv, ec);
    if (guia) {
      const k = conv + "|" + guia;
      const sg = statusGuia.get(k) || { env: 0, nao: 0, pacientes: new Set() };
      if (faturada) sg.env++; else sg.nao++;
      sg.pacientes.add(normalizeName(r[cP.paciente]));
      statusGuia.set(k, sg);
    }
    if (enviado) {
      const te = dataToTime(toDataStr(r[cP.dataEnvio]));
      const ta = dataToTime(toDataStr(r[cP.data]));
      // Envio anterior ao atendimento é dado inválido: fica fora do cálculo de atraso.
      if (!isNaN(te) && !isNaN(ta) && te >= ta) {
        datasValidasEnvio.push(te);
        const dias = Math.round((te - ta) / DIA);
        limitePorConvenio.set(conv, Math.max(limitePorConvenio.get(conv) || 0, dias));
      }
    }
  }
  const refT = datasValidasEnvio.length ? Math.max(...datasValidasEnvio) : NaN;
  const limiteGeral = limitePorConvenio.size ? Math.max(...limitePorConvenio.values()) : null;

  const foraDoEnvio = { linhas: 0, valor: 0, convenios: new Set() };
  const naoEnviadas = new Map();
  for (const r of P) {
    if (!linhaNaoFaturada(r, cP)) continue;
    const convRaw = String(r[cP.forma] ?? r[cP.convenio] ?? "").trim();
    if (convenioDoMedico(convRaw, opc.conveniosMedico)) {
      foraDoEnvio.linhas++; foraDoEnvio.valor += parseValue(r[cP.valor]); foraDoEnvio.convenios.add(convRaw);
      continue;
    }
    const codigo = String(r[cP.codigo] ?? "").trim();
    let g = naoEnviadas.get(codigo);
    if (!g) {
      g = { codigo, data: toDataStr(r[cP.data]), paciente: String(r[cP.paciente] ?? "").trim(),
        medico: String(r[cP.executante] || r[cP.profissional] || "").trim(), convenio: convRaw, conv: semAcento(convRaw),
        guias: new Set(), procedimentos: new Set(), valor: 0 };
      naoEnviadas.set(codigo, g);
    }
    const guia = String(r[cP.guia] ?? "").trim();
    if (guia) g.guias.add(guia);
    const proc = String(r[cP.item] ?? r[cP.tipoAtend] ?? "").trim();
    if (proc) g.procedimentos.add(proc);
    g.valor += parseValue(r[cP.valor]);
  }
  const ordemFaixa = { atrasada: 0, em_lote: 1, no_prazo: 2 };
  const itensGuias = [...naoEnviadas.values()].map((g) => {
    const t = dataToTime(g.data);
    const dias = isNaN(refT) || isNaN(t) ? null : Math.max(0, Math.round((refT - t) / DIA));
    const limite = limitePorConvenio.has(g.conv) ? limitePorConvenio.get(g.conv) : limiteGeral;
    // "em_lote" (lote sem envio) não acontece mais: linha com lote já conta como faturada. Fica para auditorias antigas.
    const faixa = dias != null && limite != null && dias > limite ? "atrasada" : "no_prazo";
    const guias = [...g.guias];
    // "Parcialmente enviada" só conta em guia de um único paciente: número repetido entre pacientes é colisão.
    const parcial = guias.some((n) => { const s = statusGuia.get(g.conv + "|" + n); return s && s.env > 0 && s.pacientes.size === 1; });
    return {
      codigo: g.codigo, data: g.data, paciente: g.paciente, medico: g.medico, convenio: g.convenio,
      guias, procedimentos: [...g.procedimentos].slice(0, 3), valor: r2(g.valor),
      dias, limiteDias: limite, faixa, ...(parcial ? { guiaParcial: true } : {}),
      ...lancadoPor(g.codigo),
    };
  }).sort((a, b) => ordemFaixa[a.faixa] - ordemFaixa[b.faixa] || (b.dias ?? 0) - (a.dias ?? 0) || b.valor - a.valor);

  const somaFaixa = (f) => {
    const xs = itensGuias.filter((x) => x.faixa === f);
    return { n: xs.length, valor: r2(xs.reduce((s, x) => s + x.valor, 0)) };
  };
  // Convênios com várias guias e nenhuma enviada, fora da lista: candidatos a "faturado pelo próprio médico".
  const conveniosSemEnvio = [...envioPorConvenio.values()]
    .filter((c) => c.linhas >= 5 && c.enviadas === 0 && !convenioDoMedico(c.nome, opc.conveniosMedico))
    .sort((a, b) => b.linhas - a.linhas).slice(0, 12).map((c) => ({ convenio: c.nome, linhas: c.linhas }));

  // 5) Guias usadas em mais de um dia (séries de terapia, por exemplo): quem lançou cada data.
  //    Só guias com algum atendimento ainda não faturado (as já faturadas não têm mais o que corrigir).
  const guiasMap = new Map();
  for (const r of P) {
    const guia = String(r[cP.guia] ?? "").trim();
    if (!guia) continue;
    const conv = semAcento(r[cP.forma]) || semAcento(r[cP.convenio]);
    const k = conv + "|" + guia;
    let g = guiasMap.get(k);
    if (!g) { g = { convenio: String(r[cP.forma] ?? r[cP.convenio] ?? "").trim(), guia, pacientes: new Set(), nomes: new Map(), paciente: String(r[cP.paciente] ?? "").trim(), porCodigo: new Map() }; guiasMap.set(k, g); }
    const pn = normalizeName(r[cP.paciente]);
    g.pacientes.add(pn);
    if (pn && !g.nomes.has(pn)) g.nomes.set(pn, String(r[cP.paciente] ?? "").trim());
    const codigo = String(r[cP.codigo] ?? "").trim();
    const c = g.porCodigo.get(codigo) || { codigo, data: toDataStr(r[cP.data]), medico: String(r[cP.executante] || r[cP.profissional] || "").trim(), enviado: false };
    if (linhaNaoFaturada(r, cP)) g.aberta = true; else c.enviado = true;
    g.porCodigo.set(codigo, c);
  }
  const multiDia = [];
  const repetidas = [];
  let suspeitasNumeracao = 0;
  for (const g of guiasMap.values()) {
    if (!g.aberta) continue;
    const cods = [...g.porCodigo.values()];
    // Mesmo número de guia no mesmo convênio para pacientes diferentes: provável erro de digitação no cadastro.
    if (g.pacientes.size > 1) {
      repetidas.push({
        convenio: g.convenio, guia: g.guia, nPacientes: g.pacientes.size, pacientes: [...g.nomes.values()].slice(0, 6),
        datas: [...new Set(cods.map((c) => c.data))].sort((a, b) => dataToTime(a) - dataToTime(b)).slice(0, 6), nAtendimentos: cods.length,
      });
    }
    if (new Set(cods.map((c) => c.data)).size < 2) continue;
    if (g.pacientes.size > 1) { suspeitasNumeracao++; continue; }
    const atendimentos = cods.sort((a, b) => dataToTime(a.data) - dataToTime(b.data)).map((c) => ({ ...c, ...lancadoPor(c.codigo) }));
    const nomes = new Set(atendimentos.flatMap((a) => a.lancadoPor.map((l) => l.nome)));
    const env = atendimentos.filter((a) => a.enviado).length;
    multiDia.push({
      convenio: g.convenio, guia: g.guia, paciente: g.paciente, nDatas: new Set(cods.map((c) => c.data)).size,
      nLancadores: nomes.size, envio: env === atendimentos.length ? "total" : env === 0 ? "nenhum" : "parcial", atendimentos,
    });
  }
  const ordemEnvio = { parcial: 0, nenhum: 1, total: 2 };
  multiDia.sort((a, b) => ordemEnvio[a.envio] - ordemEnvio[b.envio] || b.nLancadores - a.nLancadores);

  // 5b) Faltas e cancelamentos por médico (executante do Caixa).
  const faltasMed = new Map();
  for (const r of C) {
    if (!r.executante) continue;
    const o = faltasMed.get(r.executante) || { nome: r.executanteRaw || r.executante, lancamentos: 0, faltas: 0, cancelamentos: 0 };
    o.lancamentos++;
    if (r.status === "FALTOU") o.faltas++;
    if (r.status === "CANCELOU") o.cancelamentos++;
    faltasMed.set(r.executante, o);
  }
  const porMedicoFaltas = [...faltasMed.values()].filter((o) => o.faltas + o.cancelamentos > 0)
    .map((o) => ({ ...o, taxa: r2(((o.faltas + o.cancelamentos) / o.lancamentos) * 100) }))
    .sort((a, b) => (b.faltas + b.cancelamentos) - (a.faltas + a.cancelamentos) || b.taxa - a.taxa);

  // 6) Ranking de quem lançou. Atendimento ambíguo divide o peso entre as pessoas (1/n).
  const rk = new Map();
  const conta = (nome) => {
    let o = rk.get(nome);
    if (!o) {
      o = { ...pessoa(nome), lancamentos: 0, faltas: 0, cancelamentos: 0, guiasLancadas: 0, guiasNaoEnviadas: 0, valorGuias: 0,
        guiasAtrasadas: 0, divergencias: 0, valorDivergencias: 0 };
      rk.set(nome, o);
    }
    return o;
  };
  if (comCaixa) {
    for (const r of C) {
      const o = conta(r.editor);
      o.lancamentos++;
      if (r.status === "FALTOU") o.faltas++;
      if (r.status === "CANCELOU") o.cancelamentos++;
    }
    // Guias de convênio lançadas por cada pessoa (base da taxa de não envio).
    const codigosFat = new Set();
    for (const r of P) if (!convenioDoMedico(String(r[cP.forma] ?? r[cP.convenio] ?? ""), opc.conveniosMedico)) codigosFat.add(String(r[cP.codigo] ?? "").trim());
    for (const codigo of codigosFat) {
      const m = mapa.get(codigo);
      if (m?.editores.length) for (const e of m.editores) conta(e).guiasLancadas += 1 / m.editores.length;
    }
    const nomeChave = new Map([...nomeExibicao].map(([k, v]) => [v, k]));
    const chaveDe = (l) => nomeChave.get(l.nome) || normalizeName(l.nome);
    for (const g of itensGuias) {
      if (!g.lancadoPor.length) continue;
      const peso = 1 / g.lancadoPor.length;
      for (const l of g.lancadoPor) {
        const o = conta(chaveDe(l));
        o.guiasNaoEnviadas += peso; o.valorGuias += g.valor * peso;
        if (g.faixa === "atrasada") o.guiasAtrasadas += peso;
      }
    }
    for (const d of divergencias) for (const p of d.detalhes || []) for (const a of p.atendimentos || []) {
      if (a.ruido || !a.lancadoPor?.length) continue;
      const peso = 1 / a.lancadoPor.length;
      for (const l of a.lancadoPor) { const o = conta(chaveDe(l)); o.divergencias += peso; o.valorDivergencias += Math.abs(a.diferenca) * peso; }
    }
  }
  const ranking = [...rk.values()].map((o) => ({
    ...o,
    guiasLancadas: r2(o.guiasLancadas), guiasNaoEnviadas: r2(o.guiasNaoEnviadas), valorGuias: r2(o.valorGuias),
    guiasAtrasadas: r2(o.guiasAtrasadas), divergencias: r2(o.divergencias), valorDivergencias: r2(o.valorDivergencias),
    taxaGuias: o.guiasLancadas >= 1 ? r2((o.guiasNaoEnviadas / o.guiasLancadas) * 100) : null,
  })).sort((a, b) => (b.valorGuias + b.valorDivergencias) - (a.valorGuias + a.valorDivergencias) || b.lancamentos - a.lancamentos);

  // 7) Cobertura do casamento.
  const cobertura = { atendimentos: 0, exata: 0, provavel: 0, ambigua: 0, sem: 0 };
  if (comCaixa) {
    const codigosProd = new Set();
    for (const r of prodTodas) if (!isPix(r[cP.forma])) codigosProd.add(String(r[cP.codigo] ?? "").trim());
    for (const codigo of codigosProd) {
      if (!codigo) continue;
      cobertura.atendimentos++;
      cobertura[mapa.get(codigo)?.confianca || "sem"]++;
    }
  }
  const contaGuias = itensGuias.reduce((m, g) => ((m[g.confianca] = (m[g.confianca] || 0) + 1), m), {});

  return {
    versao: 1,
    comCaixa,
    temGuias,
    dataReferencia: isNaN(refT) ? null : timeToData(refT),
    cobertura: { ...cobertura, divergencias: { total: divReais, ...contaConf }, guias: contaGuias },
    guiasNaoEnviadas: {
      total: { n: itensGuias.length, valor: r2(itensGuias.reduce((s, x) => s + x.valor, 0)), pacientes: new Set(itensGuias.map((x) => normalizeName(x.paciente))).size },
      faixas: { atrasada: somaFaixa("atrasada"), em_lote: somaFaixa("em_lote"), no_prazo: somaFaixa("no_prazo") },
      foraDoEnvio: { linhas: foraDoEnvio.linhas, valor: r2(foraDoEnvio.valor), convenios: [...foraDoEnvio.convenios].sort().slice(0, 40) },
      conveniosSemEnvio,
      truncado: Math.max(0, itensGuias.length - opc.maxGuias),
      itens: itensGuias.slice(0, opc.maxGuias),
    },
    guiasMultiDia: {
      total: multiDia.length,
      comLancadoresDiferentes: multiDia.filter((g) => g.nLancadores > 1).length,
      comEnvioIncompleto: multiDia.filter((g) => g.envio !== "total").length,
      suspeitasNumeracao,
      itens: multiDia.slice(0, 200),
    },
    guiasRepetidas: {
      total: repetidas.length,
      itens: repetidas.sort((a, b) => b.nPacientes - a.nPacientes || b.nAtendimentos - a.nAtendimentos).slice(0, 100),
    },
    faltas: comCaixa ? {
      lancamentos: C.length,
      faltas: C.filter((r) => r.status === "FALTOU").length,
      cancelamentos: C.filter((r) => r.status === "CANCELOU").length,
      porMedico: porMedicoFaltas.slice(0, 80),
    } : null,
    ranking,
    caixa: comCaixa ? {
      linhas: C.length,
      naoUsadas: C.length - usadas.size,
      pixCombinados: C.filter((r) => r.temPix && !isPix(r.forma)).length,
    } : null,
  };
}

/** Pontos de atenção do cruzamento, no mesmo tom do generateInsights. */
export function insightsCruzamento(cz) {
  if (!cz) return [];
  const out = [];
  const brl = (n) => n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
  const n = (x) => Math.round(x).toLocaleString("pt-BR");
  const titulo = (s) => String(s).toLowerCase().split(" ")
    .map((w, i) => (i > 0 && /^(da|de|do|das|dos|e)$/.test(w) ? w : w.charAt(0).toUpperCase() + w.slice(1))).join(" ");
  const g = cz.guiasNaoEnviadas;
  if (g?.total.n) {
    out.push(`${n(g.total.n)} ${g.total.n === 1 ? "atendimento de convênio está" : "atendimentos de convênio estão"} sem envio ao faturamento, somando ${brl(g.total.valor)}.`);
    if (g.faixas.atrasada.n) out.push(`${n(g.faixas.atrasada.n)} dessas guias (${brl(g.faixas.atrasada.valor)}) já passaram do maior prazo de envio visto no próprio convênio: priorize a cobrança.`);
  }
  if (cz.comCaixa) {
    // Critério só das guias (o ranking da tela soma guias e divergências e poria outra pessoa no topo).
    const top = (cz.ranking || []).filter((r) => r.guiasNaoEnviadas >= 1)
      .sort((a, b) => b.guiasNaoEnviadas - a.guiasNaoEnviadas || b.valorGuias - a.valorGuias)[0];
    // Atendimento lançado por duas pessoas indistinguíveis conta meio: mostra a casa decimal em vez de arredondar.
    const qtd = (x) => x.toLocaleString("pt-BR", { maximumFractionDigits: 1 });
    if (top) out.push(`Quem mais lançou guias não enviadas: ${titulo(top.nome)}, com ${qtd(top.guiasNaoEnviadas)} (${brl(top.valorGuias)})${top.taxaGuias != null ? `, ${top.taxaGuias.toLocaleString("pt-BR", { maximumFractionDigits: 1 })}% das guias que lançou` : ""}.`);
  }
  if (cz.guiasMultiDia?.comEnvioIncompleto) out.push(`${n(cz.guiasMultiDia.comEnvioIncompleto)} ${cz.guiasMultiDia.comEnvioIncompleto === 1 ? "guia usada" : "guias usadas"} em mais de um dia ${cz.guiasMultiDia.comEnvioIncompleto === 1 ? "tem" : "têm"} algum atendimento sem envio.`);
  const eq = analiseEquipe(cz);
  if (eq) {
    const pct = (x) => `${x.toLocaleString("pt-BR", { maximumFractionDigits: 1 })}%`;
    const t = eq.taxa;
    if (t.geral != null && t.acimaDoPadrao.length) {
      out.push(`Taxa de guias sem envio da equipe: ${pct(t.geral)}${t.faixaRecepcao ? ` (recepção entre ${pct(t.faixaRecepcao.min)} e ${pct(t.faixaRecepcao.max)})` : ""}. ${t.acimaDoPadrao.length === 1 ? "1 pessoa passa" : `${t.acimaDoPadrao.length} pessoas passam`} de ${pct(t.limiteAlto)}: vale treinar.`);
    }
    if (eq.profissionais.guias >= 1) out.push(`Profissionais que lançam o próprio atendimento deixaram ${n(eq.profissionais.guias)} guias sem envio (${brl(eq.profissionais.valor)}).`);
    if (eq.guiasRepetidas.total) out.push(`${n(eq.guiasRepetidas.total)} ${eq.guiasRepetidas.total === 1 ? "número de guia aparece" : "números de guia aparecem"} em pacientes diferentes no mesmo convênio: pode ser erro de digitação no cadastro.`);
    if (eq.faltas.faltas + eq.faltas.cancelamentos) out.push(`${n(eq.faltas.faltas)} faltas e ${n(eq.faltas.cancelamentos)} cancelamentos lançados no Fechamento de Caixa (${pct(eq.faltas.taxa)} dos lançamentos).`);
  }
  return out;
}

// ─── Equipe e pontos cegos (derivado do cruzamento salvo) ─────────────────────

/** Quantil por interpolação linear de uma lista já ordenada. */
function quantil(xs, p) {
  if (!xs.length) return null;
  const i = (xs.length - 1) * p, lo = Math.floor(i), hi = Math.ceil(i);
  return r2(xs[lo] + (xs[hi] - xs[lo]) * (i - lo));
}

/**
 * Métricas de equipe e pontos cegos do processo, calculadas a partir do `cruzamento` salvo — também em auditorias
 * gravadas antes destes campos (aí `guiasRepetidas.itens` e `faltas.porMedico` vêm vazios).
 *   taxa: guias de convênio sem envio ÷ guias de convênio que a pessoa lançou. Só entra quem lançou ≥ minGuias,
 *   para não punir quem lançou pouco (uma guia em duas vira 50%).
 * Usado pela tela, pelas exportações e pelo relatório IA (que recebe só números, sem nomes).
 * Devolve null quando a auditoria não teve o Fechamento de Caixa.
 */
export function analiseEquipe(cz, { minGuias = 10, minGuiasFaixa = 20 } = {}) {
  if (!cz?.comCaixa) return null;
  const rk = Array.isArray(cz.ranking) ? cz.ranking : [];
  const soma = (xs, k) => xs.reduce((s, r) => s + (Number(r[k]) || 0), 0);

  // 1) Taxa por pessoa.
  const guiasLancadas = soma(rk, "guiasLancadas");
  const guiasNaoEnviadas = soma(rk, "guiasNaoEnviadas");
  const taxaGeral = guiasLancadas >= 1 ? r2((guiasNaoEnviadas / guiasLancadas) * 100) : null;
  const atend = rk.filter((r) => r.tipo === "atendente" && r.taxaGuias != null && r.guiasLancadas >= minGuiasFaixa)
    .map((r) => r.taxaGuias).sort((a, b) => a - b);
  // Faixa típica da recepção: quartis (meio da distribuição) com 4+ atendentes; senão, do menor ao maior.
  const faixaRecepcao = atend.length >= 4 ? { min: quantil(atend, 0.25), max: quantil(atend, 0.75), n: atend.length }
    : atend.length ? { min: atend[0], max: atend[atend.length - 1], n: atend.length } : null;
  const mediana = atend.length ? quantil(atend, 0.5) : taxaGeral;
  // "Acima do padrão": bem acima do meio da recepção — nunca abaixo de 30%.
  const limiteAlto = r2(Math.max(30, (mediana ?? 0) * 2, (faixaRecepcao?.max ?? 0) + 15));
  const comBase = rk.filter((r) => r.taxaGuias != null && r.guiasLancadas >= minGuias);
  const enxuto = (r) => ({ nome: r.nome, tipo: r.tipo, ...(r.faturamento ? { faturamento: true } : {}), lancamentos: r.lancamentos,
    guiasLancadas: r.guiasLancadas, guiasNaoEnviadas: r.guiasNaoEnviadas, valorGuias: r.valorGuias, taxa: r.taxaGuias });
  const acimaDoPadrao = comBase.filter((r) => r.taxaGuias >= limiteAlto)
    .sort((a, b) => b.taxaGuias - a.taxaGuias || b.guiasNaoEnviadas - a.guiasNaoEnviadas).map(enxuto);
  const referencia = Math.min(taxaGeral ?? 0, faixaRecepcao?.min ?? Infinity);
  const fazemCerto = rk.filter((r) => r.taxaGuias != null && r.guiasLancadas >= minGuiasFaixa && r.taxaGuias <= referencia)
    .sort((a, b) => a.taxaGuias - b.taxaGuias || b.guiasLancadas - a.guiasLancadas).slice(0, 5).map(enxuto);
  const porTaxa = comBase.slice().sort((a, b) => b.taxaGuias - a.taxaGuias || b.guiasNaoEnviadas - a.guiasNaoEnviadas).map(enxuto);

  // 2) Profissionais que lançam o próprio atendimento e não mandam a guia.
  const profs = rk.filter((r) => r.tipo === "profissional" && r.guiasNaoEnviadas >= 1)
    .sort((a, b) => b.guiasNaoEnviadas - a.guiasNaoEnviadas || b.valorGuias - a.valorGuias);
  const profissionais = { pessoas: profs.length, guias: r2(soma(profs, "guiasNaoEnviadas")), valor: r2(soma(profs, "valorGuias")),
    parteDoTotal: guiasNaoEnviadas ? r2((soma(profs, "guiasNaoEnviadas") / guiasNaoEnviadas) * 100) : 0, itens: profs.slice(0, 8).map(enxuto) };

  // 3) Guias de várias sessões lançadas por pessoas diferentes.
  const md = cz.guiasMultiDia || {};
  const multiItens = Array.isArray(md.itens) ? md.itens : [];
  const multiSessao = {
    total: Number(md.total) || 0,
    comLancadoresDiferentes: Number(md.comLancadoresDiferentes) || 0,
    comEnvioIncompleto: Number(md.comEnvioIncompleto) || 0,
    // As duas coisas juntas: a parte sem envio é fácil de perder quando cada sessão foi lançada por alguém.
    diferentesEIncompletas: multiItens.filter((g) => g.nLancadores > 1 && g.envio !== "total").length,
  };

  // 4) Números de guia repetidos entre pacientes.
  const gr = cz.guiasRepetidas;
  const guiasRepetidas = gr ? { total: Number(gr.total) || 0, itens: gr.itens || [], completo: true }
    : { total: Number(md.suspeitasNumeracao) || 0, itens: [], completo: false };

  // 5) Faltas e cancelamentos por pessoa e por médico.
  const fz = cz.faltas;
  const totLanc = fz?.lancamentos ?? soma(rk, "lancamentos");
  const faltas = fz?.faltas ?? soma(rk, "faltas");
  const cancelamentos = fz?.cancelamentos ?? soma(rk, "cancelamentos");
  const porPessoa = rk.filter((r) => r.faltas + r.cancelamentos > 0)
    .map((r) => ({ nome: r.nome, tipo: r.tipo, lancamentos: r.lancamentos, faltas: r.faltas, cancelamentos: r.cancelamentos,
      taxa: r.lancamentos ? r2(((r.faltas + r.cancelamentos) / r.lancamentos) * 100) : 0 }))
    .sort((a, b) => (b.faltas + b.cancelamentos) - (a.faltas + a.cancelamentos));

  return {
    minGuias,
    taxa: { geral: taxaGeral, guiasLancadas: r2(guiasLancadas), guiasNaoEnviadas: r2(guiasNaoEnviadas), faixaRecepcao, mediana, limiteAlto,
      avaliadas: comBase.length, acimaDoPadrao, fazemCerto, porTaxa },
    profissionais,
    multiSessao,
    guiasRepetidas,
    faltas: { lancamentos: totLanc, faltas, cancelamentos, taxa: totLanc ? r2(((faltas + cancelamentos) / totLanc) * 100) : 0,
      porPessoa, porMedico: fz?.porMedico || null },
  };
}
