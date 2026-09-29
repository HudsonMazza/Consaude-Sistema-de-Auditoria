# Tabs

Abas sublinhadas para alternar seções da mesma página (Minhas auditorias | Nova auditoria), com contador opcional.

**Você fornece**: `tabs` (`[{ id, label, icon, count, disabled }]`), `value`/`onChange` ou `defaultValue`, `label` (nome do grupo), `fill` no mobile.

- Setas ←/→ movem a seleção; só a aba ativa entra no Tab. Evite mais de 5 abas; para trocar a *visão* de um bloco use `SegmentedControl`.
