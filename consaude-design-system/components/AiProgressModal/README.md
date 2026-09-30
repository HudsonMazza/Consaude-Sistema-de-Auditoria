# AiProgressModal

Progresso da geração do relatório com IA: orbe, barra, etapas (feita, ativa, pendente) e opção de continuar em segundo plano.

**Você fornece**: `steps` (`[{ label, state: 'done'|'active'|'pending', end }]`), `progress` (0–100), `onBackground`, `onCancel`.

- Etapas padrão: Consolidando divergências → Identificando riscos → Preparando plano de ação. Ao terminar em segundo plano, avise com `Toast tone="ia"`.
