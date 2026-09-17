/** Build the source-backed Impact covers from Cohort 4 report portraits. */
import { mkdir } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const INPUT_ROOT = new URL("../tmp/pdfs/impact-case-studies/", import.meta.url);
const OUTPUT_ROOT = new URL("../public/impact/source-seed/", import.meta.url);
const covers = [
  { page: "page-37.png", slug: "betapawa-solutions" },
  { page: "page-38.png", slug: "messenger" },
  { page: "page-39.png", slug: "ostafandy" },
];

await mkdir(fileURLToPath(OUTPUT_ROOT), { recursive: true });
for (const cover of covers) {
  const source = fileURLToPath(new URL(cover.page, INPUT_ROOT));
  const output = fileURLToPath(new URL(`${cover.slug}.webp`, OUTPUT_ROOT));
  const portrait = await sharp(source)
    .extract({ left: 0, top: 540, width: 535, height: 1500 })
    .png()
    .toBuffer();
  const background = await sharp(portrait)
    .resize(1600, 900, { fit: "cover" })
    .blur(18)
    .modulate({ brightness: 0.55 })
    .png()
    .toBuffer();
  const foreground = await sharp(portrait)
    .resize({ height: 900 })
    .png()
    .toBuffer();
  await sharp(background)
    .composite([{ input: foreground, gravity: "centre" }])
    .webp({ quality: 88, effort: 6 })
    .toFile(output);
  console.log(`Built ${output}`);
}
