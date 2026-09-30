# BarChart

Colunas empilhadas com tooltip em hover e foco, período em andamento hachurado e alternância para tabela.

**Você fornece**: `data` (`[{ label, values: [bottom, …], partial }]`), `series` (`[{ name, color: 'chart-1'|'chart-2'|'chart-3' }]`), `height`, `view` (`chart` | `table`), `formatValue`, `caption`, `integer`.

- Ponha a `Legend` acima e a alternância Gráfico/Tabela nas ações do card. Barras ≤ 36px, 2px de respiro entre segmentos, eixo em números inteiros para contagens. Nunca dois eixos Y.
