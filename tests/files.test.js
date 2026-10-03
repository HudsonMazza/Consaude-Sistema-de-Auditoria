import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { keyBelongsTo, objectKey, validateUpload, fileDocId, validAuditId, maxUploadBytes } from "../api/_lib/files.js";

Object.assign(process.env, {
  R2_ACCESS_KEY_ID: "id", R2_SECRET_ACCESS_KEY: "secret", R2_BUCKET_NAME: "bucket", R2_ENDPOINT: "https://acc.r2.cloudflarestorage.com",
});
const { createUploadUrl, createDownloadUrl } = await import("../api/_lib/r2.js");

test("a chave do objeto só vale para o dono", () => {
  assert.equal(keyBelongsTo("uid1/2026/10/abc-x.xlsx", "uid1"), true);
  assert.equal(keyBelongsTo("uid2/2026/10/abc-x.xlsx", "uid1"), false);
  assert.equal(keyBelongsTo("uid1/../uid2/x.xlsx", "uid1"), false);
  assert.equal(keyBelongsTo("uid10/x.xlsx", "uid1"), false);
  assert.equal(keyBelongsTo("x.xlsx", ""), false);
  assert.equal(keyBelongsTo(undefined, "uid1"), false);
  assert.ok(keyBelongsTo(objectKey("uid1", "Relatório Produção (1).xlsx"), "uid1"));
});

test("valida tipo, extensão, tamanho e hash do upload", () => {
  const ok = { originalName: "a.xlsx", sizeBytes: 100, kind: "prod" };
  assert.equal(validateUpload(ok).error, undefined);
  assert.match(validateUpload({ ...ok, kind: "outro" }).error, /Tipo de arquivo/);
  assert.match(validateUpload({ ...ok, originalName: "a.pdf" }).error, /Formato inválido/);
  assert.match(validateUpload({ ...ok, contentType: "text/csv" }).error, /não corresponde/);
  assert.match(validateUpload({ ...ok, sizeBytes: 0 }).error, /tamanho/);
  assert.match(validateUpload({ ...ok, sizeBytes: 1.5 }).error, /tamanho/);
  const grande = validateUpload({ ...ok, sizeBytes: maxUploadBytes() + 1 });
  assert.equal(grande.tooLarge, true);
  assert.match(validateUpload({ ...ok, sha256: "zz" }).error, /hash/);
  assert.equal(validateUpload({ ...ok, sha256: "a".repeat(64) }).error, undefined);
});

test("identifica o arquivo por auditoria e tipo", () => {
  assert.equal(fileDocId("abc123", "rep"), "abc123_rep");
  assert.equal(validAuditId("aB3dEfGh1JkLmN0pQrSt"), true);
  assert.equal(validAuditId("a/b"), false);
  assert.equal(validAuditId("../x"), false);
  assert.equal(validAuditId(""), false);
  assert.equal(validAuditId(undefined), false);
});

test("URL de upload assina tipo e tamanho e não embute checksum (o R2 recusaria o arquivo real)", async () => {
  const url = new URL(await createUploadUrl({ key: "uid/2026/10/a.csv", contentType: "text/csv", sizeBytes: 1234 }));
  assert.equal(url.searchParams.get("X-Amz-SignedHeaders"), "content-length;content-type;host");
  assert.equal(url.searchParams.get("X-Amz-Expires"), "300");
  assert.deepEqual([...url.searchParams.keys()].filter((k) => /checksum/i.test(k)), []);
});

test("URL de download baixa como anexo com o nome original", async () => {
  const url = new URL(await createDownloadUrl("uid/2026/10/a.xlsx", "Relatório de Produção.xlsx"));
  const disp = url.searchParams.get("response-content-disposition");
  assert.match(disp, /^attachment;/);
  assert.match(disp, /filename\*=UTF-8''Relat%C3%B3rio%20de%20Produ%C3%A7%C3%A3o\.xlsx/);
});

test("firestore.rules: chaves balanceadas e regras de arquivos no nível certo", () => {
  const rules = readFileSync(new URL("../firestore.rules", import.meta.url), "utf8").replace(/\/\/.*$/gm, "");
  assert.equal(rules.split("{").length, rules.split("}").length, "chaves desbalanceadas");
  // cada `match` de arquivos abre no nível das demais coleções (dentro de /documents), nunca aninhado em outro match
  let depth = 0;
  const niveis = {};
  for (const line of rules.split("\n")) {
    const m = line.match(/match\s+(\S+)\s*\{/);
    if (m) niveis[m[1]] = depth;
    depth += (line.match(/\{/g) || []).length - (line.match(/\}/g) || []).length;
  }
  for (const caminho of ["/files/{fileId}", "/audits/{auditId}/arquivos/{chave}", "/audits/{auditId}/arquivoPartes/{parteId}", "/audits/{auditId}"]) {
    assert.equal(niveis[caminho], niveis["/audits/{auditId}"], `${caminho} está aninhado no lugar errado`);
  }
});

// ── acesso aos metadados (Firestore REST simulado) ───────────────────────────
import { getAccessibleFile } from "../api/_lib/files.js";

function doc(userId, r2Key = `${userId}/2026/10/abc-x.xlsx`) {
  return { fields: { userId: { stringValue: userId }, r2Key: { stringValue: r2Key }, status: { stringValue: "uploaded" } } };
}
async function acessa(user, documento) {
  const original = globalThis.fetch;
  globalThis.fetch = async () => (documento ? { ok: true, json: async () => documento } : { ok: false, json: async () => ({}) });
  try { return await getAccessibleFile({ projectId: "p", token: "t", ...user }, "aud1_prod"); }
  finally { globalThis.fetch = original; }
}

test("dono acessa o próprio arquivo; outro usuário não", async () => {
  assert.ok(await acessa({ uid: "ana", role: "user" }, doc("ana")));
  assert.equal(await acessa({ uid: "bia", role: "user" }, doc("ana")), null);
});

test("admin acessa o arquivo de qualquer usuário", async () => {
  assert.ok(await acessa({ uid: "admin1", role: "admin" }, doc("ana")));
});

test("documento adulterado com chave de outro usuário é recusado, até para o dono e para o admin", async () => {
  const adulterado = doc("ana", "bia/2026/10/segredo.xlsx");
  assert.equal(await acessa({ uid: "ana", role: "user" }, adulterado), null);
  assert.equal(await acessa({ uid: "admin1", role: "admin" }, adulterado), null);
});

test("arquivo inexistente ou sem permissão no Firestore devolve null", async () => {
  assert.equal(await acessa({ uid: "ana", role: "user" }, null), null);
});
