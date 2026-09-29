# Diagnóstico de UX e arquitetura de interface

## Problemas da versão atual e como o sistema resolve

| Problema | Causa | Solução no sistema |
| --- | --- | --- |
| Tabela de Auditorias estoura na horizontal e as ações somem | Todas as colunas com o mesmo peso; 4 botões por linha | `DataTable` com **prioridade de coluna** (Auditor some < 900px de tabela, Arquivos < 1100px) e **uma** ação visível ("Abrir") + menu `⋯` |
| E-mail em Usuários quebra letra a letra | Coluna própria estreita sem `min-width` | E-mail vai para a **segunda linha da célula do usuário**, com reticências e o valor completo no `title` |
| Drawer do médico em fonte serif | Estilo fora do sistema | Um só `Drawer`, Inter em todo lugar, estilos de texto por token |
| Botões coloridos por linha (Abrir, Excel, Relatório IA, Excluir) poluem a tabela | Cada ação com sua cor semântica, repetida N vezes | Cor semântica vai para o **ícone dentro do menu** (Excel verde, IA violeta, Excluir vermelho). A linha mostra só "Abrir"/"Detalhar"/"Editar" em ghost |
| Tabelas sem estratégia mobile | Scroll horizontal | Abaixo de 640px de container a mesma `DataTable` vira **lista de cards** (título, valor, meta, tags, `⋯` em action sheet) |
| KPIs repetidos com o mesmo peso em várias telas | Sem hierarquia | **Um herói por tela** (`HeroKpi`, card azul), KPIs secundários agrupados (`KpiGroup`), telas de lista só com `StatStrip` compacta |
| Laranja como acento competia com vermelho de divergência | Acento quente | Acento azul (Primary Blue); laranja reservado à direção "Repasse maior" |

## Mapa de navegação

- **Menu principal** — Dashboard · Auditorias (Minhas auditorias | Nova auditoria) → Relatório da auditoria → Detalhe do médico.
- **Administração** — Usuários e acessos · Configurações. O grupo inteiro é ocultado para perfis sem permissão (não desabilitado).
- **Sempre acessível** — "Nova auditoria": card no rodapé da sidebar (vira `+` no trilho), botão primário nas telas de Dashboard/Auditorias e botão central da bottom nav.
- **Busca global** (proposta) — campo na topbar com atalho `/`, procura auditorias por referência/arquivo e médicos por nome. No mobile vira ícone que abre a busca em tela cheia.

## Fluxo principal

1. **Upload** — dois `Dropzone` (Produção, Repasse) com `UploadProgress` "1 de 2", colunas reconhecidas após a leitura e erros explicados.
2. **Comparação** — referência opcional, escopo e `Accordion` "Opções de comparação" (tolerância desta auditoria, chave de cruzamento, normalização de nomes). CTA "Processar auditoria" numa `ActionBar` fixa, desabilitado com o motivo escrito.
3. **Revisão** — Relatório: herói com o valor divergente, resumo, **progresso da revisão** (novo: Corrigidos/Revisados/Pendentes em medidor segmentado), tabela de médicos com filtro de status e detalhe em `Drawer` com o botão "Marcar como revisado/corrigido".
4. **Exportação** — "Exportar" (Excel padrão, PDF), "Relatório IA" (`AiProgressModal` com etapas e segundo plano) e "Copiar resumo".

## Escalabilidade

- **Novos tipos de auditoria** (glosas, convênios, plantões): cada tipo é um item em Auditorias › Nova auditoria com os mesmos `Dropzone`s parametrizados (`step`, `title`, `subtitle`, `accept`); o relatório reutiliza `HeroKpi` + `KpiGroup` + `DataTable` com colunas próprias. A tag de tipo entra como `Badge tone="outline"` na referência.
- **Mais relatórios**: novo item "Relatórios" no menu principal; cada relatório é uma página com `PageHeader` + cards no grid de 12 colunas; gráficos só com os três slots de cor validados (mais séries → "Outros" ou pequenos múltiplos).
- **Mais perfis**: `ProfileBadge` já prevê Administrador, Auditor e Gestor (somente leitura de dashboards e relatórios). Permissões escondem grupos da navegação e ações de menu; nunca deixe botões visíveis que falham ao clicar.
- **Mais clínicas/unidades**: o seletor "Clínica inteira / unidade" do Dashboard vira o filtro de escopo global na topbar quando houver mais de uma unidade.
