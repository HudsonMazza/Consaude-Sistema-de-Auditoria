# Regras de dados

- **Moeda**: sempre `formatBRL` → `R$ 38.521,16`. Diferenças sempre com sinal (`+R$ 1.732,40`, `−R$ 2.130,00`) e acompanhadas de `DirectionTag`/`DiffValue`. Zero ou inexistente = `—` em `ink-3`, nunca "R$ 0,00" numa coluna de divergência.
- **Alinhamento**: valores monetários e contagens alinhados à direita com números tabulares (`cs-num`); texto à esquerda; status e contadores pequenos podem centralizar.
- **Diferença = Repasse − Produção.** Positivo → "Repasse maior" (pago a mais, ↗, `dir-rep`). Negativo → "Produção maior" (pago a menos, ↙, `dir-prod`). A direção aparece por seta + palavra, não só por cor, e nunca em vermelho/verde.
- **Nomes**: médicos e pacientes vêm em CAIXA ALTA; exiba com `titleCase` e guarde o original em `title` para busca e cópia. Busca ignora acentos e caixa.
- **Datas**: `dd/mm/aaaa`; hora `HH:mm` em linha secundária `ink-3`. Competência/referência por extenso: "Setembro/2026".
- **Arquivos**: nome em `text-mono`, truncado no meio visual com reticências e o nome completo no `title`.
- **Volume**: tabelas com dezenas ou centenas de linhas usam busca + filtros rápidos com contagem + ordenação por coluna (`aria-sort`) + paginação de 25 (10/25/50/100). Acima de ~500 linhas por página, virtualize o `tbody` mantendo o cabeçalho fixo.
- **Contadores**: "Exibindo 8 de 24" sempre visível perto da lista; os chips de filtro mostram a contagem de cada recorte.
- **Estados**: toda lista tem carregando (skeleton com a forma da linha), vazio (motivo + próximo passo), sem resultados (com "Limpar filtros") e erro (com "Tentar novamente").
- **Copiar resumo**: texto simples, uma linha por médico — `Ricardo Alves Pereira · Repasse maior · +R$ 1.732,40 · 5 itens · Pendente`.
