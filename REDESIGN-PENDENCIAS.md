# Pendências do redesign — decisões e dados faltantes

Regra seguida: quando o design pedia um dado que o app não tem, o elemento foi **escondido** (nada inventado). Quando o dado existe, foi implementado.

## Propostas do design system (seção 5 do prompt)
| Proposta | Situação | Por quê |
| --- | --- | --- |
| Busca global na topbar (atalho `/`) | **Não implementada** | Recurso novo (busca cruzada em auditorias e médicos). O `Topbar` já aceita a prop `search` para ligar depois. Precisa do seu OK. |
| Perfil "Gestor" | **Não implementado** | Não existe papel `gestor` no Firestore/Security Rules. `ProfileBadge` já suporta o valor quando existir. |
| "Colunas reconhecidas" no upload | **Implementado** | O dado existe (`detectColumns`). Mostra Médico/Paciente/Valor detectados, marca em vermelho o que não foi detectado e exibe "N linhas lidas" (mesmo parse do preview). |
| Medidor "Progresso da revisão" | **Implementado** | Usa os status Pendente/Revisado/Corrigido que já existiam. Atenção: esses status **não são persistidos** (valem só na sessão, como antes). Decidir se devem ser salvos no Firestore. |

## Elementos das telas de referência escondidos (dado não existe)
- Dashboard: chip de variação vs. período anterior no card herói (`+8,2%`) e delta "+3" em Concluídas.
- Dashboard: valores em R$ por direção no donut ("R$ 24.310,40 pagos a mais") — `summarizeAudits` só conta casos. Mostro contagem e %.
- Dashboard: "N auditorias · N itens" em Maiores impactos.
- Navegação: contador "Auditorias (3 com revisão pendente)" — status de revisão não são salvos.
- Nova auditoria: campo "Escopo" (Clínica inteira/Plantões/Unidade) e opções "Tolerância desta auditoria", "Cruzar por", "Considerar glosas". O accordion mostra só as 3 opções que o motor realmente usa (ignorar < R$ 0,01, comparar pacientes pelo nome, análise inteligente).
- Relatório: responsável pela auditoria no cabeçalho (o objeto `resultados` não guarda quem processou; o histórico guarda `userName`, mas o relatório aberto por uma nova auditoria não).
- Auditorias (lista): coluna "Escopo" e as ações "Exportar PDF"/"Gerar relatório IA" por linha — não existiam na lista antes; mantive Abrir, Exportar Excel, Ver relatório IA (se houver) e Excluir.
- Relatório IA: botão "Cancelar" no modal — a chamada à OpenAI não é cancelável hoje. "Continuar em segundo plano" foi implementado (só esconde o modal; o botão mostra "Gerando relatório IA…").
- Modal de IA: progresso é **indeterminado** (não há progresso real da API); as etapas são as 3 frases que já existiam, sem marcar como concluídas.
- "Copiar resumo": mantido o texto atual (`Auditoria X / N médicos… — Valor total`). O DS sugere uma linha por médico; mudar é decisão sua.

## Decisões que precisam do seu OK
1. **Rótulo do papel `user`**: mantive "Usuário" (vocabulário atual do app e do formulário). O DS usa "Auditor". Trocar é só o texto.
2. **Correção de rota**: quando a validação dos arquivos falhava, `startAudit` ia para `activePage = "upload"`, que não existia no roteamento e caía na tela de Configurações (os erros nunca apareciam). Agora "upload" abre Nova auditoria com os erros. `startAudit` não foi alterado.
3. **Favicon**: `index.html` apontava para `/public/logo.png` (quebra no build). Agora `/logo.png`.
4. **CNPJ** em Configurações usa `MaskedField`: o valor é formatado ao digitar e salvo já mascarado (`00.000.000/0001-00`). Valores antigos só com dígitos aparecem mascarados.
5. **Tolerância** em Configurações continua só armazenada (o motor usa o limite fixo de R$ 0,01 da opção "Ignorar diferenças", como antes). O DS diz que ela vale para novas auditorias — ligar isso muda regra de negócio.
6. **Relatório IA (HTML) e PDF exportados** mantêm a paleta antiga (laranja/navy/índigo), por regra de não mexer no conteúdo exportado. Se quiser, dá para alinhar ao novo visual numa etapa separada.
7. **Logo**: usado o placeholder do DS (componente único `src/components/ds/Brand.jsx`). `public/logo.png`/`logo.svg` continuam como favicon.
8. **Status de revisão** continuam em memória (se perde ao recarregar), como antes.
9. **Paginação** (25 por página, 10/25/50/100) foi adicionada nas listas de auditorias, médicos e usuários, com ordenação por coluna antes de paginar. Aparece só com mais de 10 itens.
10. **Toasts de sucesso** novos: auditoria excluída, relatório IA gerado, resumo/insight copiado, usuário criado/atualizado/desativado, perfil/senha/configurações salvos (antes eram alertas inline ou nada).

## Não verificado neste ambiente
- Fluxos com Firebase real (login, histórico em tempo real, criação de usuário, upload de foto) e a chamada real à OpenAI — o ambiente não tem `.env`. As telas foram verificadas no harness `dev-preview.html` com dados fictícios. Faça um smoke test com o `.env` real: login → nova auditoria com `teste-producao.xlsx`/`teste-repasse.xlsx` → relatório → Excel/PDF/IA → excluir.
- O projeto não tem lint nem typecheck configurados.
