// Preferências do ConSaúde, salvas só neste navegador (localStorage).
// Usa a mesma chave de antes (cs_audit_cfg) — { tolerancia: '0,01', formato: 'PDF' } — e acrescenta
// os padrões da nova auditoria e as opções de exportação. O tema fica em src/lib/theme.js (cs-theme),
// porque o index.html precisa lê-lo antes do primeiro paint.
import { parseValue } from './engine.js';

export const PREFS_KEY = 'cs_audit_cfg';

/** Tolerância padrão: o mesmo R$ 0,01 fixo que a opção "ignorar diferenças" sempre usou. */
export const DEFAULT_TOLERANCE = 0.01;
export const MAX_TOLERANCE = 1_000_000;

/** Convênios cujas guias o próprio médico fatura (ficam fora de "Guias não enviadas"). Prefixos por palavra. */
export const DEFAULT_CONVENIOS_MEDICO = Object.freeze(['UNIMED DR.', 'UNIMED DRA.']);

export const DEFAULT_PREFERENCES = Object.freeze({
  tolerancia: DEFAULT_TOLERANCE,
  formato: 'PDF',
  novaAuditoria: Object.freeze({ ignorar: true, comparaNome: true, ia: true }),
  exportacao: Object.freeze({ detalhePacientes: true, insights: true, responsavel: '' }),
  conveniosMedico: DEFAULT_CONVENIOS_MEDICO,
});

/** Lista de convênios: aceita array ou texto (um por linha ou separado por vírgula/ponto e vírgula), sem repetidos. */
export function parseConvenios(v) {
  const itens = Array.isArray(v) ? v : String(v ?? '').split(/[\n;,]+/);
  const vistos = new Set();
  return itens.map((s) => String(s ?? '').replace(/\s+/g, ' ').trim().slice(0, 80)).filter((s) => {
    const k = s.toUpperCase();
    if (!s || vistos.has(k)) return false;
    vistos.add(k);
    return true;
  }).slice(0, 60);
}

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
    conveniosMedico: r.conveniosMedico === undefined ? [...d.conveniosMedico] : parseConvenios(r.conveniosMedico),
  };
}

/** Convênios faturados pelo próprio médico (Configurações), usados nas novas auditorias. */
export const getConveniosMedico = () => getPreferences().conveniosMedico;

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
