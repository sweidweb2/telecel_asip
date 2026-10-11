/**
 * Public founder blurbs stop before booklet "Impact Achievements" blocks.
 * Those figures stay unpublished until each has a source, period, owner
 * and permission. `public_outcome` is the only cleared proof line.
 */
export function publicStartupDescription(description: string): string {
  const [body] = description.split(/impact achievements/i);
  return (body ?? description).replace(/\s+/g, " ").trim();
}
