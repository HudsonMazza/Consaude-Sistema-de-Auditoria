// Tema do ConSaúde: atributo data-theme no <html>, "dark" por padrão, persistido.
// A preferência salva (cs-theme) pode ser "dark", "light" ou "system" (seguir o sistema).
// O index.html aplica a preferência antes do primeiro paint (sem flash); este módulo é a
// API usada pela interface para ler e trocar o tema e acompanhar o sistema no modo automático.

export const THEME_KEY = 'cs-theme';
const THEMES = ['dark', 'light'];
const PREFERENCES = ['dark', 'light', 'system'];

const media = () => (typeof window !== 'undefined' && window.matchMedia ? window.matchMedia('(prefers-color-scheme: light)') : null);
const systemTheme = () => (media()?.matches ? 'light' : 'dark');

/** Preferência salva: 'dark' | 'light' | 'system' (padrão 'dark'). */
export function getThemePreference() {
  try {
    const saved = localStorage.getItem(THEME_KEY);
    return PREFERENCES.includes(saved) ? saved : 'dark';
  } catch {
    return 'dark';
  }
}

/** Tema efetivo da preferência salva ('dark' | 'light'). */
export function getStoredTheme() {
  const pref = getThemePreference();
  return pref === 'system' ? systemTheme() : pref;
}

export function getTheme() {
  if (typeof document === 'undefined') return 'dark';
  const current = document.documentElement.getAttribute('data-theme');
  return THEMES.includes(current) ? current : 'dark';
}

const listeners = new Set();

function apply(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  listeners.forEach((fn) => fn(theme));
}

// No modo automático, acompanha a troca de tema do sistema enquanto a página está aberta.
let unwatch = null;
function watchSystem(on) {
  unwatch?.();
  unwatch = null;
  const mq = on ? media() : null;
  if (!mq) return;
  const handler = () => { if (getThemePreference() === 'system') apply(systemTheme()); };
  if (mq.addEventListener) { mq.addEventListener('change', handler); unwatch = () => mq.removeEventListener('change', handler); }
  else if (mq.addListener) { mq.addListener(handler); unwatch = () => mq.removeListener(handler); }
}

/** Salva a preferência ('dark' | 'light' | 'system') e aplica o tema correspondente. */
export function setThemePreference(pref) {
  const next = PREFERENCES.includes(pref) ? pref : 'dark';
  try { localStorage.setItem(THEME_KEY, next); } catch { /* navegação privada */ }
  watchSystem(next === 'system');
  apply(next === 'system' ? systemTheme() : next);
}

/** Troca explícita para escuro/claro (menu da conta). Sai do modo automático. */
export function setTheme(theme) {
  setThemePreference(THEMES.includes(theme) ? theme : 'dark');
}

export function toggleTheme() {
  setTheme(getTheme() === 'dark' ? 'light' : 'dark');
}

export function applyStoredTheme() {
  watchSystem(getThemePreference() === 'system');
  document.documentElement.setAttribute('data-theme', getStoredTheme());
}

/** Inscreve um callback para mudanças de tema. Retorna a função de cancelamento. */
export function onThemeChange(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}
