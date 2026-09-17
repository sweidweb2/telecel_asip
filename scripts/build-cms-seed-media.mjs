/**
 * Build source-backed cohort and Insights covers from supplied programme photos.
 *
 * Usage:
 *   npm run seed:asip-cms-media
 */
import { mkdir, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const OUTPUT_ROOT = new URL("../public/insights/source-seed/", import.meta.url);
const SOURCE_ROOT = new URL(
  "../Docs/[05] Guy Data/06 Photos, Videos & Event Assets/",
  import.meta.url,
);

const COVERS = [
  {
    year: 2021,
    source: "WhatsApp Image 2021-09-30 at 17.40.41.jpeg",
    position: "north",
  },
  { year: 2022, source: "best group.png", position: "centre" },
  {
    year: 2023,
    source: "WhatsApp Image 2023-11-30 at 10.47.09_d1dabbb3.jpg",
    position: "centre",
  },
  { year: 2024, source: "705A8542.JPG", position: "centre" },
];

async function writeWithRetry(path, bytes) {
  let lastError;
  for (let attempt = 0; attempt < 8; attempt += 1) {
    try {
      await writeFile(path, bytes);
      return;
    } catch (error) {
      lastError = error;
      await new Promise((resolve) => setTimeout(resolve, 150 * (attempt + 1)));
    }
  }
  throw lastError;
}

await mkdir(OUTPUT_ROOT, { recursive: true });

for (const cover of COVERS) {
  const source = fileURLToPath(new URL(cover.source, SOURCE_ROOT));
  const output = fileURLToPath(new URL(`cohort-${cover.year}.webp`, OUTPUT_ROOT));
  const bytes = await sharp(source)
    .rotate()
    .resize(1600, 900, { fit: "cover", position: cover.position })
    .webp({ quality: 88, effort: 6 })
    .toBuffer();
  await writeWithRetry(output, bytes);
}

console.log(`Built ${COVERS.length} source-backed CMS covers.`);
