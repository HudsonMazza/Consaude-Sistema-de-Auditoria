// ConSaúde — data display: Card, KPI family, ProgressBar, SegmentedMeter, BarChart, DonutChart, RankingList, DataTable, Pagination.
// Portado de consaude-design-system/components/src/data.jsx.
import React, { useState, useMemo, useId } from 'react';
import { cx, Icon, Button, IconButton, formatBRL, formatNumber, useElementWidth, useViewport, titleCase } from './core.jsx';
import { ActionMenu } from './overlays.jsx';
import { EmptyState } from './forms.jsx';

/* ───────── Card ───────── */
/** Card — the container for every block. title/subtitle/actions build the header; `flush` removes body padding (tables). */
export function Card({ title, subtitle, icon, actions, footer, flush = false, inset = false, glow = false, as: Tag = 'section', className, children, headingLevel = 2, ...rest }) {
  const H = 'h' + headingLevel;
  return (
    <Tag className={cx('cs-card', flush && 'cs-card--flush', inset && 'cs-card--inset', glow && 'cs-card--glow', className)} {...rest}>
      {(title || actions) && (
        <header className="cs-card__head">
          <div className="cs-card__titles">
            {title && <H className="cs-card__title">{icon && <Icon name={icon} size={18} />}{title}</H>}
            {subtitle && <p className="cs-card__subtitle">{subtitle}</p>}
          </div>
          {actions && <div className="cs-card__actions">{actions}</div>}
        </header>
      )}
      {children}
      {footer && <footer className="cs-card__foot">{footer}</footer>}
    </Tag>
  );
}

/* ───────── KPI ───────── */
/** Delta — signed change vs a named period. `good` tells whether this direction is good (colors success/danger); always shows an arrow. */
export function Delta({ value, direction = 'up', good, label }) {
  const tone = good == null ? 'neutral' : good ? 'good' : 'bad';
  return (
    <span className={cx('cs-delta', `cs-delta--${tone}`)} title={label}>
      <Icon name={direction === 'up' ? 'trending-up' : 'trending-down'} />{value}{label && <span className="cs-sr"> {label}</span>}
    </span>
  );
}
/** KpiCard — secondary KPI tile. variant 'tile' (inside a group card) | 'card' (standalone). tone colors only the icon. */
export function KpiCard({ label, value, icon, tone, delta, hint, variant = 'tile' }) {
  return (
    <div className={cx('cs-kpi', variant === 'card' && 'cs-kpi--card')}>
      {(icon || delta) && <div className="cs-kpi__top">{icon ? <span className={cx('cs-kpi__icon', tone && `cs-kpi__icon--${tone}`)}><Icon name={icon} /></span> : <span />}{delta && <Delta {...delta} />}</div>}
      <span className="cs-kpi__label" title={typeof label === 'string' ? label : undefined}>{label}</span>
      <span className="cs-kpi__value">{value}</span>
      {hint && <span className="cs-kpi__hint">{hint}</span>}
    </div>
  );
}
/** KpiGroup — 2–4 KpiCards side by side (a single card like the reference's "AI Enhancements"). */
export function KpiGroup({ children, columns }) {
  const n = columns || React.Children.count(children);
  return <div className="cs-kpigroup" style={{ '--_n': n }}>{children}</div>;
}
function Waves() {
  return (
    <svg className="cs-hero__waves" viewBox="0 0 400 200" preserveAspectRatio="none" aria-hidden="true">
      <path d="M180 0 C 250 40 300 20 400 60 L400 0 Z" />
      <path d="M0 200 C 90 150 170 175 240 140 C 300 110 350 130 400 110 L400 200 Z" />
    </svg>
  );
}
/** HeroKpi — the ONE number a screen leads with, on the blue card. actions: buttons (use variant 'light' and 'deep'). */
export function HeroKpi({ label, value, icon, meta, chip, actions, topAction }) {
  return (
    <section className="cs-hero" aria-label={label}>
      <Waves />
      <div className="cs-hero__top">
        <div>
          <span className="cs-hero__label">{icon && <Icon name={icon} size={16} />}{label}</span>
          <p className="cs-hero__value">{value}</p>
        </div>
        {topAction}
      </div>
      {(meta || chip) && <div className="cs-hero__meta">{chip}{meta}</div>}
      {actions && <div className="cs-hero__actions">{actions}</div>}
    </section>
  );
}
/** HeroChip — small navy chip inside the hero (delta, period). */
export const HeroChip = ({ icon, children }) => <span className="cs-hero__chip">{icon && <Icon name={icon} />}{children}</span>;

/** StatStrip — compact KPI row for secondary screens (lists, users). items: [{ label, value, sub, icon, tone }]. 2×2 on mobile. */
export function StatStrip({ items = [], compact }) {
  return (
    <div className={cx('cs-stats', compact && 'cs-stats--compact')} style={{ '--_n': items.length }} role="list">
      {items.map((it, i) => (
        <div className="cs-stat" key={i} role="listitem">
          {it.icon && <span className={cx('cs-kpi__icon', it.tone && `cs-kpi__icon--${it.tone}`)}><Icon name={it.icon} /></span>}
          <div className="cs-stat__body">
            <span className="cs-stat__label">{it.label}</span>
            <span className="cs-stat__value">{it.value}{it.sub && <small>{it.sub}</small>}</span>
          </div>
        </div>
      ))}
    </div>
  );
}

/* ───────── Progress ───────── */
/** ProgressBar — linear progress. tone: accent | success | warning | danger. `indeterminate` while unknown. */
export function ProgressBar({ value = 0, max = 100, label, valueLabel, tone = 'accent', size, indeterminate }) {
  const pct = Math.max(0, Math.min(100, (value / max) * 100));
  return (
    <div className={cx('cs-progress', tone !== 'accent' && `cs-progress--${tone}`, size === 'sm' && 'cs-progress--sm', indeterminate && 'cs-progress--indeterminate')}>
      {(label || valueLabel) && <div className="cs-progress__head"><span>{label}</span><span className="cs-progress__value">{valueLabel != null ? valueLabel : Math.round(pct) + '%'}</span></div>}
      <div className="cs-progress__track" role="progressbar" aria-label={label} aria-valuemin={0} aria-valuemax={max} aria-valuenow={indeterminate ? undefined : value} aria-valuetext={valueLabel}>
        <span className="cs-progress__fill" style={{ width: pct + '%' }} />
      </div>
    </div>
  );
}
/**
 * SegmentedMeter — the reference's "Finance Score": N rounded vertical segments.
 * value 0–100 fills `segments` proportionally; `secondary` (0–100, ≥ value) paints a second, softer band (e.g. revisados vs corrigidos).
 */
export function SegmentedMeter({ value = 0, secondary, segments = 24, title, valueLabel, legend, height, thin, label }) {
  const on = Math.round((value / 100) * segments);
  const on2 = secondary != null ? Math.round((secondary / 100) * segments) : on;
  return (
    <div className={cx('cs-meter', thin && 'cs-meter--thin')}>
      {(title || valueLabel) && <div className="cs-meter__head">{title && <h3 className="cs-meter__title">{title}</h3>}<span className="cs-meter__value">{valueLabel != null ? valueLabel : Math.round(value) + '%'}</span></div>}
      <div className="cs-meter__bars" style={{ '--_n': segments, '--_h': height ? height + 'px' : undefined }} role="meter" aria-label={label || title} aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(value)} aria-valuetext={valueLabel}>
        {Array.from({ length: segments }, (_, i) => <span key={i} className={cx('cs-meter__seg', i < on ? 'cs-meter__seg--on' : i < on2 && 'cs-meter__seg--on2')} />)}
      </div>
      {legend && <Legend items={legend} />}
    </div>
  );
}
/** Legend — [{ label, swatch: 'chart-1'|'chart-2'|'chart-3'|'track'|'hatch', value }]. */
export function Legend({ items = [] }) {
  const bg = { 'chart-1': 'var(--chart-1)', 'chart-2': 'var(--chart-2)', 'chart-3': 'var(--chart-3)', track: 'var(--chart-track)', success: 'var(--success)' };
  return (
    <ul className="cs-legend">
      {items.map((it, i) => (
        <li key={i} className="cs-legend__item">
          <span className={cx('cs-legend__swatch', it.swatch === 'hatch' && 'cs-legend__swatch--hatch')} style={it.swatch !== 'hatch' ? { background: bg[it.swatch] || it.swatch } : undefined} aria-hidden="true" />
          {it.label}{it.value != null && <span className="cs-legend__value">{it.value}</span>}
        </li>
      ))}
    </ul>
  );
}

/* ───────── BarChart ───────── */
function niceStep(v) { if (v <= 0) return 1; const p = Math.pow(10, Math.floor(Math.log10(v))); const n = v / p; return (n <= 1 ? 1 : n <= 2 ? 2 : n <= 5 ? 5 : 10) * p; }
function topRoundedRect(x, y, w, h, r) {
  r = Math.min(r, h, w / 2);
  return `M${x},${y + h}V${y + r}Q${x},${y} ${x + r},${y}H${x + w - r}Q${x + w},${y} ${x + w},${y + r}V${y + h}Z`;
}
/**
 * BarChart — stacked columns with hover/focus tooltip and a table view.
 * data: [{ label, values: [n1, n2], partial?: bool }]; series: [{ name, color: 'chart-1'|'chart-2'|'chart-3' }] (bottom → top).
 * `view`: 'chart' | 'table'. `formatValue` formats tooltip/table values. `partialLabel` names the hatched in-progress period.
 * `integer` (default true) keeps axis ticks on whole numbers (counts). Bars are at most 36px wide and never fill the band.
 */
export function BarChart({ data = [], series = [], height = 240, view = 'chart', formatValue = formatNumber, caption, partialLabel = 'Mês em andamento', totalLabel = 'Total', integer = true }) {
  const [ref, width] = useElementWidth();
  const [active, setActive] = useState(null);
  const id = useId();
  const totals = data.map((d) => d.values.reduce((a, b) => a + b, 0));
  const step = Math.max(niceStep((Math.max(...totals, 1) * 1.1) / 4), integer ? 1 : 0);
  const max = step * Math.ceil((Math.max(...totals, 1) * 1.1) / step);
  const padL = 32, padB = 26, padT = 8;
  const W = Math.max(width, 200), H = height;
  const innerW = W - padL, innerH = H - padB - padT;
  const band = innerW / Math.max(data.length, 1);
  const barW = Math.min(36, band * 0.42);
  const ticks = Array.from({ length: Math.round(max / step) + 1 }, (_, i) => i * step);
  const y = (v) => padT + innerH - (v / max) * innerH;
  if (view === 'table') {
    return (
      <div className="cs-table-wrap">
        <table className="cs-chart-table">
          {caption && <caption className="cs-sr">{caption}</caption>}
          <thead><tr><th scope="col">Período</th>{series.map((s) => <th scope="col" key={s.name}>{s.name}</th>)}<th scope="col">{totalLabel}</th></tr></thead>
          <tbody>{data.map((d, i) => <tr key={i}><th scope="row" style={{ fontWeight: 500, color: 'var(--ink)' }}>{d.label}{d.partial ? ' *' : ''}</th>{d.values.map((v, j) => <td key={j}>{formatValue(v)}</td>)}<td style={{ fontWeight: 600, color: 'var(--ink)' }}>{formatValue(totals[i])}</td></tr>)}</tbody>
        </table>
        {data.some((d) => d.partial) && <p className="cs-kpi__hint" style={{ margin: '8px 0 0' }}>* {partialLabel}</p>}
      </div>
    );
  }
  const a = active != null ? data[active] : null;
  return (
    <div className="cs-chart" ref={ref} style={{ height: H }}>
      {width > 0 && (
        <svg width={W} height={H} role="group" aria-labelledby={caption ? id : undefined}>
          {caption && <title id={id}>{caption}</title>}
          <defs>
            <pattern id={id + 'h'} width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(135)">
              <rect className="cs-chart__hatch-bg" width="6" height="6" /><line className="cs-chart__hatch-line" x1="0" y1="0" x2="0" y2="6" />
            </pattern>
          </defs>
          {ticks.map((t, i) => (
            <g key={i}>
              <line className="cs-chart__grid" x1={padL} x2={W} y1={y(t)} y2={y(t)} />
              <text className="cs-chart__axis" x={padL - 8} y={y(t) + 4} textAnchor="end">{t >= 1000 ? formatNumber(t / 1000) + 'k' : formatNumber(Math.round(t))}</text>
            </g>
          ))}
          {data.map((d, i) => {
            const cx0 = padL + band * i + band / 2;
            let acc = 0;
            return (
              <g key={i}>
                <rect className="cs-chart__col" data-active={active === i} x={cx0 - band / 2 + 4} y={padT} width={band - 8} height={innerH} rx="8" />
                {d.partial && <rect x={cx0 - barW / 2} y={padT} width={barW} height={innerH} rx="4" fill={`url(#${id}h)`} />}
                {d.values.map((v, j) => {
                  if (!v) return null;
                  const y0 = y(acc), y1 = y(acc + v);
                  acc += v;
                  const isTop = j === d.values.length - 1 || d.values.slice(j + 1).every((x) => !x);
                  const hgt = Math.max(y0 - y1 - (j > 0 ? 2 : 0), 1);
                  const top = y1;
                  return <path key={j} className={`cs-chart__bar${(series[j] && series[j].color || 'chart-1').replace('chart-', '')}`} d={isTop ? topRoundedRect(cx0 - barW / 2, top, barW, hgt, 4) : `M${cx0 - barW / 2},${top}h${barW}v${hgt}h${-barW}Z`} />;
                })}
                <text className="cs-chart__axis" x={cx0} y={H - 6} textAnchor="middle">{d.label}{d.partial ? '*' : ''}</text>
                <rect className="cs-chart__hit" x={cx0 - band / 2} y={padT} width={band} height={innerH + padB} tabIndex={0} role="img"
                  aria-label={`${d.label}${d.partial ? ' (' + partialLabel.toLowerCase() + ')' : ''}: ${series.map((s, j) => s.name + ' ' + formatValue(d.values[j])).join(', ')}; ${totalLabel.toLowerCase()} ${formatValue(totals[i])}`}
                  onMouseEnter={() => setActive(i)} onMouseLeave={() => setActive(null)} onFocus={() => setActive(i)} onBlur={() => setActive(null)} />
              </g>
            );
          })}
        </svg>
      )}
      {a && (
        <div className="cs-tooltip" style={{ left: Math.min(Math.max(padL + band * active + band / 2, 90), W - 90), top: Math.max(y(totals[active]), 60) }}>
          <div className="cs-tooltip__title">{a.label}{a.partial ? ' · ' + partialLabel.toLowerCase() : ''}</div>
          {series.map((s, j) => (
            <div className="cs-tooltip__row" key={j}><span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}><span className="cs-legend__swatch" style={{ background: `var(--${s.color})` }} />{s.name}</span><b>{formatValue(a.values[j])}</b></div>
          ))}
          <div className="cs-tooltip__row" style={{ borderTop: '1px solid var(--line)', paddingTop: 6, marginTop: 6 }}><span>{totalLabel}</span><b>{formatValue(totals[active])}</b></div>
        </div>
      )}
    </div>
  );
}

/* ───────── DonutChart ───────── */
/**
 * DonutChart — parts of a whole (2–4 parts). parts: [{ label, value, color: 'chart-1'|'chart-3'…, icon, sub }].
 * Center shows the total; legend carries identity (icon + label), counts and sub-values.
 */
export function DonutChart({ parts = [], size = 148, thickness = 16, centerLabel = 'total', formatValue = formatNumber }) {
  const total = parts.reduce((a, p) => a + p.value, 0) || 1;
  const r = (size - thickness) / 2, C = 2 * Math.PI * r, gap = 3;
  let off = 0;
  return (
    <div className="cs-donut">
      <div className="cs-donut__svg" style={{ width: size, height: size }}>
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} role="img" aria-label={parts.map((p) => `${p.label}: ${formatValue(p.value)} (${Math.round((p.value / total) * 100)}%)`).join('; ')}>
          <g transform={`rotate(-90 ${size / 2} ${size / 2})`}>
            <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--chart-track)" strokeWidth={thickness} />
            {parts.map((p, i) => {
              const len = (p.value / total) * C;
              const el = <circle key={i} cx={size / 2} cy={size / 2} r={r} fill="none" stroke={`var(--${p.color})`} strokeWidth={thickness} strokeDasharray={`${Math.max(len - gap, 0)} ${C}`} strokeDashoffset={-off} />;
              off += len;
              return el;
            })}
          </g>
        </svg>
        <div className="cs-donut__center"><span className="cs-donut__total">{formatValue(total)}</span><span className="cs-donut__caption">{centerLabel}</span></div>
      </div>
      <ul className="cs-donut__legend">
        {parts.map((p, i) => (
          <li className="cs-donut__item" key={i}>
            <span className="cs-legend__swatch" style={{ background: `var(--${p.color})` }} aria-hidden="true" />
            <span className="cs-donut__item-label">{p.icon && <Icon name={p.icon} size={14} />}{p.label}</span>
            <span className="cs-donut__item-count">{formatValue(p.value)}</span>
            {p.sub && <span className="cs-donut__item-sub">{p.sub}</span>}
          </li>
        ))}
      </ul>
    </div>
  );
}

/* ───────── RankingList ───────── */
/** RankingList — top N with rank, name, meta, value and a proportional bar. items: [{ id, name, meta, value }]. */
export function RankingList({ items = [], formatValue = formatBRL, onSelect, nameFormat = titleCase }) {
  const max = Math.max(...items.map((i) => i.value), 1);
  return (
    <ol className="cs-rank">
      {items.map((it, i) => (
        <li className="cs-rank__item" key={it.id || i}>
          <span className="cs-rank__pos" aria-hidden="true">{i + 1}</span>
          <div style={{ minWidth: 0 }}>
            <div className="cs-rank__name cs-truncate" title={it.name}>{nameFormat(it.name)}</div>
            {it.meta && <div className="cs-rank__meta">{it.meta}</div>}
          </div>
          <span className="cs-rank__value">{formatValue(it.value)}</span>
          <span className="cs-rank__bar" aria-hidden="true"><span style={{ width: (it.value / max) * 100 + '%' }} /></span>
          {onSelect && <button type="button" className="cs-rank__hit" aria-label={`${i + 1}º ${nameFormat(it.name)}, ${formatValue(it.value)}. Abrir`} onClick={() => onSelect(it)} />}
        </li>
      ))}
    </ol>
  );
}

/* ───────── DataTable ───────── */
/** Skeleton line. */
export const Skeleton = ({ width = '100%', height = 12 }) => <span className="cs-skel" style={{ width, height }} aria-hidden="true" />;

/**
 * DataTable — sortable table on wide containers, card list below 640px (same data, same actions).
 * columns: [{ key, header, align: 'left'|'right'|'center', sortable, sortValue(row), render(row), priority: 1|2|3, width }]
 *   priority 2 hides under 900px of table width, 3 under 1100px (content moves into the row's detail).
 * mobile: { title(row), meta(row), value(row), tags(row) } — the card anatomy.
 * rowActions(row) → ActionMenu items; primaryAction(row) → { label, icon, onClick } shown inline on desktop.
 * onRowClick(row), selectedKey, loading (skeleton), empty (node), footer (node), caption (a11y), forceMode: 'table'|'cards', openActionsFor (row key whose menu starts open — previews).
 */
export function sortRows(rows, columns, sort) {
  if (!sort) return rows;
  const col = columns.find((c) => c.key === sort.key);
  if (!col) return rows;
  const get = col.sortValue || ((r) => r[col.key]);
  return [...rows].sort((a, b) => { const x = get(a), y = get(b); const r = x > y ? 1 : x < y ? -1 : 0; return sort.dir === 'asc' ? r : -r; });
}

/* App: `sort` + `onSortChange` make sorting controlled (the caller sorts all rows before paginating, e.g. with sortRows). */
export function DataTable({ columns = [], rows = [], rowKey = (r) => r.id, mobile, rowActions, primaryAction, onRowClick, selectedKey, loading = false, skeletonRows = 5, empty, footer, caption, forceMode, defaultSort, openActionsFor, sort: sortProp, onSortChange }) {
  const [ref, width] = useElementWidth();
  const { compact } = useViewport();
  const [innerSort, setInnerSort] = useState(defaultSort || null);
  const controlled = typeof onSortChange === 'function';
  const sort = controlled ? sortProp || null : innerSort;
  const setSort = (fn) => { const next = typeof fn === 'function' ? fn(sort) : fn; controlled ? onSortChange(next) : setInnerSort(next); };
  const mode = forceMode || ((compact || (width > 0 && width < 640)) && mobile ? 'cards' : 'table');
  const visible = columns.filter((c) => !c.priority || c.priority === 1 || (c.priority === 2 && (width === 0 || width >= 900)) || (c.priority === 3 && (width === 0 || width >= 1100)));
  const sorted = useMemo(() => (controlled ? rows : sortRows(rows, columns, sort)), [rows, sort, controlled]);
  const toggleSort = (key) => setSort((s) => (!s || s.key !== key ? { key, dir: 'desc' } : s.dir === 'desc' ? { key, dir: 'asc' } : null));
  const hasActions = rowActions || primaryAction;

  if (mode === 'cards') {
    return (
      <div ref={ref} style={{ minWidth: 0 }}>
        {loading ? (
          <ul className="cs-list cs-list--cards" aria-busy="true">{Array.from({ length: 3 }, (_, i) => <li key={i} className="cs-list__item"><Skeleton width="60%" height={14} /><Skeleton width={72} height={14} /><Skeleton width="40%" /></li>)}</ul>
        ) : !rows.length ? (empty || <EmptyState compact title="Nada por aqui" icon="search-x">Nenhum resultado para os filtros atuais.</EmptyState>) : (
          <ul className="cs-list cs-list--cards" aria-label={caption}>
            {sorted.map((r) => {
              const acts = rowActions ? rowActions(r) : null;
              return (
                <li key={rowKey(r)} className="cs-list__item" aria-current={selectedKey === rowKey(r) || undefined}>
                  {onRowClick && <button type="button" className="cs-list__hit" aria-label={`Abrir ${typeof mobile.title(r) === 'string' ? mobile.title(r) : ''}`} onClick={() => onRowClick(r)} />}
                  <span className="cs-list__title cs-truncate">{mobile.title(r)}</span>
                  {mobile.value && <span className="cs-list__value">{mobile.value(r)}</span>}
                  {mobile.meta && <span className="cs-list__meta">{mobile.meta(r)}</span>}
                  {mobile.tags && <span className="cs-list__tags">{mobile.tags(r)}</span>}
                  {acts && acts.length > 0 && <span className="cs-list__aside"><ActionMenu items={acts} defaultOpen={openActionsFor === rowKey(r)} autoFocus={openActionsFor == null} label={`Ações de ${typeof mobile.title(r) === 'string' ? mobile.title(r) : 'item'}`} title={typeof mobile.title(r) === 'string' ? mobile.title(r) : undefined} /></span>}
                </li>
              );
            })}
          </ul>
        )}
        {footer}
      </div>
    );
  }
  return (
    <div ref={ref} style={{ minWidth: 0 }}>
      <div className="cs-table-wrap">
        <table className="cs-table">
          {caption && <caption className="cs-sr">{caption}</caption>}
          <thead>
            <tr>
              {visible.map((c) => (
                <th key={c.key} scope="col" data-align={c.align} style={{ width: c.width }} aria-sort={sort && sort.key === c.key ? (sort.dir === 'asc' ? 'ascending' : 'descending') : c.sortable ? 'none' : undefined}>
                  {c.sortable ? <button type="button" className="cs-th-sort" onClick={() => toggleSort(c.key)}>{c.header}<Icon name={sort && sort.key === c.key ? (sort.dir === 'asc' ? 'arrow-up' : 'arrow-down') : 'arrow-up-down'} /></button> : c.header}
                </th>
              ))}
              {hasActions && <th scope="col" data-align="right"><span className="cs-sr">Ações</span></th>}
            </tr>
          </thead>
          <tbody aria-busy={loading || undefined}>
            {loading ? Array.from({ length: skeletonRows }, (_, i) => (
              <tr key={i}>{visible.map((c, j) => <td key={c.key} data-align={c.align}><Skeleton width={j === 0 ? '70%' : '50%'} /></td>)}{hasActions && <td />}</tr>
            )) : !rows.length ? (
              <tr><td colSpan={visible.length + (hasActions ? 1 : 0)} style={{ padding: 0 }}>{empty || <EmptyState compact title="Nada por aqui" icon="search-x">Nenhum resultado para os filtros atuais.</EmptyState>}</td></tr>
            ) : sorted.map((r) => {
              const k = rowKey(r);
              const pa = primaryAction && primaryAction(r);
              const acts = rowActions && rowActions(r);
              return (
                <tr key={k} aria-selected={selectedKey === k || undefined} data-clickable={onRowClick ? 'true' : undefined} onClick={onRowClick ? (e) => { if (!e.target.closest('button,a,input,select')) onRowClick(r); } : undefined}>
                  {visible.map((c) => <td key={c.key} data-align={c.align} className={c.align === 'right' ? 'cs-num' : undefined}>{c.render ? c.render(r) : r[c.key]}</td>)}
                  {hasActions && (
                    <td data-align="right" style={{ width: 1 }}>
                      <div className="cs-cell-actions">
                        {pa && <Button size="sm" variant="ghost" icon={pa.icon} iconEnd={pa.iconEnd} onClick={pa.onClick} aria-label={pa.ariaLabel} disabled={pa.disabled}>{pa.label}</Button>}
                        {acts && acts.length > 0 && <ActionMenu items={acts} defaultOpen={openActionsFor === k} autoFocus={openActionsFor == null} label={pa && pa.ariaLabel ? 'Mais ações · ' + pa.ariaLabel.replace(/^(Abrir|Detalhar|Editar) /, '') : 'Mais ações'} />}
                      </div>
                    </td>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      {footer}
    </div>
  );
}

/** Pagination — "1–25 de 240", page size, prev/next + page numbers. */
export function Pagination({ page = 1, pageSize = 25, total = 0, onPage, onPageSize, compact }) {
  const pages = Math.max(1, Math.ceil(total / pageSize));
  const from = total ? (page - 1) * pageSize + 1 : 0, to = Math.min(total, page * pageSize);
  const nums = pages <= 5 ? Array.from({ length: pages }, (_, i) => i + 1) : [1, Math.max(2, page - 1), page, Math.min(pages - 1, page + 1), pages].filter((v, i, a) => a.indexOf(v) === i);
  return (
    <nav className="cs-table-foot" aria-label="Paginação">
      <span className="cs-num">{formatNumber(from)}–{formatNumber(to)} de {formatNumber(total)}</span>
      <div className="cs-pager">
        {!compact && onPageSize && (
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, marginRight: 8 }}>Por página
            <span className="cs-control cs-control--sm" style={{ width: 76 }}>
              <select className="cs-control__input" value={pageSize} onChange={(e) => onPageSize(Number(e.target.value))}>{[10, 25, 50, 100].map((n) => <option key={n} value={n}>{n}</option>)}</select>
              <Icon name="chevron-down" className="cs-control__chevron" />
            </span>
          </label>
        )}
        <IconButton icon="chevron-left" label="Página anterior" size="sm" disabled={page <= 1} onClick={() => onPage && onPage(page - 1)} />
        {!compact && <div className="cs-pager__pages">{nums.map((n) => <button key={n} type="button" className="cs-pager__page" aria-current={n === page ? 'page' : undefined} onClick={() => onPage && onPage(n)}>{n}</button>)}</div>}
        <IconButton icon="chevron-right" label="Próxima página" size="sm" disabled={page >= pages} onClick={() => onPage && onPage(page + 1)} />
      </div>
    </nav>
  );
}
