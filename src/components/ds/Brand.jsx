// Marca provisória do ConSaúde. Ainda não existe logo oficial: o nome em Inter ("Con" + "Saúde" em accent-text)
// e o quadrado accent-fill com o ícone `activity` são o placeholder do design system. Troque SÓ aqui quando
// o logo oficial existir.
import React from 'react';
import { Icon, cx } from './core.jsx';

export function BrandMark({ size = 'md' }) {
  return <span className={cx('cs-brand__mark', size === 'sm' && 'cs-brand__mark--sm')} aria-hidden="true"><Icon name="activity" /></span>;
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
