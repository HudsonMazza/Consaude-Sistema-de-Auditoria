// ConSaúde — inputs & selection: Tabs, FilterChips, SegmentedControl, TextField, SearchField, Select, MaskedField, CurrencyField, Checkbox, Switch.
// Plus content blocks: Accordion, Callout, EmptyState, Dropzone, UploadProgress.
import { cx, Icon, Button, IconButton, Count, formatNumber } from './core.jsx';
const React = window.React;
const { useState, useId, useRef } = React;

/* ───────── Tabs ───────── */
/** Tabs — underline tabs. tabs: [{ id, label, icon, count, disabled }]. Controlled (value/onChange) or uncontrolled (defaultValue). Arrow keys move. */
export function Tabs({ tabs = [], value, defaultValue, onChange, fill = false, label = 'Seções', className }) {
  const [inner, setInner] = useState(defaultValue || (tabs[0] && tabs[0].id));
  const cur = value !== undefined ? value : inner;
  const set = (id) => { setInner(id); onChange && onChange(id); };
  const refs = useRef({});
  function onKey(e, i) {
    const dir = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0;
    if (!dir) return;
    e.preventDefault();
    let j = i;
    do { j = (j + dir + tabs.length) % tabs.length; } while (tabs[j].disabled && j !== i);
    set(tabs[j].id); refs.current[tabs[j].id] && refs.current[tabs[j].id].focus();
  }
  return (
    <div className={cx('cs-tabs', fill && 'cs-tabs--fill', className)} role="tablist" aria-label={label}>
      {tabs.map((t, i) => (
        <button key={t.id} ref={(el) => (refs.current[t.id] = el)} role="tab" type="button" className="cs-tab" aria-selected={cur === t.id}
          tabIndex={cur === t.id ? 0 : -1} disabled={t.disabled} onClick={() => set(t.id)} onKeyDown={(e) => onKey(e, i)}>
          {t.icon && <Icon name={t.icon} />}{t.label}{t.count != null && <Count>{t.count}</Count>}
        </button>
      ))}
    </div>
  );
}

/* ───────── FilterChips ───────── */
/**
 * FilterChips — quick filters. options: [{ id, label, icon, count }]. Single-select by default (radiogroup); `multiple` toggles (aria-pressed).
 * `scroll` keeps one line with horizontal scroll (mobile).
 */
export function FilterChips({ options = [], value, defaultValue, onChange, multiple = false, scroll = false, label = 'Filtros', bleed }) {
  const [inner, setInner] = useState(defaultValue !== undefined ? defaultValue : multiple ? [] : options[0] && options[0].id);
  const cur = value !== undefined ? value : inner;
  const isOn = (id) => (multiple ? cur.includes(id) : cur === id);
  const toggle = (id) => {
    const next = multiple ? (cur.includes(id) ? cur.filter((x) => x !== id) : [...cur, id]) : id;
    setInner(next); onChange && onChange(next);
  };
  return (
    <div className={cx('cs-chips', scroll && 'cs-chips--scroll')} role={multiple ? 'group' : 'radiogroup'} aria-label={label} style={bleed ? { '--_bleed': bleed } : undefined}>
      {options.map((o) => (
        <button key={o.id} type="button" className="cs-chip" role={multiple ? undefined : 'radio'}
          aria-checked={multiple ? undefined : isOn(o.id)} aria-pressed={multiple ? isOn(o.id) : undefined} onClick={() => toggle(o.id)} disabled={o.disabled}>
          {o.icon && <Icon name={o.icon} />}{o.label}{o.count != null && <span className="cs-chip__count">{formatNumber(o.count)}</span>}
        </button>
      ))}
    </div>
  );
}
/** A chip that opens a menu/sheet (e.g. "6 meses ▾" on mobile). */
export function SelectChip({ label, value, icon, ...rest }) {
  return (
    <button type="button" className="cs-chip cs-chip--select" {...rest}>
      {icon && <Icon name={icon} />}<span>{label ? <span className="cs-faint">{label}: </span> : null}{value}</span><Icon name="chevron-down" />
    </button>
  );
}

/* ───────── SegmentedControl ───────── */
/** SegmentedControl — 2–4 mutually exclusive options that switch a view (Período 3/6/12 meses, formato de exportação). */
export function SegmentedControl({ options = [], value, defaultValue, onChange, label, block = false }) {
  const [inner, setInner] = useState(defaultValue || (options[0] && options[0].id));
  const cur = value !== undefined ? value : inner;
  return (
    <div className={cx('cs-seg', block && 'cs-seg--block')} role="radiogroup" aria-label={label}>
      {options.map((o) => (
        <button key={o.id} type="button" role="radio" aria-checked={cur === o.id} className="cs-seg__opt" onClick={() => { setInner(o.id); onChange && onChange(o.id); }}>
          {o.icon && <Icon name={o.icon} size={16} />}{o.label}
        </button>
      ))}
    </div>
  );
}

/* ───────── Field wrapper + inputs ───────── */
/** Field — label, control, helper/error. Wraps any control; wires aria-describedby and aria-invalid. */
export function Field({ label, optional, help, error, children, id: idProp, className }) {
  const auto = useId();
  const id = idProp || auto;
  const helpId = id + '-help';
  const child = React.Children.only(children);
  const control = React.cloneElement(child, { id, 'aria-describedby': help || error ? helpId : undefined, 'aria-invalid': error ? true : undefined });
  return (
    <div className={cx('cs-field', error && 'cs-field--error', className)}>
      {label && <label className="cs-field__label" htmlFor={id}>{label}{optional && <span className="cs-field__opt">(opcional)</span>}</label>}
      {control}
      {(error || help) && <span className="cs-field__help" id={helpId}>{error && <Icon name="circle-alert" />}{error || help}</span>}
    </div>
  );
}

/** Raw input inside the bordered control. prefix/suffix accept text or a Lucide name via prefixIcon/suffixIcon. */
export const Input = React.forwardRef(function Input({ prefix, prefixIcon, suffix, suffixIcon, size, pill, numeric, disabled, className, end, ...rest }, ref) {
  return (
    <div className={cx('cs-control', size === 'sm' && 'cs-control--sm', pill && 'cs-control--pill', disabled && 'cs-control--disabled', className)}>
      {(prefix || prefixIcon) && <span className="cs-control__affix">{prefixIcon ? <Icon name={prefixIcon} /> : prefix}</span>}
      <input ref={ref} className={cx('cs-control__input', numeric && 'cs-control__input--num')} disabled={disabled} {...rest} />
      {(suffix || suffixIcon) && <span className="cs-control__affix cs-control__affix--end">{suffixIcon ? <Icon name={suffixIcon} /> : suffix}</span>}
      {end}
    </div>
  );
});

/** TextField — Field + Input. */
export function TextField({ label, optional, help, error, id, className, ...inputProps }) {
  return <Field label={label} optional={optional} help={help} error={error} id={id} className={className}><Input {...inputProps} /></Field>;
}

/** SearchField — search icon, clear button, optional shortcut hint. Uncontrolled unless `value` is passed. */
export function SearchField({ placeholder = 'Buscar', value, defaultValue = '', onChange, label, size, pill, shortcut, className }) {
  const [inner, setInner] = useState(defaultValue);
  const cur = value !== undefined ? value : inner;
  const set = (v) => { setInner(v); onChange && onChange(v); };
  const ref = useRef(null);
  return (
    <Input ref={ref} type="search" role="searchbox" aria-label={label || placeholder} placeholder={placeholder} prefixIcon="search" size={size} pill={pill} className={className}
      value={cur} onChange={(e) => set(e.target.value)} onKeyDown={(e) => e.key === 'Escape' && set('')}
      end={cur ? <IconButton icon="x" label="Limpar busca" size="sm" className="cs-control__clear" onClick={() => { set(''); ref.current && ref.current.focus(); }} />
        : shortcut ? <span className="cs-control__affix cs-control__affix--end"><kbd className="cs-kbd">{shortcut}</kbd></span> : null} />
  );
}

/** Select — native select (accessible, mobile-native picker) in the field style. options: [{ value, label }]. */
export const Select = React.forwardRef(function Select({ options = [], size, pill, prefixIcon, className, disabled, ...rest }, ref) {
  return (
    <div className={cx('cs-control', size === 'sm' && 'cs-control--sm', pill && 'cs-control--pill', disabled && 'cs-control--disabled', className)}>
      {prefixIcon && <span className="cs-control__affix"><Icon name={prefixIcon} /></span>}
      <select ref={ref} className="cs-control__input" disabled={disabled} {...rest}>
        {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
      <Icon name="chevron-down" className="cs-control__chevron" />
    </div>
  );
});
export function SelectField({ label, optional, help, error, id, className, ...selectProps }) {
  return <Field label={label} optional={optional} help={help} error={error} id={id} className={className}><Select {...selectProps} /></Field>;
}

/* Masks */
export const MASKS = {
  cnpj: (v) => { const d = v.replace(/\D/g, '').slice(0, 14); return d.replace(/^(\d{2})(\d)/, '$1.$2').replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3').replace(/\.(\d{3})(\d)/, '.$1/$2').replace(/(\d{4})(\d)/, '$1-$2'); },
  cpf: (v) => { const d = v.replace(/\D/g, '').slice(0, 11); return d.replace(/(\d{3})(\d)/, '$1.$2').replace(/(\d{3})(\d)/, '$1.$2').replace(/(\d{3})(\d{1,2})$/, '$1-$2'); },
  phone: (v) => { const d = v.replace(/\D/g, '').slice(0, 11); return d.length <= 10 ? d.replace(/(\d{2})(\d)/, '($1) $2').replace(/(\d{4})(\d)/, '$1-$2') : d.replace(/(\d{2})(\d)/, '($1) $2').replace(/(\d{5})(\d)/, '$1-$2'); },
};
/** MaskedField — formats as you type (cnpj | cpf | phone), inputMode numeric. */
export function MaskedField({ mask = 'cnpj', value, defaultValue = '', onChange, ...rest }) {
  const [inner, setInner] = useState(MASKS[mask](defaultValue));
  const cur = value !== undefined ? MASKS[mask](value) : inner;
  return <TextField inputMode="numeric" autoComplete="off" value={cur} onChange={(e) => { const m = MASKS[mask](e.target.value); setInner(m); onChange && onChange(m); }} {...rest} />;
}
/** CurrencyField — "R$" prefix, pt-BR cents mask (digits fill from the right), right-aligned tabular numbers. value in reais (number). */
export function CurrencyField({ value, defaultValue = 0, onChange, ...rest }) {
  const [inner, setInner] = useState(defaultValue);
  const cur = value !== undefined ? value : inner;
  const text = new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(cur || 0);
  return <TextField prefix="R$" numeric inputMode="numeric" value={text} onChange={(e) => { const n = Number(e.target.value.replace(/\D/g, '') || 0) / 100; setInner(n); onChange && onChange(n); }} {...rest} />;
}

/** Checkbox with label and optional description. */
export function Checkbox({ label, description, ...rest }) {
  return (
    <label className="cs-check"><input type="checkbox" {...rest} /><span>{label}{description && <span className="cs-check__sub">{description}</span>}</span></label>
  );
}
/** Switch — immediate on/off setting. Always with a visible label. */
export function Switch({ label, description, ...rest }) {
  return (
    <label className="cs-check" style={{ alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
      <span>{label}{description && <span className="cs-check__sub">{description}</span>}</span>
      <input type="checkbox" role="switch" className="cs-switch" {...rest} />
    </label>
  );
}

/* ───────── Accordion ───────── */
/** Accordion — items: [{ id, title, subtitle, icon, content }]. `defaultOpen`: array of ids. `multiple` lets several stay open. */
export function Accordion({ items = [], defaultOpen = [], multiple = true, className }) {
  const [open, setOpen] = useState(defaultOpen);
  const base = useId();
  const toggle = (id) => setOpen((o) => (o.includes(id) ? o.filter((x) => x !== id) : multiple ? [...o, id] : [id]));
  return (
    <div className={cx('cs-acc', className)}>
      {items.map((it) => {
        const isOpen = open.includes(it.id);
        return (
          <div key={it.id} className="cs-acc__item">
            <h3 className="cs-acc__head">
              <button type="button" className="cs-acc__btn" aria-expanded={isOpen} aria-controls={base + it.id} id={base + it.id + 'b'} onClick={() => toggle(it.id)}>
                {it.icon && <Icon name={it.icon} className="cs-acc__lead" />}
                <span className="cs-acc__titles">{it.title}{it.subtitle && <span className="cs-acc__sub">{it.subtitle}</span>}</span>
                <Icon name="chevron-down" className="cs-acc__chev" />
              </button>
            </h3>
            <div className="cs-acc__panel" id={base + it.id} role="region" aria-labelledby={base + it.id + 'b'} hidden={!isOpen}>{it.content}</div>
          </div>
        );
      })}
    </div>
  );
}

/* ───────── Callout ───────── */
const CALLOUT_ICON = { info: 'info', success: 'circle-check', warning: 'triangle-alert', danger: 'circle-alert', ia: 'sparkles', neutral: 'info' };
/** Callout — inline contextual message. tone: info | success | warning | danger | ia | neutral. */
export function Callout({ tone = 'info', title, children, icon, action, className }) {
  return (
    <div className={cx('cs-callout', tone !== 'info' && `cs-callout--${tone}`, className)} role={tone === 'danger' ? 'alert' : undefined}>
      <Icon name={icon || CALLOUT_ICON[tone]} className="cs-callout__icon" />
      <div className="cs-callout__body">
        {title && <span className="cs-callout__title">{title}</span>}
        {children && <span className="cs-callout__text">{children}</span>}
      </div>
      {action && <div className="cs-callout__action">{action}</div>}
    </div>
  );
}

/* ───────── Empty / error states ───────── */
/** EmptyState — nothing to show yet, or no results. Give the reason and the next step. `tone="error"` for failures (use ErrorState). */
export function EmptyState({ icon = 'inbox', title, children, actions, tone, compact = false }) {
  return (
    <div className={cx('cs-empty', tone === 'error' && 'cs-empty--error', compact && 'cs-empty--compact')} role={tone === 'error' ? 'alert' : undefined}>
      <span className="cs-empty__glyph"><Icon name={icon} /></span>
      <h3 className="cs-empty__title">{title}</h3>
      {children && <p className="cs-empty__text">{children}</p>}
      {actions && <div className="cs-empty__actions">{actions}</div>}
    </div>
  );
}
/** ErrorState — failure to load/process with a retry. */
export function ErrorState({ title = 'Não foi possível carregar', children = 'Verifique sua conexão e tente novamente. Se persistir, fale com o suporte.', onRetry, icon = 'server-crash', compact }) {
  return <EmptyState tone="error" icon={icon} title={title} compact={compact} actions={onRetry && <Button variant="secondary" icon="refresh-cw" onClick={onRetry}>Tentar novamente</Button>}>{children}</EmptyState>;
}

/* ───────── Upload ───────── */
const fmtSize = (b) => (b >= 1048576 ? (b / 1048576).toFixed(1).replace('.', ',') + ' MB' : Math.round(b / 1024) + ' KB');
/**
 * Dropzone — one upload step. state: empty | dragover | loaded | error | uploading (uncontrolled drag-over if omitted).
 * file: { name, size, rows, columns: ['Médico', …] }. error: message. onFile(file), onRemove(). accept defaults to .xlsx,.xls,.csv.
 */
export function Dropzone({ step, title, subtitle, state: stateProp, file, error, onFile, onRemove, accept = '.xlsx,.xls,.csv', hint = '.xlsx, .xls ou .csv · até 20 MB' }) {
  const [drag, setDrag] = useState(false);
  const inputId = useId();
  const state = stateProp || (file ? 'loaded' : error ? 'error' : drag ? 'dragover' : 'empty');
  const pick = (f) => { setDrag(false); f && onFile && onFile(f); };
  return (
    <section className={cx('cs-drop', `cs-drop--${state}`)} aria-label={title}>
      <header className="cs-drop__head">
        <span className="cs-drop__step" aria-hidden="true">{state === 'loaded' ? <Icon name="check" size={16} strokeWidth={2.4} /> : step}</span>
        <div style={{ minWidth: 0, flex: 1 }}>
          <h3 className="cs-drop__title">{step ? <span className="cs-sr">Passo {step}: </span> : null}{title}</h3>
          {subtitle && <p className="cs-drop__sub">{subtitle}</p>}
        </div>
        {state === 'loaded' && <span className="cs-badge cs-badge--success cs-badge--sm"><Icon name="circle-check" />Carregado</span>}
      </header>
      {state === 'loaded' && file ? (
        <div className="cs-file">
          <span className="cs-file__icon"><Icon name="file-spreadsheet" /></span>
          <div className="cs-file__body">
            <span className="cs-file__name cs-truncate" title={file.name}>{file.name}</span>
            <span className="cs-file__meta"><span>{file.size ? fmtSize(file.size) : ''}</span>{file.rows != null && <span className="ok"><Icon name="check" />{formatNumber(file.rows)} linhas lidas</span>}</span>
          </div>
          <IconButton icon="refresh-cw" label="Trocar arquivo" size="sm" />
          <IconButton icon="trash-2" label="Remover arquivo" size="sm" onClick={onRemove} />
        </div>
      ) : null}
      {state === 'loaded' && file && file.columns ? (
        <div className="cs-drop__cols">
          <span className="cs-drop__cols-label">Colunas reconhecidas</span>
          <div className="cs-chips">{file.columns.map((c) => <span key={c} className="cs-badge cs-badge--outline"><Icon name="check" />{c}</span>)}</div>
        </div>
      ) : null}
      {state === 'loaded' && file ? null : (
        <label className="cs-drop__zone" htmlFor={inputId}
          onDragOver={(e) => { e.preventDefault(); setDrag(true); }} onDragLeave={() => setDrag(false)}
          onDrop={(e) => { e.preventDefault(); pick(e.dataTransfer.files[0]); }}>
          <input id={inputId} type="file" accept={accept} onChange={(e) => pick(e.target.files[0])} aria-describedby={inputId + 'h'} aria-invalid={state === 'error' || undefined} />
          <span className="cs-drop__glyph"><Icon name={state === 'error' ? 'file-x' : state === 'uploading' ? 'loader-circle' : 'cloud-upload'} className={state === 'uploading' ? 'cs-spin' : undefined} /></span>
          {state === 'dragover' ? <span className="cs-drop__cta">Solte para carregar</span>
            : state === 'uploading' ? <span className="cs-drop__cta">Lendo planilha…</span>
            : <span className="cs-drop__cta"><span className="cs-drop__dragtext">Arraste o arquivo aqui ou <u>selecione no dispositivo</u></span><span className="cs-drop__tap"><u>Toque para selecionar o arquivo</u></span></span>}
          <span className="cs-drop__hint" id={inputId + 'h'} style={state === 'error' ? { color: 'var(--danger)' } : undefined}>{state === 'error' ? error : hint}</span>
        </label>
      )}
    </section>
  );
}
/** UploadProgress — "1 de 2 arquivos" with a two-segment meter. */
export function UploadProgress({ done = 0, total = 2 }) {
  return (
    <div className="cs-upload-steps" role="status">
      <div className="cs-meter__bars" style={{ '--_n': total, '--_h': '8px', '--_gap': '4px', width: 24 * total }} aria-hidden="true">
        {Array.from({ length: total }, (_, i) => <span key={i} className={cx('cs-meter__seg', i < done && 'cs-meter__seg--success')} />)}
      </div>
      <span><b style={{ color: 'var(--ink)' }}>{done} de {total}</b> arquivos carregados</span>
    </div>
  );
}
