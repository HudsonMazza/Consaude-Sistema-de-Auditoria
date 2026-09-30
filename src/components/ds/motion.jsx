// ConSaúde — movimento. Adaptado de componentes do 21st.dev para o design system (tokens próprios, sem Tailwind
// e sem framer-motion): Border Beam (só no botão "Relatório IA" enquanto gera) e Animated Tabs.
// Valores e dinheiro aparecem direto, sem contagem animada. "Reduzir movimento" desliga tudo (motion.css).
import React, { useLayoutEffect, useState } from 'react';

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
