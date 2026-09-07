import type { z } from "zod";

export type RawSearchParams = Record<string, string | string[] | undefined>;

/** First value from a Next.js `searchParams` entry (string or string[]). */
export function firstSearchParam(
  value: string | string[] | undefined,
): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

/**
 * Build a plain string map from raw search params using per-key defaults.
 * Each key reads `firstSearchParam(input[key]) ?? defaults[key]`.
 */
export function pickSearchParams(
  input: RawSearchParams,
  defaults: Record<string, string>,
): Record<string, string> {
  const out: Record<string, string> = {};
  for (const [key, fallback] of Object.entries(defaults)) {
    out[key] = firstSearchParam(input[key]) ?? fallback;
  }
  return out;
}

/**
 * Parse admin list URL search params with a Zod schema and attach `pageSize`.
 */
export function parseAdminListQuery<
  TOutput extends Record<string, unknown>,
  TPageSize extends number,
>({
  input,
  schema,
  pageSize,
  defaults,
}: {
  input: RawSearchParams;
  schema: z.ZodType<TOutput>;
  pageSize: TPageSize;
  defaults: Record<string, string>;
}): TOutput & { pageSize: TPageSize } {
  const parsed = schema.parse(pickSearchParams(input, defaults));
  return { ...parsed, pageSize };
}
