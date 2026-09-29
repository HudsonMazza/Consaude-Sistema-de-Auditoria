// Portado de consaude-design-system/components/src/layout.jsx.
// Ajustes do app: navegação e usuário vêm por props (sem dados de demonstração), a busca global da topbar
// (proposta do design system) fica desligada, o menu da conta recebe as ações reais, o tema usa src/lib/theme.js
// e o estado "Recolher" da sidebar é lembrado. Os helpers de prévia (Device, BrowserFrame) não foram portados.
import React, { useState, useEffect, createContext, useContext } from 'react';
import { cx, Icon, Button, IconButton, Avatar, Count, useElementWidth, bucketFor, ViewportProvider, useViewport, titleCase } from './core.jsx';
import { ActionMenu } from './overlays.jsx';
import { Brand, BrandMark, BrandName } from './Brand.jsx';
import { getTheme, toggleTheme, onThemeChange } from '../../lib/theme.js';

const ShellContext = createContext({ collapsed: false, toggle: () => {} });
const COLLAPSE_KEY = 'cs-sidebar-collapsed';

function readCollapsed() {
  try { return localStorage.getItem(COLLAPSE_KEY) === '1'; } catch { return false; }
}

/**
 * AppShell — sidebar + topbar + content on desktop; top app bar + bottom navigation on mobile.
 * Measures its own width: < 768 compact (bottom nav), 768–1279 rail sidebar, ≥ 1280 full sidebar (user can collapse).
 * Props: active (nav id), onNavigate(id), nav ([{group}|{id,label,icon,short,bottom}]), bottomNav ([ids] — 4 destinos),
 * crumbs, title (mobile app bar), back ({label,onClick}), onNewAudit, user, accountItems (ActionMenu items), children.
 */
export function AppShell({ active, onNavigate, nav = [], bottomNav, crumbs = [], title, onNewAudit, back, children, user, accountItems, onBrand }) {
  const [ref, width] = useElementWidth();
  const [collapsed, setCollapsed] = useState(readCollapsed);
  const w = width || (typeof window !== 'undefined' ? window.innerWidth : 1440);
  const bucket = bucketFor(w);
  const compact = bucket === 'sm';
  const rail = !compact && (bucket === 'md' || collapsed);
  const vp = { width: w, bucket, compact };
  const toggle = () => setCollapsed((c) => {
    const n = !c;
    try { localStorage.setItem(COLLAPSE_KEY, n ? '1' : '0'); } catch { /* ignore */ }
    return n;
  });
  return (
    <ViewportProvider value={vp}>
      <ShellContext.Provider value={{ collapsed: rail, toggle }}>
        <div ref={ref} className="cs-app" data-layout={compact ? 'compact' : 'regular'} data-nav={rail ? 'rail' : 'full'} data-width={bucket}>
          <a className="cs-skip" href="#conteudo">Pular para o conteúdo</a>
          <Sidebar nav={nav} active={active} onNavigate={onNavigate} onNewAudit={onNewAudit} onBrand={onBrand} />
          <div className="cs-main">
            <Topbar crumbs={crumbs} title={title} back={back} user={user} accountItems={accountItems} />
            <main className="cs-content" id="conteudo" tabIndex={-1}>{children}</main>
            <BottomNav nav={nav} ids={bottomNav} active={active} onNavigate={onNavigate} onNewAudit={onNewAudit} />
          </div>
        </div>
      </ShellContext.Provider>
    </ViewportProvider>
  );
}

/** Sidebar — grouped navigation, "Nova auditoria" card, "Recolher". Collapses to a 76px icon rail. */
export function Sidebar({ nav = [], active, onNavigate, onNewAudit, onBrand }) {
  const { collapsed, toggle } = useContext(ShellContext);
  const { bucket } = useViewport();
  return (
    <aside className="cs-sidebar" aria-label="Navegação principal">
      <Brand onClick={onBrand} />
      <nav className="cs-nav" aria-label="Seções">
        {nav.filter((it) => it.sidebar !== false).map((it, i) => it.group ? <div key={i} className="cs-nav__group" role="presentation">{it.group}</div> : (
          <NavItem key={it.id} item={it} active={active === it.id} onClick={() => onNavigate && onNavigate(it.id)} collapsed={collapsed} />
        ))}
      </nav>
      <div className="cs-sidebar__foot">
        {onNewAudit && (
          <div className="cs-promo">
            <span className="cs-promo__glyph"><Icon name="file-search" /></span>
            <p className="cs-promo__title">Nova auditoria</p>
            <p className="cs-promo__text">Cruze Produção × Repasse em 2 passos.</p>
            <Button variant="primary" size="sm" icon="plus" block onClick={onNewAudit}>Nova auditoria</Button>
          </div>
        )}
        {onNewAudit && <IconButton className="cs-rail-cta" variant="primary" icon="plus" label="Nova auditoria" onClick={onNewAudit} />}
        {bucket !== 'md' && (
          <button type="button" className="cs-nav__item cs-collapse" onClick={toggle} aria-expanded={!collapsed} aria-label={collapsed ? 'Expandir menu' : 'Recolher menu'} title={collapsed ? 'Expandir menu' : 'Recolher menu'}>
            <Icon name={collapsed ? 'panel-left-open' : 'panel-left-close'} /><span className="cs-nav__label cs-collapse__label">Recolher</span>
          </button>
        )}
      </div>
    </aside>
  );
}

/** NavItem — icon + label (+ count). Current page uses aria-current and the filled blue style. In the rail the label becomes the tooltip. */
export function NavItem({ item, active, onClick, collapsed }) {
  return (
    <a href={'#' + item.id} className="cs-nav__item" aria-current={active ? 'page' : undefined} onClick={(e) => { e.preventDefault(); onClick && onClick(); }}
      title={collapsed ? item.label : undefined} aria-label={collapsed ? item.label : undefined}>
      <Icon name={item.icon} />
      <span className="cs-nav__label">{item.label}</span>
      {item.count ? <Count label={item.countLabel}>{item.count}</Count> : null}
      {item.count ? <span className="cs-dot" aria-hidden="true" /> : null}
    </a>
  );
}

/** BottomNav — mobile primary navigation: 4 destinations + the central "Nova auditoria" action. */
export function BottomNav({ nav = [], ids, active, onNavigate, onNewAudit }) {
  const all = nav.filter((n) => n.id);
  const items = ids ? ids.map((id) => all.find((n) => n.id === id)).filter(Boolean) : all.slice(0, 4);
  const slot = (it) => it ? (
    <a key={it.id} href={'#' + it.id} className="cs-bnav__item" aria-current={active === it.id ? 'page' : undefined} onClick={(e) => { e.preventDefault(); onNavigate && onNavigate(it.id); }}>
      <Icon name={it.icon} />{it.short || it.label}
      {it.count ? <span className="cs-bnav__badge"><Count tone="accent" label={it.countLabel}>{it.count}</Count></span> : null}
    </a>
  ) : <span aria-hidden="true" />;
  return (
    <nav className="cs-bottomnav" aria-label="Navegação principal">
      {slot(items[0])}{slot(items[1])}
      <button type="button" className="cs-bnav__fab" onClick={onNewAudit} aria-label="Nova auditoria"><span className="cs-bnav__fabcircle"><Icon name="plus" /></span>Nova</button>
      {slot(items[2])}{slot(items[3])}
    </nav>
  );
}

/** Breadcrumb — last item is the current page. items: [{ label, onClick }]. */
export function Breadcrumb({ items = [] }) {
  if (!items.length) return null;
  return (
    <nav aria-label="Você está em" style={{ minWidth: 0 }}>
      <ol className="cs-crumbs">
        {items.map((it, i) => (
          <li key={i}>
            {i > 0 && <Icon name="chevron-right" />}
            {i === items.length - 1 ? <span aria-current="page" className="cs-truncate">{it.label}</span>
              : it.onClick ? <a href="#" onClick={(e) => { e.preventDefault(); it.onClick(); }}>{it.label}</a>
              : <span>{it.label}</span>}
          </li>
        ))}
      </ol>
    </nav>
  );
}

/** Hook: tema atual (dark | light), reativo. */
export function useTheme() {
  const [theme, setThemeState] = useState(getTheme);
  useEffect(() => onThemeChange(setThemeState), []);
  return theme;
}

/** ThemeToggle — switches html[data-theme] between dark and light (persisted). */
export function ThemeToggle({ className }) {
  const theme = useTheme();
  return <IconButton className={cx('cs-theme-toggle', className)} icon={theme === 'dark' ? 'sun' : 'moon'} label={theme === 'dark' ? 'Usar tema claro' : 'Usar tema escuro'} onClick={toggleTheme} />;
}

/** AccountMenu — avatar button → ações da conta. On mobile the theme switch lives here. */
export function AccountMenu({ user = {}, items = [] }) {
  const theme = useTheme();
  const name = user.name || user.email || 'Usuário';
  const menuItems = items.map((it) => (it.themeToggle ? { ...it, label: theme === 'dark' ? 'Usar tema claro' : 'Usar tema escuro', icon: theme === 'dark' ? 'sun' : 'moon', onSelect: toggleTheme } : it));
  return (
    <ActionMenu label="Menu da conta" title="Sua conta"
      header={<><Avatar name={name} src={user.photo || undefined} size="lg" /><div style={{ minWidth: 0 }}><div className="cs-account__name cs-truncate">{titleCase(name)}</div><div className="cs-account__role cs-truncate" title={user.email}>{user.email}</div></div></>}
      items={menuItems}
      trigger={(p) => (
        <button type="button" className="cs-account" aria-label={`Conta de ${titleCase(name)}`} {...p}>
          <Avatar name={name} src={user.photo || undefined} />
          <span className="cs-account__text"><span className="cs-account__name">{titleCase(name)}</span><span className="cs-account__role">{user.roleLabel}</span></span>
          <Icon name="chevron-down" className="cs-account__chev" />
        </button>
      )} />
  );
}

/** Topbar — breadcrumb, theme, account (desktop). Mobile: brand on top-level pages; back + title on detail pages (`back`). */
export function Topbar({ crumbs = [], title, back, user, accountItems, search }) {
  return (
    <header className="cs-topbar">
      <div className="cs-topbar__start">
        <div className="cs-topbar__mobile">
          {back ? <IconButton icon="arrow-left" label={back.label || 'Voltar'} onClick={back.onClick} /> : <BrandMark />}
          {back ? <span className="cs-topbar__title cs-truncate">{title || (crumbs.length ? crumbs[crumbs.length - 1].label : '')}</span>
            : <BrandName />}
        </div>
        <Breadcrumb items={crumbs} />
      </div>
      <div className="cs-topbar__end">
        {search ? <div className="cs-topbar__search">{search}</div> : null}
        <ThemeToggle />
        <span className="cs-topbar__divider" aria-hidden="true" />
        <AccountMenu user={user} items={accountItems} />
      </div>
    </header>
  );
}

/**
 * PageHeader — title, subtitle/meta and actions. On mobile it keeps `primary` visible and folds `secondary` into a "⋯" sheet.
 * primary: element (usually a Button). secondary: [{ label, icon, onSelect, variant, disabled }] (also rendered as buttons on desktop).
 */
export function PageHeader({ eyebrow, title, subtitle, meta, badge, primary, secondary = [], extra }) {
  const { compact } = useViewport();
  return (
    <div className="cs-pagehead">
      <div className="cs-pagehead__titles">
        {eyebrow && <span className="cs-pagehead__eyebrow">{eyebrow}</span>}
        <h1 className="cs-pagehead__title">{title}{badge}</h1>
        {subtitle && <p className="cs-pagehead__sub">{subtitle}</p>}
        {meta && <div className="cs-pagehead__meta">{meta}</div>}
      </div>
      {(primary || secondary.length > 0 || extra) && (
        <div className="cs-pagehead__actions">
          {extra}
          {!compact && secondary.map((a, i) => <Button key={i} variant={a.variant === 'ia' ? 'ia' : a.variant === 'export' ? 'export' : 'secondary'} icon={a.icon} onClick={a.onSelect} disabled={a.disabled}>{a.label}</Button>)}
          {primary}
          {compact && secondary.length > 0 && <ActionMenu items={secondary} label="Mais ações da página" title="Ações" trigger={(p) => <IconButton icon="ellipsis" label="Mais ações" variant="secondary" round {...p} />} />}
        </div>
      )}
    </div>
  );
}

/** ActionBar — sticky footer bar for forms/flows (Salvar, Processar). Stacks full-width above the bottom nav on mobile. */
export function ActionBar({ message, icon = 'info', children, tone }) {
  return (
    <div className={cx('cs-actionbar', tone && `cs-actionbar--${tone}`)}>
      <span className="cs-actionbar__msg" role="status">{icon && <Icon name={icon} />}<span>{message}</span></span>
      <div className="cs-btngroup">{children}</div>
    </div>
  );
}

/** SettingsSection — two-column settings block: intro on the left, fields on the right (stacks on tablet/mobile). */
export function SettingsSection({ title, description, children }) {
  return (
    <section className="cs-settings">
      <div className="cs-settings__intro"><h2>{title}</h2>{description && <p>{description}</p>}</div>
      <div className="cs-settings__fields">{children}</div>
    </section>
  );
}
