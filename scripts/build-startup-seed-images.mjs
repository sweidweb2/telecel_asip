/**
 * Build normalized startup cover images from the company profile pages in the
 * source PDFs under Docs/[05] Guy Data.
 *
 * Requires Poppler's `pdftoppm` on PATH (or PDFTOPPM_PATH) and writes stable
 * 1600x1000 WebP assets to public/startups/source-seed/.
 */
import { execFile } from "node:child_process";
import { mkdtemp, mkdir, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { basename, join } from "node:path";
import { promisify } from "node:util";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const execFileAsync = promisify(execFile);
const REPO_ROOT = fileURLToPath(new URL("../", import.meta.url));
const PROVENANCE_PATH = new URL(
  "../data/seed/provenance/startup-source-records.json",
  import.meta.url,
);
const OUTPUT_ROOT = fileURLToPath(
  new URL("../public/startups/source-seed/", import.meta.url),
);
const PDFTOPPM = process.env.PDFTOPPM_PATH?.trim() || "pdftoppm";
const WIDTH = 1600;
const HEIGHT = 1000;

const SOURCE_LAYOUTS = new Map([
  [
    "ASIP DD Booklet FINAL_2021.pdf",
    { kind: "logo", left: 0.67, top: 0.07, width: 0.26, height: 0.24 },
  ],
  [
    "ASIP Program Report 2022 (1).pdf",
    { kind: "photo", left: 0.515, top: 0.15, width: 0.4, height: 0.43 },
  ],
  [
    "ASIP DD Booklet 2023 English_.pdf",
    { kind: "photo", left: 0.665, top: 0.2, width: 0.333, height: 0.625 },
  ],
  [
    "ASIP DD Booklet C4.pdf",
    { kind: "photo", left: 0.71, top: 0.22, width: 0.29, height: 0.58 },
  ],
]);

const STARTUP_LAYOUT_OVERRIDES = new Map([
  ["agrix-tech", { left: 0.77, top: 0.1, width: 0.14, height: 0.18 }],
  [
    "ags-tribe-herconomy",
    { left: 0.64, top: 0.05, width: 0.28, height: 0.35 },
  ],
  [
    "chekkit-technologies",
    { left: 0.73, top: 0.08, width: 0.15, height: 0.2 },
  ],
  ["dawa-health", { left: 0.77, top: 0.07, width: 0.14, height: 0.21 }],
  ["motito", { left: 0.68, top: 0.08, width: 0.23, height: 0.15 }],
  ["nucleus-is", { left: 0.65, top: 0.08, width: 0.29, height: 0.16 }],
  ["thumeza", { left: 0.72, top: 0.08, width: 0.18, height: 0.18 }],
  ["ustacky", { left: 0.65, top: 0.08, width: 0.26, height: 0.15 }],
  ["weza-ventures", { left: 0.7, top: 0.07, width: 0.22, height: 0.18 }],
  [
    "worldbay-technologies-grocedy",
    { left: 0.73, top: 0.05, width: 0.21, height: 0.26 },
  ],
]);

function cropBox(metadata, layout) {
  const left = Math.round(metadata.width * layout.left);
  const top = Math.round(metadata.height * layout.top);
  const width = Math.min(
    metadata.width - left,
    Math.round(metadata.width * layout.width),
  );
  const height = Math.min(
    metadata.height - top,
    Math.round(metadata.height * layout.height),
  );
  return { left, top, width, height };
}

async function renderCover(input, output, layout) {
  const inputBytes = await readFile(input);
  const metadata = await sharp(inputBytes).metadata();
  if (!metadata.width || !metadata.height) {
    throw new Error(`Could not read rendered PDF page: ${input}`);
  }

  const cropped = await sharp(inputBytes)
    .extract(cropBox(metadata, layout))
    .png()
    .toBuffer();
  if (layout.kind === "logo") {
    const logo = await sharp(cropped)
      .trim({ background: "#ffffff", threshold: 12 })
      .resize({ width: 880, height: 620, fit: "inside" })
      .png()
      .toBuffer();
    const logoMetadata = await sharp(logo).metadata();
    await sharp({
      create: {
        width: WIDTH,
        height: HEIGHT,
        channels: 3,
        background: "#f3f7f6",
      },
    })
      .composite([
        {
          input: logo,
          left: Math.round((WIDTH - logoMetadata.width) / 2),
          top: Math.round((HEIGHT - logoMetadata.height) / 2),
        },
      ])
      .webp({ quality: 84 })
      .toFile(output);
    return;
  }

  const background = await sharp(cropped)
    .resize(WIDTH, HEIGHT, { fit: "cover" })
    .blur(28)
    .modulate({ brightness: 0.72, saturation: 0.9 })
    .toBuffer();
  const foreground = await sharp(cropped)
    .resize(WIDTH, HEIGHT, {
      fit: "contain",
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    })
    .toBuffer();
  await sharp(background)
    .composite([{ input: foreground, gravity: "center" }])
    .webp({ quality: 84 })
    .toFile(output);
}

async function main() {
  const provenance = JSON.parse(await readFile(PROVENANCE_PATH, "utf8"));
  const recordsBySlug = new Map();
  for (const record of provenance.records) {
    // Agrodata appears in two reports; the later record includes a real photo.
    recordsBySlug.set(record.startup_slug, record);
  }

  await mkdir(OUTPUT_ROOT, { recursive: true });
  const tempRoot = await mkdtemp(join(tmpdir(), "asip-startup-covers-"));
  try {
    for (const [slug, record] of recordsBySlug) {
      const sourceLayout = SOURCE_LAYOUTS.get(basename(record.source_file));
      if (!sourceLayout) {
        throw new Error(`No image layout for ${record.source_file}`);
      }
      const layout = {
        ...sourceLayout,
        ...STARTUP_LAYOUT_OVERRIDES.get(slug),
      };

      const pagePrefix = join(tempRoot, slug);
      await execFileAsync(PDFTOPPM, [
        "-f",
        String(record.source_page),
        "-l",
        String(record.source_page),
        "-singlefile",
        "-jpeg",
        "-jpegopt",
        "quality=95",
        "-r",
        "240",
        join(REPO_ROOT, record.source_file),
        pagePrefix,
      ]);
      await renderCover(
        `${pagePrefix}.jpg`,
        join(OUTPUT_ROOT, `${slug}.webp`),
        layout,
      );
      console.log(`Built ${slug}.webp from page ${record.source_page}`);
    }
  } finally {
    await rm(tempRoot, {
      recursive: true,
      force: true,
      maxRetries: 5,
      retryDelay: 150,
    });
  }

  console.log(`Built ${recordsBySlug.size} startup cover images.`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
