// Utilitário de data usado pela tela de Usuários.
// (A antiga "Identificação da clínica" — cs_clinic — foi removida: o sistema atende uma única clínica,
// e os relatórios usam o nome fixo "ConSaúde". As preferências ficam em src/lib/preferences.js.)

// createdAt vem do Firestore como Timestamp; registros antigos podem ser string.
export function formatarData(valor) {
  if (!valor) return '—';
  const d = typeof valor?.toDate === 'function' ? valor.toDate() : new Date(valor);
  return isNaN(d) ? '—' : d.toLocaleDateString('pt-BR');
}
