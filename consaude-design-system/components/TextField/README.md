# TextField

Campo de texto com rótulo visível, helper e erro; inclui variações com máscara (CNPJ, CPF, telefone), moeda em R$, checkbox e switch.

**Você fornece**: `label`, `optional`, `help`, `error` (substitui o helper, com ícone e `aria-invalid`), `prefix`/`prefixIcon`, `suffix`, props nativas de `<input>`. `MaskedField mask="cnpj"`; `CurrencyField` recebe e devolve reais (número).

- Rótulo sempre visível (placeholder não é rótulo). Erro diz como corrigir. Valores monetários alinhados à direita.
- No mobile a altura é 44px e a fonte 16px.
