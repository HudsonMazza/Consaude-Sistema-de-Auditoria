# Configuração do Firebase — ConSaúde

Projeto: **ConSaude Auditoria** (`consaude-auditoria`) · plano Spark (gratuito)
Console: https://console.firebase.google.com/project/consaude-auditoria

## Status

| Passo                                    | Status |
| ---------------------------------------- | ------ |
| 1. Projeto criado                        | ✅ feito |
| 2. App web registrado + `.env` preenchido | ✅ feito |
| 3. Authentication com e-mail/senha        | ✅ feito |
| 4. Firestore criado (`southamerica-east1`, São Paulo) | ✅ feito |
| 5. Security Rules publicadas              | ✅ feito |
| 6. Primeiro administrador                 | ⏳ **pendente — só você pode fazer** |

O passo 6 exige criar uma conta e definir uma senha. Isso fica com você de
propósito: a senha do administrador não deve passar por mim nem por nenhum
registro de conversa. Pule para a seção **4. Criar o primeiro administrador**.

Analytics e Gemini no Firebase foram deixados **desativados** — nenhum dos dois
é necessário e ambos ampliariam o acesso aos dados da auditoria.

---

## 1. Pegar as credenciais (`firebaseConfig`) — ✅ já feito

> As credenciais já estão no `.env`. Esta seção fica como referência para
> recriar o ambiente em outra máquina.

As credenciais saem do **app web** registrado no projeto.

1. Clique na **engrenagem ⚙** ao lado de "Visão geral do projeto" → **Configurações do projeto**
2. Role até **Seus apps**, no rodapé da página
3. Se não houver nenhum app listado, clique no ícone **`</>`** (Web)
   - Apelido do app: `consaude-web`
   - **Não** marque "Firebase Hosting" agora
   - Clique em **Registrar app**
4. A tela seguinte mostra um bloco `const firebaseConfig = { ... }`
   (se já existia um app, o mesmo bloco está em **Configuração do SDK** → opção **Config**)

Copie cada valor para o arquivo `.env` na raiz do projeto:

| Bloco do Console      | Variável no `.env`                  |
| --------------------- | ----------------------------------- |
| `apiKey`              | `VITE_FIREBASE_API_KEY`             |
| `authDomain`          | `VITE_FIREBASE_AUTH_DOMAIN`         |
| `projectId`           | `VITE_FIREBASE_PROJECT_ID`          |
| `storageBucket`       | `VITE_FIREBASE_STORAGE_BUCKET`      |
| `messagingSenderId`   | `VITE_FIREBASE_MESSAGING_SENDER_ID` |
| `appId`               | `VITE_FIREBASE_APP_ID`              |

Sem aspas, sem espaços em volta do `=`. Exemplo:

```
VITE_FIREBASE_PROJECT_ID=consaude-auditoria
```

> Estas chaves são **públicas por design** — elas só identificam o projeto e vão
> no bundle de qualquer app Firebase. Quem protege o sistema são as Security
> Rules (passo 3) e a verificação de senha feita pelos servidores do Firebase.
> O `.env` continua no `.gitignore` por higiene, mas não é um segredo crítico.

Depois de preencher, **reinicie o dev server** (o Vite só lê o `.env` na inicialização).

---

## 2. Criar o banco Firestore — ✅ já feito

Criado em `southamerica-east1` (São Paulo), modo produção. O local **não pode
ser alterado depois** — São Paulo foi escolhido por latência e por manter os
dados de auditoria médica em território nacional.

---

## 3. Publicar as Security Rules — ✅ já feito

O conteúdo de [`firestore.rules`](firestore.rules) está publicado e ativo.

É este passo que torna o acesso não-burlável: as regras rodam nos servidores do
Google. Mesmo que alguém edite o JavaScript no navegador, o Firestore recusa a
operação. Sem ele, o resto não protege nada.

Ao alterar o arquivo, republique em **Firestore Database → Regras** (cole e
clique em Publicar) ou com `firebase deploy --only firestore:rules`.

### 3.1 Histórico de auditorias (coleção `audits`) — ⏳ republicar + índice

O histórico saiu do `localStorage` e passou a viver na coleção `audits`, com
regras próprias no mesmo `firestore.rules`. Dois passos únicos no Console:

1. **Republicar as regras** (Firestore Database → Regras → cole o arquivo
   atualizado → Publicar). Sem isso, toda leitura/gravação em `audits` é
   recusada e a tela de Histórico fica vazia com um aviso.
2. **Criar o índice composto** usado pela consulta de usuários comuns
   (Firestore Database → Índices → Compostos → Criar índice):
   - Coleção: `audits`
   - Campos: `userId` (Crescente), depois `createdAt` (Decrescente)
   - Escopo: Coleção

   Admins consultam só por `createdAt` e não precisam dele. Se um usuário comum
   abrir o Histórico antes do índice existir, o Firestore imprime no console do
   navegador um link que cria o índice pronto — funciona também.

Na primeira vez que cada pessoa entrar após a atualização, o app migra o
histórico que estava no `localStorage` daquele navegador para o Firestore
(uma vez só, sem apagar o original). Entradas antigas atribuídas a outro
usuário só migram quando um admin entrar naquele mesmo navegador.

---

## 4. Criar o primeiro administrador — ⏳ pendente

Não existe mais admin padrão no código. O primeiro precisa ser criado à mão —
e é justamente isso que elimina a credencial conhecida.

**4.1 — Criar a conta no Authentication**

Link direto: https://console.firebase.google.com/project/consaude-auditoria/authentication/users

1. **Adicionar usuário**
2. E-mail: o seu e-mail real (é para lá que vão os links de redefinição)
3. Senha: uma senha temporária forte (você vai trocá-la no primeiro acesso)
4. **Adicionar usuário**
5. Copie o **UID** gerado na listagem (clique no ícone de cópia)

**4.2 — Criar o perfil no Firestore**

Link direto: https://console.firebase.google.com/project/consaude-auditoria/firestore/databases/-default-/data

1. **Iniciar coleção**
2. ID da coleção: `users`
3. ID do documento: **cole o UID** copiado acima (não use "ID automático")
4. Adicione os campos:

| Campo                | Tipo      | Valor                        |
| -------------------- | --------- | ---------------------------- |
| `name`               | string    | Seu nome                     |
| `email`              | string    | O mesmo e-mail do passo 4.1  |
| `role`               | string    | `admin`                      |
| `cargo`              | string    | Administrador do Sistema     |
| `disabled`           | boolean   | `false`                      |
| `mustChangePassword` | boolean   | `true`                       |
| `createdAt`          | timestamp | data/hora de agora           |

5. **Salvar**

`mustChangePassword: true` faz o sistema exigir uma senha nova logo no primeiro
login — a senha temporária que você digitou no Console deixa de valer.

---

## 5. Testar

```bash
npm run dev
```

1. Entre com o e-mail e a senha temporária do passo 4.1
2. O sistema deve exigir a troca de senha antes de liberar qualquer tela
3. Defina sua senha definitiva
4. Em **Usuários**, cadastre o restante da equipe

A partir daí, ninguém mais precisa mexer no Console: o admin cria os usuários
pelo app, com convite por e-mail (a pessoa define a própria senha) ou com senha
temporária de troca obrigatória.

---

## Como ficou o fluxo de senhas

| Situação                    | O que acontece                                                       |
| --------------------------- | -------------------------------------------------------------------- |
| Admin cria usuário (convite)| Firebase envia link por e-mail; a pessoa define a senha. Ninguém mais a conhece. |
| Admin cria com senha temporária | A pessoa é obrigada a trocar no primeiro acesso.                  |
| "Esqueci a senha"           | Link de redefinição real, enviado pelo Firebase, válido por 1 hora.  |
| Admin clica em 🔑           | Dispara o mesmo link de redefinição. O admin não define senha de ninguém. |
| Remover acesso              | **Desativar** no app — corta o acesso na hora, via Security Rules.    |

Para apagar uma conta de vez: **Authentication → Users → Excluir**, e remova o
documento em `users/{uid}`. O SDK do cliente não faz isso no plano Spark, de
propósito — exclusão em massa a partir do navegador seria um risco maior.

---

## Pendências conhecidas

- **Chave da OpenAI no bundle** — `VITE_OPENAI_API_KEY` é embutida no JavaScript
  e fica visível para qualquer visitante. Enquanto a chamada não for movida para
  um backend, use uma chave com limite de gasto baixo e rotacione com frequência.
- **Gate de troca de senha** — a tela é aplicada no cliente. Quem já tem
  credencial válida poderia pulá-la mexendo no JavaScript, mas só afetaria a
  própria conta (o papel e os dados continuam protegidos pelas regras). Fechar
  isso por completo exige Cloud Functions com custom claims, que pedem o plano
  Blaze.

---

## Arquivos originais de cada auditoria

Ao rodar uma auditoria, os dois arquivos enviados (Produção e Repasse) ficam guardados
sem alteração (sem o filtro de PIX) e aparecem para download em **Arquivos da auditoria**,
no relatório. Como o plano Spark não inclui o Firebase Storage, o conteúdo vai para o
próprio Firestore, nas subcoleções `audits/{id}/arquivos` (metadados + SHA-256) e
`audits/{id}/arquivoPartes` (conteúdo em partes de ~700 KB). Limite: 8 MB por arquivo.

⚠️ **Republique o [`firestore.rules`](firestore.rules)** (Console → Firestore Database →
Regras, ou `firebase deploy --only firestore:rules`). Sem as regras novas o Firestore
recusa a gravação e o aviso "não foi possível guardar o arquivo" aparece após cada auditoria.
Auditorias anteriores a este recurso não têm arquivos guardados.
