// Executa somente com as variáveis R2_* disponíveis. Não imprime credenciais.
import ExcelJS from "exceljs";
import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand, ListObjectsV2Command } from "@aws-sdk/client-s3";
import { Readable } from "node:stream";

const required = ["R2_ACCESS_KEY_ID", "R2_SECRET_ACCESS_KEY", "R2_BUCKET_NAME", "R2_ENDPOINT"];
const missing = required.filter((key) => !process.env[key]);
if (missing.length) throw new Error(`Defina as variáveis R2 antes de executar este teste: ${missing.join(", ")}`);

const client = new S3Client({
  region: "auto", endpoint: process.env.R2_ENDPOINT,
  credentials: { accessKeyId: process.env.R2_ACCESS_KEY_ID, secretAccessKey: process.env.R2_SECRET_ACCESS_KEY },
});
const key = `e2e/${new Date().toISOString().slice(0, 7).replace("-", "/")}/${crypto.randomUUID()}-exemplo.xlsx`;
const workbook = new ExcelJS.Workbook();
workbook.addWorksheet("Exemplo").addRow(["médico", "valor"]);
const body = Buffer.from(await workbook.xlsx.writeBuffer());

try {
  await client.send(new PutObjectCommand({ Bucket: process.env.R2_BUCKET_NAME, Key: key, Body: body, ContentType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" }));
  const listed = await client.send(new ListObjectsV2Command({ Bucket: process.env.R2_BUCKET_NAME, Prefix: key }));
  if (!listed.Contents?.some((item) => item.Key === key)) throw new Error("Arquivo não apareceu na listagem.");
  const downloaded = await client.send(new GetObjectCommand({ Bucket: process.env.R2_BUCKET_NAME, Key: key }));
  const chunks = [];
  for await (const chunk of Readable.from(downloaded.Body)) chunks.push(chunk);
  if (Buffer.concat(chunks).length !== body.length) throw new Error("Download retornou tamanho inesperado.");
  await client.send(new DeleteObjectCommand({ Bucket: process.env.R2_BUCKET_NAME, Key: key }));
  const afterDelete = await client.send(new ListObjectsV2Command({ Bucket: process.env.R2_BUCKET_NAME, Prefix: key }));
  if (afterDelete.Contents?.some((item) => item.Key === key)) throw new Error("Arquivo ainda aparece após exclusão.");
  console.log("R2 E2E OK: upload, listagem, download e exclusão confirmados.");
} catch (error) {
  console.error("R2 E2E falhou:", error?.message || error);
  process.exitCode = 1;
}
