# SegmentedControl

Seletor de 2–4 opções exclusivas que troca a visão (período 3/6/12 meses, gráfico/tabela, formato de exportação).

**Você fornece**: `options` (`[{ id, label, icon }]`), `value`/`onChange` ou `defaultValue`, `label`, `block` (largura total em formulários).

- Não use para filtrar dados de uma lista (isso é `FilterChips`) nem para navegar entre seções (isso é `Tabs`).
