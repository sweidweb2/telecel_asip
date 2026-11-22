/**
 * One-off: upload logos from public/logos into Storage the same way
 * uploadStartupLogo / uploadVersionedPublicImage does (process → WebP,
 * versioned path, upsert:false, long cacheControl, DB update, delete previous).
 *
 * Usage (from repo root):
 *   node --env-file=.env --env-file=.env.local scripts/upload-startup-logos-from-public.mjs
 *   node --env-file=.env --env-file=.env.local scripts/upload-startup-logos-from-public.mjs --dry-run
 */
import { createClient } from "@supabase/supabase-js";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { basename, extname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { customAlphabet } from "nanoid";
import sharp from "sharp";

const REPO_ROOT = fileURLToPath(new URL("../", import.meta.url));
const LOGOS_DIR = join(REPO_ROOT, "public", "logos");
const BUCKET = "startups";
const MAX_BYTES = 10 * 1024 * 1024;
const WEBP_QUALITY = 80;
const STARTUP_LOGO_MAX_WIDTH = 512;
const CACHE_CONTROL = "31536000";
const nanoid10 = customAlphabet(
  "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz",
  10,
);

/** Explicit filename → remote startup name (not E2E drafts). */
const LOGO_TO_STARTUP_NAME = {
  "01_A.png": "Agrix Tech",
  "02_Herconomy.png": "AGS Tribe / Herconomy",
  "03_Dawa_Health.png": "Dawa Health",
  "04_Motito.png": "Motito",
  "05_NucleusIS.png": "Nucleus IS",
  "06_Thumeza.png": "Thumeza",
  "07_Ustacky.png": "Ustacky",
  "08_Weza.png": "Weza Ventures",
  "09_Grocedy.png": "Worldbay Technologies / Grocedy",
  "10_PharmaServ.png": "PharmaServ",
  "11_Rural_Farmers_Hub.png": "Rural Farmers Hub",
  "12_Safetrack.png": "SafeTrack (COGNX)",
  "13_Sodishop.png": "Sodishop",
  "14_Vooli.png": "Vooli Mobile Insurance",
  "15_Parcsmart.png": "ParcSmart",
  "16_Limawa.png": "Limawa",
  "17_Kyanda.png": "Kyanda",
  "18_eCampus.png": "eCampus LLC",
  "19_Crowdyvest.png": "Crowdyvest",
  "20_Chestify_AI.png": "Chestify AI",
  "21_Proxalys.png": "Proxalys",
  "22_Parkwell.png": "Parkwell",
  "23_Yoonema.jpg": "Yoonema",
  "24_Qataloog.png": "Qataloog",
  "25_Powerstove.png": "Powerstove Energy",
  "26_Ecomak_Recyclers.png": "Ecomak Recyclers",
  "27_BD_Waste.jpg": "BD Waste",
  "28_Neural_Labs_Africa.jpg": "Neural Labs Africa",
  "29_Cargoplug.png": "CargoPlug",
  // No matching row in remote startups (kept for reporting).
  "30_Sobridge.png": null,
  "31_10mg_Pharma.jpg": "10mg Pharma",
  "32_Kori_Tech.png": "KoriTech",
  "33_Ostafandy.png": "Ostafandy",
  "34_Messenger.png": "Messenger",
  "35_Munakyalo_Agrofresh.jpg": "Munakyalo Agrofresh",
  "36_Primed_E-Health.png": "Primed E-Health",
  "37_Lyf_Plus.png": "LyfPlus",
  // Product brand on betasunlight.com; CMS name is BETAPAWA Solutions.
  "38_BetaSunlight.png": "BETAPAWA Solutions",
  "39_Babimo.png": "Babimo",
  "40_Edusko.png": "Edusko",
};

function loadEnvFiles() {
  for (const name of [".env", ".env.local"]) {
    const path = resolve(REPO_ROOT, name);
    if (!existsSync(path)) continue;
    for (const rawLine of readFileSync(path, "utf8").split(/\r?\n/)) {
      const line = rawLine.trim();
      if (!line || line.startsWith("#")) continue;
      const eq = line.indexOf("=");
      if (eq === -1) continue;
      const key = line.slice(0, eq).trim();
      let value = line.slice(eq + 1).trim();
      if (
        (value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))
      ) {
        value = value.slice(1, -1);
      }
      if (!process.env[key]) process.env[key] = value;
    }
  }
}

function mimeFromExt(filePath) {
  const ext = extname(filePath).toLowerCase();
  if (ext === ".png") return "image/png";
  if (ext === ".jpg" || ext === ".jpeg") return "image/jpeg";
  if (ext === ".webp") return "image/webp";
  if (ext === ".gif") return "image/gif";
  return null;
}

function publicObjectUrl(supabaseUrl, bucket, path) {
  return `${supabaseUrl}/storage/v1/object/public/${bucket}/${path}`;
}

function storagePathFromPublicUrl(url, bucket) {
  if (!url) return null;
  const marker = `/storage/v1/object/public/${bucket}/`;
  const index = url.indexOf(marker);
  if (index === -1) return null;
  const path = url.slice(index + marker.length);
  return path.length > 0 ? path : null;
}

async function processStartupLogo(buffer) {
  const out = await sharp(buffer)
    .rotate()
    .resize({
      width: STARTUP_LOGO_MAX_WIDTH,
      withoutEnlargement: true,
    })
    .webp({ quality: WEBP_QUALITY })
    .toBuffer();
  return { buffer: out, contentType: "image/webp", extension: "webp" };
}

async function uploadOne(supabase, supabaseUrl, startup, filePath) {
  const raw = readFileSync(filePath);
  const mime = mimeFromExt(filePath);
  if (!mime || raw.byteLength <= 0 || raw.byteLength > MAX_BYTES) {
    throw new Error(`invalid image (${basename(filePath)})`);
  }

  const processed = await processStartupLogo(raw);
  const path = `${startup.id}/${nanoid10()}.${processed.extension}`;

  const { error: uploadError } = await supabase.storage
    .from(BUCKET)
    .upload(path, processed.buffer, {
      contentType: processed.contentType,
      upsert: false,
      cacheControl: CACHE_CONTROL,
    });
  if (uploadError) {
    throw new Error(`storage upload: ${uploadError.message}`);
  }

  const publicUrl = publicObjectUrl(supabaseUrl, BUCKET, path);
  const { data: updated, error: updateError } = await supabase
    .from("startups")
    .update({ logo_url: publicUrl })
    .eq("id", startup.id)
    .select("id")
    .maybeSingle();

  if (updateError || !updated) {
    await supabase.storage.from(BUCKET).remove([path]);
    throw new Error(
      updateError?.message ?? "DB update matched zero rows; rolled back object",
    );
  }

  const previousPath = storagePathFromPublicUrl(startup.logo_url, BUCKET);
  if (previousPath) {
    const { error: removeError } = await supabase.storage
      .from(BUCKET)
      .remove([previousPath]);
    if (removeError) {
      console.warn(
        `  warn: could not remove previous object ${previousPath}: ${removeError.message}`,
      );
    }
  }

  return publicUrl;
}

async function main() {
  loadEnvFiles();
  const dryRun = process.argv.includes("--dry-run");
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
  if (!supabaseUrl || !serviceKey) {
    throw new Error(
      "Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY",
    );
  }

  const supabase = createClient(supabaseUrl, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const { data: startups, error } = await supabase
    .from("startups")
    .select("id, name, slug, logo_url")
    .not("name", "like", "E2E%")
    .order("name");
  if (error) throw new Error(error.message);

  const byName = new Map(startups.map((row) => [row.name, row]));
  const filesOnDisk = new Set(
    readdirSync(LOGOS_DIR).filter((name) => !name.startsWith(".")),
  );

  const mapped = [];
  const skippedNoStartup = [];
  const missingFiles = [];

  for (const [fileName, startupName] of Object.entries(LOGO_TO_STARTUP_NAME)) {
    if (!filesOnDisk.has(fileName)) {
      missingFiles.push(fileName);
      continue;
    }
    if (!startupName) {
      skippedNoStartup.push(fileName);
      continue;
    }
    const startup = byName.get(startupName);
    if (!startup) {
      skippedNoStartup.push(`${fileName} → missing DB row "${startupName}"`);
      continue;
    }
    mapped.push({ fileName, startup });
  }

  const mappedNames = new Set(mapped.map((m) => m.startup.name));
  const startupsWithoutLogoFile = startups
    .map((s) => s.name)
    .filter((name) => !mappedNames.has(name));

  console.log(`Mapped uploads: ${mapped.length}`);
  for (const { fileName, startup } of mapped) {
    console.log(`  ${fileName} → ${startup.name} (${startup.slug})`);
  }
  if (skippedNoStartup.length) {
    console.log("\nSkipped (no matching startup):");
    for (const item of skippedNoStartup) console.log(`  ${item}`);
  }
  if (startupsWithoutLogoFile.length) {
    console.log("\nStartups with no logo file in mapping:");
    for (const name of startupsWithoutLogoFile) console.log(`  ${name}`);
  }
  if (missingFiles.length) {
    console.log("\nMapped filenames missing on disk:");
    for (const name of missingFiles) console.log(`  ${name}`);
  }

  if (dryRun) {
    console.log("\nDry run only — no uploads.");
    return;
  }

  console.log("\nUploading…");
  let ok = 0;
  let failed = 0;
  for (const { fileName, startup } of mapped) {
    const filePath = join(LOGOS_DIR, fileName);
    try {
      const url = await uploadOne(supabase, supabaseUrl, startup, filePath);
      ok += 1;
      console.log(`  ok  ${startup.name} ← ${fileName}`);
      console.log(`      ${url}`);
    } catch (err) {
      failed += 1;
      console.error(
        `  FAIL ${startup.name} ← ${fileName}: ${err instanceof Error ? err.message : err}`,
      );
    }
  }

  console.log(`\nDone. ${ok} uploaded, ${failed} failed.`);
  if (failed > 0) process.exitCode = 1;
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
});
