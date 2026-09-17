import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const lines = fs
  .readFileSync(path.join(root, "marketing-css-good.css"), "utf8")
  .split(/\n/);
const slice = (a, b) => lines.slice(a - 1, b).join("\n").replace(/\n+$/, "") + "\n";

const institutional =
  "/* Institutional hero field — imported by institutional-hero-field.tsx */\n" +
  slice(1105, 1511);
fs.writeFileSync(
  path.join(root, "components/marketing/institutional-hero-field.css"),
  institutional,
);

const impact = [
  "/* Impact stairs / arrows / kite — imported by home-impact + programme bridge */",
  "/* Impact Years — static stair belt (no infinite translate paint). */",
  "",
  slice(885, 977).trimEnd(),
  "",
  "@media (prefers-reduced-motion: reduce) {",
  "  .impact-stairs-belt,",
  "  .impact-kite-float,",
  "  .bridge-sketch-float {",
  "    animation: none !important;",
  "    transform: none;",
  "  }",
  "  .impact-stairs-belt-copy { display: none; }",
  "  .impact-arrow-stroke,",
  "  .impact-arrow-tip {",
  "    animation: none !important;",
  "    stroke-dashoffset: 0 !important;",
  "    opacity: 1 !important;",
  "  }",
  "  .impact-arrow-twin { display: none; }",
  "}",
  "",
].join("\n");
fs.writeFileSync(path.join(root, "components/marketing/impact-motion.css"), impact);

const marketingPath = path.join(root, "app/[locale]/(marketing)/marketing.css");
const marketingShared = fs
  .readFileSync(marketingPath, "utf8")
  .split(/\n/)
  .slice(0, 157)
  .join("\n")
  .replace(/\n+$/, "");

const marketingTail = `
.editorial-rule {
  border-top: 1px solid color-mix(in srgb, currentColor 24%, transparent);
}

.metric-numeral {
  font-variant-numeric: tabular-nums;
}

/*
 * Home Module 07→08 seam — mirrored puzzle halves.
 * Same radial strength/size; one anchored at bottom, one at top.
 * Same linear end/start colour (brand-subtle) so the join is continuous.
 */
.home-module-seam-from {
  background-image:
    radial-gradient(
      120% 80% at 50% 100%,
      color-mix(in oklab, var(--brand) 14%, transparent),
      transparent 55%
    ),
    linear-gradient(180deg, var(--background) 0%, var(--brand-subtle) 100%);
}

.home-module-seam-to {
  background-image:
    radial-gradient(
      120% 80% at 50% 0%,
      color-mix(in oklab, var(--brand) 14%, transparent),
      transparent 55%
    ),
    linear-gradient(180deg, var(--brand-subtle) 0%, var(--background) 70%);
}

@media (prefers-reduced-motion: reduce) {
  [data-hero-copy] > *,
  [data-reveal="section"],
  [data-reveal="media"],
  [data-reveal="fade"],
  .animate-scroll-horizontal,
  .animate-scroll-horizontal-reverse,
  .animate-fade-in-up,
  .about-story-fade-up,
  .about-story-underline,
  .about-story-float,
  .about-story-float-delayed,
  .next-chapter-float,
  .next-chapter-float-delayed,
  .honeycomb-float,
  .honeycomb-float-delayed,
  .honeycomb-float-centre {
    animation: none !important;
    opacity: 1;
    transform: none;
  }
}
`;

fs.writeFileSync(marketingPath, `${marketingShared}\n${marketingTail}`);

console.log("repaired", {
  marketing: fs.statSync(marketingPath).size,
  impact: fs.statSync(path.join(root, "components/marketing/impact-motion.css")).size,
  institutional: fs.statSync(
    path.join(root, "components/marketing/institutional-hero-field.css"),
  ).size,
});
