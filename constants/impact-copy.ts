import type { Locale } from "@/constants/locales";
import type { ImpactPageCopy } from "@/types/marketing-page";

/**
 * Impact public page.
 *
 * Metrics rule: do not publish headline numbers until each has a source,
 * measurement period, owner, last-verified date and permission status.
 * Case studies stay a labelled template until founder-specific facts are verified.
 */
const en: ImpactPageCopy = {
  hero: {
    eyebrow: "Impact",
    title: "What founders built next.",
    description:
      "ASIP’s impact is measured by what founders build after the programme: stronger companies, better products, new markets, investment readiness, jobs, partnerships and technology that changes how people live and work.",
    cta: { slug: "founders", label: "Explore founder stories" },
  },
  progress: {
    eyebrow: "Seven years of impact",
    title: "Progress you can trace back to founders.",
    description:
      "Since ASIP launched in 2019, the portfolio has grown across sectors and markets. That journey is told through verified founder outcomes, not broad claims. Every published number leads to a source, a company or a story.",
  },
  lenses: {
    eyebrow: "Impact lenses",
    title: "Impact Lens",
    description:
      "How we track, evaluate, and measure the long-term growth and reach of our portfolio.",
    footnote:
      "Evidence requirements stay internal. Public pages never show unverified figures.",
    columns: {
      lens: "Impact lens",
      framing: "Public framing",
      evidence: "Evidence needed",
    },
    rows: [
      {
        id: "pipeline",
        lens: "Pipeline",
        framing: "Founder and application reach across African markets",
        evidence: "Applications, countries, sectors, selection rate, period.",
      },
      {
        id: "inclusion",
        lens: "Inclusion",
        framing: "Who is building and where opportunities are reaching",
        evidence: "Women-led definition, founder data, geography, date.",
      },
      {
        id: "growth",
        lens: "Business growth",
        framing: "How companies progress after ASIP",
        evidence: "Funding, revenue, customers, markets, survival/status.",
      },
      {
        id: "commercialisation",
        lens: "Commercialisation",
        framing: "Where ideas become pilots, customers and partnerships",
        evidence:
          "Named pilots, contracts, proof-of-concepts, partner confirmation.",
      },
      {
        id: "jobs",
        lens: "Jobs & capability",
        framing: "How founder growth translates into opportunity",
        evidence:
          "Direct/indirect jobs, methodology, founder skills, mentor records.",
      },
      {
        id: "sector",
        lens: "Sector outcomes",
        framing: "Real-world effect of portfolio products",
        evidence:
          "Product-level users, patients, farmers, transactions, tickets, schools, etc.",
      },
    ],
  },
  caseStudy: {
    eyebrow: "Case studies",
    title: "From a local problem to a scalable solution.",
    templateLabel: "Story template",
    body: "[Startup] entered ASIP facing [specific barrier]. Through [specific ASIP support], the team strengthened [product, market, investment or operating capability]. Since then, it has [validated outcome]. The result shows what can happen when a strong founder gets the right connection at the right time.",
    note: "Published case studies replace every placeholder with verified, founder-specific facts. Generic success copy is not published as a real story.",
  },
  evidenceRule:
    "Every published metric has a source, measurement period, owner, last-verified date and permission status. Figures stay unpublished until those are in place.",
  ctaSection: {
    title: "Meet the founders behind the outcomes",
    description:
      "ASIP’s impact lives in companies, products and markets — not in unsupported headline numbers.",
    slug: "founders",
    label: "Explore founder stories",
  },
};

const fr: ImpactPageCopy = {
  hero: {
    eyebrow: "Impact",
    title: "Ce que les fondateurs ont construit ensuite.",
    description:
      "L’impact d’ASIP se mesure à ce que les fondateurs construisent après le programme : des entreprises plus solides, de meilleurs produits, de nouveaux marchés, une préparation à l’investissement, des emplois, des partenariats et des technologies qui changent la façon dont les gens vivent et travaillent.",
    cta: { slug: "founders", label: "Découvrir les histoires de fondateurs" },
  },
  progress: {
    eyebrow: "Sept ans d’impact",
    title: "Des progrès que l’on peut retracer jusqu’aux fondateurs.",
    description:
      "Depuis le lancement d’ASIP en 2019, le portefeuille s’est développé à travers les secteurs et les marchés. Ce parcours se raconte par des résultats de fondateurs vérifiés, pas par des affirmations générales. Chaque chiffre publié renvoie à une source, une entreprise ou une histoire.",
  },
  lenses: {
    eyebrow: "Axes d’impact",
    title: "Axes d’impact",
    description:
      "Comment nous suivons, évaluons et mesurons la croissance et la portée à long terme de notre portefeuille.",
    footnote:
      "Les exigences de preuve restent internes. Les pages publiques ne montrent jamais de chiffres non vérifiés.",
    columns: {
      lens: "Axe d’impact",
      framing: "Formulation publique",
      evidence: "Preuves requises",
    },
    rows: [
      {
        id: "pipeline",
        lens: "Pipeline",
        framing:
          "Portée des fondateurs et des candidatures sur les marchés africains",
        evidence: "Candidatures, pays, secteurs, taux de sélection, période.",
      },
      {
        id: "inclusion",
        lens: "Inclusion",
        framing: "Qui construit, et où les opportunités arrivent",
        evidence:
          "Définition des entreprises dirigées par des femmes, données fondateurs, géographie, date.",
      },
      {
        id: "growth",
        lens: "Croissance des entreprises",
        framing: "Comment les entreprises progressent après ASIP",
        evidence: "Financement, revenus, clients, marchés, survie/statut.",
      },
      {
        id: "commercialisation",
        lens: "Commercialisation",
        framing:
          "Là où les idées deviennent pilotes, clients et partenariats",
        evidence:
          "Pilotes nommés, contrats, preuves de concept, confirmation des partenaires.",
      },
      {
        id: "jobs",
        lens: "Emplois et compétences",
        framing:
          "Comment la croissance des fondateurs se traduit en opportunités",
        evidence:
          "Emplois directs/indirects, méthodologie, compétences des fondateurs, suivi des mentors.",
      },
      {
        id: "sector",
        lens: "Résultats sectoriels",
        framing: "L’effet concret des produits du portefeuille",
        evidence:
          "Utilisateurs, patients, agriculteurs, transactions, tickets, écoles, etc. au niveau du produit.",
      },
    ],
  },
  caseStudy: {
    eyebrow: "Études de cas",
    title: "D’un problème local à une solution capable de grandir.",
    templateLabel: "Canevas de récit",
    body: "[Startup] a rejoint ASIP face à [obstacle précis]. Grâce à [accompagnement ASIP précis], l’équipe a renforcé [produit, marché, préparation à l’investissement ou capacité opérationnelle]. Depuis, elle a [résultat vérifié]. Ce parcours montre ce qui peut se produire lorsqu’un fondateur solide obtient la bonne connexion au bon moment.",
    note: "Les études de cas publiées remplacent chaque crochet par des faits vérifiés, propres au fondateur. Un texte générique de réussite n’est pas publié comme s’il s’agissait d’une vraie histoire.",
  },
  evidenceRule:
    "Chaque indicateur publié a une source, une période de mesure, un responsable, une date de dernière vérification et un statut d’autorisation. Les chiffres restent non publiés tant que ces éléments ne sont pas en place.",
  ctaSection: {
    title: "Rencontrez les fondateurs derrière les résultats",
    description:
      "L’impact d’ASIP vit dans des entreprises, des produits et des marchés — pas dans des chiffres sans source.",
    slug: "founders",
    label: "Découvrir les histoires de fondateurs",
  },
};

export function impactCopyFor(locale: Locale): ImpactPageCopy {
  return locale === "fr" ? fr : en;
}
