import "server-only";

import {
  DeleteObjectCommand,
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { nanoid } from "nanoid";

import {
  joinStorageKey,
  resolveBackupStorageConfig,
} from "@/lib/backups/r2-config";

type R2Config = {
  client: S3Client;
  bucket: string;
  keyPrefix: string;
};

function getR2Config(): R2Config {
  const resolved = resolveBackupStorageConfig();
  const client = new S3Client({
    region: resolved.region,
    endpoint: resolved.endpoint,
    forcePathStyle: true,
    credentials: {
      accessKeyId: resolved.accessKeyId,
      secretAccessKey: resolved.secretAccessKey,
    },
  });

  return {
    client,
    bucket: resolved.bucket,
    keyPrefix: resolved.keyPrefix,
  };
}

export function buildBackupObjectKey(input: {
  backupId: string;
  scope: string;
  extension: string;
  now?: Date;
  keyPrefix?: string;
}): string {
  const now = input.now ?? new Date();
  const yyyy = String(now.getUTCFullYear());
  const mm = String(now.getUTCMonth() + 1).padStart(2, "0");
  const ext = input.extension.replace(/^\./, "");
  const relative = `backups/${input.scope}/${yyyy}/${mm}/${input.backupId}-${nanoid(10)}.${ext}`;
  const prefix =
    input.keyPrefix ?? resolveBackupStorageConfig().keyPrefix;
  return joinStorageKey(prefix, relative);
}

export async function uploadBackupObject(input: {
  key: string;
  body: Buffer;
  contentType: string;
}): Promise<{ key: string; size: number }> {
  const { client, bucket } = getR2Config();
  await client.send(
    new PutObjectCommand({
      Bucket: bucket,
      Key: input.key,
      Body: input.body,
      ContentType: input.contentType,
      CacheControl: "private, max-age=31536000, immutable",
    }),
  );
  return { key: input.key, size: input.body.byteLength };
}

export async function getSignedBackupUrl(
  key: string,
  expiresInSeconds = 900,
): Promise<string> {
  const { client, bucket } = getR2Config();
  return getSignedUrl(
    client,
    new GetObjectCommand({ Bucket: bucket, Key: key }),
    { expiresIn: expiresInSeconds },
  );
}

export async function deleteBackupObject(key: string): Promise<void> {
  const { client, bucket } = getR2Config();
  await client.send(
    new DeleteObjectCommand({
      Bucket: bucket,
      Key: key,
    }),
  );
}
