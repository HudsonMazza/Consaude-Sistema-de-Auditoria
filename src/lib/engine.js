// Movido de auditoria-medica.jsx sem alteração de comportamento.
// SheetJS (xlsx) é carregado sob demanda dentro de parseExcel: as funções puras deste módulo (parseValue,
// detectColumns, validateFile…) continuam síncronas e não puxam a biblioteca para o pacote inicial.
import { titleCase, joinNames } from "./names.js";

let xlsxModule = null;
/** Carrega o SheetJS uma vez só (import dinâmico → chunk separado no build). */
function loadXLSX() {
  if (!xlsxModule) xlsxModule = import("xlsx").then((m) => m.default ?? m).catch((err) => { xlsxModule = null; throw err; });
  return xlsxModule;
}

// ─── ENGINE: PARSING ──────────────────────────────────────────────────────────

export function parseValue(v) {
  if (typeof v === "number") return Number.isFinite(v) ? v : 0;
  if (!v && v !== 0) return 0;
  let s = String(v).replace(/R\$/gi, "").replace(/[\s\u00a0]/g, "");
  if (!s) return 0;
  // Negativo contábil: (1.234,56) ou 1.234,56-
  let neg = false;
  if (/^\(.*\)$/.test(s)) { neg = true; s = s.slice(1, -1); }
  if (/-$/.test(s)) { neg = true; s = s.slice(0, -1); }
  if (s.startsWith("-")) { neg = !neg; s = s.slice(1); }
  const lastComma = s.lastIndexOf(",");
  const lastDot = s.lastIndexOf(".");
  if (lastComma > -1 && lastDot > -1) {
    // Os dois separadores: o último é o decimal ("1.234,56" ou "1,234.56")
    s = lastComma > lastDot ? s.replace(/\./g, "").replace(",", ".") : s.replace(/,/g, "");
  } else if (lastComma > -1) {
    // Só vírgula: decimal brasileiro ("1234,56"); várias vírgulas em grupos de 3 = milhar ("1,234,567")
    s = /^\d{1,3}(,\d{3}){2,}$/.test(s) ? s.replace(/,/g, "") : s.replace(",", ".");
  } else if (lastDot > -1 && /^[1-9]\d{0,2}(\.\d{3})+$/.test(s)) {
    // Só ponto em grupos de 3 ("1.234", "1.234.567") = separador de milhar brasileiro
    s = s.replace(/\./g, "");
  }
  const n = parseFloat(s);
  if (isNaN(n)) return 0;
  return neg ? -n : n;
}

export function normalizeName(s) {
  return String(s ?? "")
    .toUpperCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    // Remove só o título "DR"/"DRA" como palavra própria ("DR. JOAO", "DRA MARIA"), nunca o início de um nome ("DRUMMOND")
    .replace(/(^|\s)DRA?(?:\.\s*|\s+)/g, "$1")
    .replace(/\s+/g, " ")
    .trim();
}

/** Nome para exibição: mesmo tratamento do normalizeName (caixa alta, sem "Dr."), mas mantendo os acentos. */
export function displayName(s) {
  return String(s ?? "")
    .toUpperCase()
    .replace(/(^|\s)DRA?(?:\.\s*|\s+)/g, "$1")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Para cada nome normalizado (chave de agrupamento, sem acento), a grafia original mais frequente nas planilhas.
 * Ex.: { "JOAO DA SILVA": "JOÃO DA SILVA" }. Assim o relatório mostra "João", mas o cruzamento continua pela chave.
 */
export function originalNames(rowsList, col) {
  const counts = new Map();
  for (const [rows, c] of rowsList.map((r) => (Array.isArray(r) ? [r, col] : [r.rows, r.col]))) {
    if (!c) continue;
    for (const row of rows) {
      const key = normalizeName(row[c]);
      if (!key) continue;
      const shown = displayName(row[c]);
      const m = counts.get(key) || new Map();
      m.set(shown, (m.get(shown) || 0) + 1);
      counts.set(key, m);
    }
  }
  const out = {};
  for (const [key, m] of counts) out[key] = [...m.entries()].sort((a, b) => b[1] - a[1])[0][0];
  return out;
}

/** Linhas sem nome no campo `col` (ficam fora do cruzamento) e a soma dos valores delas. */
export function rowsWithoutName(rows, nameCol, valueCol) {
  const sem = rows.filter((r) => !normalizeName(r[nameCol]));
  return { linhas: sem.length, valor: sumVals(sem, valueCol) };
}

export function normalizeCol(s) {
  return String(s)
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .trim();
}

/**
 * Escolhe a aba com os dados: a primeira que tem colunas de médico e de valor reconhecíveis
 * (ignora capa, resumo e abas vazias). Sem nenhuma assim, a primeira aba com linhas; senão, a primeira.
 */
function pickSheetRows(XLSX, wb) {
  let firstWithRows = null;
  for (const name of wb.SheetNames) {
    const rows = XLSX.utils.sheet_to_json(wb.Sheets[name], { defval: "", raw: true });
    if (!rows.length) continue;
    const cols = detectColumns(rows);
    if (cols.medicoCol && cols.valorCol && validateFile(rows, cols).length === 0) return rows;
    if (!firstWithRows) firstWithRows = rows;
  }
  if (firstWithRows) return firstWithRows;
  const first = wb.Sheets[wb.SheetNames[0]];
  return first ? XLSX.utils.sheet_to_json(first, { defval: "", raw: true }) : [];
}

/** Decodifica o CSV: UTF-8 (com ou sem BOM) e, se não for UTF-8 válido, Windows-1252 (padrão do Excel no Brasil). */
function decodeCsv(bytes) {
  try {
    return new TextDecoder("utf-8", { fatal: true }).decode(bytes).replace(/^\uFEFF/, "");
  } catch {
    return new TextDecoder("windows-1252").decode(bytes);
  }
}

export async function parseExcel(file) {
  const isCsv = /\.csv$/i.test(file?.name || "");
  const XLSX = await loadXLSX();
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const bytes = new Uint8Array(e.target.result);
        // CSV: lê o texto sem conversões automáticas (o SheetJS interpretaria "1.234,56" e "01/04/2025"
        // no formato americano). Os valores ficam como texto e o parseValue trata o formato brasileiro.
        const wb = isCsv
          ? XLSX.read(decodeCsv(bytes), { type: "string", raw: true })
          : XLSX.read(bytes, { type: "array" });
        resolve(pickSheetRows(XLSX, wb));
      } catch (err) { reject(err); }
    };
    reader.onerror = () => reject(new Error("Falha ao ler o arquivo."));
    reader.readAsArrayBuffer(file);
  });
}

// ─── ENGINE: COLUMN DETECTION ─────────────────────────────────────────────────

// ─── REFERÊNCIA (mês/ano) ─────────────────────────────────────────────────────

/** Converte o valor de uma célula de data em { y, m } (m = 1–12). Aceita data do Excel (número serial ou Date) e texto. */
export function parseMonthYear(val) {
  if (val === null || val === undefined || val === "") return null;
  const ok = (y, m) => (y >= 1990 && y <= 2100 && m >= 1 && m <= 12 ? { y, m } : null);
  if (val instanceof Date && !isNaN(val.getTime())) return ok(val.getFullYear(), val.getMonth() + 1);
  if (typeof val === "number") {
    // Número serial do Excel (datas de 1990 a 2100 ficam entre ~32.874 e ~73.051)
    if (val < 30000 || val > 75000) return null;
    // Dia 0 do Excel = 30/12/1899 (já compensa o "29/02/1900" inexistente para datas após março de 1900)
    const d = new Date(Date.UTC(1899, 11, 30) + Math.floor(val) * 86400000);
    return ok(d.getUTCFullYear(), d.getUTCMonth() + 1);
  }
  const s = String(val).trim();
  let m;
  if ((m = s.match(/^(\d{1,2})[/.-](\d{1,2})[/.-](\d{2}|\d{4})\b/))) {        // dd/mm/aaaa ou dd/mm/aa
    const y = m[3].length === 2 ? 2000 + Number(m[3]) : Number(m[3]);
    return ok(y, Number(m[2]));
  }
  if ((m = s.match(/^(\d{4})[/.-](\d{1,2})(?:[/.-]\d{1,2})?\b/))) return ok(Number(m[1]), Number(m[2])); // aaaa-mm-dd / aaaa-mm
  if ((m = s.match(/^(\d{1,2})[/.-](\d{4})$/))) return ok(Number(m[2]), Number(m[1]));                   // mm/aaaa (competência)
  const MESES = ["jan", "fev", "mar", "abr", "mai", "jun", "jul", "ago", "set", "out", "nov", "dez"];
  if ((m = normalizeCol(s).match(/^([a-z]{3})[a-z]*[\s/.-]*(?:de\s*)?(\d{2}|\d{4})$/))) {                   // abril/2025, abr-25
    const idx = MESES.indexOf(m[1]);
    if (idx > -1) return ok(m[2].length === 2 ? 2000 + Number(m[2]) : Number(m[2]), idx + 1);
  }
  return null;
}

// Colunas de data em ordem de preferência; datas de nascimento, cadastro e pagamento não indicam o período produzido.
const COL_DATA_PREF = [
  /data.*aten|aten.*data|data.*proc|data.*realiz|data.*exec|data.*serv/,
  /competenc|periodo|referenc|mes.*ano|mes.*ref/,
  /^data$|^dt$|^dt\b|data|^dt[\s._]/,
];
const COL_DATA_EXCL = /nasc|cadastr|pagam|emiss|venc|nascimento|admiss|inclus|alterac/;

/** Extrai o mês/ano de referência a partir da coluna de data dos dados (o mês mais frequente). */
export function extractReferencia(rows) {
  if (!rows || !rows.length) return null;
  const cols = Object.keys(rows[0]);
  const sample = rows.length > 2000 ? rows.slice(0, 2000) : rows;
  for (const re of COL_DATA_PREF) {
    const candidates = cols.filter((c) => { const n = normalizeCol(c); return re.test(n) && !COL_DATA_EXCL.test(n); });
    for (const col of candidates) {
      const counts = new Map();
      for (const r of sample) {
        const my = parseMonthYear(r[col]);
        if (!my) continue;
        const key = my.y * 100 + my.m;
        counts.set(key, (counts.get(key) || 0) + 1);
      }
      if (!counts.size) continue;
      const [key] = [...counts.entries()].sort((a, b) => b[1] - a[1] || b[0] - a[0])[0];
      const d = new Date(Math.floor(key / 100), (key % 100) - 1, 1);
      return d.toLocaleDateString("pt-BR", { month: "long", year: "numeric" });
    }
  }
  return null;
}

const COL_MEDICO      = /medico|prestador|especialista|profissional|dr\b|doutor|nome.*med|med.*nome/;
const COL_PACIENTE    = /paciente|beneficiario|cliente|usuario|nome.*pac|nome.*bene|benefi/;
// Prioridade: colunas com "total" ou "liquido" (evita pegar "Valor do item" antes de "Valor total do item")
const COL_VALOR_PREF  = /valor.*total|total.*valor|liquido|honorar/;
const COL_VALOR_FALL  = /valor|total|vl\b|vlr\b|bruto|repass|producao|proc.*val/;

export function detectColumns(rows) {
  if (!rows.length) return { medicoCol: null, pacienteCol: null, valorCol: null };
  const cols = Object.keys(rows[0]);

  const find = (pattern) => cols.find((c) => pattern.test(normalizeCol(c)));

  let medicoCol   = find(COL_MEDICO);
  let pacienteCol = find(COL_PACIENTE);
  // Tenta padrão preferencial primeiro, depois fallback
  let valorCol    = find(COL_VALOR_PREF) ?? find(COL_VALOR_FALL);

  // Fallback: use numeric column for valor
  if (!valorCol) {
    valorCol = cols.find((c) =>
      rows.slice(0, 20).filter((r) => typeof r[c] === "number" && r[c] > 0).length >= 3
    );
  }
  // Fallback: first two non-empty string columns for médico/paciente
  if (!medicoCol || !pacienteCol) {
    const strCols = cols.filter(
      (c) => c !== valorCol && rows.slice(0, 5).some((r) => typeof r[c] === "string" && r[c].length > 2)
    );
    if (!medicoCol)   medicoCol   = strCols[0] ?? null;
    if (!pacienteCol) pacienteCol = strCols[1] ?? null;
  }

  return { medicoCol, pacienteCol, valorCol };
}

/** Nomes de colunas da planilha (cabeçalho da primeira linha), sem as colunas sem título que o SheetJS cria. */
export function sheetHeaders(rows) {
  return rows && rows.length ? Object.keys(rows[0]).filter((c) => !/^__EMPTY/.test(c)) : [];
}

/** Colunas detectadas com as escolhas manuais do usuário por cima (só as preenchidas). */
export function mergeColumns(detected, override) {
  const out = { ...detected };
  if (override) {
    for (const k of ["medicoCol", "valorCol", "pacienteCol"]) {
      if (override[k] !== undefined) out[k] = override[k] || null;
    }
  }
  return out;
}

const fmtN = (n) => n.toLocaleString("pt-BR");

/** Problemas que impedem usar o arquivo. Cada mensagem diz o que houve e o que fazer. */
export function validateFile(rows, cols) {
  if (!rows.length) return ["A planilha está vazia ou não tem dados legíveis. Envie outro arquivo."];
  const errs = [];
  if (!cols.medicoCol)   errs.push("Não encontramos a coluna com o nome do médico. Indique qual é em “Ajustar colunas”.");
  if (!cols.valorCol)    errs.push("Não encontramos a coluna de valor. Indique qual é em “Ajustar colunas”.");
  if (errs.length) return errs;

  const emptyMed = rows.filter((r) => !normalizeName(r[cols.medicoCol])).length;
  if (emptyMed > rows.length * 0.4)
    errs.push(`${fmtN(emptyMed)} de ${fmtN(rows.length)} linhas estão sem nome de médico. Confira a coluna do médico em “Ajustar colunas”.`);

  const zeroVal = rows.filter((r) => parseValue(r[cols.valorCol]) === 0).length;
  if (zeroVal > rows.length * 0.6)
    errs.push(`${fmtN(zeroVal)} de ${fmtN(rows.length)} linhas têm valor zero. Confira a coluna de valor em “Ajustar colunas”.`);

  return errs;
}

// ─── ENGINE: COMPARISON ───────────────────────────────────────────────────────

export function groupBy(rows, col) {
  return rows.reduce((acc, row) => {
    const k = normalizeName(row[col]);
    if (!k) return acc;
    (acc[k] = acc[k] || []).push(row);
    return acc;
  }, {});
}

export function sumVals(rows, col) {
  return rows.reduce((s, r) => s + parseValue(r[col]), 0);
}

export function brl(n) {
  return n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export function classifyDivergence(prodRows, repRows, diff) {
  const hasProd = prodRows?.length > 0;
  const hasRep  = repRows?.length > 0;
  if (!hasProd && !hasRep) return "Sem lançamentos";
  if (!hasProd) return "Ausente na Produção";
  if (!hasRep)  return "Ausente no Repasse";
  if (Math.abs(diff) < 1)  return "Diferença de centavos";
  if (prodRows.length !== repRows.length) return "Quantidade de lançamentos diferente";
  return diff > 0 ? "Maior na Produção" : "Maior no Repasse";
}

export function comparePatients(prodRows, repRows, pCols, rCols) {
  if (!pCols.pacienteCol || !rCols.pacienteCol) return [];
  const pp  = groupBy(prodRows, pCols.pacienteCol);
  const rp  = groupBy(repRows, rCols.pacienteCol);
  const nomes = originalNames([{ rows: prodRows, col: pCols.pacienteCol }, { rows: repRows, col: rCols.pacienteCol }]);
  const all = new Set([...Object.keys(pp), ...Object.keys(rp)]);

  return [...all]
    .flatMap((pac) => {
      const pv   = sumVals(pp[pac] ?? [], pCols.valorCol);
      const rv   = sumVals(rp[pac] ?? [], rCols.valorCol);
      const diff = pv - rv;
      if (Math.round(Math.abs(diff) * 100) === 0) return []; // centavos (evita resíduo de ponto flutuante)
      return [{
        paciente:     nomes[pac] || pac,
        producao:     brl(pv),
        repasse:      brl(rv),
        diferenca:    brl(Math.abs(diff)),
        diferencaRaw: Math.abs(diff),
        tipo:         classifyDivergence(pp[pac], rp[pac], diff),
      }];
    })
    .sort((a, b) => b.diferencaRaw - a.diferencaRaw);
}

// ─── ENGINE: INSIGHTS ─────────────────────────────────────────────────────────

const DIRECAO = { prod_maior: "Produção maior", rep_maior: "Repasse maior" };
const medicos = (n) => `${fmtN(n)} ${n === 1 ? "médico" : "médicos"}`;

/**
 * Pontos de atenção do relatório: curtos e factuais, com o vocabulário da interface
 * (Repasse maior / Produção maior) e nomes em caixa de título.
 */
export function generateInsights(divs, totalMedicos, valorTotal) {
  if (!divs.length)
    return ["Nenhuma divergência entre Produção e Repasse."];

  const ins = [];
  const pct = totalMedicos ? Math.round((divs.length / totalMedicos) * 100) : 0;
  ins.push(
    `${fmtN(divs.length)} de ${medicos(totalMedicos)} ${totalMedicos === 1 ? "analisado" : "analisados"} (${pct}%) ${divs.length === 1 ? "tem" : "têm"} divergência.`
  );

  const sorted = [...divs].sort((a, b) => b.diferencaRaw - a.diferencaRaw);
  const nomes = (list) => joinNames(list.map((d) => titleCase(d.medico)), 3);
  const repMaior  = sorted.filter((d) => d.sentido === "rep_maior");
  const prodMaior = sorted.filter((d) => d.sentido === "prod_maior");
  if (repMaior.length)
    ins.push(`Repasse maior (pago a mais) em ${medicos(repMaior.length)}: ${nomes(repMaior)}.`);
  if (prodMaior.length)
    ins.push(`Produção maior (pago a menos) em ${medicos(prodMaior.length)}: ${nomes(prodMaior)}.`);
  ins.push(`Maior diferença: ${titleCase(sorted[0].medico)}, ${brl(sorted[0].diferencaRaw)} (${DIRECAO[sorted[0].sentido] || "sem direção"}).`);

  const tipos = divs.flatMap((d) => (d.detalhes || []).map((p) => p.tipo));
  if (tipos.length) {
    const freq    = tipos.reduce((a, t) => { a[t] = (a[t] || 0) + 1; return a; }, {});
    const [topTipo, topQtd] = Object.entries(freq).sort((a, b) => b[1] - a[1])[0];
    ins.push(`Tipo mais frequente: “${topTipo}”, em ${fmtN(topQtd)} ${topQtd === 1 ? "item" : "itens"} por paciente.`);

    const ausentes = tipos.filter((t) => t.startsWith("Ausente")).length;
    if (ausentes)
      ins.push(
        ausentes === 1
          ? "1 paciente aparece em só um dos relatórios: confira se falta um lançamento."
          : `${fmtN(ausentes)} pacientes aparecem em só um dos relatórios: confira se faltam lançamentos.`
      );
  }

  ins.push(`Valor divergente total: ${brl(valorTotal)}.`);

  if (divs.length >= 3)
    ins.push(`Revise primeiro as maiores diferenças: ${joinNames(sorted.slice(0, 3).map((d) => titleCase(d.medico)))}.`);

  return ins;
}
