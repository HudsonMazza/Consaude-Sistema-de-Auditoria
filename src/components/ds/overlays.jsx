// ConSaúde — overlays: Modal, ConfirmDialog, AiProgressModal, Drawer, BottomSheet, ActionMenu, Toast.
// Portado de consaude-design-system/components/src/overlays.jsx. Ajuste do app: AiProgressModal aceita progresso
// indeterminado (progress == null) e esconde "Cancelar" quando não há como cancelar.
import React, { useEffect, useRef, useState, useId, useCallback } from 'react';
import { cx, Icon, Button, IconButton, Portal, useViewport, Spinner, usePortalTarget } from './core.jsx';

const FOCUSABLE = 'a[href],button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])';

/** Focus management shared by every overlay: focus inside on open, Esc closes, Tab is trapped, focus returns on close. */
function useDialogFocus(open, onClose, ref, autoFocus = true) {
  // Sempre a versão atual de onClose: o efeito abaixo só roda ao abrir, e sem o ref o Esc chamaria
  // o onClose da abertura (ex.: fechava o modal mesmo com "salvando…" ativo, escondendo o erro).
  const closeRef = useRef(onClose);
  closeRef.current = onClose;
  useEffect(() => {
    if (!open) return;
    const prev = document.activeElement;
    const node = ref.current;
    const first = node && (node.querySelector('[data-autofocus]') || node.querySelector(FOCUSABLE));
    if (first && autoFocus) first.focus({ preventScroll: true });
    function onKey(e) {
      if (e.key === 'Escape' && closeRef.current) { e.stopPropagation(); closeRef.current(); }
      if (e.key === 'Tab' && node) {
        const items = Array.from(node.querySelectorAll(FOCUSABLE));
        if (!items.length) return;
        const a = items[0], z = items[items.length - 1];
        if (e.shiftKey && document.activeElement === a) { e.preventDefault(); z.focus(); }
        else if (!e.shiftKey && document.activeElement === z) { e.preventDefault(); a.focus(); }
      }
    }
    document.addEventListener('keydown', onKey);
    return () => { document.removeEventListener('keydown', onKey); if (prev && prev.focus) prev.focus({ preventScroll: true }); };
  }, [open]);
}

/**
 * Modal — centered dialog on desktop, bottom sheet on mobile.
 * Props: open, onClose, title, description, icon (Lucide), tone ('default'|'danger'|'ia'), footer (buttons), size ('md'|'wide'), dismissible.
 */
export function Modal({ open = true, onClose, title, description, icon, tone = 'default', footer, size = 'md', dismissible = true, children, autoFocus = true }) {
  const { compact } = useViewport();
  const ref = useRef(null);
  const id = useId();
  useDialogFocus(open, dismissible ? onClose : null, ref, autoFocus);
  if (!open) return null;
  return (
    <Portal>
      <div className="cs-overlay" data-compact={compact || undefined}>
        <div className="cs-scrim" onClick={dismissible ? onClose : undefined} />
        <div ref={ref} className={cx('cs-modal', size === 'wide' && 'cs-modal--wide')} role="dialog" aria-modal="true" aria-labelledby={id + 't'} aria-describedby={description ? id + 'd' : undefined}>
          <div className="cs-modal__head">
            {icon && <span className={cx('cs-modal__icon', tone !== 'default' && `cs-modal__icon--${tone}`)}><Icon name={icon} /></span>}
            <div className="cs-modal__titles">
              <h2 className="cs-modal__title" id={id + 't'}>{title}</h2>
              {description && <p className="cs-modal__desc" id={id + 'd'}>{description}</p>}
            </div>
            {dismissible && onClose && <IconButton icon="x" label="Fechar" size="sm" onClick={onClose} />}
          </div>
          {children && <div className="cs-modal__body">{children}</div>}
          {footer && <div className="cs-modal__foot">{footer}</div>}
        </div>
      </div>
    </Portal>
  );
}

/** ConfirmDialog — destructive confirmation. Names the object, states consequences, destructive button last. */
export function ConfirmDialog({ open = true, onClose, onConfirm, title = 'Excluir auditoria?', description, confirmLabel = 'Excluir', loading, children, autoFocus }) {
  return (
    <Modal open={open} onClose={onClose} icon="trash-2" tone="danger" title={title} description={description} autoFocus={autoFocus}
      footer={<><Button variant="secondary" onClick={onClose} data-autofocus>Cancelar</Button><Button variant="danger" icon="trash-2" loading={loading} onClick={onConfirm}>{confirmLabel}</Button></>}>
      {children}
    </Modal>
  );
}

/**
 * AiProgressModal — "Gerando relatório com IA". Steps: [{label, state: 'done'|'active'|'pending', end?}]. Not dismissible by scrim;
 * offers "Continuar em segundo plano". Announces the active step via aria-live.
 */
export function AiProgressModal({ open = true, steps = [], progress, onBackground, onCancel, title = 'Gerando relatório com IA', description = 'Isso leva cerca de 30 segundos. Você pode continuar usando o ConSaúde.', autoFocus }) {
  const active = steps.find((s) => s.state === 'active');
  return (
    <Modal open={open} dismissible={false} title={title} description={description} autoFocus={autoFocus}
      footer={<>{onCancel && <Button variant="ghost" onClick={onCancel}>Cancelar</Button>}{onBackground && <Button variant="secondary" onClick={onBackground} data-autofocus>Continuar em segundo plano</Button>}</>}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        <span className="cs-orb" aria-hidden="true" />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div className={cx('cs-progress', progress == null && 'cs-progress--indeterminate')}>
            <div className="cs-progress__head"><span>Progresso</span><span className="cs-progress__value">{progress != null ? Math.round(progress) + '%' : 'Em andamento'}</span></div>
            <div className="cs-progress__track" role="progressbar" aria-label="Progresso da geração" aria-valuemin={0} aria-valuemax={100} aria-valuenow={progress != null ? Math.round(progress) : undefined} aria-valuetext={progress == null ? 'Em andamento' : undefined}>
              <span className="cs-progress__fill" style={{ width: (progress || 0) + '%', background: 'var(--ia)' }} />
            </div>
          </div>
        </div>
      </div>
      <ol className="cs-steps">
        {steps.map((s, i) => (
          <li key={i} className={cx('cs-step', `cs-step--${s.state}`)} aria-current={s.state === 'active' ? 'step' : undefined}>
            <span className="cs-step__mark">{s.state === 'done' ? <Icon name="check" strokeWidth={2.4} /> : s.state === 'active' ? <Spinner /> : null}</span>
            <span className={s.state === 'active' ? 'cs-shimmer cs-shimmer--ia' : undefined}>{s.label}</span>
            {s.end && <span className="cs-step__end">{s.end}</span>}
          </li>
        ))}
      </ol>
      <p className="cs-sr" aria-live="polite">{active ? active.label : ''}</p>
    </Modal>
  );
}

/**
 * Drawer — side panel on desktop (520px), full-screen sheet on mobile.
 * Props: open, onClose, eyebrow, title, subtitle, headerExtra, footer, children.
 */
export function Drawer({ open = true, onClose, eyebrow, title, subtitle, headerExtra, footer, children, label, autoFocus = true }) {
  const { compact } = useViewport();
  const ref = useRef(null);
  const id = useId();
  useDialogFocus(open, onClose, ref, autoFocus);
  if (!open) return null;
  return (
    <Portal>
      <div className="cs-overlay" data-compact={compact || undefined}>
        <div className="cs-scrim" onClick={onClose} />
        <aside ref={ref} className="cs-drawer" role="dialog" aria-modal="true" aria-labelledby={id} aria-label={label}>
          <header className="cs-drawer__head">
            {compact && <IconButton icon="arrow-left" label="Voltar" onClick={onClose} />}
            <div className="cs-drawer__titles">
              {eyebrow && !compact && <span className="cs-drawer__eyebrow">{eyebrow}</span>}
              <h2 className="cs-drawer__title" id={id}>{title}</h2>
              {subtitle && <span className="cs-drawer__sub">{subtitle}</span>}
            </div>
            {headerExtra}
            {!compact && <IconButton icon="x" label="Fechar painel" onClick={onClose} />}
          </header>
          <div className="cs-drawer__body">{children}</div>
          {footer && <footer className="cs-drawer__foot">{footer}</footer>}
        </aside>
      </div>
    </Portal>
  );
}

/** BottomSheet — mobile sheet with handle. Use for filters, action lists and short forms on small screens. */
export function BottomSheet({ open = true, onClose, title, footer, children, autoFocus = true }) {
  const ref = useRef(null);
  const id = useId();
  useDialogFocus(open, onClose, ref, autoFocus);
  if (!open) return null;
  return (
    <Portal>
      <div className="cs-overlay" data-compact="true">
        <div className="cs-scrim" onClick={onClose} />
        <div ref={ref} className="cs-sheet" role="dialog" aria-modal="true" aria-labelledby={id}>
          <span className="cs-sheet__handle" aria-hidden="true" />
          <div className="cs-sheet__head">
            <h2 className="cs-sheet__title" id={id}>{title}</h2>
            <IconButton icon="x" label="Fechar" onClick={onClose} />
          </div>
          <div className="cs-sheet__body">{children}</div>
          {footer && <div className="cs-sheet__foot">{footer}</div>}
        </div>
      </div>
    </Portal>
  );
}

/**
 * ActionMenu — row/page actions. Dropdown on desktop, action sheet on mobile (same items).
 * items: [{ label, icon, onSelect, variant: 'danger'|'ia'|'export', disabled, hint } | { separator: true } | { heading }].
 * trigger: (props) => element (defaults to a "⋯" IconButton). `label` names the trigger. `title` heads the sheet.
 */
export function ActionMenu({ items = [], label = 'Mais ações', title, trigger, align = 'right', defaultOpen = false, header, autoFocus = true }) {
  const { compact } = useViewport();
  const host = usePortalTarget();
  const [open, setOpen] = useState(defaultOpen);
  const [pos, setPos] = useState(null);
  const anchor = useRef(null);
  const menu = useRef(null);
  const id = useId();
  const close = useCallback(() => setOpen(false), []);
  useEffect(() => { if (!open) setPos(null); }, [open]);
  // Desktop: position a fixed popover from the trigger's rect (escapes overflow:auto tables), flip up near the bottom.
  React.useLayoutEffect(() => {
    if (!open || compact || !anchor.current) return;
    const r = anchor.current.getBoundingClientRect();
    const box = host ? host.getBoundingClientRect() : { top: 0, left: 0, width: window.innerWidth, height: window.innerHeight };
    const mh = menu.current ? menu.current.offsetHeight : 220;
    const below = r.bottom + 6 + mh <= box.top + box.height - 8;
    const p = { top: below ? r.bottom - box.top + 6 : r.top - box.top - mh - 6 };
    if (align === 'left') p.left = r.left - box.left; else p.right = box.left + box.width - r.right;
    setPos(p);
  }, [open, compact]);
  useEffect(() => {
    if (!open || compact) return;
    const onDown = (e) => { if (anchor.current && !anchor.current.contains(e.target) && menu.current && !menu.current.contains(e.target)) setOpen(false); };
    const onKey = (e) => { if (e.key === 'Escape') { setOpen(false); const b = anchor.current && anchor.current.querySelector('button'); b && b.focus(); } };
    const onScroll = () => setOpen(false);
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    window.addEventListener('resize', onScroll);
    return () => { document.removeEventListener('mousedown', onDown); document.removeEventListener('keydown', onKey); window.removeEventListener('resize', onScroll); };
  }, [open, compact]);
  // Foca o primeiro item só depois de posicionado (antes disso o menu está com visibility:hidden e não recebe foco).
  const placed = pos != null;
  useEffect(() => {
    if (!open || compact || !placed || !autoFocus) return;
    const first = menu.current && menu.current.querySelector('[role="menuitem"]:not([disabled])');
    if (first) first.focus({ preventScroll: true });
  }, [open, compact, placed]);
  function onMenuKey(e) {
    const list = Array.from(menu.current.querySelectorAll('[role="menuitem"]:not([disabled])'));
    const i = list.indexOf(document.activeElement);
    if (e.key === 'ArrowDown') { e.preventDefault(); list[(i + 1) % list.length].focus(); }
    if (e.key === 'ArrowUp') { e.preventDefault(); list[(i - 1 + list.length) % list.length].focus(); }
    if (e.key === 'Home') { e.preventDefault(); list[0].focus(); }
    if (e.key === 'End') { e.preventDefault(); list[list.length - 1].focus(); }
    if (e.key === 'Tab') setOpen(false);
  }
  const run = (it) => {
    setOpen(false);
    // Devolve o foco ao gatilho antes da ação (a ação pode abrir um diálogo, que devolverá o foco a ele).
    if (!compact) { const b = anchor.current && anchor.current.querySelector('button'); b && b.focus({ preventScroll: true }); }
    it.onSelect && it.onSelect();
  };
  const trigProps = { 'aria-haspopup': 'menu', 'aria-expanded': open, 'aria-controls': open ? id : undefined, onClick: () => setOpen((o) => !o) };
  return (
    <span className="cs-menu-anchor" ref={anchor}>
      {trigger ? trigger(trigProps) : <IconButton icon="ellipsis" label={label} size="sm" {...trigProps} />}
      {open && !compact && (
        <Portal>
          <div ref={menu} id={id} role="menu" aria-label={label} className="cs-menu" onKeyDown={onMenuKey}
            style={{ position: 'fixed', top: pos ? pos.top : -9999, left: pos && pos.left != null ? pos.left : 'auto', right: pos && pos.right != null ? pos.right : 'auto', visibility: pos ? 'visible' : 'hidden', fontFamily: 'var(--font-sans)' }}>
            {header && <div className="cs-menu__head">{header}</div>}
            {items.map((it, i) => it.separator ? <hr key={i} className="cs-menu__sep" /> : it.heading ? <div key={i} className="cs-menu__label">{it.heading}</div> : (
              <button key={i} role="menuitem" type="button" disabled={it.disabled} className={cx('cs-menu__item', it.variant && `cs-menu__item--${it.variant}`)} onClick={() => run(it)}>
                {it.icon && <Icon name={it.icon} />}{it.label}{it.hint && <span className="cs-menu__item-end">{it.hint}</span>}
              </button>
            ))}
          </div>
        </Portal>
      )}
      {open && compact && (
        <BottomSheet open title={title || label} onClose={close} autoFocus={autoFocus} footer={<Button variant="secondary" block onClick={close}>Cancelar</Button>}>
          {header}
          <div className="cs-sheet__list" role="menu" aria-label={label}>
            {items.filter((it) => !it.separator && !it.heading).map((it, i) => (
              <button key={i} role="menuitem" type="button" disabled={it.disabled} className={cx('cs-sheet__item', it.variant && `cs-sheet__item--${it.variant}`)} onClick={() => run(it)}>
                {it.icon && <Icon name={it.icon} />}{it.label}
              </button>
            ))}
          </div>
        </BottomSheet>
      )}
    </span>
  );
}

/* ───────── Toast ───────── */
const TOAST_ICON = { success: 'circle-check', error: 'circle-alert', warning: 'triangle-alert', info: 'info', ia: 'sparkles' };
/** Toast — transient feedback. tone: success | error | warning | info | ia. Optional action (e.g. Desfazer). Errors use role="alert". */
export function Toast({ tone = 'info', title, children, action, onClose }) {
  return (
    <div className={cx('cs-toast', `cs-toast--${tone}`)} role={tone === 'error' ? 'alert' : 'status'}>
      <Icon name={TOAST_ICON[tone]} className="cs-toast__icon" />
      <div className="cs-toast__body">
        {title && <span className="cs-toast__title">{title}</span>}
        {children && <span className="cs-toast__text">{children}</span>}
      </div>
      <div className="cs-toast__actions">
        {action && <Button variant="link" size="sm" onClick={action.onClick}>{action.label}</Button>}
        {onClose && <IconButton icon="x" label="Dispensar" size="sm" onClick={onClose} />}
      </div>
    </div>
  );
}
/** ToastStack — positions toasts (bottom-right; above the bottom nav on mobile). `inline` renders in flow (previews). */
export function ToastStack({ children, inline = false }) {
  const { compact } = useViewport();
  const stack = <div className={cx('cs-toasts', inline && 'cs-toasts--inline')} data-compact={(!inline && compact) || undefined} aria-live="polite">{children}</div>;
  return inline ? stack : <Portal>{stack}</Portal>;
}
