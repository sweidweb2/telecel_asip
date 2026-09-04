import type { Locale } from "@/constants/locales";
import type { HomePageCopy } from "@/types/marketing-page";

/**
 * Optional hero motion assets. Leave null until Telecel-approved footage
 * is in `public/media/home/`. Copy stays readable without them.
 */
const en: HomePageCopy = {
  hero: {
    eyebrow: "Africa Startup Initiative Program · A Telecel Group Program",
    title: "African founders. Real solutions. Impact that scales.",
    description:
      "Since 2019, ASIP has connected high-potential African technology founders to the expertise, capital pathways, market access and relationships that help ambitious businesses build, commercialise and grow.",
    primaryCta: { slug: "founders", label: "Explore the founders" },
    secondaryCta: { slug: "register-interest", label: "Register interest" },
  },
  impactYears: {
    title: "Seven Years of Impact.",
    description:
      "ASIP started with a simple belief: African founders should have access to world-class opportunity without losing the local insight that makes their solutions matter. The strongest proof is what they have built since.",
    metrics: [],
    notice: "",
  },
  platform: {
    title: "From potential to progress.",
    description:
      "ASIP brings the right capabilities and connections together around founders at the moments they matter most.",
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
        title: "Connect",
        description:
          "Open doors to mentors, investors, partners, technical expertise and market intelligence.",
      },
      {
        id: "commercialise",
        title: "Commercialise",
        description:
          "Create pathways to pilots, customers and practical partnerships.",
      },
      {
        id: "scale",
        title: "Scale",
        description:
          "Support growth across markets and keep strong founders connected to the ecosystem.",
      },
    ],
  },
  founders: {
    title: "Meet the founders building what Africa needs next.",
    description:
      "Across financial services, health, agriculture, education, clean technology, commerce and more, ASIP founders are turning first-hand market insight into solutions designed to scale.",
    cta: { slug: "founders", label: "Explore all founders" },
    empty:
      "Founder stories will appear here as verified profiles are published.",
  },
  outcomes: {
    title: "The story is what happened next.",
    description:
      "Impact is more than the number of startups supported. It is what founders built afterwards: stronger businesses, new markets, jobs, partnerships, investment readiness and technology that improves how people live and work.",
    cta: { slug: "impact", label: "See the impact" },
    empty:
      "Founder outcomes will appear here once verified stories are ready to publish.",
  },
  ecosystem: {
    title: "The right connection can change a company’s trajectory.",
    description:
      "ASIP works across a network of mentors, investors, corporates, technology partners, development institutions and ecosystem organisations to connect founders with practical opportunities for growth.",
    cta: { slug: "partners", label: "Partner with ASIP" },
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
          "Introductions to capital pathways when a venture is ready for the next round — not a generic pitch pipeline.",
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
          "Programme collaboration that extends founder access to markets, networks and follow-on opportunities.",
      },
      {
        id: "ecosystem",
        title: "Ecosystem organisations",
        description:
          "Community, events and knowledge that keep founders connected after a cohort ends.",
      },
    ],
  },
  telecel: {
    title: "Powered by Connecting Energies.",
    description:
      "ASIP is a Telecel Group Program. It draws on Telecel’s African legacy, digital expertise and relationships to help connect strong founders with opportunities that can accelerate real-world adoption.",
    ctaLabel: "About Telecel Group",
  },
  nextChapter: {
    title: "The next chapter starts with the builders.",
    description:
      "ASIP is preparing its 2026 chapter with renewed focus on practical founder growth, stronger ecosystem connections and technology-led solutions built for real African markets.",
    primaryCta: { slug: "register-interest", label: "Register interest" },
    secondaryCta: { slug: "contact", label: "Discuss a partnership" },
  },
  latest: {
    eyebrow: "Latest",
    title: "From the portfolio.",
    description:
      "Founder stories, portfolio progress, programme updates and useful perspectives from the people building Africa’s next technology companies.",
    cta: { slug: "insights", label: "Explore insights" },
    empty: "Insights from the portfolio will appear here as stories are published.",
  },
};

const fr: HomePageCopy = {
  hero: {
    eyebrow:
      "Programme africain d’initiative pour les startups · Un programme du Groupe Telecel",
    title: "Fondateurs africains. Solutions concrètes. Un impact qui grandit.",
    description:
      "Depuis 2019, ASIP connecte des fondateurs technologiques africains à fort potentiel à l’expertise, aux voies de financement, à l’accès marché et aux relations qui aident les entreprises ambitieuses à construire, commercialiser et grandir.",
    primaryCta: { slug: "founders", label: "Explorer les fondateurs" },
    secondaryCta: { slug: "register-interest", label: "Manifester votre intérêt" },
  },
  impactYears: {
    title: "Sept ans d’impact.",
    description:
      "ASIP est parti d’une conviction simple : les fondateurs africains doivent avoir accès à des opportunités de classe mondiale sans perdre l’ancrage local qui donne du poids à leurs solutions. La preuve la plus forte, c’est ce qu’ils ont construit depuis.",
    metrics: [],
    notice: "",
  },
  platform: {
    title: "Du potentiel au progrès.",
    description:
      "ASIP rassemble les capacités et les connexions dont les fondateurs ont besoin, au moment où elles comptent le plus.",
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
        title: "Connecter",
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
          "Accélérer la croissance d’un marché à l’autre et garder les fondateurs solides connectés à l’écosystème.",
      },
    ],
  },
  founders: {
    title: "Les fondateurs qui construisent ce dont l’Afrique a besoin ensuite.",
    description:
      "Finance, santé, agriculture, éducation, technologies propres, commerce et plus : les fondateurs ASIP transforment une connaissance de première main du marché en solutions conçues pour grandir.",
    cta: { slug: "founders", label: "Explorer tous les fondateurs" },
    empty:
      "Les parcours des fondateurs apparaîtront ici à mesure que les profils vérifiés sont publiés.",
  },
  outcomes: {
    title: "L’histoire, c’est ce qui s’est passé ensuite.",
    description:
      "L’impact ne se résume pas au nombre de startups accompagnées. C’est ce que les fondateurs ont construit après : des entreprises plus solides, de nouveaux marchés, des emplois, des partenariats, une préparation investisseurs et des technologies qui changent la façon dont les gens vivent et travaillent.",
    cta: { slug: "impact", label: "Voir l’impact" },
    empty:
      "Les résultats des fondateurs apparaîtront ici une fois les parcours vérifiés prêts à être publiés.",
  },
  ecosystem: {
    title: "La bonne connexion peut changer la trajectoire d’une entreprise.",
    description:
      "ASIP travaille avec un réseau de mentors, d’investisseurs, d’entreprises, de partenaires technologiques, d’institutions de développement et d’organisations de l’écosystème pour relier les fondateurs à des opportunités concrètes de croissance.",
    cta: { slug: "partners", label: "Devenir partenaire d’ASIP" },
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
          "Des introductions vers des voies de financement lorsque l’entreprise est prête pour le tour suivant — pas un pipeline de pitchs génériques.",
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
          "Communauté, événements et connaissances qui gardent les fondateurs connectés après une cohorte.",
      },
    ],
  },
  telecel: {
    title: "Powered by Connecting Energies.",
    description:
      "ASIP est un programme du Groupe Telecel. Il s’appuie sur l’héritage africain de Telecel, son expertise digitale et ses relations pour connecter des fondateurs solides à des opportunités qui peuvent accélérer l’adoption réelle.",
    ctaLabel: "À propos du Groupe Telecel",
  },
  nextChapter: {
    title: "Le prochain chapitre commence avec ceux qui construisent.",
    description:
      "ASIP prépare son chapitre 2026, avec un accent renouvelé sur la croissance concrète des fondateurs, des connexions écosystème plus fortes et des solutions technologiques conçues pour les marchés africains réels.",
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
