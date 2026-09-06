import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";
import JSZip from "jszip";

import {
  BACKUP_STORAGE_BUCKETS,
  type BackupStorageBucket,
} from "@/constants/backup-tables";
import type { Database } from "@/types/database";

type AdminClient = SupabaseClient<Database>;

const PAGE_SIZE = 100;

async function listAllFilePaths(
  supabase: AdminClient,
  bucket: BackupStorageBucket,
  prefix = "",
): Promise<string[]> {
  const paths: string[] = [];
  let offset = 0;

  for (;;) {
    const { data, error } = await supabase.storage.from(bucket).list(prefix, {
      limit: PAGE_SIZE,
      offset,
      sortBy: { column: "name", order: "asc" },
    });

    if (error) {
      throw new Error(`Failed to list storage bucket ${bucket}: ${error.message}`);
    }

    if (!data || data.length === 0) break;

    for (const entry of data) {
      const path = prefix ? `${prefix}/${entry.name}` : entry.name;
      // Supabase Storage: folders have id === null
      if (entry.id === null) {
        const nested = await listAllFilePaths(supabase, bucket, path);
        paths.push(...nested);
      } else {
        paths.push(path);
      }
    }

    if (data.length < PAGE_SIZE) break;
    offset += PAGE_SIZE;
  }

  return paths;
}

/**
 * Download all objects from known public media buckets into a JSZip under storage/.
 */
export async function addStorageBucketsToZip(
  supabase: AdminClient,
  zip: JSZip,
): Promise<{ objectCount: number }> {
  let objectCount = 0;

  for (const bucket of BACKUP_STORAGE_BUCKETS) {
    const paths = await listAllFilePaths(supabase, bucket);
    for (const path of paths) {
      const { data, error } = await supabase.storage.from(bucket).download(path);
      if (error || !data) {
        throw new Error(
          `Failed to download ${bucket}/${path}: ${error?.message ?? "empty"}`,
        );
      }
      const buffer = Buffer.from(await data.arrayBuffer());
      zip.file(`storage/${bucket}/${path}`, buffer);
      objectCount += 1;
    }
  }

  return { objectCount };
}
