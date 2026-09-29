# PageHeader

Cabeçalho da página: eyebrow opcional, título (com badge), subtítulo ou metadados e as ações.

**Você fornece**: `title`, `subtitle` ou `meta` (spans com ícone), `eyebrow`, `badge`, `primary` (um `Button`), `secondary` (`[{ label, icon, onSelect, variant }]`), `extra` (filtros).

- Desktop: `secondary` vira botões secundários; mobile: `primary` em largura total e `secondary` num `⋯` (action sheet).
- Uma ação primária por página. Filtros globais da página (período, escopo) entram em `extra` e viram chips no mobile.
