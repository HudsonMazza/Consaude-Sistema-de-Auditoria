# Consa-de-Sistema-de-Auditoria

## Arquivos de auditoria no Cloudflare R2

As planilhas são enviadas pelo navegador diretamente para o bucket privado usando
uma URL `PUT` pré-assinada de cinco minutos. As APIs Vercel validam a sessão do
Firebase, tamanho e extensão; as credenciais R2 ficam exclusivamente no servidor.
O processamento atual continua lendo a cópia local selecionada no navegador.

Cadastre na Vercel (Production, Preview e Development): `R2_ACCOUNT_ID`,
`R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `R2_BUCKET_NAME`, `R2_ENDPOINT`,
`MAX_UPLOAD_SIZE_MB` (opcional; padrão `20`) e `FIREBASE_PROJECT_ID` (ou mantenha
o `VITE_FIREBASE_PROJECT_ID` já existente). Publique também `firestore.rules` no
Firebase para proteger a coleção `files`.

No R2, em **Bucket → Settings → CORS Policy**, cole este JSON e substitua
`https://app.seu-dominio.com` pelo domínio de produção real:

```json
[
  {
    "AllowedOrigins": ["http://localhost:5173", "https://app.seu-dominio.com"],
    "AllowedMethods": ["PUT", "GET"],
    "AllowedHeaders": ["Content-Type"],
    "ExposeHeaders": [],
    "MaxAgeSeconds": 300
  }
]
```

O teste seguro do bucket (upload, listagem, download e exclusão de um `.xlsx`
temporário) pode ser executado com `npm run test:r2` após preencher o `.env`.
