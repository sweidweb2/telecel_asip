/**
 * Build source-backed cohort and Insights covers from the supplied FSD slides.
 *
 * Usage:
 *   npm run seed:asip-cms-media
 */
import { mkdir } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const OUTPUT_ROOT = new URL("../public/insights/source-seed/", import.meta.url);
const SOURCE_ROOT = new URL(
  "../Docs/[05] Guy Data/02 Cohorts, Applications & Portfolio/",
  import.meta.url,
);

const COVERS = [
  { year: 2021, source: "FSD Slides2021-01.jpg" },
  { year: 2022, source: "FSD Slides 2022-01.jpg" },
  { year: 2023, source: "FSD Slides-cohort 3-01.jpg" },
  { year: 2024, source: "FSD Slides4-01.jpg" },
];

await mkdir(OUTPUT_ROOT, { recursive: true });

for (const cover of COVERS) {
  const source = fileURLToPath(new URL(cover.source, SOURCE_ROOT));
  const output = fileURLToPath(new URL(`cohort-${cover.year}.webp`, OUTPUT_ROOT));
  await sharp(source)
    .rotate()
    .resize(1600, 900, { fit: "cover", position: "centre" })
    .webp({ quality: 84, effort: 5 })
    .toFile(output);
}

console.log(`Built ${COVERS.length} source-backed CMS covers.`);
