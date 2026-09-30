// Nomes de pessoas vindos das planilhas (CAIXA ALTA) → exibição. Sem dependências: usado pelo motor
// (insights), pelas exportações e espelhado pelo titleCase do design system.

const PARTICLES = new Set(['de', 'da', 'do', 'das', 'dos', 'e', 'di', 'du']);

/** CAIXA ALTA das planilhas → Caixa De Título, com "de/da/do" em minúsculas (mesma regra do titleCase do DS). */
export function titleCase(name = '') {
  return String(name ?? '').toLowerCase().split(/\s+/).filter(Boolean)
    .map((w, i) => (i > 0 && PARTICLES.has(w) ? w : w.charAt(0).toUpperCase() + w.slice(1))).join(' ');
}

/** ["A", "B", "C"] → "A, B e C". Com `max`, mostra os primeiros e resume o resto ("A, B, C e mais 4"). */
export function joinNames(names, max = Infinity) {
  const list = names.filter(Boolean);
  if (list.length > max) {
    const rest = list.length - max;
    return `${list.slice(0, max).join(', ')} e mais ${rest}`;
  }
  if (list.length <= 1) return list[0] || '';
  return `${list.slice(0, -1).join(', ')} e ${list[list.length - 1]}`;
}
