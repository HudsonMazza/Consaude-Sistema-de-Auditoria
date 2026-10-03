# Consa-de-Sistema-de-Auditoria

## Arquivos de auditoria no Cloudflare R2

Cada auditoria guarda os dois arquivos originais enviados (Produção e Repasse), exatamente como o
usuário os selecionou — sem o filtro de PIX nem qualquer outra alteração — e os oferece para download
no card **Arquivos da auditoria** do relatório. Isso permite conferir depois de onde vieram os resultados.

**Como funciona**
- O envio acontece **ao final da auditoria**, com a auditoria já salva. Se o R2 estiver fora do ar ou sem
  configuração, a auditoria continua normalmente e aparece um aviso de que os arquivos não foram guardados
  (selecionar e processar planilhas nunca depende do R2).
- O navegador envia direto ao bucket privado por uma URL `PUT` pré-assinada de 5 minutos, que fixa o tipo e o
  tamanho do arquivo. Antes de confirmar, a API confere no bucket que o objeto existe e tem o tamanho declarado.
- O download usa uma URL `GET` de 5 minutos, com o nome original. Podem baixar o dono da auditoria e os admins.
- Os metadados ficam no Firestore (`files/{auditId}_prod` e `files/{auditId}_rep`); as credenciais R2 ficam só
  no servidor. Excluir a auditoria apaga também os arquivos do bucket.
- Limite por arquivo: `MAX_UPLOAD_SIZE_MB` (padrão 20 MB; mantenha `ARQUIVO_MAX_MB` em `src/lib/auditFiles.js`
  igual). Arquivos acima disso não são guardados, mas a auditoria roda.
- Auditorias antigas, cujos arquivos foram guardados no próprio Firestore, continuam com download e são
  apagadas junto com a auditoria.

**Configuração na Vercel** (Production, Preview e Development): `R2_ACCOUNT_ID`, `R2_ACCESS_KEY_ID`,
`R2_SECRET_ACCESS_KEY`, `R2_BUCKET_NAME`, `R2_ENDPOINT`, `MAX_UPLOAD_SIZE_MB` (opcional) e
`FIREBASE_PROJECT_ID` (ou mantenha o `VITE_FIREBASE_PROJECT_ID` já existente).

**Publique o `firestore.rules`** no Firebase (Console → Firestore → Regras, ou
`firebase deploy --only firestore:rules`). Sem as regras novas o Firestore recusa os metadados.

**CORS do R2** (Bucket → Settings → CORS Policy). Só o `PUT` do upload precisa de CORS; o download é uma
navegação comum. Inclua todos os domínios que usam o app (produção, previews da Vercel e local):

```json
[
  {
    "AllowedOrigins": ["http://localhost:5173", "https://app.seu-dominio.com"],
    "AllowedMethods": ["PUT"],
    "AllowedHeaders": ["Content-Type"],
    "ExposeHeaders": [],
    "MaxAgeSeconds": 300
  }
]
```

**Testes**: `npm test` roda os testes offline (assinatura das URLs, validações, acesso aos metadados e
estrutura do `firestore.rules`). `npm run test:r2` (com as variáveis `R2_*` no `.env`) roda o teste de ponta a
ponta contra o bucket real, usando o mesmo caminho do app: PUT pré-assinado, conferência, download e exclusão.
Rode-o antes de publicar.
