// Movido de auditoria-medica.jsx sem alteração de comportamento.
import * as XLSX from "xlsx";

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

export function normalizeCol(s) {
  return String(s)
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .trim();
}

/** Decodifica o CSV: UTF-8 (com ou sem BOM) e, se não for UTF-8 válido, Windows-1252 (padrão do Excel no Brasil). */
function decodeCsv(bytes) {
  try {
    return new TextDecoder("utf-8", { fatal: true }).decode(bytes).replace(/^\uFEFF/, "");
  } catch {
    return new TextDecoder("windows-1252").decode(bytes);
  }
}

export function parseExcel(file) {
  const isCsv = /\.csv$/i.test(file?.name || "");
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
        const ws = wb.Sheets[wb.SheetNames[0]];
        const rows = XLSX.utils.sheet_to_json(ws, { defval: "", raw: true });
        resolve(rows);
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

export function validateFile(rows, cols) {
  if (!rows.length) return ["Arquivo vazio ou sem dados legíveis."];
  const errs = [];
  if (!cols.medicoCol)   errs.push("Coluna de médico/prestador não identificada.");
  if (!cols.valorCol)    errs.push("Coluna de valor/total não identificada.");
  if (errs.length) return errs;

  const emptyMed = rows.filter((r) => !normalizeName(r[cols.medicoCol])).length;
  if (emptyMed > rows.length * 0.4)
    errs.push(`${emptyMed} de ${rows.length} linhas sem nome de médico.`);

  const zeroVal = rows.filter((r) => parseValue(r[cols.valorCol]) === 0).length;
  if (zeroVal > rows.length * 0.6)
    errs.push(`${zeroVal} de ${rows.length} linhas com valor zero — verifique a coluna de valor.`);

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
  const all = new Set([...Object.keys(pp), ...Object.keys(rp)]);

  return [...all]
    .flatMap((pac) => {
      const pv   = sumVals(pp[pac] ?? [], pCols.valorCol);
      const rv   = sumVals(rp[pac] ?? [], rCols.valorCol);
      const diff = pv - rv;
      if (Math.round(Math.abs(diff) * 100) === 0) return []; // centavos (evita resíduo de ponto flutuante)
      return [{
        paciente:     pac,
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

export function generateInsights(divs, totalMedicos, valorTotal) {
  if (!divs.length)
    return ["Nenhuma divergência encontrada. Os relatórios de produção e repasse estão em plena conformidade."];

  const ins = [];
  const pct = ((divs.length / totalMedicos) * 100).toFixed(0);
  ins.push(
    `${divs.length} de ${totalMedicos} médico(s) analisados (${pct}%) apresentam divergências de faturamento.`
  );

  const sorted = [...divs].sort((a, b) => b.diferencaRaw - a.diferencaRaw);
  const prodMaior = divs.filter((d) => d.sentido === "prod_maior");
  const repMaior  = divs.filter((d) => d.sentido === "rep_maior");
  if (prodMaior.length)
    ins.push(`${prodMaior.length} médico(s) com Produção > Repasse (possível subpagamento): ${prodMaior.map(d => d.medico).join(", ")}.`);
  if (repMaior.length)
    ins.push(`${repMaior.length} médico(s) com Repasse > Produção (valor repasse excede o produzido): ${repMaior.slice(0,3).map(d => d.medico).join(", ")}${repMaior.length > 3 ? " e outros" : ""}.`);
  ins.push(`Maior divergência individual: ${sorted[0].medico} — ${brl(sorted[0].diferencaRaw)} de diferença (${sorted[0].sentido === "prod_maior" ? "Prod maior" : "Rep maior"}).`);

  const tipos = divs.flatMap((d) => d.detalhes.map((p) => p.tipo));
  if (tipos.length) {
    const freq     = tipos.reduce((a, t) => { a[t] = (a[t] || 0) + 1; return a; }, {});
    const entries  = Object.entries(freq).sort((a, b) => b[1] - a[1]);
    const [topTipo, topQtd] = entries[0];
    ins.push(
      `Padrão mais frequente: "${topTipo}" com ${topQtd} ocorrência(s). Recomenda-se revisão sistemática deste tipo.`
    );

    const ausentes = tipos.filter((t) => t.startsWith("Ausente")).length;
    if (ausentes)
      ins.push(
        `${ausentes} paciente(s) aparece(m) em apenas um dos relatórios — possíveis lançamentos faltantes ou erros de cadastro.`
      );
  }

  ins.push(
    `O valor total divergente de ${brl(valorTotal)} impacta diretamente o fechamento financeiro. Prioridade máxima para o setor de faturamento.`
  );

  if (divs.length >= 3) {
    const top3 = sorted.slice(0, 3).map((d) => d.medico).join(", ");
    ins.push(`Casos prioritários para revisão imediata: ${top3}.`);
  }

  return ins;
}
