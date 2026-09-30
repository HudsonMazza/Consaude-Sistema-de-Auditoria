// Exportações do relatório de auditoria (PDF e Excel) no visual do ConSaúde.
//
// Os dados exportados são os mesmos de antes (resumo, médicos, itens por paciente, insights, metadados);
// muda a apresentação e entram alguns acréscimos: direção das divergências, maiores impactos, tolerância
// aplicada, responsável e status de revisão da sessão.
//
// As bibliotecas (jsPDF + autotable, ExcelJS) são carregadas sob demanda com import() para não pesar no
// carregamento inicial. SheetJS continua só na leitura das planilhas (engine.js).
//
// Regras de dados (design system): Diferença = Repasse − Produção; positivo = "Repasse maior" (pago a
// mais, laranja), negativo = "Produção maior" (pago a menos, azul). Nunca vermelho/verde para direção.
import { parseValue } from './engine.js';

// ─── Helpers de dados (sem dependência de DOM) ────────────────────────────────

const BRL = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });
const NUM = new Intl.NumberFormat('pt-BR');
const PCT = new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 1 });

/** "R$ 1.234,56" com espaço comum (as fontes padrão do PDF não têm o espaço fino do Intl). */
function money(v, { signed = false } = {}) {
  const n = Number(v) || 0;
  const s = BRL.format(Math.abs(n)).replace(/\s/g, ' ');
  // En dash como sinal de menos: o "−" (U+2212) não existe na codificação das fontes padrão do jsPDF.
  if (signed) return (n > 0 ? '+' : n < 0 ? '–' : '') + s;
  return n < 0 ? '–' + s : s;
}
const count = (n) => NUM.format(Number(n) || 0);
/** Arredonda centavos (evita 2325.2999999 nas células do Excel). */
const r2 = (n) => Math.round((Number(n) || 0) * 100) / 100;

const PARTICLES = new Set(['de', 'da', 'do', 'das', 'dos', 'e', 'di', 'du']);
/** CAIXA ALTA das planilhas → Caixa De Título, com "de/da/do" em minúsculas (mesma regra do titleCase do DS). */
export function titleCase(name = '') {
  return String(name ?? '').toLowerCase().split(/\s+/).filter(Boolean)
    .map((w, i) => (i > 0 && PARTICLES.has(w) ? w : w.charAt(0).toUpperCase() + w.slice(1))).join(' ');
}
const capitalize = (s) => (s ? String(s).charAt(0).toUpperCase() + String(s).slice(1) : '');

const pad = (n) => String(n).padStart(2, '0');
const dateBR = (d) => `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}`;
const timeBR = (d) => `${pad(d.getHours())}:${pad(d.getMinutes())}`;
const isoDate = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

/** "26/09/2026, 14:32:10" (toLocaleString pt-BR) → { date: '26/09/2026', time: '14:32' }. */
function splitProcessed(text) {
  const [date, time = ''] = String(text || '').split(/,\s*/);
  return { date: date || '—', time: time.slice(0, 5) };
}

const STATUS_LABEL = { pendente: 'Pendente', revisado: 'Revisado', corrigido: 'Corrigido' };
const DIR_LABEL = { rep: 'Repasse maior', prod: 'Produção maior' };

/** Nome de arquivo: ConSaude_Auditoria_<referencia>_<aaaa-mm-dd>.<ext> */
export function exportFileName(res, ext, now = new Date()) {
  const ref = String(res?.referencia || 'sem-referencia')
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/[^A-Za-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 60) || 'sem-referencia';
  return `ConSaude_Auditoria_${capitalize(ref)}_${isoDate(now)}.${ext}`;
}

/** Tolerância registrada na auditoria (auditorias antigas não têm o campo). */
function toleranceText(res) {
  if (res?.tolerancia === undefined || res?.tolerancia === null) return null;
  const t = Number(res.tolerancia);
  if (!Number.isFinite(t)) return null;
  return t > 0 ? `${money(t)} por médico` : 'Nenhuma (todas as diferenças)';
}

/**
 * Consolida o resultado da auditoria para as duas exportações.
 * opts: { statuses, responsavel, incluirPacientes, incluirInsights, now }
 */
export function buildReportModel(res, opts = {}) {
  const now = opts.now instanceof Date ? opts.now : new Date();
  const statuses = opts.statuses || {};
  const divs = Array.isArray(res?.divergencias) ? res.divergencias : [];

  const doctors = divs.map((d) => {
    const producao = r2(parseValue(d.producao));
    const repasse = r2(parseValue(d.repasse));
    const abs = Number(d.diferencaRaw);
    const absolute = r2(Number.isFinite(abs) ? abs : Math.abs(repasse - producao));
    // Mesmo critério do relatório na tela (display.js › signedDiff).
    const signed = d.sentido === 'rep_maior' ? absolute : -absolute;
    const detalhes = Array.isArray(d.detalhes) ? d.detalhes : [];
    const statusKey = statuses[d.id] ?? d.status ?? 'pendente';
    return {
      id: d.id,
      raw: d.medico,
      name: titleCase(d.medico),
      producao, repasse, signed, absolute,
      dir: signed >= 0 ? 'rep' : 'prod',
      status: STATUS_LABEL[statusKey] || capitalize(statusKey),
      statusKey,
      pacientes: detalhes.length,
      items: detalhes.map((p) => {
        const pp = r2(parseValue(p.producao));
        const pr = r2(parseValue(p.repasse));
        const s = r2(pr - pp);
        const a = Number(p.diferencaRaw);
        return {
          raw: p.paciente, name: titleCase(p.paciente), producao: pp, repasse: pr, signed: s,
          absolute: Number.isFinite(a) ? r2(a) : Math.abs(s), dir: s >= 0 ? 'rep' : 'prod', tipo: p.tipo || '—',
        };
      }),
    };
  });

  const sum = (arr, k) => r2(arr.reduce((t, x) => t + (Number(x[k]) || 0), 0));
  const rep = doctors.filter((d) => d.dir === 'rep');
  const prod = doctors.filter((d) => d.dir === 'prod');
  const valorTotal = r2(Number.isFinite(Number(res?.valorTotalRaw)) ? Number(res.valorTotalRaw) : sum(doctors, 'absolute'));
  const processed = splitProcessed(res?.processadoEm);

  return {
    now,
    referencia: capitalize(res?.referencia) || 'Sem referência',
    processadoEm: res?.processadoEm || '—',
    processed,
    file1Name: res?.file1Name || '—',
    file2Name: res?.file2Name || '—',
    responsavel: titleCase(opts.responsavel || '') || '—',
    tolerance: toleranceText(res),
    totalMedicos: Number(res?.totalMedicos) || 0,
    medicosComDivergencia: Number(res?.medicosComDivergencia) || doctors.length,
    totalDivergencias: Number(res?.totalDivergencias) || 0,
    valorTotal,
    valorTotalText: res?.valorTotal || money(valorTotal),
    pctMedicos: res?.totalMedicos ? ((Number(res.medicosComDivergencia) || 0) / Number(res.totalMedicos)) * 100 : 0,
    doctors,
    totals: {
      producao: sum(doctors, 'producao'), repasse: sum(doctors, 'repasse'), signed: sum(doctors, 'signed'),
      absolute: sum(doctors, 'absolute'), pacientes: sum(doctors, 'pacientes'),
    },
    split: {
      rep: { count: rep.length, value: sum(rep, 'absolute') },
      prod: { count: prod.length, value: sum(prod, 'absolute') },
    },
    top: [...doctors].sort((a, b) => b.absolute - a.absolute).slice(0, 5),
    insights: opts.incluirInsights === false ? [] : (Array.isArray(res?.insights) ? res.insights : []),
    incluirInsights: opts.incluirInsights !== false,
    incluirPacientes: opts.incluirPacientes !== false,
    hasPatientDetail: doctors.some((d) => d.items.length > 0),
  };
}

// ─── Utilidades de navegador ──────────────────────────────────────────────────

function downloadBlob(blob, name) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = name;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 5000);
}

/** Logo do ConSaúde como data URL (public/logo-mark.png). Falha → null (o PDF sai sem o símbolo). */
async function loadLogo() {
  try {
    if (typeof fetch === 'undefined' || typeof FileReader === 'undefined') return null;
    const base = (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.BASE_URL) || '/';
    const resp = await fetch(`${base}logo-mark.png`);
    if (!resp.ok) return null;
    const blob = await resp.blob();
    return await new Promise((resolve) => {
      const r = new FileReader();
      r.onload = () => resolve(typeof r.result === 'string' ? r.result : null);
      r.onerror = () => resolve(null);
      r.readAsDataURL(blob);
    });
  } catch {
    return null;
  }
}

// ─── PDF ──────────────────────────────────────────────────────────────────────

const C = {
  navy: [26, 43, 107],
  blue: [11, 85, 184],       // accent-fill (tema claro) — texto/realce e "Produção maior"
  blueBar: [30, 99, 196],
  softBlue: [201, 224, 250],
  blueTint: [234, 241, 252],
  orange: [244, 121, 32],    // marca — só "Repasse maior"
  orangeText: [180, 80, 14], // dir-rep (tema claro), legível sobre branco
  orangeTint: [253, 238, 227],
  ink: [22, 23, 26],
  ink2: [74, 78, 89],
  ink3: [100, 105, 120],
  line: [228, 230, 236],
  surface2: [246, 247, 250],
  track: [233, 235, 240],
  success: [19, 117, 53],
  warning: [143, 90, 6],
  white: [255, 255, 255],
};
const DIR_COLOR = { rep: C.orangeText, prod: C.blue };
const DIR_SWATCH = { rep: C.orange, prod: C.blueBar };
const STATUS_COLOR = { pendente: C.warning, revisado: C.blue, corrigido: C.success };

const PAGE = { w: 210, h: 297, m: 16, top: 30, bottom: 22 };
const CW = PAGE.w - PAGE.m * 2;

async function loadPdfLibs() {
  const [jspdfMod, atMod] = await Promise.all([import('jspdf'), import('jspdf-autotable')]);
  const JsPDF = jspdfMod.jsPDF || jspdfMod.default;
  const autoTable = [atMod.default, atMod.default?.default, atMod.autoTable].find((f) => typeof f === 'function');
  if (typeof JsPDF !== 'function' || typeof autoTable !== 'function') throw new Error('Bibliotecas de PDF indisponíveis.');
  return { JsPDF, autoTable };
}

/**
 * Monta o PDF e devolve o documento jsPDF (sem salvar).
 * opts: { statuses, responsavel, incluirPacientes, incluirInsights, now, logoDataUrl }
 */
export async function createPDF(res, opts = {}) {
  const { JsPDF, autoTable } = await loadPdfLibs();
  const logo = opts.logoDataUrl !== undefined ? opts.logoDataUrl : await loadLogo();
  const m = buildReportModel(res, opts);
  const doc = new JsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4', compress: true });
  doc.setProperties({ title: `Relatório de auditoria — ${m.referencia}`, subject: 'Auditoria financeira de produção médica', creator: 'ConSaúde', author: m.responsavel !== '—' ? m.responsavel : 'ConSaúde' });
  doc.setLineHeightFactor(1.3);

  const font = (size, style = 'normal', color = C.ink) => { doc.setFont('helvetica', style); doc.setFontSize(size); doc.setTextColor(...color); };
  const fill = (color) => doc.setFillColor(...color);
  const stroke = (color, w = 0.2) => { doc.setDrawColor(...color); doc.setLineWidth(w); };
  const fit = (text, maxW) => {
    const s = String(text ?? '');
    if (doc.getTextWidth(s) <= maxW) return s;
    let lo = 0; let hi = s.length;
    while (lo < hi) { const mid = Math.ceil((lo + hi) / 2); if (doc.getTextWidth(s.slice(0, mid) + '…') <= maxW) lo = mid; else hi = mid - 1; }
    return s.slice(0, lo).trimEnd() + '…';
  };
  // Quebra nomes de arquivo nos separadores (_ - .) em vez de no meio de uma palavra.
  const wrapPath = (text, maxW, maxLines = 3) => {
    const parts = String(text ?? '').split(/(?<=[_\-. ])/);
    const lines = [];
    let cur = '';
    parts.forEach((part) => {
      if (cur && doc.getTextWidth(cur + part) > maxW) { lines.push(cur); cur = part; } else cur += part;
    });
    if (cur) lines.push(cur);
    const out = lines.flatMap((l) => (doc.getTextWidth(l) > maxW ? doc.splitTextToSize(l, maxW) : [l]));
    return out.length > maxLines ? [...out.slice(0, maxLines - 1), fit(out.slice(maxLines - 1).join(''), maxW)] : out;
  };
  const limit = PAGE.h - PAGE.bottom;
  let y = PAGE.top;
  const ensure = (h) => { if (y + h > limit) { doc.addPage(); y = PAGE.top + 2; } };

  const sectionTitle = (title, sub, { newPage = false, need = 30 } = {}) => {
    if (newPage) { doc.addPage(); y = PAGE.top + 4; } else ensure(need);
    font(13, 'bold', C.navy);
    doc.text(title, PAGE.m, y + 4);
    if (sub) {
      font(8.5, 'normal', C.ink3);
      const lines = doc.splitTextToSize(sub, CW);
      doc.text(lines, PAGE.m, y + 9.5);
      y += 9.5 + (lines.length - 1) * 3.8 + 4.5;
    } else {
      y += 9;
    }
  };

  // ── Página 1: resumo executivo ──
  y = PAGE.top + 4;
  font(7.5, 'bold', C.blue);
  doc.setCharSpace(0.6);
  doc.text('RELATÓRIO DE AUDITORIA', PAGE.m, y);
  doc.setCharSpace(0);
  font(22, 'bold', C.navy);
  const titleLines = doc.splitTextToSize(m.referencia, CW).slice(0, 2);
  doc.text(titleLines, PAGE.m, y + 9.5);
  y += 9.5 + (titleLines.length - 1) * 9;
  font(9, 'normal', C.ink2);
  const metaBits = [`Processada em ${m.processed.date}${m.processed.time ? ` às ${m.processed.time}` : ''}`];
  if (m.tolerance) metaBits.push(`Tolerância: ${m.tolerance}`);
  metaBits.push(`Responsável: ${m.responsavel}`);
  doc.text(fit(metaBits.join('   ·   '), CW), PAGE.m, y + 6.5);
  y += 12;

  // Card herói — valor divergente total
  const heroH = 30;
  fill(C.navy);
  doc.roundedRect(PAGE.m, y, CW, heroH, 3, 3, 'F');
  font(8.5, 'normal', C.softBlue);
  doc.text('Valor divergente total', PAGE.m + 7, y + 8.5);
  font(26, 'bold', C.white);
  doc.text(money(m.valorTotal), PAGE.m + 7, y + 19.5);
  font(8.5, 'normal', C.softBlue);
  doc.text(`em ${count(m.medicosComDivergencia)} de ${count(m.totalMedicos)} médicos analisados  ·  ${count(m.totalDivergencias)} ${m.totalDivergencias === 1 ? 'divergência' : 'divergências'}`, PAGE.m + 7, y + 25.5);
  // chip de resultado
  const chip = m.medicosComDivergencia ? 'Com divergências' : 'Conforme';
  font(8, 'bold', C.navy);
  const chipW = doc.getTextWidth(chip) + 8;
  fill(C.softBlue);
  doc.roundedRect(PAGE.m + CW - 7 - chipW, y + 5, chipW, 6.5, 3.25, 3.25, 'F');
  doc.text(chip, PAGE.m + CW - 7 - chipW / 2, y + 9.4, { align: 'center' });
  y += heroH + 5;

  // KPIs secundários
  const kpis = [
    { label: 'Médicos analisados', value: count(m.totalMedicos), hint: 'no cruzamento Produção × Repasse' },
    { label: 'Médicos com divergência', value: count(m.medicosComDivergencia), hint: `${PCT.format(m.pctMedicos)}% dos médicos analisados` },
    { label: 'Total de divergências', value: count(m.totalDivergencias), hint: 'itens a revisar' },
  ];
  const gap = 4;
  const kw = (CW - gap * (kpis.length - 1)) / kpis.length;
  const kh = 21;
  kpis.forEach((k, i) => {
    const x = PAGE.m + i * (kw + gap);
    fill(C.surface2); stroke(C.line, 0.25);
    doc.roundedRect(x, y, kw, kh, 2.5, 2.5, 'FD');
    font(7.5, 'normal', C.ink3);
    doc.text(k.label, x + 5, y + 6.5);
    font(16, 'bold', i === 1 && m.medicosComDivergencia ? C.navy : C.navy);
    doc.text(k.value, x + 5, y + 14);
    font(7, 'normal', C.ink3);
    doc.text(fit(k.hint, kw - 10), x + 5, y + 18.3);
  });
  y += kh + 9;

  // Direção das divergências
  sectionTitle('Direção das divergências', 'Diferença = Repasse – Produção, por médico. Repasse maior = pago a mais; Produção maior = pago a menos.');
  const splitTotal = m.split.rep.value + m.split.prod.value;
  const barH = 5;
  fill(C.track);
  doc.roundedRect(PAGE.m, y, CW, barH, 2.5, 2.5, 'F');
  if (splitTotal > 0) {
    const wRep = (m.split.rep.value / splitTotal) * CW;
    const wProd = CW - wRep;
    if (wRep > 0.5) { fill(C.orange); doc.roundedRect(PAGE.m, y, wRep, barH, 2.5, 2.5, 'F'); if (wProd > 0.5) doc.rect(PAGE.m + wRep - 2.5, y, 2.5, barH, 'F'); }
    if (wProd > 0.5) { fill(C.blueBar); doc.roundedRect(PAGE.m + wRep, y, wProd, barH, 2.5, 2.5, 'F'); if (wRep > 0.5) doc.rect(PAGE.m + wRep, y, 2.5, barH, 'F'); }
    if (wRep > 0.5 && wProd > 0.5) { fill(C.white); doc.rect(PAGE.m + wRep - 0.4, y, 0.8, barH, 'F'); }
  }
  y += barH + 6;
  const half = (CW - 6) / 2;
  [['rep', m.split.rep], ['prod', m.split.prod]].forEach(([dir, s], i) => {
    const x = PAGE.m + i * (half + 6);
    const pct = splitTotal ? (s.value / splitTotal) * 100 : 0;
    fill(DIR_SWATCH[dir]);
    doc.roundedRect(x, y - 2.8, 3, 3, 0.6, 0.6, 'F');
    font(9, 'bold', DIR_COLOR[dir]);
    doc.text(DIR_LABEL[dir], x + 5, y);
    font(9, 'bold', C.ink);
    doc.text(money(s.value), x + half, y, { align: 'right' });
    font(7.5, 'normal', C.ink3);
    doc.text(`${count(s.count)} ${s.count === 1 ? 'médico' : 'médicos'}  ·  ${dir === 'rep' ? 'pago a mais' : 'pago a menos'}`, x + 5, y + 4.3);
    doc.text(`${PCT.format(pct)}% do valor divergente`, x + half, y + 4.3, { align: 'right' });
  });
  y += 13;

  // Maiores impactos (esquerda) + Dados da auditoria (direita)
  ensure(60);
  const colL = 104;
  const colR = CW - colL - 8;
  const xR = PAGE.m + colL + 8;
  const top = y;
  font(13, 'bold', C.navy);
  doc.text('Maiores impactos', PAGE.m, y + 4);
  font(8.5, 'normal', C.ink3);
  doc.text('Top 5 médicos pelo valor da diferença', PAGE.m, y + 9.5);
  let yl = y + 16;
  if (!m.top.length) {
    font(9, 'normal', C.ink2);
    doc.text('Nenhuma divergência encontrada.', PAGE.m, yl + 3);
    yl += 8;
  }
  const maxAbs = m.top[0]?.absolute || 1;
  m.top.forEach((d, i) => {
    const rowY = yl + i * 9.5;
    fill(C.blueTint);
    doc.circle(PAGE.m + 2.6, rowY + 0.2, 2.6, 'F');
    font(7.5, 'bold', C.navy);
    doc.text(String(i + 1), PAGE.m + 2.6, rowY + 1.3, { align: 'center' });
    font(8.5, 'bold', C.ink);
    doc.text(fit(d.name, 62), PAGE.m + 7.5, rowY + 1.2);
    font(8.5, 'bold', DIR_COLOR[d.dir]);
    doc.text(money(d.signed, { signed: true }), PAGE.m + colL, rowY + 1.2, { align: 'right' });
    // barra proporcional
    const bw = colL - 7.5;
    fill(C.track);
    doc.roundedRect(PAGE.m + 7.5, rowY + 3, bw, 1.6, 0.8, 0.8, 'F');
    fill(DIR_SWATCH[d.dir]);
    doc.roundedRect(PAGE.m + 7.5, rowY + 3, Math.max(1.6, (d.absolute / maxAbs) * bw), 1.6, 0.8, 0.8, 'F');
  });
  yl += Math.max(m.top.length, 1) * 9.5;

  // Dados da auditoria
  font(13, 'bold', C.navy);
  doc.text('Dados da auditoria', xR, top + 4);
  let yr = top + 12.5;
  const facts = [
    ['Arquivo de produção', m.file1Name, true],
    ['Arquivo de repasse', m.file2Name, true],
    ['Processada em', `${m.processed.date}${m.processed.time ? ` às ${m.processed.time}` : ''}`],
    ...(m.tolerance ? [['Tolerância aplicada', m.tolerance]] : []),
    ['Responsável', m.responsavel],
    ['Gerado em', `${dateBR(m.now)} às ${timeBR(m.now)}`],
  ];
  facts.forEach(([label, value, isPath]) => {
    font(7, 'normal', C.ink3);
    doc.text(label, xR, yr);
    font(8.5, 'bold', C.ink);
    const lines = isPath ? wrapPath(value, colR) : doc.splitTextToSize(String(value), colR).slice(0, 2);
    doc.text(lines, xR, yr + 4);
    yr += 4 + lines.length * 3.9 + 2.6;
  });
  y = Math.max(yl, yr) + 6;

  // Análise inteligente
  if (m.incluirInsights) {
    sectionTitle('Análise inteligente', 'Pontos de atenção identificados automaticamente no processamento.', { need: 28 });
    if (!m.insights.length) {
      font(9, 'normal', C.ink2);
      doc.text('Sem análise nesta auditoria: a opção "Gerar análise inteligente" não estava ativa no processamento.', PAGE.m, y + 2);
      y += 8;
    }
    m.insights.forEach((text) => {
      font(9, 'normal', C.ink);
      const lines = doc.splitTextToSize(String(text), CW - 10);
      const h = lines.length * 4.1 + 4.4;
      ensure(h + 1);
      fill(C.surface2);
      doc.roundedRect(PAGE.m, y, CW, h, 2, 2, 'F');
      fill(C.blueBar);
      doc.circle(PAGE.m + 4, y + 3.9, 0.9, 'F');
      doc.text(lines, PAGE.m + 7.5, y + 4.8);
      y += h + 2;
    });
    y += 5;
  }

  // ── Médicos com divergência ──
  const tableBase = {
    theme: 'plain',
    margin: { top: PAGE.top + 2, bottom: PAGE.bottom + 2, left: PAGE.m, right: PAGE.m },
    styles: { font: 'helvetica', fontSize: 8, textColor: C.ink, cellPadding: { top: 2.3, bottom: 2.3, left: 2, right: 2 }, valign: 'middle', lineColor: C.line, lineWidth: 0 },
    headStyles: { fillColor: C.navy, textColor: C.white, fontStyle: 'bold', fontSize: 7.5, cellPadding: { top: 2.8, bottom: 2.8, left: 2, right: 2 } },
    footStyles: { fillColor: C.blueTint, textColor: C.navy, fontStyle: 'bold', fontSize: 8 },
    alternateRowStyles: { fillColor: C.surface2 },
    showHead: 'everyPage',
    showFoot: 'lastPage',
    rowPageBreak: 'avoid',
  };
  const R = { halign: 'right' };

  sectionTitle('Médicos com divergência', m.doctors.length
    ? `${count(m.doctors.length)} ${m.doctors.length === 1 ? 'médico' : 'médicos'} com diferença entre Produção e Repasse. Diferença = Repasse – Produção. Status de revisão conforme registrado na sessão da exportação.`
    : 'Nenhum médico com diferença entre Produção e Repasse.', { need: 70 });
  if (!m.doctors.length) {
    font(9.5, 'normal', C.ink2);
    doc.text('Nenhuma divergência encontrada. Os relatórios de produção e repasse estão em plena conformidade.', PAGE.m, y + 2);
    y += 8;
  } else {
    autoTable(doc, {
      ...tableBase,
      startY: y,
      head: [[
        'Médico', { content: 'Pacientes', styles: { halign: 'center' } }, { content: 'Produção', styles: R }, { content: 'Repasse', styles: R },
        { content: 'Diferença', styles: R }, 'Direção', 'Status',
      ]],
      body: m.doctors.map((d) => [
        d.name, d.pacientes ? count(d.pacientes) : '—', money(d.producao), money(d.repasse), money(d.signed, { signed: true }), DIR_LABEL[d.dir], d.status,
      ]),
      foot: [[
        'Total', { content: m.hasPatientDetail ? count(m.totals.pacientes) : '—', styles: { halign: 'center' } }, { content: money(m.totals.producao), styles: R }, { content: money(m.totals.repasse), styles: R },
        { content: money(m.totals.signed, { signed: true }), styles: R }, '', '',
      ]],
      columnStyles: {
        0: { cellWidth: 'auto', fontStyle: 'bold' },
        1: { cellWidth: 16, halign: 'center' },
        2: { cellWidth: 25, halign: 'right' },
        3: { cellWidth: 25, halign: 'right' },
        4: { cellWidth: 26, halign: 'right', fontStyle: 'bold' },
        5: { cellWidth: 26, fontSize: 7.5 },
        6: { cellWidth: 17, fontSize: 7.5 },
      },
      didParseCell: (data) => {
        if (data.section !== 'body') return;
        const d = m.doctors[data.row.index];
        if (data.column.index === 4) data.cell.styles.textColor = DIR_COLOR[d.dir];
        if (data.column.index === 5) { data.cell.styles.textColor = DIR_COLOR[d.dir]; data.cell.styles.cellPadding = { top: 2.3, bottom: 2.3, left: 5, right: 1.2 }; }
        if (data.column.index === 6) data.cell.styles.textColor = STATUS_COLOR[d.statusKey] || C.ink2;
      },
      didDrawCell: (data) => {
        if (data.section !== 'body' || data.column.index !== 5) return;
        const d = m.doctors[data.row.index];
        fill(DIR_SWATCH[d.dir]);
        doc.circle(data.cell.x + 2.5, data.cell.y + data.cell.height / 2, 0.95, 'F');
      },
    });
    y = doc.lastAutoTable.finalY + 5;
    ensure(8);
    const totalLabel = 'Valor divergente total (soma das diferenças absolutas): ';
    font(8, 'normal', C.ink3);
    doc.text(totalLabel, PAGE.m, y + 1);
    const labelW = doc.getTextWidth(totalLabel) + 1.2;
    font(8, 'bold', C.navy);
    doc.text(money(m.totals.absolute), PAGE.m + labelW, y + 1);
    y += 8;
  }

  // ── Detalhamento por paciente ──
  if (m.incluirPacientes && m.doctors.length) {
    // Sem itens por paciente, a seção vira só um aviso (sem abrir página nova).
    sectionTitle('Detalhamento por paciente', 'Itens divergentes de cada médico, paciente a paciente. Diferença = Repasse – Produção.', m.hasPatientDetail ? { newPage: true } : { need: 30 });
    if (!m.hasPatientDetail) {
      font(9.5, 'normal', C.ink2);
      doc.text(doc.splitTextToSize('Esta auditoria não tem itens por paciente (a comparação por paciente estava desligada ou as planilhas não têm coluna de paciente).', CW), PAGE.m, y + 2);
      y += 10;
    }
    m.doctors.filter(() => m.hasPatientDetail).forEach((d) => {
      const blockH = 15;
      const rowsNeeded = d.items.length ? Math.min(d.items.length, 2) * 7.2 + 8 : 6;
      ensure(blockH + rowsNeeded + 2);
      // Bloco do médico
      fill(C.surface2);
      doc.roundedRect(PAGE.m, y, CW, blockH, 2, 2, 'F');
      fill(DIR_SWATCH[d.dir]);
      doc.rect(PAGE.m, y + 2, 1.2, blockH - 4, 'F');
      font(10.5, 'bold', C.navy);
      doc.text(fit(d.name, CW - 70), PAGE.m + 5, y + 6.3);
      font(7.5, 'normal', C.ink3);
      doc.text(`Produção ${money(d.producao)}   ·   Repasse ${money(d.repasse)}   ·   ${d.items.length ? `${count(d.items.length)} ${d.items.length === 1 ? 'paciente' : 'pacientes'}` : 'sem detalhamento'}   ·   ${d.status}`, PAGE.m + 5, y + 11.2);
      font(11, 'bold', DIR_COLOR[d.dir]);
      doc.text(money(d.signed, { signed: true }), PAGE.m + CW - 4, y + 6.8, { align: 'right' });
      font(7.5, 'bold', DIR_COLOR[d.dir]);
      doc.text(DIR_LABEL[d.dir], PAGE.m + CW - 4, y + 11.2, { align: 'right' });
      y += blockH + 1.5;
      if (!d.items.length) {
        font(8.5, 'normal', C.ink3);
        doc.text('Sem itens por paciente para este médico.', PAGE.m + 5, y + 3.5);
        y += 10;
        return;
      }
      const firstPage = doc.getCurrentPageInfo().pageNumber;
      autoTable(doc, {
        ...tableBase,
        startY: y,
        // Em páginas seguintes, a tabela começa mais abaixo para caber a identificação do médico.
        margin: { ...tableBase.margin, top: PAGE.top + 9 },
        didDrawPage: () => {
          if (doc.getCurrentPageInfo().pageNumber === firstPage) return;
          font(8.5, 'bold', C.navy);
          doc.text(fit(d.name, CW - 60), PAGE.m, PAGE.top + 6);
          const nw = doc.getTextWidth(fit(d.name, CW - 60));
          font(7.5, 'normal', C.ink3);
          doc.text('  ·  continuação', PAGE.m + nw, PAGE.top + 6);
          font(8.5, 'bold', DIR_COLOR[d.dir]);
          doc.text(money(d.signed, { signed: true }), PAGE.m + CW, PAGE.top + 6, { align: 'right' });
        },
        headStyles: { ...tableBase.headStyles, fillColor: C.white, textColor: C.ink3, fontSize: 7, cellPadding: { top: 1.8, bottom: 1.8, left: 2.4, right: 2.4 } },
        styles: { ...tableBase.styles, fontSize: 7.8, cellPadding: { top: 1.9, bottom: 1.9, left: 2.4, right: 2.4 } },
        head: [['Paciente', { content: 'Produção', styles: R }, { content: 'Repasse', styles: R }, { content: 'Diferença', styles: R }, 'Tipo de divergência']],
        body: d.items.map((p) => [p.name, money(p.producao), money(p.repasse), money(p.signed, { signed: true }), p.tipo]),
        columnStyles: {
          0: { cellWidth: 'auto' },
          1: { cellWidth: 25, halign: 'right' },
          2: { cellWidth: 25, halign: 'right' },
          3: { cellWidth: 26, halign: 'right', fontStyle: 'bold' },
          4: { cellWidth: 58 },
        },
        didParseCell: (data) => {
          if (data.section === 'body' && data.column.index === 3) data.cell.styles.textColor = DIR_COLOR[d.items[data.row.index].dir];
        },
        didDrawCell: (data) => {
          if (data.section === 'head') { stroke(C.line, 0.25); doc.line(data.cell.x, data.cell.y + data.cell.height, data.cell.x + data.cell.width, data.cell.y + data.cell.height); }
        },
      });
      y = doc.lastAutoTable.finalY + 7;
    });
  }

  // ── Cabeçalho e rodapé em todas as páginas ──
  const pages = doc.getNumberOfPages();
  const footLeft = `ConSaúde · Auditoria financeira   ·   Gerado em ${dateBR(m.now)} às ${timeBR(m.now)}   ·   Responsável: ${m.responsavel}`;
  for (let i = 1; i <= pages; i += 1) {
    doc.setPage(i);
    // cabeçalho
    let bx = PAGE.m;
    if (logo) {
      try { doc.addImage(logo, 'PNG', PAGE.m, 10.2, 8.4, 8.4, 'cs-logo', 'FAST'); bx = PAGE.m + 10.6; } catch { bx = PAGE.m; }
    }
    font(12, 'bold', C.navy);
    doc.text('Con', bx, 16);
    const wCon = doc.getTextWidth('Con');
    doc.setTextColor(...C.blue);
    doc.text('Saúde', bx + wCon, 16);
    font(7.5, 'normal', C.ink3);
    doc.text('Relatório de auditoria', PAGE.w - PAGE.m, 12.8, { align: 'right' });
    font(8.5, 'bold', C.ink);
    doc.text(fit(m.referencia, 90), PAGE.w - PAGE.m, 17, { align: 'right' });
    stroke(C.line, 0.3);
    doc.line(PAGE.m, 21.5, PAGE.w - PAGE.m, 21.5);
    fill(C.blueBar);
    doc.rect(PAGE.m, 21.2, 18, 0.6, 'F');
    // rodapé
    stroke(C.line, 0.3);
    doc.line(PAGE.m, PAGE.h - 15, PAGE.w - PAGE.m, PAGE.h - 15);
    font(7, 'normal', C.ink3);
    doc.text(fit(footLeft, CW - 30), PAGE.m, PAGE.h - 10.5);
    font(7, 'bold', C.ink2);
    doc.text(`Página ${i} de ${pages}`, PAGE.w - PAGE.m, PAGE.h - 10.5, { align: 'right' });
  }
  doc.setPage(pages);
  return doc;
}

/** Gera e baixa o PDF. opts: ver createPDF. */
export async function exportPDF(res, opts = {}) {
  const now = opts.now instanceof Date ? opts.now : new Date();
  const doc = await createPDF(res, { ...opts, now });
  doc.save(exportFileName(res, 'pdf', now));
}

// ─── EXCEL ────────────────────────────────────────────────────────────────────

const X = {
  navy: 'FF1A2B6B', blue: 'FF0B55B8', softBlue: 'FFC9E0FA', blueTint: 'FFEAF1FC', orangeText: 'FFB4500E', orange: 'FFF47920',
  ink: 'FF16171A', ink2: 'FF4A4E59', ink3: 'FF646978', line: 'FFE4E6EC', zebra: 'FFF6F7FA', white: 'FFFFFFFF',
  success: 'FF137535', warning: 'FF8F5A06',
};
const XDIR = { rep: X.orangeText, prod: X.blue };
const XSTATUS = { pendente: X.warning, revisado: X.blue, corrigido: X.success };
const FMT_MONEY = '"R$" #,##0.00;-"R$" #,##0.00;"R$" 0.00';
const FMT_SIGNED = '+"R$" #,##0.00;-"R$" #,##0.00;"R$" 0.00';
const FMT_INT = '#,##0';
const FMT_PCT = '0.0%';
const FONT = 'Calibri';

async function loadExcelJS() {
  const mod = await import('exceljs');
  const ExcelJS = mod.default?.Workbook ? mod.default : mod;
  if (!ExcelJS?.Workbook) throw new Error('Biblioteca de Excel indisponível.');
  return ExcelJS;
}

const solid = (argb) => ({ type: 'pattern', pattern: 'solid', fgColor: { argb } });
const hair = { style: 'thin', color: { argb: X.line } };

/** Cabeçalho de tabela: fundo azul-marinho, texto branco em negrito. */
function styleHeader(row, { height = 24 } = {}) {
  row.height = height;
  row.eachCell((cell) => {
    cell.font = { name: FONT, bold: true, color: { argb: X.white }, size: 10 };
    cell.fill = solid(X.navy);
    cell.alignment = { ...(cell.alignment || {}), vertical: 'middle', wrapText: true };
    cell.border = { bottom: { style: 'thin', color: { argb: X.navy } } };
  });
}

/** Monta a planilha e devolve o Workbook do ExcelJS (sem salvar). opts: ver buildReportModel. */
export async function createWorkbook(res, opts = {}) {
  const ExcelJS = await loadExcelJS();
  const m = buildReportModel(res, opts);
  const wb = new ExcelJS.Workbook();
  wb.creator = 'ConSaúde';
  wb.title = `Relatório de auditoria — ${m.referencia}`;
  wb.created = m.now;
  wb.modified = m.now;

  // ── Resumo ──
  const ws = wb.addWorksheet('Resumo', { views: [{ showGridLines: false }], properties: { tabColor: { argb: X.navy } } });
  ws.columns = [{ width: 3 }, { width: 30 }, { width: 22 }, { width: 22 }, { width: 22 }, { width: 22 }, { width: 3 }];
  ws.pageSetup = { paperSize: 9, orientation: 'portrait', fitToPage: true, fitToWidth: 1, fitToHeight: 0, margins: { left: 0.4, right: 0.4, top: 0.5, bottom: 0.5, header: 0.2, footer: 0.2 } };
  ws.headerFooter = { oddFooter: '&L&8ConSaúde · Auditoria financeira&R&8Página &P de &N' };
  let r = 1;
  const band = (text, { size, bold, color, height }) => {
    const row = ws.getRow(r);
    row.height = height;
    for (let c = 1; c <= 7; c += 1) ws.getCell(r, c).fill = solid(X.navy);
    ws.mergeCells(r, 2, r, 6);
    const cell = ws.getCell(r, 2);
    cell.value = text;
    cell.font = { name: FONT, size, bold, color: { argb: color } };
    cell.alignment = { vertical: 'middle' };
    r += 1;
  };
  band('Relatório de auditoria', { size: 18, bold: true, color: X.white, height: 34 });
  band(`${m.referencia}  ·  ConSaúde · Auditoria financeira`, { size: 11, bold: false, color: X.softBlue, height: 22 });
  ws.getRow(r).height = 6; for (let c = 1; c <= 7; c += 1) ws.getCell(r, c).fill = solid(X.navy); r += 1;
  r += 1;

  const section = (title) => {
    ws.getRow(r).height = 22;
    ws.mergeCells(r, 2, r, 6);
    const cell = ws.getCell(r, 2);
    cell.value = title;
    cell.font = { name: FONT, size: 13, bold: true, color: { argb: X.navy } };
    cell.alignment = { vertical: 'bottom' };
    for (let c = 2; c <= 6; c += 1) ws.getCell(r, c).border = { bottom: { style: 'medium', color: { argb: X.blue } } };
    r += 2;
  };
  const fact = (label, value, numFmt) => {
    ws.getCell(r, 2).value = label;
    ws.getCell(r, 2).font = { name: FONT, size: 10, color: { argb: X.ink3 } };
    ws.mergeCells(r, 3, r, 6);
    const v = ws.getCell(r, 3);
    v.value = value;
    v.font = { name: FONT, size: 10, bold: true, color: { argb: X.ink } };
    v.alignment = { horizontal: 'left', vertical: 'middle' };
    if (numFmt) v.numFmt = numFmt;
    for (let c = 2; c <= 6; c += 1) ws.getCell(r, c).border = { bottom: hair };
    ws.getRow(r).height = 18;
    r += 1;
  };

  section('Dados da auditoria');
  fact('Referência', m.referencia);
  fact('Processada em', m.processadoEm);
  fact('Arquivo de produção', m.file1Name);
  fact('Arquivo de repasse', m.file2Name);
  if (m.tolerance) fact('Tolerância aplicada', m.tolerance);
  fact('Responsável', m.responsavel);
  fact('Gerado em', `${dateBR(m.now)} às ${timeBR(m.now)}`);
  r += 1;

  section('Indicadores');
  const kpis = [
    { label: 'Valor divergente total', value: m.valorTotal, fmt: FMT_MONEY, hint: `em ${count(m.medicosComDivergencia)} de ${count(m.totalMedicos)} médicos`, hero: true },
    { label: 'Médicos analisados', value: m.totalMedicos, fmt: FMT_INT, hint: 'Produção × Repasse' },
    { label: 'Médicos com divergência', value: m.medicosComDivergencia, fmt: FMT_INT, hint: `${PCT.format(m.pctMedicos)}% dos analisados` },
    { label: 'Total de divergências', value: m.totalDivergencias, fmt: FMT_INT, hint: 'itens a revisar' },
  ];
  kpis.forEach((k, i) => {
    const c = 2 + i;
    const bg = k.hero ? X.navy : X.zebra;
    const l = ws.getCell(r, c); l.value = k.label; l.font = { name: FONT, size: 9, color: { argb: k.hero ? X.softBlue : X.ink3 } };
    const v = ws.getCell(r + 1, c); v.value = k.value; v.numFmt = k.fmt; v.font = { name: FONT, size: k.hero ? 18 : 16, bold: true, color: { argb: k.hero ? X.white : X.navy } };
    const h = ws.getCell(r + 2, c); h.value = k.hint; h.font = { name: FONT, size: 9, color: { argb: k.hero ? X.softBlue : X.ink3 } };
    [l, v, h].forEach((cell) => { cell.fill = solid(bg); cell.alignment = { horizontal: 'left', vertical: 'middle', indent: 1 }; });
    l.border = { top: { style: 'thin', color: { argb: k.hero ? X.navy : X.line } } };
    h.border = { bottom: { style: 'thin', color: { argb: k.hero ? X.navy : X.line } } };
  });
  ws.getRow(r).height = 20; ws.getRow(r + 1).height = 28; ws.getRow(r + 2).height = 18;
  r += 4;

  section('Direção das divergências');
  const dirHead = ws.getRow(r);
  dirHead.values = [null, 'Direção', 'Médicos', 'Valor divergente', '% do valor', 'Significado'];
  styleHeader(dirHead, { height: 20 });
  [3, 4, 5].forEach((c) => { ws.getCell(r, c).alignment = { horizontal: 'right', vertical: 'middle' }; });
  ws.getCell(r, 6).alignment = { horizontal: 'left', vertical: 'middle', indent: 2 };
  r += 1;
  const dirStart = r;
  const splitTotal = m.split.rep.value + m.split.prod.value;
  [['rep', m.split.rep, 'Pago a mais'], ['prod', m.split.prod, 'Pago a menos']].forEach(([dir, s, meaning]) => {
    const row = ws.getRow(r);
    row.values = [null, DIR_LABEL[dir], s.count, s.value, splitTotal ? s.value / splitTotal : 0, meaning];
    row.getCell(2).font = { name: FONT, bold: true, color: { argb: XDIR[dir] } };
    row.getCell(3).numFmt = FMT_INT;
    row.getCell(4).numFmt = FMT_MONEY;
    row.getCell(5).numFmt = FMT_PCT;
    row.getCell(6).font = { name: FONT, color: { argb: X.ink2 } };
    row.getCell(6).alignment = { horizontal: 'left', indent: 2 };
    for (let c = 2; c <= 6; c += 1) row.getCell(c).border = { bottom: hair };
    row.height = 18;
    r += 1;
  });
  const dirTotal = ws.getRow(r);
  dirTotal.getCell(2).value = 'Total';
  dirTotal.getCell(3).value = { formula: `SUM(C${dirStart}:C${r - 1})`, result: m.split.rep.count + m.split.prod.count };
  dirTotal.getCell(4).value = { formula: `SUM(D${dirStart}:D${r - 1})`, result: splitTotal };
  dirTotal.getCell(5).value = { formula: `SUM(E${dirStart}:E${r - 1})`, result: splitTotal ? 1 : 0 };
  dirTotal.getCell(3).numFmt = FMT_INT; dirTotal.getCell(4).numFmt = FMT_MONEY; dirTotal.getCell(5).numFmt = FMT_PCT;
  for (let c = 2; c <= 6; c += 1) { const cell = dirTotal.getCell(c); cell.font = { name: FONT, bold: true, color: { argb: X.navy } }; cell.fill = solid(X.blueTint); cell.border = { top: { style: 'thin', color: { argb: X.navy } } }; }
  dirTotal.height = 18;
  r += 2;

  section('Maiores impactos');
  const topHead = ws.getRow(r);
  topHead.values = [null, 'Médico', 'Diferença', 'Direção', 'Pacientes', 'Status'];
  styleHeader(topHead, { height: 20 });
  ws.getCell(r, 3).alignment = { horizontal: 'right', vertical: 'middle' };
  ws.getCell(r, 4).alignment = { horizontal: 'left', vertical: 'middle', indent: 2 };
  ws.getCell(r, 5).alignment = { horizontal: 'center', vertical: 'middle' };
  r += 1;
  if (!m.top.length) {
    ws.getCell(r, 2).value = 'Nenhuma divergência encontrada.'; ws.getCell(r, 2).font = { name: FONT, italic: true, color: { argb: X.ink3 } }; r += 1;
  }
  m.top.forEach((d) => {
    const row = ws.getRow(r);
    row.values = [null, d.name, d.signed, DIR_LABEL[d.dir], d.pacientes || '—', d.status];
    row.getCell(2).font = { name: FONT, bold: true, color: { argb: X.ink } };
    row.getCell(3).numFmt = FMT_SIGNED;
    row.getCell(3).font = { name: FONT, bold: true, color: { argb: XDIR[d.dir] } };
    row.getCell(4).font = { name: FONT, color: { argb: XDIR[d.dir] } };
    row.getCell(4).alignment = { horizontal: 'left', indent: 2 };
    row.getCell(5).alignment = { horizontal: 'center' };
    row.getCell(6).font = { name: FONT, color: { argb: XSTATUS[d.statusKey] || X.ink2 } };
    for (let c = 2; c <= 6; c += 1) row.getCell(c).border = { bottom: hair };
    row.height = 18;
    r += 1;
  });
  r += 1;

  if (m.incluirInsights) {
    section('Análise inteligente');
    const list = m.insights.length ? m.insights : ['Sem análise nesta auditoria: a opção "Gerar análise inteligente" não estava ativa no processamento.'];
    list.forEach((text) => {
      ws.mergeCells(r, 2, r, 6);
      const cell = ws.getCell(r, 2);
      cell.value = `•  ${text}`;
      cell.font = { name: FONT, size: 10, color: { argb: m.insights.length ? X.ink : X.ink3 }, italic: !m.insights.length };
      cell.alignment = { wrapText: true, vertical: 'top', indent: 1 };
      cell.fill = solid(X.zebra);
      const lines = Math.max(1, Math.ceil(String(text).length / 125));
      ws.getRow(r).height = lines * 14 + 8;
      r += 1;
      ws.getRow(r).height = 4;
      r += 1;
    });
    r += 1;
  }
  ws.mergeCells(r, 2, r, 6);
  ws.getCell(r, 2).value = 'Diferença = Repasse − Produção. Positiva = Repasse maior (pago a mais); negativa = Produção maior (pago a menos).';
  ws.getCell(r, 2).font = { name: FONT, size: 9, italic: true, color: { argb: X.ink3 } };
  ws.getCell(r, 2).alignment = { wrapText: true };
  ws.getRow(r).height = 26;

  // ── Médicos ──
  const wm = wb.addWorksheet('Médicos', { views: [{ state: 'frozen', xSplit: 1, ySplit: 1, showGridLines: false }], properties: { tabColor: { argb: X.blue } } });
  wm.columns = [
    { header: 'Médico', key: 'medico', width: 40 },
    { header: 'Pacientes', key: 'pacientes', width: 11 },
    { header: 'Produção', key: 'producao', width: 17 },
    { header: 'Repasse', key: 'repasse', width: 17 },
    { header: 'Diferença', key: 'diferenca', width: 17 },
    { header: 'Valor divergente', key: 'abs', width: 17 },
    { header: 'Direção', key: 'direcao', width: 16 },
    { header: 'Status', key: 'status', width: 13 },
  ];
  wm.pageSetup = { paperSize: 9, orientation: 'landscape', fitToPage: true, fitToWidth: 1, fitToHeight: 0, printTitlesRow: '1:1' };
  wm.headerFooter = { oddFooter: `&L&8ConSaúde · ${m.referencia}&R&8Página &P de &N` };
  styleHeader(wm.getRow(1));
  ['B'].forEach((col) => { wm.getCell(`${col}1`).alignment = { horizontal: 'center', vertical: 'middle', wrapText: true }; });
  ['C', 'D', 'E', 'F'].forEach((col) => { wm.getCell(`${col}1`).alignment = { horizontal: 'right', vertical: 'middle', wrapText: true }; });
  wm.getCell('G1').alignment = { horizontal: 'left', vertical: 'middle', wrapText: true, indent: 2 };
  m.doctors.forEach((d, i) => {
    const row = wm.addRow({ medico: d.name, pacientes: d.pacientes || '—', producao: d.producao, repasse: d.repasse, diferenca: d.signed, abs: d.absolute, direcao: DIR_LABEL[d.dir], status: d.status });
    row.height = 18;
    row.eachCell({ includeEmpty: true }, (cell, c) => {
      cell.font = { name: FONT, size: 10, color: { argb: X.ink } };
      cell.border = { bottom: hair };
      cell.alignment = { vertical: 'middle' };
      if (i % 2 === 1) cell.fill = solid(X.zebra);
      if (c >= 3 && c <= 6) cell.numFmt = c === 5 ? FMT_SIGNED : FMT_MONEY;
    });
    row.getCell(1).font = { name: FONT, size: 10, bold: true, color: { argb: X.ink } };
    row.getCell(2).alignment = { horizontal: 'center', vertical: 'middle' };
    if (typeof row.getCell(2).value === 'number') row.getCell(2).numFmt = FMT_INT;
    row.getCell(5).font = { name: FONT, size: 10, bold: true, color: { argb: XDIR[d.dir] } };
    row.getCell(7).font = { name: FONT, size: 10, color: { argb: XDIR[d.dir] } };
    row.getCell(7).alignment = { horizontal: 'left', vertical: 'middle', indent: 2 };
    row.getCell(8).font = { name: FONT, size: 10, color: { argb: XSTATUS[d.statusKey] || X.ink2 } };
  });
  const lastM = m.doctors.length + 1;
  if (m.doctors.length) {
    wm.autoFilter = { from: { row: 1, column: 1 }, to: { row: lastM, column: 8 } };
    const t = wm.getRow(lastM + 1);
    t.getCell(1).value = 'Total';
    t.getCell(2).value = m.hasPatientDetail ? { formula: `SUM(B2:B${lastM})`, result: m.totals.pacientes } : '—';
    t.getCell(3).value = { formula: `SUM(C2:C${lastM})`, result: m.totals.producao };
    t.getCell(4).value = { formula: `SUM(D2:D${lastM})`, result: m.totals.repasse };
    t.getCell(5).value = { formula: `SUM(E2:E${lastM})`, result: m.totals.signed };
    t.getCell(6).value = { formula: `SUM(F2:F${lastM})`, result: m.totals.absolute };
    for (let c = 1; c <= 8; c += 1) {
      const cell = t.getCell(c);
      cell.font = { name: FONT, size: 10, bold: true, color: { argb: X.navy } };
      cell.fill = solid(X.blueTint);
      cell.border = { top: { style: 'medium', color: { argb: X.navy } } };
      cell.alignment = { vertical: 'middle', horizontal: c === 2 ? 'center' : undefined };
    }
    t.getCell(2).numFmt = FMT_INT;
    [3, 4, 6].forEach((c) => { t.getCell(c).numFmt = FMT_MONEY; });
    t.getCell(5).numFmt = FMT_SIGNED;
    t.height = 20;
    const note = wm.getRow(lastM + 3);
    note.getCell(1).value = 'Diferença = Repasse − Produção. Valor divergente = diferença absoluta (soma = valor divergente total do resumo).';
    note.getCell(1).font = { name: FONT, size: 9, italic: true, color: { argb: X.ink3 } };
  } else {
    wm.getCell('A2').value = 'Nenhuma divergência encontrada. Os relatórios de produção e repasse estão em plena conformidade.';
    wm.getCell('A2').font = { name: FONT, italic: true, color: { argb: X.ink3 } };
  }

  // ── Itens por paciente ──
  const wi = wb.addWorksheet('Itens por paciente', { views: [{ state: 'frozen', xSplit: 2, ySplit: 1, showGridLines: false }], properties: { tabColor: { argb: X.orange } } });
  wi.columns = [
    { header: 'Médico', key: 'medico', width: 34 },
    { header: 'Paciente', key: 'paciente', width: 34 },
    { header: 'Produção', key: 'producao', width: 16 },
    { header: 'Repasse', key: 'repasse', width: 16 },
    { header: 'Diferença', key: 'diferenca', width: 16 },
    { header: 'Valor divergente', key: 'abs', width: 16 },
    { header: 'Tipo de divergência', key: 'tipo', width: 34 },
    { header: 'Direção', key: 'direcao', width: 16 },
  ];
  wi.pageSetup = { paperSize: 9, orientation: 'landscape', fitToPage: true, fitToWidth: 1, fitToHeight: 0, printTitlesRow: '1:1' };
  wi.headerFooter = { oddFooter: `&L&8ConSaúde · ${m.referencia}&R&8Página &P de &N` };
  styleHeader(wi.getRow(1));
  ['C', 'D', 'E', 'F'].forEach((col) => { wi.getCell(`${col}1`).alignment = { horizontal: 'right', vertical: 'middle', wrapText: true }; });
  wi.getCell('G1').alignment = { horizontal: 'left', vertical: 'middle', wrapText: true, indent: 2 };
  let itemRows = 0;
  // Faixas alternadas por médico: facilita ler os itens de cada um.
  m.doctors.filter((d) => d.items.length).forEach((d, di) => {
    d.items.forEach((p) => {
      const row = wi.addRow({ medico: d.name, paciente: p.name, producao: p.producao, repasse: p.repasse, diferenca: p.signed, abs: p.absolute, tipo: p.tipo, direcao: DIR_LABEL[p.dir] });
      row.height = 18;
      row.eachCell({ includeEmpty: true }, (cell, c) => {
        cell.font = { name: FONT, size: 10, color: { argb: X.ink } };
        cell.border = { bottom: hair };
        cell.alignment = { vertical: 'middle' };
        if (di % 2 === 1) cell.fill = solid(X.zebra);
        if (c >= 3 && c <= 6) cell.numFmt = c === 5 ? FMT_SIGNED : FMT_MONEY;
      });
      row.getCell(1).font = { name: FONT, size: 10, bold: true, color: { argb: X.ink2 } };
      row.getCell(5).font = { name: FONT, size: 10, bold: true, color: { argb: XDIR[p.dir] } };
      row.getCell(7).alignment = { horizontal: 'left', vertical: 'middle', indent: 2 };
      row.getCell(8).font = { name: FONT, size: 10, color: { argb: XDIR[p.dir] } };
      itemRows += 1;
    });
  });
  if (itemRows) {
    const last = itemRows + 1;
    wi.autoFilter = { from: { row: 1, column: 1 }, to: { row: last, column: 8 } };
    const t = wi.getRow(last + 1);
    t.getCell(1).value = 'Total';
    t.getCell(2).value = `${count(itemRows)} ${itemRows === 1 ? 'item' : 'itens'}`;
    const sumItems = (k) => m.doctors.reduce((s, d) => s + d.items.reduce((a, p) => a + p[k], 0), 0);
    t.getCell(3).value = { formula: `SUM(C2:C${last})`, result: sumItems('producao') };
    t.getCell(4).value = { formula: `SUM(D2:D${last})`, result: sumItems('repasse') };
    t.getCell(5).value = { formula: `SUM(E2:E${last})`, result: sumItems('signed') };
    t.getCell(6).value = { formula: `SUM(F2:F${last})`, result: sumItems('absolute') };
    for (let c = 1; c <= 8; c += 1) {
      const cell = t.getCell(c);
      cell.font = { name: FONT, size: 10, bold: true, color: { argb: X.navy } };
      cell.fill = solid(X.blueTint);
      cell.border = { top: { style: 'medium', color: { argb: X.navy } } };
    }
    [3, 4, 6].forEach((c) => { t.getCell(c).numFmt = FMT_MONEY; });
    t.getCell(5).numFmt = FMT_SIGNED;
    t.height = 20;
  } else {
    wi.getCell('A2').value = m.doctors.length
      ? 'Esta auditoria não tem itens por paciente (a comparação por paciente estava desligada ou as planilhas não têm coluna de paciente).'
      : 'Nenhuma divergência encontrada.';
    wi.getCell('A2').font = { name: FONT, italic: true, color: { argb: X.ink3 } };
  }

  return wb;
}

/** Gera e baixa a planilha .xlsx. opts: ver buildReportModel. */
export async function exportExcel(res, opts = {}) {
  const now = opts.now instanceof Date ? opts.now : new Date();
  const wb = await createWorkbook(res, { ...opts, now });
  const buffer = await wb.xlsx.writeBuffer();
  downloadBlob(new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }), exportFileName(res, 'xlsx', now));
}
