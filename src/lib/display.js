// Derivações só de exibição (não alteram dados nem cálculos). Regras do design system (03-regras-de-dados.md):
// Diferença = Repasse − Produção; positivo = "Repasse maior", negativo = "Produção maior".
import { parseValue } from './engine.js';

/** Diferença assinada de um médico (Repasse − Produção) a partir do resultado já calculado. */
export function signedDiff(d) {
  const raw = Number(d?.diferencaRaw) || 0;
  return d?.sentido === 'rep_maior' ? raw : -raw;
}

/** Diferença assinada de um item de paciente (valores já formatados em BRL no resultado). */
export function signedPatientDiff(p) {
  return parseValue(p?.repasse) - parseValue(p?.producao);
}

/** Converte um valor BRL já formatado ("R$ 1.234,56") em número, para ordenação. */
export const brlToNumber = (v) => parseValue(v);

function toDate(valor) {
  if (!valor) return null;
  if (typeof valor?.toDate === 'function') return valor.toDate();
  if (valor?.seconds) return new Date(valor.seconds * 1000);
  const d = new Date(valor);
  return isNaN(d) ? null : d;
}

/** Chave de mês (aaaa-mm) do registro, com a mesma precedência de datas de src/dashboard.js. */
export function auditMonthKey(row) {
  let d = toDate(row?.createdAt);
  if (!d) {
    const [day, month, year] = String(row?.data || '').split('/').map(Number);
    d = day && month && year ? new Date(year, month - 1, day) : null;
  }
  return d ? `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}` : null;
}

/** Mesmo critério de "auditoria com divergência" usado por summarizeAudits. */
export function hasDifferences(row) {
  const count = Number(row?.resultados?.totalDivergencias ?? row?.divergencias) || 0;
  return Number(row?.divergencias) > 0 || count > 0;
}

/** Hora (HH:mm) de um registro do histórico, quando o Firestore a tiver. */
export function auditTime(row) {
  const d = toDate(row?.createdAt);
  return d ? d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) : '';
}

/** Valor divergente de um registro do histórico, em número (usa o valor bruto salvo; senão o texto formatado). */
export function auditValue(row) {
  const raw = Number(row?.resultados?.valorTotalRaw);
  if (Number.isFinite(raw)) return raw;
  return parseValue(row?.valor);
}

/** Ordenação cronológica de registros do histórico (createdAt, senão data dd/mm/aaaa). */
export function auditSortValue(row) {
  const d = toDate(row?.createdAt);
  if (d) return d.getTime();
  const [day, month, year] = String(row?.data || '').split('/').map(Number);
  return day && month && year ? new Date(year, month - 1, day).getTime() : 0;
}

/** "26/09/2026, 14:32:10" (toLocaleString) → { date: '26/09/2026', time: '14:32' }. */
export function splitDateTime(text) {
  const [date, time = ''] = String(text || '').split(/,\s*/);
  return { date: date || '—', time: time.slice(0, 5) };
}

/** "abril de 2026" → "Abril de 2026" (primeira letra maiúscula). */
export const capitalize = (s) => (s ? String(s).charAt(0).toUpperCase() + String(s).slice(1) : s);

export const plural = (n, one, many) => `${n} ${n === 1 ? one : many}`;

export function copyText(text) {
  try {
    return Promise.resolve(navigator.clipboard?.writeText(text));
  } catch (err) {
    return Promise.reject(err);
  }
}
