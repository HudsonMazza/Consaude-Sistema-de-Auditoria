// Movido de auditoria-medica.jsx sem alteração de comportamento.
export const CS_CLINIC_KEY = 'cs_clinic';

// createdAt vem do Firestore como Timestamp; registros antigos podem ser string.
export function formatarData(valor) {
  if (!valor) return '—';
  const d = typeof valor?.toDate === 'function' ? valor.toDate() : new Date(valor);
  return isNaN(d) ? '—' : d.toLocaleDateString('pt-BR');
}

export function getClinicSettings() {
  try {
    return JSON.parse(localStorage.getItem(CS_CLINIC_KEY) || 'null') || { name: 'ConSaúde', cnpj: '', email: '' };
  } catch { return { name: 'ConSaúde', cnpj: '', email: '' }; }
}

export function saveClinicSettings(s) {
  localStorage.setItem(CS_CLINIC_KEY, JSON.stringify(s));
}
