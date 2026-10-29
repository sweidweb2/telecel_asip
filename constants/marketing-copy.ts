import type { Locale } from "@/constants/locales";
import type {
  MarketingContentSlug,
  MarketingPageCopy,
} from "@/types/marketing-page";

type MarketingCopy = Record<MarketingContentSlug, MarketingPageCopy>;

const en: MarketingCopy = {
  about: {
    eyebrow: "About ASIP",
    title: "Backing the builders shaping Africa’s next chapter.",
    description:
      "ASIP is a Telecel Group Program backing African technology founders with knowledge, capital pathways, markets and relationships that can accelerate their growth.",
    notice:
      "The leadership message stays unpublished until Telecel Group supplies approved text and media.",
    sectionTitle: "Origin, purpose and the journey ahead",
    sectionDescription:
      "From the first accelerator cohort to the 2026 next chapter - how ASIP backs African founders with knowledge, capital pathways, markets and relationships.",
    cards: [],
    heroChips: {
      focusKind: "Focus",
      chapterKind: "Chapter",
      chips: [
        { kind: "focus", label: "Knowledge" },
        { kind: "focus", label: "Capital pathways" },
        { kind: "focus", label: "Markets", hideSm: true },
        { kind: "focus", label: "Relationships", hideSm: true },
        { kind: "focus", label: "Connecting Energies", hideMd: true },
        { kind: "chapter", label: "First cohort · 2021", hideMd: true },
        { kind: "chapter", label: "Africa", hideSm: true },
        { kind: "chapter", label: "Founders", hideMd: true },
        { kind: "chapter", label: "Next chapter · 2026", hideSm: true },
      ],
    },
    cta: { slug: "founders", label: "Explore the founders" },
    ctaSection: {
      title: "Meet the founders building Africa’s next chapter.",
      description:
        "Explore ventures across ASIP cohorts - real companies, markets and progress.",
      slug: "founders",
      label: "Explore the founders",
    },
    aboutNarrative: {
      story: {
        title: "Backing founders. Built for Africa.",
        eyebrow: "Our story",
        paragraphs: [
          "ASIP began with a simple idea: Africa has no shortage of ambitious founders. What is often uneven is access to the networks, expertise and opportunities that help strong companies move faster.",
          "Since then, ASIP has worked with founders across multiple sectors and markets, combining structured founder development with exposure to mentors, partners, investors and commercial opportunities. The programme has evolved, but the principle remains the same: back local insight, bring the right people and capabilities together, and give good businesses a stronger path to scale.",
        ],
        features: [
          {
            icon: "rocket",
            title: "Knowledge",
            description:
              "Structured founder development with mentors, partners and practical expertise.",
            slug: "programme",
            linkLabel: "Learn more",
          },
          {
            icon: "trending-up",
            title: "Capital pathways",
            description:
              "Closer to investors and the relationships that can accelerate growth.",
            slug: "programme",
            linkLabel: "Learn more",
          },
          {
            icon: "globe",
            title: "Markets",
            description:
              "Exposure to commercial opportunities across sectors and African markets.",
            slug: "founders",
            linkLabel: "Learn more",
          },
          {
            icon: "heart",
            title: "Relationships",
            description:
              "Bring the right people together so good businesses have a stronger path to scale.",
            slug: "partners",
            linkLabel: "Learn more",
          },
        ],
        imageCta: { slug: "founders", label: "Explore the founders" },
        bottomCta: {
          title: "Meet the founders ASIP has worked with",
          slug: "founders",
          label: "Explore the founders",
        },
      },
      mission: {
        eyebrow: "Mission",
        title: "Turn African innovation into opportunity.",
        imageLabel: "ASIP founders and ecosystem leaders gathering in Dakar",
        paragraphs: [
          "Our mission is to identify and accelerate African technology ventures solving meaningful problems, opening access to practical expertise, capital pathways, market access and commercial relationships.",
        ],
      },
      vision: {
        eyebrow: "Vision",
        title: "From the continent, to the world.",
        imageLabel: "The ASIP ecosystem in conversation in Dakar",
        paragraphs: [
          "We envision an Africa where category-defining technology companies are built from the continent, scale across borders and shape global progress.",
        ],
      },
      timeline: {
        eyebrow: "Journey",
        title: "From the first cohort to the next chapter",
        milestones: [
          {
            year: "2021",
            description:
              "The first ASIP accelerator cohort runs virtually from 5 July to 30 September, with Demo Day in Dakar.",
          },
          {
            year: "2022",
            description:
              "The second cohort runs from 11 April to 6 July, with in-person programme work in Dakar.",
          },
          {
            year: "2023",
            description:
              "The third cohort runs from 20 February to 25 May, with Demo Day at the Museum of Black Civilisations.",
          },
          {
            year: "2024",
            description:
              "The fourth cohort runs from 13 November 2023 to 7 February 2024.",
          },
          {
            year: "2025",
            description:
              "Portfolio support year: follow-on work with founders already in the programme, and preparation for the next chapter.",
          },
          {
            year: "2026",
            description:
              "The next chapter is taking shape around a working theme, AI Advantage in Action: startups applying AI to existing business problems and proving an advantage a customer can measure.",
          },
        ],
      },
      ceoMessage: {
        published: false,
        imageLabel: "Leadership portrait - to be supplied by Telecel Group",
      },
      telecel: {
        eyebrow: "Telecel Group",
        title: "A Telecel Group Program, built on Connecting Energies.",
        imageLabel: "ASIP programme leaders and founders in Dakar",
        paragraphs: [
          "Telecel’s African legacy and digital ecosystem give ASIP a distinctive perspective: innovation matters most when it reaches people, businesses and markets. ASIP applies that same belief to founders, bringing different capabilities and relationships together around growth.",
        ],
      },
    },
  },
  founders: {
    eyebrow: "Founders",
    title: "Meet the companies building Africa’s next chapter.",
    description:
      "Search the founders supported by ASIP across cohorts, countries, and technology sectors.",
    notice:
      "Profiles and performance information are published only after verification.",
    sectionTitle: "A growing founder archive",
    sectionDescription:
      "Search and filter to discover founders, understand their solutions, and follow their progress.",
    cards: [
      {
        title: "Across cohorts",
        description:
          "Explore ventures from each programme cycle as profiles are approved.",
      },
      {
        title: "Across markets",
        description:
          "See the countries and communities where ASIP founders are building.",
      },
      {
        title: "Across sectors",
        description:
          "Discover solutions in financial services, health, climate, commerce, and more.",
      },
    ],
    cta: { slug: "impact", label: "Explore our impact" },
    ctaSection: {
      title: "Explore our impact",
      description:
        "See how ASIP ventures contribute to communities across Africa - with verified reach, founder outcomes, and programme stories.",
      slug: "impact",
      label: "Explore our impact",
    },
  },
  "register-interest": {
    eyebrow: "For founders",
    title: "Stay close to the next cohort.",
    description:
      "Tell ASIP about your team, technology venture, market, and current stage.",
    notice:
      "Your submission is stored securely and reviewed by the ASIP team for each programme cycle.",
    sectionTitle: "Prepare your venture profile",
    sectionDescription:
      "Before registering, gather a concise description of the problem, your solution, evidence of progress, and the support you need next.",
    cards: [
      {
        title: "Team",
        description:
          "Introduce the founders and the experience that prepares you to solve this problem.",
      },
      {
        title: "Solution",
        description:
          "Explain the customer problem, your product, and what makes your approach relevant.",
      },
      {
        title: "Progress",
        description:
          "Summarize traction, learning, current stage, and the next milestones you are pursuing.",
      },
    ],
    cta: { slug: "contact", label: "Ask a question" },
    ctaSection: {
      title: "Building a venture is already hard enough.",
      description:
        "Questions about eligibility, timing, or fit? Reach the ASIP team before you submit.",
      slug: "contact",
      label: "Ask a question",
    },
  },
  apply: {
    eyebrow: "For founders", title: "Build what Africa needs next.", description: "Tell ASIP about your team, technology venture, market, and current stage.", notice: "Your submission is stored securely and reviewed by the ASIP team for each programme cycle.", sectionTitle: "Prepare your venture profile", sectionDescription: "Before applying, gather a concise description of the problem, your solution, evidence of progress, and the support you need next.", cards: [
      { title: "Team", description: "Introduce the founders and the experience that prepares you to solve this problem." },
      { title: "Solution", description: "Explain the customer problem, your product, and what makes your approach relevant." },
      { title: "Progress", description: "Summarize traction, learning, current stage, and the next milestones you are pursuing." },
    ], cta: { slug: "contact", label: "Ask a question" },
    ctaSection: {
      title: "Building a venture is already hard enough.",
      description:
        "Need clarity on the cohort, criteria, or what to include? Ask ASIP before you start the application.",
      slug: "contact",
      label: "Ask a question",
    },
  },
  faq: {
    eyebrow: "FAQ",
    title: "Questions, answered clearly.",
    description:
      "Practical information about the programme, applications, founders, and partnerships.",
    notice: "Cohort dates, eligibility and terms are published with each confirmed cohort.",
    sectionTitle: "What founders and partners ask",
    sectionDescription:
      "These answers describe the current programme structure and will evolve with each published cohort.",
    cards: [
      { title: "What is ASIP?", description: "ASIP is a Telecel Group Program that helps African technology founders strengthen their businesses, access expertise and capital pathways, reach new markets and build toward sustainable scale." },
      { title: "Who can apply?", description: "Eligibility is published for each cohort. ASIP generally targets technology-led ventures with an African market focus, a committed founding team and credible potential to scale." },
      { title: "Are applications open?", description: "When applications are open, the navbar promotes Apply and only that form accepts submissions. When closed, Register Interest is the live intake and Apply redirects there. Only one path is available at a time." },
      { title: "Does ASIP invest in every startup?", description: "Funding and investment terms vary by cohort and partner structure. Any cash, equity or in-kind support is disclosed in the official cohort terms." },
      { title: "Is the programme virtual or in person?", description: "The format varies by cohort and may combine virtual sessions, in-person activities, market visits, events and demo opportunities." },
      { title: "Which sectors does ASIP support?", description: "ASIP has supported ventures across financial technology, health, agriculture, education, insurance, clean technology, commerce, logistics and other technology-enabled sectors." },
      { title: "What does Telecel contribute?", description: "ASIP draws on Telecel’s African legacy, digital expertise, partnerships and business ecosystem. Specific market, pilot or commercial access depends on strategic fit and local approvals." },
      { title: "Can investors access the portfolio?", description: "Investors can explore public founder profiles and contact ASIP for relevant introductions, subject to founder consent and programme protocols." },
      { title: "How can organisations partner with ASIP?", description: "Partners can contribute business challenges, pilot opportunities, capital, technology, expertise, market access or ecosystem platforms." },
      { title: "How is impact verified?", description: "ASIP maintains an evidence record for published metrics, including source, period, owner, verification date and permission status." },
    ],
    tabsSectionTitle: "Browse by topic",
    tabsSectionDescription:
      "Explore answers grouped by programme, founders, and partners.",
    tabs: [
      {
        id: "programme",
        label: "Programme",
        items: [
          { title: "What is ASIP?", description: "ASIP is a Telecel Group Program that helps African technology founders strengthen their businesses, access expertise and capital pathways, reach new markets and build toward sustainable scale." },
          { title: "Is the programme virtual or in person?", description: "The format varies by cohort and may combine virtual sessions, in-person activities, market visits, events and demo opportunities." },
          { title: "Which sectors does ASIP support?", description: "ASIP has supported ventures across financial technology, health, agriculture, education, insurance, clean technology, commerce, logistics and other technology-enabled sectors." },
          { title: "What does Telecel contribute?", description: "ASIP draws on Telecel’s African legacy, digital expertise, partnerships and business ecosystem. Specific market, pilot or commercial access depends on strategic fit and local approvals." },
          { title: "How is impact verified?", description: "ASIP maintains an evidence record for published metrics, including source, period, owner, verification date and permission status." },
        ],
      },
      {
        id: "founders",
        label: "Founders",
        items: [
          { title: "Who can apply?", description: "Eligibility is published for each cohort. ASIP generally targets technology-led ventures with an African market focus, a committed founding team and credible potential to scale." },
          { title: "Are applications open?", description: "When applications are open, the navbar promotes Apply and only that form accepts submissions. When closed, Register Interest is the live intake and Apply redirects there. Only one path is available at a time." },
          { title: "Does ASIP invest in every startup?", description: "Funding and investment terms vary by cohort and partner structure. Any cash, equity or in-kind support is disclosed in the official cohort terms." },
        ],
      },
      {
        id: "partners",
        label: "Partners",
        items: [
          { title: "How can organisations partner with ASIP?", description: "Partners can contribute business challenges, pilot opportunities, capital, technology, expertise, market access or ecosystem platforms." },
          { title: "Can investors access the portfolio?", description: "Investors can explore public founder profiles and contact ASIP for relevant introductions, subject to founder consent and programme protocols." },
        ],
      },
    ],
    ctaSection: {
      title: "Still have questions?",
      description:
        "If you cannot find what you need, contact the ASIP team and we will follow up.",
      slug: "contact",
      label: "Ask another question",
    },
  },
};

const fr: MarketingCopy = {
  about: {
    eyebrow: "À propos d’ASIP",
    title: "Aux côtés des bâtisseurs qui façonnent le prochain chapitre de l’Afrique.",
    description:
      "ASIP est un programme du Groupe Telecel qui soutient des fondateurs technologiques africains avec les connaissances, les voies de capital, les marchés et les relations qui peuvent accélérer leur croissance.",
    notice:
      "Le message de direction reste non publié tant que le Groupe Telecel n’a pas fourni le texte et les visuels approuvés.",
    sectionTitle: "Origine, mission et parcours",
    sectionDescription:
      "De la première cohorte d’accélération au chapitre 2026 - comment ASIP soutient les fondateurs africains avec les connaissances, les voies de capital, les marchés et les relations.",
    cards: [],
    heroChips: {
      focusKind: "Axe",
      chapterKind: "Chapitre",
      chips: [
        { kind: "focus", label: "Connaissance" },
        { kind: "focus", label: "Voies de capital" },
        { kind: "focus", label: "Marchés", hideSm: true },
        { kind: "focus", label: "Relations", hideSm: true },
        { kind: "focus", label: "Connecting Energies", hideMd: true },
        { kind: "chapter", label: "Première cohorte · 2021", hideMd: true },
        { kind: "chapter", label: "Afrique", hideSm: true },
        { kind: "chapter", label: "Fondateurs", hideMd: true },
        { kind: "chapter", label: "Prochain chapitre · 2026", hideSm: true },
      ],
    },
    cta: { slug: "founders", label: "Découvrir les fondateurs" },
    ctaSection: {
      title: "Rencontrez les fondateurs qui construisent le prochain chapitre de l’Afrique.",
      description:
        "Explorez des entreprises issues des cohortes ASIP - des sociétés, des marchés et des progrès concrets.",
      slug: "founders",
      label: "Découvrir les fondateurs",
    },
    aboutNarrative: {
      story: {
        title: "Aux côtés des fondateurs. Bâti pour l’Afrique.",
        eyebrow: "Notre histoire",
        paragraphs: [
          "ASIP a commencé avec une idée simple : l’Afrique ne manque pas de fondateurs ambitieux. Ce qui est souvent inégal, c’est l’accès aux réseaux, à l’expertise et aux opportunités qui aident les entreprises solides à avancer plus vite.",
          "Depuis, ASIP a travaillé avec des fondateurs dans plusieurs secteurs et marchés, en combinant un développement structuré avec l’exposition à des mentors, partenaires, investisseurs et opportunités commerciales. Le programme a évolué, mais le principe reste le même : s’appuyer sur l’insight local, rassembler les bonnes personnes et les bonnes capacités, et offrir aux bonnes entreprises un chemin plus solide vers l’échelle.",
        ],
        features: [
          {
            icon: "rocket",
            title: "Connaissance",
            description:
              "Un développement structuré des fondateurs, avec mentors, partenaires et expertise concrète.",
            slug: "programme",
            linkLabel: "En savoir plus",
          },
          {
            icon: "trending-up",
            title: "Voies de capital",
            description:
              "Plus près des investisseurs et des relations qui peuvent accélérer la croissance.",
            slug: "programme",
            linkLabel: "En savoir plus",
          },
          {
            icon: "globe",
            title: "Marchés",
            description:
              "Une exposition aux opportunités commerciales à travers les secteurs et les marchés africains.",
            slug: "founders",
            linkLabel: "En savoir plus",
          },
          {
            icon: "heart",
            title: "Relations",
            description:
              "Rassembler les bonnes personnes pour que les bonnes entreprises aient un chemin plus solide vers l’échelle.",
            slug: "partners",
            linkLabel: "En savoir plus",
          },
        ],
        imageCta: { slug: "founders", label: "Découvrir les fondateurs" },
        bottomCta: {
          title: "Rencontrez les fondateurs avec lesquels ASIP a travaillé",
          slug: "founders",
          label: "Découvrir les fondateurs",
        },
      },
      mission: {
        eyebrow: "Mission",
        title: "Transformer l’innovation africaine en opportunité.",
        imageLabel: "Fondateurs ASIP et acteurs de l’écosystème réunis à Dakar",
        paragraphs: [
          "Notre mission est d’identifier et d’accélérer les entreprises technologiques africaines qui résolvent des problèmes concrets, avec une expertise pratique, des voies de capital, l’accès aux marchés et des relations commerciales.",
        ],
      },
      vision: {
        eyebrow: "Vision",
        title: "Du continent, vers le monde.",
        imageLabel: "L’écosystème ASIP en conversation à Dakar",
        paragraphs: [
          "Nous imaginons une Afrique où des entreprises technologiques qui définissent leur catégorie sont bâties depuis le continent, se développent au-delà des frontières et façonnent le progrès mondial.",
        ],
      },
      timeline: {
        eyebrow: "Parcours",
        title: "De la première cohorte au prochain chapitre",
        milestones: [
          {
            year: "2021",
            description:
              "La première cohorte de l’accélérateur ASIP se déroule en ligne du 5 juillet au 30 septembre, avec un Demo Day à Dakar.",
          },
          {
            year: "2022",
            description:
              "La deuxième cohorte se déroule du 11 avril au 6 juillet, avec un travail de programme en présentiel à Dakar.",
          },
          {
            year: "2023",
            description:
              "La troisième cohorte se déroule du 20 février au 25 mai, avec un Demo Day au Musée des civilisations noires.",
          },
          {
            year: "2024",
            description:
              "La quatrième cohorte se déroule du 13 novembre 2023 au 7 février 2024.",
          },
          {
            year: "2025",
            description:
              "Année d’accompagnement du portefeuille : travail de suivi avec les fondateurs déjà dans le programme, et préparation du prochain chapitre.",
          },
          {
            year: "2026",
            description:
              "Le prochain chapitre prend forme autour d’un thème provisoire, AI Advantage in Action : des startups qui appliquent l’IA à des problèmes d’entreprises existantes et qui prouvent un avantage mesurable pour un client.",
          },
        ],
      },
      ceoMessage: {
        published: false,
        imageLabel: "Portrait de direction - à fournir par le Groupe Telecel",
      },
      telecel: {
        eyebrow: "Lien Telecel",
        title: "Un programme du Groupe Telecel, bâti sur Connecting Energies.",
        imageLabel: "Équipe du programme ASIP et fondateurs à Dakar",
        paragraphs: [
          "L’héritage africain de Telecel et son écosystème numérique donnent à ASIP une perspective distincte : l’innovation compte surtout lorsqu’elle atteint les personnes, aux entreprises et aux marchés. ASIP applique cette même conviction aux fondateurs, en rassemblant des capacités et des relations différentes autour de la croissance.",
        ],
      },
    },
  },
  founders: {
    eyebrow: "Fondateurs",
    title: "Les entreprises qui construisent le prochain chapitre de l’Afrique.",
    description:
      "Explorez les fondateurs accompagnés par ASIP selon les cohortes, pays et secteurs technologiques.",
    notice:
      "Les profils et résultats ne sont publiés qu’après vérification.",
    sectionTitle: "Une archive de fondateurs en croissance",
    sectionDescription:
      "Recherchez et filtrez pour découvrir les fondateurs, leurs solutions et leurs progrès.",
    cards: [
      {
        title: "Par cohorte",
        description:
          "Explorez les entreprises de chaque cycle à mesure que les profils sont approuvés.",
      },
      {
        title: "Par marché",
        description:
          "Découvrez les pays et communautés où les fondateurs ASIP construisent leurs solutions.",
      },
      {
        title: "Par secteur",
        description:
          "Explorez la finance, la santé, le climat, le commerce et d’autres domaines.",
      },
    ],
    cta: { slug: "impact", label: "Découvrir notre impact" },
    ctaSection: {
      title: "Découvrir notre impact",
      description:
        "Découvrez comment les entreprises ASIP contribuent aux communautés en Afrique - portée vérifiée, résultats des fondateurs et histoires du programme.",
      slug: "impact",
      label: "Découvrir notre impact",
    },
  },
  "register-interest": {
    eyebrow: "Pour les fondateurs",
    title: "Restez au plus près de la prochaine cohorte.",
    description:
      "Présentez à ASIP votre équipe, votre entreprise technologique, votre marché et votre stade actuel.",
    notice:
      "Votre candidature est stockée de façon sécurisée et examinée par l’équipe ASIP pour chaque cycle du programme.",
    sectionTitle: "Préparez le profil de votre entreprise",
    sectionDescription:
      "Rassemblez une description concise du problème, de la solution, des progrès et du soutien recherché.",
    cards: [
      {
        title: "Équipe",
        description:
          "Présentez les fondateurs et l’expérience qui vous prépare à résoudre ce problème.",
      },
      {
        title: "Solution",
        description:
          "Expliquez le problème client, votre produit et la pertinence de votre approche.",
      },
      {
        title: "Progrès",
        description:
          "Résumez la traction, les apprentissages, le stade actuel et les prochaines étapes.",
      },
    ],
    cta: { slug: "contact", label: "Poser une question" },
    ctaSection: {
      title: "Construire une entreprise est déjà assez difficile.",
      description:
        "Des questions sur l’éligibilité, le calendrier ou l’adéquation ? Contactez l’équipe ASIP avant d’envoyer votre dossier.",
      slug: "contact",
      label: "Poser une question",
    },
  },
  apply: { eyebrow: "Pour les fondateurs", title: "Construisez ce dont l’Afrique a besoin.", description: "Présentez à ASIP votre équipe, votre entreprise technologique, votre marché et votre stade actuel.", notice: "Votre candidature est stockée de façon sécurisée et examinée par l’équipe ASIP pour chaque cycle du programme.", sectionTitle: "Préparez le profil de votre entreprise", sectionDescription: "Rassemblez une description concise du problème, de la solution, des progrès et du soutien recherché.", cards: [{ title: "Équipe", description: "Présentez les fondateurs et l’expérience qui vous prépare à résoudre ce problème." }, { title: "Solution", description: "Expliquez le problème client, votre produit et la pertinence de votre approche." }, { title: "Progrès", description: "Résumez la traction, les apprentissages, le stade actuel et les prochaines étapes." }], cta: { slug: "contact", label: "Poser une question" },
    ctaSection: {
      title: "Construire une entreprise est déjà assez difficile.",
      description:
        "Besoin de clarté sur la cohorte, les critères ou le contenu attendu ? Demandez à ASIP avant de commencer.",
      slug: "contact",
      label: "Poser une question",
    },
  },
  faq: {
    eyebrow: "FAQ",
    title: "Des réponses claires à vos questions.",
    description:
      "Informations pratiques sur le programme, les candidatures, les fondateurs et les partenariats.",
    notice: "Les dates, critères d’éligibilité et conditions sont publiés avec chaque cohorte confirmée.",
    sectionTitle: "Les questions des fondateurs et partenaires",
    sectionDescription:
      "Ces réponses décrivent la structure actuelle et évolueront avec chaque cohorte publiée.",
    cards: [
      { title: "Qu’est-ce qu’ASIP ?", description: "ASIP est un programme du Groupe Telecel qui aide les fondateurs technologiques africains à renforcer leur entreprise, accéder à l’expertise et aux voies de capital, atteindre de nouveaux marchés et construire une croissance durable." },
      { title: "Qui peut candidater ?", description: "Les critères d’éligibilité sont publiés pour chaque cohorte. ASIP cible généralement des entreprises technologiques orientées vers les marchés africains, avec une équipe fondatrice engagée et un potentiel crédible de passage à l’échelle." },
      { title: "Les candidatures sont-elles ouvertes ?", description: "Lorsque les candidatures sont ouvertes, la barre de navigation promeut Postuler et seul ce formulaire accepte les envois. Lorsqu’elles sont fermées, Manifester votre intérêt est le parcours actif et Postuler y redirige. Un seul parcours est disponible à la fois." },
      { title: "ASIP investit-il dans chaque startup ?", description: "Le financement et les conditions d’investissement varient selon la cohorte et la structure des partenariats. Tout apport en numéraire, en capital ou en nature est précisé dans les conditions officielles de la cohorte." },
      { title: "Le programme est-il virtuel ou en présentiel ?", description: "Le format varie selon la cohorte et peut combiner sessions virtuelles, activités en présentiel, visites de marché, événements et opportunités de démonstration." },
      { title: "Quels secteurs ASIP accompagne-t-il ?", description: "ASIP a accompagné des entreprises dans la technologie financière, la santé, l’agriculture, l’éducation, l’assurance, les technologies propres, le commerce, la logistique et d’autres secteurs portés par la technologie." },
      { title: "Qu’apporte Telecel ?", description: "ASIP s’appuie sur l’héritage africain de Telecel, son expertise numérique, ses partenariats et son écosystème d’affaires. L’accès concret aux marchés, aux pilotes ou aux opportunités commerciales dépend de l’adéquation stratégique et des validations locales." },
      { title: "Les investisseurs peuvent-ils accéder au portefeuille ?", description: "Les investisseurs peuvent consulter les profils publics des fondateurs et contacter ASIP pour des mises en relation pertinentes, sous réserve du consentement des fondateurs et des protocoles du programme." },
      { title: "Comment les organisations peuvent-elles devenir partenaires d’ASIP ?", description: "Les partenaires peuvent apporter des défis d’entreprise, des opportunités de pilote, du capital, de la technologie, de l’expertise, un accès aux marchés ou des plateformes d’écosystème." },
      { title: "Comment l’impact est-il vérifié ?", description: "ASIP tient un registre de preuves pour les indicateurs publiés, incluant la source, la période, le responsable, la date de vérification et le statut des autorisations." },
    ],
    tabsSectionTitle: "Parcourir par thème",
    tabsSectionDescription:
      "Explorez les réponses regroupées par programme, fondateurs et partenaires.",
    tabs: [
      {
        id: "programme",
        label: "Programme",
        items: [
          { title: "Qu’est-ce qu’ASIP ?", description: "ASIP est un programme du Groupe Telecel qui aide les fondateurs technologiques africains à renforcer leur entreprise, accéder à l’expertise et aux voies de capital, atteindre de nouveaux marchés et construire une croissance durable." },
          { title: "Le programme est-il virtuel ou en présentiel ?", description: "Le format varie selon la cohorte et peut combiner sessions virtuelles, activités en présentiel, visites de marché, événements et opportunités de démonstration." },
          { title: "Quels secteurs ASIP accompagne-t-il ?", description: "ASIP a accompagné des entreprises dans la technologie financière, la santé, l’agriculture, l’éducation, l’assurance, les technologies propres, le commerce, la logistique et d’autres secteurs portés par la technologie." },
          { title: "Qu’apporte Telecel ?", description: "ASIP s’appuie sur l’héritage africain de Telecel, son expertise numérique, ses partenariats et son écosystème d’affaires. L’accès concret aux marchés, aux pilotes ou aux opportunités commerciales dépend de l’adéquation stratégique et des validations locales." },
          { title: "Comment l’impact est-il vérifié ?", description: "ASIP tient un registre de preuves pour les indicateurs publiés, incluant la source, la période, le responsable, la date de vérification et le statut des autorisations." },
        ],
      },
      {
        id: "founders",
        label: "Fondateurs",
        items: [
          { title: "Qui peut candidater ?", description: "Les critères d’éligibilité sont publiés pour chaque cohorte. ASIP cible généralement des entreprises technologiques orientées vers les marchés africains, avec une équipe fondatrice engagée et un potentiel crédible de passage à l’échelle." },
          { title: "Les candidatures sont-elles ouvertes ?", description: "Lorsque les candidatures sont ouvertes, la barre de navigation promeut Postuler et seul ce formulaire accepte les envois. Lorsqu’elles sont fermées, Manifester votre intérêt est le parcours actif et Postuler y redirige. Un seul parcours est disponible à la fois." },
          { title: "ASIP investit-il dans chaque startup ?", description: "Le financement et les conditions d’investissement varient selon la cohorte et la structure des partenariats. Tout apport en numéraire, en capital ou en nature est précisé dans les conditions officielles de la cohorte." },
        ],
      },
      {
        id: "partners",
        label: "Partenaires",
        items: [
          { title: "Comment les organisations peuvent-elles devenir partenaires d’ASIP ?", description: "Les partenaires peuvent apporter des défis d’entreprise, des opportunités de pilote, du capital, de la technologie, de l’expertise, un accès aux marchés ou des plateformes d’écosystème." },
          { title: "Les investisseurs peuvent-ils accéder au portefeuille ?", description: "Les investisseurs peuvent consulter les profils publics des fondateurs et contacter ASIP pour des mises en relation pertinentes, sous réserve du consentement des fondateurs et des protocoles du programme." },
        ],
      },
    ],
    ctaSection: {
      title: "Vous avez encore des questions ?",
      description:
        "Si vous ne trouvez pas ce qu’il vous faut, contactez l’équipe ASIP et nous vous répondrons.",
      slug: "contact",
      label: "Poser une autre question",
    },
  },
};

export function marketingCopyFor(locale: Locale, slug: MarketingContentSlug) {
  return (locale === "fr" ? fr : en)[slug];
}
