import type { Locale } from "@/constants/locales";
import type { HomePageCopy } from "@/types/marketing-page";

/**
 * Optional hero motion assets. Leave null until Telecel-approved footage
 * is in `public/media/home/`. Copy stays readable without them.
 */
const en: HomePageCopy = {
  pathways: {
    prompt: "I am",
    investor: { slug: "founders", label: "Investor" },
    startupLabel: "Startup",
  },
  hero: {
    brand: "ASIP",
    eyebrow: "Africa Startup Initiative Program",
    endorsement: "A Telecel Group Program",
    title: "African founders. Built to scale.",
    titleLines: ["African founders.", "Built to scale."],
    description:
      "ASIP connects African technology founders to expertise, capital pathways, market access and relationships that help ambitious businesses build, commercialize and grow.",
    primaryCta: { slug: "founders", label: "Explore the founders" },
    secondaryCta: { slug: "register-interest", label: "Register interest" },
    nextCohort: { label: "2026 next chapter", href: "#next-chapter" },
    continuumAlts: [
      "ASIP founder focused in conversation at a program table",
      "ASIP founders listening during a program pitch session",
      "ASIP founders collaborating at a program working table",
      "ASIP mentor and founders in conversation at a program event",
    ],
  },
  cohortFilm: {
    eyebrow: "Cohort 3",
    title: "A chapter in motion.",
    description:
      "Founders building, connecting and presenting during ASIP Cohort 3.",
    playLabel: "Play Cohort 3 film",
    watchLabel: "Watch the film",
    posterAlt:
      "ASIP Cohort 3 founders together at a program event",
  },
  impactYears: {
    title: "Impact, with a paper trail.",
    description:
      "Verified founder outcomes show what the portfolio has built, reached and strengthened. A figure appears here only after it has a source, a period, an owner and permission.",
    metrics: [],
    notice: "",
  },
  platform: {
    title: "From potential to progress.",
    description:
      "ASIP brings the right capabilities and people together around founders at the moments they matter most.",
    steps: [
      {
        id: "discover",
        title: "Discover",
        description:
          "Find bold teams solving meaningful problems in African markets.",
      },
      {
        id: "build",
        title: "Build",
        description:
          "Strengthen product, strategy, operations, leadership and investor readiness.",
      },
      {
        id: "connect",
        title: "Open access",
        description:
          "Open doors to mentors, investors, partners, technical expertise and market intelligence.",
      },
      {
        id: "commercialise",
        title: "Commercialize",
        description:
          "Create pathways to pilots, customers and practical partnerships.",
      },
      {
        id: "scale",
        title: "Scale",
        description:
          "Support growth across markets and keep strong founders close to the ecosystem.",
      },
    ],
  },
  outcomes: {
    eyebrow: "Impact",
    title: "The story is what happened next.",
    description:
      "Impact is more than the number of startups in a cohort. It is what founders built afterwards - stronger businesses, new markets, and technology that improves how people live and work.",
    features: [
      {
        id: "businesses",
        title: "Stronger businesses.",
        description:
          "Teams leave with sharper product strategy, tighter operations and commercial footing that holds under pressure.",
      },
      {
        id: "markets",
        title: "Wider reach.",
        description:
          "Introductions open routes to customers, pilots and partners across African markets.",
      },
      {
        id: "readiness",
        title: "Ready for what is next.",
        description:
          "Founders build the evidence and relationships that help the next growth stage land.",
      },
    ],
    cta: { slug: "impact", label: "See the impact" },
    imageAlt:
      "Rural Farmers Hub founder receiving an ASIP program award",
    insetAlt: "An ASIP founder celebrating with her team",
  },
  ecosystem: {
    title: "The right opportunity can change a company’s trajectory.",
    description:
      "ASIP works across a network of mentors, investors, corporates, technology partners, development institutions and ecosystem organizations to open practical opportunities for founder growth.",
    cta: { slug: "partners", label: "Explore Partnership Opportunities" },
    roles: [
      {
        id: "mentors",
        title: "Mentors",
        description:
          "Operators share experience through structured sessions that help founding teams make sharper product and commercial decisions.",
      },
      {
        id: "investors",
        title: "Investors",
        description:
          "Introductions to capital pathways when a venture is ready for the next round - not a generic pitch pipeline.",
      },
      {
        id: "corporates",
        title: "Corporates",
        description:
          "Routes to pilots, customers and commercial partnerships that test products in real markets.",
      },
      {
        id: "technology",
        title: "Technology partners",
        description:
          "Technical expertise and infrastructure that help products reach users faster.",
      },
      {
        id: "institutions",
        title: "Development institutions",
        description:
          "Program collaboration that extends founder access to markets, networks and follow-on opportunities.",
      },
      {
        id: "ecosystem",
        title: "Ecosystem organizations",
        description:
          "Community, events and knowledge that keep founders moving forward after a cohort ends.",
      },
    ],
  },
  telecel: {
    title: "Powered by Connecting Energies.",
    description:
      "ASIP is a Telecel Group Program. It draws on Telecel’s African legacy, digital expertise and relationships to back strong founders with opportunities that can accelerate real-world adoption.",
    ctaLabel: "About Telecel Group",
    prompt: "Who stands behind ASIP?",
    inputPlaceholder: "Ask about Telecel Group",
  },
  nextChapter: {
    eyebrow: "2026 cohort",
    title: "AI that earns its place in the business.",
    description:
      "The 2026 chapter supports startups using AI to solve existing business challenges and demonstrate measurable gains in revenue, cost efficiency, speed, or market reach.",
    eligibility: {
      title: "Who should apply",
      items: [
        "Solve a real and meaningful problem (business, industry, or community-related).",
        "Have at least one woman represented within the founding team or executive leadership.",
        "Have a proven product or solution in market.",
        "Demonstrate existing revenue or commercial traction.",
        "Have a founder working full-time within the business.",
      ],
    },
    theme: {
      name: "AI Advantage in Action",
      status: "working",
      statusLabel: "Working theme",
      summary:
        "Not AI for its own sake. Practical tools that make real African businesses measurably better.",
    },
    pillars: [
      {
        id: "problem",
        label: "01",
        title: "A real business problem",
        description:
          "Start with an operator’s pain point in a live market, not a model looking for a use case.",
      },
      {
        id: "applied",
        label: "02",
        title: "AI applied, not showcased",
        description:
          "Embed AI where it changes how work gets done: decisions, operations, service and access.",
      },
      {
        id: "advantage",
        label: "03",
        title: "Advantage you can measure",
        description:
          "Show the difference in numbers a customer, partner or investor would recognize.",
      },
    ],
    primaryCta: { slug: "register-interest", label: "Register interest" },
    secondaryCta: { slug: "contact", label: "Discuss a partnership" },
  },
  latest: {
    eyebrow: "Latest",
    title: "From the portfolio.",
    description:
      "Founder stories, portfolio progress, program updates and useful perspectives from the people building Africa’s next technology companies.",
    cta: { slug: "insights", label: "Explore insights" },
    empty: "Insights from the portfolio will appear here as stories are published.",
  },
};

const fr: HomePageCopy = {
  pathways: {
    prompt: "Je suis",
    investor: { slug: "founders", label: "Investisseur" },
    startupLabel: "Startup",
  },
  hero: {
    brand: "ASIP",
    eyebrow: "Programme africain d’initiative pour les startups",
    endorsement: "Un programme du Groupe Telecel",
    title: "Fondateurs africains. Faits pour grandir.",
    titleLines: ["Fondateurs africains.", "Faits pour grandir."],
    nextCohort: { label: "Chapitre 2026", href: "#next-chapter" },
    description:
      "ASIP relie des fondateurs technologiques africains à l’expertise, aux voies de financement, à l’accès aux marchés et aux relations qui aident les entreprises ambitieuses à construire, commercialiser et grandir.",
    primaryCta: { slug: "founders", label: "Explorer les fondateurs" },
    secondaryCta: { slug: "register-interest", label: "Manifester votre intérêt" },
    continuumAlts: [
      "Fondateur ASIP concentré en conversation à une table du programme",
      "Fondateurs ASIP à l’écoute lors d’une session de pitch du programme",
      "Fondateurs ASIP collaborant autour d’une table de travail du programme",
      "Mentor et fondateurs ASIP en conversation lors d’un événement du programme",
    ],
  },
  cohortFilm: {
    eyebrow: "Cohorte 3",
    title: "Un chapitre en mouvement.",
    description:
      "Des fondateurs qui construisent, se connectent et présentent pendant la Cohorte 3 d’ASIP.",
    playLabel: "Lancer le film de la Cohorte 3",
    watchLabel: "Voir le film",
    posterAlt:
      "Fondateurs ASIP de la Cohorte 3 réunis lors d’un événement du programme",
  },
  impactYears: {
    title: "Un impact, avec un dossier.",
    description:
      "Les résultats vérifiés des fondateurs montrent ce que le portefeuille a construit, atteint et renforcé. Un chiffre n’apparaît ici qu’avec une source, une période, un responsable et une autorisation.",
    metrics: [],
    notice: "",
  },
  platform: {
    title: "Du potentiel au progrès.",
    description:
      "ASIP rassemble les capacités et les personnes dont les fondateurs ont besoin, au moment où elles comptent le plus.",
    steps: [
      {
        id: "discover",
        title: "Découvrir",
        description:
          "Identifier des équipes audacieuses qui résolvent des problèmes concrets sur les marchés africains.",
      },
      {
        id: "build",
        title: "Construire",
        description:
          "Renforcer le produit, la stratégie, les opérations, le leadership et la préparation investisseurs.",
      },
      {
        id: "connect",
        title: "Ouvrir l’accès",
        description:
          "Ouvrir des portes vers mentors, investisseurs, partenaires, expertise technique et intelligence de marché.",
      },
      {
        id: "commercialise",
        title: "Commercialiser",
        description:
          "Créer des voies vers des pilotes, des clients et des partenariats concrets.",
      },
      {
        id: "scale",
        title: "Changer d’échelle",
        description:
          "Accélérer la croissance d’un marché à l’autre et garder les fondateurs solides proches de l’écosystème.",
      },
    ],
  },
  outcomes: {
    eyebrow: "Impact",
    title: "L’histoire, c’est ce qui s’est passé ensuite.",
    description:
      "L’impact ne se résume pas au nombre de startups d’une cohorte. C’est ce que les fondateurs ont construit après - des entreprises plus solides, de nouveaux marchés et des technologies qui améliorent la façon dont les gens vivent et travaillent.",
    features: [
      {
        id: "businesses",
        title: "Des entreprises plus solides.",
        description:
          "Les équipes repartent avec une stratégie produit plus nette, des opérations plus serrées et un ancrage commercial qui tient la pression.",
      },
      {
        id: "markets",
        title: "Une portée plus large.",
        description:
          "Des introductions ouvrent des voies vers clients, pilotes et partenaires sur les marchés africains.",
      },
      {
        id: "readiness",
        title: "Prêts pour la suite.",
        description:
          "Les fondateurs construisent les preuves et les relations qui aident l’étape de croissance suivante à se concrétiser.",
      },
    ],
    cta: { slug: "impact", label: "Voir l’impact" },
    imageAlt:
      "Le fondateur de Rural Farmers Hub reçoit une distinction du programme ASIP",
    insetAlt: "Une fondatrice ASIP célèbre avec son équipe",
  },
  ecosystem: {
    title: "La bonne opportunité peut changer la trajectoire d’une entreprise.",
    description:
      "ASIP travaille avec un réseau de mentors, d’investisseurs, d’entreprises, de partenaires technologiques, d’institutions de développement et d’organisations de l’écosystème pour ouvrir aux fondateurs des opportunités concrètes de croissance.",
    cta: { slug: "partners", label: "Découvrir les opportunités de partenariat" },
    roles: [
      {
        id: "mentors",
        title: "Mentors",
        description:
          "Des opérateurs partagent leur expérience lors de sessions structurées, pour aider les équipes à prendre des décisions produit et commerciales plus nettes.",
      },
      {
        id: "investors",
        title: "Investisseurs",
        description:
          "Des introductions vers des voies de financement lorsque l’entreprise est prête pour le tour suivant - pas un pipeline de pitchs génériques.",
      },
      {
        id: "corporates",
        title: "Entreprises",
        description:
          "Des voies vers des pilotes, des clients et des partenariats commerciaux qui testent les produits sur de vrais marchés.",
      },
      {
        id: "technology",
        title: "Partenaires technologiques",
        description:
          "Expertise technique et infrastructure pour aider les produits à atteindre les utilisateurs plus vite.",
      },
      {
        id: "institutions",
        title: "Institutions de développement",
        description:
          "Une collaboration de programme qui élargit l’accès des fondateurs aux marchés, aux réseaux et aux opportunités de suivi.",
      },
      {
        id: "ecosystem",
        title: "Organisations de l’écosystème",
        description:
          "Communauté, événements et connaissances qui font avancer les fondateurs après une cohorte.",
      },
    ],
  },
  telecel: {
    title: "Porté par Connecting Energies.",
    description:
      "ASIP est un programme du Groupe Telecel. Il s’appuie sur l’héritage africain de Telecel, son expertise digitale et ses relations pour soutenir des fondateurs solides avec des opportunités qui peuvent accélérer l’adoption réelle.",
    ctaLabel: "À propos du Groupe Telecel",
    prompt: "Qui se tient derrière ASIP ?",
    inputPlaceholder: "En savoir plus sur le Groupe Telecel",
  },
  nextChapter: {
    eyebrow: "Cohorte 2026",
    title: "Une IA qui mérite sa place dans l’entreprise.",
    description:
      "Le chapitre 2026 soutient des startups qui utilisent l’IA pour relever des défis concrets des entreprises et démontrer des gains mesurables en matière de revenus, de maîtrise des coûts, de rapidité ou de portée commerciale.",
    eligibility: {
      title: "Qui peut candidater",
      items: [
        "Résoudre un problème réel et significatif (lié à une entreprise, un secteur ou une communauté).",
        "Compter au moins une femme dans l’équipe fondatrice ou la direction exécutive.",
        "Disposer d’un produit ou d’une solution ayant fait ses preuves sur le marché.",
        "Démontrer des revenus existants ou une traction commerciale.",
        "Avoir au moins un fondateur ou une fondatrice à temps plein dans l’entreprise.",
      ],
    },
    theme: {
      name: "AI Advantage in Action",
      status: "working",
      statusLabel: "Thème provisoire",
      summary:
        "Pas l’IA pour elle-même. Des outils concrets qui rendent les entreprises africaines mesurablement meilleures.",
    },
    pillars: [
      {
        id: "problem",
        label: "01",
        title: "Un vrai problème business",
        description:
          "Partir d’un point de friction réel sur un marché vivant, pas d’un modèle en quête d’usage.",
      },
      {
        id: "applied",
        label: "02",
        title: "L’IA appliquée, pas exhibée",
        description:
          "Intégrer l’IA là où elle change le travail : décisions, opérations, service et accès.",
      },
      {
        id: "advantage",
        label: "03",
        title: "Un avantage mesurable",
        description:
          "Montrer la différence en chiffres qu’un client, un partenaire ou un investisseur reconnaîtrait.",
      },
    ],
    primaryCta: { slug: "register-interest", label: "Manifester votre intérêt" },
    secondaryCta: { slug: "contact", label: "Discuter d’un partenariat" },
  },
  latest: {
    eyebrow: "À la une",
    title: "Depuis le portefeuille.",
    description:
      "Parcours de fondateurs, progrès du portefeuille, actualités du programme et perspectives utiles de celles et ceux qui construisent les prochaines entreprises technologiques d’Afrique.",
    cta: { slug: "insights", label: "Explorer les perspectives" },
    empty:
      "Les perspectives du portefeuille apparaîtront ici à mesure que les contenus sont publiés.",
  },
};

export function homeCopyFor(locale: Locale): HomePageCopy {
  return locale === "fr" ? fr : en;
}
