/**
 * Build marketing-page photography from the supplied ASIP programme photos.
 * Replaces illustrated / mock-up visuals with real founders and events
 * (client review: authentic photography first, no synthetic people).
 *
 * Usage:
 *   npm run media:asip-marketing
 */
import { mkdir, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const OUTPUT_ROOT = new URL("../public/asip-media/", import.meta.url);
const SOURCE_ROOT = new URL(
  "../Docs/[05] Guy Data/06 Photos, Videos & Event Assets/",
  import.meta.url,
);

/** `position` is a sharp gravity/strategy for the crop. */
const PHOTOS = [
  // Founder pitching on the Accelerating Innovators stage — hero + eligibility.
  { source: "B-145.jpg", output: "founder-pitch.webp", width: 1920, height: 1280, position: "north" },
  // Rural Farmers Hub founder receiving a programme award — home outcomes.
  { source: "RFH.png", output: "outcome-award.webp", width: 1600, height: 1067, position: "attention" },
  // Founder celebrating with her team — home outcomes inset.
  { source: "WhatsApp Image 2021-09-30 at 17.40.41.jpeg", output: "outcome-celebrate.webp", width: 900, height: 900, position: "north" },
  // Founders heads-down in a working session — founders page / programme.
  { source: "IMG_3085.JPG", output: "founders-working.webp", width: 1600, height: 1067, position: "centre" },
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

for (const photo of PHOTOS) {
  const source = fileURLToPath(new URL(photo.source, SOURCE_ROOT));
  const output = fileURLToPath(new URL(photo.output, OUTPUT_ROOT));
  const bytes = await sharp(source, { limitInputPixels: false })
    .rotate()
    .resize(photo.width, photo.height, { fit: "cover", position: photo.position })
    .webp({ quality: 74, effort: 6 })
    .toBuffer();
  await writeWithRetry(output, bytes);
  console.log(`${photo.output}  ${(bytes.length / 1024).toFixed(0)} KB`);
}

console.log(`Built ${PHOTOS.length} marketing photos.`);
