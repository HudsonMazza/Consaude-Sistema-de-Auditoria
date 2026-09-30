// Feedback transitório do app (sucesso, erro, aviso) com os Toasts do design system.
import React, { createContext, useCallback, useContext, useRef, useState } from 'react';
import { Toast, ToastStack } from './ds/index.js';

const ToastContext = createContext(() => {});

/**
 * useToast() → toast({ tone: 'success'|'error'|'warning'|'info'|'ia', title, text, duration, action, key })
 * `action`: { label, onClick } — botão no toast (ex.: "Desfazer"); clicar executa e dispensa o toast.
 * `key`: um toast novo com a mesma chave substitui o anterior (ex.: status de revisão trocado várias vezes).
 */
export const useToast = () => useContext(ToastContext);

/**
 * ToastProvider — pilha única de toasts. `persistent`: toasts controlados pelo estado de quem renderiza
 * ([{ key, tone, title, text, onClose }]), exibidos na mesma pilha que os transitórios.
 */
export function ToastProvider({ children, persistent = [] }) {
  const [items, setItems] = useState([]);
  const seq = useRef(0);
  const dismiss = useCallback((id) => setItems((list) => list.filter((t) => t.id !== id)), []);
  const toast = useCallback(({ tone = 'success', title, text, duration, action, key } = {}) => {
    const id = ++seq.current;
    setItems((list) => [...list.filter((t) => !key || t.key !== key).slice(-3), { id, key, tone, title, text, action }]);
    // Com ação, o toast fica mais tempo: dá tempo de ler e desfazer.
    const ms = duration ?? (tone === 'error' ? 0 : action ? 8000 : 5000);
    if (ms) setTimeout(() => dismiss(id), ms);
    return id;
  }, [dismiss]);
  const all = [
    ...persistent.filter(Boolean).map((t) => ({ ...t, id: 'p-' + t.key })),
    ...items.map((t) => ({
      ...t,
      onClose: () => dismiss(t.id),
      action: t.action && { label: t.action.label, onClick: () => { dismiss(t.id); t.action.onClick?.(); } },
    })),
  ];
  return (
    <ToastContext.Provider value={toast}>
      {children}
      {/* Sempre montado: a região aria-live precisa existir antes do primeiro toast para ele ser anunciado. */}
      <ToastStack>
        {all.map((t) => <Toast key={t.id} tone={t.tone} title={t.title} action={t.action} onClose={t.onClose}>{t.text}</Toast>)}
      </ToastStack>
    </ToastContext.Provider>
  );
}
