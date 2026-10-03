// Teste de ponta a ponta contra o bucket R2 real (precisa das variáveis R2_*): exercita o MESMO caminho do app —
// URL PUT pré-assinada usada com fetch, conferência de tamanho, URL de download com o nome original e exclusão.
// Uso: npm run test:r2 (lê o .env). Não imprime credenciais e apaga o objeto de teste ao final.
import ExcelJS from "exceljs";
import { createUploadUrl, createDownloadUrl, headFile, deleteFile, listFiles } from "../api/_lib/r2.js";

const required = ["R2_ACCESS_KEY_ID", "R2_SECRET_ACCESS_KEY", "R2_BUCKET_NAME", "R2_ENDPOINT"];
const missing = required.filter((key) => !process.env[key]);
if (missing.length) throw new Error(`Defina as variáveis R2 antes de executar este teste: ${missing.join(", ")}`);

const XLSX_TYPE = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
const key = `e2e/${new Date().toISOString().slice(0, 7).replace("-", "/")}/${crypto.randomUUID()}-exemplo.xlsx`;
const workbook = new ExcelJS.Workbook();
workbook.addWorksheet("Exemplo").addRow(["médico", "valor"]);
const body = Buffer.from(await workbook.xlsx.writeBuffer());
const check = (cond, msg) => { if (!cond) throw new Error(msg); };

try {
  const uploadUrl = await createUploadUrl({ key, contentType: XLSX_TYPE, sizeBytes: body.length });

  // Corpo de outro tamanho que o assinado precisa ser recusado (o limite não pode ser burlado).
  const wrongSize = await fetch(uploadUrl, { method: "PUT", headers: { "Content-Type": XLSX_TYPE }, body: Buffer.concat([body, Buffer.from("x")]) });
  check(!wrongSize.ok, "O R2 aceitou um corpo de tamanho diferente do assinado.");

  const put = await fetch(uploadUrl, { method: "PUT", headers: { "Content-Type": XLSX_TYPE }, body });
  check(put.ok, `Upload pela URL pré-assinada falhou (HTTP ${put.status}).`);

  const head = await headFile(key);
  check(head?.sizeBytes === body.length, "O tamanho no bucket não confere com o enviado.");
  const listed = await listFiles(key);
  check(listed.some((item) => item.key === key), "Arquivo não apareceu na listagem.");

  const download = await fetch(await createDownloadUrl(key, "Relatório de Produção.xlsx"));
  check(download.ok, `Download pela URL pré-assinada falhou (HTTP ${download.status}).`);
  check(/attachment/.test(download.headers.get("content-disposition") || ""), "O download não veio como anexo com o nome original.");
  check(Buffer.from(await download.arrayBuffer()).equals(body), "O arquivo baixado difere do enviado.");

  await deleteFile(key);
  check((await headFile(key)) === null, "Arquivo ainda existe após exclusão.");
  console.log("R2 E2E OK: upload pré-assinado (tamanho assinado), conferência, download com nome original e exclusão.");
} catch (error) {
  console.error("R2 E2E falhou:", error?.message || error);
  await deleteFile(key).catch(() => {});
  process.exitCode = 1;
}
