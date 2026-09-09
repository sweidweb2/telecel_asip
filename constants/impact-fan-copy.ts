import type { Locale } from "@/constants/locales";
import type { PublicPageSlug } from "@/constants/public-pages";

/**
 * Impact page fan section — portfolio traction snapshot with fanned media.
 * Named figures are portfolio examples pending full evidence packaging.
 */
export type ImpactFanBadgeId =
  | "revenue"
  | "mentors"
  | "operations"
  | "partners"
  | "growth";

export type ImpactFanImage = {
  id: ImpactFanBadgeId;
  src: string;
  alt: string;
  badge: string;
  /** Tailwind colour for the badge accent */
  dotClassName: string;
};

export type ImpactFanStat = {
  id: string;
  value: string;
  titleLead: string;
  titleAccent: string;
  description: string;
};

export type ImpactFanCopy = {
  eyebrow: string;
  titleLead: string;
  titleAccent: string;
  description: string;
  images: ImpactFanImage[];
  stats: ImpactFanStat[];
  cta: { slug: PublicPageSlug; label: string };
};

const sharedImagesEn: ImpactFanImage[] = [
  {
    id: "revenue",
    src: "/asip-media/programme-workshop.webp",
    alt: "ASIP founders collaborating in a programme workshop",
    badge: "Revenue",
    dotClassName: "bg-brand",
  },
  {
    id: "mentors",
    src: "/asip-media/programme-mentor.webp",
    alt: "A mentor working directly with an ASIP founder",
    badge: "Mentors",
    dotClassName: "bg-[var(--asip-coral)]",
  },
  {
    id: "operations",
    src: "/asip-media/founders-community.webp",
    alt: "ASIP founders and programme community together",
    badge: "Operations",
    dotClassName: "bg-[var(--asip-magenta)]",
  },
  {
    id: "partners",
    src: "/asip-media/partners-stage.webp",
    alt: "ASIP partners and founders on stage at an ecosystem event",
    badge: "Partners",
    dotClassName: "bg-[var(--asip-ink)]",
  },
  {
    id: "growth",
    src: "/asip-media/about-journey.webp",
    alt: "ASIP founders on the programme journey",
    badge: "Growth",
    dotClassName: "bg-brand-mid",
  },
];

const sharedImagesFr: ImpactFanImage[] = [
  {
    id: "revenue",
    src: "/asip-media/programme-workshop.webp",
    alt: "Fondateurs ASIP collaborant lors d’un atelier du programme",
    badge: "Revenus",
    dotClassName: "bg-brand",
  },
  {
    id: "mentors",
    src: "/asip-media/programme-mentor.webp",
    alt: "Un mentor travaillant directement avec un fondateur ASIP",
    badge: "Mentors",
    dotClassName: "bg-[var(--asip-coral)]",
  },
  {
    id: "operations",
    src: "/asip-media/founders-community.webp",
    alt: "Fondateurs ASIP et communauté du programme",
    badge: "Opérations",
    dotClassName: "bg-[var(--asip-magenta)]",
  },
  {
    id: "partners",
    src: "/asip-media/partners-stage.webp",
    alt: "Partenaires et fondateurs ASIP sur scène lors d’un événement",
    badge: "Partenaires",
    dotClassName: "bg-[var(--asip-ink)]",
  },
  {
    id: "growth",
    src: "/asip-media/about-journey.webp",
    alt: "Fondateurs ASIP sur le parcours du programme",
    badge: "Croissance",
    dotClassName: "bg-brand-mid",
  },
];

const en: ImpactFanCopy = {
  eyebrow: "Impact",
  titleLead: "Founders building traction,",
  titleAccent: "and scale",
  description:
    "Named portfolio outcomes across revenue, operations and customers - the progress ASIP tracks with founders as they grow.",
  images: sharedImagesEn,
  stats: [
    {
      id: "revenue",
      value: "$974k",
      titleLead: "Revenue",
      titleAccent: "Scale",
      description:
        "Leaders like Grocedy ($974,709 revenue) and Pharmaserv ($480,000 revenue).",
    },
    {
      id: "operations",
      value: "500M+",
      titleLead: "Operational",
      titleAccent: "Momentum",
      description:
        "Chekkit managing 500M+ codes and Mojaride processing over 4.4M tickets.",
    },
    {
      id: "customers",
      value: "300%",
      titleLead: "Customer",
      titleAccent: "Growth",
      description:
        "Significant traction, such as Pharmaserv’s 300% user growth.",
    },
  ],
  cta: { slug: "founders", label: "Learn more" },
};

const fr: ImpactFanCopy = {
  eyebrow: "Impact",
  titleLead: "Des fondateurs qui créent de la traction,",
  titleAccent: "et de l’échelle",
  description:
    "Des résultats nommés du portefeuille - revenus, opérations et clients - le progrès qu’ASIP suit avec les fondateurs qui grandissent.",
  images: sharedImagesFr,
  stats: [
    {
      id: "revenue",
      value: "974 k$",
      titleLead: "Échelle des",
      titleAccent: "revenus",
      description:
        "Des leaders comme Grocedy (974 709 $ de revenus) et Pharmaserv (480 000 $ de revenus).",
    },
    {
      id: "operations",
      value: "500 M+",
      titleLead: "Momentum",
      titleAccent: "opérationnel",
      description:
        "Chekkit gère plus de 500 M de codes et Mojaride traite plus de 4,4 M de tickets.",
    },
    {
      id: "customers",
      value: "300 %",
      titleLead: "Croissance",
      titleAccent: "clients",
      description:
        "Une traction nette, comme la croissance utilisateurs de 300 % chez Pharmaserv.",
    },
  ],
  cta: { slug: "founders", label: "En savoir plus" },
};

export function impactFanCopyFor(locale: Locale): ImpactFanCopy {
  return locale === "fr" ? fr : en;
}
