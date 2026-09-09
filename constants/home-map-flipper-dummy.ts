export type MapFlipperStat = {
  label: string;
  value: string;
};

export type MapFlipperSlide = {
  id: string;
  eyebrow: string;
  title: string;
  description: string;
  /** [longitude, latitude] for map projection center */
  center: [number, number];
  scale: number;
  stats: MapFlipperStat[];
  /**
   * world-atlas country ids (ISO 3166-1 numeric as string) to tint.
   * Demo-only — not evidence-backed.
   */
  highlightIds?: string[];
};

/** Public TopoJSON used by react-simple-maps Geographies. */
export const HOME_MAP_GEOGRAPHY_URL =
  "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";

/**
 * Dummy home map flipper slides — prototype only.
 * Numbers are placeholders; do not treat as published impact claims.
 */
export const HOME_MAP_FLIPPER_SLIDES: MapFlipperSlide[] = [
  {
    id: "africa",
    eyebrow: "Demo · Impact map",
    title: "Across Africa",
    description:
      "Placeholder view of founders and programme reach across the continent.",
    center: [20, 5],
    scale: 280,
    stats: [
      { label: "Founders in portfolio", value: "180+" },
      { label: "Markets represented", value: "32" },
      { label: "Active cohorts tracked", value: "7" },
    ],
    highlightIds: [
      "12", // Algeria
      "24", // Angola
      "204", // Benin
      "72", // Botswana
      "854", // Burkina Faso
      "108", // Burundi
      "120", // Cameroon
      "140", // Central African Republic
      "148", // Chad
      "174", // Comoros
      "178", // Congo
      "180", // DR Congo
      "262", // Djibouti
      "818", // Egypt
      "226", // Equatorial Guinea
      "232", // Eritrea
      "231", // Ethiopia
      "266", // Gabon
      "270", // Gambia
      "288", // Ghana
      "324", // Guinea
      "624", // Guinea-Bissau
      "384", // Côte d'Ivoire
      "404", // Kenya
      "426", // Lesotho
      "430", // Liberia
      "434", // Libya
      "450", // Madagascar
      "454", // Malawi
      "466", // Mali
      "478", // Mauritania
      "480", // Mauritius
      "504", // Morocco
      "508", // Mozambique
      "516", // Namibia
      "562", // Niger
      "566", // Nigeria
      "646", // Rwanda
      "678", // São Tomé and Príncipe
      "686", // Senegal
      "690", // Seychelles
      "694", // Sierra Leone
      "706", // Somalia
      "710", // South Africa
      "728", // South Sudan
      "729", // Sudan
      "748", // Eswatini
      "768", // Togo
      "788", // Tunisia
      "800", // Uganda
      "834", // Tanzania
      "854", // Burkina Faso (dup ok)
      "894", // Zambia
      "716", // Zimbabwe
    ],
  },
  {
    id: "west-africa",
    eyebrow: "Demo · West Africa",
    title: "West Africa focus",
    description:
      "Dummy stats for a regional zoom - replace with verified metrics later.",
    center: [-5, 10],
    scale: 720,
    stats: [
      { label: "Founders in region", value: "64" },
      { label: "Partner touchpoints", value: "18" },
      { label: "Sectors represented", value: "9" },
    ],
    highlightIds: [
      "204", // Benin
      "854", // Burkina Faso
      "132", // Cabo Verde
      "270", // Gambia
      "288", // Ghana
      "324", // Guinea
      "624", // Guinea-Bissau
      "384", // Côte d'Ivoire
      "430", // Liberia
      "466", // Mali
      "478", // Mauritania
      "562", // Niger
      "566", // Nigeria
      "686", // Senegal
      "694", // Sierra Leone
      "768", // Togo
    ],
  },
  {
    id: "east-africa",
    eyebrow: "Demo · East Africa",
    title: "East Africa focus",
    description:
      "Another regional zoom with placeholder figures for flipper QA.",
    center: [38, 2],
    scale: 720,
    stats: [
      { label: "Founders in region", value: "51" },
      { label: "Cities with activity", value: "14" },
      { label: "Follow-on stories", value: "22" },
    ],
    highlightIds: [
      "108", // Burundi
      "174", // Comoros
      "262", // Djibouti
      "232", // Eritrea
      "231", // Ethiopia
      "404", // Kenya
      "450", // Madagascar
      "454", // Malawi
      "480", // Mauritius
      "175", // Mayotte (if present)
      "646", // Rwanda
      "690", // Seychelles
      "706", // Somalia
      "728", // South Sudan
      "834", // Tanzania
      "800", // Uganda
      "894", // Zambia
      "716", // Zimbabwe
    ],
  },
];
