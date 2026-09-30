// Feedback transitório do app (sucesso, erro, aviso) com os Toasts do design system.
import React, { createContext, useCallback, useContext, useRef, useState } from 'react';
import { Toast, ToastStack } from './ds/index.js';

const ToastContext = createContext(() => {});

/** useToast() → toast({ tone: 'success'|'error'|'warning'|'info'|'ia', title, text, duration }) */
export const useToast = () => useContext(ToastContext);

/**
 * ToastProvider — pilha única de toasts. `persistent`: toasts controlados pelo estado de quem renderiza
 * ([{ key, tone, title, text, onClose }]), exibidos na mesma pilha que os transitórios.
 */
export function ToastProvider({ children, persistent = [] }) {
  const [items, setItems] = useState([]);
  const seq = useRef(0);
  const dismiss = useCallback((id) => setItems((list) => list.filter((t) => t.id !== id)), []);
  const toast = useCallback(({ tone = 'success', title, text, duration } = {}) => {
    const id = ++seq.current;
    setItems((list) => [...list.slice(-3), { id, tone, title, text }]);
    const ms = duration ?? (tone === 'error' ? 0 : 5000);
    if (ms) setTimeout(() => dismiss(id), ms);
    return id;
  }, [dismiss]);
  const all = [
    ...persistent.filter(Boolean).map((t) => ({ ...t, id: 'p-' + t.key })),
    ...items.map((t) => ({ ...t, onClose: () => dismiss(t.id) })),
  ];
  return (
    <ToastContext.Provider value={toast}>
      {children}
      {all.length > 0 && (
        <ToastStack>
          {all.map((t) => <Toast key={t.id} tone={t.tone} title={t.title} onClose={t.onClose}>{t.text}</Toast>)}
        </ToastStack>
      )}
    </ToastContext.Provider>
  );
}
