/**
 * Seed the source-backed ASIP programme dataset extracted from Docs/[05] Guy Data.
 *
 * Idempotently seeds public-safe startup fields, accelerator cohorts and their
 * relations, founder stories, programme articles, and evidence-backed impact
 * metrics. Source-derived covers and approved partner logos are validated and
 * uploaded to their existing public buckets. Other media is catalogued because
 * the current CMS has no generic media-library destination. Internal provenance
 * is never inserted.
 *
 * Usage:
 *   node --env-file=.env --env-file=.env.local scripts/seed-asip-source-data.mjs
 */
import { existsSync } from "node:fs";
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { createClient } from "@supabase/supabase-js";
import sharp from "sharp";

const SEED_ROOT = new URL("../data/seed/", import.meta.url);
const PUBLIC_ROOT = new URL("../public/", import.meta.url);
const EVIDENCE_PREFIX = "[ASIP SOURCE SEED]";

class SeedOnlyWebSocket {
  constructor() {
    throw new Error("Realtime is disabled for the ASIP seed process");
  }
}

for (const envFile of ["../.env", "../.env.local"]) {
  const envPath = fileURLToPath(new URL(envFile, import.meta.url));
  if (existsSync(envPath)) process.loadEnvFile(envPath);
}

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

async function uploadStartupCovers(supabase, startups) {
  const coverUrls = new Map();

  for (const startup of startups) {
    const filename = `startups/source-seed/${startup.slug}.webp`;
    const bytes = await readFile(new URL(filename, PUBLIC_ROOT));
    const metadata = await sharp(bytes).metadata();
    if (
      metadata.format !== "webp" ||
      metadata.width !== 1600 ||
      metadata.height !== 1000
    ) {
      throw new Error(
        `Startup cover ${filename} must be a valid 1600x1000 WebP image`,
      );
    }

    const objectPath = `seed/${startup.slug}/cover.webp`;
    const { error } = await supabase.storage
      .from("startups")
      .upload(objectPath, bytes, {
        contentType: "image/webp",
        cacheControl: "31536000",
        upsert: true,
      });
    if (error) throw new Error(`Startup cover ${startup.name}: ${error.message}`);

    const { data } = supabase.storage.from("startups").getPublicUrl(objectPath);
    coverUrls.set(startup.slug, data.publicUrl);
  }

  return coverUrls;
}

async function seedStartups(supabase, startups, coverUrls) {
  const slugToId = new Map();
  for (const startup of startups) {
    const core = {
      name: startup.name,
      slug: startup.slug,
      logo_url: startup.logo_url,
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
      .upsert(
        {
          startup_id: row.id,
          ...startup.details,
          cover_image_url:
            coverUrls.get(startup.slug) ?? startup.details.cover_image_url,
        },
        { onConflict: "startup_id" },
      );
    if (detailsError) {
      throw new Error(`Startup details ${startup.slug}: ${detailsError.message}`);
    }
    slugToId.set(row.slug, row.id);
  }
  return slugToId;
}

async function uploadPartnerLogos(supabase, partners) {
  const logoUrls = new Map();

  for (const partner of partners) {
    if (!partner.logo_url?.startsWith("/partners/")) continue;

    const filename = partner.logo_url.slice(1);
    const bytes = await readFile(new URL(filename, PUBLIC_ROOT));
    const metadata = await sharp(bytes).metadata();
    if (!metadata.width || !metadata.height || metadata.format !== "png") {
      throw new Error(`Partner logo ${filename} is not a valid PNG image`);
    }

    const objectPath = `seed/${partner.partner_key}.png`;
    const { error } = await supabase.storage
      .from("partners")
      .upload(objectPath, bytes, {
        contentType: "image/png",
        cacheControl: "31536000",
        upsert: true,
      });
    if (error) throw new Error(`Partner logo ${partner.name}: ${error.message}`);

    const { data } = supabase.storage.from("partners").getPublicUrl(objectPath);
    logoUrls.set(partner.partner_key, data.publicUrl);
  }

  return logoUrls;
}

async function uploadCmsCovers(supabase, blogs) {
  const coverUrls = new Map();

  for (const blog of blogs) {
    const filename = blog.cover_image_path;
    const bytes = await readFile(new URL(filename, PUBLIC_ROOT));
    const metadata = await sharp(bytes).metadata();
    if (
      metadata.format !== "webp" ||
      metadata.width !== 1600 ||
      metadata.height !== 900
    ) {
      throw new Error(`CMS cover ${filename} must be a valid 1600x900 WebP image`);
    }

    const objectPath = `seed/${blog.slug}/cover-v2.webp`;
    const { error } = await supabase.storage.from("blogs").upload(objectPath, bytes, {
      contentType: "image/webp",
      cacheControl: "31536000",
      upsert: true,
    });
    if (error) throw new Error(`CMS cover ${blog.slug}: ${error.message}`);

    const { data } = supabase.storage.from("blogs").getPublicUrl(objectPath);
    coverUrls.set(blog.cohort_key, data.publicUrl);
  }

  return coverUrls;
}

async function uploadFounderStoryCovers(supabase, stories) {
  const coverUrls = new Map();
  for (const story of stories) {
    const bytes = await readFile(new URL(story.cover_image_path, PUBLIC_ROOT));
    const metadata = await sharp(bytes).metadata();
    if (metadata.format !== "webp" || metadata.width !== 1600 || metadata.height !== 900) {
      throw new Error(`Founder story cover ${story.cover_image_path} must be a valid 1600x900 WebP image`);
    }
    const objectPath = `impact/${story.startup_slug}/cover.webp`;
    const { error } = await supabase.storage.from("startups").upload(objectPath, bytes, {
      contentType: "image/webp", cacheControl: "31536000", upsert: true,
    });
    if (error) throw new Error(`Founder story cover ${story.startup_slug}: ${error.message}`);
    const { data } = supabase.storage.from("startups").getPublicUrl(objectPath);
    coverUrls.set(story.startup_slug, data.publicUrl);
  }
  return coverUrls;
}

async function seedPartners(supabase, partners, logoUrls) {
  const partnerKeyToId = new Map();
  for (const partner of partners) {
    const payload = {
      name: partner.name,
      org: partner.org,
      type: partner.type,
      contribution: partner.contribution,
      is_active: partner.is_active,
      logo_permission: partner.logo_permission,
      logo_url: logoUrls.get(partner.partner_key) ?? partner.logo_url,
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
  cohortCoverUrls,
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
          media_url: cohortCoverUrls.get(cohort.cohort_key) ?? cohort.media_url,
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
  return cohortKeyToId;
}

async function seedFounderStories(supabase, stories, slugToId, coverUrls) {
  const legacySeedSlugs = [
    "10mg-pharma", "babimo", "edusko", "koritech", "lyfplus",
    "munakyalo-agrofresh", "primed-e-health",
  ];
  const legacyIds = legacySeedSlugs.map((slug) => slugToId.get(slug)).filter(Boolean);
  if (legacyIds.length > 0) {
    const { error: cleanupError } = await supabase
      .from("founder_stories").delete().in("startup_id", legacyIds);
    if (cleanupError) throw new Error(`Legacy founder stories: ${cleanupError.message}`);
  }

  for (const story of stories) {
    const startupId = slugToId.get(story.startup_slug);
    if (!startupId) throw new Error(`Unknown founder-story startup: ${story.startup_slug}`);

    const payload = {
      startup_id: startupId,
      story_title: story.story_title,
      cover_image_url: coverUrls.get(story.startup_slug),
      headline_stat: story.headline_stat,
      the_problem: story.the_problem,
      what_they_built: story.what_they_built,
      the_asip_connection: story.the_asip_connection,
      where_they_are_now: story.where_they_are_now,
      founder_quote_text: null,
      quote_attribution_name: null,
      quote_attribution_title: null,
      quote_date: null,
      quote_permission_status: story.quote_permission_status,
      publish_status: story.publish_status,
    };
    const { error } = await supabase
      .from("founder_stories")
      .upsert(payload, { onConflict: "startup_id" });
    if (error) throw new Error(`Founder story ${story.startup_slug}: ${error.message}`);
  }
}

async function seedBlogs(supabase, blogs, cohortKeyToId, coverUrls) {
  await supabase.from("blogs").update({ is_featured: false }).eq("is_featured", true);

  for (const blog of blogs) {
    const cohortId = cohortKeyToId.get(blog.cohort_key);
    if (!cohortId) throw new Error(`Unknown blog cohort: ${blog.cohort_key}`);
    const payload = {
      slug: blog.slug,
      title: blog.title,
      summary: blog.summary,
      body_html: blog.body_html,
      categories: blog.categories,
      thumbnail_url: coverUrls.get(blog.cohort_key),
      author_name: blog.author_name,
      author_avatar_url: null,
      status: blog.status,
      is_featured: blog.is_featured,
      reading_time_minutes: blog.reading_time_minutes,
      published_at: blog.published_at,
      startup_id: null,
      cohort_id: cohortId,
      sources: blog.sources,
      meta_title: blog.meta_title,
      meta_description: blog.meta_description,
    };
    const { error } = await supabase
      .from("blogs")
      .upsert(payload, { onConflict: "slug" });
    if (error) throw new Error(`Blog ${blog.slug}: ${error.message}`);
  }
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
    founderStories,
    blogs,
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
      readSeed("cms/founder-stories.json"),
      readSeed("cms/blogs.json"),
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
    {
      auth: { autoRefreshToken: false, persistSession: false },
      realtime: { transport: SeedOnlyWebSocket },
    },
  );
  const startupCoverUrls = await uploadStartupCovers(supabase, startups);
  const partnerLogoUrls = await uploadPartnerLogos(supabase, partners);
  const cmsCoverUrls = await uploadCmsCovers(supabase, blogs);
  const partnerKeyToId = await seedPartners(supabase, partners, partnerLogoUrls);
  const slugToId = await seedStartups(supabase, startups, startupCoverUrls);
  const cohortKeyToId = await seedCohorts(
    supabase,
    cohorts,
    cohortStartupRelations,
    cohortPartnerRelations,
    slugToId,
    partnerKeyToId,
    cmsCoverUrls,
  );
  await seedEvents(supabase, events, eventStartupRelations, slugToId);
  const founderStoryCoverUrls = await uploadFounderStoryCovers(supabase, founderStories);
  await seedFounderStories(supabase, founderStories, slugToId, founderStoryCoverUrls);
  await seedBlogs(supabase, blogs, cohortKeyToId, cmsCoverUrls);
  const evidenceKeyToId = await seedEvidence(supabase, evidenceRecords);
  await seedImpactMetrics(supabase, metrics, evidenceKeyToId);
  const mediaAssetCount = mediaGroups.reduce((total, group) => total + group.length, 0);
  console.log(
    `Seeded ${partners.length} partners, ${startups.length} startups, ${cohorts.length} cohorts, ${events.length} events, ${founderStories.length} founder stories, ${blogs.length} Insights articles, ${cohortStartupRelations.length + cohortPartnerRelations.length + eventStartupRelations.length} relations, and ${metrics.length} impact metrics. Uploaded ${startupCoverUrls.size} startup covers, ${cmsCoverUrls.size} CMS covers, and ${partnerLogoUrls.size} partner logos; catalogued ${mediaAssetCount} other media assets.`,
  );
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
