/** Public URL helpers for Supabase Storage objects. */

const PUBLIC_OBJECT_PREFIX = "/storage/v1/object/public/";

/** Public URL of an object, e.g. `${url}/storage/v1/object/public/partners/a/b.webp`. */
export function publicObjectUrl(
  supabaseUrl: string,
  bucket: string,
  path: string,
): string {
  return `${supabaseUrl}${PUBLIC_OBJECT_PREFIX}${bucket}/${path}`;
}

/**
 * Object path inside `bucket` for a public Storage URL, or `null` when the URL
 * is empty, malformed, or points at a different bucket. Guards deletes against
 * removing something this feature does not own.
 */
export function storagePathFromPublicUrl(
  url: string | null | undefined,
  bucket: string,
): string | null {
  if (!url) return null;
  const marker = `${PUBLIC_OBJECT_PREFIX}${bucket}/`;
  const index = url.indexOf(marker);
  if (index === -1) return null;
  const path = url.slice(index + marker.length);
  return path.length > 0 ? path : null;
}
