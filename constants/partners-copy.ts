import type { Locale } from "@/constants/locales";
import type { PartnersPageCopy } from "@/types/marketing-page";

const en: PartnersPageCopy = {
  hero: {
    eyebrow: "Investors & partners",
    titleLead: "Find the founders.",
    titleAccent: "Understand the opportunity.",
    description:
      "Explore the portfolio, sectors and markets represented across ASIP, follow current and upcoming programme activity, and speak with us about relevant investment, technology and commercial collaboration.",
    cta: { slug: "contact", label: "Discuss collaboration" },
    proof: ["Investors", "Technology partners", "Corporates", "Mentors"],
  },
  proposition: {
    title: "Built for informed engagement.",
    description:
      "Start with the companies, sectors and markets. Then go deeper into verified founder outcomes, current programme activity and relevant introductions where founder consent and fit allow.",
  },
  types: {
    title: "Partner contribution model",
    description: "",
    columns: {
      type: "Partner type",
      value: "Value to founders",
      examples: "",
    },
    rows: [
      { id: "investors", type: "Investors", value: "Relevant portfolio discovery, founder introductions and investment-readiness dialogue.", examples: "" },
      { id: "technology", type: "Technology partners", value: "Technical expertise, tools, platforms, credits or specialist mentoring where available.", examples: "" },
      { id: "corporate", type: "Corporates", value: "Real business challenges, pilot pathways, customers and commercial partnerships.", examples: "" },
      { id: "development", type: "Development / public sector", value: "Country initiatives, founder programmes, grants, inclusion and impact collaboration.", examples: "" },
      { id: "mentors", type: "Mentors / operators", value: "Practical operating experience founders can apply immediately.", examples: "" },
      { id: "media", type: "Media / ecosystem", value: "Credible founder visibility, events, research and access to wider communities.", examples: "" },
    ],
  },
  logos: {
    title: "An ecosystem built around founder progress.",
    description:
      "ASIP has worked with ecosystem partners including Startupbootcamp AfriTech, AWS, Google, Microsoft, IBM, FMO, the United Nations and VC4A.",
    bringsLabel: "What founders get:",
  },
  ctaSection: {
    title: "Find the founders. Understand the opportunity.",
    description: "",
    slug: "contact",
    label: "Discuss collaboration",
  },
};

const fr: PartnersPageCopy = {
  hero: {
    eyebrow: "Investisseurs et partenaires",
    titleLead: "Trouvez les fondateurs.",
    titleAccent: "Comprenez l’opportunité.",
    description:
      "Explorez le portefeuille, les secteurs et les marchés représentés dans ASIP, suivez l’activité en cours et à venir du programme, et échangez avec nous sur les collaborations d’investissement, technologiques et commerciales pertinentes.",
    cta: { slug: "contact", label: "Discuter d’une collaboration" },
    proof: ["Investisseurs", "Partenaires technologiques", "Entreprises", "Mentors"],
  },
  proposition: {
    title: "Conçu pour un engagement éclairé.",
    description:
      "Commencez par les entreprises, les secteurs et les marchés. Allez ensuite plus loin avec les résultats vérifiés des fondateurs, l’activité en cours du programme et des mises en relation pertinentes, lorsque le consentement des fondateurs et l’adéquation le permettent.",
  },
  types: {
    title: "Modèle de contribution des partenaires",
    description: "",
    columns: { type: "Type de partenaire", value: "Valeur pour les fondateurs", examples: "" },
    rows: [
      { id: "investors", type: "Investisseurs", value: "Découverte pertinente du portefeuille, mises en relation avec les fondateurs et dialogue sur la préparation à l’investissement.", examples: "" },
      { id: "technology", type: "Partenaires technologiques", value: "Expertise technique, outils, plateformes, crédits ou mentorat spécialisé selon disponibilité.", examples: "" },
      { id: "corporate", type: "Entreprises", value: "Vrais défis métier, voies vers des pilotes, clients et partenariats commerciaux.", examples: "" },
      { id: "development", type: "Développement / secteur public", value: "Initiatives nationales, programmes pour fondateurs, subventions, inclusion et collaboration à impact.", examples: "" },
      { id: "mentors", type: "Mentors / opérateurs", value: "Une expérience opérationnelle que les fondateurs peuvent appliquer immédiatement.", examples: "" },
      { id: "media", type: "Médias / écosystème", value: "Visibilité crédible des fondateurs, événements, recherche et accès à des communautés plus larges.", examples: "" },
    ],
  },
  logos: {
    title: "Un écosystème construit autour de la progression des fondateurs.",
    description:
      "ASIP a travaillé avec des partenaires de l’écosystème, dont Startupbootcamp AfriTech, AWS, Google, Microsoft, IBM, FMO, les Nations unies et VC4A.",
    bringsLabel: "Ce que les fondateurs reçoivent :",
  },
  ctaSection: {
    title: "Trouvez les fondateurs. Comprenez l’opportunité.",
    description: "",
    slug: "contact",
    label: "Discuter d’une collaboration",
  },
};

export function partnersCopyFor(locale: Locale): PartnersPageCopy {
  return locale === "fr" ? fr : en;
}
