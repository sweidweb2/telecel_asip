# Temporary admin performance tracker

**Enable:** set `ADMIN_PERF_TRACKING=true` in server env (see `.env.example`).

**Read results:** `/dashboard/performance` — table, request waterfall dialog, charts.
`cache_status=hit` means React.cache / request dedupe reused work; `miss` / `n_a` is real work.

**Teardown:**
1. New migration: `drop table public.admin_perf_events;`
2. Delete `lib/admin/perf/`, `data/admin-perf-events.ts`, performance route/components/actions
3. Unwrap `traceAsync` / `wrapCached` call sites; remove nav + `ROUTES.performance`
4. Update `Docs/[03] Database/schema.dbml` and `supabase-functions.md`
