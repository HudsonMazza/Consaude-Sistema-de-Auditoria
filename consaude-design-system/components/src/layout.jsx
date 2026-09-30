// ConSaúde — app shell: AppShell, Sidebar, BottomNav, Topbar, Breadcrumb, ThemeToggle, AccountMenu, PageHeader, ActionBar, SettingsSection.
// Preview helpers: Device (phone frame), BrowserFrame.
import { cx, Icon, Button, IconButton, Avatar, Count, useElementWidth, bucketFor, ViewportProvider, PortalProvider, useViewport, titleCase } from './core.jsx';
import { ActionMenu } from './overlays.jsx';
import { SearchField } from './forms.jsx';
const React = window.React;
const { useState, useEffect, useRef, createContext, useContext } = React;

export const NAV = [
  { group: 'Menu principal' },
  { id: 'dashboard', label: 'Dashboard', icon: 'layout-dashboard', short: 'Início' },
  { id: 'auditorias', label: 'Auditorias', icon: 'clipboard-check', short: 'Auditorias', count: 3, countLabel: '3 auditorias com revisão pendente' },
  { group: 'Administração' },
  { id: 'usuarios', label: 'Usuários', icon: 'users', short: 'Usuários' },
  { id: 'configuracoes', label: 'Configurações', icon: 'settings', short: 'Ajustes' },
];
export const CURRENT_USER = { name: 'ANA PAULA LIMA', role: 'Administradora', email: 'ana.lima@clinicasaolucas.com.br' };

const ShellContext = createContext({ collapsed: false, toggle: () => {} });

/**
 * AppShell — sidebar + topbar + content on desktop; top app bar + bottom navigation on mobile.
 * Measures its own width: < 768 compact (bottom nav), 768–1279 rail sidebar, ≥ 1280 full sidebar (user can collapse).
 * Props: active (nav id), onNavigate(id), crumbs, title (mobile app bar), onNewAudit, back (mobile back action), children (page).
 */
export function AppShell({ active = 'dashboard', onNavigate, crumbs = [], title, onNewAudit, back, children, defaultCollapsed = false, nav = NAV, user = CURRENT_USER }) {
  const [ref, width] = useElementWidth();
  const [collapsed, setCollapsed] = useState(defaultCollapsed);
  const w = width || (typeof window !== 'undefined' ? window.innerWidth : 1440);
  const bucket = bucketFor(w);
  const compact = bucket === 'sm';
  const rail = !compact && (bucket === 'md' || collapsed);
  const vp = { width: w, bucket, compact };
  return (
    <ViewportProvider value={vp}>
      <ShellContext.Provider value={{ collapsed: rail, toggle: () => setCollapsed((c) => !c) }}>
        <div ref={ref} className="cs-app" data-layout={compact ? 'compact' : 'regular'} data-nav={rail ? 'rail' : 'full'} data-width={bucket}>
          <Sidebar nav={nav} active={active} onNavigate={onNavigate} onNewAudit={onNewAudit} />
          <div className="cs-main">
            <Topbar crumbs={crumbs} title={title} back={back} user={user} />
            <main className="cs-content" id="conteudo">{children}</main>
            <BottomNav nav={nav} active={active} onNavigate={onNavigate} onNewAudit={onNewAudit} />
          </div>
        </div>
      </ShellContext.Provider>
    </ViewportProvider>
  );
}

/** Brand block. There is no ConSaúde logo yet: the mark is a neutral placeholder tile (see README › Iconografia). */
export function Brand({ compact }) {
  return (
    <a className="cs-brand" href="#" aria-label="ConSaúde — Auditoria Financeira, início">
      <span className="cs-brand__mark" aria-hidden="true"><Icon name="activity" /></span>
      {!compact && <span className="cs-brand__text"><span className="cs-brand__name">Con<em>Saúde</em></span><span className="cs-brand__tag">Auditoria Financeira</span></span>}
    </a>
  );
}

/** Sidebar — grouped navigation, "Nova auditoria" card, "Recolher". Collapses to a 76px icon rail. */
export function Sidebar({ nav = NAV, active, onNavigate, onNewAudit }) {
  const { collapsed, toggle } = useContext(ShellContext);
  const { bucket } = useViewport();
  return (
    <aside className="cs-sidebar" aria-label="Navegação principal">
      <Brand />
      <nav className="cs-nav">
        {nav.map((it, i) => it.group ? <div key={i} className="cs-nav__group" role="presentation">{it.group}</div> : (
          <NavItem key={it.id} item={it} active={active === it.id} onClick={() => onNavigate && onNavigate(it.id)} collapsed={collapsed} />
        ))}
      </nav>
      <div className="cs-sidebar__foot">
        <div className="cs-promo">
          <span className="cs-promo__glyph"><Icon name="file-search" /></span>
          <p className="cs-promo__title">Nova auditoria</p>
          <p className="cs-promo__text">Cruze Produção × Repasse em 2 passos.</p>
          <Button variant="primary" size="sm" icon="plus" block onClick={onNewAudit}>Nova auditoria</Button>
        </div>
        <IconButton className="cs-rail-cta" variant="primary" icon="plus" label="Nova auditoria" onClick={onNewAudit} />
        {bucket !== 'md' && (
          <button type="button" className="cs-nav__item cs-collapse" onClick={toggle} aria-expanded={!collapsed} title={collapsed ? 'Expandir menu' : 'Recolher menu'}>
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
    <a href={'#' + item.id} className="cs-nav__item" aria-current={active ? 'page' : undefined} onClick={(e) => { e.preventDefault(); onClick && onClick(); }} title={collapsed ? item.label : undefined}>
      <Icon name={item.icon} />
      <span className="cs-nav__label">{item.label}</span>
      {item.count ? <Count label={item.countLabel}>{item.count}</Count> : null}
      {item.count ? <span className="cs-dot" aria-hidden="true" /> : null}
    </a>
  );
}

/** BottomNav — mobile primary navigation: 4 destinations + the central "Nova auditoria" action. */
export function BottomNav({ nav = NAV, active, onNavigate, onNewAudit }) {
  const items = nav.filter((n) => n.id);
  const slot = (it) => (
    <a key={it.id} href={'#' + it.id} className="cs-bnav__item" aria-current={active === it.id ? 'page' : undefined} onClick={(e) => { e.preventDefault(); onNavigate && onNavigate(it.id); }}>
      <Icon name={it.icon} />{it.short || it.label}
      {it.count ? <span className="cs-bnav__badge"><Count tone="accent" label={it.countLabel}>{it.count}</Count></span> : null}
    </a>
  );
  return (
    <nav className="cs-bottomnav" aria-label="Navegação principal">
      {slot(items[0])}{slot(items[1])}
      <button type="button" className="cs-bnav__fab" onClick={onNewAudit} aria-label="Nova auditoria"><span className="cs-bnav__fabcircle"><Icon name="plus" /></span>Nova</button>
      {slot(items[2])}{slot(items[3])}
    </nav>
  );
}

/** Breadcrumb — last item is the current page. items: [{ label, href }]. */
export function Breadcrumb({ items = [] }) {
  return (
    <nav aria-label="Você está em">
      <ol className="cs-crumbs">
        {items.map((it, i) => (
          <li key={i}>
            {i > 0 && <Icon name="chevron-right" />}
            {i === items.length - 1 ? <span aria-current="page" className="cs-truncate">{it.label}</span> : <a href={it.href || '#'}>{it.label}</a>}
          </li>
        ))}
      </ol>
    </nav>
  );
}

/** ThemeToggle — switches html[data-theme] between dark and light. */
export function ThemeToggle() {
  const get = () => (typeof document !== 'undefined' && document.documentElement.getAttribute('data-theme')) || 'dark';
  const [theme, setTheme] = useState(get);
  useEffect(() => { setTheme(get()); }, []);
  const next = theme === 'dark' ? 'light' : 'dark';
  return <IconButton className="cs-theme-toggle" icon={theme === 'dark' ? 'sun' : 'moon'} label={theme === 'dark' ? 'Usar tema claro' : 'Usar tema escuro'}
    onClick={() => { document.documentElement.setAttribute('data-theme', next); setTheme(next); try { localStorage.setItem('cs-theme', next); } catch (e) {} }} />;
}

/** AccountMenu — avatar button → Meu perfil, Tema, Sair. On mobile the theme switch lives here. */
export function AccountMenu({ user = CURRENT_USER, defaultOpen, autoFocus }) {
  const flip = () => { const n = document.documentElement.getAttribute('data-theme') === 'light' ? 'dark' : 'light'; document.documentElement.setAttribute('data-theme', n); };
  return (
    <ActionMenu label="Menu da conta" title="Sua conta" defaultOpen={defaultOpen} autoFocus={autoFocus}
      header={<><Avatar name={user.name} size="lg" /><div style={{ minWidth: 0 }}><div className="cs-account__name">{titleCase(user.name)}</div><div className="cs-account__role cs-truncate">{user.email}</div></div></>}
      items={[{ label: 'Meu perfil', icon: 'user' }, { label: 'Alternar tema', icon: 'moon', onSelect: flip }, { label: 'Central de ajuda', icon: 'circle-help' }, { separator: true }, { label: 'Sair', icon: 'log-out', variant: 'danger' }]}
      trigger={(p) => (
        <button type="button" className="cs-account" aria-label={`Conta de ${titleCase(user.name)}`} {...p}>
          <Avatar name={user.name} />
          <span className="cs-account__text"><span className="cs-account__name">{titleCase(user.name)}</span><span className="cs-account__role">{user.role}</span></span>
          <Icon name="chevron-down" className="cs-account__chev" />
        </button>
      )} />
  );
}

/** Topbar — breadcrumb, global search, theme, account (desktop). Mobile: brand on top-level pages; back + title on detail pages (`back`). */
export function Topbar({ crumbs = [], title, back, user }) {
  return (
    <header className="cs-topbar">
      <div className="cs-topbar__start">
        <div className="cs-topbar__mobile">
          {back ? <IconButton icon="arrow-left" label={back.label || 'Voltar'} onClick={back.onClick} /> : <span className="cs-brand__mark" aria-hidden="true"><Icon name="activity" /></span>}
          {back ? <span className="cs-topbar__title cs-truncate">{title || (crumbs.length ? crumbs[crumbs.length - 1].label : '')}</span>
            : <span className="cs-brand__name">Con<em>Saúde</em></span>}
        </div>
        <Breadcrumb items={crumbs} />
      </div>
      <div className="cs-topbar__end">
        <div className="cs-topbar__search"><SearchField placeholder="Buscar auditoria ou médico" size="sm" pill shortcut="/" /></div>
        <ThemeToggle />
        <span className="cs-topbar__divider" aria-hidden="true" />
        <AccountMenu user={user} />
      </div>
    </header>
  );
}

/**
 * PageHeader — title, subtitle/meta and actions. On mobile it keeps `primary` visible and folds `secondary` into a "⋯" sheet.
 * primary: element (usually a Button). secondary: [{ label, icon, onSelect, variant }] (also rendered as buttons on desktop).
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
          {!compact && secondary.map((a, i) => <Button key={i} variant={a.variant === 'ia' ? 'ia' : a.variant === 'export' ? 'export' : 'secondary'} icon={a.icon} onClick={a.onSelect}>{a.label}</Button>)}
          {primary}
          {compact && secondary.length > 0 && <ActionMenu items={secondary} label="Mais ações da página" title="Ações" trigger={(p) => <IconButton icon="ellipsis" label="Mais ações" variant="secondary" round {...p} />} />}
        </div>
      )}
    </div>
  );
}

/** ActionBar — sticky footer bar for forms/flows (Salvar, Processar). Stacks full-width above the bottom nav on mobile. */
export function ActionBar({ message, icon = 'info', children }) {
  return (
    <div className="cs-actionbar">
      <span className="cs-actionbar__msg">{icon && <Icon name={icon} />}{message}</span>
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

/* ───────── Preview helpers ───────── */
/** Device — phone frame for previews: 390×844, status bar, scroll container; overlays render inside the screen. `scrollTo` sets the initial scroll. */
export function Device({ children, caption, scrollTo = 0, theme }) {
  const screen = useRef(null);
  const scroller = useRef(null);
  const [host, setHost] = useState(null);
  useEffect(() => { setHost(screen.current); }, []);
  useEffect(() => { if (host && scroller.current) { const t = setTimeout(() => { scroller.current.scrollTop = scrollTo; }, 60); return () => clearTimeout(t); } }, [host, scrollTo]);
  return (
    <div className="cs-device-col" data-theme={theme}>
      <div className="cs-device">
        <div className="cs-device__screen" ref={screen}>
          <span className="cs-device__notch" aria-hidden="true" />
          <div className="cs-device__scroll" ref={scroller}>
            <div className="cs-device__status" aria-hidden="true"><span>9:41</span><span style={{ display: 'inline-flex', gap: 6, alignItems: 'center' }}><Icon name="chart-column" size={15} /><Icon name="activity" size={15} /></span></div>
            {host && <PortalProvider value={host}>{children}</PortalProvider>}
          </div>
        </div>
      </div>
      {caption && <div className="cs-device__caption">{caption}</div>}
    </div>
  );
}
/** BrowserFrame — fixed-size desktop window for previews with overlays (drawer/modal) contained inside. */
export function BrowserFrame({ width = 1440, height = 900, children, scrollTo = 0 }) {
  const box = useRef(null);
  const scroller = useRef(null);
  const [host, setHost] = useState(null);
  useEffect(() => { setHost(box.current); }, []);
  useEffect(() => { if (host && scroller.current) scroller.current.scrollTop = scrollTo; }, [host, scrollTo]);
  return (
    <div className="cs-browser" ref={box} style={{ width, height }}>
      <div ref={scroller} style={{ position: 'absolute', inset: 0, overflow: 'auto', '--cs-vh': height + 'px' }}>
        {host && <PortalProvider value={host}>{children}</PortalProvider>}
      </div>
    </div>
  );
}
