/**
 * Wrap a list read that runs outside a request (`generateStaticParams`,
 * `sitemap`). These surfaces only pre-compute URLs — the pages themselves are
 * rendered on demand — so a database that is unreachable at build time should
 * degrade to an empty list instead of failing the build. CI builds with
 * placeholder Supabase credentials rely on this (see also
 * `createPublicClient` stubbing `placeholder.supabase.co`).
 *
 * Never use this for reads that a page renders: those must still throw against
 * a real Supabase host. Placeholder-host page reads are stubbed in
 * `lib/supabase/public.ts` instead.
 */
export async function safePrerenderList<T>(
  label: string,
  read: () => Promise<T[]>,
): Promise<T[]> {
  try {
    return await read();
  } catch (error) {
    console.warn(`[prerender] ${label} unavailable at build time`, error);
    return [];
  }
}
