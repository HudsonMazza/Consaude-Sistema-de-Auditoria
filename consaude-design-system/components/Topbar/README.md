# Topbar

Barra superior: breadcrumb, busca global, alternância de tema e menu da conta; no mobile, marca (ou voltar) + título e avatar.

**Você fornece** (via `AppShell`): `crumbs`, `title`, `back`, `user` (`{ name, role, email }`).

- A busca global aceita o atalho `/`. No mobile o tema passa para o menu da conta.
- Páginas de detalhe (Relatório) passam `back` para mostrar a seta de voltar no mobile.
