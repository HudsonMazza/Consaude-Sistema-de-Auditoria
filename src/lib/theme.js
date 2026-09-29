// Tema do ConSaúde: atributo data-theme no <html>, "dark" por padrão, persistido.
// O index.html aplica o tema salvo antes do primeiro paint (sem flash); este
// módulo é a API usada pela interface para ler e trocar o tema.

export const THEME_KEY = 'cs-theme';
const THEMES = ['dark', 'light'];

export function getStoredTheme() {
  try {
    const saved = localStorage.getItem(THEME_KEY);
    return THEMES.includes(saved) ? saved : 'dark';
  } catch {
    return 'dark';
  }
}

export function getTheme() {
  if (typeof document === 'undefined') return 'dark';
  const current = document.documentElement.getAttribute('data-theme');
  return THEMES.includes(current) ? current : 'dark';
}

const listeners = new Set();

export function setTheme(theme) {
  const next = THEMES.includes(theme) ? theme : 'dark';
  document.documentElement.setAttribute('data-theme', next);
  try { localStorage.setItem(THEME_KEY, next); } catch { /* navegação privada */ }
  listeners.forEach((fn) => fn(next));
}

export function toggleTheme() {
  setTheme(getTheme() === 'dark' ? 'light' : 'dark');
}

export function applyStoredTheme() {
  document.documentElement.setAttribute('data-theme', getStoredTheme());
}

/** Inscreve um callback para mudanças de tema. Retorna a função de cancelamento. */
export function onThemeChange(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}
