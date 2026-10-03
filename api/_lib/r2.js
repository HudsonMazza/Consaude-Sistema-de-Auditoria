import { S3Client, PutObjectCommand, GetObjectCommand, HeadObjectCommand, DeleteObjectCommand, ListObjectsV2Command } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const required = ["R2_ACCESS_KEY_ID", "R2_SECRET_ACCESS_KEY", "R2_BUCKET_NAME", "R2_ENDPOINT"];
const EXPIRES_IN = 300;

export function r2Config(env = process.env) {
  const missing = required.filter((name) => !env[name]);
  if (missing.length) throw new Error(`R2 não configurado (${missing.join(", ")}).`);
  return {
    bucket: env.R2_BUCKET_NAME,
    client: new S3Client({
      region: "auto",
      endpoint: env.R2_ENDPOINT,
      credentials: { accessKeyId: env.R2_ACCESS_KEY_ID, secretAccessKey: env.R2_SECRET_ACCESS_KEY },
      // O SDK novo embute `x-amz-checksum-crc32=AAAAAA==` (CRC32 de um corpo vazio) nas URLs pré-assinadas de PUT,
      // e o R2 recusaria qualquer arquivo real por checksum divergente. Só calcula checksum quando o serviço exige.
      requestChecksumCalculation: "WHEN_REQUIRED",
      responseChecksumValidation: "WHEN_REQUIRED",
    }),
  };
}

/**
 * URL de PUT de 5 minutos. Content-Type e Content-Length entram na assinatura: o cliente só consegue enviar
 * um corpo do tamanho e do tipo que foram validados antes de assinar.
 */
export async function createUploadUrl({ key, contentType, sizeBytes }) {
  const { client, bucket } = r2Config();
  return getSignedUrl(
    client,
    new PutObjectCommand({ Bucket: bucket, Key: key, ContentType: contentType, ContentLength: sizeBytes }),
    { expiresIn: EXPIRES_IN, signableHeaders: new Set(["content-type", "content-length"]) },
  );
}

/** URL de GET de 5 minutos que baixa o arquivo com o nome original (Content-Disposition), sem depender de CORS. */
export async function createDownloadUrl(key, filename) {
  const { client, bucket } = r2Config();
  const ascii = String(filename || "arquivo").replace(/[^\x20-\x7e]/g, "_").replace(/["\\]/g, "_");
  const disposition = `attachment; filename="${ascii}"; filename*=UTF-8''${encodeURIComponent(String(filename || "arquivo"))}`;
  return getSignedUrl(client, new GetObjectCommand({ Bucket: bucket, Key: key, ResponseContentDisposition: disposition }), { expiresIn: EXPIRES_IN });
}

/** Tamanho do objeto no bucket, ou null se ele não existir. */
export async function headFile(key) {
  const { client, bucket } = r2Config();
  try {
    const head = await client.send(new HeadObjectCommand({ Bucket: bucket, Key: key }));
    return { sizeBytes: Number(head.ContentLength) };
  } catch (err) {
    if (err?.$metadata?.httpStatusCode === 404 || err?.name === "NotFound") return null;
    throw err;
  }
}

export async function deleteFile(key) {
  const { client, bucket } = r2Config();
  await client.send(new DeleteObjectCommand({ Bucket: bucket, Key: key }));
}

export async function listFiles(prefix) {
  const { client, bucket } = r2Config();
  const result = await client.send(new ListObjectsV2Command({ Bucket: bucket, Prefix: prefix }));
  return (result.Contents || []).map(({ Key, Size, LastModified, ETag }) => ({ key: Key, sizeBytes: Size, lastModified: LastModified, etag: ETag }));
}
