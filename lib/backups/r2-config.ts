/**
 * Pure helpers for resolving Cloudflare R2 / S3-compatible backup storage config.
 * Supports both AWS_* (project .env) and R2_* names.
 */

export type ParsedStorageEndpoint = {
  /** S3 API origin only (no path). */
  endpoint: string;
  /** Optional key prefix from endpoint path (e.g. "telecel"). */
  keyPrefix: string;
};

/** Strip path from an S3/R2 URL; path segments become an object key prefix. */
export function parseStorageEndpoint(raw: string): ParsedStorageEndpoint {
  const trimmed = raw.trim().replace(/\/+$/, "");
  let url: URL;
  try {
    url = new URL(trimmed);
  } catch {
    throw new Error(`Invalid storage endpoint URL: ${raw}`);
  }

  const keyPrefix = url.pathname
    .split("/")
    .map((part) => part.trim())
    .filter(Boolean)
    .join("/");

  return {
    endpoint: `${url.protocol}//${url.host}`,
    keyPrefix,
  };
}

export function joinStorageKey(prefix: string, key: string): string {
  const cleanPrefix = prefix.replace(/^\/+|\/+$/g, "");
  const cleanKey = key.replace(/^\/+/, "");
  if (!cleanPrefix) return cleanKey;
  return `${cleanPrefix}/${cleanKey}`;
}

export type BackupStorageEnv = {
  accessKeyId?: string;
  secretAccessKey?: string;
  endpoint?: string;
  bucket?: string;
  region?: string;
  accountId?: string;
  keyPrefixOverride?: string;
};

export type ResolvedBackupStorageConfig = {
  endpoint: string;
  bucket: string;
  region: string;
  accessKeyId: string;
  secretAccessKey: string;
  keyPrefix: string;
};

export function readBackupStorageEnv(
  env: NodeJS.ProcessEnv = process.env,
): BackupStorageEnv {
  return {
    accessKeyId: env.R2_ACCESS_KEY_ID?.trim() || env.AWS_ACCESS_KEY_ID?.trim(),
    secretAccessKey:
      env.R2_SECRET_ACCESS_KEY?.trim() || env.AWS_SECRET_ACCESS_KEY?.trim(),
    endpoint: env.R2_ENDPOINT?.trim() || env.AWS_ENDPOINT?.trim(),
    bucket: env.R2_BUCKET_NAME?.trim() || env.AWS_BUCKET?.trim(),
    region: env.R2_REGION?.trim() || env.AWS_DEFAULT_REGION?.trim() || "auto",
    accountId: env.R2_ACCOUNT_ID?.trim(),
    keyPrefixOverride: env.R2_KEY_PREFIX?.trim() || env.AWS_KEY_PREFIX?.trim(),
  };
}

export function resolveBackupStorageConfig(
  envInput: BackupStorageEnv = readBackupStorageEnv(),
): ResolvedBackupStorageConfig {
  const accessKeyId = envInput.accessKeyId;
  const secretAccessKey = envInput.secretAccessKey;
  const bucket = envInput.bucket;

  if (!accessKeyId) {
    throw new Error(
      "Missing R2_ACCESS_KEY_ID or AWS_ACCESS_KEY_ID for Cloudflare R2.",
    );
  }
  if (!secretAccessKey) {
    throw new Error(
      "Missing R2_SECRET_ACCESS_KEY or AWS_SECRET_ACCESS_KEY for Cloudflare R2.",
    );
  }
  if (!bucket) {
    throw new Error("Missing R2_BUCKET_NAME or AWS_BUCKET for Cloudflare R2.");
  }

  let endpoint = envInput.endpoint ?? "";
  let keyPrefix = "";

  if (endpoint) {
    const parsed = parseStorageEndpoint(endpoint);
    endpoint = parsed.endpoint;
    keyPrefix = parsed.keyPrefix;
  } else if (envInput.accountId) {
    endpoint = `https://${envInput.accountId}.r2.cloudflarestorage.com`;
  } else {
    throw new Error(
      "Missing R2_ENDPOINT, AWS_ENDPOINT, or R2_ACCOUNT_ID for Cloudflare R2.",
    );
  }

  if (envInput.keyPrefixOverride) {
    keyPrefix = envInput.keyPrefixOverride.replace(/^\/+|\/+$/g, "");
  }

  return {
    endpoint,
    bucket,
    region: envInput.region || "auto",
    accessKeyId,
    secretAccessKey,
    keyPrefix,
  };
}
