import { useState, useEffect, useRef } from "react";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { firebaseReady } from "./src/firebase";
import {
  observarSessao, login, logout, enviarResetDeSenha, alterarPropriaSenha,
  listarUsuarios, criarUsuario, atualizarUsuario, definirUsuarioDesativado,
  mensagemDeErro,
} from "./src/auth";

// ─── ICONS ────────────────────────────────────────────────────────────────────
const ICONS = {
  dashboard: (<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>),
  audit: (<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>),
  history: (<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>),
  settings: (<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14M4.93 4.93a10 10 0 0 0 0 14.14"/><path d="M12 2v2M12 20v2M2 12h2M20 12h2"/></svg>),
  sun: (<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>),
  moon: (<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>),
  upload: (<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>),
  spreadsheet: (<svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="8" y1="13" x2="16" y2="13"/><line x1="8" y1="17" x2="16" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>),
  check: (<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>),
  loader: (<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="2" x2="12" y2="6"/><line x1="12" y1="18" x2="12" y2="22"/><line x1="4.93" y1="4.93" x2="7.76" y2="7.76"/><line x1="16.24" y1="16.24" x2="19.07" y2="19.07"/><line x1="2" y1="12" x2="6" y2="12"/><line x1="18" y1="12" x2="22" y2="12"/><line x1="4.93" y1="19.07" x2="7.76" y2="16.24"/><line x1="16.24" y1="7.76" x2="19.07" y2="4.93"/></svg>),
  chevronDown: (<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"/></svg>),
  chevronRight: (<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>),
  x: (<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>),
  brain: (<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96-.46 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 1.98-3A2.5 2.5 0 0 1 9.5 2Z"/><path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96-.46 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-1.98-3A2.5 2.5 0 0 0 14.5 2Z"/></svg>),
  export: (<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>),
  share: (<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>),
  eye: (<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>),
  copy: (<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>),
  edit: (<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>),
  menu: (<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>),
  users: (<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>),
  alert: (<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>),
  trending: (<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>),
  dollar: (<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>),
  plus: (<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>),
  warning: (<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>),
  tag: (<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/></svg>),
};

// ─── AUTH ─────────────────────────────────────────────────────────────────────
//
// Autenticação e papéis vivem no Firebase (src/auth.js + firestore.rules).
// Não há credencial padrão e nada aqui é verificado no navegador: a senha é
// conferida pelos servidores do Firebase Auth e o papel admin/user é lido de
// users/{uid} no Firestore, protegido por Security Rules.

const CS_CLINIC_KEY = 'cs_clinic';

// createdAt vem do Firestore como Timestamp; registros antigos podem ser string.
function formatarData(valor) {
  if (!valor) return '—';
  const d = typeof valor?.toDate === 'function' ? valor.toDate() : new Date(valor);
  return isNaN(d) ? '—' : d.toLocaleDateString('pt-BR');
}

function getClinicSettings() {
  try {
    return JSON.parse(localStorage.getItem(CS_CLINIC_KEY) || 'null') || { name: 'ConSaúde', cnpj: '', email: '' };
  } catch { return { name: 'ConSaúde', cnpj: '', email: '' }; }
}

function saveClinicSettings(s) {
  localStorage.setItem(CS_CLINIC_KEY, JSON.stringify(s));
}

// ─── ENGINE: PARSING ──────────────────────────────────────────────────────────

function parseValue(v) {
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

function normalizeName(s) {
  return String(s ?? "")
    .toUpperCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/\bDR[Aa]?\.?\s*/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function normalizeCol(s) {
  return String(s)
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .trim();
}

function parseExcel(file) {
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
function extractReferencia(rows) {
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

function validateFile(rows, cols) {
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

function groupBy(rows, col) {
  return rows.reduce((acc, row) => {
    const k = normalizeName(row[col]);
    if (!k) return acc;
    (acc[k] = acc[k] || []).push(row);
    return acc;
  }, {});
}

function sumVals(rows, col) {
  return rows.reduce((s, r) => s + parseValue(r[col]), 0);
}

function brl(n) {
  return n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function classifyDivergence(prodRows, repRows, diff) {
  const hasProd = prodRows?.length > 0;
  const hasRep  = repRows?.length > 0;
  if (!hasProd && !hasRep) return "Sem lançamentos";
  if (!hasProd) return "Ausente na Produção";
  if (!hasRep)  return "Ausente no Repasse";
  if (Math.abs(diff) < 1)  return "Diferença de centavos";
  if (prodRows.length !== repRows.length) return "Quantidade de lançamentos diferente";
  return diff > 0 ? "Maior na Produção" : "Maior no Repasse";
}

function comparePatients(prodRows, repRows, pCols, rCols) {
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

function generateInsights(divs, totalMedicos, valorTotal) {
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

// ─── ENGINE: EXPORT ───────────────────────────────────────────────────────────

function exportExcel(res) {
  const wb = XLSX.utils.book_new();

  const ws1 = XLSX.utils.aoa_to_sheet([
    ["AUDITORIA DE PRODUÇÃO MÉDICA"],
    [],
    ["Gerado em:",         res.processadoEm],
    ["Referência:",        res.referencia],
    ["Arquivo Produção:",  res.file1Name],
    ["Arquivo Repasse:",   res.file2Name],
    [],
    ["RESUMO EXECUTIVO"],
    ["Médicos analisados",             res.totalMedicos],
    ["Médicos com divergência",        res.medicosComDivergencia],
    ["Total divergências (pacientes)", res.totalDivergencias],
    ["Valor total divergente",         res.valorTotal],
    [],
    ["INSIGHTS"],
    ...res.insights.map((i) => ["•", i]),
  ]);
  XLSX.utils.book_append_sheet(wb, ws1, "Resumo");

  const ws2 = XLSX.utils.aoa_to_sheet([
    ["Médico", "Total Produção", "Total Repasse", "Diferença", "Status"],
    ...res.divergencias.map((d) => [d.medico, d.producao, d.repasse, d.diferenca, d.status]),
  ]);
  XLSX.utils.book_append_sheet(wb, ws2, "Médicos");

  const ws3rows = [["Médico", "Paciente", "Produção", "Repasse", "Diferença", "Tipo de Divergência"]];
  res.divergencias.forEach((d) =>
    d.detalhes.forEach((p) =>
      ws3rows.push([d.medico, p.paciente, p.producao, p.repasse, p.diferenca, p.tipo])
    )
  );
  const ws3 = XLSX.utils.aoa_to_sheet(ws3rows);
  XLSX.utils.book_append_sheet(wb, ws3, "Pacientes");

  XLSX.writeFile(wb, `auditoria-${new Date().toISOString().slice(0, 10)}.xlsx`);
}

function exportPDF(res) {
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const W = doc.internal.pageSize.getWidth();

  doc.setFillColor(99, 102, 241);
  doc.rect(0, 0, W, 28, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(15);
  doc.setFont("helvetica", "bold");
  doc.text("Auditoria de Produção Médica", 14, 17);
  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.text(res.processadoEm, W - 14, 17, { align: "right" });

  let y = 36;
  doc.setTextColor(15, 23, 42);

  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.text("RESUMO EXECUTIVO", 14, y);
  y += 6;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  const metricPairs = [
    [`Médicos analisados: ${res.totalMedicos}`,       `Médicos com divergência: ${res.medicosComDivergencia}`],
    [`Total divergências: ${res.totalDivergencias}`,  `Valor divergente: ${res.valorTotal}`],
  ];
  metricPairs.forEach(([a, b]) => {
    doc.text(a, 14, y);
    doc.text(b, W / 2, y);
    y += 6;
  });
  y += 4;

  if (res.divergencias.length) {
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.text("MÉDICOS COM DIVERGÊNCIA", 14, y);
    autoTable(doc, {
      startY: y + 3,
      head:   [["Médico", "Produção", "Repasse", "Diferença"]],
      body:   res.divergencias.map((d) => [d.medico, d.producao, d.repasse, d.diferenca]),
      styles:            { fontSize: 8, cellPadding: 2.5 },
      headStyles:        { fillColor: [99, 102, 241], textColor: 255 },
      alternateRowStyles:{ fillColor: [248, 250, 252] },
      margin:            { left: 14, right: 14 },
    });
    y = doc.lastAutoTable.finalY + 8;
  }

  if (res.insights.length) {
    if (y > 230) { doc.addPage(); y = 20; }
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.text("ANÁLISE INTELIGENTE", 14, y);
    y += 6;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.5);
    res.insights.forEach((ins) => {
      const lines = doc.splitTextToSize(`• ${ins}`, W - 28);
      if (y + lines.length * 5 > 280) { doc.addPage(); y = 20; }
      doc.text(lines, 14, y);
      y += lines.length * 5 + 3;
    });
  }

  doc.save(`auditoria-${new Date().toISOString().slice(0, 10)}.pdf`);
}

// ─── AI REPORT ───────────────────────────────────────────────────────────────

async function fetchAIAnalysis(res, apiKey) {
  const pct  = Math.round((res.medicosComDivergencia / res.totalMedicos) * 100);
  const sobre = res.divergencias.filter(d => d.sentido === "rep_maior");
  const sub   = res.divergencias.filter(d => d.sentido === "prod_maior");
  const vS = sobre.reduce((s,d)=>s+d.diferencaRaw,0);
  const vU = sub.reduce((s,d)=>s+d.diferencaRaw,0);
  const tf = {}; res.divergencias.flatMap(d=>d.detalhes.map(p=>p.tipo)).forEach(t=>{tf[t]=(tf[t]||0)+1;});
  const top5 = res.divergencias.slice(0,5).map(d=>d.medico+": "+(d.sentido==="rep_maior"?"Rep":"Prod")+" maior em "+d.diferenca).join("; ");

  const prompt = "Voce e um auditor financeiro senior especialista em clinicas medicas no Brasil.\n"
    +"Analise os dados de auditoria abaixo e responda APENAS com JSON valido (sem markdown).\n\n"
    +"DADOS:\n"
    +"- Referencia: "+res.referencia+"\n"
    +"- "+res.totalMedicos+" medicos, "+res.medicosComDivergencia+" com divergencia ("+pct+"%)\n"
    +"- Valor divergente: "+res.valorTotal+"\n"
    +"- Repasse>Producao (sobrepagamento): "+sobre.length+" medicos, "+brl(vS)+"\n"
    +"- Producao>Repasse (subpagamento): "+sub.length+" medicos, "+brl(vU)+"\n"
    +"- Top casos: "+top5+"\n"
    +"- Tipos de divergencia: "+JSON.stringify(tf)+"\n\n"
    +"Responda EXATAMENTE neste JSON (todos campos obrigatorios, portugues, profissional):\n"
    +JSON.stringify({
      resumoExecutivo:"1-2 frases executivas",
      interpretacaoRisco:"1 frase sobre o nivel de risco",
      analisesPorTipo:[{tipo:"nome exato",interpretacao:"significado em 1-2 frases",prevencao:"como prevenir"}],
      planoDeAcao:[{acao:"acao concreta",prazo:"48 horas",responsavel:"Equipe de Faturamento",impacto:"impacto esperado",urgencia:"alta"}],
      insights:["observacao 1","observacao 2","observacao 3"],
      anomalias:["padrao 1","padrao 2"],
      recomendacoes:["recomendacao 1","recomendacao 2","recomendacao 3"],
      conclusao:"1-2 frases de conclusao"
    },null,2);

  const r = await fetch("https://api.openai.com/v1/chat/completions",{
    method:"POST",
    headers:{"Content-Type":"application/json","Authorization":"Bearer "+apiKey},
    body:JSON.stringify({
      model:"gpt-4o",
      messages:[{role:"user",content:prompt}],
      response_format:{type:"json_object"},
      max_tokens:2500,
      temperature:0.25,
    }),
  });
  if(!r.ok){const e=await r.json().catch(()=>({}));throw new Error(e?.error?.message??"Erro "+r.status+" na API OpenAI");}
  const d=await r.json();
  return JSON.parse(d.choices[0].message.content);
}

function buildReportHTML(res, ai) {
  const pct   = Math.round((res.medicosComDivergencia/res.totalMedicos)*100);
  const rLbl  = pct<10?"BAIXO":pct<25?"MÉDIO":pct<50?"ALTO":"CRÍTICO";
  const rHex  = pct<10?"#10b981":pct<25?"#f59e0b":pct<50?"#f97316":"#ef4444";
  const rRgb  = pct<10?"16,185,129":pct<25?"245,158,11":pct<50?"249,115,22":"239,68,68";
  const sobre = res.divergencias.filter(d=>d.sentido==="rep_maior");
  const sub   = res.divergencias.filter(d=>d.sentido==="prod_maior");
  const vS    = sobre.reduce((s,d)=>s+d.diferencaRaw,0);
  const vU    = sub.reduce((s,d)=>s+d.diferencaRaw,0);
  const gA    = (180-pct*1.8)*Math.PI/180;
  const nx    = +(100+72*Math.cos(gA)).toFixed(1);
  const ny    = +(100-72*Math.sin(gA)).toFixed(1);
  const tf    = {}; res.divergencias.flatMap(d=>d.detalhes.map(p=>p.tipo)).forEach(t=>{tf[t]=(tf[t]||0)+1;});
  const esc   = s=>String(s??"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;");
  const prio  = raw=>raw>500?{l:"ALTA",h:"#ef4444",r:"239,68,68"}:raw>100?{l:"MÉDIA",h:"#f59e0b",r:"245,158,11"}:{l:"BAIXA",h:"#64748b",r:"100,116,139"};
  const PC    = ["#ef4444","#f59e0b","#F47920","#10b981","#2B4AA0","#f97316","#64748b","#ec4899"];
  const pK    = Object.keys(tf);
  const pColS = PC.slice(0,pK.length);
  const chartH= Math.max(280,res.divergencias.length*30);
  const bN    = JSON.stringify(res.divergencias.map(d=>d.medico.length>38?d.medico.slice(0,36)+"…":d.medico));
  const bV    = JSON.stringify(res.divergencias.map(d=>+d.diferencaRaw.toFixed(2)));
  const bBg   = JSON.stringify(res.divergencias.map(d=>d.sentido==="rep_maior"?"rgba(239,68,68,.75)":"rgba(245,158,11,.75)"));
  const bBd   = JSON.stringify(res.divergencias.map(d=>d.sentido==="rep_maior"?"#ef4444":"#f59e0b"));

  const css = `*{box-sizing:border-box;margin:0;padding:0}
:root{--bg:#050d1a;--bg2:#0a1628;--card:#0c1c36;--border:rgba(244,121,32,.2);--b2:rgba(255,255,255,.06);--in:#F47920;--vi:#2B4AA0;--gr:#10b981;--re:#ef4444;--am:#f59e0b;--mu:#64748b;--tx:#f1f5f9;--t2:#94a3b8}
html{scroll-behavior:smooth}
body{font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif;background:var(--bg);background-image:radial-gradient(ellipse 60% 40% at 15% -5%,rgba(244,121,32,.12),transparent 60%),radial-gradient(ellipse 50% 30% at 85% 0%,rgba(139,92,246,.08),transparent 55%);color:var(--tx);line-height:1.6;-webkit-print-color-adjust:exact;print-color-adjust:exact}
.page{max-width:1240px;margin:0 auto;padding:0 28px 64px}
/* HERO */
.hero{background:linear-gradient(160deg,#0f2040 0%,#080d20 70%,var(--bg) 100%);border-bottom:1px solid var(--border);padding:48px 0 44px;margin-bottom:32px}
.hlogo{display:flex;align-items:center;gap:18px;margin-bottom:30px}
.hli{width:72px;height:72px;border-radius:16px;background:transparent;display:flex;align-items:center;justify-content:center;font-size:26px;flex-shrink:0;overflow:hidden}
.hlt{font-size:28px;font-weight:800;letter-spacing:-.02em}
.hls{font-size:14px;color:var(--mu);margin-top:2px}
.hw{display:flex;align-items:flex-start;justify-content:space-between;gap:32px;flex-wrap:wrap}
.ht{font-size:40px;font-weight:900;letter-spacing:-.045em;background:linear-gradient(135deg,#f1f5f9 30%,#8b9ab5);-webkit-background-clip:text;-webkit-text-fill-color:transparent;margin-bottom:8px;line-height:1.1}
.hp{font-size:17px;color:#818cf8;font-weight:700;margin-bottom:18px;letter-spacing:.01em}
.hs{font-size:14.5px;color:var(--t2);max-width:620px;line-height:1.8;margin-bottom:22px}
.hm{display:flex;gap:20px;font-size:12px;color:var(--mu);flex-wrap:wrap}
.rb{padding:11px 24px;border-radius:50px;font-size:13px;font-weight:900;letter-spacing:.1em;white-space:nowrap;flex-shrink:0;margin-top:10px;box-shadow:0 4px 20px rgba(0,0,0,.4)}
/* SECTION */
.s{background:var(--card);border:1px solid var(--border);border-radius:20px;padding:30px;margin-bottom:24px;box-shadow:0 4px 32px rgba(0,0,0,.35)}
.st{font-size:16px;font-weight:700;letter-spacing:-.01em;margin-bottom:5px}
.ss{font-size:12.5px;color:var(--mu);margin-bottom:24px}
/* METRICS */
.mg{display:grid;grid-template-columns:repeat(4,1fr);gap:16px}
.mc{background:rgba(255,255,255,.03);border:1px solid var(--b2);border-radius:16px;padding:22px;position:relative;overflow:hidden;transition:transform .2s}
.mc:hover{transform:translateY(-3px)}
.mc::before{content:"";position:absolute;inset:0;background:linear-gradient(135deg,rgba(255,255,255,.03),transparent);pointer-events:none}
.mi{width:44px;height:44px;border-radius:13px;display:flex;align-items:center;justify-content:center;font-size:20px;margin-bottom:18px}
.mv{font-weight:900;letter-spacing:-.04em;font-family:monospace;margin-bottom:5px}
.ml{font-size:12px;color:var(--mu);font-weight:500}
.mb{height:3px;border-radius:2px;background:rgba(255,255,255,.06);margin-top:18px;overflow:hidden}
.mf{height:100%;border-radius:2px;transition:width 1s ease}
/* DIRECTION */
.dg{display:grid;grid-template-columns:1fr 1fr;gap:20px}
.dc2{border-radius:16px;padding:22px}
.dc2t{font-size:13px;font-weight:800;margin-bottom:6px}
.dc2c{font-size:30px;font-weight:900;font-family:monospace;margin-bottom:5px}
.dc2s{font-size:12px;margin-bottom:16px;opacity:.75}
.di{display:flex;justify-content:space-between;align-items:center;padding:8px 0;border-bottom:1px solid rgba(255,255,255,.05);font-size:12.5px;gap:8px}
.di:last-child{border-bottom:none}
.din{color:var(--t2);flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.div{font-family:monospace;font-weight:800;font-size:12px;white-space:nowrap}
/* GAUGE */
.gw{display:flex;align-items:center;gap:44px;flex-wrap:wrap}
.gs{width:240px;flex-shrink:0}
.gt{flex:1;min-width:220px}
.gp{font-size:54px;font-weight:900;font-family:monospace;letter-spacing:-.04em;line-height:1}
.gl{font-size:13px;font-weight:800;letter-spacing:.12em;margin:6px 0 14px}
.gi{font-size:13.5px;color:var(--t2);line-height:1.75}
.gle{display:flex;gap:14px;margin-top:18px;flex-wrap:wrap}
.gli{display:flex;align-items:center;gap:6px;font-size:11px;color:var(--mu)}
.gld{width:8px;height:8px;border-radius:50%}
/* TABLE */
.tw{overflow-x:auto;margin:0 -2px}
table.mt{width:100%;border-collapse:collapse;min-width:920px}
.mt th{padding:11px 15px;text-align:left;font-size:10.5px;font-weight:700;color:var(--mu);letter-spacing:.07em;text-transform:uppercase;background:rgba(0,0,0,.4);border-bottom:1px solid var(--border)}
.mt td{padding:13px 15px;border-bottom:1px solid rgba(255,255,255,.04);vertical-align:middle}
.tr:hover td{background:rgba(255,255,255,.025)}
.tn{color:var(--mu);font-size:12px;text-align:center;width:36px}
.tm{font-family:monospace;font-size:13px}
.tc{text-align:center;width:60px}
.ta{font-size:12px;color:var(--t2);max-width:185px;line-height:1.4}
.mn{font-weight:700;font-size:13.5px}
.ms{font-size:11px;color:var(--mu);margin-top:2px}
.db{display:inline-flex;padding:3px 10px;border-radius:20px;font-size:11px;font-weight:700;white-space:nowrap}
.dbr{background:rgba(239,68,68,.13);color:#ef4444}
.dbp{background:rgba(245,158,11,.13);color:#f59e0b}
.pb{display:inline-flex;padding:3px 10px;border-radius:20px;font-size:11px;font-weight:700}
/* ACCORDION */
.dc{background:rgba(255,255,255,.025);border:1px solid var(--b2);border-radius:16px;margin-bottom:10px;overflow:hidden;transition:border-color .2s}
.dc:hover{border-color:rgba(244,121,32,.25)}
.ds{list-style:none;cursor:pointer;display:flex;align-items:center;gap:16px;padding:18px 22px;user-select:none;transition:background .15s}
.ds:hover{background:rgba(255,255,255,.03)}
.ds::-webkit-details-marker{display:none}
.dl{display:flex;align-items:center;gap:14px;flex:1;overflow:hidden}
.da{width:44px;height:44px;border-radius:13px;display:flex;align-items:center;justify-content:center;font-size:17px;font-weight:900;flex-shrink:0;letter-spacing:-.02em}
.dn2{font-weight:800;font-size:14.5px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.dsb{font-size:11px;color:var(--mu);margin-top:2px}
.dr2{text-align:right;flex-shrink:0}
.dd2{font-family:monospace;font-weight:900;font-size:16px}
.ddi{font-size:11px;margin-top:2px;opacity:.7}
.dch{color:var(--mu);font-size:15px;flex-shrink:0;transition:transform .25s}
details[open] .dch{transform:rotate(180deg)}
.db2{padding:0 22px 22px}
.dmet{display:grid;grid-template-columns:repeat(3,1fr);gap:12px;margin-bottom:20px}
.dm{border:1px solid;border-radius:13px;padding:16px;background:rgba(0,0,0,.22)}
.dml{font-size:11px;color:var(--mu);margin-bottom:7px}
.dmv{font-family:monospace;font-weight:900;font-size:15px}
.pt{width:100%;border-collapse:collapse}
.pt th{padding:9px 13px;text-align:left;background:rgba(0,0,0,.32);color:var(--mu);font-size:10.5px;font-weight:700;text-transform:uppercase;letter-spacing:.05em}
.ptr td{padding:9px 13px;border-bottom:1px solid rgba(255,255,255,.04);font-size:12.5px}
.ptr:last-child td{border-bottom:none}
.ptr:hover td{background:rgba(255,255,255,.02)}
.tpn{max-width:220px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-weight:500}
.tms{font-family:monospace;font-size:12px}
.tb{display:inline-flex;padding:2px 9px;border-radius:10px;background:rgba(244,121,32,.1);color:#2B4AA0;font-size:11px}
.nd{text-align:center;padding:22px;color:var(--mu);font-size:13px}
/* PATTERNS */
.pl{display:grid;grid-template-columns:280px 1fr;gap:28px;align-items:start}
.pie-c{height:280px}
.pkc{background:rgba(255,255,255,.025);border:1px solid var(--b2);border-radius:14px;padding:18px;margin-bottom:10px}
.pkh{display:flex;align-items:center;gap:10px;margin-bottom:8px}
.pkn{padding:2px 10px;border-radius:10px;font-size:12px;font-weight:900;flex-shrink:0}
.pkt{font-size:13.5px;font-weight:800}
.pktx{font-size:12.5px;color:var(--t2);line-height:1.65;margin-top:6px}
/* ACTION */
.ai2{display:flex;align-items:flex-start;gap:14px;padding:18px;background:rgba(255,255,255,.025);border:1px solid var(--b2);border-radius:16px;margin-bottom:10px;transition:border-color .2s}
.ai2:hover{border-color:rgba(244,121,32,.25)}
.an{width:36px;height:36px;border-radius:11px;display:flex;align-items:center;justify-content:center;font-weight:900;font-size:15px;color:white;flex-shrink:0;box-shadow:0 3px 10px rgba(0,0,0,.3)}
.ab{flex:1;min-width:0}
.at2{font-weight:700;font-size:14px;margin-bottom:8px;line-height:1.5}
.am{font-size:12px;color:var(--mu);line-height:1.9;display:flex;flex-wrap:wrap;gap:4px 16px}
.ub{padding:5px 14px;border-radius:20px;font-size:11px;font-weight:900;letter-spacing:.06em;align-self:flex-start;flex-shrink:0;white-space:nowrap}
/* INSIGHTS */
.ig{display:grid;grid-template-columns:1fr 1fr;gap:24px}
.ict{font-size:12px;font-weight:700;color:var(--mu);letter-spacing:.1em;text-transform:uppercase;margin-bottom:14px;display:flex;align-items:center;gap:6px}
.ii{display:flex;gap:12px;align-items:flex-start;padding:12px 0;border-bottom:1px solid rgba(255,255,255,.05);font-size:13px;color:var(--t2);line-height:1.65}
.ii:last-child{border-bottom:none}
.id2{width:7px;height:7px;border-radius:50%;background:#F47920;margin-top:8px;flex-shrink:0}
.al{display:flex;align-items:flex-start;gap:10px;padding:11px 0;border-bottom:1px solid rgba(255,255,255,.05);font-size:13px;color:var(--t2);line-height:1.65}
.al:last-child{border-bottom:none}
.ai3{color:#ef4444;font-size:15px;flex-shrink:0;margin-top:1px}
.rl{display:flex;align-items:flex-start;gap:10px;padding:11px 0;border-bottom:1px solid rgba(255,255,255,.05);font-size:13px;color:var(--t2);line-height:1.65}
.rl:last-child{border-bottom:none}
.ri{color:#10b981;font-size:15px;flex-shrink:0;margin-top:1px}
.conc{background:linear-gradient(135deg,rgba(244,121,32,.1),rgba(139,92,246,.06));border:1px solid rgba(244,121,32,.25);border-radius:14px;padding:22px;font-size:14px;color:var(--t2);line-height:1.8;margin-top:22px}
.es{color:var(--mu);text-align:center;padding:22px;font-size:13px}
/* FOOTER */
.ftr{border-top:1px solid var(--border);padding:26px 0;display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:14px;font-size:12px;color:var(--mu);margin-top:8px}
.fl{display:flex;align-items:center;gap:8px;font-weight:700;color:var(--t2);font-size:14px}
/* PRINT */
@media print{body{background:#fff;color:#0f172a}.hero{background:#eef2ff!important}.s,.dc,.ai2,.pkc{background:#fff!important;border-color:#e2e8f0!important}.st,.ht,.mn,.dmv,.dd2{color:#0f172a!important}}
@media(max-width:768px){.mg{grid-template-columns:1fr 1fr}.dg,.pl,.ig{grid-template-columns:1fr}.ht{font-size:28px}}`;

  // Fragments
  const mCards = [
    {ic:"👨‍⚕️",val:String(res.totalMedicos),lb:"Médicos analisados",cl:"#F47920",bar:100},
    {ic:"⚠️",val:String(res.medicosComDivergencia),lb:"Com divergência ("+pct+"%)",cl:"#f59e0b",bar:pct},
    {ic:"🔍",val:String(res.totalDivergencias),lb:"Total de divergências",cl:"#ef4444",bar:Math.min(100,Math.round(res.totalDivergencias/(res.totalMedicos*3)*100))},
    {ic:"💰",val:esc(res.valorTotal),lb:"Valor divergente total",cl:"#10b981",bar:100},
  ].map(m=>`<div class="mc"><div class="mi" style="background:${m.cl}22;color:${m.cl}">${m.ic}</div><div class="mv" style="color:${m.cl};font-size:${m.val.length>12?"18px":"26px"}">${m.val}</div><div class="ml">${m.lb}</div><div class="mb"><div class="mf" style="width:${m.bar}%;background:${m.cl}"></div></div></div>`).join("");

  const sL = sobre.map(d=>`<div class="di"><span class="din">${esc(d.medico.length>44?d.medico.slice(0,42)+"…":d.medico)}</span><span class="div" style="color:#ef4444">↑Rep ${esc(d.diferenca)}</span></div>`).join()||'<div class="di" style="color:var(--mu)">Nenhum caso</div>';
  const uL = sub.map(d=>`<div class="di"><span class="din">${esc(d.medico.length>44?d.medico.slice(0,42)+"…":d.medico)}</span><span class="div" style="color:#f59e0b">↑Prod ${esc(d.diferenca)}</span></div>`).join()||'<div class="di" style="color:var(--mu)">Nenhum caso</div>';

  const tR = res.divergencias.map((d,i)=>{
    const ir=d.sentido==="rep_maior"; const p=prio(d.diferencaRaw);
    return `<tr class="tr"><td class="tn">${i+1}</td><td><div class="mn">${esc(d.medico)}</div>${d.detalhes.length?`<div class="ms">${d.detalhes.length} pac. divergente${d.detalhes.length!==1?"s":""}</div>`:""}</td><td class="tm">${esc(d.producao)}</td><td class="tm">${esc(d.repasse)}</td><td class="tm" style="font-weight:700;color:${ir?"#ef4444":"#f59e0b"}">${ir?"↑Rep":"↑Prod"} ${esc(d.diferenca)}</td><td><span class="db ${ir?"dbr":"dbp"}">${ir?"Rep > Prod":"Prod > Rep"}</span></td><td class="tc">${d.detalhes.length||"—"}</td><td><span class="pb" style="background:rgba(${p.r},.13);color:${p.h}">${p.l}</span></td><td class="ta">${ir?"Revisar lançamentos no repasse":"Verificar ausências no repasse"}</td></tr>`;
  }).join("");

  const dCards = res.divergencias.map(d=>{
    const ir=d.sentido==="rep_maior"; const dH=ir?"#ef4444":"#f59e0b"; const dR=ir?"239,68,68":"245,158,11";
    const pR=d.detalhes.map(p=>`<tr class="ptr"><td class="tpn">${esc(p.paciente)}</td><td class="tms">${esc(p.producao)}</td><td class="tms">${esc(p.repasse)}</td><td class="tms" style="color:${dH};font-weight:700">${esc(p.diferenca)}</td><td><span class="tb">${esc(p.tipo)}</span></td></tr>`).join("");
    return `<details class="dc"><summary class="ds"><div class="dl"><div class="da" style="background:rgba(${dR},.18);color:${dH}">${esc(d.medico.charAt(0))}</div><div><div class="dn2">${esc(d.medico)}</div><div class="dsb">${d.detalhes.length} paciente${d.detalhes.length!==1?"s":""} divergente${d.detalhes.length!==1?"s":""}</div></div></div><div class="dr2"><div class="dd2" style="color:${dH}">${ir?"↑Rep":"↑Prod"} ${esc(d.diferenca)}</div><div class="ddi" style="color:${dH}">${ir?"repasse maior":"produção maior"}</div></div><span class="dch">▾</span></summary><div class="db2"><div class="dmet"><div class="dm" style="border-color:rgba(244,121,32,.3)"><div class="dml">Produção</div><div class="dmv" style="color:#F47920">${esc(d.producao)}</div></div><div class="dm" style="border-color:rgba(16,185,129,.3)"><div class="dml">Repasse</div><div class="dmv" style="color:#10b981">${esc(d.repasse)}</div></div><div class="dm" style="border-color:rgba(${dR},.3)"><div class="dml">Diferença</div><div class="dmv" style="color:${dH}">${esc(d.diferenca)}</div></div></div>${d.detalhes.length?`<div style="overflow-x:auto"><table class="pt"><thead><tr><th>Paciente</th><th>Produção</th><th>Repasse</th><th>Diferença</th><th>Tipo</th></tr></thead><tbody>${pR}</tbody></table></div>`:'<div class="nd">Comparação por paciente não disponível.</div>'}</div></details>`;
  }).join("");

  const aItems = (ai.planoDeAcao||[]).map((it,i)=>{
    const u=it.urgencia==="alta"?{h:"#ef4444",r:"239,68,68"}:it.urgencia==="media"?{h:"#f59e0b",r:"245,158,11"}:{h:"#64748b",r:"100,116,139"};
    return `<div class="ai2"><div class="an" style="background:${u.h}">${i+1}</div><div class="ab"><div class="at2">${esc(it.acao)}</div><div class="am"><span>⏱ ${esc(it.prazo)}</span><span>👤 ${esc(it.responsavel)}</span><span>📈 ${esc(it.impacto)}</span></div></div><span class="ub" style="background:rgba(${u.r},.13);color:${u.h}">${(it.urgencia||"").toUpperCase()}</span></div>`;
  }).join()||'<div class="es">Não disponível.</div>';

  const patCards = pK.map((t,i)=>{
    const fd=(ai.analisesPorTipo||[]).find(a=>a.tipo===t)||{}; const c=PC[i%PC.length];
    return `<div class="pkc"><div class="pkh"><span class="pkn" style="background:${c}22;color:${c}">${tf[t]}×</span><strong class="pkt">${esc(t)}</strong></div>${fd.interpretacao?`<p class="pktx"><strong>Significado:</strong> ${esc(fd.interpretacao)}</p>`:""}${fd.prevencao?`<p class="pktx"><strong>Prevenção:</strong> ${esc(fd.prevencao)}</p>`:""}</div>`;
  }).join("");

  const iList = (ai.insights||[]).map(s=>`<div class="ii"><div class="id2"></div>${esc(s)}</div>`).join()||'<div class="es">Não disponível.</div>';
  const aList = (ai.anomalias||[]).map(s=>`<div class="al"><span class="ai3">⚠</span>${esc(s)}</div>`).join()||'<div class="es">Não disponível.</div>';
  const rList = (ai.recomendacoes||[]).map(s=>`<div class="rl"><span class="ri">✓</span>${esc(s)}</div>`).join()||'<div class="es">Não disponível.</div>';

  const pieD = JSON.stringify(Object.values(tf));

  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1.0">
<title>Auditoria Médica — ${esc(res.referencia)}</title>
<script src="https://cdn.jsdelivr.net/npm/chart.js@4/dist/chart.umd.min.js"><\/script>
<style>${css}</style>
</head>
<body>
<div class="hero"><div class="page">
<div class="hlogo"><div class="hli"><img src="https://postimg.cc/ygp5Y8dY" alt="ConSaúde" style="width:100%;height:100%;object-fit:contain"></div><div><div class="hlt">ConSaude</div><div class="hls">Sistema de Auditoria Médica</div></div></div>
<div class="hw">
<div>
  <div class="hp">Referência: ${esc(res.referencia)}</div>
  <h1 class="ht">Relatório de Auditoria</h1>
  <p class="hs">${esc(ai.resumoExecutivo||"Auditoria de produção médica concluída com sucesso.")}</p>
  <div class="hm"><span>📅 ${esc(res.processadoEm)}</span><span>📁 ${esc(res.file1Name)} × ${esc(res.file2Name)}</span></div>
</div>
<div class="rb" style="background:rgba(${rRgb},.15);color:${rHex};border:1.5px solid rgba(${rRgb},.35)">RISCO ${rLbl}</div>
</div>
</div></div>

<div class="page">

<div class="s"><div class="st">Dashboard Executivo</div><div class="ss">Visão geral — ${esc(res.referencia)}</div><div class="mg">${mCards}</div></div>

<div class="s"><div class="st">Análise Direcional</div><div class="ss">Distribuição do risco por tipo de desvio financeiro</div>
<div class="dg">
<div class="dc2" style="background:rgba(239,68,68,.07);border:1px solid rgba(239,68,68,.25)">
  <div class="dc2t" style="color:#ef4444">🔴 Repasse &gt; Produção</div>
  <div class="dc2c" style="color:#ef4444">${brl(vS)}</div>
  <div class="dc2s" style="color:rgba(239,68,68,.8)">${sobre.length} médico${sobre.length!==1?"s":""} — risco de sobrepagamento</div>
  ${sL}
</div>
<div class="dc2" style="background:rgba(245,158,11,.07);border:1px solid rgba(245,158,11,.25)">
  <div class="dc2t" style="color:#f59e0b">🟡 Produção &gt; Repasse</div>
  <div class="dc2c" style="color:#f59e0b">${brl(vU)}</div>
  <div class="dc2s" style="color:rgba(245,158,11,.8)">${sub.length} médico${sub.length!==1?"s":""} — risco de subpagamento</div>
  ${uL}
</div>
</div></div>

<div class="s"><div class="st">Medidor de Risco</div><div class="ss">${esc(ai.interpretacaoRisco||"Percentual de médicos com divergências de faturamento.")}</div>
<div class="gw">
<svg class="gs" viewBox="0 0 200 110">
  <path d="M 16 100 A 84 84 0 0 1 184 100" fill="none" stroke="rgba(255,255,255,.06)" stroke-width="14" stroke-linecap="round"/>
  <path d="M 16 100 A 84 84 0 0 1 76 19.3" fill="none" stroke="#10b981" stroke-width="14" stroke-linecap="round" opacity=".9"/>
  <path d="M 76 19.3 A 84 84 0 0 1 124 19.3" fill="none" stroke="#f59e0b" stroke-width="14" opacity=".9"/>
  <path d="M 124 19.3 A 84 84 0 0 1 184 100" fill="none" stroke="${rHex}" stroke-width="14" stroke-linecap="round" opacity=".9"/>
  <line x1="100" y1="100" x2="${nx}" y2="${ny}" stroke="white" stroke-width="3" stroke-linecap="round"/>
  <circle cx="100" cy="100" r="6" fill="${rHex}" stroke="rgba(0,0,0,.3)" stroke-width="1"/>
  <circle cx="100" cy="100" r="3" fill="white"/>
  <text x="100" y="84" text-anchor="middle" font-size="20" font-weight="900" fill="${rHex}" font-family="monospace">${pct}%</text>
</svg>
<div class="gt">
  <div class="gp" style="color:${rHex}">${pct}%</div>
  <div class="gl" style="color:${rHex}">RISCO ${rLbl}</div>
  <p class="gi">${esc(ai.interpretacaoRisco||"Percentual de médicos com divergências identificadas na auditoria.")}</p>
  <div class="gle">
    <div class="gli"><div class="gld" style="background:#10b981"></div>Baixo (&lt;10%)</div>
    <div class="gli"><div class="gld" style="background:#f59e0b"></div>Médio (10–25%)</div>
    <div class="gli"><div class="gld" style="background:#f97316"></div>Alto (25–50%)</div>
    <div class="gli"><div class="gld" style="background:#ef4444"></div>Crítico (&gt;50%)</div>
  </div>
</div>
</div></div>

<div class="s"><div class="st">Valor Divergente por Médico</div>
<div class="ss" style="display:flex;gap:16px;flex-wrap:wrap"><span style="display:inline-flex;align-items:center;gap:5px"><span style="width:10px;height:10px;border-radius:3px;background:#ef4444;display:inline-block"></span>Repasse &gt; Produção</span><span style="display:inline-flex;align-items:center;gap:5px"><span style="width:10px;height:10px;border-radius:3px;background:#f59e0b;display:inline-block"></span>Produção &gt; Repasse</span></div>
<div style="position:relative;height:${chartH}px"><canvas id="bc"></canvas></div></div>

<div class="s">
<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:22px;flex-wrap:wrap;gap:12px">
  <div><div class="st">Tabela de Prioridades</div><div class="ss" style="margin-bottom:0">${res.medicosComDivergencia} médico${res.medicosComDivergencia!==1?"s":""} — ordenado${res.medicosComDivergencia!==1?"s":""} por valor</div></div>
  <div style="display:flex;gap:8px;flex-wrap:wrap">
    <span class="pb" style="background:rgba(239,68,68,.13);color:#ef4444">Alta &gt;R$500</span>
    <span class="pb" style="background:rgba(245,158,11,.13);color:#f59e0b">Média R$100–500</span>
    <span class="pb" style="background:rgba(100,116,139,.13);color:#64748b">Baixa &lt;R$100</span>
  </div>
</div>
<div class="tw"><table class="mt">
<thead><tr><th style="text-align:center">#</th><th>Médico</th><th>Produção</th><th>Repasse</th><th>Diferença</th><th>Direção</th><th style="text-align:center">Pac.</th><th>Prioridade</th><th>Ação Recomendada</th></tr></thead>
<tbody>${tR}</tbody>
</table></div></div>

<div class="s"><div class="st">Detalhamento por Médico</div><div class="ss">Clique para expandir — análise por paciente</div>${dCards}</div>

<div class="s"><div class="st">Análise de Padrões</div><div class="ss">Distribuição e interpretação dos tipos de divergência encontrados</div>
<div class="pl">
<div class="pie-c"><canvas id="pc"></canvas></div>
<div>${patCards}</div>
</div></div>

<div class="s"><div class="st">Plano de Ação Imediata</div><div class="ss">Ações concretas ordenadas por urgência</div>${aItems}</div>

<div class="s"><div class="st">Insights &amp; Recomendações</div><div class="ss">Análise gerada por IA com base nos dados desta auditoria</div>
<div class="ig">
<div><div class="ict">💡 Insights</div>${iList}</div>
<div><div class="ict">⚠ Anomalias Detectadas</div>${aList}</div>
</div>
<div style="margin-top:22px"><div class="ict">✅ Recomendações de Processo</div>${rList}</div>
${ai.conclusao?'<div class="conc">📋 <strong>Conclusão:</strong> '+esc(ai.conclusao)+'</div>':""}
</div>

<div class="ftr"><div class="fl">⚕ ConSaude Auditoria Médica</div><div>Gerado em ${esc(res.processadoEm)} · v1.0</div><div style="text-align:right">Uso interno e confidencial</div></div>

</div>
<script>
(function(){
Chart.defaults.color="rgba(148,163,184,.8)";
Chart.defaults.borderColor="rgba(255,255,255,.06)";
Chart.defaults.font.family="-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif";
new Chart(document.getElementById("bc").getContext("2d"),{
  type:"bar",
  data:{labels:${bN},datasets:[{data:${bV},backgroundColor:${bBg},borderColor:${bBd},borderWidth:1,borderRadius:5,borderSkipped:false}]},
  options:{indexAxis:"y",responsive:true,maintainAspectRatio:false,plugins:{legend:{display:false},tooltip:{callbacks:{label:function(c){return" R$ "+c.parsed.x.toLocaleString("pt-BR",{minimumFractionDigits:2});}}}},scales:{x:{beginAtZero:true,grid:{color:"rgba(255,255,255,.05)"},ticks:{callback:function(v){return"R$ "+v.toLocaleString("pt-BR");}}},y:{grid:{display:false},ticks:{font:{size:11}}}}}
});
new Chart(document.getElementById("pc").getContext("2d"),{
  type:"doughnut",
  data:{labels:${JSON.stringify(pK)},datasets:[{data:${pieD},backgroundColor:${JSON.stringify(pColS)},borderColor:"rgba(5,13,26,.85)",borderWidth:3,hoverOffset:10}]},
  options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{position:"bottom",labels:{padding:14,boxWidth:12,font:{size:11}}},tooltip:{callbacks:{label:function(c){var t=c.dataset.data.reduce(function(a,b){return a+b;},0);return" "+c.label+": "+c.parsed+" ("+Math.round(c.parsed/t*100)+"%)";}}}}  ,cutout:"65%"}
});
})();
<\/script>
</body>
</html>`;
}

async function generateAIReport(resultados) {
  const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
  if (!apiKey || apiKey.includes("cole_sua")) {
    throw new Error("Configure VITE_OPENAI_API_KEY no arquivo .env com sua chave da OpenAI.");
  }
  const ai = await fetchAIAnalysis(resultados, apiKey);
  return buildReportHTML(resultados, ai);
}


// ─── THEMES ───────────────────────────────────────────────────────────────────
// ConSaúde brand: Orange #F47920 · Navy #1A2B6B
const themes = {
  dark: {
    root:    { background: "#080e18", color: "#f1f5f9" },
    sidebar: { background: "#0b1120" },
    header:  { background: "rgba(8,14,24,0.88)" },
    card:    { background: "#0f1828" },
    border:  "#1a2b4a",
    text:    "#f1f5f9",
    muted:   "#64748b",
  },
  light: {
    root:    { background: "#f5f7fa", color: "#0f172a" },
    sidebar: { background: "#ffffff" },
    header:  { background: "rgba(255,255,255,0.93)" },
    card:    { background: "#ffffff" },
    border:  "#e8edf2",
    text:    "#0f172a",
    muted:   "#8B8D8F",
  },
};

// ─── TIPO COLORS ──────────────────────────────────────────────────────────────
const TIPO_COLORS = {
  "Ausente na Produção":              { bg: "#2B4AA015", color: "#2B4AA0" },
  "Ausente no Repasse":               { bg: "#f59e0b15", color: "#d97706" },
  "Quantidade de lançamentos diferente": { bg: "#3b82f615", color: "#3b82f6" },
  "Maior na Produção":                { bg: "#10b98115", color: "#10b981" },
  "Maior no Repasse":                 { bg: "#ef444415", color: "#ef4444" },
  "Diferença de centavos":            { bg: "#64748b15", color: "#64748b" },
};
const tipoStyle = (tipo) => TIPO_COLORS[tipo] ?? { bg: "#ef444415", color: "#ef4444" };

function getNavItems(role) {
  return [
    { id: "upload",        label: "Dashboard",     icon: ICONS.dashboard },
    { id: "audits",        label: "Auditorias",    icon: ICONS.audit },
    { id: "history",       label: "Histórico",     icon: ICONS.history },
    ...(role === 'admin' ? [{ id: "users", label: "Usuários", icon: ICONS.users }] : []),
    { id: "settings-page", label: "Configurações", icon: ICONS.settings },
  ];
}

// ─── APP ──────────────────────────────────────────────────────────────────────
export default function App() {
  const [currentUser,   setCurrentUser]   = useState(null);
  const [authReady,     setAuthReady]     = useState(false);
  const [dark,          setDark]          = useState(true);
  const [sidebarOpen,   setSidebarOpen]   = useState(true);
  const [activePage,    setActivePage]    = useState("upload");
  const [file1,         setFile1]         = useState(null);
  const [file2,         setFile2]         = useState(null);
  const [drag1,         setDrag1]         = useState(false);
  const [drag2,         setDrag2]         = useState(false);
  const [processing,    setProcessing]    = useState(false);
  const [progress,      setProgress]      = useState(0);
  const [steps,         setSteps]         = useState([false,false,false,false,false,false]);
  const [advancedOpen,  setAdvancedOpen]  = useState(false);
  const [selectedMedico,setSelectedMedico]= useState(null);
  const [configs,       setConfigs]       = useState({ ignorar: true, comparaNome: true, comparaCodigo: false, ia: true });
  const [profileOpen,   setProfileOpen]   = useState(false);
  const [resultados,    setResultados]    = useState(null);
  const [historico,     setHistorico]     = useState([]);
  const [uploadError,   setUploadError]   = useState(null);
  const [periodoAuditoria, setPeriodoAuditoria] = useState('');
  const [statuses,      setStatuses]      = useState({});
  const [cols1,         setCols1]         = useState(null);
  const [cols2,         setCols2]         = useState(null);
  const [aiLoading,     setAiLoading]     = useState(false);
  const [aiError,       setAiError]       = useState(null);
  const profileRef   = useRef(null);
  const parsedCache  = useRef({ prod: null, rep: null });

  // Auth: a sessão é resolvida pelo Firebase. O perfil (papel admin/user) vem do
  // Firestore a cada carregamento — não há estado de autenticação no navegador
  // em que dê para confiar, nem para forjar.
  useEffect(() => {
    if (!firebaseReady) { setAuthReady(true); return; }
    return observarSessao((user) => {
      setCurrentUser(user);
      setAuthReady(true);
    });
  }, []);

  const handleLogin = (user) => setCurrentUser(user);

  const handleLogout = async () => {
    try { await logout(); } catch { /* segue com a limpeza local */ }
    setCurrentUser(null);
    setActivePage("upload");
    setResultados(null);
    setHistorico([]);
    setFile1(null);
    setFile2(null);
  };

  const handleUpdateUser = (updated) => {
    setCurrentUser(updated);
  };

  // Carregar histórico do localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem("audit-hist");
      if (saved) setHistorico(JSON.parse(saved));
    } catch (_) {}
  }, []);

  // Fechar dropdown de perfil ao clicar fora
  useEffect(() => {
    const h = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) setProfileOpen(false);
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  // Preview de colunas + cache de linhas ao selecionar arquivo
  useEffect(() => {
    if (!file1) { setCols1(null); parsedCache.current.prod = null; return; }
    parseExcel(file1)
      .then((rows) => { parsedCache.current.prod = rows; setCols1(detectColumns(rows)); })
      .catch(() => { setCols1(null); parsedCache.current.prod = null; });
  }, [file1]);

  useEffect(() => {
    if (!file2) { setCols2(null); parsedCache.current.rep = null; return; }
    parseExcel(file2)
      .then((rows) => { parsedCache.current.rep = rows; setCols2(detectColumns(rows)); })
      .catch(() => { setCols2(null); parsedCache.current.rep = null; });
  }, [file2]);

  const step = (i, p) => {
    setSteps((s) => { const n = [...s]; n[i] = true; return n; });
    setProgress(p);
  };

  const startAudit = async () => {
    if (!file1 || !file2) return;
    setProcessing(true);
    setProgress(0);
    setSteps([false, false, false, false, false, false]);
    setUploadError(null);
    setStatuses({});

    try {
      // Etapa 1: Leitura dos arquivos (reaproveitando cache do preview quando disponível)
      step(0, 16);
      const [prodRows, repRows] = await Promise.all([
        parsedCache.current.prod ? Promise.resolve(parsedCache.current.prod) : parseExcel(file1),
        parsedCache.current.rep  ? Promise.resolve(parsedCache.current.rep)  : parseExcel(file2),
      ]);

      // Etapa 2: Identificação das colunas
      const pCols = detectColumns(prodRows);
      const rCols = detectColumns(repRows);
      const prodErrors = validateFile(prodRows, pCols);
      const repErrors  = validateFile(repRows, rCols);
      step(1, 32);

      if (prodErrors.length || repErrors.length) {
        setProcessing(false);
        setUploadError({ prod: prodErrors, rep: repErrors });
        setActivePage("upload");
        return;
      }

      // Etapa 3: Comparação por médico
      const prodPorMed = groupBy(prodRows, pCols.medicoCol);
      const repPorMed  = groupBy(repRows,  rCols.medicoCol);
      const allMeds    = new Set([...Object.keys(prodPorMed), ...Object.keys(repPorMed)]);
      step(2, 50);

      // Etapa 4: Identificação de divergências
      const divs = [];
      for (const med of allMeds) {
        const pr   = prodPorMed[med] ?? [];
        const rr   = repPorMed[med]  ?? [];
        const tp   = sumVals(pr, pCols.valorCol);
        const tr   = sumVals(rr, rCols.valorCol);
        const diff = tp - tr;
        const threshold = configs.ignorar ? 0.01 : 0;
        if (Math.abs(diff) < threshold) continue;

        const detalhes = configs.comparaNome ? comparePatients(pr, rr, pCols, rCols) : [];
        // diff > 0 → Produção maior (médico subpago); diff < 0 → Repasse maior (possível sobrepagamento)
        divs.push({
          id:           med,
          medico:       med,
          crm:          "",
          producao:     brl(tp),
          repasse:      brl(tr),
          diferenca:    brl(Math.abs(diff)),
          diferencaRaw: Math.abs(diff),
          diferencaSigned: diff,
          sentido:      diff > 0 ? "prod_maior" : "rep_maior",
          status:       "pendente",
          detalhes,
        });
      }
      divs.sort((a, b) => b.diferencaRaw - a.diferencaRaw);
      step(3, 66);

      await new Promise((r) => setTimeout(r, 150));

      // Etapa 5: Geração do relatório
      const valorTotal  = divs.reduce((s, d) => s + d.diferencaRaw, 0);
      const totalDivs   = divs.reduce((s, d) => s + (d.detalhes.length || (d.diferencaRaw > 0 ? 1 : 0)), 0);
      step(4, 83);

      // Etapa 6: Insights com IA
      const insights = configs.ia ? generateInsights(divs, allMeds.size, valorTotal) : [];
      step(5, 100);
      await new Promise((r) => setTimeout(r, 350));

      const entryId = Date.now();
      const res = {
        totalMedicos:           allMeds.size,
        medicosComDivergencia:  divs.length,
        totalDivergencias:      totalDivs,
        valorTotal:             brl(valorTotal),
        valorTotalRaw:          valorTotal,
        divergencias:           divs,
        insights,
        processadoEm: new Date().toLocaleString("pt-BR"),
        referencia:   periodoAuditoria.trim() || extractReferencia(prodRows) || new Date().toLocaleDateString("pt-BR", { month: "long", year: "numeric" }),
        file1Name:    file1.name,
        file2Name:    file2.name,
      };
      setResultados({ ...res, _histId: entryId });

      const entry = {
        id:          entryId,
        data:        new Date().toLocaleDateString("pt-BR"),
        periodo:     res.referencia,
        arquivos:    `${file1.name} / ${file2.name}`,
        divergencias: divs.length,
        valor:       res.valorTotal,
        resultados:  res,
        userId:      currentUser?.id,
        userName:    currentUser?.name,
      };
      const hist = [entry, ...historico].slice(0, 50);
      setHistorico(hist);
      try { localStorage.setItem("audit-hist", JSON.stringify(hist)); } catch (_) {}
      setPeriodoAuditoria('');

      setProcessing(false);
      setActivePage("results");
    } catch (err) {
      setProcessing(false);
      setUploadError({ geral: `Erro ao processar: ${err.message}` });
      setActivePage("upload");
    }
  };

  const VALID_EXT = ["xlsx", "xls", "csv"];

  const handleFileSelect = (file, setter) => {
    if (!file) return;
    const ext = file.name.split(".").pop().toLowerCase();
    if (!VALID_EXT.includes(ext)) {
      setUploadError({ geral: `Formato inválido: ".${ext}". Use .xlsx, .xls ou .csv.` });
      return;
    }
    if (file.size > 50 * 1024 * 1024) {
      setUploadError({ geral: "Arquivo muito grande. Limite de 50 MB por arquivo." });
      return;
    }
    setUploadError(null);
    setter(file);
  };

  const handleFileDrop = (e, setter) => {
    e.preventDefault();
    const f = e.dataTransfer.files[0];
    if (f) handleFileSelect(f, setter);
  };

  const handleGenerateAIReport = async () => {
    if (!resultados) return;
    setAiLoading(true);
    setAiError(null);
    try {
      const html = await generateAIReport(resultados);
      const blob = new Blob([html], { type: "text/html;charset=utf-8" });
      const url  = URL.createObjectURL(blob);
      window.open(url, "_blank");
      const a = document.createElement("a");
      a.href = url;
      a.download = `relatorio-ia-${new Date().toISOString().slice(0, 10)}.html`;
      a.click();
      setTimeout(() => URL.revokeObjectURL(url), 5000);
      // Salva o HTML no registro do histórico para acesso futuro
      if (resultados._histId) {
        const updatedHist = historico.map(e =>
          e.id === resultados._histId ? { ...e, aiReportHTML: html } : e
        );
        setHistorico(updatedHist);
        try { localStorage.setItem("audit-hist", JSON.stringify(updatedHist)); } catch (_) {}
      }
    } catch (err) {
      setAiError(err.message);
    } finally {
      setAiLoading(false);
    }
  };

  const handleDeleteAudit = (id) => {
    const updatedHist = historico.filter(e => e.id !== id);
    setHistorico(updatedHist);
    try { localStorage.setItem("audit-hist", JSON.stringify(updatedHist)); } catch (_) {}
  };

  const t = dark ? themes.dark : themes.light;
  const navItems = getNavItems(currentUser?.role);
  const historicoFiltrado = currentUser?.role === 'admin'
    ? historico
    : historico.filter(h => h.userId === currentUser?.id);

  if (!firebaseReady) return <FirebaseSetupScreen />;
  if (!authReady) return <div style={{ minHeight: '100vh', background: '#080e18' }} />;
  if (!currentUser) return <LoginScreen onLogin={handleLogin} dark={dark} />;
  if (currentUser.mustChangePassword) {
    return <ForcePasswordChangeScreen user={currentUser} onDone={handleUpdateUser} onLogout={handleLogout} />;
  }

  return (
    <div style={{ ...t.root, minHeight: "100vh", display: "flex", fontFamily: "'DM Sans','Segoe UI',sans-serif", transition: "all 0.3s ease" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=DM+Mono:wght@400;500&display=swap');
        *{box-sizing:border-box;margin:0;padding:0}
        ::-webkit-scrollbar{width:6px;height:6px}
        ::-webkit-scrollbar-track{background:transparent}
        ::-webkit-scrollbar-thumb{background:${dark?"#334155":"#cbd5e1"};border-radius:3px}
        .nav-item{transition:all .2s ease;cursor:pointer;border-radius:10px}
        .nav-item:hover{background:${dark?"rgba(244,121,32,.15)":"rgba(244,121,32,.08)"}}
        .nav-item.active{background:${dark?"rgba(244,121,32,.2)":"rgba(244,121,32,.12)"}}
        .btn-primary{transition:all .2s ease;cursor:pointer}
        .btn-primary:hover{transform:translateY(-1px);box-shadow:0 8px 25px rgba(244,121,32,.45)!important}
        .btn-primary:active{transform:translateY(0)}
        .card-hover{transition:all .2s ease}
        .card-hover:hover{transform:translateY(-2px)}
        .upload-area{transition:all .2s ease;cursor:pointer}
        .upload-area:hover{border-color:#F47920!important;background:${dark?"rgba(244,121,32,.08)":"rgba(244,121,32,.04)"}!important}
        .spin{animation:spin 1s linear infinite}
        @keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}
        @keyframes fadeIn{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}
        .fade-in{animation:fadeIn .4s ease forwards}
        .progress-bar{transition:width .5s ease}
        .step-item{transition:all .3s ease}
        .badge{display:inline-flex;align-items:center;padding:2px 10px;border-radius:20px;font-size:11px;font-weight:600;letter-spacing:.03em}
        .btn-sm{transition:all .15s ease;cursor:pointer}
        .btn-sm:hover{opacity:.8}
        .metric-card{transition:all .2s ease}
        .metric-card:hover{transform:translateY(-3px)}
        .table-row{transition:background .15s ease}
        .table-row:hover{background:${dark?"rgba(255,255,255,.03)":"rgba(0,0,0,.02)"}!important}
        .drawer-overlay{position:fixed;inset:0;background:rgba(0,0,0,.5);backdrop-filter:blur(4px);z-index:100;animation:fadeIn .2s ease}
        .drawer{position:fixed;right:0;top:0;bottom:0;width:520px;max-width:95vw;z-index:101;animation:slideIn .3s ease;overflow-y:auto}
        @keyframes slideIn{from{transform:translateX(100%)}to{transform:translateX(0)}}
        .toggle-btn{transition:all .2s ease;cursor:pointer}
        .toggle-btn:hover{opacity:.8}
        .ai-card{position:relative;overflow:hidden}
        .ai-card::before{content:'';position:absolute;inset:0;background:linear-gradient(135deg,rgba(244,121,32,.08) 0%,rgba(43,74,160,.08) 100%);pointer-events:none}
        .checkbox-custom{width:18px;height:18px;border-radius:5px;border:2px solid ${dark?"#475569":"#cbd5e1"};display:flex;align-items:center;justify-content:center;flex-shrink:0;transition:all .15s ease;cursor:pointer}
        .checkbox-custom.checked{background:#F47920;border-color:#F47920}
        @media(max-width:768px){
          .sidebar{transform:translateX(-100%);position:fixed!important;z-index:200;transition:transform .3s ease!important}
          .sidebar.open{transform:translateX(0)!important}
          .main-content{margin-left:0!important}
          .drawer{width:100vw!important}
        }
        .sidebar-mobile-overlay{display:none}
        @media(max-width:768px){
          .sidebar-mobile-overlay.show{display:block;position:fixed;inset:0;background:rgba(0,0,0,.5);z-index:199}
        }
        .error-box{border-left:3px solid #ef4444;background:#ef444410;border-radius:8px;padding:12px 16px}
        .col-tag{display:inline-flex;align-items:center;gap:4px;padding:3px 8px;border-radius:6px;font-size:10px;font-weight:600;background:${dark?"rgba(244,121,32,.15)":"rgba(244,121,32,.1)"};color:#F47920;margin:2px}
        @keyframes aiPulse{0%,100%{opacity:.6;transform:scale(1)}50%{opacity:1;transform:scale(1.03)}}
        .ai-loading-dot{display:inline-block;width:8px;height:8px;border-radius:50%;background:#F47920;animation:aiPulse 1.2s ease infinite}
        .ai-loading-dot:nth-child(2){animation-delay:.2s}
        .ai-loading-dot:nth-child(3){animation-delay:.4s}
      `}</style>

      {/* Overlay de geração de relatório com IA */}
      {aiLoading && (
        <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,.75)", backdropFilter:"blur(8px)", zIndex:300, display:"flex", alignItems:"center", justifyContent:"center" }}>
          <div style={{ background:"#0e1a30", border:"1px solid #1e2c5e", borderRadius:24, padding:"48px 56px", maxWidth:480, width:"90%", textAlign:"center", boxShadow:"0 30px 80px rgba(0,0,0,.5)" }}>
            <div style={{ width:72, height:72, borderRadius:22, background:"linear-gradient(135deg,#F47920,#a78bfa)", display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 28px", boxShadow:"0 10px 30px rgba(244,121,32,.5)" }}>
              {ICONS.brain}
            </div>
            <h2 style={{ fontSize:22, fontWeight:700, color:"#f1f5f9", letterSpacing:"-.03em", marginBottom:8 }}>Gerando Relatório com IA</h2>
            <p style={{ fontSize:13, color:"#64748b", marginBottom:32, lineHeight:1.6 }}>
              O modelo está analisando todas as divergências e redigindo<br/>um relatório executivo completo. Isso leva cerca de 30 segundos.
            </p>
            <div style={{ display:"flex", justifyContent:"center", gap:8, marginBottom:32 }}>
              <span className="ai-loading-dot" />
              <span className="ai-loading-dot" />
              <span className="ai-loading-dot" />
            </div>
            <div style={{ display:"flex", flexDirection:"column", gap:10, textAlign:"left" }}>
              {[
                "Analisando divergências por médico...",
                "Identificando padrões de risco financeiro...",
                "Calculando impacto por tipo de erro...",
                "Redigindo plano de ação prioritário...",
                "Formatando relatório HTML estilizado...",
              ].map((txt, i) => (
                <div key={i} style={{ display:"flex", alignItems:"center", gap:10, color:"#94a3b8", fontSize:12.5 }}>
                  <div style={{ width:6, height:6, borderRadius:"50%", background:"#F47920", flexShrink:0 }} />
                  {txt}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Erro de geração IA */}
      {aiError && (
        <div style={{ position:"fixed", bottom:24, right:24, zIndex:250, background:"#1e1e2e", border:"1px solid #ef444440", borderRadius:14, padding:"16px 20px", maxWidth:420, boxShadow:"0 8px 30px rgba(0,0,0,.4)", display:"flex", gap:14, alignItems:"flex-start" }}>
          <span style={{ color:"#ef4444", flexShrink:0, marginTop:2 }}>{ICONS.warning}</span>
          <div style={{ flex:1 }}>
            <div style={{ fontSize:13, fontWeight:600, color:"#f1f5f9", marginBottom:4 }}>Erro ao gerar relatório IA</div>
            <div style={{ fontSize:12, color:"#94a3b8", lineHeight:1.5 }}>{aiError}</div>
          </div>
          <button onClick={() => setAiError(null)} style={{ background:"none", border:"none", color:"#64748b", cursor:"pointer", padding:2 }}>{ICONS.x}</button>
        </div>
      )}

      {/* Sidebar */}
      <aside className={`sidebar ${sidebarOpen?"open":""}`} style={{
        width: sidebarOpen ? 240 : 72, ...t.sidebar,
        height:"100vh", position:"fixed", left:0, top:0, bottom:0,
        transition:"width .3s ease,background .3s ease",
        display:"flex", flexDirection:"column", zIndex:50,
        borderRight:`1px solid ${t.border}`,
      }}>
        <div style={{ padding:"20px 16px", borderBottom:`1px solid ${t.border}`, display:"flex", alignItems:"center", gap:12, minHeight:72 }}>
          <div style={{ width:38, height:38, borderRadius:8, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0, overflow:"hidden" }}>
            <img src="/public/logo.png" alt="ConSaúde" style={{ width:"100%", height:"100%", objectFit:"contain" }} />
          </div>
          {sidebarOpen && (
            <div style={{ overflow:"hidden" }}>
              <div style={{ fontSize:14, fontWeight:800, letterSpacing:"-.02em", whiteSpace:"nowrap" }}>
                <span style={{ color:"#F47920" }}>Con</span><span style={{ color:dark?"#f1f5f9":"#1A2B6B" }}>Saúde</span>
              </div>
              <div style={{ fontSize:10, color:t.muted, whiteSpace:"nowrap", letterSpacing:".02em" }}>Auditoria Financeira</div>
            </div>
          )}
        </div>

        <nav style={{ flex:1, padding:"16px 10px", display:"flex", flexDirection:"column", gap:4 }}>
          {navItems.map((item) => {
            const isActive = activePage===item.id || (activePage==="results"&&item.id==="audits");
            return (
              <div key={item.id}
                className={`nav-item ${isActive?"active":""}`}
                onClick={() => { setActivePage(item.id); if(window.innerWidth<=768) setSidebarOpen(false); }}
                style={{ display:"flex", alignItems:"center", gap:12, padding:"10px 12px",
                  color:isActive?"#F47920":t.muted,
                  borderLeft:isActive?"3px solid #F47920":"3px solid transparent",
                  marginLeft:2, paddingLeft:9 }}>
                <span style={{ flexShrink:0 }}>{item.icon}</span>
                {sidebarOpen && <span style={{ fontSize:13.5, fontWeight:500, whiteSpace:"nowrap" }}>{item.label}</span>}
              </div>
            );
          })}
        </nav>

        <div style={{ padding:"16px 10px", borderTop:`1px solid ${t.border}` }}>
          <div className="nav-item" onClick={() => setSidebarOpen((p)=>!p)}
            style={{ display:"flex", alignItems:"center", gap:12, padding:"10px 12px", color:t.muted }}>
            <span style={{ transform:sidebarOpen?"rotate(180deg)":"rotate(0)", transition:"transform .3s", flexShrink:0 }}>
              {ICONS.chevronRight}
            </span>
            {sidebarOpen && <span style={{ fontSize:13, whiteSpace:"nowrap" }}>Recolher</span>}
          </div>
        </div>
      </aside>

      <div className={`sidebar-mobile-overlay ${sidebarOpen?"show":""}`} onClick={() => setSidebarOpen(false)} />

      {/* Main */}
      <div className="main-content" style={{ marginLeft:sidebarOpen?240:72, flex:1, transition:"margin-left .3s ease", display:"flex", flexDirection:"column", minHeight:"100vh" }}>
        <header style={{ ...t.header, borderBottom:`1px solid ${t.border}`, padding:"0 24px", height:64, display:"flex", alignItems:"center", justifyContent:"space-between", position:"sticky", top:0, zIndex:40, backdropFilter:"blur(12px)" }}>
          <div style={{ display:"flex", alignItems:"center", gap:12 }}>
            <button onClick={() => setSidebarOpen((p)=>!p)} style={{ background:"none", border:"none", color:t.muted, cursor:"pointer", display:"flex", alignItems:"center", padding:4, borderRadius:8 }}>
              {ICONS.menu}
            </button>
            <span style={{ fontSize:15, fontWeight:700, letterSpacing:"-.02em" }}>
              <span style={{ color:"#F47920" }}>Con</span><span style={{ color:dark?"#f1f5f9":"#1A2B6B" }}>Saúde</span>
              <span style={{ color:t.muted, fontWeight:500, fontSize:13 }}> · Auditoria de Produção Médica</span>
            </span>
          </div>
          <div style={{ display:"flex", alignItems:"center", gap:12 }}>
            <button className="toggle-btn" onClick={() => setDark((p)=>!p)} style={{ background:dark?"#1e293b":"#f1f5f9", border:`1px solid ${t.border}`, borderRadius:8, padding:"6px 10px", color:t.text, display:"flex", alignItems:"center", gap:6, fontSize:12, fontWeight:500 }}>
              {dark?ICONS.sun:ICONS.moon}
              <span>{dark?"Claro":"Escuro"}</span>
            </button>
            <div ref={profileRef} style={{ position:"relative" }}>
              <button onClick={() => setProfileOpen((p)=>!p)} style={{ background:"linear-gradient(135deg,#F47920,#1A2B6B)", border:"none", borderRadius:"50%", width:36, height:36, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", color:"white", fontWeight:700, fontSize:14, boxShadow:"0 2px 8px rgba(244,121,32,.4)" }}>
                {currentUser.name.charAt(0).toUpperCase()}
              </button>
              {profileOpen && (
                <div style={{ position:"absolute", right:0, top:44, ...t.card, borderRadius:12, border:`1px solid ${t.border}`, padding:8, minWidth:200, boxShadow:"0 8px 30px rgba(0,0,0,.2)", zIndex:50 }}>
                  <div style={{ padding:"8px 12px", borderBottom:`1px solid ${t.border}`, marginBottom:4 }}>
                    <div style={{ fontSize:13, fontWeight:600, color:t.text }}>{currentUser.name}</div>
                    <div style={{ fontSize:11, color:t.muted }}>{currentUser.email}</div>
                    <span style={{ display:"inline-flex", marginTop:4, padding:"2px 8px", borderRadius:20, fontSize:10, fontWeight:700, background:currentUser.role==="admin"?"#F4792018":"#2B4AA018", color:currentUser.role==="admin"?"#F47920":"#2B4AA0" }}>
                      {currentUser.role==="admin"?"Administrador":"Usuário"}
                    </span>
                  </div>
                  {[
                    { label:"Meu Perfil", action:() => { setActivePage("profile"); setProfileOpen(false); } },
                    { label:"Configurações", action:() => { setActivePage("settings-page"); setProfileOpen(false); } },
                    { label:"Sair", action:handleLogout, danger:true },
                  ].map(({ label, action, danger }) => (
                    <div key={label} className="nav-item" onClick={action} style={{ padding:"8px 12px", fontSize:13, color:danger?"#ef4444":t.text, cursor:"pointer" }}>{label}</div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </header>

        <main style={{ flex:1, padding:"32px 24px", overflowY:"auto" }}>
          {processing ? (
            <ProcessingScreen dark={dark} t={t} steps={steps} progress={progress} />
          ) : activePage==="upload" ? (
            <UploadScreen
              dark={dark} t={t}
              file1={file1} file2={file2}
              setFile1={setFile1} setFile2={setFile2}
              drag1={drag1} drag2={drag2}
              setDrag1={setDrag1} setDrag2={setDrag2}
              handleFileDrop={handleFileDrop}
              handleFileSelect={handleFileSelect}
              advancedOpen={advancedOpen} setAdvancedOpen={setAdvancedOpen}
              configs={configs} setConfigs={setConfigs}
              startAudit={startAudit}
              uploadError={uploadError}
              cols1={cols1} cols2={cols2}
              periodoAuditoria={periodoAuditoria} setPeriodoAuditoria={setPeriodoAuditoria}
            />
          ) : activePage==="results"||activePage==="audits" ? (
            <ResultsScreen
              dark={dark} t={t}
              selectedMedico={selectedMedico} setSelectedMedico={setSelectedMedico}
              resultados={resultados}
              statuses={statuses} setStatuses={setStatuses}
              onExportExcel={() => resultados && exportExcel(resultados)}
              onExportPDF={()   => resultados && exportPDF(resultados)}
              onGenerateAI={handleGenerateAIReport}
              aiLoading={aiLoading}
              onShare={() => {
                if (!resultados) return;
                const txt = `Auditoria ${resultados.referencia}\n${resultados.medicosComDivergencia} médicos com divergência — Valor total: ${resultados.valorTotal}`;
                navigator.clipboard?.writeText(txt);
              }}
              onNewAudit={() => { setActivePage("upload"); setFile1(null); setFile2(null); setUploadError(null); }}
            />
          ) : activePage==="history" ? (
            <HistoryScreen dark={dark} t={t} historico={historicoFiltrado} currentUser={currentUser}
              onOpen={(entry) => { setResultados({ ...entry.resultados, _histId: entry.id }); setActivePage("results"); }}
              onDelete={handleDeleteAudit} />
          ) : activePage==="users" ? (
            <UserManagementPage dark={dark} t={t} currentUser={currentUser} />
          ) : activePage==="profile" ? (
            <ProfilePage dark={dark} t={t} currentUser={currentUser} onUpdateUser={handleUpdateUser} />
          ) : (
            <SettingsPage dark={dark} t={t} currentUser={currentUser} />
          )}
        </main>
      </div>
    </div>
  );
}

// ─── LOGIN SCREEN ─────────────────────────────────────────────────────────────
function LoginScreen({ onLogin }) {
  const [email,     setEmail]     = useState('');
  const [password,  setPassword]  = useState('');
  const [remember,  setRemember]  = useState(false);
  const [loading,   setLoading]   = useState(false);
  const [error,     setError]     = useState('');
  const [showPwd,   setShowPwd]   = useState(false);
  const [showForgot,setShowForgot]= useState(false);
  const [forgotEmail,setForgotEmail]= useState('');

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      // A senha nunca é comparada aqui — quem valida é o Firebase Auth.
      const user = await login(email, password, remember);
      onLogin(user);
    } catch (err) {
      setError(err.mensagem || mensagemDeErro(err));
      setLoading(false);
    }
  };

  if (showForgot) return <ForgotPasswordScreen email={forgotEmail} onBack={() => setShowForgot(false)} />;

  const eyeOffIcon = (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
      <line x1="1" y1="1" x2="23" y2="23"/>
    </svg>
  );

  return (
    <div style={{ minHeight:'100vh', background:'#080e18', display:'flex', alignItems:'center', justifyContent:'center', fontFamily:"'DM Sans','Segoe UI',sans-serif", padding:20 }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&display=swap');*{box-sizing:border-box;margin:0;padding:0}.login-input:focus{border-color:#F47920!important;outline:none}.login-btn:hover{transform:translateY(-1px);box-shadow:0 8px 25px rgba(244,121,32,.5)!important}.login-btn:active{transform:translateY(0)}`}</style>
      <div style={{ position:'fixed', inset:0, background:'radial-gradient(ellipse 80% 50% at 50% -10%, rgba(244,121,32,.18) 0%, transparent 60%)', pointerEvents:'none' }} />

      <div style={{ width:'100%', maxWidth:420, position:'relative' }}>
        {/* Logo */}
        <div style={{ textAlign:'center', marginBottom:36 }}>
          <div style={{ width:72, height:72, borderRadius:20, background:'linear-gradient(135deg,#F47920,#1A2B6B)', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 16px', boxShadow:'0 12px 32px rgba(244,121,32,.45)', overflow:'hidden' }}>
            <img src="/logo.png" alt="ConSaúde" style={{ width:'100%', height:'100%', objectFit:'contain' }}
              onError={e => { e.target.style.display='none'; e.target.parentNode.innerHTML='<span style="color:white;font-size:28px;font-weight:900">C</span>'; }} />
          </div>
          <div style={{ fontSize:30, fontWeight:800, letterSpacing:'-.03em', marginBottom:4 }}>
            <span style={{ color:'#F47920' }}>Con</span><span style={{ color:'#f1f5f9' }}>Saúde</span>
          </div>
          <div style={{ fontSize:13, color:'#64748b' }}>Sistema de Auditoria Médica</div>
        </div>

        {/* Card */}
        <div style={{ background:'#0f1828', border:'1px solid #1a2b4a', borderRadius:20, padding:'36px 32px', boxShadow:'0 24px 64px rgba(0,0,0,.55)' }}>
          <h2 style={{ fontSize:20, fontWeight:700, color:'#f1f5f9', marginBottom:6, letterSpacing:'-.02em' }}>Bem-vindo de volta</h2>
          <p style={{ fontSize:13, color:'#64748b', marginBottom:28 }}>Entre com sua conta para acessar o sistema.</p>

          <form onSubmit={submit}>
            <div style={{ marginBottom:16 }}>
              <label style={{ fontSize:12, fontWeight:600, color:'#94a3b8', display:'block', marginBottom:6 }}>E-mail</label>
              <input className="login-input" type="email" value={email} onChange={e => setEmail(e.target.value)} required placeholder="seu@email.com.br"
                style={{ width:'100%', padding:'11px 14px', borderRadius:10, border:'1px solid #1a2b4a', background:'#080e18', color:'#f1f5f9', fontSize:13, transition:'border .2s', fontFamily:"'DM Sans',sans-serif" }} />
            </div>

            <div style={{ marginBottom:16 }}>
              <label style={{ fontSize:12, fontWeight:600, color:'#94a3b8', display:'block', marginBottom:6 }}>Senha</label>
              <div style={{ position:'relative' }}>
                <input className="login-input" type={showPwd?'text':'password'} value={password} onChange={e => setPassword(e.target.value)} required placeholder="••••••••"
                  style={{ width:'100%', padding:'11px 42px 11px 14px', borderRadius:10, border:'1px solid #1a2b4a', background:'#080e18', color:'#f1f5f9', fontSize:13, transition:'border .2s', fontFamily:"'DM Sans',sans-serif" }} />
                <button type="button" onClick={() => setShowPwd(p=>!p)} style={{ position:'absolute', right:12, top:'50%', transform:'translateY(-50%)', background:'none', border:'none', color:'#64748b', cursor:'pointer', display:'flex', alignItems:'center', padding:0 }}>
                  {showPwd ? ICONS.eye : eyeOffIcon}
                </button>
              </div>
            </div>

            {error && (
              <div style={{ background:'#ef444415', border:'1px solid #ef444440', borderRadius:8, padding:'10px 14px', fontSize:12, color:'#ef4444', marginBottom:16, display:'flex', alignItems:'center', gap:6 }}>
                {ICONS.warning} {error}
              </div>
            )}

            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:24 }}>
              <label style={{ display:'flex', alignItems:'center', gap:8, cursor:'pointer' }} onClick={() => setRemember(p=>!p)}>
                <div style={{ width:18, height:18, borderRadius:5, border:`2px solid ${remember?'#F47920':'#475569'}`, background:remember?'#F47920':'transparent', display:'flex', alignItems:'center', justifyContent:'center', transition:'all .15s', flexShrink:0 }}>
                  {remember && <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>}
                </div>
                <span style={{ fontSize:13, color:'#94a3b8' }}>Lembrar-me</span>
              </label>
              <button type="button" onClick={() => { setForgotEmail(email); setShowForgot(true); }} style={{ background:'none', border:'none', color:'#F47920', fontSize:13, cursor:'pointer', fontFamily:"'DM Sans',sans-serif" }}>
                Esqueci a senha
              </button>
            </div>

            <button type="submit" className="login-btn" disabled={loading}
              style={{ width:'100%', padding:'13px', background:loading?'#1e293b':'linear-gradient(135deg,#F47920,#1A2B6B)', color:loading?'#64748b':'white', border:'none', borderRadius:11, fontSize:14, fontWeight:700, cursor:loading?'not-allowed':'pointer', boxShadow:loading?'none':'0 4px 20px rgba(244,121,32,.4)', transition:'all .2s', fontFamily:"'DM Sans',sans-serif" }}>
              {loading ? 'Entrando...' : 'Entrar →'}
            </button>
          </form>
        </div>

        <p style={{ textAlign:'center', fontSize:12, color:'#1e293b', marginTop:24 }}>
          ConSaúde · Sistema Interno de Auditoria Médica
        </p>
      </div>
    </div>
  );
}

// ─── FORGOT PASSWORD SCREEN ───────────────────────────────────────────────────
function ForgotPasswordScreen({ email: initialEmail, onBack }) {
  const [email,     setEmail]     = useState(initialEmail || '');
  const [submitted, setSubmitted] = useState(false);
  const [sending,   setSending]   = useState(false);
  const [error,     setError]     = useState('');

  const enviar = async () => {
    if (!email.trim()) { setError('Informe seu e-mail.'); return; }
    setError('');
    setSending(true);
    try {
      await enviarResetDeSenha(email);
    } catch (err) {
      // auth/user-not-found não é diferenciado de propósito: confirmar quais
      // e-mails existem entregaria uma lista de contas válidas a quem tentasse.
      if (err?.code !== 'auth/user-not-found') {
        setError(mensagemDeErro(err));
        setSending(false);
        return;
      }
    }
    setSubmitted(true);
    setSending(false);
  };

  return (
    <div style={{ minHeight:'100vh', background:'#080e18', display:'flex', alignItems:'center', justifyContent:'center', fontFamily:"'DM Sans','Segoe UI',sans-serif", padding:20 }}>
      <div style={{ position:'fixed', inset:0, background:'radial-gradient(ellipse 80% 50% at 50% -10%, rgba(244,121,32,.18) 0%, transparent 60%)', pointerEvents:'none' }} />
      <div style={{ width:'100%', maxWidth:420, position:'relative' }}>
        <div style={{ textAlign:'center', marginBottom:36 }}>
          <div style={{ fontSize:30, fontWeight:800, letterSpacing:'-.03em', marginBottom:4 }}>
            <span style={{ color:'#F47920' }}>Con</span><span style={{ color:'#f1f5f9' }}>Saúde</span>
          </div>
        </div>
        <div style={{ background:'#0f1828', border:'1px solid #1a2b4a', borderRadius:20, padding:'36px 32px', boxShadow:'0 24px 64px rgba(0,0,0,.55)' }}>
          {submitted ? (
            <div style={{ textAlign:'center' }}>
              <div style={{ width:56, height:56, borderRadius:16, background:'#10b98120', border:'1px solid #10b98130', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 20px', color:'#10b981', fontSize:22 }}>✓</div>
              <h2 style={{ fontSize:18, fontWeight:700, color:'#f1f5f9', marginBottom:12 }}>Verifique seu e-mail</h2>
              <p style={{ fontSize:13, color:'#94a3b8', lineHeight:1.65, marginBottom:24 }}>
                Se houver uma conta para <strong style={{ color:'#f1f5f9' }}>{email}</strong>, você receberá um link para criar uma nova senha.<br/><br/>
                O link expira em 1 hora. Confira também a caixa de spam.
              </p>
              <button onClick={onBack} style={{ background:'linear-gradient(135deg,#F47920,#1A2B6B)', color:'white', border:'none', borderRadius:10, padding:'11px 28px', fontSize:13, fontWeight:600, cursor:'pointer' }}>
                Voltar ao login
              </button>
            </div>
          ) : (
            <>
              <button onClick={onBack} style={{ background:'none', border:'none', color:'#64748b', cursor:'pointer', display:'flex', alignItems:'center', gap:6, fontSize:13, marginBottom:20, padding:0, fontFamily:"'DM Sans',sans-serif" }}>
                ← Voltar
              </button>
              <h2 style={{ fontSize:20, fontWeight:700, color:'#f1f5f9', marginBottom:6 }}>Esqueci a senha</h2>
              <p style={{ fontSize:13, color:'#64748b', marginBottom:24, lineHeight:1.55 }}>
                Informe seu e-mail e enviaremos um link seguro para você criar uma nova senha.
              </p>
              <div style={{ marginBottom:16 }}>
                <label style={{ fontSize:12, fontWeight:600, color:'#94a3b8', display:'block', marginBottom:6 }}>E-mail da conta</label>
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="seu@email.com.br"
                  onKeyDown={e => { if (e.key === 'Enter') enviar(); }}
                  style={{ width:'100%', padding:'11px 14px', borderRadius:10, border:'1px solid #1a2b4a', background:'#080e18', color:'#f1f5f9', fontSize:13, outline:'none', fontFamily:"'DM Sans',sans-serif" }} />
              </div>
              {error && (
                <div style={{ background:'#ef444415', border:'1px solid #ef444440', borderRadius:8, padding:'10px 14px', fontSize:12, color:'#ef4444', marginBottom:16 }}>{error}</div>
              )}
              <button onClick={enviar} disabled={sending}
                style={{ width:'100%', padding:'12px', background:sending?'#1e293b':'linear-gradient(135deg,#F47920,#1A2B6B)', color:sending?'#64748b':'white', border:'none', borderRadius:10, fontSize:13, fontWeight:600, cursor:sending?'not-allowed':'pointer', fontFamily:"'DM Sans',sans-serif" }}>
                {sending ? 'Enviando…' : 'Enviar link de redefinição'}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── TROCA DE SENHA OBRIGATÓRIA ───────────────────────────────────────────────
// Exibida quando a conta foi criada com senha temporária definida pelo admin.
// A troca em si é feita pelo Firebase Auth; o flag mustChangePassword só é
// baixado depois que a nova senha é aceita pelo servidor.
function ForcePasswordChangeScreen({ user, onDone, onLogout }) {
  const [form,    setForm]    = useState({ atual:'', nova:'', confirma:'' });
  const [erro,    setErro]    = useState('');
  const [salvando,setSalvando]= useState(false);

  const submit = async (e) => {
    e.preventDefault();
    if (form.nova.length < 8)          { setErro('A nova senha deve ter pelo menos 8 caracteres.'); return; }
    if (form.nova !== form.confirma)   { setErro('As senhas não coincidem.'); return; }
    if (form.nova === form.atual)      { setErro('A nova senha deve ser diferente da temporária.'); return; }
    setErro('');
    setSalvando(true);
    try {
      await alterarPropriaSenha(form.atual, form.nova);
      onDone({ ...user, mustChangePassword: false });
    } catch (err) {
      setErro(mensagemDeErro(err));
      setSalvando(false);
    }
  };

  const campos = [
    { key:'atual',    label:'Senha temporária', ph:'A senha que você recebeu' },
    { key:'nova',     label:'Nova senha',       ph:'Mínimo 8 caracteres' },
    { key:'confirma', label:'Confirmar nova senha', ph:'Repita a nova senha' },
  ];

  return (
    <div style={{ minHeight:'100vh', background:'#080e18', display:'flex', alignItems:'center', justifyContent:'center', fontFamily:"'DM Sans','Segoe UI',sans-serif", padding:20 }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&display=swap');*{box-sizing:border-box;margin:0;padding:0}.login-input:focus{border-color:#F47920!important;outline:none}`}</style>
      <div style={{ position:'fixed', inset:0, background:'radial-gradient(ellipse 80% 50% at 50% -10%, rgba(244,121,32,.18) 0%, transparent 60%)', pointerEvents:'none' }} />
      <div style={{ width:'100%', maxWidth:420, position:'relative' }}>
        <div style={{ textAlign:'center', marginBottom:28 }}>
          <div style={{ fontSize:30, fontWeight:800, letterSpacing:'-.03em', marginBottom:4 }}>
            <span style={{ color:'#F47920' }}>Con</span><span style={{ color:'#f1f5f9' }}>Saúde</span>
          </div>
        </div>
        <div style={{ background:'#0f1828', border:'1px solid #1a2b4a', borderRadius:20, padding:'36px 32px', boxShadow:'0 24px 64px rgba(0,0,0,.55)' }}>
          <h2 style={{ fontSize:20, fontWeight:700, color:'#f1f5f9', marginBottom:6, letterSpacing:'-.02em' }}>Defina sua senha</h2>
          <p style={{ fontSize:13, color:'#64748b', marginBottom:24, lineHeight:1.55 }}>
            Olá, {user.name?.split(' ')[0]}. Sua conta usa uma senha temporária. Escolha uma senha pessoal para continuar.
          </p>
          <form onSubmit={submit}>
            {campos.map(({ key, label, ph }) => (
              <div key={key} style={{ marginBottom:16 }}>
                <label style={{ fontSize:12, fontWeight:600, color:'#94a3b8', display:'block', marginBottom:6 }}>{label}</label>
                <input className="login-input" type="password" value={form[key]} required placeholder={ph}
                  onChange={e => setForm(p => ({ ...p, [key]: e.target.value }))}
                  style={{ width:'100%', padding:'11px 14px', borderRadius:10, border:'1px solid #1a2b4a', background:'#080e18', color:'#f1f5f9', fontSize:13, fontFamily:"'DM Sans',sans-serif" }} />
              </div>
            ))}
            {erro && (
              <div style={{ background:'#ef444415', border:'1px solid #ef444440', borderRadius:8, padding:'10px 14px', fontSize:12, color:'#ef4444', marginBottom:16, display:'flex', alignItems:'center', gap:6 }}>
                {ICONS.warning} {erro}
              </div>
            )}
            <button type="submit" disabled={salvando}
              style={{ width:'100%', padding:'13px', background:salvando?'#1e293b':'linear-gradient(135deg,#F47920,#1A2B6B)', color:salvando?'#64748b':'white', border:'none', borderRadius:11, fontSize:14, fontWeight:700, cursor:salvando?'not-allowed':'pointer', fontFamily:"'DM Sans',sans-serif" }}>
              {salvando ? 'Salvando…' : 'Salvar e entrar →'}
            </button>
          </form>
          <button onClick={onLogout} style={{ width:'100%', background:'none', border:'none', color:'#64748b', fontSize:12.5, cursor:'pointer', marginTop:16, fontFamily:"'DM Sans',sans-serif" }}>
            Sair
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── FIREBASE NÃO CONFIGURADO ─────────────────────────────────────────────────
function FirebaseSetupScreen() {
  return (
    <div style={{ minHeight:'100vh', background:'#080e18', display:'flex', alignItems:'center', justifyContent:'center', fontFamily:"'DM Sans','Segoe UI',sans-serif", padding:20 }}>
      <div style={{ maxWidth:460, background:'#0f1828', border:'1px solid #1a2b4a', borderRadius:20, padding:'36px 32px' }}>
        <div style={{ fontSize:26, fontWeight:800, letterSpacing:'-.03em', marginBottom:16 }}>
          <span style={{ color:'#F47920' }}>Con</span><span style={{ color:'#f1f5f9' }}>Saúde</span>
        </div>
        <h2 style={{ fontSize:17, fontWeight:700, color:'#f1f5f9', marginBottom:10 }}>Firebase não configurado</h2>
        <p style={{ fontSize:13, color:'#94a3b8', lineHeight:1.7 }}>
          As variáveis <code style={{ color:'#F47920' }}>VITE_FIREBASE_*</code> não foram encontradas.
          Copie <code style={{ color:'#F47920' }}>.env.example</code> para <code style={{ color:'#F47920' }}>.env</code>,
          preencha com as credenciais do projeto no Console do Firebase e reinicie o servidor.
        </p>
      </div>
    </div>
  );
}

// ─── UPLOAD SCREEN ────────────────────────────────────────────────────────────
function UploadScreen({ dark, t, file1, file2, setFile1, setFile2, drag1, drag2, setDrag1, setDrag2, handleFileDrop, handleFileSelect, advancedOpen, setAdvancedOpen, configs, setConfigs, startAudit, uploadError, cols1, cols2, periodoAuditoria, setPeriodoAuditoria }) {
  const canStart = file1 && file2;
  const cards = [
    { label:"Relatório de Produção", file:file1, setFile:setFile1, drag:drag1, setDrag:setDrag1, accent:"#F47920", num:1, cols:cols1, err: uploadError?.prod },
    { label:"Relatório de Repasse",  file:file2, setFile:setFile2, drag:drag2, setDrag:setDrag2, accent:"#2B4AA0", num:2, cols:cols2, err: uploadError?.rep },
  ];

  return (
    <div className="fade-in" style={{ maxWidth:900, margin:"0 auto" }}>
      <div style={{ marginBottom:32 }}>
        <h1 style={{ fontSize:28, fontWeight:700, color:t.text, letterSpacing:"-.03em", marginBottom:8 }}>Auditoria de Produção Médica</h1>
        <p style={{ fontSize:15, color:t.muted, lineHeight:1.6 }}>Compare automaticamente os relatórios de Produção e Repasse e identifique divergências em segundos.</p>
      </div>

      {uploadError?.geral && (
        <div className="error-box" style={{ marginBottom:20, display:"flex", alignItems:"center", gap:10 }}>
          <span style={{ color:"#ef4444" }}>{ICONS.warning}</span>
          <span style={{ fontSize:13, color:"#ef4444" }}>{uploadError.geral}</span>
        </div>
      )}

      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:20, marginBottom:24 }}>
        {cards.map(({ label, file, setFile, drag, setDrag, accent, num, cols, err }) => (
          <div key={num} className="card-hover" style={{ ...t.card, borderRadius:16, border:`1px solid ${err ? "#ef4444" : t.border}`, overflow:"hidden" }}>
            <div style={{ padding:"20px 20px 14px", borderBottom:`1px solid ${t.border}`, display:"flex", alignItems:"center", gap:10 }}>
              <div style={{ width:8, height:8, borderRadius:"50%", background:accent }} />
              <span style={{ fontSize:14, fontWeight:600, color:t.text }}>{label}</span>
            </div>
            <div style={{ padding:20 }}>
              {err && (
                <div className="error-box" style={{ marginBottom:12 }}>
                  {err.map((e, i) => (
                    <div key={i} style={{ fontSize:12, color:"#ef4444", display:"flex", alignItems:"flex-start", gap:6, marginBottom:i<err.length-1?4:0 }}>
                      <span style={{ marginTop:1 }}>{ICONS.warning}</span><span>{e}</span>
                    </div>
                  ))}
                </div>
              )}
              {file ? (
                <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:10, padding:"20px 16px" }}>
                  <div style={{ width:52, height:52, borderRadius:14, background:`${accent}22`, display:"flex", alignItems:"center", justifyContent:"center" }}>
                    <div style={{ color:accent }}>{ICONS.check}</div>
                  </div>
                  <div style={{ textAlign:"center" }}>
                    <div style={{ fontSize:13, fontWeight:600, color:t.text, marginBottom:3 }}>{file.name}</div>
                    <div style={{ fontSize:11, color:t.muted }}>{(file.size/1024).toFixed(1)} KB · Pronto para análise</div>
                  </div>
                  {cols && (
                    <div style={{ display:"flex", flexWrap:"wrap", justifyContent:"center", gap:2, marginTop:2 }}>
                      {cols.medicoCol   && <span className="col-tag">{ICONS.tag}&nbsp;Médico: {cols.medicoCol}</span>}
                      {cols.pacienteCol && <span className="col-tag">{ICONS.tag}&nbsp;Paciente: {cols.pacienteCol}</span>}
                      {cols.valorCol    && <span className="col-tag">{ICONS.tag}&nbsp;Valor: {cols.valorCol}</span>}
                      {!cols.medicoCol  && <span className="col-tag" style={{ background:"#ef444415", color:"#ef4444" }}>Médico não detectado</span>}
                      {!cols.valorCol   && <span className="col-tag" style={{ background:"#ef444415", color:"#ef4444" }}>Valor não detectado</span>}
                    </div>
                  )}
                  <button className="btn-sm" onClick={() => setFile(null)} style={{ background:"none", border:`1px solid ${t.border}`, borderRadius:8, padding:"6px 14px", fontSize:12, color:t.muted, cursor:"pointer", marginTop:4 }}>Trocar arquivo</button>
                </div>
              ) : (
                <label
                  className="upload-area"
                  onDragEnter={() => setDrag(true)} onDragLeave={() => setDrag(false)}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => { setDrag(false); handleFileDrop(e, setFile); }}
                  style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:14, padding:"32px 16px", borderRadius:12, border:`2px dashed ${drag?accent:t.border}`, background:drag?`${accent}0a`:"transparent", cursor:"pointer" }}>
                  <div style={{ color:drag?accent:t.muted }}>{ICONS.spreadsheet}</div>
                  <div style={{ textAlign:"center" }}>
                    <div style={{ fontSize:13, fontWeight:500, color:t.text, marginBottom:4 }}>Arraste o arquivo aqui</div>
                    <div style={{ fontSize:12, color:t.muted }}>Formatos aceitos: .xlsx, .xls, .csv</div>
                  </div>
                  <span style={{ background:accent, color:"white", padding:"8px 20px", borderRadius:8, fontSize:12, fontWeight:600 }}>Selecionar Arquivo</span>
                  <input type="file" accept=".xlsx,.xls,.csv" style={{ display:"none" }} onChange={(e) => { if(e.target.files[0]) handleFileSelect(e.target.files[0], setFile); }} />
                </label>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Período da auditoria */}
      <div style={{ ...t.card, borderRadius:16, border:`1px solid ${t.border}`, marginBottom:20, padding:"20px 24px" }}>
        <label style={{ display:"block", fontSize:13, fontWeight:600, color:t.text, marginBottom:10 }}>
          Período da auditoria
          <span style={{ marginLeft:8, fontSize:11, fontWeight:400, color:t.muted }}>(opcional — sobrepõe a referência detectada automaticamente)</span>
        </label>
        <input
          type="text"
          value={periodoAuditoria}
          onChange={e => setPeriodoAuditoria(e.target.value)}
          placeholder="Ex: Primeira quinzena de março de 2025 / Abril completo / 01–15/04/2025"
          style={{
            width:"100%", padding:"10px 14px", borderRadius:10, fontSize:13,
            border:`1.5px solid ${periodoAuditoria ? "#F47920" : t.border}`,
            background:t.bg, color:t.text, outline:"none",
            transition:"border-color .15s",
          }}
        />
      </div>

      {/* Configurações avançadas */}
      <div style={{ ...t.card, borderRadius:16, border:`1px solid ${t.border}`, marginBottom:28, overflow:"hidden" }}>
        <button onClick={() => setAdvancedOpen((p)=>!p)} style={{ width:"100%", background:"none", border:"none", padding:"16px 20px", display:"flex", alignItems:"center", justifyContent:"space-between", cursor:"pointer" }}>
          <span style={{ fontSize:13.5, fontWeight:600, color:t.text }}>Configurações Avançadas</span>
          <span style={{ color:t.muted, transform:advancedOpen?"rotate(180deg)":"rotate(0)", transition:"transform .2s" }}>{ICONS.chevronDown}</span>
        </button>
        {advancedOpen && (
          <div style={{ padding:"0 20px 20px", display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
            {[
              { key:"ignorar",     label:"Ignorar diferenças < R$ 0,01" },
              { key:"comparaNome", label:"Comparar por nome do paciente" },
              { key:"ia",          label:"Gerar análise inteligente" },
            ].map(({ key, label }) => (
              <label key={key} style={{ display:"flex", alignItems:"center", gap:10, cursor:"pointer" }} onClick={() => setConfigs((p) => ({ ...p, [key]:!p[key] }))}>
                <div className={`checkbox-custom ${configs[key]?"checked":""}`}>
                  {configs[key] && <div style={{ color:"white" }}><svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg></div>}
                </div>
                <span style={{ fontSize:13, color:t.text }}>{label}</span>
              </label>
            ))}
          </div>
        )}
      </div>

      <div style={{ display:"flex", justifyContent:"center" }}>
        <button className="btn-primary" onClick={startAudit} disabled={!canStart} style={{
          background: canStart?"linear-gradient(135deg,#F47920,#1A2B6B)":(dark?"#1e293b":"#e2e8f0"),
          color: canStart?"white":t.muted, border:"none", borderRadius:12,
          padding:"14px 48px", fontSize:15, fontWeight:700, letterSpacing:"-.01em",
          boxShadow: canStart?"0 4px 20px rgba(244,121,32,.35)":"none",
          cursor: canStart?"pointer":"not-allowed",
        }}>
          {canStart ? "Iniciar Auditoria →" : "Faça upload dos dois arquivos"}
        </button>
      </div>
    </div>
  );
}

// ─── PROCESSING SCREEN ────────────────────────────────────────────────────────
function ProcessingScreen({ dark, t, steps, progress }) {
  const labels = [
    "Arquivos carregados",
    "Colunas identificadas",
    "Comparação por médico",
    "Divergências mapeadas",
    "Relatório gerado",
    "Insights calculados",
  ];
  return (
    <div style={{ display:"flex", alignItems:"center", justifyContent:"center", minHeight:"70vh" }}>
      <div className="fade-in" style={{ ...t.card, borderRadius:24, border:`1px solid ${t.border}`, padding:"48px 56px", maxWidth:480, width:"100%", textAlign:"center", boxShadow:"0 20px 60px rgba(0,0,0,.15)" }}>
        <div style={{ width:64, height:64, borderRadius:20, background:"linear-gradient(135deg,#F47920,#1A2B6B)", display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 24px", boxShadow:"0 8px 24px rgba(244,121,32,.4)" }}>
          <div className="spin" style={{ color:"white" }}>{ICONS.loader}</div>
        </div>
        <h2 style={{ fontSize:22, fontWeight:700, color:t.text, marginBottom:6, letterSpacing:"-.03em" }}>Analisando Arquivos</h2>
        <p style={{ fontSize:13, color:t.muted, marginBottom:28 }}>Processando dados reais dos relatórios...</p>

        <div style={{ background:dark?"#1e293b":"#f8fafc", borderRadius:12, padding:4, marginBottom:28 }}>
          <div style={{ height:8, borderRadius:8, background:dark?"#0f172a":"#e2e8f0", overflow:"hidden" }}>
            <div className="progress-bar" style={{ height:"100%", width:`${progress}%`, background:"linear-gradient(90deg,#F47920,#2B4AA0)", borderRadius:8 }} />
          </div>
        </div>

        {(() => {
          const activeStep = steps.filter(Boolean).length;
          return (
            <div style={{ display:"flex", flexDirection:"column", gap:14, textAlign:"left" }}>
              {labels.map((label, i) => (
                <div key={i} className="step-item" style={{ display:"flex", alignItems:"center", gap:12 }}>
                  <div style={{ width:28, height:28, borderRadius:"50%", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0, background:steps[i]?"#F47920":(dark?"#1e293b":"#f1f5f9"), border:steps[i]?"none":`2px solid ${t.border}`, transition:"all .3s ease" }}>
                    {steps[i]
                      ? <div style={{ color:"white" }}>{ICONS.check}</div>
                      : <div className={i===activeStep?"spin":""} style={{ color:t.muted, opacity:i===activeStep?1:0.3 }}>{ICONS.loader}</div>}
                  </div>
                  <span style={{ fontSize:13.5, color:steps[i]?t.text:t.muted, fontWeight:steps[i]?500:400, transition:"all .3s" }}>{label}</span>
                </div>
              ))}
            </div>
          );
        })()}
      </div>
    </div>
  );
}

// ─── RESULTS SCREEN ───────────────────────────────────────────────────────────
function ResultsScreen({ dark, t, selectedMedico, setSelectedMedico, resultados, onExportExcel, onExportPDF, onShare, onNewAudit, onGenerateAI, aiLoading, statuses, setStatuses }) {
  const metrics = [
    { label:"Médicos analisados",       value:resultados?.totalMedicos         ?? "—", icon:ICONS.users,    color:"#F47920", bg:"#F4792010" },
    { label:"Com divergência",          value:resultados?.medicosComDivergencia ?? "—", icon:ICONS.alert,    color:"#f59e0b", bg:"#f59e0b10" },
    { label:"Total de divergências",    value:resultados?.totalDivergencias     ?? "—", icon:ICONS.trending, color:"#ef4444", bg:"#ef444410" },
    { label:"Valor divergente total",   value:resultados?.valorTotal            ?? "—", icon:ICONS.dollar,   color:"#10b981", bg:"#10b98110" },
  ];

  const divs      = resultados?.divergencias ?? [];
  const insights  = resultados?.insights     ?? [];
  const statusColors = { pendente:"#f59e0b", revisado:"#F47920", corrigido:"#10b981" };
  const statusLabels = { pendente:"Pendente", revisado:"Revisado", corrigido:"Corrigido" };

  const getStatus = (id) => statuses[id] ?? "pendente";
  const cycleStatus = (id) => {
    const order = ["pendente","revisado","corrigido"];
    setStatuses((s) => ({ ...s, [id]: order[(order.indexOf(s[id]??order[0])+1)%order.length] }));
  };

  const [copiedInsight, setCopiedInsight] = useState(null);
  const copyInsight = (text, i) => {
    navigator.clipboard?.writeText(text);
    setCopiedInsight(i);
    setTimeout(() => setCopiedInsight(null), 1500);
  };

  return (
    <div className="fade-in" style={{ maxWidth:1100, margin:"0 auto" }}>
      <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", marginBottom:28, flexWrap:"wrap", gap:16 }}>
        <div>
          <h1 style={{ fontSize:26, fontWeight:700, color:t.text, letterSpacing:"-.03em", marginBottom:4 }}>Relatório de Auditoria</h1>
          <p style={{ fontSize:13, color:t.muted }}>
            Processado em {resultados?.processadoEm??"-"} · Referência: {resultados?.referencia??"-"}
            {resultados && (
              <span style={{ marginLeft:8, color:t.muted }}>· {resultados.file1Name} × {resultados.file2Name}</span>
            )}
          </p>
        </div>
        <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
          <button className="btn-sm" onClick={onNewAudit} style={{ display:"flex", alignItems:"center", gap:6, padding:"8px 16px", borderRadius:9, border:`1px solid ${t.border}`, background:"none", color:t.muted, fontSize:13, fontWeight:500, cursor:"pointer" }}>
            {ICONS.plus}<span>Nova Auditoria</span>
          </button>
          <button className="btn-sm" onClick={onGenerateAI} disabled={!resultados || aiLoading} style={{ display:"flex", alignItems:"center", gap:6, padding:"8px 18px", borderRadius:9, border:"none", background: resultados && !aiLoading ? "linear-gradient(135deg,#F47920,#a78bfa)" : (dark?"#1e293b":"#e2e8f0"), color: resultados && !aiLoading ? "white" : t.muted, fontSize:13, fontWeight:600, cursor: resultados && !aiLoading ? "pointer" : "not-allowed", boxShadow: resultados && !aiLoading ? "0 4px 14px rgba(244,121,32,.4)" : "none", transition:"all .2s ease" }}>
            {ICONS.brain}<span>{aiLoading ? "Gerando…" : "Relatório IA"}</span>
          </button>
          <button className="btn-sm" onClick={onExportPDF} disabled={!resultados} style={{ display:"flex", alignItems:"center", gap:6, padding:"8px 16px", borderRadius:9, border:`1px solid ${t.border}`, background:"none", color:"#F47920", fontSize:13, fontWeight:500, cursor:resultados?"pointer":"not-allowed", opacity:resultados?1:0.5 }}>
            {ICONS.export}<span>Exportar PDF</span>
          </button>
          <button className="btn-sm" onClick={onExportExcel} disabled={!resultados} style={{ display:"flex", alignItems:"center", gap:6, padding:"8px 16px", borderRadius:9, border:`1px solid ${t.border}`, background:"none", color:"#10b981", fontSize:13, fontWeight:500, cursor:resultados?"pointer":"not-allowed", opacity:resultados?1:0.5 }}>
            {ICONS.export}<span>Exportar Excel</span>
          </button>
          <button className="btn-sm" onClick={onShare} disabled={!resultados} style={{ display:"flex", alignItems:"center", gap:6, padding:"8px 16px", borderRadius:9, border:`1px solid ${t.border}`, background:"none", color:t.muted, fontSize:13, cursor:resultados?"pointer":"not-allowed", opacity:resultados?1:0.5 }}>
            {ICONS.share}<span>Copiar resumo</span>
          </button>
        </div>
      </div>

      {/* Métricas */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:16, marginBottom:28 }}>
        {metrics.map(({ label, value, icon, color, bg }) => (
          <div key={label} className="metric-card" style={{ ...t.card, borderRadius:16, border:`1px solid ${t.border}`, padding:"20px 20px 18px" }}>
            <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:14 }}>
              <span style={{ fontSize:12, color:t.muted, fontWeight:500 }}>{label}</span>
              <div style={{ width:36, height:36, borderRadius:10, background:bg, display:"flex", alignItems:"center", justifyContent:"center", color }}>{icon}</div>
            </div>
            <div style={{ fontSize:String(value).length>8?18:26, fontWeight:700, color:t.text, letterSpacing:"-.03em", fontFamily:"'DM Mono',monospace" }}>{value}</div>
          </div>
        ))}
      </div>

      {/* Tabela de médicos */}
      <div style={{ ...t.card, borderRadius:16, border:`1px solid ${t.border}`, marginBottom:24, overflow:"hidden" }}>
        <div style={{ padding:"20px 24px", borderBottom:`1px solid ${t.border}`, display:"flex", alignItems:"center", justifyContent:"space-between" }}>
          <h2 style={{ fontSize:15, fontWeight:600, color:t.text }}>Médicos com Divergência</h2>
          {divs.length>0 && <span className="badge" style={{ background:"#ef444415", color:"#ef4444" }}>{divs.length} médico{divs.length!==1?"s":""}</span>}
        </div>
        {divs.length===0 ? (
          <EmptyState t={t}
            mensagem={resultados ? "Nenhuma divergência encontrada." : "Nenhuma auditoria processada."}
            sub={resultados ? "Os relatórios de produção e repasse estão em plena conformidade." : "Faça upload dos arquivos e inicie a auditoria para ver os resultados aqui."} />
        ) : (
          <div style={{ overflowX:"auto" }}>
            <table style={{ width:"100%", borderCollapse:"collapse" }}>
              <thead>
                <tr style={{ background:dark?"#0f172a":"#f8fafc" }}>
                  {["Médico","Produção","Repasse","Diferença","Divergências","Status","Ações"].map((h) => (
                    <th key={h} style={{ padding:"12px 20px", textAlign:"left", fontSize:11, fontWeight:600, color:t.muted, letterSpacing:".05em", textTransform:"uppercase", whiteSpace:"nowrap" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {divs.map((row) => {
                  const st = getStatus(row.id);
                  return (
                    <tr key={row.id} className="table-row" style={{ borderTop:`1px solid ${t.border}` }}>
                      <td style={{ padding:"14px 20px" }}>
                        <div style={{ fontSize:13.5, fontWeight:600, color:t.text }}>{row.medico}</div>
                        {row.detalhes.length>0 && <div style={{ fontSize:11, color:t.muted, marginTop:2 }}>{row.detalhes.length} paciente{row.detalhes.length!==1?"s":""} divergente{row.detalhes.length!==1?"s":""}</div>}
                      </td>
                      <td style={{ padding:"14px 20px", fontSize:13, color:t.text, fontFamily:"'DM Mono',monospace" }}>{row.producao}</td>
                      <td style={{ padding:"14px 20px", fontSize:13, color:t.text, fontFamily:"'DM Mono',monospace" }}>{row.repasse}</td>
                      <td style={{ padding:"14px 20px" }}>
                        {row.sentido === "prod_maior"
                          ? <span title="Produção maior que repasse — possível subpagamento" style={{ fontSize:13, fontWeight:700, color:"#f59e0b", fontFamily:"'DM Mono',monospace" }}>↑Prod {row.diferenca}</span>
                          : <span title="Repasse maior que produção — possível sobrepagamento" style={{ fontSize:13, fontWeight:700, color:"#ef4444", fontFamily:"'DM Mono',monospace" }}>↑Rep {row.diferenca}</span>
                        }
                      </td>
                      <td style={{ padding:"14px 20px" }}>
                        <span className="badge" style={{ background:"#ef444415", color:"#ef4444" }}>{row.detalhes.length||"?"}</span>
                      </td>
                      <td style={{ padding:"14px 20px" }}>
                        <button className="btn-sm" onClick={() => cycleStatus(row.id)} style={{ cursor:"pointer", background:"none", border:"none", padding:0 }}>
                          <span className="badge" style={{ background:`${statusColors[st]}18`, color:statusColors[st], cursor:"pointer" }}>{statusLabels[st]}</span>
                        </button>
                      </td>
                      <td style={{ padding:"14px 20px" }}>
                        <button className="btn-sm" onClick={() => setSelectedMedico({ ...row, status:st })} style={{ display:"flex", alignItems:"center", gap:5, padding:"6px 14px", borderRadius:8, border:`1px solid ${t.border}`, background:"none", color:"#F47920", fontSize:12, fontWeight:500, cursor:"pointer" }}>
                          {ICONS.eye}<span>Detalhar</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Análise Inteligente */}
      <div className="ai-card" style={{ ...t.card, borderRadius:16, border:`1px solid ${dark?"#F4792030":"#F4792020"}`, padding:24, boxShadow:`0 4px 20px ${dark?"rgba(244,121,32,.1)":"rgba(244,121,32,.06)"}` }}>
        <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:20 }}>
          <div style={{ width:40, height:40, borderRadius:12, background:"linear-gradient(135deg,#F47920,#1A2B6B)", display:"flex", alignItems:"center", justifyContent:"center", color:"white", boxShadow:"0 4px 12px rgba(244,121,32,.35)" }}>
            {ICONS.brain}
          </div>
          <div>
            <div style={{ fontSize:14, fontWeight:700, color:t.text, letterSpacing:"-.02em" }}>Análise Inteligente</div>
            <div style={{ fontSize:11, color:"#F47920", fontWeight:500 }}>Gerado automaticamente · {resultados?.processadoEm??"-"}</div>
          </div>
        </div>
        {insights.length===0 ? (
          <div style={{ padding:20, textAlign:"center", color:t.muted, fontSize:13 }}>A análise aparecerá aqui após o processamento da auditoria.</div>
        ) : (
          <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
            {insights.map((ins, i) => (
              <div key={i} style={{ display:"flex", gap:10, padding:"12px 16px", borderRadius:10, background:dark?"rgba(255,255,255,.03)":"rgba(244,121,32,.04)", border:`1px solid ${dark?"rgba(255,255,255,.06)":"rgba(244,121,32,.1)"}` }}>
                <div style={{ width:6, height:6, borderRadius:"50%", background:"#F47920", marginTop:7, flexShrink:0 }} />
                <span style={{ fontSize:13.5, color:t.text, lineHeight:1.6, flex:1 }}>{ins}</span>
                <button className="btn-sm" onClick={() => copyInsight(ins, i)} style={{ background:"none", border:"none", color:copiedInsight===i?"#10b981":t.muted, cursor:"pointer", flexShrink:0, padding:2 }}>
                  {ICONS.copy}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Drawer detalhe médico */}
      {selectedMedico && (
        <>
          <div className="drawer-overlay" onClick={() => setSelectedMedico(null)} />
          <div className="drawer" style={{ ...t.card, borderLeft:`1px solid ${t.border}`, padding:0 }}>
            <div style={{ padding:"20px 24px", borderBottom:`1px solid ${t.border}`, display:"flex", alignItems:"center", justifyContent:"space-between", position:"sticky", top:0, ...t.card, zIndex:1 }}>
              <div>
                <div style={{ fontSize:15, fontWeight:700, color:t.text }}>{selectedMedico.medico}</div>
                <div style={{ fontSize:12, color:t.muted, marginTop:2 }}>Detalhamento de divergências por paciente</div>
              </div>
              <button className="btn-sm" onClick={() => setSelectedMedico(null)} style={{ background:"none", border:"none", color:t.muted, cursor:"pointer", padding:4 }}>
                {ICONS.x}
              </button>
            </div>
            <div style={{ padding:24 }}>
              {/* Mini métricas do médico */}
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:12, marginBottom:24 }}>
                {[
                  { label:"Produção", value:selectedMedico.producao, color:"#F47920" },
                  { label:"Repasse",  value:selectedMedico.repasse,  color:"#10b981" },
                  { label:"Diferença",value:selectedMedico.diferenca, color:"#ef4444" },
                ].map(({ label, value, color }) => (
                  <div key={label} style={{ padding:14, borderRadius:12, background:dark?"#0f172a":"#f8fafc", border:`1px solid ${t.border}`, textAlign:"center" }}>
                    <div style={{ fontSize:11, color:t.muted, marginBottom:6 }}>{label}</div>
                    <div style={{ fontSize:13, fontWeight:700, color, fontFamily:"'DM Mono',monospace" }}>{value}</div>
                  </div>
                ))}
              </div>

              {/* Distribuição de tipos */}
              {selectedMedico.detalhes?.length>0 && (() => {
                const freq = selectedMedico.detalhes.reduce((a, d) => { a[d.tipo]=(a[d.tipo]||0)+1; return a; }, {});
                return (
                  <div style={{ marginBottom:20, display:"flex", flexWrap:"wrap", gap:6 }}>
                    {Object.entries(freq).map(([tipo, qtd]) => {
                      const { bg, color } = tipoStyle(tipo);
                      return (
                        <span key={tipo} className="badge" style={{ background:bg, color }}>
                          {tipo} ({qtd})
                        </span>
                      );
                    })}
                  </div>
                );
              })()}

              <h3 style={{ fontSize:12, fontWeight:700, color:t.text, marginBottom:14, textTransform:"uppercase", letterSpacing:".06em" }}>
                Detalhamento por Paciente
                {selectedMedico.detalhes?.length>0 && <span style={{ color:t.muted, fontWeight:500 }}> — {selectedMedico.detalhes.length} item{selectedMedico.detalhes.length!==1?"s":""}</span>}
              </h3>

              {!selectedMedico.detalhes?.length ? (
                <div style={{ textAlign:"center", color:t.muted, fontSize:13, padding:24 }}>
                  {selectedMedico.detalhes?.length===0
                    ? "Comparação por paciente desabilitada. Ative em Configurações Avançadas."
                    : "Sem detalhamento disponível."}
                </div>
              ) : (
                <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
                  {selectedMedico.detalhes.map((d, i) => {
                    const { bg, color } = tipoStyle(d.tipo);
                    return (
                      <div key={i} style={{ padding:"14px 16px", borderRadius:12, border:`1px solid ${t.border}`, background:dark?"#0f172a":"#fafafa" }}>
                        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:10, gap:8 }}>
                          <span style={{ fontSize:13, fontWeight:600, color:t.text, flex:1 }}>{d.paciente}</span>
                          <span title={d.tipo} style={{ fontSize:13, fontWeight:700, color: d.tipo?.includes("Produção") ? "#f59e0b" : "#ef4444", fontFamily:"'DM Mono',monospace", whiteSpace:"nowrap" }}>
                            {d.tipo === "Maior na Produção" || d.tipo === "Ausente no Repasse" ? "↑Prod" : "↑Rep"} {d.diferenca}
                          </span>
                        </div>
                        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:6, marginBottom:10 }}>
                          {[["Produção",d.producao],["Repasse",d.repasse]].map(([l,v]) => (
                            <div key={l} style={{ fontSize:12, color:t.muted }}>
                              {l}: <span style={{ color:t.text, fontFamily:"'DM Mono',monospace" }}>{v}</span>
                            </div>
                          ))}
                        </div>
                        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", gap:8 }}>
                          <span className="badge" style={{ background:bg, color, display:"flex", alignItems:"center", gap:4 }}>
                            {ICONS.tag}&nbsp;{d.tipo}
                          </span>
                          <button className="btn-sm" onClick={() => navigator.clipboard?.writeText(`Paciente: ${d.paciente} | Produção: ${d.producao} | Repasse: ${d.repasse} | Diferença: ${d.diferenca} | Tipo: ${d.tipo}`)}
                            style={{ background:"none", border:`1px solid ${t.border}`, borderRadius:7, padding:"5px 10px", fontSize:11, color:t.muted, cursor:"pointer", display:"flex", alignItems:"center", gap:4 }}>
                            {ICONS.copy}<span>Copiar</span>
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

// ─── EMPTY STATE ──────────────────────────────────────────────────────────────
function EmptyState({ t, mensagem, sub }) {
  return (
    <div style={{ padding:"48px 24px", textAlign:"center" }}>
      <div style={{ width:48, height:48, borderRadius:14, background:t.card, border:`1px solid ${t.border}`, display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 16px", color:t.muted }}>
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="8" y1="12" x2="16" y2="12"/></svg>
      </div>
      <div style={{ fontSize:14, fontWeight:600, color:t.text, marginBottom:6 }}>{mensagem}</div>
      {sub && <div style={{ fontSize:12, color:t.muted, maxWidth:360, margin:"0 auto", lineHeight:1.5 }}>{sub}</div>}
    </div>
  );
}

// ─── HISTORY SCREEN ───────────────────────────────────────────────────────────
function HistoryScreen({ dark, t, historico, onOpen, onDelete, currentUser }) {
  const isAdmin = currentUser?.role === 'admin';
  const [confirmDel, setConfirmDel] = useState(null);
  return (
    <div className="fade-in" style={{ maxWidth:900, margin:"0 auto" }}>
      <div style={{ marginBottom:28 }}>
        <h1 style={{ fontSize:26, fontWeight:700, color:t.text, letterSpacing:"-.03em", marginBottom:4 }}>Histórico de Auditorias</h1>
        <p style={{ fontSize:13, color:t.muted }}>Relatórios gerados e salvos neste navegador.</p>
      </div>
      <div style={{ ...t.card, borderRadius:16, border:`1px solid ${t.border}`, overflow:"hidden" }}>
        {historico.length===0 ? (
          <EmptyState t={t} mensagem="Nenhuma auditoria realizada ainda." sub="Os relatórios gerados aparecerão aqui automaticamente após cada auditoria." />
        ) : (
          <div style={{ overflowX:"auto" }}>
            <table style={{ width:"100%", borderCollapse:"collapse" }}>
              <thead>
                <tr style={{ background:dark?"#0f172a":"#f8fafc" }}>
                  {["Data","Referência","Arquivos", ...(isAdmin ? ["Auditor"] : []), "Divergências","Valor Total",""].map((h) => (
                    <th key={h} style={{ padding:"12px 20px", textAlign:"left", fontSize:11, fontWeight:600, color:t.muted, letterSpacing:".05em", textTransform:"uppercase", whiteSpace:"nowrap" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {historico.map((row) => (
                  <tr key={row.id} className="table-row" style={{ borderTop:`1px solid ${t.border}` }}>
                    <td style={{ padding:"16px 20px", fontSize:13, color:t.text, fontFamily:"'DM Mono',monospace" }}>{row.data}</td>
                    <td style={{ padding:"16px 20px", fontSize:13, fontWeight:600, color:t.text }}>{row.periodo}</td>
                    <td style={{ padding:"16px 20px", fontSize:12, color:t.muted, maxWidth:220 }}>
                      <div style={{ overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{row.arquivos}</div>
                    </td>
                    {isAdmin && (
                      <td style={{ padding:"16px 20px", fontSize:12, whiteSpace:"nowrap" }}>
                        {row.userName ? (
                          <span style={{ display:"inline-flex", alignItems:"center", gap:6, background:dark?"#1e293b":"#f1f5f9", borderRadius:20, padding:"3px 10px" }}>
                            <span style={{ width:22, height:22, borderRadius:"50%", background:"#F47920", color:"#fff", fontSize:10, fontWeight:700, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                              {row.userName.charAt(0).toUpperCase()}
                            </span>
                            <span style={{ color:t.text, fontWeight:500 }}>{row.userName}</span>
                          </span>
                        ) : (
                          <span style={{ color:t.muted, fontStyle:"italic" }}>—</span>
                        )}
                      </td>
                    )}
                    <td style={{ padding:"16px 20px" }}>
                      <span className="badge" style={{ background:row.divergencias>0?"#ef444415":"#10b98115", color:row.divergencias>0?"#ef4444":"#10b981" }}>{row.divergencias}</span>
                    </td>
                    <td style={{ padding:"16px 20px", fontSize:13, color:t.text, fontFamily:"'DM Mono',monospace" }}>{row.valor}</td>
                    <td style={{ padding:"16px 20px" }}>
                      {confirmDel === row.id ? (
                        <div style={{ display:"flex", gap:6, alignItems:"center" }}>
                          <span style={{ fontSize:11, color:t.muted, whiteSpace:"nowrap" }}>Apagar?</span>
                          <button onClick={() => { onDelete(row.id); setConfirmDel(null); }} style={{ padding:"4px 10px", borderRadius:6, border:"none", background:"#ef4444", color:"#fff", fontSize:11, fontWeight:600, cursor:"pointer" }}>Sim</button>
                          <button onClick={() => setConfirmDel(null)} style={{ padding:"4px 10px", borderRadius:6, border:`1px solid ${t.border}`, background:"none", color:t.muted, fontSize:11, cursor:"pointer" }}>Não</button>
                        </div>
                      ) : (
                        <div style={{ display:"flex", gap:6, flexWrap:"wrap" }}>
                          {row.resultados && (
                            <button className="btn-sm" onClick={() => onOpen(row)} style={{ display:"flex", alignItems:"center", gap:5, padding:"6px 12px", borderRadius:7, border:`1px solid ${t.border}`, background:"none", color:"#F47920", fontSize:12, fontWeight:500, cursor:"pointer" }}>
                              {ICONS.eye}<span>Ver</span>
                            </button>
                          )}
                          {row.resultados && (
                            <button className="btn-sm" onClick={() => exportExcel(row.resultados)} style={{ display:"flex", alignItems:"center", gap:5, padding:"6px 12px", borderRadius:7, border:`1px solid ${t.border}`, background:"none", color:"#10b981", fontSize:12, cursor:"pointer" }}>
                              {ICONS.export}<span>Excel</span>
                            </button>
                          )}
                          {row.aiReportHTML && (
                            <button className="btn-sm" onClick={() => { const b=new Blob([row.aiReportHTML],{type:"text/html;charset=utf-8"}); window.open(URL.createObjectURL(b),"_blank"); }} style={{ display:"flex", alignItems:"center", gap:5, padding:"6px 12px", borderRadius:7, border:`1px solid ${t.border}`, background:"none", color:"#8b5cf6", fontSize:12, cursor:"pointer" }}>
                              {ICONS.brain}<span>IA</span>
                            </button>
                          )}
                          <button className="btn-sm" onClick={() => setConfirmDel(row.id)} style={{ display:"flex", alignItems:"center", gap:5, padding:"6px 10px", borderRadius:7, border:`1px solid ${t.border}`, background:"none", color:"#ef4444", fontSize:12, cursor:"pointer" }}>
                            {ICONS.x}
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── USER MANAGEMENT PAGE ─────────────────────────────────────────────────────
function UserManagementPage({ dark, t, currentUser }) {
  const [users,      setUsers]      = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [loadError,  setLoadError]  = useState('');
  const [showForm,   setShowForm]   = useState(false);
  const [editUser,   setEditUser]   = useState(null);
  const [form,       setForm]       = useState({ name:'', email:'', password:'', role:'user', cargo:'', modo:'convite' });
  const [formError,  setFormError]  = useState('');
  const [saving,     setSaving]     = useState(false);
  const [aviso,      setAviso]      = useState('');
  const [resetId,    setResetId]    = useState(null);
  const [resetDone,  setResetDone]  = useState(false);
  const [resetErr,   setResetErr]   = useState('');
  const [confirmDel, setConfirmDel] = useState(null);

  const refresh = async () => {
    try {
      setUsers(await listarUsuarios());
      setLoadError('');
    } catch (err) {
      setLoadError(mensagemDeErro(err));
    }
    setLoading(false);
  };

  useEffect(() => { refresh(); }, []);

  const openCreate = () => {
    setEditUser(null);
    setForm({ name:'', email:'', password:'', role:'user', cargo:'', modo:'convite' });
    setFormError('');
    setShowForm(true);
  };

  const openEdit = (u) => {
    setEditUser(u);
    setForm({ name:u.name, email:u.email, password:'', role:u.role, cargo:u.cargo||'', modo:'convite' });
    setFormError('');
    setShowForm(true);
  };

  const saveUser = async () => {
    setFormError('');
    if (!form.name.trim())  { setFormError('Nome é obrigatório.'); return; }
    if (!form.email.trim()) { setFormError('E-mail é obrigatório.'); return; }
    if (!editUser && form.modo === 'temporaria' && form.password.length < 8) {
      setFormError('A senha temporária deve ter pelo menos 8 caracteres.'); return;
    }
    setSaving(true);
    try {
      if (editUser) {
        // O e-mail é a identidade no Firebase Auth e não é editável aqui.
        await atualizarUsuario(editUser.id, { nome:form.name, cargo:form.cargo, role:form.role });
        setAviso('Usuário atualizado.');
      } else {
        await criarUsuario({
          nome: form.name, email: form.email, cargo: form.cargo, role: form.role,
          modo: form.modo, senhaTemporaria: form.password,
        }, currentUser.id);
        setAviso(form.modo === 'temporaria'
          ? 'Usuário criado. Ele deverá trocar a senha temporária no primeiro acesso.'
          : `Convite enviado para ${form.email.trim()}. O usuário define a própria senha pelo link.`);
      }
      await refresh();
      setShowForm(false);
    } catch (err) {
      setFormError(mensagemDeErro(err));
    }
    setSaving(false);
  };

  // No plano Spark o cliente não exclui a conta de outro usuário no Auth.
  // Desativar corta o acesso pelas Security Rules, que é o efeito que importa.
  const toggleAtivo = async (u, desativar) => {
    try {
      await definirUsuarioDesativado(u.id, desativar);
      setAviso(desativar ? `${u.name} foi desativado e perdeu o acesso.` : `${u.name} foi reativado.`);
      await refresh();
    } catch (err) { setAviso(mensagemDeErro(err)); }
    setConfirmDel(null);
  };

  // O admin não define mais a senha de ninguém: dispara o e-mail de redefinição
  // e o próprio usuário escolhe a senha. Ninguém além do dono a conhece.
  const doReset = async () => {
    const alvo = users.find(u => u.id === resetId);
    if (!alvo) return;
    setResetErr('');
    try {
      await enviarResetDeSenha(alvo.email);
      setResetDone(true);
      setTimeout(() => { setResetId(null); setResetDone(false); }, 2200);
    } catch (err) { setResetErr(mensagemDeErro(err)); }
  };

  const roleColor = (r) => r==='admin'?'#F47920':'#2B4AA0';

  return (
    <div className="fade-in" style={{ maxWidth:820, margin:'0 auto' }}>
      <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', marginBottom:28, flexWrap:'wrap', gap:16 }}>
        <div>
          <h1 style={{ fontSize:26, fontWeight:700, color:t.text, letterSpacing:'-.03em', marginBottom:4 }}>Gestão de Usuários</h1>
          <p style={{ fontSize:13, color:t.muted }}>Cadastre e gerencie os acessos ao sistema.</p>
        </div>
        <button className="btn-primary" onClick={openCreate} style={{ display:'flex', alignItems:'center', gap:8, background:'linear-gradient(135deg,#F47920,#1A2B6B)', color:'white', border:'none', borderRadius:10, padding:'10px 20px', fontSize:13, fontWeight:600, cursor:'pointer', boxShadow:'0 4px 14px rgba(244,121,32,.35)' }}>
          {ICONS.plus} Novo Usuário
        </button>
      </div>

      {aviso && (
        <div style={{ background:'#10b98115', border:'1px solid #10b98140', borderRadius:10, padding:'12px 16px', fontSize:12.5, color:'#10b981', marginBottom:16, display:'flex', justifyContent:'space-between', alignItems:'center', gap:12 }}>
          <span>{aviso}</span>
          <button onClick={() => setAviso('')} style={{ background:'none', border:'none', color:'#10b981', cursor:'pointer', display:'flex' }}>{ICONS.x}</button>
        </div>
      )}
      {loadError && (
        <div style={{ background:'#ef444415', border:'1px solid #ef444440', borderRadius:10, padding:'12px 16px', fontSize:12.5, color:'#ef4444', marginBottom:16 }}>{loadError}</div>
      )}

      <div style={{ ...t.card, borderRadius:16, border:`1px solid ${t.border}`, overflow:'hidden' }}>
        {loading ? (
          <div style={{ padding:'40px 0', textAlign:'center', fontSize:13, color:t.muted }}>Carregando usuários…</div>
        ) : users.length===0 ? (
          <EmptyState t={t} mensagem="Nenhum usuário cadastrado." sub="Clique em Novo Usuário para começar." />
        ) : (
          <div style={{ overflowX:'auto' }}>
            <table style={{ width:'100%', borderCollapse:'collapse' }}>
              <thead>
                <tr style={{ background:dark?'#0f172a':'#f8fafc' }}>
                  {['Nome','E-mail','Cargo','Perfil','Status','Criado em','Ações'].map(h => (
                    <th key={h} style={{ padding:'12px 20px', textAlign:'left', fontSize:11, fontWeight:600, color:t.muted, letterSpacing:'.05em', textTransform:'uppercase', whiteSpace:'nowrap' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {users.map(u => (
                  <tr key={u.id} className="table-row" style={{ borderTop:`1px solid ${t.border}`, opacity:u.disabled?0.55:1 }}>
                    <td style={{ padding:'14px 20px' }}>
                      <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                        <div style={{ width:34, height:34, borderRadius:'50%', background:u.disabled?'#475569':'linear-gradient(135deg,#F47920,#1A2B6B)', display:'flex', alignItems:'center', justifyContent:'center', color:'white', fontWeight:700, fontSize:13, flexShrink:0 }}>
                          {u.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div style={{ fontSize:13.5, fontWeight:600, color:t.text }}>{u.name}</div>
                          {u.id===currentUser.id && <div style={{ fontSize:10, color:'#F47920', marginTop:1 }}>você</div>}
                        </div>
                      </div>
                    </td>
                    <td style={{ padding:'14px 20px', fontSize:13, color:t.muted }}>{u.email}</td>
                    <td style={{ padding:'14px 20px', fontSize:13, color:t.text }}>{u.cargo||'—'}</td>
                    <td style={{ padding:'14px 20px' }}>
                      <span className="badge" style={{ background:`${roleColor(u.role)}18`, color:roleColor(u.role) }}>
                        {u.role==='admin'?'Administrador':'Usuário'}
                      </span>
                    </td>
                    <td style={{ padding:'14px 20px' }}>
                      {u.disabled ? (
                        <span className="badge" style={{ background:'#ef444418', color:'#ef4444' }}>Desativado</span>
                      ) : u.mustChangePassword ? (
                        <span className="badge" style={{ background:'#f59e0b18', color:'#f59e0b' }}>Senha pendente</span>
                      ) : (
                        <span className="badge" style={{ background:'#10b98118', color:'#10b981' }}>Ativo</span>
                      )}
                    </td>
                    <td style={{ padding:'14px 20px', fontSize:12, color:t.muted }}>{formatarData(u.createdAt)}</td>
                    <td style={{ padding:'14px 20px' }}>
                      <div style={{ display:'flex', gap:6 }}>
                        <button className="btn-sm" title="Editar" onClick={() => openEdit(u)} style={{ display:'flex', alignItems:'center', gap:5, padding:'6px 12px', borderRadius:7, border:`1px solid ${t.border}`, background:'none', color:'#F47920', fontSize:12, cursor:'pointer' }}>
                          {ICONS.edit}<span>Editar</span>
                        </button>
                        <button className="btn-sm" title="Enviar link de redefinição de senha" onClick={() => { setResetId(u.id); setResetDone(false); setResetErr(''); }} style={{ display:'flex', alignItems:'center', gap:5, padding:'6px 12px', borderRadius:7, border:`1px solid ${t.border}`, background:'none', color:t.muted, fontSize:12, cursor:'pointer' }}>
                          🔑
                        </button>
                        {u.id !== currentUser.id && (
                          u.disabled ? (
                            <button className="btn-sm" title="Reativar acesso" onClick={() => toggleAtivo(u, false)} style={{ display:'flex', alignItems:'center', padding:'6px 12px', borderRadius:7, border:'1px solid #10b98130', background:'none', color:'#10b981', fontSize:12, cursor:'pointer' }}>
                              Reativar
                            </button>
                          ) : (
                            <button className="btn-sm" title="Desativar acesso" onClick={() => setConfirmDel(u)} style={{ display:'flex', alignItems:'center', padding:'6px 12px', borderRadius:7, border:'1px solid #ef444430', background:'none', color:'#ef4444', fontSize:12, cursor:'pointer' }}>
                              {ICONS.x}
                            </button>
                          )
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create / Edit modal */}
      {showForm && (
        <>
          <style>{`
            .user-modal-wrap{position:fixed;inset:0;z-index:150;display:flex;align-items:center;justify-content:center;padding:16px;pointer-events:none}
            .user-modal{width:min(680px,94vw);max-height:100%;border-radius:16px;display:flex;flex-direction:column;overflow:hidden;box-shadow:0 24px 64px rgba(0,0,0,.45);animation:fadeIn .2s ease;pointer-events:auto}
            .user-form-grid{display:grid;grid-template-columns:1fr 1fr;gap:14px 16px}
            .user-form-grid .full{grid-column:1/-1}
            @media(max-width:600px){.user-form-grid{grid-template-columns:1fr}.user-form-grid .full{grid-column:auto}}
          `}</style>
          <div className="drawer-overlay" onClick={() => setShowForm(false)} />
          <div className="user-modal-wrap">
          <div className="user-modal" style={{ ...t.card, border:`1px solid ${t.border}` }}>
            <div style={{ padding:'14px 20px', borderBottom:`1px solid ${t.border}`, display:'flex', justifyContent:'space-between', alignItems:'center', flexShrink:0 }}>
              <div style={{ fontSize:15, fontWeight:700, color:t.text }}>{editUser?'Editar Usuário':'Novo Usuário'}</div>
              <button onClick={() => setShowForm(false)} style={{ background:'none', border:'none', color:t.muted, cursor:'pointer', display:'flex', padding:4 }}>{ICONS.x}</button>
            </div>
            <div style={{ padding:20, overflowY:'auto', minHeight:0 }}>
              {formError && <div style={{ background:'#ef444415', border:'1px solid #ef444440', borderRadius:8, padding:'9px 14px', fontSize:12, color:'#ef4444', marginBottom:14 }}>{formError}</div>}
              <div className="user-form-grid">
                {[
                  { key:'name',  label:'Nome completo', type:'text',  ph:'João Silva' },
                  { key:'email', label:'E-mail',        type:'email', ph:'joao@consaude.com.br', readOnly:!!editUser },
                ].map(({ key, label, type, ph, readOnly }) => (
                  <div key={key}>
                    <label style={{ fontSize:12, fontWeight:600, color:t.muted, display:'block', marginBottom:5 }}>{label}</label>
                    <input type={type} value={form[key]} readOnly={readOnly} placeholder={ph}
                      onChange={e => setForm(p=>({...p,[key]:e.target.value}))}
                      title={readOnly?'O e-mail identifica a conta no Firebase e não pode ser alterado aqui.':undefined}
                      style={{ width:'100%', padding:'9px 13px', borderRadius:10, border:`1px solid ${t.border}`, background:dark?'#080e18':'#f8fafc', color:readOnly?t.muted:t.text, fontSize:13, outline:'none', fontFamily:"'DM Sans',sans-serif", cursor:readOnly?'not-allowed':'auto' }} />
                  </div>
                ))}
                <div>
                  <label style={{ fontSize:12, fontWeight:600, color:t.muted, display:'block', marginBottom:5 }}>Cargo / Função</label>
                  <input type="text" value={form.cargo} placeholder="Ex: Analista de Faturamento"
                    onChange={e => setForm(p=>({...p,cargo:e.target.value}))}
                    style={{ width:'100%', padding:'9px 13px', borderRadius:10, border:`1px solid ${t.border}`, background:dark?'#080e18':'#f8fafc', color:t.text, fontSize:13, outline:'none', fontFamily:"'DM Sans',sans-serif" }} />
                </div>
                <div>
                  <label style={{ fontSize:12, fontWeight:600, color:t.muted, display:'block', marginBottom:5 }}>Perfil de acesso</label>
                  <div style={{ display:'flex', gap:8 }}>
                    {[['user','Usuário'],['admin','Administrador']].map(([v,l]) => (
                      <button key={v} type="button" onClick={() => setForm(p=>({...p,role:v}))} style={{ flex:1, padding:'9px 4px', borderRadius:10, border:`2px solid ${form.role===v?'#F47920':t.border}`, background:form.role===v?'#F4792018':'transparent', color:form.role===v?'#F47920':t.muted, fontSize:12.5, fontWeight:600, cursor:'pointer', transition:'all .15s' }}>{l}</button>
                    ))}
                  </div>
                </div>

                {!editUser && (
                  <div className="full">
                    <label style={{ fontSize:12, fontWeight:600, color:t.muted, display:'block', marginBottom:6 }}>Definição da senha</label>
                    <div className="user-form-grid">
                      {[
                        ['convite',    'Convite por e-mail',  'O usuário cria a própria senha por link.'],
                        ['temporaria', 'Senha temporária',    'Troca obrigatória no 1º acesso.'],
                      ].map(([v, titulo, desc]) => (
                        <button key={v} type="button" onClick={() => setForm(p=>({...p,modo:v}))}
                          style={{ textAlign:'left', padding:'10px 13px', borderRadius:10, border:`2px solid ${form.modo===v?'#F47920':t.border}`, background:form.modo===v?'#F4792010':'transparent', cursor:'pointer', transition:'all .15s' }}>
                          <div style={{ fontSize:13, fontWeight:600, color:form.modo===v?'#F47920':t.text, marginBottom:2 }}>{titulo}</div>
                          <div style={{ fontSize:11.5, color:t.muted, lineHeight:1.4 }}>{desc}</div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {!editUser && form.modo==='temporaria' && (
                  <div className="full">
                    <label style={{ fontSize:12, fontWeight:600, color:t.muted, display:'block', marginBottom:5 }}>Senha temporária</label>
                    <input type="text" value={form.password} placeholder="Mínimo 8 caracteres"
                      onChange={e => setForm(p=>({...p,password:e.target.value}))}
                      style={{ width:'100%', padding:'9px 13px', borderRadius:10, border:`1px solid ${t.border}`, background:dark?'#080e18':'#f8fafc', color:t.text, fontSize:13, outline:'none', fontFamily:"'DM Sans',sans-serif" }} />
                    <div style={{ fontSize:11, color:t.muted, marginTop:4 }}>Entregue por um canal seguro. Será obrigatoriamente trocada no primeiro acesso.</div>
                  </div>
                )}
              </div>
            </div>
            <div style={{ display:'flex', gap:10, padding:'14px 20px', borderTop:`1px solid ${t.border}`, flexShrink:0 }}>
              <button onClick={() => setShowForm(false)} style={{ flex:1, padding:'10px', border:`1px solid ${t.border}`, borderRadius:10, background:'none', color:t.muted, fontSize:13, cursor:'pointer' }}>Cancelar</button>
              <button onClick={saveUser} disabled={saving} style={{ flex:2, padding:'10px', background:'linear-gradient(135deg,#F47920,#1A2B6B)', color:'white', border:'none', borderRadius:10, fontSize:13, fontWeight:600, cursor:'pointer' }}>
                {saving?'Salvando…':editUser?'Salvar alterações':'Criar usuário'}
              </button>
            </div>
          </div>
          </div>
        </>
      )}

      {/* Reset password overlay */}
      {resetId && (
        <>
          <div className="drawer-overlay" onClick={() => setResetId(null)} />
          <div style={{ position:'fixed', top:'50%', left:'50%', transform:'translate(-50%,-50%)', zIndex:150, ...t.card, border:`1px solid ${t.border}`, borderRadius:16, padding:28, width:360, maxWidth:'90vw', boxShadow:'0 20px 60px rgba(0,0,0,.4)' }}>
            <h3 style={{ fontSize:16, fontWeight:700, color:t.text, marginBottom:6 }}>Redefinir Senha</h3>
            {resetDone ? (
              <div style={{ textAlign:'center', color:'#10b981', padding:'12px 0', fontSize:13, fontWeight:600 }}>✓ Link enviado por e-mail!</div>
            ) : (
              <>
                <p style={{ fontSize:12.5, color:t.muted, marginBottom:16, lineHeight:1.6 }}>
                  Um link seguro será enviado para <strong style={{ color:t.text }}>{users.find(u=>u.id===resetId)?.email}</strong>.
                  O próprio usuário escolhe a nova senha — você não precisa conhecê-la.
                </p>
                {resetErr && <div style={{ background:'#ef444415', border:'1px solid #ef444440', borderRadius:8, padding:'10px 14px', fontSize:12, color:'#ef4444', marginBottom:14 }}>{resetErr}</div>}
                <div style={{ display:'flex', gap:10 }}>
                  <button onClick={() => setResetId(null)} style={{ flex:1, padding:'10px', border:`1px solid ${t.border}`, borderRadius:9, background:'none', color:t.muted, fontSize:13, cursor:'pointer' }}>Cancelar</button>
                  <button onClick={doReset} style={{ flex:1, padding:'10px', background:'linear-gradient(135deg,#F47920,#1A2B6B)', color:'white', border:'none', borderRadius:9, fontSize:13, fontWeight:600, cursor:'pointer' }}>Enviar link</button>
                </div>
              </>
            )}
          </div>
        </>
      )}

      {/* Delete confirmation overlay */}
      {confirmDel && (
        <>
          <div className="drawer-overlay" onClick={() => setConfirmDel(null)} />
          <div style={{ position:'fixed', top:'50%', left:'50%', transform:'translate(-50%,-50%)', zIndex:150, ...t.card, border:'1px solid #ef444440', borderRadius:16, padding:28, width:360, maxWidth:'90vw', boxShadow:'0 20px 60px rgba(0,0,0,.4)' }}>
            <h3 style={{ fontSize:16, fontWeight:700, color:t.text, marginBottom:8 }}>Desativar usuário?</h3>
            <p style={{ fontSize:13, color:t.muted, marginBottom:20, lineHeight:1.55 }}>
              <strong style={{ color:t.text }}>{confirmDel.name}</strong> perde o acesso ao sistema imediatamente, mesmo com a senha correta.
              O histórico de auditorias é preservado e você pode reativar a conta depois.
            </p>
            <div style={{ display:'flex', gap:10 }}>
              <button onClick={() => setConfirmDel(null)} style={{ flex:1, padding:'10px', border:`1px solid ${t.border}`, borderRadius:9, background:'none', color:t.muted, fontSize:13, cursor:'pointer' }}>Cancelar</button>
              <button onClick={() => toggleAtivo(confirmDel, true)} style={{ flex:1, padding:'10px', background:'#ef4444', color:'white', border:'none', borderRadius:9, fontSize:13, fontWeight:600, cursor:'pointer' }}>Desativar</button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

// ─── PROFILE PAGE ─────────────────────────────────────────────────────────────
function ProfilePage({ dark, t, currentUser, onUpdateUser }) {
  const [form,     setForm]     = useState({ name:currentUser.name, cargo:currentUser.cargo||'' });
  const [saved,    setSaved]    = useState(false);
  const [pwdForm,  setPwdForm]  = useState({ current:'', newPwd:'', confirm:'' });
  const [pwdErr,   setPwdErr]   = useState('');
  const [pwdSaved, setPwdSaved] = useState(false);
  const [saving,   setSaving]   = useState(false);

  const [profErr, setProfErr] = useState('');

  const saveProfile = async () => {
    if (!form.name.trim()) return;
    setProfErr('');
    try {
      // As Security Rules permitem que o usuário altere apenas nome e cargo do
      // próprio documento — nunca o papel nem o status de ativação.
      await atualizarUsuario(currentUser.id, { nome:form.name, cargo:form.cargo, role:currentUser.role });
      onUpdateUser({ ...currentUser, name:form.name.trim(), cargo:form.cargo.trim() });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err) { setProfErr(mensagemDeErro(err)); }
  };

  const savePwd = async () => {
    setPwdErr('');
    if (!pwdForm.current)                   { setPwdErr('Informe a senha atual.'); return; }
    if (pwdForm.newPwd.length < 8)          { setPwdErr('A nova senha deve ter pelo menos 8 caracteres.'); return; }
    if (pwdForm.newPwd !== pwdForm.confirm) { setPwdErr('As senhas não coincidem.'); return; }
    setSaving(true);
    try {
      // Reautentica com a senha atual e troca pelo Firebase Auth.
      await alterarPropriaSenha(pwdForm.current, pwdForm.newPwd);
      setPwdForm({ current:'', newPwd:'', confirm:'' });
      setPwdSaved(true);
      setTimeout(() => setPwdSaved(false), 2500);
    } catch (err) { setPwdErr(mensagemDeErro(err)); }
    setSaving(false);
  };

  return (
    <div className="fade-in" style={{ maxWidth:560, margin:'0 auto' }}>
      <div style={{ marginBottom:28 }}>
        <h1 style={{ fontSize:26, fontWeight:700, color:t.text, letterSpacing:'-.03em', marginBottom:4 }}>Meu Perfil</h1>
        <p style={{ fontSize:13, color:t.muted }}>Gerencie suas informações pessoais.</p>
      </div>

      {/* Avatar card */}
      <div style={{ ...t.card, borderRadius:16, border:`1px solid ${t.border}`, padding:24, marginBottom:20, display:'flex', alignItems:'center', gap:18 }}>
        <div style={{ width:64, height:64, borderRadius:'50%', background:'linear-gradient(135deg,#F47920,#1A2B6B)', display:'flex', alignItems:'center', justifyContent:'center', color:'white', fontWeight:700, fontSize:26, flexShrink:0 }}>
          {currentUser.name.charAt(0).toUpperCase()}
        </div>
        <div>
          <div style={{ fontSize:18, fontWeight:700, color:t.text }}>{currentUser.name}</div>
          <div style={{ fontSize:13, color:t.muted, marginTop:2 }}>{currentUser.email}</div>
          <span className="badge" style={{ background:currentUser.role==='admin'?'#F4792018':'#2B4AA018', color:currentUser.role==='admin'?'#F47920':'#2B4AA0', marginTop:6 }}>
            {currentUser.role==='admin'?'Administrador':'Usuário'}
          </span>
        </div>
      </div>

      {/* Profile fields */}
      <div style={{ ...t.card, borderRadius:16, border:`1px solid ${t.border}`, marginBottom:20, overflow:'hidden' }}>
        <div style={{ padding:'18px 24px', borderBottom:`1px solid ${t.border}` }}>
          <span style={{ fontSize:14, fontWeight:600, color:t.text }}>Informações pessoais</span>
        </div>
        <div style={{ padding:'20px 24px', display:'flex', flexDirection:'column', gap:16 }}>
          <div>
            <label style={{ fontSize:12, fontWeight:600, color:t.muted, display:'block', marginBottom:6 }}>Nome completo</label>
            <input value={form.name} onChange={e => setForm(p=>({...p,name:e.target.value}))}
              style={{ width:'100%', padding:'10px 14px', borderRadius:10, border:`1px solid ${t.border}`, background:dark?'#0f172a':'#f8fafc', color:t.text, fontSize:13, outline:'none', fontFamily:"'DM Sans',sans-serif" }} />
          </div>
          <div>
            <label style={{ fontSize:12, fontWeight:600, color:t.muted, display:'block', marginBottom:6 }}>Cargo / Função</label>
            <input value={form.cargo} onChange={e => setForm(p=>({...p,cargo:e.target.value}))} placeholder="Ex: Analista de Faturamento"
              style={{ width:'100%', padding:'10px 14px', borderRadius:10, border:`1px solid ${t.border}`, background:dark?'#0f172a':'#f8fafc', color:t.text, fontSize:13, outline:'none', fontFamily:"'DM Sans',sans-serif" }} />
          </div>
          <div>
            <label style={{ fontSize:12, fontWeight:600, color:t.muted, display:'block', marginBottom:6 }}>E-mail</label>
            <input value={currentUser.email} disabled
              style={{ width:'100%', padding:'10px 14px', borderRadius:10, border:`1px solid ${t.border}`, background:dark?'#0c1422':'#f0f2f5', color:t.muted, fontSize:13, outline:'none', cursor:'not-allowed' }} />
            <div style={{ fontSize:11, color:t.muted, marginTop:4 }}>O e-mail identifica sua conta e não pode ser alterado aqui.</div>
          </div>
          {profErr && <div style={{ background:'#ef444415', border:'1px solid #ef444440', borderRadius:8, padding:'10px 14px', fontSize:12, color:'#ef4444' }}>{profErr}</div>}
        </div>
        <div style={{ padding:'0 24px 20px', display:'flex', justifyContent:'flex-end' }}>
          <button className="btn-primary" onClick={saveProfile}
            style={{ background:'linear-gradient(135deg,#F47920,#1A2B6B)', color:'white', border:'none', borderRadius:10, padding:'10px 24px', fontSize:13, fontWeight:600, cursor:'pointer', boxShadow:'0 4px 14px rgba(244,121,32,.35)', minWidth:140 }}>
            {saved?'✓ Salvo!':'Salvar alterações'}
          </button>
        </div>
      </div>

      {/* Password change */}
      <div style={{ ...t.card, borderRadius:16, border:`1px solid ${t.border}`, overflow:'hidden' }}>
        <div style={{ padding:'18px 24px', borderBottom:`1px solid ${t.border}` }}>
          <span style={{ fontSize:14, fontWeight:600, color:t.text }}>Alterar senha</span>
        </div>
        <div style={{ padding:'20px 24px', display:'flex', flexDirection:'column', gap:16 }}>
          {pwdErr   && <div style={{ background:'#ef444415', border:'1px solid #ef444440', borderRadius:8, padding:'10px 14px', fontSize:12, color:'#ef4444' }}>{pwdErr}</div>}
          {pwdSaved && <div style={{ background:'#10b98115', border:'1px solid #10b98140', borderRadius:8, padding:'10px 14px', fontSize:12, color:'#10b981' }}>✓ Senha alterada com sucesso!</div>}
          {[
            { key:'current', label:'Senha atual',       ph:'••••••••' },
            { key:'newPwd',  label:'Nova senha',         ph:'Mínimo 8 caracteres' },
            { key:'confirm', label:'Confirmar nova senha', ph:'Repita a nova senha' },
          ].map(({ key, label, ph }) => (
            <div key={key}>
              <label style={{ fontSize:12, fontWeight:600, color:t.muted, display:'block', marginBottom:6 }}>{label}</label>
              <input type="password" value={pwdForm[key]} onChange={e => setPwdForm(p=>({...p,[key]:e.target.value}))} placeholder={ph}
                style={{ width:'100%', padding:'10px 14px', borderRadius:10, border:`1px solid ${t.border}`, background:dark?'#0f172a':'#f8fafc', color:t.text, fontSize:13, outline:'none', fontFamily:"'DM Sans',sans-serif" }} />
            </div>
          ))}
        </div>
        <div style={{ padding:'0 24px 20px', display:'flex', justifyContent:'flex-end' }}>
          <button className="btn-primary" onClick={savePwd} disabled={saving}
            style={{ background:'linear-gradient(135deg,#F47920,#1A2B6B)', color:'white', border:'none', borderRadius:10, padding:'10px 24px', fontSize:13, fontWeight:600, cursor:'pointer', boxShadow:'0 4px 14px rgba(244,121,32,.35)', minWidth:140 }}>
            {saving?'Salvando…':'Alterar senha'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── SETTINGS PAGE ────────────────────────────────────────────────────────────
function SettingsPage({ dark, t }) {
  const [clinic, setClinic] = useState(getClinicSettings);
  const [audit,  setAudit]  = useState(() => {
    try { return JSON.parse(localStorage.getItem('cs_audit_cfg')||'null') || { tolerancia:'0,01', formato:'PDF' }; }
    catch { return { tolerancia:'0,01', formato:'PDF' }; }
  });
  const [saved, setSaved] = useState(false);

  const save = () => {
    saveClinicSettings(clinic);
    localStorage.setItem('cs_audit_cfg', JSON.stringify(audit));
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="fade-in" style={{ maxWidth:680, margin:"0 auto" }}>
      <div style={{ marginBottom:28 }}>
        <h1 style={{ fontSize:26, fontWeight:700, color:t.text, letterSpacing:"-.03em", marginBottom:4 }}>Configurações</h1>
        <p style={{ fontSize:13, color:t.muted }}>Configurações da clínica e do sistema.</p>
      </div>

      {/* Clinic */}
      <div style={{ ...t.card, borderRadius:16, border:`1px solid ${t.border}`, marginBottom:20, overflow:"hidden" }}>
        <div style={{ padding:"18px 24px", borderBottom:`1px solid ${t.border}` }}>
          <div style={{ fontSize:14, fontWeight:600, color:t.text }}>Clínica</div>
          <div style={{ fontSize:12, color:t.muted, marginTop:2 }}>Dados utilizados nos relatórios exportados.</div>
        </div>
        <div style={{ padding:"20px 24px", display:"flex", flexDirection:"column", gap:16 }}>
          {[
            { key:'name',  label:'Nome da clínica',      ph:'ConSaúde' },
            { key:'cnpj',  label:'CNPJ',                  ph:'00.000.000/0001-00' },
            { key:'email', label:'E-mail de relatórios',  ph:'relatorios@consaude.com.br', type:'email' },
          ].map(({ key, label, ph, type }) => (
            <div key={key}>
              <label style={{ fontSize:12, fontWeight:500, color:t.muted, display:"block", marginBottom:6 }}>{label}</label>
              <input type={type||'text'} value={clinic[key]} onChange={e => setClinic(p=>({...p,[key]:e.target.value}))} placeholder={ph}
                style={{ width:"100%", padding:"10px 14px", borderRadius:10, border:`1px solid ${t.border}`, background:dark?"#0f172a":"#f8fafc", color:t.text, fontSize:13, outline:"none", fontFamily:"'DM Sans',sans-serif" }} />
            </div>
          ))}
        </div>
      </div>

      {/* Audit */}
      <div style={{ ...t.card, borderRadius:16, border:`1px solid ${t.border}`, marginBottom:20, overflow:"hidden" }}>
        <div style={{ padding:"18px 24px", borderBottom:`1px solid ${t.border}` }}>
          <span style={{ fontSize:14, fontWeight:600, color:t.text }}>Auditoria</span>
        </div>
        <div style={{ padding:"20px 24px", display:"flex", flexDirection:"column", gap:16 }}>
          {[
            { key:'tolerancia', label:'Tolerância de divergência (R$)', ph:'0,01' },
            { key:'formato',    label:'Formato padrão de exportação',   ph:'PDF'  },
          ].map(({ key, label, ph }) => (
            <div key={key}>
              <label style={{ fontSize:12, fontWeight:500, color:t.muted, display:"block", marginBottom:6 }}>{label}</label>
              <input value={audit[key]} onChange={e => setAudit(p=>({...p,[key]:e.target.value}))} placeholder={ph}
                style={{ width:"100%", padding:"10px 14px", borderRadius:10, border:`1px solid ${t.border}`, background:dark?"#0f172a":"#f8fafc", color:t.text, fontSize:13, outline:"none", fontFamily:"'DM Sans',sans-serif" }} />
            </div>
          ))}
        </div>
      </div>

      <div style={{ display:"flex", justifyContent:"flex-end" }}>
        <button className="btn-primary" onClick={save} style={{ background:"linear-gradient(135deg,#F47920,#1A2B6B)", color:"white", border:"none", borderRadius:10, padding:"10px 28px", fontSize:13, fontWeight:600, cursor:"pointer", boxShadow:"0 4px 14px rgba(244,121,32,.35)", minWidth:160 }}>
          {saved?'✓ Salvo!':'Salvar Configurações'}
        </button>
      </div>
    </div>
  );
}
