import type { Locale } from "@/constants/locales";

export type LabPartnersHoneycombCopy = {
  eyebrow: string;
  title: string;
  description: string;
};

export type LabPartnerLogo = {
  id: string;
  src: string;
  alt: string;
  width: number;
  height: number;
};

const en: LabPartnersHoneycombCopy = {
  eyebrow: "Partners",
  title: "Technologies & partners with ASIP",
  description:
    "Ambitious goals need a network. ASIP works with technology partners, investors and operators who help founders test ideas, reach customers and grow.",
};

const fr: LabPartnersHoneycombCopy = {
  eyebrow: "Partenaires",
  title: "Technologies et partenaires avec ASIP",
  description:
    "Les ambitions se construisent en réseau. ASIP travaille avec des partenaires technologiques, des investisseurs et des opérateurs qui aident les fondateurs à tester, trouver des clients et grandir.",
};

export function labPartnersHoneycombCopyFor(
  locale: Locale,
): LabPartnersHoneycombCopy {
  return locale === "fr" ? fr : en;
}

/**
 * Partner marks for the lab honeycomb — sourced from `public/partners`.
 * ASIP mark sits in the centre hex (browser-tab circle), so it is omitted here.
 */
export const LAB_PARTNER_HONEYCOMB_LOGOS: readonly LabPartnerLogo[] = [
  {
    id: "google-cloud",
    src: "/partners/google-cloud.png",
    alt: "Google Cloud",
    width: 120,
    height: 40,
  },
  {
    id: "aws",
    src: "/partners/aws.png",
    alt: "AWS",
    width: 72,
    height: 44,
  },
  {
    id: "hubspot",
    src: "/partners/hubspot.png",
    alt: "HubSpot",
    width: 110,
    height: 32,
  },
  {
    id: "miro",
    src: "/partners/miro.png",
    alt: "Miro",
    width: 88,
    height: 32,
  },
  {
    id: "freshworks",
    src: "/partners/freshworks.png",
    alt: "Freshworks",
    width: 110,
    height: 36,
  },
  {
    id: "fmo",
    src: "/partners/fmo-ventures.png",
    alt: "FMO Ventures",
    width: 100,
    height: 40,
  },
  {
    id: "vc4a",
    src: "/partners/vc4a.png",
    alt: "VC4A",
    width: 72,
    height: 32,
  },
  {
    id: "firstbase",
    src: "/partners/firstbase.png",
    alt: "Firstbase",
    width: 100,
    height: 36,
  },
  {
    id: "cloudworx",
    src: "/partners/cloudworx.png",
    alt: "Cloudworx",
    width: 110,
    height: 36,
  },
  {
    id: "dhub",
    src: "/partners/dhub.png",
    alt: "DHub",
    width: 100,
    height: 40,
  },
  {
    id: "sbc-afritech",
    src: "/partners/sbc-afritech.png",
    alt: "Startupbootcamp AfriTech",
    width: 110,
    height: 40,
  },
  {
    id: "der",
    src: "/partners/der.png",
    alt: "DER",
    width: 90,
    height: 40,
  },
  {
    id: "a2",
    src: "/partners/a2.png",
    alt: "A2",
    width: 72,
    height: 40,
  },
] as const;
