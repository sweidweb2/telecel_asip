/**
 * Seed the source-backed ASIP programme dataset extracted from Docs/[05] Guy Data.
 *
 * Idempotently seeds public-safe startup fields, accelerator cohorts and their
 * relations, plus evidence-backed impact metrics. Media is catalogued in the
 * categorized seed files and remains file-backed because the current CMS has no
 * generic media-library table. Internal provenance is never inserted.
 *
 * Usage:
 *   node --env-file=.env --env-file=.env.local scripts/seed-asip-source-data.mjs
 */
import { readFile } from "node:fs/promises";
import { createClient } from "@supabase/supabase-js";

const SEED_ROOT = new URL("../data/seed/", import.meta.url);
const EVIDENCE_PREFIX = "[ASIP SOURCE SEED]";

async function readSeed(path) {
  const payload = JSON.parse(await readFile(new URL(path, SEED_ROOT), "utf8"));
  if (!Array.isArray(payload.records)) {
    throw new Error(`Seed dataset ${path} must contain a records array`);
  }
  return payload.records;
}

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

async function seedPartners(supabase, partners) {
  const partnerKeyToId = new Map();
  for (const partner of partners) {
    const payload = {
      name: partner.name,
      org: partner.org,
      type: partner.type,
      contribution: partner.contribution,
      is_active: partner.is_active,
      logo_permission: partner.logo_permission,
      logo_url: partner.logo_url,
      link: partner.link,
      sort_order: partner.sort_order,
    };
    const { data: existing, error: lookupError } = await supabase
      .from("partners")
      .select("id")
      .eq("name", partner.name)
      .maybeSingle();
    if (lookupError) throw new Error(`Partner ${partner.name}: ${lookupError.message}`);
    const operation = existing
      ? supabase.from("partners").update(payload).eq("id", existing.id).select("id").single()
      : supabase.from("partners").insert(payload).select("id").single();
    const { data: row, error } = await operation;
    if (error) throw new Error(`Partner ${partner.name}: ${error.message}`);
    partnerKeyToId.set(partner.partner_key, row.id);
  }
  return partnerKeyToId;
}

async function seedCohorts(
  supabase,
  cohorts,
  startupRelations,
  partnerRelations,
  slugToId,
  partnerKeyToId,
) {
  const cohortKeyToId = new Map();
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

    cohortKeyToId.set(cohort.cohort_key, row.id);

    const { error: deleteError } = await supabase
      .from("cohort_startups")
      .delete()
      .eq("cohort_id", row.id);
    if (deleteError) throw new Error(`Cohort links ${cohort.year}: ${deleteError.message}`);

    const { error: partnerDeleteError } = await supabase
      .from("cohort_partners")
      .delete()
      .eq("cohort_id", row.id);
    if (partnerDeleteError) {
      throw new Error(`Cohort partner links ${cohort.year}: ${partnerDeleteError.message}`);
    }

  }

  const links = startupRelations.map((relation) => ({
    cohort_id: cohortKeyToId.get(relation.cohort_key),
    startup_id: slugToId.get(relation.startup_slug),
  }));
  if (links.some((link) => !link.cohort_id || !link.startup_id)) {
    throw new Error("A cohort/startup relation references an unknown seed key");
  }
  const { error: linksError } = await supabase.from("cohort_startups").insert(links);
  if (linksError) throw new Error(`Cohort links: ${linksError.message}`);

  const partnerLinks = partnerRelations.map((relation) => ({
    cohort_id: cohortKeyToId.get(relation.cohort_key),
    partner_id: partnerKeyToId.get(relation.partner_key),
  }));
  if (partnerLinks.some((link) => !link.cohort_id || !link.partner_id)) {
    throw new Error("A cohort/partner relation references an unknown seed key");
  }
  const { error: partnerLinksError } = await supabase
    .from("cohort_partners")
    .insert(partnerLinks);
  if (partnerLinksError) throw new Error(`Cohort partner links: ${partnerLinksError.message}`);
}

async function seedEvents(supabase, events, relations, slugToId) {
  const eventKeyToId = new Map();
  for (const event of events) {
    const payload = {
      name: event.name,
      event_date: event.event_date,
      location: event.location,
      format: event.format,
      speakers: event.speakers,
      assets: event.assets,
      outcomes: event.outcomes,
      publish_status: event.publish_status,
    };
    const { data: existing, error: lookupError } = await supabase
      .from("events")
      .select("id")
      .eq("name", event.name)
      .eq("event_date", event.event_date)
      .maybeSingle();
    if (lookupError) throw new Error(`Event ${event.name}: ${lookupError.message}`);
    const operation = existing
      ? supabase.from("events").update(payload).eq("id", existing.id).select("id").single()
      : supabase.from("events").insert(payload).select("id").single();
    const { data: row, error } = await operation;
    if (error) throw new Error(`Event ${event.name}: ${error.message}`);
    eventKeyToId.set(event.event_key, row.id);
    const { error: deleteError } = await supabase
      .from("event_startups")
      .delete()
      .eq("event_id", row.id);
    if (deleteError) throw new Error(`Event links ${event.name}: ${deleteError.message}`);
  }

  const links = relations.map((relation) => ({
    event_id: eventKeyToId.get(relation.event_key),
    startup_id: slugToId.get(relation.startup_key),
  }));
  if (links.some((link) => !link.event_id || !link.startup_id)) {
    throw new Error("An event/startup relation references an unknown seed key");
  }
  const { error } = await supabase.from("event_startups").insert(links);
  if (error) throw new Error(`Event links: ${error.message}`);
}

async function seedEvidence(supabase, evidenceRecords) {
  const evidenceKeyToId = new Map();
  for (const record of evidenceRecords) {
    const ownerEmail =
      process.env.ASIP_SEED_ADMIN_EMAIL?.trim() || record.owner_email;
    const { data: owner, error: ownerError } = await supabase
      .from("profiles")
      .select("id")
      .eq("email", ownerEmail)
      .single();
    if (ownerError) {
      throw new Error(`Evidence owner ${ownerEmail}: ${ownerError.message}`);
    }
    const primarySource = `${EVIDENCE_PREFIX} ${record.primary_source}`;
    const evidencePayload = {
      primary_source: primarySource,
      source_file_url: record.source_file_url,
      measurement_period_start: record.measurement_period_start,
      measurement_period_end: record.measurement_period_end,
      owner_id: owner.id,
      status: record.status,
      last_verified_date: record.last_verified_date,
      permission: record.permission,
      review_date: record.review_date,
    };
    let { data: evidence, error: evidenceError } = await supabase
      .from("evidence_records")
      .select("id")
      .eq("primary_source", primarySource)
      .maybeSingle();
    if (evidenceError) throw new Error(`Evidence lookup: ${evidenceError.message}`);
    if (!evidence) {
      const result = await supabase
        .from("evidence_records")
        .insert(evidencePayload)
        .select("id")
        .single();
      if (result.error) throw new Error(`Evidence insert: ${result.error.message}`);
      evidence = result.data;
    } else {
      const result = await supabase
        .from("evidence_records")
        .update(evidencePayload)
        .eq("id", evidence.id)
        .select("id")
        .single();
      if (result.error) throw new Error(`Evidence update: ${result.error.message}`);
      evidence = result.data;
    }
    evidenceKeyToId.set(record.evidence_key, evidence.id);
  }
  return evidenceKeyToId;
}

async function seedImpactMetrics(supabase, metrics, evidenceKeyToId) {
  for (const metric of metrics) {
    const evidenceId = evidenceKeyToId.get(metric.evidence_key);
    if (!evidenceId) throw new Error(`Unknown evidence key: ${metric.evidence_key}`);
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
      evidence_id: evidenceId,
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
  const [
    startups,
    partners,
    cohorts,
    cohortStartupRelations,
    cohortPartnerRelations,
    events,
    eventStartupRelations,
    evidenceRecords,
    metrics,
    ...mediaGroups
  ] =
    await Promise.all([
      readSeed("cms/startups.json"),
      readSeed("cms/partners.json"),
      readSeed("cms/cohorts.json"),
      readSeed("relations/cohort-startups.json"),
      readSeed("relations/cohort-partners.json"),
      readSeed("cms/events.json"),
      readSeed("relations/event-startups.json"),
      readSeed("cms/evidence-records.json"),
      readSeed("cms/impact-metrics.json"),
      readSeed("media/partner-logos.json"),
      readSeed("media/cohort-slides.json"),
      readSeed("media/event-media.json"),
      readSeed("media/source-reports.json"),
    ]);
  const supabase = createClient(
    requireEnv("NEXT_PUBLIC_SUPABASE_URL"),
    requireEnv("SUPABASE_SERVICE_ROLE_KEY"),
    { auth: { autoRefreshToken: false, persistSession: false } },
  );
  const partnerKeyToId = await seedPartners(supabase, partners);
  const slugToId = await seedStartups(supabase, startups);
  await seedCohorts(
    supabase,
    cohorts,
    cohortStartupRelations,
    cohortPartnerRelations,
    slugToId,
    partnerKeyToId,
  );
  await seedEvents(supabase, events, eventStartupRelations, slugToId);
  const evidenceKeyToId = await seedEvidence(supabase, evidenceRecords);
  await seedImpactMetrics(supabase, metrics, evidenceKeyToId);
  const mediaAssetCount = mediaGroups.reduce((total, group) => total + group.length, 0);
  console.log(
    `Seeded ${partners.length} partners, ${startups.length} startups, ${cohorts.length} cohorts, ${events.length} events, ${cohortStartupRelations.length + cohortPartnerRelations.length + eventStartupRelations.length} relations, and ${metrics.length} impact metrics. Catalogued ${mediaAssetCount} media assets.`,
  );
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
