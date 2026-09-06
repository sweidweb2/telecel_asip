import { describe, expect, it } from "vitest";

import {
  joinStorageKey,
  parseStorageEndpoint,
  resolveBackupStorageConfig,
} from "@/lib/backups/r2-config";

describe("parseStorageEndpoint", () => {
  it("keeps origin and extracts /telecel as key prefix", () => {
    expect(
      parseStorageEndpoint(
        "https://b58376aea01a9aa036f5390611d806da.r2.cloudflarestorage.com/telecel",
      ),
    ).toEqual({
      endpoint:
        "https://b58376aea01a9aa036f5390611d806da.r2.cloudflarestorage.com",
      keyPrefix: "telecel",
    });
  });

  it("handles endpoint with no path", () => {
    expect(
      parseStorageEndpoint(
        "https://b58376aea01a9aa036f5390611d806da.r2.cloudflarestorage.com",
      ),
    ).toEqual({
      endpoint:
        "https://b58376aea01a9aa036f5390611d806da.r2.cloudflarestorage.com",
      keyPrefix: "",
    });
  });
});

describe("joinStorageKey", () => {
  it("prefixes keys under telecel/", () => {
    expect(joinStorageKey("telecel", "backups/full/a.zip")).toBe(
      "telecel/backups/full/a.zip",
    );
  });

  it("returns key unchanged when prefix empty", () => {
    expect(joinStorageKey("", "backups/full/a.zip")).toBe("backups/full/a.zip");
  });
});

describe("resolveBackupStorageConfig", () => {
  it("resolves AWS_* credentials and telecel prefix from endpoint path", () => {
    const config = resolveBackupStorageConfig({
      accessKeyId: "key",
      secretAccessKey: "secret",
      bucket: "storage",
      region: "auto",
      endpoint:
        "https://b58376aea01a9aa036f5390611d806da.r2.cloudflarestorage.com/telecel",
    });

    expect(config).toMatchObject({
      accessKeyId: "key",
      secretAccessKey: "secret",
      bucket: "storage",
      region: "auto",
      endpoint:
        "https://b58376aea01a9aa036f5390611d806da.r2.cloudflarestorage.com",
      keyPrefix: "telecel",
    });
  });

  it("throws a clear error when endpoint is missing", () => {
    expect(() =>
      resolveBackupStorageConfig({
        accessKeyId: "key",
        secretAccessKey: "secret",
        bucket: "storage",
      }),
    ).toThrow(/AWS_ENDPOINT|R2_ENDPOINT|R2_ACCOUNT_ID/);
  });

  it("builds endpoint from R2_ACCOUNT_ID when AWS_ENDPOINT is absent", () => {
    const config = resolveBackupStorageConfig({
      accessKeyId: "key",
      secretAccessKey: "secret",
      bucket: "storage",
      accountId: "acct123",
    });
    expect(config.endpoint).toBe(
      "https://acct123.r2.cloudflarestorage.com",
    );
    expect(config.keyPrefix).toBe("");
  });
});
