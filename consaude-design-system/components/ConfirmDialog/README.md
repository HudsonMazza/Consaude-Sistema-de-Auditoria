# ConfirmDialog

Confirmação de ação destrutiva que nomeia o objeto e diz o que se perde.

**Você fornece**: `title` ("Excluir a auditoria Setembro/2026?"), `description` (consequências), `confirmLabel`, `onConfirm`, `onClose`, `loading`.

- Foco inicial em Cancelar; botão destrutivo por último. Se a ação puder ser desfeita, prefira executar e oferecer "Desfazer" num `Toast`.
