// Preferências do ConSaúde, salvas só neste navegador (localStorage).
// Usa a mesma chave de antes (cs_audit_cfg) — { tolerancia: '0,01', formato: 'PDF' } — e acrescenta
// os padrões da nova auditoria e as opções de exportação. O tema fica em src/lib/theme.js (cs-theme),
// porque o index.html precisa lê-lo antes do primeiro paint.
import { parseValue } from './engine.js';

export const PREFS_KEY = 'cs_audit_cfg';

/** Tolerância padrão: o mesmo R$ 0,01 fixo que a opção "ignorar diferenças" sempre usou. */
export const DEFAULT_TOLERANCE = 0.01;
export const MAX_TOLERANCE = 1_000_000;

export const DEFAULT_PREFERENCES = Object.freeze({
  tolerancia: DEFAULT_TOLERANCE,
  formato: 'PDF',
  novaAuditoria: Object.freeze({ ignorar: true, comparaNome: true, ia: true }),
  exportacao: Object.freeze({ detalhePacientes: true, insights: true, responsavel: '' }),
});

function toTolerance(v) {
  // Registros antigos guardavam o texto do campo ("0,01"); os novos guardam número.
  const n = typeof v === 'number' ? v : parseValue(v);
  return Number.isFinite(n) && n >= 0 && n <= MAX_TOLERANCE ? Math.round(n * 100) / 100 : DEFAULT_TOLERANCE;
}

const bool = (v, fallback) => (typeof v === 'boolean' ? v : fallback);

/** Normaliza qualquer objeto salvo (inclusive o formato antigo) para o formato atual. */
export function normalizePreferences(raw) {
  const r = raw && typeof raw === 'object' ? raw : {};
  const na = r.novaAuditoria && typeof r.novaAuditoria === 'object' ? r.novaAuditoria : {};
  const ex = r.exportacao && typeof r.exportacao === 'object' ? r.exportacao : {};
  const d = DEFAULT_PREFERENCES;
  return {
    tolerancia: r.tolerancia === undefined ? d.tolerancia : toTolerance(r.tolerancia),
    formato: r.formato === 'XLSX' ? 'XLSX' : 'PDF',
    novaAuditoria: {
      ignorar: bool(na.ignorar, d.novaAuditoria.ignorar),
      comparaNome: bool(na.comparaNome, d.novaAuditoria.comparaNome),
      ia: bool(na.ia, d.novaAuditoria.ia),
    },
    exportacao: {
      detalhePacientes: bool(ex.detalhePacientes, d.exportacao.detalhePacientes),
      insights: bool(ex.insights, d.exportacao.insights),
      responsavel: typeof ex.responsavel === 'string' ? ex.responsavel.trim().slice(0, 120) : '',
    },
  };
}

export function getPreferences() {
  try {
    return normalizePreferences(JSON.parse(localStorage.getItem(PREFS_KEY) || 'null'));
  } catch {
    return normalizePreferences(null);
  }
}

/** Lança se o navegador recusar a gravação (quem chama mostra o erro). */
export function savePreferences(prefs) {
  const normalized = normalizePreferences(prefs);
  localStorage.setItem(PREFS_KEY, JSON.stringify(normalized));
  return normalized;
}

/** Tolerância (R$) usada como diferença mínima por médico em novas auditorias. */
export const getTolerance = () => getPreferences().tolerancia;

/** Opções de comparação iniciais da Nova auditoria (mesmas chaves de `configs` no App). */
export function getNewAuditDefaults() {
  const { novaAuditoria } = getPreferences();
  return { ...novaAuditoria, comparaCodigo: false };
}

/**
 * Opções passadas aos exportadores: o que incluir, quem assina e os status de revisão da sessão.
 * `responsavel` em branco nas preferências = nome de quem está logado.
 */
export function getExportOptions(currentUser, statuses) {
  const { exportacao } = getPreferences();
  return {
    incluirPacientes: exportacao.detalhePacientes,
    incluirInsights: exportacao.insights,
    responsavel: exportacao.responsavel || currentUser?.name || '',
    statuses: statuses || {},
  };
}
