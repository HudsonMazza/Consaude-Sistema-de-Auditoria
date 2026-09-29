# DataTable

Tabela de dados ordenável que vira lista de cards abaixo de 640px de container, com as mesmas ações.

**Você fornece**: `columns` (`[{ key, header, align, sortable, sortValue, render, priority: 1|2|3, width }]`), `rows`, `rowKey`, `mobile` (`{ title, value, meta, tags }` — a anatomia do card), `primaryAction(row)` (`{ label, icon, iconEnd, onClick, ariaLabel }`), `rowActions(row)` (itens do `ActionMenu`), `onRowClick`, `selectedKey`, `loading`, `empty`, `footer` (`Pagination`), `caption`, `defaultSort`.

- Prioridade 2 some abaixo de 900px de tabela, prioridade 3 abaixo de 1100px. Números alinhados à direita e tabulares; cabeçalho fixo; `aria-sort`.
- **Uma** ação visível por linha (ghost) + `⋯`. A linha inteira pode abrir, mas a ação explícita continua existindo para teclado e leitores de tela.
- Estados: skeleton, vazio com próximo passo, sem resultados com "Limpar filtros". Para centenas de linhas: paginação de 25 ou virtualização.
