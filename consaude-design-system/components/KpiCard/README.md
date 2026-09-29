# KpiCard

KPI secundário: ícone (o tom colore só o ícone), rótulo, valor tabular, variação com seta e contexto.

**Você fornece**: `label`, `value`, `icon`, `tone` (`danger` | `success` | `warning` | `accent` | `ia`), `delta` (`{ value, direction: 'up'|'down', good, label }`), `hint`, `variant` (`tile` dentro de card | `card` avulso).

- Agrupe 2–4 em `KpiGroup` dentro de um `Card` (como "AI Enhancements"). A cor da variação diz se é bom ou ruim, a seta diz a direção — as duas juntas.
