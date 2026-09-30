# ActionMenu

Menu de ações (⋯): dropdown no desktop e action sheet no mobile, com os mesmos itens.

**Você fornece**: `items` (`[{ label, icon, onSelect, variant: 'danger'|'ia'|'export', disabled, hint }]`, `{ separator: true }`, `{ heading }`), `label` (nome acessível), `title` (título do sheet), `trigger(props)` opcional.

- Ordem: ações frequentes → exportações → IA → separador → destrutivo por último, em `danger`.
- ↑/↓/Home/End navegam, Esc fecha e devolve o foco. O dropdown é posicionado fora de containers com scroll e vira para cima perto da borda.
