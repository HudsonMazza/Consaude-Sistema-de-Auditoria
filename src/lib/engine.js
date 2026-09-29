// Movido de auditoria-medica.jsx sem alteração de comportamento.
import * as XLSX from "xlsx";

// ─── ENGINE: PARSING ──────────────────────────────────────────────────────────

export function parseValue(v) {
  if (typeof v === "number") return v;
  if (!v && v !== 0) return 0;
  let s = String(v).replace(/R\$\s*/g, "").replace(/\s/g, "");
  // Formato brasileiro: vírgula como decimal → todos os pontos são separadores de milhar
  if (s.includes(",")) {
    s = s.replace(/\./g, "").replace(",", ".");
  }
  const n = parseFloat(s);
  return isNaN(n) ? 0 : n;
}

export function normalizeName(s) {
  return String(s ?? "")
    .toUpperCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/\bDR[Aa]?\.?\s*/g, "")
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

export function parseExcel(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const wb = XLSX.read(new Uint8Array(e.target.result), { type: "array" });
        const ws = wb.Sheets[wb.SheetNames[0]];
        const rows = XLSX.utils.sheet_to_json(ws, { defval: "" });
        resolve(rows);
      } catch (err) { reject(err); }
    };
    reader.onerror = () => reject(new Error("Falha ao ler o arquivo."));
    reader.readAsArrayBuffer(file);
  });
}

// ─── ENGINE: COLUMN DETECTION ─────────────────────────────────────────────────

// Extrai o mês/ano de referência a partir da coluna de data dos dados reais
export function extractReferencia(rows) {
  if (!rows.length) return null;
  const cols = Object.keys(rows[0]);
  const dateCol = cols.find((c) => /data.*aten|aten.*data/i.test(normalizeCol(c)));
  if (!dateCol) return null;
  const val = rows.find((r) => r[dateCol])?.[dateCol];
  if (!val) return null;
  const parts = String(val).split("/");
  if (parts.length !== 3) return null;
  const d = new Date(parseInt(parts[2]), parseInt(parts[1]) - 1, 1);
  if (isNaN(d.getTime())) return null;
  return d.toLocaleDateString("pt-BR", { month: "long", year: "numeric" });
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
      if (Math.abs(diff) < 0.01) return [];
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
