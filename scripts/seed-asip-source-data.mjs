/**
 * Seed the source-backed ASIP programme dataset extracted from Docs/[05] Guy Data.
 *
 * Idempotently seeds public-safe startup fields, four accelerator cohorts and
 * cohort memberships, plus evidence-backed impact metrics. Contact emails and
 * raw source text remain in data/seed/asip-programme.json and are not inserted.
 *
 * Usage:
 *   node --env-file=.env --env-file=.env.local scripts/seed-asip-source-data.mjs
 */
import { readFile } from "node:fs/promises";
import { createClient } from "@supabase/supabase-js";

const DATA_URL = new URL("../data/seed/asip-programme.json", import.meta.url);
const EVIDENCE_PREFIX = "[ASIP SOURCE SEED]";

function requireEnv(name) {
  const value = process.env[name]?.trim();
  if (!value) throw new Error(`Missing required environment variable: ${name}`);
  return value;
}

async function seedStartups(supabase, startups) {
  const slugToId = new Map();
  for (const startup of startups) {
    const core = {
      name: startup.name,
      slug: startup.slug,
      description: startup.description,
      status: startup.status,
      founded_at: startup.founded_at,
    };
    const { data: row, error } = await supabase
      .from("startups")
      .upsert(core, { onConflict: "slug" })
      .select("id, slug")
      .single();
    if (error) throw new Error(`Startup ${startup.slug}: ${error.message}`);

    const { error: detailsError } = await supabase
      .from("startup_details")
      .upsert({ startup_id: row.id, ...startup.details }, {
        onConflict: "startup_id",
      });
    if (detailsError) {
      throw new Error(`Startup details ${startup.slug}: ${detailsError.message}`);
    }
    slugToId.set(row.slug, row.id);
  }
  return slugToId;
}

async function seedCohorts(supabase, cohorts, slugToId) {
  for (const cohort of cohorts) {
    const { data: row, error } = await supabase
      .from("cohorts")
      .upsert(
        {
          year: cohort.year,
          public_label: cohort.public_label,
          programme_dates_start: cohort.programme_dates_start,
          programme_dates_end: cohort.programme_dates_end,
          programme_status: cohort.programme_status,
          summary: cohort.summary,
          publish_status: cohort.publish_status,
        },
        { onConflict: "year,public_label" },
      )
      .select("id")
      .single();
    if (error) throw new Error(`Cohort ${cohort.year}: ${error.message}`);

    const { error: deleteError } = await supabase
      .from("cohort_startups")
      .delete()
      .eq("cohort_id", row.id);
    if (deleteError) throw new Error(`Cohort links ${cohort.year}: ${deleteError.message}`);

    const links = cohort.startup_slugs.map((slug) => ({
      cohort_id: row.id,
      startup_id: slugToId.get(slug),
    }));
    if (links.some((link) => !link.startup_id)) {
      throw new Error(`Cohort ${cohort.year} references an unknown startup slug`);
    }
    const { error: linksError } = await supabase.from("cohort_startups").insert(links);
    if (linksError) throw new Error(`Cohort links ${cohort.year}: ${linksError.message}`);
  }
}

async function seedImpactMetrics(supabase, metrics) {
  const adminEmail = process.env.ASIP_SEED_ADMIN_EMAIL?.trim() || "asweid657@gmail.com";
  const { data: owner, error: ownerError } = await supabase
    .from("profiles")
    .select("id")
    .eq("email", adminEmail)
    .single();
  if (ownerError) throw new Error(`Evidence owner ${adminEmail}: ${ownerError.message}`);

  for (const metric of metrics) {
    const primarySource = `${EVIDENCE_PREFIX} ${metric.source_file}, page ${metric.source_page}`;
    let { data: evidence, error: evidenceError } = await supabase
      .from("evidence_records")
      .select("id")
      .eq("primary_source", primarySource)
      .maybeSingle();
    if (evidenceError) throw new Error(`Evidence lookup: ${evidenceError.message}`);
    if (!evidence) {
      const result = await supabase
        .from("evidence_records")
        .insert({
          primary_source: primarySource,
          measurement_period_start: metric.period_start,
          measurement_period_end: metric.period_end,
          owner_id: owner.id,
          status: "pending",
          last_verified_date: new Date().toISOString().slice(0, 10),
          permission: "internal_only",
          review_date: new Date().toISOString().slice(0, 10),
        })
        .select("id")
        .single();
      if (result.error) throw new Error(`Evidence insert: ${result.error.message}`);
      evidence = result.data;
    }

    const { data: existing, error: lookupError } = await supabase
      .from("impact_metrics")
      .select("id")
      .eq("claim_label", metric.claim_label)
      .eq("period_end", metric.period_end)
      .maybeSingle();
    if (lookupError) throw new Error(`Metric lookup: ${lookupError.message}`);
    const payload = {
      claim_label: metric.claim_label,
      value: metric.value,
      unit: metric.unit,
      period_start: metric.period_start,
      period_end: metric.period_end,
      geography: metric.geography,
      impact_lens: metric.impact_lens,
      display_locations: metric.display_locations,
      evidence_id: evidence.id,
      publish_status: metric.publish_status,
    };
    const operation = existing
      ? supabase.from("impact_metrics").update(payload).eq("id", existing.id)
      : supabase.from("impact_metrics").insert(payload);
    const { error } = await operation;
    if (error) throw new Error(`Metric ${metric.claim_label}: ${error.message}`);
  }
}

async function main() {
  const payload = JSON.parse(await readFile(DATA_URL, "utf8"));
  const supabase = createClient(
    requireEnv("NEXT_PUBLIC_SUPABASE_URL"),
    requireEnv("SUPABASE_SERVICE_ROLE_KEY"),
    { auth: { autoRefreshToken: false, persistSession: false } },
  );
  const slugToId = await seedStartups(supabase, payload.startups);
  await seedCohorts(supabase, payload.cohorts, slugToId);
  await seedImpactMetrics(supabase, payload.impact_metrics);
  console.log(
    `Seeded ${payload.startups.length} startups, ${payload.cohorts.length} cohorts, and ${payload.impact_metrics.length} impact metrics.`,
  );
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
