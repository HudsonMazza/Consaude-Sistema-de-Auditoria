import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand, ListObjectsV2Command } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const required = ["R2_ACCESS_KEY_ID", "R2_SECRET_ACCESS_KEY", "R2_BUCKET_NAME", "R2_ENDPOINT"];

function config() {
  const missing = required.filter((name) => !process.env[name]);
  if (missing.length) throw new Error(`R2 não configurado (${missing.join(", ")}).`);
  return {
    bucket: process.env.R2_BUCKET_NAME,
    client: new S3Client({
      region: "auto",
      endpoint: process.env.R2_ENDPOINT,
      credentials: { accessKeyId: process.env.R2_ACCESS_KEY_ID, secretAccessKey: process.env.R2_SECRET_ACCESS_KEY },
    }),
  };
}

export async function createUploadUrl({ key, contentType }) {
  const { client, bucket } = config();
  return getSignedUrl(client, new PutObjectCommand({ Bucket: bucket, Key: key, ContentType: contentType }), { expiresIn: 300 });
}

export async function createDownloadUrl(key) {
  const { client, bucket } = config();
  return getSignedUrl(client, new GetObjectCommand({ Bucket: bucket, Key: key }), { expiresIn: 300 });
}

export async function deleteFile(key) {
  const { client, bucket } = config();
  await client.send(new DeleteObjectCommand({ Bucket: bucket, Key: key }));
}

export async function listFiles(prefix) {
  const { client, bucket } = config();
  const result = await client.send(new ListObjectsV2Command({ Bucket: bucket, Prefix: prefix }));
  return (result.Contents || []).map(({ Key, Size, LastModified, ETag }) => ({ key: Key, sizeBytes: Size, lastModified: LastModified, etag: ETag }));
}
