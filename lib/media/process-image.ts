import sharp from "sharp";

export const IMAGE_PRESETS = {
  blogCover: { maxWidth: 1600 },
  blogAvatar: { maxWidth: 512 },
  startupLogo: { maxWidth: 512 },
  partnerLogo: { maxWidth: 512 },
} as const;

export type ImagePreset = keyof typeof IMAGE_PRESETS;

export const WEBP_QUALITY = 80;

export type ProcessedImage = {
  buffer: Buffer;
  contentType: "image/webp";
  extension: "webp";
};

/**
 * Resize (no upscale) and encode as WebP for Storage uploads.
 * Animated GIFs are flattened to a static first frame.
 */
export async function processImageBuffer(
  input: Buffer,
  preset: ImagePreset,
): Promise<ProcessedImage> {
  const { maxWidth } = IMAGE_PRESETS[preset];

  const buffer = await sharp(input)
    .rotate()
    .resize({
      width: maxWidth,
      withoutEnlargement: true,
    })
    .webp({ quality: WEBP_QUALITY })
    .toBuffer();

  return {
    buffer,
    contentType: "image/webp",
    extension: "webp",
  };
}
