// ConSaúde — core primitives: helpers, Icon, Button, IconButton, Badge family, Avatar.
// Portado de consaude-design-system/components/src/core.jsx para a stack do app (ES modules + React 18).
import React, { createContext, useContext, useEffect, useLayoutEffect, useRef, useState, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { ICONS } from './icons.js';

/* ───────── helpers ───────── */
export const cx = (...a) => a.filter(Boolean).join(' ');
const BRL = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });
const NUM = new Intl.NumberFormat('pt-BR');
/** R$ 38.521,16 — always use for money. `signed` adds +/− for differences. */
export function formatBRL(v, { signed = false } = {}) {
  if (v == null || isNaN(v)) return '—';
  const s = BRL.format(Math.abs(v)).replace(/ /g, ' ');
  if (!signed) return v < 0 ? '−' + s : s;
  return (v > 0 ? '+' : v < 0 ? '−' : '') + s;
}
export const formatNumber = (v) => (v == null ? '—' : NUM.format(v));
export const formatPercent = (v, d = 1) => (v == null ? '—' : NUM.format(Number(v.toFixed(d))) + '%');
const PARTICLES = new Set(['de', 'da', 'do', 'das', 'dos', 'e', 'di', 'du']);
/** Names arrive in CAIXA ALTA from the spreadsheets: display them in title case, keep the original in `title`. */
export function titleCase(name = '') {
  return name.toLowerCase().split(/\s+/).filter(Boolean)
    .map((w, i) => (i > 0 && PARTICLES.has(w) ? w : w.charAt(0).toUpperCase() + w.slice(1))).join(' ');
}
export function initials(name = '') {
  const p = titleCase(name).split(' ').filter((w) => !PARTICLES.has(w.toLowerCase()));
  return ((p[0] || '').charAt(0) + (p.length > 1 ? p[p.length - 1].charAt(0) : '')).toUpperCase();
}
const useIsoLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect;

/** Width of an element, live (ResizeObserver). */
export function useElementWidth() {
  const ref = useRef(null);
  const [width, setWidth] = useState(0);
  useIsoLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    setWidth(el.getBoundingClientRect().width);
    const ro = new ResizeObserver((entries) => setWidth(entries[0].contentRect.width));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  return [ref, width];
}

/* ───────── viewport + portal contexts ───────── */
export const bucketFor = (w) => (w < 768 ? 'sm' : w < 1280 ? 'md' : w < 1536 ? 'lg' : 'xl');
const ViewportContext = createContext(null);
export const ViewportProvider = ViewportContext.Provider;
/** { width, bucket: 'sm'|'md'|'lg'|'xl', compact } — from the nearest AppShell/Device, else the window. */
export function useViewport() {
  const ctx = useContext(ViewportContext);
  const [w, setW] = useState(typeof window !== 'undefined' ? window.innerWidth : 1440);
  useEffect(() => {
    if (ctx) return;
    const on = () => setW(window.innerWidth);
    window.addEventListener('resize', on);
    return () => window.removeEventListener('resize', on);
  }, [ctx]);
  if (ctx) return ctx;
  const bucket = bucketFor(w);
  return { width: w, bucket, compact: bucket === 'sm' };
}
const PortalContext = createContext(null);
export const PortalProvider = PortalContext.Provider;
export const usePortalTarget = () => useContext(PortalContext);
/** Render overlays into the nearest Device screen (previews) or document.body. */
export function Portal({ children }) {
  const target = useContext(PortalContext);
  const el = target || (typeof document !== 'undefined' ? document.body : null);
  if (!el) return null;
  return createPortal(children, el);
}

/* ───────── Icon ───────── */
/** Lucide outline icon, 1.75 stroke. `name` is a Lucide id (see ICON_NAMES). Decorative unless `label` is given. */
export function Icon({ name, size, label, className, strokeWidth = 1.75, style }) {
  const inner = ICONS[name] || ICONS['circle'];
  return (
    <svg className={cx('cs-icon', className)} viewBox="0 0 24 24" width={size || 20} height={size || 20} fill="none" stroke="currentColor"
      strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" role={label ? 'img' : undefined} aria-label={label}
      aria-hidden={label ? undefined : true} focusable="false" style={style} dangerouslySetInnerHTML={{ __html: inner }} />
  );
}
export const ICON_NAMES = Object.keys(ICONS);

export function Spinner({ size = 18, className }) {
  return <Icon name="loader-circle" size={size} className={cx('cs-spin', className)} />;
}

/* ───────── Button ───────── */
/**
 * Button — pill. variant: primary | secondary | ghost | danger | danger-ghost | ia | export | light | deep | link.
 * size: sm | md | lg. `icon`/`iconEnd` are Lucide names. `loading` swaps the icon for a spinner and sets aria-busy.
 */
export const Button = React.forwardRef(function Button({ variant = 'secondary', size = 'md', icon, iconEnd, loading = false, block = false, className, children, type = 'button', disabled, ...rest }, ref) {
  const lead = loading ? <Spinner size={size === 'sm' ? 16 : 18} /> : icon ? <Icon name={icon} /> : variant === 'ia' ? <Icon name="sparkles" /> : null;
  return (
    <button ref={ref} type={type} className={cx('cs-btn', `cs-btn--${variant}`, size !== 'md' && `cs-btn--${size}`, block && 'cs-btn--block', className)}
      disabled={disabled} aria-busy={loading || undefined} {...rest}>
      {lead}
      <span className="cs-btn__label">{children}</span>
      {iconEnd && <Icon name={iconEnd} />}
    </button>
  );
});

/** Icon-only button. `label` is required (aria-label + title). variant: ghost | secondary | primary. */
export const IconButton = React.forwardRef(function IconButton({ icon, label, variant = 'ghost', size = 'md', round = false, className, type = 'button', loading, ...rest }, ref) {
  return (
    <button ref={ref} type={type} aria-label={label} title={label}
      className={cx('cs-iconbtn', variant !== 'ghost' && `cs-iconbtn--${variant}`, size === 'sm' && 'cs-iconbtn--sm', round && 'cs-iconbtn--round', className)} {...rest}>
      {loading ? <Spinner /> : <Icon name={icon} />}
    </button>
  );
});

/* ───────── Badge family ───────── */
/** Badge — short status/label pill. tone: neutral | accent | info | success | warning | danger | ia | outline | muted. Always pair color with text (and an icon for states). */
export function Badge({ tone = 'neutral', icon, size = 'md', children, className, title }) {
  return (
    <span className={cx('cs-badge', tone !== 'neutral' && `cs-badge--${tone}`, size === 'sm' && 'cs-badge--sm', className)} title={title}>
      {icon && <Icon name={icon} />}
      {children}
    </span>
  );
}
/** Numeric counter (nav, tabs, chips). */
export function Count({ children, tone, label }) {
  return <span className={cx('cs-count', tone && `cs-count--${tone}`)} aria-label={label}>{children}</span>;
}

const STATUS = {
  pendente: { tone: 'warning', icon: 'clock', label: 'Pendente' },
  revisado: { tone: 'info', icon: 'eye', label: 'Revisado' },
  corrigido: { tone: 'success', icon: 'circle-check', label: 'Corrigido' },
  conforme: { tone: 'success', icon: 'circle-check', label: 'Conforme' },
  divergente: { tone: 'danger', icon: 'triangle-alert', label: 'Com divergência' },
  ativo: { tone: 'success', icon: 'circle-check', label: 'Ativo' },
  'senha-pendente': { tone: 'warning', icon: 'key-round', label: 'Senha pendente' },
  desativado: { tone: 'muted', icon: 'user-x', label: 'Desativado' },
  processando: { tone: 'info', icon: 'loader-circle', label: 'Processando' },
  erro: { tone: 'danger', icon: 'circle-alert', label: 'Erro' },
};
/** Status badge with fixed icon + label per state (Pendente → Revisado → Corrigido; Ativo/Senha pendente/Desativado; Conforme/Com divergência). */
export function StatusBadge({ status, children, size }) {
  const s = STATUS[status] || STATUS.pendente;
  return <Badge tone={s.tone} icon={s.icon} size={size}>{children || s.label}</Badge>;
}
export const STATUS_FLOW = ['pendente', 'revisado', 'corrigido'];

/** Audit result: "Conforme" or "N divergências". */
export function ResultBadge({ divergences, size }) {
  if (!divergences) return <Badge tone="success" icon="circle-check" size={size}>Conforme</Badge>;
  return <Badge tone="danger" icon="triangle-alert" size={size}>{formatNumber(divergences)} {divergences === 1 ? 'divergência' : 'divergências'}</Badge>;
}

/** Profile badge (Administrador | Auditor | Gestor). */
export function ProfileBadge({ profile, children, size }) {
  if (profile === 'admin') return <Badge tone="accent" icon="shield-check" size={size}>{children || 'Administrador'}</Badge>;
  if (profile === 'gestor') return <Badge tone="outline" icon="chart-column" size={size}>{children || 'Gestor'}</Badge>;
  return <Badge tone="outline" icon="user" size={size}>{children || 'Auditor'}</Badge>;
}

/**
 * DirectionTag — direction of a deviation. `direction`: 'rep' (Repasse maior = pago a mais) | 'prod' (Produção maior = pago a menos).
 * Encodes by glyph (↗ / ↙) + word, never by color alone. `short` shows "Rep"/"Prod" (só em larguras compactas);
 * leitores de tela sempre ouvem a direção por extenso e o que ela significa.
 */
export function DirectionTag({ direction, short = false, plain = false, children }) {
  const rep = direction === 'rep';
  const full = rep ? 'Repasse maior' : 'Produção maior';
  const meaning = rep ? 'pago a mais' : 'pago a menos';
  return (
    <span className={cx('cs-dir', rep ? 'cs-dir--rep' : 'cs-dir--prod', plain && 'cs-dir--plain')} title={rep ? 'Repasse maior que a produção (pago a mais)' : 'Produção maior que o repasse (pago a menos)'}>
      <span className="cs-dir__glyph" aria-hidden="true"><Icon name={rep ? 'arrow-up-right' : 'arrow-down-left'} /></span>
      {children || (short ? <><span aria-hidden="true">{rep ? 'Rep' : 'Prod'}</span><span className="cs-sr">{full}</span></> : full)}
      <span className="cs-sr">{`, ${meaning}`}</span>
    </span>
  );
}
/** Difference cell: signed value on top, direction tag under it (right-aligned). Palavra inteira no desktop; "Rep"/"Prod" no compacto. */
export function DiffValue({ value, short }) {
  const { compact } = useViewport();
  const dir = value >= 0 ? 'rep' : 'prod';
  return (
    <span className="cs-diffcell">
      <span className="cs-diffcell__value">{formatBRL(value, { signed: true })}</span>
      <DirectionTag direction={dir} short={short ?? compact} plain />
    </span>
  );
}

/* ───────── Avatar ───────── */
function hashTone(s = '') { let h = 0; for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0; return (Math.abs(h) % 4) + 1; }
/** Avatar — photo or initials. size: sm (24) | md (32) | lg (40) | xl (56). Tint is derived from the name. */
export function Avatar({ name = '', src, size = 'md', off = false, className }) {
  return (
    <span className={cx('cs-avatar', size !== 'md' && `cs-avatar--${size}`, !src && `cs-avatar--t${hashTone(name)}`, off && 'cs-avatar--off', className)} title={titleCase(name)} aria-hidden={!src ? true : undefined}>
      {src ? <img src={src} alt={titleCase(name)} /> : initials(name)}
    </span>
  );
}

/** Keyboard shortcut hint. */
export const Kbd = ({ children }) => <kbd className="cs-kbd">{children}</kbd>;

export { useIsoLayoutEffect, useCallback };
