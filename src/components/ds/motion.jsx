// ConSaúde — movimento. Adaptado de componentes do 21st.dev para o design system (tokens próprios, sem Tailwind
// e sem framer-motion): Number Ticker (danielpetho), Task Steps (ddoemonn), Text Shimmer, Border Beam e
// Animated Tabs. Tudo respeita "reduzir movimento" do sistema: sem animação, o valor final aparece direto.
import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';

/** true quando o sistema pede menos movimento (acompanha a troca em tempo real). */
export function useReducedMotion() {
  const query = '(prefers-reduced-motion: reduce)';
  const [reduced, setReduced] = useState(() => typeof window !== 'undefined' && !!window.matchMedia?.(query).matches);
  useEffect(() => {
    const mq = window.matchMedia?.(query);
    if (!mq) return undefined;
    const on = () => setReduced(mq.matches);
    mq.addEventListener?.('change', on);
    return () => mq.removeEventListener?.('change', on);
  }, []);
  return reduced;
}

const easeOutCubic = (t) => 1 - Math.pow(1 - t, 3);

/**
 * AnimatedNumber — conta até o valor (Number Ticker). Na primeira exibição parte de 0; depois, do valor anterior.
 * `format` formata cada quadro (ex.: formatBRL). Leitores de tela recebem só o valor final.
 */
export function AnimatedNumber({ value, format = (n) => String(Math.round(n)), duration = 900, className }) {
  const target = Number(value);
  const reduced = useReducedMotion();
  const [shown, setShown] = useState(reduced || !Number.isFinite(target) ? target : 0);
  // Valor que está na tela agora: a próxima animação parte dele (também no meio de outra animação)
  const shownRef = useRef(shown);

  useEffect(() => {
    if (!Number.isFinite(target)) return undefined;
    const from = Number.isFinite(shownRef.current) ? shownRef.current : 0;
    if (reduced || from === target) { shownRef.current = target; setShown(target); return undefined; }
    let raf = 0;
    const start = performance.now();
    const tick = (now) => {
      const t = Math.min(1, (now - start) / duration);
      const v = t >= 1 ? target : from + (target - from) * easeOutCubic(t);
      shownRef.current = v;
      setShown(v);
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, reduced, duration]);

  if (!Number.isFinite(target)) return <span className={className}>—</span>;
  return (
    <span className={className}>
      <span aria-hidden="true" className="cs-num">{format(shown)}</span>
      <span className="cs-sr">{format(target)}</span>
    </span>
  );
}

/** BorderBeam — feixe de luz que percorre a borda do elemento pai (que precisa de position: relative). */
export function BorderBeam({ tone = 'accent', duration = 2.6 }) {
  return <span className={`cs-beam cs-beam--${tone}`} style={{ '--cs-beam-duration': `${duration}s` }} aria-hidden="true" />;
}

/**
 * useSlidingIndicator — posição do item ativo dentro de um container, para um indicador que desliza
 * (Animated Tabs). Retorna o style do indicador; null até medir (aí o CSS mostra o indicador estático).
 */
export function useSlidingIndicator(containerRef, activeSelector, deps = []) {
  const [box, setBox] = useState(null);
  useLayoutEffect(() => {
    const el = containerRef.current;
    if (!el) return undefined;
    const measure = () => {
      const active = el.querySelector(activeSelector);
      if (!active) { setBox(null); return; }
      setBox({ left: active.offsetLeft, width: active.offsetWidth, top: active.offsetTop, height: active.offsetHeight });
    };
    measure();
    const ro = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(measure) : null;
    ro?.observe(el);
    return () => ro?.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
  return box;
}
