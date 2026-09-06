import fs from "node:fs";

const o = JSON.parse(fs.readFileSync("tmp/africa-paths.json", "utf8"));

function roundPath(d) {
  return d.replace(/-?\d+\.\d+/g, (n) => Number(n).toFixed(1));
}

const africaD = roundPath(o.africaD);
const madagascarD = roundPath(o.madagascarD);

const nodes = [
  {
    id: "01",
    label: "CONNECTIVITY",
    x: +o.projected.connectivity[0].toFixed(1),
    y: +o.projected.connectivity[1].toFixed(1),
    accent: true,
  },
  {
    id: "02",
    label: "STARTUP ECOSYSTEM",
    x: +o.projected.startups[0].toFixed(1),
    y: +o.projected.startups[1].toFixed(1),
    accent: false,
  },
  {
    id: "03",
    label: "CAPITAL",
    x: +o.projected.capital[0].toFixed(1),
    y: +o.projected.capital[1].toFixed(1),
    accent: false,
  },
  {
    id: "04",
    label: "INNOVATION",
    x: +o.projected.innovation[0].toFixed(1),
    y: +o.projected.innovation[1].toFixed(1),
    accent: true,
  },
  {
    id: "05",
    label: "GROWTH",
    x: +o.projected.growth[0].toFixed(1),
    y: +o.projected.growth[1].toFixed(1),
    accent: false,
  },
  {
    id: "06",
    label: "IMPACT",
    x: +o.projected.impact[0].toFixed(1),
    y: +o.projected.impact[1].toFixed(1),
    accent: false,
  },
];

const src = `/** Accurate Africa outline — projected from Natural Earth (world-atlas 110m). */
export const AFRICA_MAINLAND_PATH = ${JSON.stringify(africaD)};

export const AFRICA_MADAGASCAR_PATH = ${JSON.stringify(madagascarD)};

export const AFRICA_BLUEPRINT_NODES = ${JSON.stringify(nodes, null, 2)} as const;
`;

fs.writeFileSync("constants/africa-blueprint-geometry.ts", src);
console.log("wrote", africaD.length, madagascarD.length);
