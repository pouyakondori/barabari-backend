import * as Minio from "minio";
import { env } from "../config/env";

let minioClient: Minio.Client;

export function getMinioClient(): Minio.Client {
  if (!minioClient) {
    minioClient = new Minio.Client({
      endPoint: env.MINIO_ENDPOINT,
      port: env.MINIO_PORT,
      useSSL: env.MINIO_USE_SSL,
      accessKey: env.MINIO_ACCESS_KEY,
      secretKey: env.MINIO_SECRET_KEY,
    });
  }
  return minioClient;
}

export async function ensureBucket(): Promise<void> {
  const client = getMinioClient();
  const exists = await client.bucketExists(env.MINIO_BUCKET);
  if (!exists) {
    await client.makeBucket(env.MINIO_BUCKET);
    console.log(`✅ Created MinIO bucket: ${env.MINIO_BUCKET}`);
  }
}

export async function uploadFile(
  objectName: string,
  filePath: string,
  contentType: string
): Promise<string> {
  const client = getMinioClient();
  await client.fPutObject(env.MINIO_BUCKET, objectName, filePath, {
    "Content-Type": contentType,
  });
  return objectName;
}

export async function getFileStream(
  objectName: string
): Promise<{ stream: NodeJS.ReadableStream; stat: Minio.BucketItemStat }> {
  const client = getMinioClient();
  const stat = await client.statObject(env.MINIO_BUCKET, objectName);
  const stream = await client.getObject(env.MINIO_BUCKET, objectName);
  return { stream, stat };
}

export async function deleteFile(objectName: string): Promise<void> {
  const client = getMinioClient();
  await client.removeObject(env.MINIO_BUCKET, objectName);
}
