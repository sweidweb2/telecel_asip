import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const topojson = require("topojson-client");
const d3 = require("d3-geo");

const topology = JSON.parse(
  fs.readFileSync(path.join(process.env.TEMP, "countries-110m.json"), "utf8"),
);

const AFRICA = new Set([
  "Algeria",
  "Angola",
  "Benin",
  "Botswana",
  "Burkina Faso",
  "Burundi",
  "Cameroon",
  "Central African Rep.",
  "Chad",
  "Congo",
  "Côte d'Ivoire",
  "Dem. Rep. Congo",
  "Djibouti",
  "Egypt",
  "Eq. Guinea",
  "Eritrea",
  "Ethiopia",
  "Gabon",
  "Gambia",
  "Ghana",
  "Guinea",
  "Guinea-Bissau",
  "Kenya",
  "Lesotho",
  "Liberia",
  "Libya",
  "Madagascar",
  "Malawi",
  "Mali",
  "Mauritania",
  "Morocco",
  "Mozambique",
  "Namibia",
  "Niger",
  "Nigeria",
  "Rwanda",
  "S. Sudan",
  "Senegal",
  "Sierra Leone",
  "Somalia",
  "Somaliland",
  "South Africa",
  "Sudan",
  "Tanzania",
  "Togo",
  "Tunisia",
  "Uganda",
  "W. Sahara",
  "Zambia",
  "Zimbabwe",
  "eSwatini",
]);

const geos = topology.objects.countries.geometries.filter((g) =>
  AFRICA.has(g.properties.name),
);

console.log("countries", geos.length);

const mainland = topojson.merge(
  topology,
  geos.filter((g) => g.properties.name !== "Madagascar"),
);
const madagascar = topojson.merge(
  topology,
  geos.filter((g) => g.properties.name === "Madagascar"),
);

const target = { x: 430, y: 40, w: 500, h: 460 };
const projection = d3.geoMercator().fitExtent(
  [
    [target.x, target.y],
    [target.x + target.w, target.y + target.h],
  ],
  mainland,
);
const geoPath = d3.geoPath(projection);

const africaD = geoPath(mainland);
const madagascarD = geoPath(madagascar);

// Project a few reference cities for node placement
const cities = {
  connectivity: [10, 30], // Maghreb / north
  startups: [-4, 8], // West Africa
  capital: [18, -5], // Central
  innovation: [38, 0], // East Africa
  growth: [25, -26], // Southern
  impact: [30, 10], // Horn / Nile corridor
};

const projected = Object.fromEntries(
  Object.entries(cities).map(([k, [lon, lat]]) => [k, projection([lon, lat])]),
);

const out = {
  africaD,
  madagascarD,
  projected,
  projectionScale: projection.scale(),
  projectionTranslate: projection.translate(),
};

fs.writeFileSync(
  path.join(process.cwd(), "tmp", "africa-paths.json"),
  JSON.stringify(out),
);

console.log("path lengths", africaD.length, madagascarD.length);
console.log("projected", projected);
