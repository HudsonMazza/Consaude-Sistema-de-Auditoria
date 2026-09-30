# Estratégia responsiva e mobile

Desktop-first, com o mobile como experiência completa. **Nenhuma função some no celular**: muda a forma de apresentar, nunca a capacidade.

| Faixa | Largura | Navegação | Conteúdo |
| --- | --- | --- | --- |
| Mobile | < 768px | Top app bar (marca ou voltar + título) e `BottomNav` com "Nova" no centro | Uma coluna, `space-4` de margem, KPIs 2×2, tabelas em cards |
| Tablet | 768–1279px | Sidebar em trilho de 76px (rótulos viram tooltip) | Grid de 12 colunas em metades (`cs-md-6`) e linhas cheias (`cs-md-12`) |
| Desktop | ≥ 1280px | Sidebar de 248px, recolhível pelo usuário | Grid de 12 colunas; colunas de prioridade 3 a partir de 1100px de tabela |

## Tradução de padrões

| Desktop | Mobile | Componente |
| --- | --- | --- |
| Sidebar | Bottom nav (Início, Auditorias, **Nova**, Usuários, Ajustes) | `AppShell`, `BottomNav` |
| Tabela | Lista de cards: título + valor na 1ª linha, meta na 2ª, tags de status/direção, `⋯` | `DataTable` (`mobile={{ title, value, meta, tags }}`) |
| Ações por linha (Abrir, Excel, IA, Excluir) | Toque no card abre; `⋯` abre action sheet com as mesmas ações | `ActionMenu` |
| Barra de ações do relatório | Ação primária em largura total + `⋯` com o resto | `PageHeader` (`primary`, `secondary`) |
| Drawer lateral do médico | Tela cheia com voltar e rodapé fixo | `Drawer` |
| Modal | Bottom sheet com botões empilhados | `Modal` |
| Filtros em linha | Chips em uma linha com scroll; seletores como chips que abrem sheet | `FilterChips scroll`, `SelectChip`, `BottomSheet` |
| KPIs em faixa | Grid 2×2 compacto | `KpiGroup`, `StatStrip` |
| Upload lado a lado com "arraste" | Passos empilhados, "Toque para selecionar o arquivo" | `Dropzone` |
| Barra de salvar/processar | Fixa acima da bottom nav, botão em largura total | `ActionBar` |
| Busca na topbar | Campo em largura total no topo da lista | `SearchField` |

## Regras de toque e leitura

- Alvo mínimo de 44px (`control-lg`) para tudo que é tocável; ícones pequenos ganham área invisível.
- Texto de input em 16px no mobile (evita zoom do iOS); valores monetários em 15px semibold nos cards.
- Conteúdo prioritário primeiro: no card de auditoria, referência e valor; no de médico, nome e diferença com direção; no de usuário, nome, e-mail e status.
- Sheets e telas cheias respeitam `safe-area-inset-bottom`; a bottom nav e a `ActionBar` ficam fixas com fundo translúcido.
