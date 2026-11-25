import type { Locale } from "@/constants/locales";
import type {
  MarketingContentSlug,
  MarketingPageCopy,
} from "@/types/marketing-page";

type MarketingCopy = Record<MarketingContentSlug, MarketingPageCopy>;

/** FAQ master copy, Text Pack v2 section 13 (final public answers). */
const FAQ_EN = {
  what: "ASIP is Telecel Group's Africa Startup Initiative Program, launched in 2019 to help ambitious technology founders build stronger companies through structured development, market access and an ecosystem of mentors, investors and partners.",
  ai: "It is the 2026 program direction, focused on founders applying AI to practical business challenges and measurable growth. Cohort details are published only when formally confirmed.",
  who: "Eligibility varies by cohort. ASIP generally looks for committed founders, a technology-led solution, evidence of a real market need and credible potential to scale in African markets.",
  open: "Not unless the website explicitly shows an open application state. If applications are closed, register your interest to receive confirmed dates, criteria and application details.",
  invest: "No. Participation in ASIP does not guarantee investment. Any investment discussion is subject to separate evaluation, terms and decision-making.",
  format: "Format varies by cohort. The confirmed delivery format, locations and timetable are published with the cohort details.",
  sectors: "ASIP has supported technology ventures across sectors including FinTech, HealthTech, AgriTech, InsurTech, EdTech, CleanTech, eCommerce and related technology-enabled fields. Cohort-specific priorities may vary.",
  telecel: "Telecel Group provides program backing and access to relevant market context, expertise and relationships. Specific support varies by cohort and by founder need.",
  investors: "Yes. Public founder profiles can be explored on the website. Relevant introductions or non-public information are subject to founder consent, confidentiality and applicable process.",
  organizations: "Organizations can contribute through technology, expertise, market access, pilots, commercial collaboration, investment dialogue, founder visibility or other relevant ecosystem roles.",
  impact: "Material public claims are reviewed against a named source, reporting period and owner before publication. Metrics that cannot be substantiated are not published.",
} as const;

const en: MarketingCopy = {
  about: {
    eyebrow: "About ASIP",
    title: "Supporting the founders who are shaping Africa’s next chapter.",
    description:
      "ASIP is a Telecel Group Program supporting African founders with knowledge, capital pathways, markets, and relationships that can accelerate their growth.",
    notice: "",
    sectionTitle: "Origin, purpose and the journey",
    sectionDescription: "",
    cards: [],
    cta: { slug: "founders", label: "Explore the portfolio" },
    ctaSection: {
      title: "Meet the people building what comes next.",
      description: "",
      slug: "founders",
      label: "Explore the portfolio",
    },
    aboutNarrative: {
      story: {
        title: "Backing founders, building for Africa.",
        eyebrow: "Our story",
        paragraphs: [
          "Africa does not lack ideas. The harder gap is often access: to the right expertise, market insight, technology, capital pathways and commercial relationships at the right moment. ASIP was created to narrow that gap. Since 2019, the program has worked with founders across sectors and markets, helping teams sharpen what they are building, test growth assumptions and move toward stronger businesses.",
        ],
        features: [],
        imageCta: { slug: "founders", label: "Explore the portfolio" },
        bottomCta: {
          title: "Local insight is an advantage.",
          slug: "founders",
          label: "Explore the portfolio",
        },
      },
      mission: {
        eyebrow: "Mission",
        title: "Help ambitious founders build stronger companies.",
        imageLabel: "ASIP founders and ecosystem leaders gathering in Dakar",
        paragraphs: [
          "ASIP identifies technology ventures solving meaningful problems in African markets and strengthens the company behind the idea: product, strategy, market access, investor readiness and commercial opportunity.",
        ],
      },
      vision: {
        eyebrow: "Vision",
        title: "African technology companies built for local relevance and global scale.",
        imageLabel: "The ASIP ecosystem in conversation in Dakar",
        paragraphs: [
          "We want more category-defining companies to be built from the continent, grow across borders and compete on the strength of their products, teams and market insight.",
        ],
      },
      timeline: {
        eyebrow: "Journey",
        title: "Started in 2019. Still building.",
        milestones: [
          {
            year: "2019",
            description:
              "ASIP launches in Barcelona at Mobile World Congress, bringing African founders into a global technology and investment setting.",
          },
          {
            year: "2021",
            description:
              "ASIP expands its Pan-African founder pipeline and structured acceleration support.",
          },
          {
            year: "2022",
            description:
              "A new cohort broadens sector reach and deepens founder development.",
          },
          {
            year: "2023",
            description:
              "The program strengthens founder readiness and pathways to markets, partners and investment.",
          },
          {
            year: "2024",
            description:
              "Founders progress through acceleration, portfolio development and market-readiness support.",
          },
          {
            year: "2025",
            description:
              "Portfolio Support Year: continued founder relationships, portfolio support and preparation for the next phase.",
          },
          {
            year: "2026",
            description:
              "Building the AI Advantage: a renewed focus on founders applying AI to practical business challenges and growth.",
          },
        ],
      },
      ceoMessage: {
        published: false,
        imageLabel: "",
      },
      telecel: {
        eyebrow: "Telecel Group",
        title: "A Telecel Group Program.",
        imageLabel: "ASIP program leaders and founders in Dakar",
        paragraphs: [
          "ASIP is a Telecel Group Program supporting African founders with knowledge, capital pathways, markets, and relationships that can accelerate their growth. \"Connecting Energies\" is the brand principle behind that role, not a slogan to repeat across every page.",
        ],
      },
    },
  },
  founders: {
    eyebrow: "Founders",
    title: "Meet the people building what comes next.",
    description:
      "Explore ASIP founders by country, sector and cohort. Each profile should show the problem, the product, the founder insight and the progress that followed.",
    notice: "",
    sectionTitle: "Different markets. Different models. Real problems to solve.",
    sectionDescription:
      "The ASIP portfolio spans financial services, health, agriculture, education, insurance, clean technology, commerce, mobility and other technology-enabled sectors. The common thread is simple: founders building from direct market insight.",
    cards: [],
    cta: { slug: "founders", label: "Explore the portfolio" },
    ctaSection: {
      title: "Proof, not promises.",
      description: "",
      slug: "impact",
      label: "Explore founder outcomes",
    },
  },
  "register-interest": {
    eyebrow: "AI Next Cohort",
    title: "Your next build could start here.",
    description:
      "Applications are not currently open. Register your interest in the AI Next Cohort to receive confirmed dates, eligibility criteria and application details when announced.",
    notice: "",
    sectionTitle: "",
    sectionDescription: "",
    cards: [],
    cta: { slug: "contact", label: "Founder inquiry" },
    ctaSection: {
      title: "Start with the right conversation.",
      description: "Eligibility, cohort status, applications or founder support.",
      slug: "contact",
      label: "Founder inquiry",
    },
  },
  apply: {
    eyebrow: "AI Next Cohort",
    title: "Ready to build the AI Advantage?",
    description:
      "Applications are now open for the published cohort. Review the criteria before starting, then tell us what you are building, why it matters and where you need to grow.",
    notice: "",
    sectionTitle: "Application journey",
    sectionDescription: "",
    cards: [
      { title: "1. Check the criteria", description: "Review the published cohort focus, stage, geography and participation requirements." },
      { title: "2. Tell us what you are building", description: "Share the team, problem, product, traction, market and growth priorities." },
      { title: "3. Initial review", description: "Eligible applications are assessed against the published selection framework." },
      { title: "4. Founder conversations", description: "Shortlisted teams may be invited to interviews, diligence or a selection session." },
      { title: "5. Final selection", description: "Selected founders receive written program terms, timetable and participation requirements." },
      { title: "6. Onboarding", description: "The program begins with clear goals, baseline priorities and a structured support plan." },
    ],
    cta: { slug: "contact", label: "Founder inquiry" },
    ctaSection: {
      title: "Start with the right conversation.",
      description: "Eligibility, cohort status, applications or founder support.",
      slug: "contact",
      label: "Founder inquiry",
    },
  },
  faq: {
    eyebrow: "FAQ",
    title: "Questions, answered clearly.",
    description: "",
    notice: "",
    sectionTitle: "",
    sectionDescription: "",
    cards: [
      { title: "What is ASIP?", description: FAQ_EN.what },
      { title: "What is “Building the AI Advantage”?", description: FAQ_EN.ai },
      { title: "Who can apply?", description: FAQ_EN.who },
      { title: "Are applications open?", description: FAQ_EN.open },
      { title: "Does ASIP invest in every startup?", description: FAQ_EN.invest },
      { title: "Is the program virtual or in person?", description: FAQ_EN.format },
      { title: "Which sectors does ASIP support?", description: FAQ_EN.sectors },
      { title: "What does Telecel Group contribute?", description: FAQ_EN.telecel },
      { title: "Can investors access the portfolio?", description: FAQ_EN.investors },
      { title: "How can organizations work with ASIP?", description: FAQ_EN.organizations },
      { title: "How is impact verified?", description: FAQ_EN.impact },
    ],
    tabsSectionTitle: "Browse by topic",
    tabsSectionDescription: "",
    tabs: [
      {
        id: "programme",
        label: "Program",
        items: [
          { title: "What is ASIP?", description: FAQ_EN.what },
          { title: "What is “Building the AI Advantage”?", description: FAQ_EN.ai },
          { title: "Is the program virtual or in person?", description: FAQ_EN.format },
          { title: "Which sectors does ASIP support?", description: FAQ_EN.sectors },
          { title: "What does Telecel Group contribute?", description: FAQ_EN.telecel },
          { title: "How is impact verified?", description: FAQ_EN.impact },
        ],
      },
      {
        id: "founders",
        label: "Founders",
        items: [
          { title: "Who can apply?", description: FAQ_EN.who },
          { title: "Are applications open?", description: FAQ_EN.open },
          { title: "Does ASIP invest in every startup?", description: FAQ_EN.invest },
        ],
      },
      {
        id: "partners",
        label: "Investors & partners",
        items: [
          { title: "Can investors access the portfolio?", description: FAQ_EN.investors },
          { title: "How can organizations work with ASIP?", description: FAQ_EN.organizations },
        ],
      },
    ],
    ctaSection: {
      title: "Start with the right conversation.",
      description: "Choose the route that best matches what you need.",
      slug: "contact",
      label: "Contact ASIP",
    },
  },
};

/** FAQ, réponses publiques finales (Text Pack v2, section 13), traduction de travail. */
const FAQ_FR = {
  what: "ASIP est l’Africa Startup Initiative Program du Groupe Telecel, lancé en 2019 pour aider des fondateurs technologiques ambitieux à bâtir des entreprises plus solides grâce à un accompagnement structuré, à l’accès aux marchés et à un écosystème de mentors, d’investisseurs et de partenaires.",
  ai: "C’est l’orientation 2026 du programme, centrée sur les fondateurs qui appliquent l’IA à des défis métier concrets et à une croissance mesurable. Les détails de la cohorte ne sont publiés qu’une fois officiellement confirmés.",
  who: "L’éligibilité varie selon la cohorte. ASIP recherche généralement des fondateurs engagés, une solution technologique, la preuve d’un besoin réel du marché et un potentiel crédible de croissance sur les marchés africains.",
  open: "Non, sauf si le site affiche explicitement que les candidatures sont ouvertes. Si elles sont fermées, manifestez votre intérêt pour recevoir les dates, critères et modalités confirmés.",
  invest: "Non. La participation à ASIP ne garantit pas un investissement. Toute discussion d’investissement fait l’objet d’une évaluation, de conditions et d’une décision distinctes.",
  format: "Le format varie selon la cohorte. Le format, les lieux et le calendrier confirmés sont publiés avec les détails de la cohorte.",
  sectors: "ASIP a accompagné des entreprises technologiques dans des secteurs comme la FinTech, la HealthTech, l’AgriTech, l’InsurTech, l’EdTech, la CleanTech, l’e-commerce et d’autres domaines technologiques. Les priorités peuvent varier selon la cohorte.",
  telecel: "Le Groupe Telecel apporte le soutien du programme et l’accès à un contexte de marché, une expertise et des relations pertinentes. L’appui concret varie selon la cohorte et les besoins des fondateurs.",
  investors: "Oui. Les profils publics des fondateurs peuvent être consultés sur le site. Les mises en relation ou les informations non publiques dépendent du consentement des fondateurs, de la confidentialité et du processus applicable.",
  organisations: "Les organisations peuvent contribuer par la technologie, l’expertise, l’accès aux marchés, des pilotes, une collaboration commerciale, un dialogue d’investissement, la visibilité des fondateurs ou d’autres rôles pertinents dans l’écosystème.",
  impact: "Les affirmations publiques importantes sont vérifiées auprès d’une source nommée, d’une période de référence et d’un responsable avant publication. Les indicateurs qui ne peuvent pas être étayés ne sont pas publiés.",
} as const;

const fr: MarketingCopy = {
  about: {
    eyebrow: "À propos d’ASIP",
    title: "Au côté des fondateurs qui façonnent le prochain chapitre de l’Afrique.",
    description:
      "ASIP est un programme du Groupe Telecel qui accompagne les fondateurs africains avec de la connaissance, des voies de capital, des marchés et des relations qui peuvent accélérer leur croissance.",
    notice: "",
    sectionTitle: "Origine, raison d’être et parcours",
    sectionDescription: "",
    cards: [],
    cta: { slug: "founders", label: "Explorer le portefeuille" },
    ctaSection: {
      title: "Rencontrez ceux qui construisent la suite.",
      description: "",
      slug: "founders",
      label: "Explorer le portefeuille",
    },
    aboutNarrative: {
      story: {
        title: "Soutenir les fondateurs, bâtir pour l’Afrique.",
        eyebrow: "Notre histoire",
        paragraphs: [
          "L’Afrique ne manque pas d’idées. Le vrai écart tient souvent à l’accès : à la bonne expertise, à la connaissance du marché, à la technologie, aux voies de financement et aux relations commerciales au bon moment. ASIP a été créé pour réduire cet écart. Depuis 2019, le programme travaille avec des fondateurs de nombreux secteurs et marchés, pour les aider à affiner ce qu’ils construisent, tester leurs hypothèses de croissance et bâtir des entreprises plus solides.",
        ],
        features: [],
        imageCta: { slug: "founders", label: "Explorer le portefeuille" },
        bottomCta: {
          title: "La connaissance locale est un avantage.",
          slug: "founders",
          label: "Explorer le portefeuille",
        },
      },
      mission: {
        eyebrow: "Mission",
        title: "Aider des fondateurs ambitieux à bâtir des entreprises plus solides.",
        imageLabel: "Fondateurs ASIP et acteurs de l’écosystème réunis à Dakar",
        paragraphs: [
          "ASIP repère des entreprises technologiques qui résolvent des problèmes importants sur les marchés africains et renforce l’entreprise derrière l’idée : produit, stratégie, accès aux marchés, préparation à l’investissement et opportunités commerciales.",
        ],
      },
      vision: {
        eyebrow: "Vision",
        title: "Des entreprises technologiques africaines pertinentes localement et taillées pour le monde.",
        imageLabel: "L’écosystème ASIP en discussion à Dakar",
        paragraphs: [
          "Nous voulons que davantage d’entreprises de référence soient bâties depuis le continent, grandissent au-delà des frontières et rivalisent par la qualité de leurs produits, de leurs équipes et de leur connaissance du marché.",
        ],
      },
      timeline: {
        eyebrow: "Parcours",
        title: "Lancé en 2019. Toujours en construction.",
        milestones: [
          { year: "2019", description: "ASIP est lancé à Barcelone lors du Mobile World Congress, plaçant des fondateurs africains dans un cadre technologique et d’investissement mondial." },
          { year: "2021", description: "ASIP élargit son vivier panafricain de fondateurs et son accompagnement structuré à l’accélération." },
          { year: "2022", description: "Une nouvelle cohorte élargit la couverture sectorielle et approfondit l’accompagnement des fondateurs." },
          { year: "2023", description: "Le programme renforce la préparation des fondateurs et leurs voies vers les marchés, les partenaires et l’investissement." },
          { year: "2024", description: "Les fondateurs progressent à travers l’accélération, le développement du portefeuille et la préparation au marché." },
          { year: "2025", description: "Année de soutien au portefeuille : relations suivies avec les fondateurs, accompagnement du portefeuille et préparation de la prochaine phase." },
          { year: "2026", description: "Construire l’avantage IA : un nouvel accent sur les fondateurs qui appliquent l’IA à des défis métier concrets et à la croissance." },
        ],
      },
      ceoMessage: {
        published: false,
        imageLabel: "",
      },
      telecel: {
        eyebrow: "Groupe Telecel",
        title: "Un programme du Groupe Telecel.",
        imageLabel: "Responsables du programme ASIP et fondateurs à Dakar",
        paragraphs: [
          "ASIP est un programme du Groupe Telecel qui accompagne les fondateurs africains avec de la connaissance, des voies de capital, des marchés et des relations qui peuvent accélérer leur croissance. « Connecting Energies » est le principe de marque derrière ce rôle, pas un slogan à répéter sur chaque page.",
        ],
      },
    },
  },
  founders: {
    eyebrow: "Fondateurs",
    title: "Rencontrez ceux qui construisent la suite.",
    description:
      "Explorez les fondateurs ASIP par pays, secteur et cohorte. Chaque profil présente le problème, le produit, la connaissance du fondateur et les progrès qui ont suivi.",
    notice: "",
    sectionTitle: "Des marchés différents. Des modèles différents. De vrais problèmes à résoudre.",
    sectionDescription:
      "Le portefeuille ASIP couvre les services financiers, la santé, l’agriculture, l’éducation, l’assurance, les technologies propres, le commerce, la mobilité et d’autres secteurs technologiques. Le fil conducteur est simple : des fondateurs qui construisent à partir d’une connaissance directe du marché.",
    cards: [],
    cta: { slug: "founders", label: "Explorer le portefeuille" },
    ctaSection: {
      title: "Des preuves, pas des promesses.",
      description: "",
      slug: "impact",
      label: "Explorer les résultats des fondateurs",
    },
  },
  "register-interest": {
    eyebrow: "Cohorte IA",
    title: "Votre prochaine étape pourrait commencer ici.",
    description:
      "Les candidatures ne sont pas ouvertes. Manifestez votre intérêt pour la cohorte IA afin de recevoir les dates, les critères d’éligibilité et les modalités confirmés dès leur annonce.",
    notice: "",
    sectionTitle: "",
    sectionDescription: "",
    cards: [],
    cta: { slug: "contact", label: "Demande fondateur" },
    ctaSection: {
      title: "Commencez par la bonne conversation.",
      description: "Éligibilité, statut de la cohorte, candidatures ou accompagnement des fondateurs.",
      slug: "contact",
      label: "Demande fondateur",
    },
  },
  apply: {
    eyebrow: "Cohorte IA",
    title: "Prêt à construire l’avantage IA ?",
    description:
      "Les candidatures sont ouvertes pour la cohorte publiée. Consultez les critères avant de commencer, puis dites-nous ce que vous construisez, pourquoi c’est important et où vous devez grandir.",
    notice: "",
    sectionTitle: "Parcours de candidature",
    sectionDescription: "",
    cards: [
      { title: "1. Vérifier les critères", description: "Consultez l’orientation, le stade, la géographie et les conditions de participation de la cohorte publiée." },
      { title: "2. Présenter votre projet", description: "Présentez l’équipe, le problème, le produit, la traction, le marché et les priorités de croissance." },
      { title: "3. Examen initial", description: "Les candidatures éligibles sont évaluées selon le cadre de sélection publié." },
      { title: "4. Échanges avec les fondateurs", description: "Les équipes présélectionnées peuvent être invitées à des entretiens, des vérifications ou une session de sélection." },
      { title: "5. Sélection finale", description: "Les fondateurs retenus reçoivent par écrit les conditions, le calendrier et les exigences de participation." },
      { title: "6. Intégration", description: "Le programme démarre avec des objectifs clairs, des priorités de départ et un plan d’accompagnement structuré." },
    ],
    cta: { slug: "contact", label: "Demande fondateur" },
    ctaSection: {
      title: "Commencez par la bonne conversation.",
      description: "Éligibilité, statut de la cohorte, candidatures ou accompagnement des fondateurs.",
      slug: "contact",
      label: "Demande fondateur",
    },
  },
  faq: {
    eyebrow: "FAQ",
    title: "Des réponses claires.",
    description: "",
    notice: "",
    sectionTitle: "",
    sectionDescription: "",
    cards: [
      { title: "Qu’est-ce qu’ASIP ?", description: FAQ_FR.what },
      { title: "Qu’est-ce que « Construire l’avantage IA » ?", description: FAQ_FR.ai },
      { title: "Qui peut candidater ?", description: FAQ_FR.who },
      { title: "Les candidatures sont-elles ouvertes ?", description: FAQ_FR.open },
      { title: "ASIP investit-il dans chaque startup ?", description: FAQ_FR.invest },
      { title: "Le programme est-il en ligne ou en présentiel ?", description: FAQ_FR.format },
      { title: "Quels secteurs ASIP accompagne-t-il ?", description: FAQ_FR.sectors },
      { title: "Qu’apporte le Groupe Telecel ?", description: FAQ_FR.telecel },
      { title: "Les investisseurs peuvent-ils accéder au portefeuille ?", description: FAQ_FR.investors },
      { title: "Comment les organisations peuvent-elles travailler avec ASIP ?", description: FAQ_FR.organisations },
      { title: "Comment l’impact est-il vérifié ?", description: FAQ_FR.impact },
    ],
    tabsSectionTitle: "Parcourir par thème",
    tabsSectionDescription: "",
    tabs: [
      {
        id: "programme",
        label: "Programme",
        items: [
          { title: "Qu’est-ce qu’ASIP ?", description: FAQ_FR.what },
          { title: "Qu’est-ce que « Construire l’avantage IA » ?", description: FAQ_FR.ai },
          { title: "Le programme est-il en ligne ou en présentiel ?", description: FAQ_FR.format },
          { title: "Quels secteurs ASIP accompagne-t-il ?", description: FAQ_FR.sectors },
          { title: "Qu’apporte le Groupe Telecel ?", description: FAQ_FR.telecel },
          { title: "Comment l’impact est-il vérifié ?", description: FAQ_FR.impact },
        ],
      },
      {
        id: "founders",
        label: "Fondateurs",
        items: [
          { title: "Qui peut candidater ?", description: FAQ_FR.who },
          { title: "Les candidatures sont-elles ouvertes ?", description: FAQ_FR.open },
          { title: "ASIP investit-il dans chaque startup ?", description: FAQ_FR.invest },
        ],
      },
      {
        id: "partners",
        label: "Investisseurs et partenaires",
        items: [
          { title: "Les investisseurs peuvent-ils accéder au portefeuille ?", description: FAQ_FR.investors },
          { title: "Comment les organisations peuvent-elles travailler avec ASIP ?", description: FAQ_FR.organisations },
        ],
      },
    ],
    ctaSection: {
      title: "Commencez par la bonne conversation.",
      description: "Choisissez le parcours qui correspond le mieux à votre besoin.",
      slug: "contact",
      label: "Contacter ASIP",
    },
  },
};

export function marketingCopyFor(locale: Locale, slug: MarketingContentSlug) {
  return (locale === "fr" ? fr : en)[slug];
}
