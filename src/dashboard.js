/** "26/09/2026, 14:32:10" ou "26/09/2026" → Date (hora local). */
export function parseBRDateTime(text) {
  const m = String(text || '').match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})(?:,?\s*(\d{1,2}):(\d{2})(?::(\d{2}))?)?/);
  if (!m) return null;
  const d = new Date(+m[3], +m[2] - 1, +m[1], +(m[4] || 0), +(m[5] || 0), +(m[6] || 0));
  return Number.isNaN(d.valueOf()) ? null : d;
}

/**
 * Data da auditoria. Registros migrados do navegador antigo ganharam createdAt = dia da migração,
 * então para eles vale a data original (processadoEm/data).
 */
export function auditDate(audit) {
  if (audit?.migradoDoNavegador) {
    const original = parseBRDateTime(audit.resultados?.processadoEm) || parseBRDateTime(audit.data);
    if (original) return original;
  }
  const source = audit.createdAt;
  if (source?.toDate) return source.toDate();
  if (source?.seconds) return new Date(source.seconds * 1000);
  if (source instanceof Date) return source;
  if (source) {
    const parsed = new Date(source);
    if (!Number.isNaN(parsed.valueOf())) return parsed;
  }
  const [day, month, year] = String(audit.data || '').split('/').map(Number);
  return day && month && year ? new Date(year, month - 1, day) : null;
}

function monthKey(date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
}

export function matchesAuditScope(audit, scope, currentUserId) {
  return scope === 'all' || (scope === 'mine' ? audit.userId === currentUserId : audit.userId === scope);
}

export function summarizeAudits(audits, { months = 6, userId = 'all', now = new Date() } = {}) {
  const firstMonth = new Date(now.getFullYear(), now.getMonth() - months + 1, 1);
  const filtered = audits.filter((audit) => {
    const date = auditDate(audit);
    return date && date >= firstMonth && date <= now && (userId === 'all' || audit.userId === userId);
  });
  const series = Array.from({ length: months }, (_, index) => {
    const date = new Date(firstMonth.getFullYear(), firstMonth.getMonth() + index, 1);
    return { key: monthKey(date), label: date.toLocaleDateString('pt-BR', { month: 'short' }).replace('.', ''), audits: 0, value: 0 };
  });
  const byMonth = new Map(series.map((item) => [item.key, item]));
  const direction = { rep_maior: 0, prod_maior: 0 };
  const doctors = new Map();
  let auditsWithDifferences = 0;
  let totalDifferences = 0;
  let divergentValue = 0;

  filtered.forEach((audit) => {
    const results = audit.resultados || {};
    const details = results.divergencias || [];
    const value = Number(results.valorTotalRaw) || 0;
    const differenceCount = Number(results.totalDivergencias ?? audit.divergencias) || 0;
    const month = byMonth.get(monthKey(auditDate(audit)));
    if (month) { month.audits += 1; month.value += value; }
    if (Number(audit.divergencias) > 0 || differenceCount > 0) auditsWithDifferences += 1;
    totalDifferences += differenceCount;
    divergentValue += value;
    details.forEach((detail) => {
      if (detail.sentido === 'rep_maior' || detail.sentido === 'prod_maior') direction[detail.sentido] += 1;
      // Agrupa sem acento (auditorias antigas guardaram o nome sem acento), exibindo a grafia com acento quando houver
      const name = detail.medico || 'Não informado';
      const key = String(name).normalize('NFD').replace(/[\u0300-\u036f]/g, '').toUpperCase();
      const cur = doctors.get(key) || { name, value: 0 };
      if (name !== key) cur.name = name;
      cur.value += Number(detail.diferencaRaw) || 0;
      doctors.set(key, cur);
    });
  });

  return {
    audits: filtered,
    metrics: {
      audits: filtered.length,
      auditsWithDifferences,
      totalDifferences,
      divergentValue,
      differenceRate: filtered.length ? Math.round((auditsWithDifferences / filtered.length) * 100) : 0,
    },
    months: series,
    direction,
    topDoctors: [...doctors.values()].map(({ name, value }) => ({ name, value })).sort((a, b) => b.value - a.value).slice(0, 5),
  };
}
