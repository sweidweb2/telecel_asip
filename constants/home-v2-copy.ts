import type { Locale } from "@/constants/locales";
import type { PublicPageSlug } from "@/constants/public-pages";

/**
 * Homepage copy. English uses American spelling (client revision Nov 2026).
 * French mirrors the same structure and meaning.
 */

type Cta = { slug: PublicPageSlug; hash?: string; label: string };

export type HomeV2Copy = {
  hero: {
    title: string;
    titleLines: string[];
    description: string;
    prompt: string;
    founder: { hash: string; label: string };
    investor: { hash: string; label: string };
    /** Alt text for the hero photo loop, same order as HOME_HERO_CONTINUUM. */
    continuumAlts: string[];
  };
  ai: {
    eyebrow: string;
    title: string;
    support: string;
    description: string;
    statusClosed: string;
    statusOpen: string;
    founderCta: Cta;
    investorCta: Cta;
    /** Short practical signals shown in the data panel. */
    signals: { id: string; label: string; detail: string }[];
    panelLabel: string;
  };
  proof: { label: string };
  founder: {
    eyebrow: string;
    title: string;
    description: string;
    cta: Cta;
    steps: string[];
  };
  investor: {
    eyebrow: string;
    title: string;
    description: string;
    primaryCta: Cta;
    secondaryCta: Cta;
    questions: string[];
    statLabels: { companies: string; markets: string; sectors: string };
  };
  stories: {
    eyebrow: string;
    title: string;
    description: string;
    cta: Cta;
  };
  impact: {
    eyebrow: string;
    title: string;
    description: string;
    cta: Cta;
  };
  map: {
    eyebrow: string;
    title: string;
    description: string;
    cta: Cta;
    legendPortfolio: string;
    legendOther: string;
    hint: string;
    exploreCountry: string;
    countriesLabel: string;
    schematic: string;
  };
  ecosystem: {
    eyebrow: string;
    title: string;
    description: string;
    cta: Cta;
    values: { id: string; title: string; description: string }[];
  };
  latest: {
    eyebrow: string;
    title: string;
    description: string;
    cta: Cta;
    empty: string;
  };
  closing: {
    eyebrow: string;
    title: string;
    description: string;
    investorCta: Cta;
  };
};

const en: HomeV2Copy = {
  hero: {
    title: "African founders. Real solutions. Impact that scales.",
    titleLines: ["African founders.", "Real solutions.", "Impact that [scales]."],
    description:
      "ASIP helps ambitious technology founders build stronger companies through practical expertise, market access and an ecosystem of investors, operators and partners focused on growth.",
    prompt: "Choose your route",
    founder: { hash: "founders", label: "Startup" },
    investor: { hash: "investors", label: "Investor" },
    continuumAlts: [
      "ASIP founder focused in conversation at a program table",
      "ASIP founders listening during a program pitch session",
      "ASIP founders collaborating at a program working table",
      "ASIP mentor and founders in conversation at a program event",
    ],
  },
  ai: {
    eyebrow: "2026 next chapter",
    title: "Building the AI Advantage",
    support: "AI Advantage in Action",
    description:
      "The 2026 chapter supports startups using AI to solve existing business challenges and demonstrate measurable gains in revenue, cost efficiency, speed, or market reach.",
    statusClosed:
      "Applications are not currently open. Register your interest to receive confirmed eligibility, dates and application details when announced.",
    statusOpen: "Applications are open.",
    founderCta: { slug: "programme", label: "Explore the AI Next Cohort" },
    investorCta: { slug: "insights", label: "See 2026 activity" },
    panelLabel: "Where AI earns its place",
    signals: [
      { id: "products", label: "Better products", detail: "AI inside the product customers use" },
      { id: "productivity", label: "Productivity", detail: "Faster operations, fewer manual steps" },
      { id: "advantage", label: "Measurable advantage", detail: "Results a customer or investor recognizes." },
    ],
  },
  proof: { label: "ASIP in numbers" },
  founder: {
    eyebrow: "For founders",
    title: "Build what comes next.",
    description:
      "See what ASIP offers, how the founder journey works, what the 2026 AI direction means and how to register for the next cohort.",
    cta: { slug: "programme", label: "Explore the founder journey" },
    steps: ["Discover", "Build", "Test", "Accelerate", "Scale"],
  },
  investor: {
    eyebrow: "For investors",
    title: "See what is being built.",
    description:
      "Explore the portfolio by sector and market, follow current and upcoming program activity, and speak with ASIP about relevant founder, investment and ecosystem opportunities.",
    primaryCta: { slug: "founders", label: "Explore the portfolio" },
    secondaryCta: { slug: "insights", label: "View current activity" },
    questions: ["Portfolio quality", "Sectors and markets", "Current activity", "How to engage"],
    statLabels: { companies: "Published portfolio companies", markets: "Portfolio markets", sectors: "Sectors" },
  },
  stories: {
    eyebrow: "Founder stories",
    title: "Built from first-hand insight.",
    description:
      "Meet founders turning real market problems into technology products, new business models and companies designed to scale.",
    cta: { slug: "founders", label: "Meet the founders" },
  },
  impact: {
    eyebrow: "Impact",
    title: "Proof lives in what founders build next.",
    description:
      "Track verified outcomes across company growth, new markets, partnerships, funding, jobs and real-world product use.",
    cta: { slug: "impact", label: "See the impact" },
  },
  map: {
    eyebrow: "Portfolio & reach",
    title: "Across markets. Grounded in evidence.",
    description:
      "Explore verified portfolio presence and application reach across African markets.",
    cta: { slug: "founders", label: "Explore the map" },
    legendPortfolio: "Portfolio presence",
    legendOther: "Other African markets",
    hint: "Select a highlighted market to see its founders.",
    exploreCountry: "Explore founders from",
    countriesLabel: "Portfolio markets",
    schematic: "Schematic map. Tiles are not to scale.",
  },
  ecosystem: {
    eyebrow: "Investors & partners",
    title: "More than logos. Practical value.",
    description:
      "Technology, capital, market access, mentorship and commercial pathways, brought together around founder progress.",
    cta: { slug: "partners", label: "Explore Partnership Opportunities" },
    values: [
      { id: "technology", title: "Technology", description: "Technical expertise, tools and platforms where available." },
      { id: "capital", title: "Capital", description: "Portfolio discovery and investment-readiness dialogue." },
      { id: "markets", title: "Markets", description: "Sharper understanding of customers, sectors and regulation." },
      { id: "mentorship", title: "Mentorship", description: "Operating experience founders can apply immediately." },
      { id: "commercial", title: "Commercial access", description: "Pilots, customers and partnerships where there is genuine fit." },
    ],
  },
  latest: {
    eyebrow: "Insights",
    title: "What's happening now.",
    description:
      "Founder stories, portfolio milestones and program updates, focused on what changed and why it matters.",
    cta: { slug: "insights", label: "View insights" },
    empty: "",
  },
  closing: {
    eyebrow: "Next step",
    title: "Building something that can scale?",
    description: "Choose the route that fits where you are now.",
    investorCta: { slug: "founders", label: "Explore the portfolio" },
  },
};

const fr: HomeV2Copy = {
  hero: {
    title: "Fondateurs africains. Solutions concrètes. Un impact qui grandit.",
    titleLines: ["Fondateurs africains.", "Solutions concrètes.", "Un impact qui [grandit]."],
    description:
      "ASIP aide les fondateurs technologiques ambitieux à bâtir des entreprises plus solides grâce à une expertise concrète, à l’accès aux marchés et à un écosystème d’investisseurs, d’opérateurs et de partenaires tournés vers la croissance.",
    prompt: "Choisissez votre parcours",
    founder: { hash: "founders", label: "Startup" },
    investor: { hash: "investors", label: "Investisseur" },
    continuumAlts: [
      "Fondateur ASIP concentré en conversation à une table du programme",
      "Fondateurs ASIP à l’écoute lors d’une session de pitch du programme",
      "Fondateurs ASIP collaborant autour d’une table de travail du programme",
      "Mentor et fondateurs ASIP en conversation lors d’un événement du programme",
    ],
  },
  ai: {
    eyebrow: "Prochain chapitre 2026",
    title: "Construire l’avantage IA",
    support: "L’avantage IA en action",
    description:
      "Le chapitre 2026 accompagne les startups qui utilisent l’IA pour résoudre des défis business existants et démontrer des gains mesurables en revenu, efficacité des coûts, vitesse ou portée de marché.",
    statusClosed:
      "Les candidatures ne sont pas ouvertes. Manifestez votre intérêt pour recevoir l’éligibilité, les dates et les modalités confirmées dès leur annonce.",
    statusOpen: "Les candidatures sont ouvertes.",
    founderCta: { slug: "programme", label: "Découvrir la cohorte IA" },
    investorCta: { slug: "insights", label: "Voir l’activité 2026" },
    panelLabel: "Là où l’IA fait ses preuves",
    signals: [
      { id: "products", label: "De meilleurs produits", detail: "L’IA au cœur du produit utilisé par les clients" },
      { id: "productivity", label: "Productivité", detail: "Des opérations plus rapides, moins d’étapes manuelles" },
      { id: "advantage", label: "Avantage mesurable", detail: "Des résultats qu’un client ou un investisseur reconnaît" },
    ],
  },
  proof: { label: "ASIP en chiffres" },
  founder: {
    eyebrow: "Pour les fondateurs",
    title: "Construisez la suite.",
    description:
      "Découvrez ce qu’offre ASIP, le parcours fondateur, l’orientation IA 2026 et comment vous inscrire pour la prochaine cohorte.",
    cta: { slug: "programme", label: "Découvrir le parcours fondateur" },
    steps: ["Découvrir", "Construire", "Tester", "Accélérer", "Grandir"],
  },
  investor: {
    eyebrow: "Pour les investisseurs",
    title: "Voyez ce qui se construit.",
    description:
      "Explorez le portefeuille par secteur et par marché, suivez l’activité en cours et à venir du programme, et échangez avec ASIP sur les opportunités pertinentes.",
    primaryCta: { slug: "founders", label: "Explorer le portefeuille" },
    secondaryCta: { slug: "insights", label: "Voir l’activité en cours" },
    questions: ["Qualité du portefeuille", "Secteurs et marchés", "Activité en cours", "Comment s’engager"],
    statLabels: { companies: "Entreprises publiées au portefeuille", markets: "Marchés du portefeuille", sectors: "Secteurs" },
  },
  stories: {
    eyebrow: "Histoires de fondateurs",
    title: "Nées d’une connaissance de terrain.",
    description:
      "Rencontrez des fondateurs qui transforment de vrais problèmes de marché en produits technologiques et en entreprises conçues pour grandir.",
    cta: { slug: "founders", label: "Rencontrer les fondateurs" },
  },
  impact: {
    eyebrow: "Impact",
    title: "La preuve, c’est ce que les fondateurs construisent ensuite.",
    description:
      "Suivez des résultats vérifiés : croissance, nouveaux marchés, partenariats, financement, emplois et usage réel des produits.",
    cta: { slug: "impact", label: "Voir l’impact" },
  },
  map: {
    eyebrow: "Portefeuille et portée",
    title: "Sur plusieurs marchés. Fondé sur des preuves.",
    description:
      "Explorez la présence vérifiée du portefeuille et la portée des candidatures sur les marchés africains.",
    cta: { slug: "founders", label: "Explorer la carte" },
    legendPortfolio: "Présence du portefeuille",
    legendOther: "Autres marchés africains",
    hint: "Sélectionnez un marché en surbrillance pour voir ses fondateurs.",
    exploreCountry: "Explorer les fondateurs :",
    countriesLabel: "Marchés du portefeuille",
    schematic: "Carte schématique. Les tuiles ne sont pas à l’échelle.",
  },
  ecosystem: {
    eyebrow: "Investisseurs et partenaires",
    title: "Plus que des logos. Une valeur concrète.",
    description:
      "Technologie, capital, accès aux marchés, mentorat et voies commerciales, réunis autour de la progression des fondateurs.",
    cta: { slug: "partners", label: "Explorer les opportunités de partenariat" },
    values: [
      { id: "technology", title: "Technologie", description: "Expertise technique, outils et plateformes selon disponibilité." },
      { id: "capital", title: "Capital", description: "Découverte du portefeuille et préparation à l’investissement." },
      { id: "markets", title: "Marchés", description: "Meilleure compréhension des clients, secteurs et réglementations." },
      { id: "mentorship", title: "Mentorat", description: "Une expérience opérationnelle applicable immédiatement." },
      { id: "commercial", title: "Accès commercial", description: "Pilotes, clients et partenariats quand l’adéquation est réelle." },
    ],
  },
  latest: {
    eyebrow: "Actualités",
    title: "Ce qui se passe maintenant.",
    description:
      "Histoires de fondateurs, étapes du portefeuille et nouvelles du programme : ce qui a changé et pourquoi c’est important.",
    cta: { slug: "insights", label: "Voir les actualités" },
    empty: "",
  },
  closing: {
    eyebrow: "Prochaine étape",
    title: "Vous construisez quelque chose qui peut grandir ?",
    description: "Choisissez le parcours qui correspond à votre situation.",
    investorCta: { slug: "founders", label: "Explorer le portefeuille" },
  },
};

const COPY: Record<Locale, HomeV2Copy> = { en, fr };

export function homeV2CopyFor(locale: Locale): HomeV2Copy {
  return COPY[locale];
}
