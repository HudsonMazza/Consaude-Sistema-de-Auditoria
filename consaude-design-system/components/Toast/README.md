# Toast

Feedback passageiro no canto inferior direito (acima da bottom nav no mobile), com ação opcional.

**Você fornece**: `tone` (`success` | `error` | `warning` | `info` | `ia`), `title`, `children`, `action` (`{ label, onClick }`), `onClose`. Envolva em `ToastStack`.

- Erros usam `role="alert"` e ficam até serem dispensados; os demais somem em ~5s. Nunca coloque a única cópia de uma informação importante num toast.
