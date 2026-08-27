import sharp from "sharp";
import { describe, expect, it } from "vitest";

import {
  IMAGE_PRESETS,
  processImageBuffer,
} from "@/lib/media/process-image";

function isWebpBuffer(buffer: Buffer): boolean {
  return (
    buffer.length >= 12 &&
    buffer.subarray(0, 4).toString("ascii") === "RIFF" &&
    buffer.subarray(8, 12).toString("ascii") === "WEBP"
  );
}

describe("processImageBuffer", () => {
  it("encodes PNG input as WebP", async () => {
    const input = await sharp({
      create: {
        width: 64,
        height: 48,
        channels: 3,
        background: { r: 20, g: 120, b: 200 },
      },
    })
      .png()
      .toBuffer();

    const result = await processImageBuffer(input, "blogAvatar");

    expect(result.contentType).toBe("image/webp");
    expect(result.extension).toBe("webp");
    expect(isWebpBuffer(result.buffer)).toBe(true);
  });

  it("downscales widths above the preset max without enlarging small images", async () => {
    const oversized = await sharp({
      create: {
        width: IMAGE_PRESETS.blogCover.maxWidth + 400,
        height: 900,
        channels: 3,
        background: { r: 10, g: 10, b: 10 },
      },
    })
      .jpeg()
      .toBuffer();

    const processedLarge = await processImageBuffer(oversized, "blogCover");
    const largeMeta = await sharp(processedLarge.buffer).metadata();
    expect(largeMeta.width).toBe(IMAGE_PRESETS.blogCover.maxWidth);
    expect(isWebpBuffer(processedLarge.buffer)).toBe(true);

    const small = await sharp({
      create: {
        width: 120,
        height: 80,
        channels: 3,
        background: { r: 200, g: 50, b: 50 },
      },
    })
      .png()
      .toBuffer();

    const processedSmall = await processImageBuffer(small, "startupLogo");
    const smallMeta = await sharp(processedSmall.buffer).metadata();
    expect(smallMeta.width).toBe(120);
  });
});
