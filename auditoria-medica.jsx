import { useState, useEffect, useRef, useId } from "react";
import { createPortal } from "react-dom";
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
    root:    { background: "#101722", color: "#f1f5f9" },
    sidebar: { background: "#111b2a" },
    header:  { background: "#111b2a" },
    card:    { background: "#172231" },
    border:  "#1a2b4a",
    text:    "#f1f5f9",
    muted:   "#64748b",
  },
  light: {
    root:    { background: "#f4f6f8", color: "#172033" },
    sidebar: { background: "#ffffff" },
    header:  { background: "#ffffff" },
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

// ─── DESIGN SYSTEM ────────────────────────────────────────────────────────────
// Tokens e primitivos compartilhados. Mantêm a identidade ConSaúde (laranja
// #F47920 / azul-marinho #1A2B6B, tema escuro) e padronizam espaçamento,
// tipografia, inputs, botões, cards, alertas e modais em todas as telas.

const BRAND = {
  orange: "#F47920",
  navy:   "#1A2B6B",
  navy2:  "#2B4AA0",
  grad:   "#1A2B6B",
  gradAI: "#1A2B6B",
};

const RADIUS = { sm: 6, md: 8, lg: 10, xl: 12 };

// Superfície de input por tema — um único valor para todos os campos do app.
const inputBg = (dark) => (dark ? "#0a1322" : "#f8fafc");

// Card padrão (fundo + borda + raio) a partir do tema ativo.
const cardStyle = (t) => ({ ...t.card, borderRadius: RADIUS.xl, border: `1px solid ${t.border}` });

const UI_CSS = `
.cs-input{width:100%;border-radius:8px;font-size:13.5px;font-family:'DM Sans','Segoe UI',sans-serif;outline:none;transition:border-color .15s ease,box-shadow .15s ease;-webkit-appearance:none}
.cs-input::placeholder{color:#64748b;opacity:.75}
.cs-input:focus{border-color:#F47920!important;box-shadow:0 0 0 3px rgba(244,121,32,.16)!important}
.cs-input:disabled,.cs-input[readonly]{cursor:not-allowed;opacity:.65}
.cs-select{appearance:auto;-webkit-appearance:auto;cursor:pointer}
.cs-btn{display:inline-flex;align-items:center;justify-content:center;gap:8px;border-radius:8px;font-weight:600;font-family:'DM Sans','Segoe UI',sans-serif;letter-spacing:0;cursor:pointer;border:1px solid transparent;transition:background .15s ease,border-color .15s ease,opacity .15s ease;white-space:nowrap;line-height:1;user-select:none}
.cs-btn:disabled{cursor:not-allowed;opacity:.55;box-shadow:none!important;transform:none!important}
.cs-btn-primary{background:#1A2B6B;color:#fff;border-color:#1A2B6B}
.cs-btn-primary:not(:disabled):hover{background:#243b82;border-color:#243b82}
.cs-btn-primary:not(:disabled):active{background:#142252}
.cs-btn-danger{background:#dc2626;color:#fff;border-color:#dc2626}
.cs-btn-danger:not(:disabled):hover{background:#b91c1c;border-color:#b91c1c}
.cs-btn-ghost:not(:disabled):hover{background:rgba(148,163,184,.12)!important;border-color:rgba(148,163,184,.4)!important}
.cs-icon-btn{display:inline-flex;align-items:center;justify-content:center;background:none;border:none;cursor:pointer;padding:6px;border-radius:9px;transition:background .15s ease,color .15s ease}
.cs-icon-btn:hover{background:rgba(148,163,184,.14)}
.cs-btn:focus-visible,.cs-icon-btn:focus-visible{outline:2px solid #F47920;outline-offset:2px}
.cs-grid-2{display:grid;grid-template-columns:1fr 1fr;gap:16px 18px}
.cs-grid-4{display:grid;grid-template-columns:repeat(4,1fr);gap:16px}
.cs-col-full{grid-column:1/-1}
@media(max-width:860px){.cs-grid-4{grid-template-columns:1fr 1fr}}
@media(max-width:600px){.cs-grid-2{grid-template-columns:1fr}.cs-grid-4{grid-template-columns:1fr}.cs-col-full{grid-column:auto}}
.cs-modal-overlay{position:fixed;inset:0;background:rgba(15,23,42,.56);z-index:250;animation:csFade .15s ease}
.cs-modal-wrap{position:fixed;inset:0;z-index:251;display:grid;place-items:center;padding:24px;overflow:hidden;font-family:'DM Sans','Segoe UI',sans-serif}
.cs-modal{position:relative;width:100%;max-height:calc(100dvh - 48px);display:grid;grid-template-rows:auto minmax(0,1fr) auto;overflow:hidden;border-radius:12px;box-shadow:0 18px 48px rgba(15,23,42,.28);animation:csPop .15s ease}
.cs-modal-head{display:flex;align-items:flex-start;justify-content:space-between;gap:16px;padding:20px 24px}
.cs-modal-body{padding:22px 24px;overflow-y:auto;overscroll-behavior:contain;scroll-padding:24px;min-height:0}
.cs-modal-foot{display:flex;gap:10px;padding:16px 24px}
@keyframes csFade{from{opacity:0}to{opacity:1}}
@keyframes csPop{from{opacity:0;transform:translateY(12px) scale(.985)}to{opacity:1;transform:translateY(0) scale(1)}}
@media(max-width:640px){.cs-modal-wrap{padding:0}.cs-modal{height:100dvh;max-height:100dvh;border-radius:0}.cs-modal-head,.cs-modal-foot{border-radius:0!important}}
`;

function UIStyles() { return <style>{UI_CSS}</style>; }

const INTERFACE_CSS = `
.app-main{flex:1;padding:32px 28px 48px;overflow-y:auto}
.app-page{width:min(100%,1120px);margin:0 auto}
.app-page-medium{width:min(100%,960px);margin:0 auto}
.app-page-narrow{width:min(100%,780px);margin:0 auto}
.page-actions{display:flex;align-items:center;justify-content:flex-end;gap:8px;flex-wrap:wrap}
.ui-panel{overflow:hidden}
.ui-panel-head{display:flex;align-items:flex-start;justify-content:space-between;gap:16px;padding:18px 20px}
.ui-panel-title{font-size:14px;font-weight:700;line-height:1.3}
.ui-panel-copy{font-size:11.5px;line-height:1.5;margin-top:3px}
.ui-panel-body{padding:20px}
.ui-stat-grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:14px;margin-bottom:18px}
.ui-stat{min-height:104px;padding:16px;display:flex;flex-direction:column;justify-content:space-between}
.ui-stat-top{display:flex;align-items:center;justify-content:space-between;gap:12px}
.ui-stat-icon{width:38px;height:38px;border-radius:10px;display:flex;align-items:center;justify-content:center;flex-shrink:0}
.ui-stat-value{font-family:inherit;font-size:22px;font-weight:700;line-height:1.1;letter-spacing:0;overflow-wrap:anywhere}
.ui-stat-label{font-size:12px;font-weight:650;margin-top:10px}
.ui-stat-detail{font-size:10.5px;line-height:1.4;margin-top:3px}
.ui-toolbar{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:14px 18px}
.ui-search{position:relative;flex:1;min-width:220px;max-width:420px}
.ui-toolbar-group{display:flex;align-items:center;gap:8px;flex-wrap:wrap}
.ui-filter{border-radius:8px;padding:8px 11px;border:1px solid transparent;background:transparent;font-family:inherit;font-size:11.5px;font-weight:600;line-height:1;cursor:pointer;white-space:nowrap;transition:all .15s ease}
.ui-filter:focus-visible{outline:2px solid #F47920;outline-offset:2px}
.ui-count-bar{padding:9px 18px;font-size:11.5px}
.ui-table-wrap{overflow-x:auto}
.ui-table{width:100%;border-collapse:collapse;min-width:820px}
.ui-table th{padding:11px 16px;text-align:left;font-size:10.5px;font-weight:700;letter-spacing:.05em;text-transform:uppercase;white-space:nowrap}
.ui-table td{padding:14px 16px;vertical-align:middle;font-size:12.5px}
.ui-table-actions{display:flex;align-items:center;justify-content:flex-end;gap:6px;white-space:nowrap}
.ui-mobile-list{display:none;padding:12px}
.ui-mobile-card{padding:15px;border-radius:12px;margin-bottom:10px}
.ui-mobile-card:last-child{margin-bottom:0}
.ui-mobile-head{display:flex;align-items:flex-start;justify-content:space-between;gap:12px}
.ui-mobile-meta{display:grid;grid-template-columns:1fr 1fr;gap:11px;margin:14px 0}
.ui-mobile-label{font-size:10.5px;margin-bottom:3px}
.ui-mobile-value{font-size:12.5px;overflow-wrap:anywhere}
.ui-mobile-actions{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px}
.upload-files-grid{display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:18px}
.upload-file-card{overflow:hidden;min-width:0}
.upload-file-head{display:flex;align-items:center;gap:11px;padding:16px 18px}
.upload-step{width:28px;height:28px;border-radius:8px;display:flex;align-items:center;justify-content:center;color:#fff;font-size:12px;font-weight:800;flex-shrink:0}
.upload-file-title{font-size:13.5px;font-weight:700}
.upload-file-subtitle{font-size:10.5px;margin-top:2px}
.upload-file-body{padding:16px}
.upload-dropzone{min-height:218px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:12px;padding:26px 18px;border:1.5px dashed;border-radius:11px;cursor:pointer;text-align:center;transition:border-color .15s ease,background .15s ease}
.upload-ready{min-height:218px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:10px;padding:20px 16px;text-align:center}
.upload-file-name{max-width:100%;font-size:13px;font-weight:650;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.upload-tags{display:flex;flex-wrap:wrap;justify-content:center;gap:4px}
.audit-setup{display:grid;grid-template-columns:minmax(0,1.2fr) minmax(280px,.8fr);gap:16px;margin-bottom:18px}
.audit-options{display:flex;flex-direction:column;gap:9px}
.audit-option{display:flex;align-items:center;gap:10px;padding:10px 12px;border-radius:9px;cursor:pointer}
.audit-action-bar{display:flex;align-items:center;justify-content:space-between;gap:18px;padding:16px 18px}
.audit-readiness{display:flex;align-items:center;gap:10px;min-width:0}
.audit-readiness-icon{width:34px;height:34px;border-radius:9px;display:flex;align-items:center;justify-content:center;flex-shrink:0}
.audit-readiness-title{font-size:12.5px;font-weight:700}
.audit-readiness-copy{font-size:10.5px;margin-top:2px}
.form-page-grid{display:grid;grid-template-columns:minmax(240px,.7fr) minmax(0,1.3fr);gap:18px;align-items:start}
.form-stack{display:flex;flex-direction:column;gap:18px}
.identity-panel{padding:22px;text-align:center}
.identity-avatar{width:72px;height:72px;border-radius:18px;display:flex;align-items:center;justify-content:center;color:#fff;font-size:26px;font-weight:800;margin:0 auto 14px}
.identity-name{font-size:17px;font-weight:750;overflow-wrap:anywhere}
.identity-email{font-size:11.5px;margin-top:4px;overflow-wrap:anywhere}
.form-fields{display:grid;grid-template-columns:1fr 1fr;gap:16px}
.form-actions{display:flex;align-items:center;justify-content:flex-end;gap:10px;padding:0 20px 20px}
.settings-grid{display:grid;grid-template-columns:1fr 1fr;gap:18px;align-items:start}
.results-hero{display:flex;align-items:flex-start;justify-content:space-between;gap:18px;margin-bottom:24px}
.results-context{font-size:12px;line-height:1.6;margin-top:5px}
.results-mobile-list{display:none;padding:12px}
.result-card{padding:15px;border-radius:12px;margin-bottom:10px}
.result-card:last-child{margin-bottom:0}
.result-values{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin:14px 0}
.result-value{padding:9px;border-radius:8px}
.result-value-label{font-size:9.5px;margin-bottom:4px}
.result-value-number{font-size:12px;font-weight:700;overflow-wrap:anywhere}
.detail-drawer{position:fixed;right:0;top:0;bottom:0;width:min(540px,100%);z-index:221;display:grid;grid-template-rows:auto minmax(0,1fr);box-shadow:-8px 0 28px rgba(15,23,42,.18);animation:slideIn .18s ease}
.detail-drawer-head{display:flex;align-items:flex-start;justify-content:space-between;gap:14px;padding:18px 20px}
.detail-drawer-body{padding:20px;overflow-y:auto;overscroll-behavior:contain}
.detail-metrics{display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin-bottom:20px}
.detail-metric{padding:12px;border-radius:10px;text-align:center}
.shell-nav-button{width:100%;display:flex;align-items:center;gap:12px;padding:10px 12px;border:0;border-left:3px solid transparent;background:transparent;font:inherit;text-align:left;cursor:pointer;border-radius:8px;transition:background .15s ease,color .15s ease}
.shell-nav-button:focus-visible{outline:2px solid #F47920;outline-offset:1px}
.shell-header-title{display:flex;align-items:center;gap:9px;min-width:0}
.shell-header-product{font-size:14px;font-weight:750;white-space:nowrap}
.shell-header-divider{width:1px;height:18px;flex-shrink:0}
.shell-header-context{font-size:12.5px;font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.profile-menu-item{width:100%;border:0;background:transparent;padding:9px 11px;border-radius:8px;font:inherit;font-size:12.5px;text-align:left;cursor:pointer;transition:background .15s ease}
.profile-menu-item:focus-visible{outline:2px solid #F47920;outline-offset:1px}
.ai-progress-overlay{position:fixed;inset:0;z-index:300;display:grid;place-items:center;padding:20px;background:rgba(15,23,42,.6)}
.ai-progress-panel{width:min(100%,460px);padding:28px;text-align:center;box-shadow:0 18px 48px rgba(15,23,42,.28)}
.ai-error-toast{position:fixed;right:20px;bottom:20px;z-index:300;width:min(420px,calc(100vw - 40px));padding:14px 16px;display:flex;gap:12px;align-items:flex-start;box-shadow:0 8px 24px rgba(15,23,42,.18)}
@media(max-width:1020px){.ui-stat-grid{grid-template-columns:1fr 1fr}.audit-setup,.settings-grid{grid-template-columns:1fr}.form-page-grid{grid-template-columns:280px minmax(0,1fr)}}
@media(max-width:860px){.ui-table-wrap{display:none}.ui-mobile-list,.results-mobile-list{display:block}.upload-files-grid,.form-page-grid{grid-template-columns:1fr}.identity-panel{text-align:left;display:grid;grid-template-columns:auto 1fr;column-gap:14px}.identity-avatar{grid-row:1/4;margin:0}.results-hero{flex-direction:column}.page-actions{justify-content:flex-start}.audit-setup{grid-template-columns:1fr}}
@media(max-width:680px){.app-main{padding:22px 14px 36px}.ui-stat-grid,.upload-files-grid,.form-fields{grid-template-columns:1fr}.ui-toolbar{align-items:stretch;flex-direction:column}.ui-search{max-width:none}.ui-toolbar-group{width:100%;overflow-x:auto;flex-wrap:nowrap}.audit-action-bar{align-items:stretch;flex-direction:column}.audit-action-bar .cs-btn{width:100%}.ui-mobile-meta,.settings-grid{grid-template-columns:1fr}.shell-header-context,.shell-header-divider,.shell-theme-label{display:none}.result-values{grid-template-columns:1fr 1fr}.detail-metrics{grid-template-columns:1fr}.detail-drawer{width:100%}.ui-mobile-actions{grid-template-columns:1fr}.form-actions{align-items:stretch;flex-direction:column}.form-actions .cs-btn{width:100%}.ai-progress-panel{padding:22px 18px}.ai-error-toast{right:12px;bottom:12px;width:calc(100vw - 24px)}}
@media(prefers-reduced-motion:reduce){.fade-in,.metric-card,.card-hover,.detail-drawer{animation:none!important;transition:none!important}}
`;

function InterfaceStyles() { return <style>{INTERFACE_CSS}</style>; }

// Cabeçalho de página padrão (título + subtítulo + ação à direita).
function PageHeader({ t, title, subtitle, right }) {
  return (
    <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", gap:16, flexWrap:"wrap", marginBottom:28 }}>
      <div>
        <h1 style={{ fontSize:24, fontWeight:700, color:t.text, letterSpacing:0, marginBottom:5, lineHeight:1.2 }}>{title}</h1>
        {subtitle && <p style={{ fontSize:13.5, color:t.muted, lineHeight:1.5 }}>{subtitle}</p>}
      </div>
      {right}
    </div>
  );
}

// Campo de formulário: rótulo + conteúdo + dica opcional.
function Field({ t, label, hint, htmlFor, children, style }) {
  return (
    <div style={style}>
      {label && <label htmlFor={htmlFor} style={{ fontSize:12, fontWeight:600, color:t.muted, display:"block", marginBottom:7 }}>{label}</label>}
      {children}
      {hint && <div style={{ fontSize:11, color:t.muted, marginTop:5, lineHeight:1.5 }}>{hint}</div>}
    </div>
  );
}

function TextInput({ t, dark, style, ...props }) {
  return (
    <input
      className="cs-input"
      style={{
        padding: "11px 14px",
        border: `1px solid ${t.border}`,
        background: inputBg(dark),
        color: props.readOnly || props.disabled ? t.muted : t.text,
        ...style,
      }}
      {...props}
    />
  );
}

function SelectInput({ t, dark, style, children, ...props }) {
  return (
    <select
      className="cs-input cs-select"
      style={{
        padding: "11px 14px",
        border: `1px solid ${t.border}`,
        background: inputBg(dark),
        color: props.disabled ? t.muted : t.text,
        ...style,
      }}
      {...props}
    >
      {children}
    </select>
  );
}

function Button({ t, dark, variant = "primary", size = "md", fullWidth, style, children, ...props }) {
  const pad = size === "sm" ? "8px 14px" : size === "lg" ? "13px 26px" : "10px 20px";
  const ghost = variant === "ghost" || variant === "subtle";
  const cls =
    variant === "primary" ? "cs-btn cs-btn-primary" :
    variant === "danger"  ? "cs-btn cs-btn-danger"  : "cs-btn cs-btn-ghost";
  return (
    <button
      className={cls}
      style={{
        padding: pad,
        fontSize: size === "lg" ? 14 : 13,
        ...(fullWidth ? { width: "100%" } : null),
        ...(ghost ? {
          background: variant === "subtle" ? (dark ? "rgba(255,255,255,.05)" : "rgba(15,23,42,.03)") : "transparent",
          border: `1px solid ${t?.border || "#1a2b4a"}`,
          color: t?.muted || "#64748b",
        } : null),
        ...style,
      }}
      {...props}
    >
      {children}
    </button>
  );
}

// Alerta inline (erro/sucesso/aviso) com cores consistentes.
function Alert({ tone = "error", children, onClose, style }) {
  const map = {
    error:   ["#ef4444", "#ef444440", "#ef444415"],
    success: ["#10b981", "#10b98140", "#10b98115"],
    warn:    ["#f59e0b", "#f59e0b40", "#f59e0b15"],
  };
  const [c, b, bg] = map[tone] || map.error;
  return (
    <div role={tone === "error" ? "alert" : "status"} aria-live={tone === "error" ? "assertive" : "polite"} aria-atomic="true"
      style={{ background:bg, border:`1px solid ${b}`, borderRadius:10, padding:"11px 14px", fontSize:12.5, color:c, lineHeight:1.55, display:"flex", gap:10, alignItems:"flex-start", ...style }}>
      <div style={{ flex:1 }}>{children}</div>
      {onClose && <button onClick={onClose} className="cs-icon-btn" style={{ color:c, padding:2, margin:-2 }} aria-label="Fechar">{ICONS.x}</button>}
    </div>
  );
}

// Modal padrão: overlay + rolagem segura (nunca corta o topo) + cabeçalho/rodapé
// fixos, responsivo (tela cheia no mobile). Fecha no ESC e no clique fora.
function Modal({ t, dark, title, subtitle, onClose, footer, children, size = "md", danger = false }) {
  const dialogRef = useRef(null);
  const closeRef = useRef(onClose);
  const modalId = useId();
  const titleId = `${modalId}-title`;
  const descriptionId = `${modalId}-description`;
  closeRef.current = onClose;

  useEffect(() => {
    const previousFocus = document.activeElement;
    const previousOverflow = document.body.style.overflow;
    const onKey = (event) => {
      if (event.key === "Escape") {
        closeRef.current?.();
        return;
      }
      if (event.key !== "Tab" || !dialogRef.current) return;
      const focusable = [...dialogRef.current.querySelectorAll(
        'button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled]),a[href],[tabindex]:not([tabindex="-1"])'
      )].filter(element => element.getClientRects().length > 0);
      if (!focusable.length) {
        event.preventDefault();
        dialogRef.current.focus();
        return;
      }
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && (document.activeElement === first || !dialogRef.current.contains(document.activeElement))) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", onKey);
    const focusFrame = requestAnimationFrame(() => {
      const initialTarget = dialogRef.current?.querySelector('[data-modal-autofocus="true"]');
      (initialTarget || dialogRef.current)?.focus();
    });
    return () => {
      cancelAnimationFrame(focusFrame);
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onKey);
      previousFocus?.focus?.();
    };
  }, []);

  const maxWidth = size === "sm" ? 420 : size === "lg" ? 760 : 560;
  return createPortal(
    <>
      <div className="cs-modal-overlay" />
      <div className="cs-modal-wrap" onClick={onClose}>
        <div
          ref={dialogRef}
          className="cs-modal"
          style={{ ...t.card, border:`1px solid ${danger ? "#ef444455" : t.border}`, maxWidth }}
          onClick={(e) => e.stopPropagation()}
          role="dialog"
          aria-modal="true"
          aria-label={title ? undefined : "Janela de diálogo"}
          aria-labelledby={title ? titleId : undefined}
          aria-describedby={subtitle ? descriptionId : undefined}
          tabIndex={-1}
        >
          {(title || onClose) && (
            <div className="cs-modal-head" style={{ borderBottom:`1px solid ${t.border}`, ...t.card, borderRadius:"12px 12px 0 0", position:"sticky", top:0, zIndex:2 }}>
              <div>
                {title && <div id={titleId} style={{ fontSize:16, fontWeight:700, color:t.text, letterSpacing:"-.01em" }}>{title}</div>}
                {subtitle && <div id={descriptionId} style={{ fontSize:12.5, color:t.muted, marginTop:3, lineHeight:1.5 }}>{subtitle}</div>}
              </div>
              {onClose && <button className="cs-icon-btn" onClick={onClose} style={{ color:t.muted }} aria-label="Fechar">{ICONS.x}</button>}
            </div>
          )}
          <div className="cs-modal-body">{children}</div>
          {footer && <div className="cs-modal-foot" style={{ borderTop:`1px solid ${t.border}`, ...t.card, borderRadius:"0 0 12px 12px" }}>{footer}</div>}
        </div>
      </div>
    </>,
    document.body,
  );
}

function Drawer({ t, title, subtitle, onClose, children }) {
  const drawerRef = useRef(null);
  const closeRef = useRef(onClose);
  const drawerId = useId();
  closeRef.current = onClose;

  useEffect(() => {
    const previousFocus = document.activeElement;
    const previousOverflow = document.body.style.overflow;
    const onKey = (event) => {
      if (event.key === 'Escape') {
        closeRef.current?.();
        return;
      }
      if (event.key !== 'Tab' || !drawerRef.current) return;
      const focusable = [...drawerRef.current.querySelectorAll(
        'button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled]),a[href],[tabindex]:not([tabindex="-1"])'
      )].filter(element => element.getClientRects().length > 0);
      if (!focusable.length) {
        event.preventDefault();
        drawerRef.current.focus();
        return;
      }
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && (document.activeElement === first || document.activeElement === drawerRef.current)) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    document.body.style.overflow = 'hidden';
    document.addEventListener('keydown', onKey);
    const focusFrame = requestAnimationFrame(() => drawerRef.current?.focus());
    return () => {
      cancelAnimationFrame(focusFrame);
      document.body.style.overflow = previousOverflow;
      document.removeEventListener('keydown', onKey);
      previousFocus?.focus?.();
    };
  }, []);

  return createPortal(
    <>
      <div className="drawer-overlay" style={{ zIndex:220 }} onClick={onClose} />
      <aside ref={drawerRef} className="detail-drawer" style={{ ...t.card, borderLeft:`1px solid ${t.border}` }}
        role="dialog" aria-modal="true" aria-labelledby={`${drawerId}-title`}
        aria-describedby={subtitle ? `${drawerId}-description` : undefined} tabIndex={-1}>
        <div className="detail-drawer-head" style={{ borderBottom:`1px solid ${t.border}` }}>
          <div>
            <div id={`${drawerId}-title`} style={{ fontSize:15, fontWeight:700, color:t.text }}>{title}</div>
            {subtitle && <div id={`${drawerId}-description`} style={{ fontSize:11.5, color:t.muted, marginTop:3, lineHeight:1.45 }}>{subtitle}</div>}
          </div>
          <button type="button" className="cs-icon-btn" onClick={onClose} style={{ color:t.muted }} aria-label="Fechar detalhes">{ICONS.x}</button>
        </div>
        <div className="detail-drawer-body">{children}</div>
      </aside>
    </>,
    document.body,
  );
}

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
  const [sidebarOpen,   setSidebarOpen]   = useState(() => typeof window === 'undefined' || window.innerWidth > 768);
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
  const activeNavItem = navItems.find(item => item.id === activePage || (activePage === 'results' && item.id === 'audits'));
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
      <UIStyles />
      <InterfaceStyles />
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=DM+Mono:wght@400;500&display=swap');
        *{box-sizing:border-box;margin:0;padding:0}
        ::-webkit-scrollbar{width:6px;height:6px}
        ::-webkit-scrollbar-track{background:transparent}
        ::-webkit-scrollbar-thumb{background:${dark?"#334155":"#cbd5e1"};border-radius:3px}
        .nav-item{transition:background .15s ease,color .15s ease;cursor:pointer;border-radius:6px}
        .nav-item:hover{background:${dark?"rgba(244,121,32,.15)":"rgba(244,121,32,.08)"}}
        .nav-item.active{background:${dark?"rgba(244,121,32,.2)":"rgba(244,121,32,.12)"}}
        .btn-primary{transition:background .15s ease,border-color .15s ease;cursor:pointer}
        .btn-primary:hover{filter:brightness(.96)}
        .card-hover{transition:border-color .15s ease}
        .card-hover:hover{border-color:${dark?'#334766':'#d2d9e3'}!important}
        .upload-area{transition:all .2s ease;cursor:pointer}
        .upload-area:hover{border-color:#F47920!important;background:${dark?"rgba(244,121,32,.08)":"rgba(244,121,32,.04)"}!important}
        .spin{animation:spin 1s linear infinite}
        @keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}
        @keyframes fadeIn{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:none}}
        .fade-in{animation:fadeIn .25s ease forwards}
        .progress-bar{transition:width .5s ease}
        .step-item{transition:all .3s ease}
        .badge{display:inline-flex;align-items:center;padding:2px 10px;border-radius:20px;font-size:11px;font-weight:600;letter-spacing:.03em}
        .btn-sm{transition:all .15s ease;cursor:pointer}
        .btn-sm:hover{opacity:.8}
        .metric-card{transition:border-color .15s ease}
        .metric-card:hover{border-color:${dark?'#334766':'#d2d9e3'}!important}
        .table-row{transition:background .15s ease}
        .table-row:hover{background:${dark?"rgba(255,255,255,.03)":"rgba(0,0,0,.02)"}!important}
        .drawer-overlay{position:fixed;inset:0;background:rgba(15,23,42,.52);z-index:100;animation:fadeIn .15s ease}
        .drawer{position:fixed;right:0;top:0;bottom:0;width:520px;max-width:95vw;z-index:101;animation:slideIn .3s ease;overflow-y:auto}
        @keyframes slideIn{from{transform:translateX(100%)}to{transform:translateX(0)}}
        .toggle-btn{transition:all .2s ease;cursor:pointer}
        .toggle-btn:hover{opacity:.8}
        .ai-card{position:relative;overflow:hidden}
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

      {aiLoading && (
        <div className="ai-progress-overlay" role="status" aria-live="polite" aria-label="Gerando relatório com inteligência artificial">
          <div className="ai-progress-panel" style={{ ...t.card, border:`1px solid ${t.border}`, borderRadius:RADIUS.lg }}>
            <div style={{ width:52, height:52, borderRadius:10, background:'#1A2B6B', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 18px', color:'#fff' }}>
              {ICONS.brain}
            </div>
            <h2 style={{ fontSize:18, fontWeight:750, color:t.text, marginBottom:6 }}>Gerando relatório com IA</h2>
            <p style={{ fontSize:12.5, color:t.muted, marginBottom:22, lineHeight:1.55 }}>
              As divergências estão sendo analisadas para criar o relatório executivo.
            </p>
            <div style={{ display:'flex', justifyContent:'center', gap:7, marginBottom:22 }}>
              <span className="ai-loading-dot" />
              <span className="ai-loading-dot" />
              <span className="ai-loading-dot" />
            </div>
            <div style={{ display:'flex', flexDirection:'column', gap:8, textAlign:'left' }}>
              {[
                'Consolidando divergências por médico',
                'Identificando riscos financeiros',
                'Preparando o plano de ação',
              ].map((text) => (
                <div key={text} style={{ display:'flex', alignItems:'center', gap:9, color:t.muted, fontSize:11.5 }}>
                  <div style={{ width:5, height:5, borderRadius:'50%', background:'#F47920', flexShrink:0 }} />
                  {text}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {aiError && (
        <div className="ai-error-toast" role="alert" style={{ ...t.card, border:'1px solid #ef444450', borderRadius:RADIUS.lg }}>
          <span style={{ color:'#ef4444', flexShrink:0, marginTop:2 }}>{ICONS.warning}</span>
          <div style={{ flex:1 }}>
            <div style={{ fontSize:13, fontWeight:650, color:t.text, marginBottom:3 }}>Não foi possível gerar o relatório</div>
            <div style={{ fontSize:11.5, color:t.muted, lineHeight:1.5 }}>{aiError}</div>
          </div>
          <button type="button" className="cs-icon-btn" onClick={() => setAiError(null)} aria-label="Fechar erro" style={{ color:t.muted }}>{ICONS.x}</button>
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
          <div style={{ width:38, height:38, borderRadius:8, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0, overflow:"hidden", background:BRAND.grad }}>
            <img src="/logo.png" alt="ConSaúde" style={{ width:"100%", height:"100%", objectFit:"contain" }}
              onError={e => { e.target.style.display='none'; e.target.parentNode.innerHTML='<span style="color:white;font-size:16px;font-weight:900">C</span>'; }} />
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
              <button key={item.id} type="button"
                className={`shell-nav-button nav-item ${isActive?"active":""}`}
                onClick={() => { setActivePage(item.id); if(window.innerWidth<=768) setSidebarOpen(false); }}
                aria-current={isActive?'page':undefined}
                aria-label={sidebarOpen?undefined:item.label}
                title={sidebarOpen?undefined:item.label}
                style={{ color:isActive?'#F47920':t.muted, borderLeftColor:isActive?'#F47920':'transparent' }}>
                <span style={{ flexShrink:0 }}>{item.icon}</span>
                {sidebarOpen && <span style={{ fontSize:13.5, fontWeight:500, whiteSpace:"nowrap" }}>{item.label}</span>}
              </button>
            );
          })}
        </nav>

        <div style={{ padding:"16px 10px", borderTop:`1px solid ${t.border}` }}>
          <button type="button" className="shell-nav-button nav-item" onClick={() => setSidebarOpen((p)=>!p)}
            aria-label={sidebarOpen?'Recolher navegação':'Expandir navegação'} style={{ color:t.muted }}>
            <span style={{ transform:sidebarOpen?"rotate(180deg)":"rotate(0)", transition:"transform .3s", flexShrink:0 }}>
              {ICONS.chevronRight}
            </span>
            {sidebarOpen && <span style={{ fontSize:13, whiteSpace:"nowrap" }}>Recolher</span>}
          </button>
        </div>
      </aside>

      <div className={`sidebar-mobile-overlay ${sidebarOpen?"show":""}`} onClick={() => setSidebarOpen(false)} />

      {/* Main */}
      <div className="main-content" style={{ marginLeft:sidebarOpen?240:72, flex:1, transition:"margin-left .3s ease", display:"flex", flexDirection:"column", minHeight:"100vh" }}>
        <header style={{ ...t.header, borderBottom:`1px solid ${t.border}`, padding:"0 20px", height:64, display:"flex", alignItems:"center", justifyContent:"space-between", position:"sticky", top:0, zIndex:40 }}>
          <div style={{ display:"flex", alignItems:"center", gap:12 }}>
            <button type="button" className="cs-icon-btn" onClick={() => setSidebarOpen((p)=>!p)} aria-label={sidebarOpen?'Fechar navegação':'Abrir navegação'} style={{ color:t.muted }}>
              {ICONS.menu}
            </button>
            <div className="shell-header-title">
              <span className="shell-header-product"><span style={{ color:'#F47920' }}>Con</span><span style={{ color:dark?'#f1f5f9':'#1A2B6B' }}>Saúde</span></span>
              <span className="shell-header-divider" style={{ background:t.border }} />
              <span className="shell-header-context" style={{ color:t.muted }}>{processing?'Processando auditoria':activeNavItem?.label||'Configurações'}</span>
            </div>
          </div>
          <div style={{ display:"flex", alignItems:"center", gap:12 }}>
            <button type="button" className="toggle-btn" onClick={() => setDark((p)=>!p)} aria-label={dark?'Ativar tema claro':'Ativar tema escuro'}
              style={{ background:dark?'#1e293b':'#f1f5f9', border:`1px solid ${t.border}`, borderRadius:8, padding:'7px 9px', color:t.text, display:'flex', alignItems:'center', gap:6, fontSize:12, fontWeight:500 }}>
              {dark?ICONS.sun:ICONS.moon}
              <span className="shell-theme-label">{dark?'Claro':'Escuro'}</span>
            </button>
            <div ref={profileRef} style={{ position:"relative" }}>
              <button type="button" onClick={() => setProfileOpen((p)=>!p)} aria-label="Abrir menu da conta" aria-haspopup="menu" aria-expanded={profileOpen}
                style={{ background:'#1A2B6B', border:`1px solid ${dark?'#40558c':'#d7deec'}`, borderRadius:8, width:36, height:36, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', color:'white', fontWeight:700, fontSize:14 }}>
                {(currentUser.name||currentUser.email||'U').charAt(0).toUpperCase()}
              </button>
              {profileOpen && (
                <div role="menu" style={{ position:'absolute', right:0, top:44, ...t.card, borderRadius:8, border:`1px solid ${t.border}`, padding:8, minWidth:220, boxShadow:'0 8px 24px rgba(15,23,42,.16)', zIndex:50 }}>
                  <div style={{ padding:"8px 12px", borderBottom:`1px solid ${t.border}`, marginBottom:4 }}>
                    <div style={{ fontSize:13, fontWeight:600, color:t.text }}>{currentUser.name}</div>
                    <div style={{ fontSize:11, color:t.muted, overflowWrap:'anywhere', marginTop:2 }}>{currentUser.email}</div>
                    <span style={{ display:"inline-flex", marginTop:4, padding:"2px 8px", borderRadius:20, fontSize:10, fontWeight:700, background:currentUser.role==="admin"?"#F4792018":"#2B4AA018", color:currentUser.role==="admin"?"#F47920":"#2B4AA0" }}>
                      {currentUser.role==="admin"?"Administrador":"Usuário"}
                    </span>
                  </div>
                  {[
                    { label:"Meu Perfil", action:() => { setActivePage("profile"); setProfileOpen(false); } },
                    { label:"Configurações", action:() => { setActivePage("settings-page"); setProfileOpen(false); } },
                    { label:"Sair", action:handleLogout, danger:true },
                  ].map(({ label, action, danger }) => (
                    <button key={label} type="button" role="menuitem" className="profile-menu-item nav-item" onClick={action} style={{ color:danger?'#ef4444':t.text }}>{label}</button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </header>

        <main className="app-main">
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
  const t = themes.dark;

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
    <div style={{ minHeight:'100vh', background:'#111b2a', display:'flex', alignItems:'center', justifyContent:'center', fontFamily:"'DM Sans','Segoe UI',sans-serif", padding:20 }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&display=swap');*{box-sizing:border-box;margin:0;padding:0}.login-input:focus{border-color:#F47920!important;outline:none}`}</style>
      <UIStyles />

      <div style={{ width:'100%', maxWidth:420, position:'relative' }}>
        {/* Logo */}
        <div style={{ textAlign:'center', marginBottom:36 }}>
          <div style={{ width:64, height:64, borderRadius:10, background:'#ffffff', border:'1px solid #dfe4ea', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 16px', overflow:'hidden' }}>
            <img src="/logo.png" alt="ConSaúde" style={{ width:'100%', height:'100%', objectFit:'contain' }}
              onError={e => { e.target.style.display='none'; e.target.parentNode.innerHTML='<span style="color:#1A2B6B;font-size:28px;font-weight:800">C</span>'; }} />
          </div>
          <div style={{ fontSize:28, fontWeight:700, letterSpacing:0, marginBottom:4 }}>
            <span style={{ color:'#F47920' }}>Con</span><span style={{ color:'#f1f5f9' }}>Saúde</span>
          </div>
          <div style={{ fontSize:13, color:'#64748b' }}>Sistema de Auditoria Médica</div>
        </div>

        {/* Card */}
        <div style={{ background:'#172231', border:'1px solid #2a3a50', borderRadius:12, padding:'32px', boxShadow:'0 12px 32px rgba(0,0,0,.22)' }}>
          <h2 style={{ fontSize:20, fontWeight:700, color:'#f1f5f9', marginBottom:6, letterSpacing:0 }}>Bem-vindo de volta</h2>
          <p style={{ fontSize:13, color:'#64748b', marginBottom:28 }}>Entre com sua conta para acessar o sistema.</p>

          <form onSubmit={submit}>
            <div style={{ marginBottom:16 }}>
              <label style={{ fontSize:12, fontWeight:600, color:'#94a3b8', display:'block', marginBottom:6 }}>E-mail</label>
              <TextInput t={t} dark type="email" value={email} required placeholder="seu@email.com.br"
                onChange={e => setEmail(e.target.value)} />
            </div>

            <div style={{ marginBottom:16 }}>
              <label style={{ fontSize:12, fontWeight:600, color:'#94a3b8', display:'block', marginBottom:6 }}>Senha</label>
              <div style={{ position:'relative' }}>
                <TextInput t={t} dark type={showPwd?'text':'password'} value={password} required placeholder="••••••••"
                  onChange={e => setPassword(e.target.value)} style={{ paddingRight:42 }} />
                <button type="button" onClick={() => setShowPwd(p=>!p)} style={{ position:'absolute', right:12, top:'50%', transform:'translateY(-50%)', background:'none', border:'none', color:'#64748b', cursor:'pointer', display:'flex', alignItems:'center', padding:0 }}>
                  {showPwd ? ICONS.eye : eyeOffIcon}
                </button>
              </div>
            </div>

            {error && (
              <Alert tone="error" style={{ marginBottom:16 }}>{error}</Alert>
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

            <Button t={t} dark type="submit" size="lg" fullWidth disabled={loading}>
              {loading ? 'Entrando...' : 'Entrar'}
            </Button>
          </form>
        </div>

        <p style={{ textAlign:'center', fontSize:12, color:'#64748b', marginTop:24 }}>
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
  const t = themes.dark;

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
    <div style={{ minHeight:'100vh', background:'#111b2a', display:'flex', alignItems:'center', justifyContent:'center', fontFamily:"'DM Sans','Segoe UI',sans-serif", padding:20 }}>
      <UIStyles />
      <div style={{ width:'100%', maxWidth:420, position:'relative' }}>
        <div style={{ textAlign:'center', marginBottom:36 }}>
          <div style={{ fontSize:28, fontWeight:700, letterSpacing:0, marginBottom:4 }}>
            <span style={{ color:'#F47920' }}>Con</span><span style={{ color:'#f1f5f9' }}>Saúde</span>
          </div>
        </div>
        <div style={{ background:'#172231', border:'1px solid #2a3a50', borderRadius:12, padding:'32px', boxShadow:'0 12px 32px rgba(0,0,0,.22)' }}>
          {submitted ? (
            <div style={{ textAlign:'center' }}>
              <div style={{ width:56, height:56, borderRadius:16, background:'#10b98120', border:'1px solid #10b98130', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 20px', color:'#10b981', fontSize:22 }}>✓</div>
              <h2 style={{ fontSize:18, fontWeight:700, color:'#f1f5f9', marginBottom:12 }}>Verifique seu e-mail</h2>
              <p style={{ fontSize:13, color:'#94a3b8', lineHeight:1.65, marginBottom:24 }}>
                Se houver uma conta para <strong style={{ color:'#f1f5f9' }}>{email}</strong>, você receberá um link para criar uma nova senha.<br/><br/>
                O link expira em 1 hora. Confira também a caixa de spam.
              </p>
              <Button t={t} dark onClick={onBack}>Voltar ao login</Button>
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
                <TextInput t={t} dark type="email" value={email} placeholder="seu@email.com.br"
                  onKeyDown={e => { if (e.key === 'Enter') enviar(); }}
                  onChange={e => setEmail(e.target.value)} />
              </div>
              {error && <Alert tone="error" style={{ marginBottom:16 }}>{error}</Alert>}
              <Button t={t} dark fullWidth onClick={enviar} disabled={sending}>
                {sending ? 'Enviando…' : 'Enviar link de redefinição'}
              </Button>
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
  const t = themes.dark;

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
    <div style={{ minHeight:'100vh', background:'#111b2a', display:'flex', alignItems:'center', justifyContent:'center', fontFamily:"'DM Sans','Segoe UI',sans-serif", padding:20 }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&display=swap');*{box-sizing:border-box;margin:0;padding:0}.login-input:focus{border-color:#F47920!important;outline:none}`}</style>
      <UIStyles />
      <div style={{ width:'100%', maxWidth:420, position:'relative' }}>
        <div style={{ textAlign:'center', marginBottom:28 }}>
          <div style={{ fontSize:28, fontWeight:700, letterSpacing:0, marginBottom:4 }}>
            <span style={{ color:'#F47920' }}>Con</span><span style={{ color:'#f1f5f9' }}>Saúde</span>
          </div>
        </div>
        <div style={{ background:'#172231', border:'1px solid #2a3a50', borderRadius:12, padding:'32px', boxShadow:'0 12px 32px rgba(0,0,0,.22)' }}>
          <h2 style={{ fontSize:20, fontWeight:700, color:'#f1f5f9', marginBottom:6, letterSpacing:0 }}>Defina sua senha</h2>
          <p style={{ fontSize:13, color:'#64748b', marginBottom:24, lineHeight:1.55 }}>
            Olá, {user.name?.split(' ')[0]}. Sua conta usa uma senha temporária. Escolha uma senha pessoal para continuar.
          </p>
          <form onSubmit={submit}>
            {campos.map(({ key, label, ph }) => (
              <div key={key} style={{ marginBottom:16 }}>
                <label style={{ fontSize:12, fontWeight:600, color:'#94a3b8', display:'block', marginBottom:6 }}>{label}</label>
                <TextInput t={t} dark type="password" value={form[key]} required placeholder={ph}
                  onChange={e => setForm(p => ({ ...p, [key]: e.target.value }))} />
              </div>
            ))}
            {erro && <Alert tone="error" style={{ marginBottom:16 }}>{erro}</Alert>}
            <Button t={t} dark type="submit" size="lg" fullWidth disabled={salvando}>
              {salvando ? 'Salvando…' : 'Salvar e entrar'}
            </Button>
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
    <div style={{ minHeight:'100vh', background:'#111b2a', display:'flex', alignItems:'center', justifyContent:'center', fontFamily:"'DM Sans','Segoe UI',sans-serif", padding:20 }}>
      <div style={{ maxWidth:460, background:'#172231', border:'1px solid #2a3a50', borderRadius:12, padding:'32px' }}>
        <div style={{ fontSize:26, fontWeight:700, letterSpacing:0, marginBottom:16 }}>
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
  const selectedCount = Number(Boolean(file1)) + Number(Boolean(file2));
  const cards = [
    { label:"Relatório de Produção", subtitle:"Base dos atendimentos realizados", file:file1, setFile:setFile1, drag:drag1, setDrag:setDrag1, accent:"#F47920", num:1, cols:cols1, err:uploadError?.prod },
    { label:"Relatório de Repasse", subtitle:"Base dos valores repassados", file:file2, setFile:setFile2, drag:drag2, setDrag:setDrag2, accent:"#2563eb", num:2, cols:cols2, err:uploadError?.rep },
  ];

  return (
    <div className="app-page-medium fade-in">
      <PageHeader t={t} title="Nova auditoria"
        subtitle="Prepare os relatórios de produção e repasse para iniciar a comparação."
        right={
          <span className="badge" style={{ background:canStart?'#05966916':'#d9770616', color:canStart?'#059669':'#d97706', padding:'7px 11px' }}>
            {canStart ? 'Arquivos prontos' : `${selectedCount} de 2 arquivos`}
          </span>
        } />

      {uploadError?.geral && (
        <Alert tone="error" style={{ marginBottom:18 }}>{uploadError.geral}</Alert>
      )}

      <div className="upload-files-grid">
        {cards.map(({ label, subtitle, file, setFile, drag, setDrag, accent, num, cols, err }) => (
          <section key={num} className="upload-file-card" style={{ ...t.card, borderRadius:RADIUS.lg, border:`1px solid ${err ? '#ef444470' : t.border}` }}>
            <div className="upload-file-head" style={{ borderBottom:`1px solid ${t.border}` }}>
              <div className="upload-step" style={{ background:file?'#059669':accent }}>{file ? ICONS.check : num}</div>
              <div>
                <div className="upload-file-title" style={{ color:t.text }}>{label}</div>
                <div className="upload-file-subtitle" style={{ color:t.muted }}>{subtitle}</div>
              </div>
            </div>
            <div className="upload-file-body">
              {err && (
                <Alert tone="error" style={{ marginBottom:12 }}>
                  {err.map((message, index) => <div key={index} style={{ marginBottom:index<err.length-1?4:0 }}>{message}</div>)}
                </Alert>
              )}
              {file ? (
                <div className="upload-ready">
                  <div style={{ width:50, height:50, borderRadius:13, background:'#05966916', display:'flex', alignItems:'center', justifyContent:'center', color:'#059669' }}>
                    {ICONS.spreadsheet}
                  </div>
                  <div style={{ width:'100%' }}>
                    <div className="upload-file-name" title={file.name} style={{ color:t.text }}>{file.name}</div>
                    <div style={{ fontSize:10.5, color:t.muted, marginTop:4 }}>{(file.size/1024).toFixed(1)} KB · Arquivo validado</div>
                  </div>
                  {cols && (
                    <div className="upload-tags">
                      {cols.medicoCol   && <span className="col-tag">{ICONS.tag}&nbsp;Médico: {cols.medicoCol}</span>}
                      {cols.pacienteCol && <span className="col-tag">{ICONS.tag}&nbsp;Paciente: {cols.pacienteCol}</span>}
                      {cols.valorCol    && <span className="col-tag">{ICONS.tag}&nbsp;Valor: {cols.valorCol}</span>}
                      {!cols.medicoCol  && <span className="col-tag" style={{ background:"#ef444415", color:"#ef4444" }}>Médico não detectado</span>}
                      {!cols.valorCol   && <span className="col-tag" style={{ background:"#ef444415", color:"#ef4444" }}>Valor não detectado</span>}
                    </div>
                  )}
                  <Button t={t} dark={dark} variant="ghost" size="sm" onClick={() => setFile(null)}>Trocar arquivo</Button>
                </div>
              ) : (
                <label
                  className="upload-dropzone"
                  role="button"
                  tabIndex={0}
                  aria-label={`Selecionar ${label}`}
                  onDragEnter={() => setDrag(true)} onDragLeave={() => setDrag(false)}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => { setDrag(false); handleFileDrop(e, setFile); }}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter' || event.key === ' ') {
                      event.preventDefault();
                      event.currentTarget.querySelector('input')?.click();
                    }
                  }}
                  style={{ borderColor:drag?accent:t.border, background:drag?`${accent}0c`:'transparent' }}>
                  <div style={{ width:48, height:48, borderRadius:12, display:'flex', alignItems:'center', justifyContent:'center', color:drag?accent:t.muted, background:drag?`${accent}14`:(dark?'rgba(255,255,255,.04)':'#f1f5f9') }}>{ICONS.spreadsheet}</div>
                  <div>
                    <div style={{ fontSize:13, fontWeight:650, color:t.text, marginBottom:4 }}>Selecione ou arraste o arquivo</div>
                    <div style={{ fontSize:11, color:t.muted }}>.xlsx, .xls ou .csv</div>
                  </div>
                  <span style={{ color:accent, fontSize:11.5, fontWeight:700 }}>Escolher arquivo</span>
                  <input type="file" accept=".xlsx,.xls,.csv" style={{ display:"none" }} onChange={(e) => { if(e.target.files[0]) handleFileSelect(e.target.files[0], setFile); }} />
                </label>
              )}
            </div>
          </section>
        ))}
      </div>

      <div className="audit-setup">
        <section className="ui-panel" style={{ ...t.card, border:`1px solid ${t.border}`, borderRadius:RADIUS.lg }}>
          <div className="ui-panel-head" style={{ borderBottom:`1px solid ${t.border}` }}>
            <div>
              <div className="ui-panel-title" style={{ color:t.text }}>Referência da auditoria</div>
              <div className="ui-panel-copy" style={{ color:t.muted }}>Opcional. Substitui o período detectado nos arquivos.</div>
            </div>
            <div className="ui-stat-icon" style={{ color:'#2563eb', background:'#2563eb14' }}>{ICONS.history}</div>
          </div>
          <div className="ui-panel-body">
            <Field t={t} htmlFor="audit-period" label="Período ou competência">
              <TextInput id="audit-period" t={t} dark={dark} type="text" value={periodoAuditoria}
                onChange={event => setPeriodoAuditoria(event.target.value)}
                placeholder="Ex: Abril de 2025 ou 01–15/04/2025"
                style={{ border:`1.5px solid ${periodoAuditoria ? BRAND.orange : t.border}` }} />
            </Field>
          </div>
        </section>

        <section className="ui-panel" style={{ ...t.card, border:`1px solid ${t.border}`, borderRadius:RADIUS.lg }}>
          <button type="button" onClick={() => setAdvancedOpen(current => !current)} aria-expanded={advancedOpen}
            className="ui-panel-head" style={{ width:'100%', border:0, borderBottom:advancedOpen?`1px solid ${t.border}`:'none', background:'transparent', cursor:'pointer', textAlign:'left' }}>
            <div>
              <div className="ui-panel-title" style={{ color:t.text }}>Opções de comparação</div>
              <div className="ui-panel-copy" style={{ color:t.muted }}>{advancedOpen ? 'Ajuste as regras desta execução.' : 'Usando as opções recomendadas.'}</div>
            </div>
            <span style={{ color:t.muted, transform:advancedOpen?'rotate(180deg)':'rotate(0)', transition:'transform .2s', display:'flex' }}>{ICONS.chevronDown}</span>
          </button>
          {advancedOpen && (
            <div className="ui-panel-body audit-options">
              {[
                { key:'ignorar', label:'Ignorar diferenças abaixo de R$ 0,01' },
                { key:'comparaNome', label:'Comparar pacientes pelo nome' },
                { key:'ia', label:'Gerar análise inteligente' },
              ].map(({ key, label }) => (
                <button key={key} type="button" role="checkbox" aria-checked={configs[key]} className="audit-option"
                  onClick={() => setConfigs(current => ({ ...current, [key]:!current[key] }))}
                  style={{ border:`1px solid ${configs[key]?'#F4792045':t.border}`, background:configs[key]?'#F479200d':'transparent', color:t.text, textAlign:'left' }}>
                  <span className={`checkbox-custom ${configs[key]?'checked':''}`}>
                    {configs[key] && <span style={{ color:'#fff', display:'flex' }}>{ICONS.check}</span>}
                  </span>
                  <span style={{ fontSize:12.5 }}>{label}</span>
                </button>
              ))}
            </div>
          )}
        </section>
      </div>

      <div className="audit-action-bar" style={{ ...t.card, border:`1px solid ${canStart?'#05966945':t.border}`, borderRadius:RADIUS.lg }}>
        <div className="audit-readiness">
          <div className="audit-readiness-icon" style={{ color:canStart?'#059669':'#d97706', background:canStart?'#05966914':'#d9770614' }}>
            {canStart ? ICONS.check : ICONS.warning}
          </div>
          <div>
            <div className="audit-readiness-title" style={{ color:t.text }}>{canStart ? 'Tudo pronto para a comparação' : 'Selecione os dois relatórios'}</div>
            <div className="audit-readiness-copy" style={{ color:t.muted }}>{canStart ? 'A auditoria será processada com as opções acima.' : 'Produção e repasse são necessários para continuar.'}</div>
          </div>
        </div>
        <Button t={t} dark={dark} size="lg" onClick={startAudit} disabled={!canStart} style={{ minWidth:210 }}>
          Iniciar auditoria {ICONS.chevronRight}
        </Button>
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
  const completedSteps = steps.filter(Boolean).length;
  const activeStep = Math.min(completedSteps, labels.length - 1);
  return (
    <div className="app-page-narrow fade-in" style={{ paddingTop:'clamp(18px,5vh,60px)' }}>
      <section className="ui-panel" style={{ ...t.card, borderRadius:RADIUS.lg, border:`1px solid ${t.border}` }} aria-live="polite" aria-busy="true">
        <div className="ui-panel-head" style={{ borderBottom:`1px solid ${t.border}`, alignItems:'center' }}>
          <div style={{ display:'flex', alignItems:'center', gap:12 }}>
            <div style={{ width:44, height:44, borderRadius:8, background:'#1A2B6B', display:'flex', alignItems:'center', justifyContent:'center', color:'#fff' }}>
              <span className="spin" style={{ display:'flex' }}>{ICONS.loader}</span>
            </div>
            <div>
              <div style={{ fontSize:16, fontWeight:750, color:t.text }}>Processando auditoria</div>
              <div style={{ fontSize:11.5, color:t.muted, marginTop:3 }}>{labels[activeStep]}</div>
            </div>
          </div>
          <div style={{ fontSize:22, fontWeight:750, color:'#F47920' }}>{Math.round(progress)}%</div>
        </div>

        <div className="ui-panel-body">
          <div style={{ height:8, borderRadius:8, background:dark?'#0f172a':'#e2e8f0', overflow:'hidden', marginBottom:24 }}
            role="progressbar" aria-label="Progresso da auditoria" aria-valuemin="0" aria-valuemax="100" aria-valuenow={Math.round(progress)}>
            <div className="progress-bar" style={{ height:'100%', width:`${progress}%`, background:'#F47920', borderRadius:8 }} />
          </div>

          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(210px,1fr))', gap:9 }}>
            {labels.map((label, index) => {
              const completed = steps[index];
              const active = !completed && index === activeStep;
              return (
                <div key={label} className="step-item" style={{ display:'flex', alignItems:'center', gap:10, padding:'10px 11px', borderRadius:9, border:`1px solid ${active?'#F4792050':t.border}`, background:active?'#F479200d':'transparent' }}>
                  <div style={{ width:27, height:27, borderRadius:8, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, background:completed?'#059669':(active?'#F47920':(dark?'#1e293b':'#f1f5f9')), color:completed||active?'#fff':t.muted }}>
                    {completed ? ICONS.check : active ? <span className="spin" style={{ display:'flex' }}>{ICONS.loader}</span> : <span style={{ fontSize:10.5, fontWeight:700 }}>{index+1}</span>}
                  </div>
                  <span style={{ fontSize:12.5, color:completed||active?t.text:t.muted, fontWeight:completed||active?600:400 }}>{label}</span>
                </div>
              );
            })}
          </div>
        </div>
      </section>
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

  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [copiedInsight, setCopiedInsight] = useState(null);
  const normalizedQuery = query.trim().toLocaleLowerCase('pt-BR');
  const visibleDivs = divs.filter((row) => {
    const matchesQuery = !normalizedQuery || String(row.medico || '').toLocaleLowerCase('pt-BR').includes(normalizedQuery);
    const matchesStatus = statusFilter === 'all' || getStatus(row.id) === statusFilter;
    return matchesQuery && matchesStatus;
  });
  const statusFilters = [['all','Todos'], ['pendente','Pendentes'], ['revisado','Revisados'], ['corrigido','Corrigidos']];
  const copyInsight = (text, i) => {
    navigator.clipboard?.writeText(text);
    setCopiedInsight(i);
    setTimeout(() => setCopiedInsight(null), 1500);
  };

  return (
    <div className="app-page fade-in">
      <div className="results-hero">
        <div>
          <h1 style={{ fontSize:26, fontWeight:700, color:t.text, letterSpacing:"-.03em", lineHeight:1.15 }}>Relatório de auditoria</h1>
          <div className="results-context" style={{ color:t.muted }}>
            Processado em {resultados?.processadoEm??'-'} · Referência: <strong style={{ color:t.text }}>{resultados?.referencia??'-'}</strong>
            {resultados && (
              <div style={{ marginTop:2, overflowWrap:'anywhere' }}>{resultados.file1Name} × {resultados.file2Name}</div>
            )}
          </div>
        </div>
        <div className="page-actions">
          <Button t={t} dark={dark} variant="ghost" size="sm" onClick={onNewAudit}>{ICONS.plus} Nova auditoria</Button>
          <Button t={t} dark={dark} size="sm" onClick={onGenerateAI} disabled={!resultados || aiLoading}>
            {aiLoading ? <span className="spin" style={{ display:'flex' }}>{ICONS.loader}</span> : ICONS.brain}
            {aiLoading ? 'Gerando...' : 'Relatório IA'}
          </Button>
          <Button t={t} dark={dark} variant="ghost" size="sm" onClick={onExportPDF} disabled={!resultados} style={{ color:'#F47920' }}>{ICONS.export} PDF</Button>
          <Button t={t} dark={dark} variant="ghost" size="sm" onClick={onExportExcel} disabled={!resultados} style={{ color:'#059669' }}>{ICONS.export} Excel</Button>
          <Button t={t} dark={dark} variant="ghost" size="sm" onClick={onShare} disabled={!resultados}>{ICONS.share} Copiar resumo</Button>
        </div>
      </div>

      <div className="ui-stat-grid" aria-label="Resumo da auditoria">
        {metrics.map(({ label, value, icon, color, bg }) => (
          <div key={label} className="ui-stat metric-card" style={{ ...t.card, borderRadius:RADIUS.lg, border:`1px solid ${t.border}` }}>
            <div className="ui-stat-top">
              <div className="ui-stat-icon" style={{ background:bg, color }}>{icon}</div>
              <div className="ui-stat-value" style={{ color:t.text, fontSize:String(value).length>10?17:24 }}>{value}</div>
            </div>
            <div>
              <div className="ui-stat-label" style={{ color:t.text }}>{label}</div>
              <div className="ui-stat-detail" style={{ color:t.muted }}>Resultado consolidado</div>
            </div>
          </div>
        ))}
      </div>

      <section className="ui-panel" style={{ ...t.card, borderRadius:RADIUS.lg, border:`1px solid ${t.border}`, marginBottom:18 }} aria-label="Médicos com divergências">
        <div className="ui-panel-head" style={{ borderBottom:`1px solid ${t.border}` }}>
          <div>
            <div className="ui-panel-title" style={{ color:t.text }}>Médicos com divergências</div>
            <div className="ui-panel-copy" style={{ color:t.muted }}>Acompanhe os valores e altere o status conforme a revisão.</div>
          </div>
          {divs.length>0 && <span className="badge" style={{ background:'#dc262616', color:'#dc2626', padding:'5px 9px' }}>{divs.length} médico{divs.length!==1?'s':''}</span>}
        </div>

        {divs.length>0 && (
          <>
            <div className="ui-toolbar" style={{ borderBottom:`1px solid ${t.border}` }}>
              <div className="ui-search">
                <span aria-hidden="true" style={{ position:'absolute', left:13, top:'50%', transform:'translateY(-50%)', color:t.muted, display:'flex', pointerEvents:'none' }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="11" cy="11" r="7"/><line x1="20" y1="20" x2="16.65" y2="16.65"/></svg>
                </span>
                <TextInput t={t} dark={dark} value={query} aria-label="Buscar médico" placeholder="Buscar médico"
                  onChange={event => setQuery(event.target.value)} style={{ paddingLeft:39, paddingRight:query?40:14 }} />
                {query && (
                  <button type="button" className="cs-icon-btn" aria-label="Limpar busca" onClick={() => setQuery('')}
                    style={{ position:'absolute', right:8, top:'50%', transform:'translateY(-50%)', color:t.muted, width:28, height:28 }}>
                    {ICONS.x}
                  </button>
                )}
              </div>
              <div className="ui-toolbar-group" aria-label="Filtrar por status">
                {statusFilters.map(([value, label]) => {
                  const selected = statusFilter === value;
                  return (
                    <button key={value} type="button" className="ui-filter" aria-pressed={selected} onClick={() => setStatusFilter(value)}
                      style={{ borderColor:selected?'#F4792060':t.border, background:selected?'#F4792014':'transparent', color:selected?'#F47920':t.muted }}>
                      {label}
                    </button>
                  );
                })}
              </div>
            </div>
            <div className="ui-count-bar" style={{ color:t.muted, background:dark?'rgba(255,255,255,.015)':'rgba(15,23,42,.018)' }}>
              Exibindo <strong style={{ color:t.text }}>{visibleDivs.length}</strong> de {divs.length} médico(s)
            </div>
          </>
        )}

        {divs.length===0 ? (
          <EmptyState t={t}
            mensagem={resultados ? "Nenhuma divergência encontrada." : "Nenhuma auditoria processada."}
            sub={resultados ? "Os relatórios de produção e repasse estão em plena conformidade." : "Faça upload dos arquivos e inicie a auditoria para ver os resultados aqui."} />
        ) : visibleDivs.length===0 ? (
          <div style={{ padding:'42px 20px', textAlign:'center' }}>
            <div style={{ fontSize:14, fontWeight:700, color:t.text }}>Nenhum médico encontrado</div>
            <div style={{ fontSize:12, color:t.muted, margin:'5px 0 16px' }}>Ajuste a busca ou o filtro de status.</div>
            <Button t={t} dark={dark} variant="ghost" size="sm" onClick={() => { setQuery(''); setStatusFilter('all'); }}>Limpar filtros</Button>
          </div>
        ) : (
          <>
            <div className="ui-table-wrap">
              <table className="ui-table" style={{ minWidth:940 }}>
                <thead style={{ background:dark?'#0f172a':'#f8fafc' }}>
                  <tr>
                    {['Médico','Produção','Repasse','Diferença','Itens','Status'].map(label => <th key={label} style={{ color:t.muted }}>{label}</th>)}
                    <th style={{ color:t.muted, textAlign:'right' }}>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {visibleDivs.map(row => {
                    const status = getStatus(row.id);
                    const detailCount = row.detalhes?.length || 0;
                    const productionHigher = row.sentido === 'prod_maior';
                    return (
                      <tr key={row.id} className="table-row" style={{ borderTop:`1px solid ${t.border}` }}>
                        <td>
                          <div style={{ fontSize:13.5, fontWeight:650, color:t.text }}>{row.medico}</div>
                          <div style={{ fontSize:10.5, color:t.muted, marginTop:2 }}>{detailCount ? `${detailCount} paciente(s)` : 'Sem detalhamento'}</div>
                        </td>
                        <td style={{ color:t.text, fontWeight:600 }}>{row.producao}</td>
                        <td style={{ color:t.text, fontWeight:600 }}>{row.repasse}</td>
                        <td><span title={productionHigher?'Produção maior que repasse':'Repasse maior que produção'} style={{ color:productionHigher?'#d97706':'#dc2626', fontWeight:700 }}>{productionHigher?'Prod':'Rep'} {row.diferenca}</span></td>
                        <td><span className="badge" style={{ background:'#dc262616', color:'#dc2626' }}>{detailCount||'—'}</span></td>
                        <td>
                          <button type="button" className="btn-sm" onClick={() => cycleStatus(row.id)} aria-label={`Alterar status de ${row.medico}. Atual: ${statusLabels[status]}`}
                            style={{ cursor:'pointer', background:'none', border:'none', padding:0 }}>
                            <span className="badge" style={{ background:`${statusColors[status]}18`, color:statusColors[status], padding:'5px 9px' }}>{statusLabels[status]}</span>
                          </button>
                        </td>
                        <td>
                          <div className="ui-table-actions">
                            <Button t={t} dark={dark} variant="subtle" size="sm" onClick={() => setSelectedMedico({ ...row, status })} style={{ padding:'7px 10px', fontSize:11.5 }}>{ICONS.eye} Detalhar</Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="results-mobile-list">
              {visibleDivs.map(row => {
                const status = getStatus(row.id);
                const detailCount = row.detalhes?.length || 0;
                const productionHigher = row.sentido === 'prod_maior';
                return (
                  <article key={row.id} className="result-card" style={{ border:`1px solid ${t.border}`, background:dark?'rgba(255,255,255,.018)':'#fff' }}>
                    <div className="ui-mobile-head">
                      <div>
                        <div style={{ fontSize:13.5, fontWeight:700, color:t.text }}>{row.medico}</div>
                        <div style={{ fontSize:10.5, color:t.muted, marginTop:3 }}>{detailCount ? `${detailCount} paciente(s) com divergência` : 'Sem detalhamento por paciente'}</div>
                      </div>
                      <span className="badge" style={{ background:`${statusColors[status]}18`, color:statusColors[status] }}>{statusLabels[status]}</span>
                    </div>
                    <div className="result-values">
                      {[['Produção',row.producao,t.text],['Repasse',row.repasse,t.text],['Diferença',row.diferenca,productionHigher?'#d97706':'#dc2626']].map(([label,value,color]) => (
                        <div key={label} className="result-value" style={{ background:dark?'#0f172a':'#f8fafc', border:`1px solid ${t.border}` }}>
                          <div className="result-value-label" style={{ color:t.muted }}>{label}</div>
                          <div className="result-value-number" style={{ color }}>{value}</div>
                        </div>
                      ))}
                    </div>
                    <div className="ui-mobile-actions">
                      <Button t={t} dark={dark} variant="ghost" size="sm" onClick={() => cycleStatus(row.id)}>Avançar status</Button>
                      <Button t={t} dark={dark} variant="subtle" size="sm" onClick={() => setSelectedMedico({ ...row, status })}>{ICONS.eye} Ver detalhes</Button>
                    </div>
                  </article>
                );
              })}
            </div>
          </>
        )}
      </section>

      <section className="ui-panel ai-card" style={{ ...t.card, borderRadius:RADIUS.lg, border:`1px solid ${dark?'#F4792030':'#F4792020'}` }}>
        <div className="ui-panel-head" style={{ borderBottom:`1px solid ${t.border}` }}>
          <div style={{ width:40, height:40, borderRadius:8, background:"#1A2B6B", display:"flex", alignItems:"center", justifyContent:"center", color:"white" }}>
            {ICONS.brain}
          </div>
          <div style={{ flex:1 }}>
            <div className="ui-panel-title" style={{ color:t.text }}>Análise inteligente</div>
            <div className="ui-panel-copy" style={{ color:t.muted }}>Pontos de atenção identificados automaticamente · {resultados?.processadoEm??'-'}</div>
          </div>
        </div>
        <div className="ui-panel-body">
          {insights.length===0 ? (
            <div style={{ padding:20, textAlign:'center', color:t.muted, fontSize:13 }}>A análise aparecerá aqui após o processamento da auditoria.</div>
          ) : (
            <div style={{ display:'flex', flexDirection:'column', gap:9 }}>
              {insights.map((insight, index) => (
                <div key={index} style={{ display:'flex', alignItems:'flex-start', gap:10, padding:'11px 13px', borderRadius:9, background:dark?'rgba(255,255,255,.025)':'#f8fafc', border:`1px solid ${t.border}` }}>
                  <div style={{ width:6, height:6, borderRadius:'50%', background:'#F47920', marginTop:7, flexShrink:0 }} />
                  <span style={{ fontSize:13, color:t.text, lineHeight:1.6, flex:1 }}>{insight}</span>
                  <button type="button" className="cs-icon-btn" onClick={() => copyInsight(insight, index)}
                    aria-label="Copiar insight" title={copiedInsight===index?'Copiado':'Copiar'} style={{ color:copiedInsight===index?'#059669':t.muted, flexShrink:0 }}>
                    {copiedInsight===index ? ICONS.check : ICONS.copy}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {selectedMedico && (
        <Drawer t={t} title={selectedMedico.medico} subtitle="Detalhamento das divergências por paciente" onClose={() => setSelectedMedico(null)}>
          <div className="detail-metrics">
            {[
              { label:'Produção', value:selectedMedico.producao, color:'#F47920' },
              { label:'Repasse', value:selectedMedico.repasse, color:'#059669' },
              { label:'Diferença', value:selectedMedico.diferenca, color:'#dc2626' },
            ].map(({ label, value, color }) => (
              <div key={label} className="detail-metric" style={{ background:dark?'#0f172a':'#f8fafc', border:`1px solid ${t.border}` }}>
                <div style={{ fontSize:10.5, color:t.muted, marginBottom:5 }}>{label}</div>
                <div style={{ fontSize:13, fontWeight:700, color }}>{value}</div>
              </div>
            ))}
          </div>

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

          <h3 style={{ fontSize:12, fontWeight:700, color:t.text, marginBottom:14, textTransform:'uppercase', letterSpacing:'.06em' }}>
            Detalhamento por paciente
            {selectedMedico.detalhes?.length>0 && <span style={{ color:t.muted, fontWeight:500 }}> · {selectedMedico.detalhes.length} item{selectedMedico.detalhes.length!==1?'s':''}</span>}
          </h3>

          {!selectedMedico.detalhes?.length ? (
            <div style={{ textAlign:'center', color:t.muted, fontSize:13, padding:24 }}>
              {selectedMedico.detalhes?.length===0 ? 'A comparação por paciente não estava habilitada nesta auditoria.' : 'Sem detalhamento disponível.'}
            </div>
          ) : (
            <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
              {selectedMedico.detalhes.map((detail, index) => {
                    const { bg, color } = tipoStyle(detail.tipo);
                    return (
                      <div key={index} style={{ padding:'14px 15px', borderRadius:10, border:`1px solid ${t.border}`, background:dark?'#0f172a':'#fafafa' }}>
                        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:10, gap:8 }}>
                          <span style={{ fontSize:13, fontWeight:650, color:t.text, flex:1 }}>{detail.paciente}</span>
                          <span title={detail.tipo} style={{ fontSize:12.5, fontWeight:700, color:detail.tipo?.includes('Produção')?'#d97706':'#dc2626', whiteSpace:'nowrap' }}>
                            {detail.tipo === 'Maior na Produção' || detail.tipo === 'Ausente no Repasse' ? 'Prod' : 'Rep'} {detail.diferenca}
                          </span>
                        </div>
                        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:6, marginBottom:10 }}>
                          {[["Produção",detail.producao],["Repasse",detail.repasse]].map(([label,value]) => (
                            <div key={label} style={{ fontSize:11.5, color:t.muted }}>
                              {label}: <span style={{ color:t.text, fontWeight:600 }}>{value}</span>
                            </div>
                          ))}
                        </div>
                        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', gap:8 }}>
                          <span className="badge" style={{ background:bg, color, gap:4 }}>
                            {ICONS.tag}&nbsp;{detail.tipo}
                          </span>
                          <Button t={t} dark={dark} variant="ghost" size="sm"
                            onClick={() => navigator.clipboard?.writeText(`Paciente: ${detail.paciente} | Produção: ${detail.producao} | Repasse: ${detail.repasse} | Diferença: ${detail.diferenca} | Tipo: ${detail.tipo}`)}
                            style={{ padding:'6px 9px', fontSize:10.5 }}>{ICONS.copy} Copiar</Button>
                        </div>
                      </div>
                    );
              })}
            </div>
          )}
        </Drawer>
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
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState('all');
  const normalizedQuery = query.trim().toLocaleLowerCase('pt-BR');
  const withDifferences = historico.filter(row => Number(row.divergencias) > 0);
  const totalDifferences = historico.reduce((total, row) => total + (Number(row.divergencias) || 0), 0);
  const withAI = historico.filter(row => row.aiReportHTML);
  const visibleHistory = historico.filter((row) => {
    const matchesQuery = !normalizedQuery || [row.data, row.periodo, row.arquivos, row.userName]
      .some(value => String(value || '').toLocaleLowerCase('pt-BR').includes(normalizedQuery));
    const matchesFilter = filter === 'all'
      || (filter === 'differences' && Number(row.divergencias) > 0)
      || (filter === 'compliant' && Number(row.divergencias) === 0)
      || (filter === 'ai' && row.aiReportHTML);
    return matchesQuery && matchesFilter;
  });
  const filters = [
    ['all', 'Todas'],
    ['differences', 'Com divergências'],
    ['compliant', 'Conformes'],
    ['ai', 'Com relatório IA'],
  ];
  const stats = [
    { label:'Auditorias salvas', value:historico.length, detail:'Neste navegador', icon:ICONS.history, color:'#2563eb' },
    { label:'Com divergências', value:withDifferences.length, detail:'Requerem revisão', icon:ICONS.alert, color:'#d97706' },
    { label:'Divergências', value:totalDifferences, detail:'Total identificado', icon:ICONS.trending, color:'#dc2626' },
    { label:'Relatórios IA', value:withAI.length, detail:'Análises disponíveis', icon:ICONS.brain, color:'#059669' },
  ];

  const openAIReport = (row) => {
    const report = new Blob([row.aiReportHTML], { type:'text/html;charset=utf-8' });
    window.open(URL.createObjectURL(report), '_blank');
  };

  const renderActions = (row, mobile = false) => (
    <div className={mobile ? 'ui-mobile-actions' : 'ui-table-actions'}>
      {row.resultados && (
        <Button t={t} dark={dark} variant="subtle" size="sm" onClick={() => onOpen(row)} style={{ padding:'7px 10px', fontSize:11.5 }}>
          {ICONS.eye} Abrir
        </Button>
      )}
      {row.resultados && (
        <Button t={t} dark={dark} variant="ghost" size="sm" onClick={() => exportExcel(row.resultados)} style={{ padding:'7px 10px', fontSize:11.5, color:'#059669', borderColor:'#05966940' }}>
          {ICONS.export} Excel
        </Button>
      )}
      {row.aiReportHTML && (
        <Button t={t} dark={dark} variant="ghost" size="sm" onClick={() => openAIReport(row)} style={{ padding:'7px 10px', fontSize:11.5, color:'#7c3aed', borderColor:'#7c3aed40' }}>
          {ICONS.brain} Relatório IA
        </Button>
      )}
      <Button t={t} dark={dark} variant="ghost" size="sm" onClick={() => setConfirmDel(row)}
        aria-label={`Excluir auditoria ${row.periodo || row.data}`} style={{ padding:'7px 10px', fontSize:11.5, color:'#dc2626', borderColor:'#dc262640' }}>
        {ICONS.x} Excluir
      </Button>
    </div>
  );

  return (
    <div className="app-page fade-in">
      <PageHeader t={t} title="Histórico de auditorias" subtitle="Consulte, exporte e reabra os relatórios armazenados neste navegador." />

      <div className="ui-stat-grid" aria-label="Resumo do histórico">
        {stats.map(stat => (
          <div key={stat.label} className="ui-stat" style={{ ...t.card, border:`1px solid ${t.border}`, borderRadius:RADIUS.lg }}>
            <div className="ui-stat-top">
              <div className="ui-stat-icon" style={{ color:stat.color, background:`${stat.color}14` }}>{stat.icon}</div>
              <div className="ui-stat-value" style={{ color:t.text }}>{stat.value}</div>
            </div>
            <div>
              <div className="ui-stat-label" style={{ color:t.text }}>{stat.label}</div>
              <div className="ui-stat-detail" style={{ color:t.muted }}>{stat.detail}</div>
            </div>
          </div>
        ))}
      </div>

      <section className="ui-panel" style={{ ...t.card, borderRadius:RADIUS.lg, border:`1px solid ${t.border}` }} aria-label="Registros de auditoria">
        <div className="ui-toolbar" style={{ borderBottom:`1px solid ${t.border}` }}>
          <div className="ui-search">
            <span aria-hidden="true" style={{ position:'absolute', left:13, top:'50%', transform:'translateY(-50%)', color:t.muted, display:'flex', pointerEvents:'none' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="11" cy="11" r="7"/><line x1="20" y1="20" x2="16.65" y2="16.65"/></svg>
            </span>
            <TextInput t={t} dark={dark} value={query} aria-label="Buscar no histórico" placeholder="Buscar por período, arquivo ou auditor"
              onChange={event => setQuery(event.target.value)} style={{ paddingLeft:39, paddingRight:query?40:14 }} />
            {query && (
              <button type="button" className="cs-icon-btn" aria-label="Limpar busca" onClick={() => setQuery('')}
                style={{ position:'absolute', right:8, top:'50%', transform:'translateY(-50%)', color:t.muted, width:28, height:28 }}>
                {ICONS.x}
              </button>
            )}
          </div>
          <div className="ui-toolbar-group" aria-label="Filtrar histórico">
            {filters.map(([value, label]) => {
              const selected = filter === value;
              return (
                <button key={value} type="button" className="ui-filter" aria-pressed={selected} onClick={() => setFilter(value)}
                  style={{ borderColor:selected?'#F4792060':t.border, background:selected?'#F4792014':'transparent', color:selected?'#F47920':t.muted }}>
                  {label}
                </button>
              );
            })}
          </div>
        </div>

        {historico.length>0 && (
          <div className="ui-count-bar" style={{ color:t.muted, background:dark?'rgba(255,255,255,.015)':'rgba(15,23,42,.018)' }}>
            Exibindo <strong style={{ color:t.text }}>{visibleHistory.length}</strong> de {historico.length} auditoria(s)
          </div>
        )}

        {historico.length===0 ? (
          <EmptyState t={t} mensagem="Nenhuma auditoria realizada ainda." sub="Os relatórios gerados aparecerão aqui automaticamente após cada auditoria." />
        ) : visibleHistory.length===0 ? (
          <div style={{ padding:'44px 20px', textAlign:'center' }}>
            <div style={{ fontSize:14, fontWeight:700, color:t.text }}>Nenhuma auditoria encontrada</div>
            <div style={{ fontSize:12, color:t.muted, margin:'5px 0 16px' }}>Ajuste a busca ou escolha outro filtro.</div>
            <Button t={t} dark={dark} variant="ghost" size="sm" onClick={() => { setQuery(''); setFilter('all'); }}>Limpar filtros</Button>
          </div>
        ) : (
          <>
            <div className="ui-table-wrap">
              <table className="ui-table" style={{ minWidth:isAdmin?1080:960 }}>
                <thead style={{ background:dark?'#0f172a':'#f8fafc' }}>
                  <tr>
                    {["Data","Referência","Arquivos", ...(isAdmin ? ["Auditor"] : []), "Resultado","Valor total"].map(label => <th key={label} style={{ color:t.muted }}>{label}</th>)}
                    <th style={{ color:t.muted, textAlign:'right' }}>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {visibleHistory.map(row => (
                    <tr key={row.id} className="table-row" style={{ borderTop:`1px solid ${t.border}` }}>
                      <td style={{ color:t.text, whiteSpace:'nowrap' }}>{row.data}</td>
                      <td style={{ color:t.text, fontWeight:650 }}>{row.periodo||'—'}</td>
                      <td style={{ color:t.muted, maxWidth:220 }}><div style={{ overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{row.arquivos||'—'}</div></td>
                      {isAdmin && <td style={{ color:t.text }}>{row.userName||'—'}</td>}
                      <td>
                        <span className="badge" style={{ background:Number(row.divergencias)>0?'#dc262616':'#05966916', color:Number(row.divergencias)>0?'#dc2626':'#059669', padding:'5px 9px' }}>
                          {Number(row.divergencias)>0 ? `${row.divergencias} divergência(s)` : 'Conforme'}
                        </span>
                      </td>
                      <td style={{ color:t.text, fontWeight:650, whiteSpace:'nowrap' }}>{row.valor||'—'}</td>
                      <td>{renderActions(row)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="ui-mobile-list">
              {visibleHistory.map(row => (
                <article key={row.id} className="ui-mobile-card" style={{ border:`1px solid ${t.border}`, background:dark?'rgba(255,255,255,.018)':'#fff' }}>
                  <div className="ui-mobile-head">
                    <div>
                      <div style={{ fontSize:13.5, fontWeight:700, color:t.text }}>{row.periodo||'Auditoria sem referência'}</div>
                      <div style={{ fontSize:11, color:t.muted, marginTop:3 }}>{row.data}</div>
                    </div>
                    <span className="badge" style={{ background:Number(row.divergencias)>0?'#dc262616':'#05966916', color:Number(row.divergencias)>0?'#dc2626':'#059669' }}>
                      {Number(row.divergencias)>0 ? row.divergencias : 'Conforme'}
                    </span>
                  </div>
                  <div className="ui-mobile-meta">
                    <div><div className="ui-mobile-label" style={{ color:t.muted }}>Arquivos</div><div className="ui-mobile-value" style={{ color:t.text }}>{row.arquivos||'—'}</div></div>
                    <div><div className="ui-mobile-label" style={{ color:t.muted }}>Valor divergente</div><div className="ui-mobile-value" style={{ color:t.text, fontWeight:650 }}>{row.valor||'—'}</div></div>
                    {isAdmin && <div><div className="ui-mobile-label" style={{ color:t.muted }}>Auditor</div><div className="ui-mobile-value" style={{ color:t.text }}>{row.userName||'—'}</div></div>}
                  </div>
                  {renderActions(row, true)}
                </article>
              ))}
            </div>
          </>
        )}
      </section>

      {confirmDel && (
        <Modal t={t} dark={dark} size="sm" danger title="Excluir auditoria?" subtitle="Esta ação remove o registro deste navegador."
          onClose={() => setConfirmDel(null)}
          footer={
            <>
              <Button t={t} dark={dark} variant="ghost" onClick={() => setConfirmDel(null)} style={{ flex:1 }}>Cancelar</Button>
              <Button t={t} dark={dark} variant="danger" onClick={() => { onDelete(confirmDel.id); setConfirmDel(null); }} style={{ flex:1 }}>Excluir registro</Button>
            </>
          }>
          <div style={{ fontSize:13, color:t.muted, lineHeight:1.6 }}>
            <strong style={{ color:t.text }}>{confirmDel.periodo||confirmDel.data}</strong> será removida do histórico. Relatórios exportados anteriormente não serão afetados.
          </div>
        </Modal>
      )}
    </div>
  );
}

// ─── USER MANAGEMENT PAGE ─────────────────────────────────────────────────────
const USER_MANAGEMENT_CSS = `
.users-page{max-width:1120px;margin:0 auto}
.users-summary{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:14px;margin-bottom:18px}
.users-summary-card{min-height:104px;padding:16px;display:flex;flex-direction:column;justify-content:space-between;overflow:hidden;position:relative}
.users-summary-top{display:flex;align-items:center;justify-content:space-between;gap:12px}
.users-summary-icon{width:38px;height:38px;border-radius:8px;display:flex;align-items:center;justify-content:center;flex-shrink:0}
.users-summary-value{font-family:inherit;font-size:22px;font-weight:700;line-height:1.1;letter-spacing:0}
.users-summary-label{font-size:12px;font-weight:600;margin-top:9px}
.users-summary-detail{font-size:11px;margin-top:3px}
.users-panel{overflow:hidden}
.users-toolbar{display:flex;align-items:center;justify-content:space-between;gap:14px;padding:16px 18px}
.users-search{flex:1;min-width:240px;max-width:440px}
.users-filters{display:flex;align-items:center;gap:6px;overflow-x:auto;padding-bottom:1px}
.users-filter{border-radius:8px;padding:8px 11px;border:1px solid transparent;background:transparent;font-family:inherit;font-size:11.5px;font-weight:600;line-height:1;cursor:pointer;white-space:nowrap;transition:all .15s ease}
.users-count{padding:10px 18px;font-size:11.5px}
.users-table-wrap{overflow-x:auto}
.users-table{width:100%;border-collapse:collapse;min-width:900px}
.users-table th{padding:11px 16px;text-align:left;font-size:10.5px;font-weight:700;letter-spacing:.05em;text-transform:uppercase;white-space:nowrap}
.users-table td{padding:14px 16px;vertical-align:middle}
.users-table tbody tr{transition:background .15s ease,opacity .15s ease}
.users-person{display:flex;align-items:center;gap:11px;min-width:180px}
.users-avatar{width:38px;height:38px;border-radius:8px;display:flex;align-items:center;justify-content:center;color:#fff;font-size:13px;font-weight:700;flex-shrink:0}
.users-name{font-size:13.5px;font-weight:650;line-height:1.3}
.users-self{font-size:10px;color:#F47920;margin-top:2px;font-weight:600}
.users-actions{display:flex;align-items:center;justify-content:flex-end;gap:6px;white-space:nowrap}
.users-mobile-list{display:none;padding:12px}
.users-mobile-card{padding:15px;border-radius:8px;margin-bottom:10px}
.users-mobile-card:last-child{margin-bottom:0}
.users-mobile-head{display:flex;align-items:flex-start;justify-content:space-between;gap:12px}
.users-mobile-meta{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin:14px 0}
.users-mobile-meta-label{font-size:10.5px;margin-bottom:3px}
.users-mobile-meta-value{font-size:12.5px;overflow-wrap:anywhere}
.users-mobile-actions{display:grid;grid-template-columns:1fr 1fr;gap:8px}
.user-form-section+ .user-form-section{margin-top:24px;padding-top:22px;border-top:1px solid}
.user-form-section-title{font-size:13px;font-weight:700;margin-bottom:4px}
.user-form-section-copy{font-size:11.5px;line-height:1.5;margin-bottom:15px}
.user-choice-grid{display:grid;grid-template-columns:1fr 1fr;gap:10px}
.user-choice{display:flex;align-items:flex-start;gap:11px;width:100%;min-height:76px;padding:13px;border-radius:8px;border:1px solid;background:transparent;text-align:left;cursor:pointer;transition:border-color .15s ease,background .15s ease}
.user-choice-mark{width:18px;height:18px;border:2px solid;border-radius:50%;display:flex;align-items:center;justify-content:center;flex-shrink:0;margin-top:1px}
.user-choice-dot{width:8px;height:8px;border-radius:50%;background:#fff}
.user-choice-title{font-size:12.5px;font-weight:700;line-height:1.3}
.user-choice-copy{font-size:11px;line-height:1.45;margin-top:3px}
.user-form-footer{display:grid;grid-template-columns:minmax(120px,1fr) minmax(180px,2fr);gap:10px;width:100%}
.users-loading{padding:18px}
.users-skeleton{height:58px;border-radius:10px;margin-bottom:8px;animation:usersPulse 1.2s ease-in-out infinite}
.users-filter:focus-visible,.user-choice:focus-visible{outline:2px solid #F47920;outline-offset:2px}
@keyframes usersPulse{0%,100%{opacity:.35}50%{opacity:.7}}
@media(max-width:920px){.users-summary{grid-template-columns:1fr 1fr}.users-toolbar{align-items:stretch;flex-direction:column}.users-search{max-width:none}.users-filters{width:100%}}
@media(max-width:860px){.users-summary{grid-template-columns:1fr 1fr;gap:10px}.users-summary-card{min-height:104px;padding:15px}.users-table-wrap{display:none}.users-mobile-list{display:block}.users-count{border-bottom:1px solid}.user-choice-grid{grid-template-columns:1fr}}
@media(max-width:480px){.users-summary{grid-template-columns:1fr}.users-mobile-meta{grid-template-columns:1fr}.users-mobile-actions{grid-template-columns:1fr}.user-form-footer{grid-template-columns:1fr}.users-toolbar{padding:14px}.users-filters{margin-right:-14px;padding-right:14px}}
`;

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
  const [avisoTone,  setAvisoTone]  = useState('success');
  const [resetId,    setResetId]    = useState(null);
  const [resetDone,  setResetDone]  = useState(false);
  const [resetErr,   setResetErr]   = useState('');
  const [resetSending, setResetSending] = useState(false);
  const [confirmDel, setConfirmDel] = useState(null);
  const [actionId,   setActionId]   = useState(null);
  const [query,      setQuery]      = useState('');
  const [filter,     setFilter]     = useState('all');
  const [showPassword, setShowPassword] = useState(false);

  const refresh = async () => {
    try {
      setUsers(await listarUsuarios());
      setLoadError('');
    } catch (err) {
      setLoadError(mensagemDeErro(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { refresh(); }, []);

  const openCreate = () => {
    setEditUser(null);
    setForm({ name:'', email:'', password:'', role:'user', cargo:'', modo:'convite' });
    setFormError('');
    setShowPassword(false);
    setShowForm(true);
  };

  const openEdit = (u) => {
    setEditUser(u);
    setForm({ name:u.name||'', email:u.email||'', password:'', role:u.role||'user', cargo:u.cargo||'', modo:'convite' });
    setFormError('');
    setShowPassword(false);
    setShowForm(true);
  };

  const saveUser = async () => {
    setFormError('');
    setAviso('');
    if (!form.name.trim())  { setFormError('Nome é obrigatório.'); return; }
    if (!form.email.trim()) { setFormError('E-mail é obrigatório.'); return; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
      setFormError('Informe um e-mail válido.'); return;
    }
    if (!editUser && form.modo === 'temporaria' && form.password.length < 8) {
      setFormError('A senha temporária deve ter pelo menos 8 caracteres.'); return;
    }
    setSaving(true);
    try {
      if (editUser) {
        // O e-mail é a identidade no Firebase Auth e não é editável aqui.
        await atualizarUsuario(editUser.id, { nome:form.name.trim(), cargo:form.cargo.trim(), role:form.role });
        setAviso('Usuário atualizado.');
      } else {
        await criarUsuario({
          nome: form.name.trim(), email: form.email.trim(), cargo: form.cargo.trim(), role: form.role,
          modo: form.modo, senhaTemporaria: form.password,
        }, currentUser.id);
        setAviso(form.modo === 'temporaria'
          ? 'Usuário criado. Ele deverá trocar a senha temporária no primeiro acesso.'
          : `Convite enviado para ${form.email.trim()}. O usuário define a própria senha pelo link.`);
      }
      setAvisoTone('success');
      await refresh();
      setShowForm(false);
    } catch (err) {
      setFormError(mensagemDeErro(err));
    } finally {
      setSaving(false);
    }
  };

  // No plano Spark o cliente não exclui a conta de outro usuário no Auth.
  // Desativar corta o acesso pelas Security Rules, que é o efeito que importa.
  const toggleAtivo = async (u, desativar) => {
    setAviso('');
    setActionId(u.id);
    try {
      await definirUsuarioDesativado(u.id, desativar);
      setAviso(desativar ? `${u.name} foi desativado e perdeu o acesso.` : `${u.name} foi reativado.`);
      setAvisoTone('success');
      await refresh();
    } catch (err) {
      setAviso(mensagemDeErro(err));
      setAvisoTone('error');
    } finally {
      setActionId(null);
      setConfirmDel(null);
    }
  };

  // O admin não define mais a senha de ninguém: dispara o e-mail de redefinição
  // e o próprio usuário escolhe a senha. Ninguém além do dono a conhece.
  const doReset = async () => {
    const alvo = users.find(u => u.id === resetId);
    if (!alvo) return;
    setResetErr('');
    setResetSending(true);
    try {
      await enviarResetDeSenha(alvo.email);
      setResetDone(true);
    } catch (err) {
      setResetErr(mensagemDeErro(err));
    } finally {
      setResetSending(false);
    }
  };

  const roleColor = (r) => r==='admin'?'#F47920':'#2B4AA0';
  const normalizedQuery = query.trim().toLocaleLowerCase('pt-BR');
  const activeUsers = users.filter(u => !u.disabled);
  const adminUsers = users.filter(u => u.role === 'admin');
  const attentionUsers = users.filter(u => u.disabled || u.mustChangePassword);
  const visibleUsers = users.filter((u) => {
    const matchesQuery = !normalizedQuery || [u.name, u.email, u.cargo]
      .some(value => String(value || '').toLocaleLowerCase('pt-BR').includes(normalizedQuery));
    const matchesFilter = filter === 'all'
      || (filter === 'active' && !u.disabled)
      || (filter === 'admin' && u.role === 'admin')
      || (filter === 'pending' && !u.disabled && u.mustChangePassword)
      || (filter === 'disabled' && u.disabled);
    return matchesQuery && matchesFilter;
  }).sort((a, b) => String(a.name || '').localeCompare(String(b.name || ''), 'pt-BR'));

  const statusFor = (user) => user.disabled
    ? { label:'Desativado', color:'#ef4444' }
    : user.mustChangePassword
      ? { label:'Senha pendente', color:'#d97706' }
      : { label:'Ativo', color:'#059669' };
  const displayName = (user) => user.name || user.email || 'Usuário';
  const filterOptions = [
    ['all', 'Todos'],
    ['active', 'Ativos'],
    ['admin', 'Administradores'],
    ['pending', 'Senha pendente'],
    ['disabled', 'Desativados'],
  ];
  const summaryCards = [
    { label:'Contas cadastradas', value:users.length, detail:'Total de usuários no sistema', icon:ICONS.users, color:'#2563eb' },
    { label:'Acessos ativos', value:activeUsers.length, detail:`${users.length-activeUsers.length} acesso(s) bloqueado(s)`, icon:ICONS.check, color:'#059669' },
    { label:'Administradores', value:adminUsers.length, detail:'Acesso à gestão completa', icon:ICONS.settings, color:'#F47920' },
    { label:'Requer atenção', value:attentionUsers.length, detail:'Senha pendente ou conta desativada', icon:ICONS.warning, color:'#dc2626' },
  ];

  const openReset = (user) => {
    setResetId(user.id);
    setResetDone(false);
    setResetErr('');
  };

  const closeForm = () => {
    if (saving) return;
    setShowForm(false);
    setFormError('');
  };

  const closeReset = () => {
    if (resetSending) return;
    setResetId(null);
    setResetDone(false);
    setResetErr('');
  };

  const renderStatus = (user) => {
    const status = statusFor(user);
    return (
      <span className="badge" style={{ background:`${status.color}16`, color:status.color, gap:6, padding:'5px 9px' }}>
        <span aria-hidden="true" style={{ width:6, height:6, borderRadius:'50%', background:status.color }} />
        {status.label}
      </span>
    );
  };

  const renderRole = (user) => (
    <span className="badge" style={{ background:`${roleColor(user.role)}14`, color:roleColor(user.role), padding:'5px 9px' }}>
      {user.role === 'admin' ? 'Administrador' : 'Usuário'}
    </span>
  );

  const renderActions = (user, mobile = false) => {
    const busy = actionId === user.id;
    const buttonStyle = { justifyContent:'center', padding:'7px 10px', fontSize:11.5 };
    return (
      <div className={mobile ? 'users-mobile-actions' : 'users-actions'}>
        <Button t={t} dark={dark} variant="subtle" size="sm" disabled={!!actionId}
          onClick={() => openEdit(user)} style={buttonStyle}>
          {ICONS.edit} {mobile ? 'Editar usuário' : 'Editar'}
        </Button>
        <Button t={t} dark={dark} variant="subtle" size="sm" disabled={!!actionId}
          onClick={() => openReset(user)} style={buttonStyle}>
          {mobile ? 'Redefinir senha' : 'Senha'}
        </Button>
        {user.id !== currentUser.id && (user.disabled ? (
          <Button t={t} dark={dark} variant="ghost" size="sm" disabled={!!actionId}
            onClick={() => toggleAtivo(user, false)} style={{ ...buttonStyle, color:'#059669', borderColor:'#05966940' }}>
            {busy ? 'Reativando...' : 'Reativar'}
          </Button>
        ) : (
          <Button t={t} dark={dark} variant="ghost" size="sm" disabled={!!actionId}
            onClick={() => setConfirmDel(user)} style={{ ...buttonStyle, color:'#dc2626', borderColor:'#dc262640' }}>
            {ICONS.x} Desativar
          </Button>
        ))}
      </div>
    );
  };

  return (
    <div className="users-page fade-in">
      <style>{USER_MANAGEMENT_CSS}</style>
      <PageHeader t={t} title="Usuários e acessos" subtitle="Gerencie contas, perfis e disponibilidade de acesso ao sistema."
        right={<Button t={t} dark={dark} onClick={openCreate}>{ICONS.plus} Novo Usuário</Button>} />

      {aviso && <Alert tone={avisoTone} onClose={() => setAviso('')} style={{ marginBottom:16 }}>{aviso}</Alert>}
      {loadError && (
        <Alert tone="error" style={{ marginBottom:16 }}>
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', gap:12, flexWrap:'wrap' }}>
            <span style={{ flex:'1 1 260px' }}>{loadError}</span>
            <Button t={t} dark={dark} variant="ghost" size="sm"
              onClick={() => { setLoading(true); setLoadError(''); refresh(); }}
              style={{ color:'#ef4444', borderColor:'#ef444450' }}>
              Tentar novamente
            </Button>
          </div>
        </Alert>
      )}

      <div className="users-summary" aria-label="Resumo de usuários">
        {summaryCards.map(card => (
          <div key={card.label} className="users-summary-card" style={{ ...t.card, border:`1px solid ${t.border}`, borderRadius:RADIUS.lg }}>
            <div className="users-summary-top">
              <div className="users-summary-icon" style={{ color:card.color, background:`${card.color}14` }}>{card.icon}</div>
              <div className="users-summary-value" style={{ color:t.text }}>{loading ? '–' : card.value}</div>
            </div>
            <div>
              <div className="users-summary-label" style={{ color:t.text }}>{card.label}</div>
              <div className="users-summary-detail" style={{ color:t.muted }}>{card.detail}</div>
            </div>
          </div>
        ))}
      </div>

      <section className="users-panel" style={{ ...t.card, borderRadius:RADIUS.lg, border:`1px solid ${t.border}` }} aria-label="Lista de usuários">
        <div className="users-toolbar" style={{ borderBottom:`1px solid ${t.border}` }}>
          <div className="users-search" style={{ position:'relative' }}>
            <span aria-hidden="true" style={{ position:'absolute', left:13, top:'50%', transform:'translateY(-50%)', color:t.muted, display:'flex', pointerEvents:'none' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="11" cy="11" r="7"/><line x1="20" y1="20" x2="16.65" y2="16.65"/></svg>
            </span>
            <TextInput t={t} dark={dark} value={query} aria-label="Buscar usuários"
              placeholder="Buscar por nome, e-mail ou cargo"
              onChange={event => setQuery(event.target.value)}
              style={{ paddingLeft:39, paddingRight:query?40:14 }} />
            {query && (
              <button type="button" className="cs-icon-btn" aria-label="Limpar busca" onClick={() => setQuery('')}
                style={{ position:'absolute', right:8, top:'50%', transform:'translateY(-50%)', color:t.muted, width:28, height:28 }}>
                {ICONS.x}
              </button>
            )}
          </div>
          <div className="users-filters" aria-label="Filtrar usuários">
            {filterOptions.map(([value, label]) => {
              const selected = filter === value;
              return (
                <button key={value} type="button" className="users-filter" aria-pressed={selected}
                  onClick={() => setFilter(value)}
                  style={{ borderColor:selected?'#F4792060':t.border, background:selected?'#F4792014':'transparent', color:selected?'#F47920':t.muted }}>
                  {label}
                </button>
              );
            })}
          </div>
        </div>

        {!loading && users.length > 0 && (
          <div className="users-count" style={{ color:t.muted, background:dark?'rgba(255,255,255,.015)':'rgba(15,23,42,.018)' }}>
            Exibindo <strong style={{ color:t.text }}>{visibleUsers.length}</strong> de {users.length} usuário(s)
          </div>
        )}

        {loading ? (
          <div className="users-loading" aria-label="Carregando usuários">
            {[1,2,3].map(item => <div key={item} className="users-skeleton" style={{ background:dark?'#1e293b':'#e2e8f0' }} />)}
          </div>
        ) : loadError && users.length===0 ? (
          <div style={{ padding:'44px 20px', textAlign:'center' }}>
            <div style={{ fontSize:14, fontWeight:700, color:t.text }}>Lista temporariamente indisponível</div>
            <div style={{ fontSize:12, color:t.muted, marginTop:5 }}>Use “Tentar novamente” para recarregar os usuários.</div>
          </div>
        ) : users.length===0 ? (
          <EmptyState t={t} mensagem="Nenhum usuário cadastrado." sub="Clique em Novo Usuário para começar." />
        ) : visibleUsers.length===0 ? (
          <div style={{ padding:'44px 20px', textAlign:'center' }}>
            <div style={{ width:42, height:42, margin:'0 auto 12px', borderRadius:10, display:'flex', alignItems:'center', justifyContent:'center', color:t.muted, background:dark?'rgba(255,255,255,.05)':'#f1f5f9' }}>{ICONS.users}</div>
            <div style={{ fontSize:14, fontWeight:700, color:t.text }}>Nenhum usuário encontrado</div>
            <div style={{ fontSize:12, color:t.muted, margin:'5px 0 16px' }}>Ajuste a busca ou escolha outro filtro.</div>
            <Button t={t} dark={dark} variant="ghost" size="sm" onClick={() => { setQuery(''); setFilter('all'); }}>Limpar filtros</Button>
          </div>
        ) : (
          <>
            <div className="users-table-wrap">
              <table className="users-table">
                <thead style={{ background:dark?'#0f172a':'#f8fafc' }}>
                  <tr>
                    {['Usuário','E-mail','Cargo','Perfil','Status','Criado em'].map(label => <th key={label} style={{ color:t.muted }}>{label}</th>)}
                    <th style={{ color:t.muted, textAlign:'right' }}>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {visibleUsers.map(user => (
                    <tr key={user.id} className="table-row" style={{ borderTop:`1px solid ${t.border}`, opacity:user.disabled ? 0.72 : 1 }}>
                      <td>
                        <div className="users-person">
                          <div className="users-avatar" style={{ background:user.disabled?'#64748b':'#1A2B6B' }}>{displayName(user).charAt(0).toUpperCase()}</div>
                          <div>
                            <div className="users-name" style={{ color:t.text }}>{displayName(user)}</div>
                            {user.id===currentUser.id && <div className="users-self">Sua conta</div>}
                          </div>
                        </div>
                      </td>
                      <td style={{ fontSize:12.5, color:t.muted, overflowWrap:'anywhere' }}>{user.email||'—'}</td>
                      <td style={{ fontSize:12.5, color:t.text }}>{user.cargo||'—'}</td>
                      <td>{renderRole(user)}</td>
                      <td>{renderStatus(user)}</td>
                      <td style={{ fontSize:12, color:t.muted, whiteSpace:'nowrap' }}>{formatarData(user.createdAt)}</td>
                      <td>{renderActions(user)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="users-mobile-list">
              {visibleUsers.map(user => (
                <article key={user.id} className="users-mobile-card" style={{ border:`1px solid ${t.border}`, background:dark?'rgba(255,255,255,.018)':'#fff', opacity:user.disabled ? 0.76 : 1 }}>
                  <div className="users-mobile-head">
                    <div className="users-person">
                      <div className="users-avatar" style={{ background:user.disabled?'#64748b':'#1A2B6B' }}>{displayName(user).charAt(0).toUpperCase()}</div>
                      <div>
                        <div className="users-name" style={{ color:t.text }}>{displayName(user)}</div>
                        <div style={{ fontSize:11.5, color:t.muted, marginTop:2, overflowWrap:'anywhere' }}>{user.email||'—'}</div>
                        {user.id===currentUser.id && <div className="users-self">Sua conta</div>}
                      </div>
                    </div>
                    {renderStatus(user)}
                  </div>
                  <div className="users-mobile-meta">
                    <div>
                      <div className="users-mobile-meta-label" style={{ color:t.muted }}>Cargo</div>
                      <div className="users-mobile-meta-value" style={{ color:t.text }}>{user.cargo||'—'}</div>
                    </div>
                    <div>
                      <div className="users-mobile-meta-label" style={{ color:t.muted }}>Perfil</div>
                      <div className="users-mobile-meta-value">{renderRole(user)}</div>
                    </div>
                    <div>
                      <div className="users-mobile-meta-label" style={{ color:t.muted }}>Criado em</div>
                      <div className="users-mobile-meta-value" style={{ color:t.text }}>{formatarData(user.createdAt)}</div>
                    </div>
                  </div>
                  {renderActions(user, true)}
                </article>
              ))}
            </div>
          </>
        )}
      </section>

      {showForm && (
        <Modal
          t={t} dark={dark} size="lg"
          title={editUser ? "Editar usuário" : "Criar novo usuário"}
          subtitle={editUser ? `Atualize os dados e permissões de ${displayName(editUser)}.` : "Configure a conta, as permissões e a forma de primeiro acesso."}
          onClose={closeForm}
          footer={
            <div className="user-form-footer">
              <Button t={t} dark={dark} type="button" variant="ghost" onClick={closeForm} disabled={saving}>Cancelar</Button>
              <Button t={t} dark={dark} type="submit" form="user-account-form" disabled={saving} aria-busy={saving}>
                {saving ? <><span className="spin" style={{ display:'flex' }}>{ICONS.loader}</span> Salvando...</> : editUser ? "Salvar alterações" : "Criar usuário"}
              </Button>
            </div>
          }
        >
          <form id="user-account-form" onSubmit={(event) => { event.preventDefault(); saveUser(); }} noValidate>
            {formError && <Alert tone="error" style={{ marginBottom:20 }}>{formError}</Alert>}

            <section className="user-form-section">
              <div className="user-form-section-title" style={{ color:t.text }}>Dados da conta</div>
              <div className="user-form-section-copy" style={{ color:t.muted }}>Informações usadas para identificar o usuário no sistema.</div>
              <div className="cs-grid-2">
                <Field t={t} htmlFor="user-name" label="Nome completo">
                  <TextInput id="user-name" t={t} dark={dark} value={form.name} placeholder="João Silva" data-modal-autofocus="true"
                    autoComplete="name" required disabled={saving}
                    onChange={event => setForm(current => ({ ...current, name:event.target.value }))} />
                </Field>
                <Field t={t} htmlFor="user-email" label="E-mail"
                  hint={editUser ? "O e-mail identifica a conta e não pode ser alterado." : "O convite ou a redefinição de senha será enviado para este endereço."}>
                  <TextInput id="user-email" t={t} dark={dark} type="email" value={form.email}
                    readOnly={!!editUser} placeholder="joao@consaude.com.br" autoComplete="email" required disabled={saving}
                    onChange={event => setForm(current => ({ ...current, email:event.target.value }))} />
                </Field>
                <Field t={t} htmlFor="user-role" label="Cargo / Função" style={{ gridColumn:'1/-1' }}>
                  <TextInput id="user-role" t={t} dark={dark} value={form.cargo} placeholder="Ex: Analista de Faturamento"
                    autoComplete="organization-title" disabled={saving}
                    onChange={event => setForm(current => ({ ...current, cargo:event.target.value }))} />
                </Field>
              </div>
            </section>

            <section className="user-form-section" style={{ borderColor:t.border }}>
              <div className="user-form-section-title" style={{ color:t.text }}>Perfil de acesso</div>
              <div className="user-form-section-copy" style={{ color:t.muted }}>Defina quais áreas e registros esta conta poderá acessar.</div>
              <div className="user-choice-grid" role="radiogroup" aria-label="Perfil de acesso">
                {[
                  ['user', 'Usuário', 'Executa auditorias e consulta os próprios registros.'],
                  ['admin', 'Administrador', 'Gerencia usuários e visualiza todos os registros.'],
                ].map(([value, label, copy]) => {
                  const selected = form.role === value;
                  return (
                    <button key={value} type="button" role="radio" aria-checked={selected} className="user-choice"
                      disabled={saving} onClick={() => setForm(current => ({ ...current, role:value }))}
                      style={{ borderColor:selected?BRAND.orange:t.border, background:selected?'#F4792010':'transparent' }}>
                      <span className="user-choice-mark" style={{ borderColor:selected?BRAND.orange:t.muted, background:selected?BRAND.orange:'transparent' }}>
                        {selected && <span className="user-choice-dot" />}
                      </span>
                      <span>
                        <span className="user-choice-title" style={{ color:selected?BRAND.orange:t.text }}>{label}</span>
                        <span className="user-choice-copy" style={{ color:t.muted, display:'block' }}>{copy}</span>
                      </span>
                    </button>
                  );
                })}
              </div>
              {form.role === 'admin' && (
                <Alert tone="warn" style={{ marginTop:12 }}>Administradores podem alterar acessos e consultar dados de todos os usuários.</Alert>
              )}
            </section>

            {!editUser && (
              <section className="user-form-section" style={{ borderColor:t.border }}>
                <div className="user-form-section-title" style={{ color:t.text }}>Primeiro acesso</div>
                <div className="user-form-section-copy" style={{ color:t.muted }}>Escolha como o usuário definirá a senha inicial.</div>
                <div className="user-choice-grid" role="radiogroup" aria-label="Forma de primeiro acesso">
                  {[
                    ['convite', 'Convite por e-mail', 'O usuário recebe um link e cria a própria senha.'],
                    ['temporaria', 'Senha temporária', 'Você define uma senha que será trocada no primeiro acesso.'],
                  ].map(([value, label, copy]) => {
                    const selected = form.modo === value;
                    return (
                      <button key={value} type="button" role="radio" aria-checked={selected} className="user-choice"
                        disabled={saving} onClick={() => setForm(current => ({ ...current, modo:value }))}
                        style={{ borderColor:selected?BRAND.orange:t.border, background:selected?'#F4792010':'transparent' }}>
                        <span className="user-choice-mark" style={{ borderColor:selected?BRAND.orange:t.muted, background:selected?BRAND.orange:'transparent' }}>
                          {selected && <span className="user-choice-dot" />}
                        </span>
                        <span>
                          <span className="user-choice-title" style={{ color:selected?BRAND.orange:t.text }}>{label}</span>
                          <span className="user-choice-copy" style={{ color:t.muted, display:'block' }}>{copy}</span>
                        </span>
                      </button>
                    );
                  })}
                </div>

                {form.modo === 'temporaria' && (
                  <Field t={t} htmlFor="temporary-password" label="Senha temporária" style={{ marginTop:16 }}
                    hint="Use ao menos 8 caracteres e envie a senha por um canal seguro.">
                    <TextInput id="temporary-password" t={t} dark={dark} type={showPassword?'text':'password'}
                      value={form.password} placeholder="Mínimo de 8 caracteres" autoComplete="new-password" minLength={8} required disabled={saving}
                      onChange={event => setForm(current => ({ ...current, password:event.target.value }))} />
                    <label style={{ display:'inline-flex', alignItems:'center', gap:8, marginTop:9, fontSize:11.5, color:t.muted, cursor:'pointer' }}>
                      <input type="checkbox" checked={showPassword} onChange={event => setShowPassword(event.target.checked)} disabled={saving} />
                      Mostrar senha
                    </label>
                  </Field>
                )}
              </section>
            )}
          </form>
        </Modal>
      )}

      {resetId && (
        <Modal
          t={t} dark={dark} size="sm" title={resetDone ? "Link enviado" : "Redefinir senha"}
          subtitle={resetDone ? "A solicitação foi processada com sucesso." : "O usuário definirá uma nova senha por um link seguro."}
          onClose={closeReset}
          footer={resetDone ? (
            <Button t={t} dark={dark} fullWidth onClick={closeReset}>Concluir</Button>
          ) : (
            <div className="user-form-footer">
              <Button t={t} dark={dark} variant="ghost" onClick={closeReset} disabled={resetSending}>Cancelar</Button>
              <Button t={t} dark={dark} onClick={doReset} disabled={resetSending} aria-busy={resetSending}>
                {resetSending ? <><span className="spin" style={{ display:'flex' }}>{ICONS.loader}</span> Enviando...</> : 'Enviar link'}
              </Button>
            </div>
          )}
        >
          {resetDone ? (
            <Alert tone="success">
              Enviamos as instruções para <strong>{users.find(user => user.id===resetId)?.email}</strong>.
            </Alert>
          ) : (
            <>
              <div style={{ padding:14, border:`1px solid ${t.border}`, borderRadius:RADIUS.md, background:dark?'rgba(255,255,255,.025)':'#f8fafc' }}>
                <div style={{ fontSize:11, color:t.muted, marginBottom:4 }}>Destinatário</div>
                <div style={{ fontSize:13, fontWeight:650, color:t.text, overflowWrap:'anywhere' }}>{users.find(user => user.id===resetId)?.email}</div>
              </div>
              {resetErr && <Alert tone="error" style={{ marginTop:14 }}>{resetErr}</Alert>}
            </>
          )}
        </Modal>
      )}

      {confirmDel && (
        <Modal
          t={t} dark={dark} size="sm" danger title="Desativar usuário?"
          subtitle="Esta ação bloqueia o acesso imediatamente."
          onClose={() => { if (!actionId) setConfirmDel(null); }}
          footer={
            <div className="user-form-footer">
              <Button t={t} dark={dark} variant="ghost" onClick={() => setConfirmDel(null)} disabled={!!actionId}>Cancelar</Button>
              <Button t={t} dark={dark} variant="danger" onClick={() => toggleAtivo(confirmDel, true)} disabled={!!actionId} aria-busy={!!actionId}>
                {actionId ? 'Desativando...' : 'Desativar acesso'}
              </Button>
            </div>
          }
        >
          <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:16 }}>
            <div className="users-avatar" style={{ background:'#dc2626' }}>{displayName(confirmDel).charAt(0).toUpperCase()}</div>
            <div>
              <div style={{ fontSize:13.5, fontWeight:700, color:t.text }}>{displayName(confirmDel)}</div>
              <div style={{ fontSize:11.5, color:t.muted, marginTop:2, overflowWrap:'anywhere' }}>{confirmDel.email}</div>
            </div>
          </div>
          <Alert tone="warn">As auditorias e o histórico desta conta serão preservados. O acesso poderá ser reativado depois.</Alert>
        </Modal>
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
  const [profileSaving, setProfileSaving] = useState(false);
  const [showPasswords, setShowPasswords] = useState(false);
  const [profErr, setProfErr] = useState('');

  const saveProfile = async (event) => {
    event?.preventDefault();
    setProfErr('');
    setSaved(false);
    if (!form.name.trim()) {
      setProfErr('Informe seu nome completo.');
      return;
    }
    setProfileSaving(true);
    try {
      // As Security Rules permitem que o usuário altere apenas nome e cargo do
      // próprio documento — nunca o papel nem o status de ativação.
      const normalized = { name:form.name.trim(), cargo:form.cargo.trim() };
      await atualizarUsuario(currentUser.id, { nome:normalized.name, cargo:normalized.cargo, role:currentUser.role });
      setForm(normalized);
      onUpdateUser({ ...currentUser, ...normalized });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      setProfErr(mensagemDeErro(err));
    } finally {
      setProfileSaving(false);
    }
  };

  const savePwd = async (event) => {
    event?.preventDefault();
    setPwdErr('');
    setPwdSaved(false);
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
    } catch (err) {
      setPwdErr(mensagemDeErro(err));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="app-page-medium fade-in">
      <PageHeader t={t} title="Meu perfil" subtitle="Atualize seus dados pessoais e as credenciais da conta." />

      <div className="form-page-grid">
        <aside className="identity-panel" style={{ ...t.card, border:`1px solid ${t.border}`, borderRadius:RADIUS.lg }}>
          <div className="identity-avatar" style={{ background:'#1A2B6B' }}>
            {(currentUser.name||currentUser.email||'U').charAt(0).toUpperCase()}
          </div>
          <div className="identity-name" style={{ color:t.text }}>{currentUser.name}</div>
          <div className="identity-email" style={{ color:t.muted }}>{currentUser.email}</div>
          <div style={{ display:'flex', justifyContent:'center', gap:6, flexWrap:'wrap', marginTop:12 }}>
            <span className="badge" style={{ background:currentUser.role==='admin'?'#F4792018':'#2563eb18', color:currentUser.role==='admin'?'#F47920':'#2563eb' }}>
              {currentUser.role==='admin'?'Administrador':'Usuário'}
            </span>
            <span className="badge" style={{ background:'#05966916', color:'#059669' }}>Conta ativa</span>
          </div>
          {currentUser.cargo && <div style={{ fontSize:11.5, color:t.muted, marginTop:14 }}>{currentUser.cargo}</div>}
        </aside>

        <div className="form-stack">
          <form onSubmit={saveProfile} className="ui-panel" style={{ ...t.card, border:`1px solid ${t.border}`, borderRadius:RADIUS.lg }}>
            <div className="ui-panel-head" style={{ borderBottom:`1px solid ${t.border}` }}>
              <div>
                <div className="ui-panel-title" style={{ color:t.text }}>Informações pessoais</div>
                <div className="ui-panel-copy" style={{ color:t.muted }}>Nome e função exibidos no sistema e nos registros.</div>
              </div>
              <div className="ui-stat-icon" style={{ color:'#2563eb', background:'#2563eb14' }}>{ICONS.users}</div>
            </div>
            <div className="ui-panel-body">
              {profErr && <Alert tone="error" style={{ marginBottom:16 }}>{profErr}</Alert>}
              {saved && <Alert tone="success" style={{ marginBottom:16 }}>Informações atualizadas.</Alert>}
              <div className="form-fields">
                <Field t={t} htmlFor="profile-name" label="Nome completo">
                  <TextInput id="profile-name" t={t} dark={dark} value={form.name} autoComplete="name" required disabled={profileSaving}
                    onChange={event => { setForm(current=>({...current,name:event.target.value})); setSaved(false); }} />
                </Field>
                <Field t={t} htmlFor="profile-role" label="Cargo / Função">
                  <TextInput id="profile-role" t={t} dark={dark} value={form.cargo} placeholder="Ex: Analista de Faturamento" autoComplete="organization-title" disabled={profileSaving}
                    onChange={event => { setForm(current=>({...current,cargo:event.target.value})); setSaved(false); }} />
                </Field>
                <Field t={t} htmlFor="profile-email" label="E-mail" hint="O e-mail identifica a conta e não pode ser alterado." style={{ gridColumn:'1/-1' }}>
                  <TextInput id="profile-email" t={t} dark={dark} type="email" value={currentUser.email} readOnly />
                </Field>
              </div>
            </div>
            <div className="form-actions">
              <Button t={t} dark={dark} type="submit" disabled={profileSaving} style={{ minWidth:160 }}>
                {profileSaving ? <><span className="spin" style={{ display:'flex' }}>{ICONS.loader}</span> Salvando...</> : 'Salvar alterações'}
              </Button>
            </div>
          </form>

          <form onSubmit={savePwd} className="ui-panel" style={{ ...t.card, border:`1px solid ${t.border}`, borderRadius:RADIUS.lg }}>
            <div className="ui-panel-head" style={{ borderBottom:`1px solid ${t.border}` }}>
              <div>
                <div className="ui-panel-title" style={{ color:t.text }}>Segurança da conta</div>
                <div className="ui-panel-copy" style={{ color:t.muted }}>A senha nova deve ter pelo menos 8 caracteres.</div>
              </div>
              <div className="ui-stat-icon" style={{ color:'#F47920', background:'#F4792014' }}>{ICONS.settings}</div>
            </div>
            <div className="ui-panel-body">
              {pwdErr && <Alert tone="error" style={{ marginBottom:16 }}>{pwdErr}</Alert>}
              {pwdSaved && <Alert tone="success" style={{ marginBottom:16 }}>Senha alterada com sucesso.</Alert>}
              <div className="form-fields">
                <Field t={t} htmlFor="current-password" label="Senha atual" style={{ gridColumn:'1/-1' }}>
                  <TextInput id="current-password" t={t} dark={dark} type={showPasswords?'text':'password'} value={pwdForm.current}
                    placeholder="Sua senha atual" autoComplete="current-password" disabled={saving}
                    onChange={event => setPwdForm(current=>({...current,current:event.target.value}))} />
                </Field>
                <Field t={t} htmlFor="new-password" label="Nova senha">
                  <TextInput id="new-password" t={t} dark={dark} type={showPasswords?'text':'password'} value={pwdForm.newPwd}
                    placeholder="Mínimo de 8 caracteres" autoComplete="new-password" minLength={8} disabled={saving}
                    onChange={event => setPwdForm(current=>({...current,newPwd:event.target.value}))} />
                </Field>
                <Field t={t} htmlFor="confirm-password" label="Confirmar nova senha">
                  <TextInput id="confirm-password" t={t} dark={dark} type={showPasswords?'text':'password'} value={pwdForm.confirm}
                    placeholder="Repita a nova senha" autoComplete="new-password" minLength={8} disabled={saving}
                    onChange={event => setPwdForm(current=>({...current,confirm:event.target.value}))} />
                </Field>
              </div>
              <label style={{ display:'inline-flex', alignItems:'center', gap:8, marginTop:14, fontSize:11.5, color:t.muted, cursor:'pointer' }}>
                <input type="checkbox" checked={showPasswords} onChange={event => setShowPasswords(event.target.checked)} disabled={saving} />
                Mostrar senhas
              </label>
            </div>
            <div className="form-actions">
              <Button t={t} dark={dark} type="submit" disabled={saving} style={{ minWidth:160 }}>
                {saving ? <><span className="spin" style={{ display:'flex' }}>{ICONS.loader}</span> Alterando...</> : 'Alterar senha'}
              </Button>
            </div>
          </form>
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
  const [error, setError] = useState('');

  const save = (event) => {
    event?.preventDefault();
    setError('');
    setSaved(false);
    const normalizedClinic = {
      name: clinic.name.trim(),
      cnpj: clinic.cnpj.trim(),
      email: clinic.email.trim(),
    };
    if (!normalizedClinic.name) {
      setError('Informe o nome da clínica.');
      return;
    }
    if (normalizedClinic.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedClinic.email)) {
      setError('Informe um e-mail de relatórios válido.');
      return;
    }
    const toleranceValue = Number(String(audit.tolerancia).replace(',', '.'));
    if (!Number.isFinite(toleranceValue) || toleranceValue < 0) {
      setError('Informe uma tolerância válida, igual ou maior que zero.');
      return;
    }
    try {
      saveClinicSettings(normalizedClinic);
      localStorage.setItem('cs_audit_cfg', JSON.stringify(audit));
      setClinic(normalizedClinic);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch {
      setError('Não foi possível salvar as configurações neste navegador.');
    }
  };

  return (
    <div className="app-page-medium fade-in">
      <PageHeader t={t} title="Configurações" subtitle="Defina os dados usados nos relatórios e as preferências padrão de auditoria." />

      {error && <Alert tone="error" style={{ marginBottom:16 }}>{error}</Alert>}
      {saved && <Alert tone="success" style={{ marginBottom:16 }}>Configurações salvas neste navegador.</Alert>}

      <form onSubmit={save}>
        <div className="settings-grid">
          <section className="ui-panel" style={{ ...t.card, border:`1px solid ${t.border}`, borderRadius:RADIUS.lg }}>
            <div className="ui-panel-head" style={{ borderBottom:`1px solid ${t.border}` }}>
              <div>
                <div className="ui-panel-title" style={{ color:t.text }}>Identificação da clínica</div>
                <div className="ui-panel-copy" style={{ color:t.muted }}>Dados exibidos nos relatórios exportados.</div>
              </div>
              <div className="ui-stat-icon" style={{ color:'#2563eb', background:'#2563eb14' }}>{ICONS.dashboard}</div>
            </div>
            <div className="ui-panel-body form-stack" style={{ gap:15 }}>
              <Field t={t} htmlFor="clinic-name" label="Nome da clínica">
                <TextInput id="clinic-name" t={t} dark={dark} value={clinic.name} placeholder="ConSaúde" required
                  onChange={event => { setClinic(current => ({ ...current, name:event.target.value })); setSaved(false); }} />
              </Field>
              <Field t={t} htmlFor="clinic-cnpj" label="CNPJ" hint="Opcional. Use o formato 00.000.000/0001-00.">
                <TextInput id="clinic-cnpj" t={t} dark={dark} value={clinic.cnpj} placeholder="00.000.000/0001-00" inputMode="numeric"
                  onChange={event => { setClinic(current => ({ ...current, cnpj:event.target.value })); setSaved(false); }} />
              </Field>
              <Field t={t} htmlFor="clinic-email" label="E-mail de relatórios">
                <TextInput id="clinic-email" t={t} dark={dark} type="email" value={clinic.email} placeholder="relatorios@consaude.com.br" autoComplete="email"
                  onChange={event => { setClinic(current => ({ ...current, email:event.target.value })); setSaved(false); }} />
              </Field>
            </div>
          </section>

          <section className="ui-panel" style={{ ...t.card, border:`1px solid ${t.border}`, borderRadius:RADIUS.lg }}>
            <div className="ui-panel-head" style={{ borderBottom:`1px solid ${t.border}` }}>
              <div>
                <div className="ui-panel-title" style={{ color:t.text }}>Preferências de auditoria</div>
                <div className="ui-panel-copy" style={{ color:t.muted }}>Valores usados como padrão em novos relatórios.</div>
              </div>
              <div className="ui-stat-icon" style={{ color:'#F47920', background:'#F4792014' }}>{ICONS.settings}</div>
            </div>
            <div className="ui-panel-body form-stack" style={{ gap:15 }}>
              <Field t={t} htmlFor="audit-tolerance" label="Tolerância de divergência (R$)" hint="Diferenças abaixo deste valor podem ser ignoradas.">
                <TextInput id="audit-tolerance" t={t} dark={dark} value={audit.tolerancia} placeholder="0,01" inputMode="decimal"
                  onChange={event => { setAudit(current => ({ ...current, tolerancia:event.target.value })); setSaved(false); }} />
              </Field>
              <Field t={t} htmlFor="audit-format" label="Formato padrão de exportação">
                <SelectInput id="audit-format" t={t} dark={dark} value={audit.formato}
                  onChange={event => { setAudit(current => ({ ...current, formato:event.target.value })); setSaved(false); }}>
                  <option value="PDF">PDF</option>
                  <option value="XLSX">Excel (.xlsx)</option>
                </SelectInput>
              </Field>
              <div style={{ padding:12, borderRadius:RADIUS.md, background:dark?'rgba(255,255,255,.025)':'#f8fafc', border:`1px solid ${t.border}`, fontSize:11.5, lineHeight:1.55, color:t.muted }}>
                Estas preferências ficam armazenadas somente neste navegador.
              </div>
            </div>
          </section>
        </div>

        <div style={{ display:'flex', justifyContent:'flex-end', marginTop:18 }}>
          <Button t={t} dark={dark} type="submit" style={{ minWidth:180 }}>
            {saved ? <>{ICONS.check} Configurações salvas</> : 'Salvar configurações'}
          </Button>
        </div>
      </form>
    </div>
  );
}
