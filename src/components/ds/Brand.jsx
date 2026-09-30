// Marca do ConSaúde: símbolo oficial (public/logo-mark.png, gerado a partir de public/logo.png) + nome em Inter.
import React from 'react';
import { cx } from './core.jsx';

export function BrandMark({ size = 'md' }) {
  return <span className={cx('cs-brand__mark', 'cs-brand__mark--logo', size === 'sm' && 'cs-brand__mark--sm')} aria-hidden="true"><img src="/logo-mark.png" alt="" width="36" height="36" /></span>;
}

export function BrandName() {
  return <span className="cs-brand__name">Con<em>Saúde</em></span>;
}

/** Bloco da marca. `onClick` torna-o um link para o início; `tagline` mostra "Auditoria Financeira". */
export function Brand({ compact = false, onClick, tagline = true, className }) {
  const inner = (
    <>
      <BrandMark />
      {!compact && (
        <span className="cs-brand__text">
          <BrandName />
          {tagline && <span className="cs-brand__tag">Auditoria Financeira</span>}
        </span>
      )}
    </>
  );
  if (!onClick) return <span className={cx('cs-brand', className)} aria-label="ConSaúde — Auditoria Financeira">{inner}</span>;
  return (
    <a className={cx('cs-brand', className)} href="#dashboard" aria-label="ConSaúde — Auditoria Financeira, início"
      onClick={(e) => { e.preventDefault(); onClick(); }}>
      {inner}
    </a>
  );
}
