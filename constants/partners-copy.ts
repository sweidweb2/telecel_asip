import type { Locale } from "@/constants/locales";
import type { PartnersPageCopy } from "@/types/marketing-page";

const en: PartnersPageCopy = {
  hero: {
    eyebrow: "Partners & mentors",
    titleLead: "The right opportunity can change a company’s",
    titleAccent: "trajectory.",
    description:
      "ASIP works with investors, corporates, technology leaders, development institutions, mentors and ecosystem organizations to give founders practical expertise, capital, customers and markets.",
    cta: { slug: "contact", label: "Discuss a partnership" },
    proof: ["Investors", "Corporates", "Technology partners", "Mentors"],
  },
  proposition: {
    title: "Bring an opportunity to the ecosystem.",
    description:
      "Tell us the market, sector or challenge you want to address. ASIP can help identify relevant founders, shape the right engagement route and bring together the people needed to turn conversation into practical opportunity.",
  },
  types: {
    title: "Ways to work with founders.",
    description:
      "Choose the route that matches the opportunity, expertise or access you can bring.",
    columns: {
      type: "Partner type",
      value: "Value to the ecosystem",
      examples: "Examples of engagement",
    },
    rows: [
      {
        id: "corporate",
        type: "Corporate innovation",
        value:
          "Match real business needs with a qualified founder pipeline.",
        examples:
          "Challenge statements, pilots, proof-of-concepts, commercial partnerships.",
      },
      {
        id: "investors",
        type: "Investors",
        value:
          "Discover structured founder deal flow across sectors and markets.",
        examples:
          "Portfolio introductions, demo days, investment-readiness dialogue.",
      },
      {
        id: "technology",
        type: "Technology partners",
        value:
          "Put useful products and technical expertise into founders’ hands.",
        examples:
          "Credits, architecture support, workshops, specialist mentoring.",
      },
      {
        id: "development",
        type: "Development / public sector",
        value:
          "Advance founder growth, jobs, inclusion and technology-led solutions.",
        examples:
          "Country initiatives, grants, sector programs, impact measurement.",
      },
      {
        id: "mentors",
        type: "Mentors / operators",
        value: "Share experience founders can apply immediately.",
        examples:
          "1:1 mentoring, functional clinics, market expertise, founder sessions.",
      },
      {
        id: "media",
        type: "Media / ecosystem",
        value: "Amplify credible founder stories and bring communities together.",
        examples:
          "Editorial, events, founder showcases, ecosystem research.",
      },
    ],
  },
  logos: {
    title: "What partners bring to founders.",
    description:
      "Capital, technology, markets and expertise, grouped by what each partner actually puts into founders’ hands.",
    bringsLabel: "What founders get:",
  },
  ctaSection: {
    title: "Have an opportunity for founders?",
    description:
      "Tell us the market, sector or challenge you want to address. ASIP will help identify relevant founders and the right engagement route.",
    slug: "contact",
    label: "Discuss a partnership",
  },
};

const fr: PartnersPageCopy = {
  hero: {
    eyebrow: "Partenaires et mentors",
    titleLead: "La bonne opportunité peut changer la",
    titleAccent: "trajectoire d’une entreprise.",
    description:
      "ASIP travaille avec des investisseurs, des entreprises, des leaders technologiques, des institutions de développement, des mentors et des organisations de l’écosystème pour offrir aux fondateurs une expertise concrète, du capital, des clients et des marchés.",
    cta: { slug: "contact", label: "Discuter d’un partenariat" },
    proof: [
      "Investisseurs",
      "Entreprises",
      "Partenaires technologiques",
      "Mentors",
    ],
  },
  proposition: {
    title: "Apportez une opportunité à l’écosystème.",
    description:
      "Indiquez le marché, le secteur ou le défi que vous souhaitez adresser. ASIP peut aider à identifier les fondateurs pertinents, façonner le bon format d’engagement et réunir les personnes nécessaires pour passer de la conversation à une opportunité concrète.",
  },
  types: {
    title: "Des façons de travailler avec les fondateurs.",
    description:
      "Choisissez le format qui correspond à l’opportunité, l’expertise ou l’accès que vous pouvez apporter.",
    columns: {
      type: "Type de partenaire",
      value: "Valeur pour l’écosystème",
      examples: "Exemples d’engagement",
    },
    rows: [
      {
        id: "corporate",
        type: "Innovation corporate",
        value:
          "Faire correspondre des besoins business réels à un pipeline de fondateurs qualifiés.",
        examples:
          "Briefs de challenge, pilotes, preuves de concept, partenariats commerciaux.",
      },
      {
        id: "investors",
        type: "Investisseurs",
        value:
          "Découvrir un deal flow structuré de fondateurs, tous secteurs et marchés.",
        examples:
          "Introductions portefeuille, demo days, dialogues de préparation à l’investissement.",
      },
      {
        id: "technology",
        type: "Partenaires technologiques",
        value:
          "Mettre des produits utiles et une expertise technique entre les mains des fondateurs.",
        examples:
          "Crédits, accompagnement d’architecture, ateliers, mentorat spécialisé.",
      },
      {
        id: "development",
        type: "Développement / secteur public",
        value:
          "Faire progresser la croissance des fondateurs, l’emploi, l’inclusion et les solutions technologiques.",
        examples:
          "Initiatives pays, subventions, programmes sectoriels, mesure d’impact.",
      },
      {
        id: "mentors",
        type: "Mentors / opérateurs",
        value:
          "Partager une expérience que les fondateurs peuvent appliquer tout de suite.",
        examples:
          "Mentorat 1:1, cliniques fonctionnelles, expertise marché, sessions fondateurs.",
      },
      {
        id: "media",
        type: "Médias / écosystème",
        value:
          "Amplifier des histoires de fondateurs crédibles et rassembler les communautés.",
        examples:
          "Éditorial, événements, mises en avant de fondateurs, recherche écosystème.",
      },
    ],
  },
  logos: {
    title: "Ce que les partenaires apportent aux fondateurs.",
    description:
      "Capital, technologie, marchés et expertise, regroupés selon ce que chaque partenaire met concrètement entre les mains des fondateurs.",
    bringsLabel: "Pour les fondateurs :",
  },
  ctaSection: {
    title: "Une opportunité pour les fondateurs ?",
    description:
      "Indiquez le marché, le secteur ou le défi que vous souhaitez adresser. ASIP aidera à identifier les fondateurs pertinents et le bon format d’engagement.",
    slug: "contact",
    label: "Discuter d’un partenariat",
  },
};

export function partnersCopyFor(locale: Locale): PartnersPageCopy {
  return locale === "fr" ? fr : en;
}
