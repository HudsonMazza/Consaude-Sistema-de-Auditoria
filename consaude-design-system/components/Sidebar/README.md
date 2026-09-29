# Sidebar

Navegação principal do desktop com grupos, item ativo em azul preenchido, contador de pendências, card "Nova auditoria" e "Recolher".

**Você fornece**: `nav` (padrão `NAV`: `{ group }` ou `{ id, label, icon, short, count, countLabel }`), `active`, `onNavigate`, `onNewAudit`.

- Grupos: "Menu principal" (Dashboard, Auditorias) e "Administração" (Usuários, Configurações). Esconda grupos sem permissão em vez de desabilitar.
- No trilho os rótulos viram tooltip, o contador vira um ponto `warning` e o card vira um botão `+`.
- Faça: um único item com `aria-current="page"`. Evite: mais de 7 itens ou submenus — use abas dentro da página.
