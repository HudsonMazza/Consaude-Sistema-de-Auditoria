# Button

Botão em pílula com ícone opcional; o primário é azul preenchido e aparece uma vez por área.

**Você fornece**: `variant` (`primary` | `secondary` | `ghost` | `danger` | `danger-ghost` | `ia` | `export` | `light` | `deep` | `link`), `size` (`sm` 32 | `md` 40 | `lg` 44), `icon`/`iconEnd` (Lucide), `loading`, `block`, `children` (verbo).

- `ia` sempre com *sparkles* e a palavra "IA"; `export` pinta só o ícone de verde (Excel). `light` e `deep` só dentro do `HeroKpi`.
- `loading` troca o ícone por spinner e define `aria-busy`; desabilitado mostra o motivo em texto perto do botão.
- No mobile todo botão sobe para 44px. Evite dois primários lado a lado e botões coloridos repetidos em linhas de tabela.
