import type { Locale } from "@/constants/locales";
import type {
  MarketingContentSlug,
  MarketingPageCopy,
} from "@/types/marketing-page";

type MarketingCopy = Record<MarketingContentSlug, MarketingPageCopy>;

const en: MarketingCopy = {
  "": {
    eyebrow: "Africa Startup Initiative Program",
    title: "Helping African technology ventures grow with confidence",
    description: "A Telecel Group initiative connecting founders with structured acceleration, ecosystem access, and market visibility.",
    notice: "Programme information is being prepared for final Telecel approval.",
    sectionTitle: "Built around the founder journey",
    sectionDescription: "Explore the programme, discover participating ventures, and follow the stories shaping Africa’s technology ecosystem.",
    cards: [
      { title: "Structured acceleration", description: "Practical support designed around the needs and maturity of each venture." },
      { title: "Ecosystem access", description: "Connections to mentors, partners, peers, and relevant markets." },
      { title: "Credible visibility", description: "A platform for sharing verified progress, lessons, and founder stories." },
    ],
    cta: { slug: "programme", label: "Explore the programme" },
  },
  about: {
    eyebrow: "About ASIP", title: "A platform for African technology ventures", description: "ASIP is a Telecel Group initiative created to support founders through acceleration, ecosystem access, and market visibility.", notice: "Final history, imagery, names, and milestones require Telecel approval.", sectionTitle: "Purpose and direction", sectionDescription: "The programme is designed to help promising ventures strengthen their foundations, reach useful networks, and communicate their progress responsibly.", cards: [
      { title: "Foundation", description: "ASIP was created to contribute practical support to Africa’s growing technology ecosystem." },
      { title: "Programme development", description: "Each programme cycle turns founder needs into focused support and meaningful introductions." },
      { title: "The next chapter", description: "The platform will document verified ventures, partnerships, outcomes, and opportunities." },
    ], cta: { slug: "partners", label: "Meet our partners" },
  },
  programme: {
    eyebrow: "Programme", title: "A founder journey designed for growth", description: "A clear overview of who the programme is for, how participation works, and what founders can expect.", notice: "Eligibility, dates, and delivery details will be published once approved.", sectionTitle: "A simple programme pathway", sectionDescription: "The experience moves from initial interest and selection to focused acceleration and ecosystem access.", cards: [
      { title: "01 · Register interest", description: "Share a concise profile of the founding team, venture, market, and current progress." },
      { title: "02 · Review and selection", description: "Applications are assessed against the published criteria for the relevant cycle." },
      { title: "03 · Programme journey", description: "Selected founders take part in structured sessions, mentoring, and peer exchange." },
      { title: "04 · Market access", description: "Relevant introductions and visibility help ventures prepare for their next stage." },
    ], cta: { slug: "apply", label: "Register your interest" },
  },
  portfolio: {
    eyebrow: "Portfolio", title: "Ventures across the ASIP ecosystem", description: "Discover the companies supported by ASIP across cohorts, countries, and technology sectors.", notice: "Profiles and performance information are published only after verification.", sectionTitle: "A growing venture archive", sectionDescription: "The portfolio will make it easier to discover founders, understand their solutions, and follow their progress.", cards: [
      { title: "Across cohorts", description: "Explore ventures from each programme cycle as profiles are approved." },
      { title: "Across markets", description: "See the countries and communities where portfolio companies are building." },
      { title: "Across sectors", description: "Discover solutions in financial services, health, climate, commerce, and more." },
    ], cta: { slug: "impact", label: "Explore our impact" },
  },
  impact: {
    eyebrow: "Impact", title: "Making progress visible and credible", description: "Verified portfolio reach, founder outcomes, and ecosystem stories presented with the context behind the numbers.", notice: "Figures will remain unpublished until they have been reviewed and approved.", sectionTitle: "Evidence supported by context", sectionDescription: "Impact reporting combines measurable outcomes with the founder and programme stories that explain them.", cards: [
      { title: "Ventures supported", description: "Participation and cohort figures will be reported from verified programme records." },
      { title: "Markets reached", description: "Portfolio expansion will be presented with clear definitions and reporting periods." },
      { title: "Founder outcomes", description: "Stories will connect business progress with lessons from each founder journey." },
    ], cta: { slug: "insights", label: "Read the latest insights" },
  },
  partners: {
    eyebrow: "Partners", title: "Collaboration across the ecosystem", description: "Organizations contributing expertise, access, visibility, and support to African technology founders.", notice: "Partner names and logos will appear after publication approval.", sectionTitle: "Opening useful doors", sectionDescription: "ASIP works with partners whose capabilities can make a practical difference to participating ventures.", cards: [
      { title: "Expertise", description: "Specialists and mentors contribute relevant knowledge and founder guidance." },
      { title: "Market access", description: "Ecosystem relationships create pathways to customers, peers, and new markets." },
      { title: "Visibility", description: "Media and community partners help share credible venture and programme stories." },
    ], cta: { slug: "contact", label: "Become a partner" },
  },
  apply: {
    eyebrow: "For founders", title: "Register your interest", description: "Tell ASIP about your team, technology venture, market, and current stage.", notice: "The current form is a demonstration and does not transmit or store application data.", sectionTitle: "Prepare your venture profile", sectionDescription: "Before applying, gather a concise description of the problem, your solution, evidence of progress, and the support you need next.", cards: [
      { title: "Team", description: "Introduce the founders and the experience that prepares you to solve this problem." },
      { title: "Solution", description: "Explain the customer problem, your product, and what makes your approach relevant." },
      { title: "Progress", description: "Summarize traction, learning, current stage, and the next milestones you are pursuing." },
    ], cta: { slug: "contact", label: "Ask a question" },
  },
  faq: {
    eyebrow: "FAQ", title: "Frequently asked questions", description: "Practical information about the programme, applications, portfolio, and partnerships.", notice: "Programme-specific dates and criteria will be updated after approval.", sectionTitle: "What founders and partners ask", sectionDescription: "These answers describe the current programme structure and will evolve with each published cycle.", cards: [
      { title: "What is ASIP?", description: "A Telecel Group initiative supporting African technology ventures through acceleration, ecosystem access, and visibility." },
      { title: "Who can register interest?", description: "Technology founders can share their interest; final eligibility is published for each programme cycle." },
      { title: "What support is provided?", description: "The programme combines structured guidance, relevant connections, peer learning, and market visibility." },
      { title: "How can organizations partner?", description: "Prospective partners can contact ASIP to discuss expertise, access, content, and ecosystem collaboration." },
    ], cta: { slug: "contact", label: "Ask another question" },
  },
};

const fr: MarketingCopy = {
  "": { eyebrow: "Programme africain d’initiative pour les startups", title: "Aider les entreprises technologiques africaines à grandir avec confiance", description: "Une initiative du Groupe Telecel qui relie les fondateurs à une accélération structurée, à l’écosystème et à une visibilité marché.", notice: "Les informations du programme sont en cours de validation finale par Telecel.", sectionTitle: "Conçu autour du parcours des fondateurs", sectionDescription: "Découvrez le programme, les entreprises participantes et les histoires qui façonnent l’écosystème technologique africain.", cards: [{ title: "Accélération structurée", description: "Un accompagnement pratique adapté aux besoins et à la maturité de chaque entreprise." }, { title: "Accès à l’écosystème", description: "Des liens avec des mentors, partenaires, pairs et marchés pertinents." }, { title: "Visibilité crédible", description: "Une plateforme pour partager des progrès, enseignements et parcours vérifiés." }], cta: { slug: "programme", label: "Découvrir le programme" } },
  about: { eyebrow: "À propos d’ASIP", title: "Une plateforme pour les entreprises technologiques africaines", description: "ASIP est une initiative du Groupe Telecel qui accompagne les fondateurs par l’accélération, l’accès à l’écosystème et la visibilité marché.", notice: "L’histoire, les images, les noms et les étapes clés nécessitent l’approbation de Telecel.", sectionTitle: "Mission et orientation", sectionDescription: "Le programme aide les entreprises prometteuses à renforcer leurs bases, atteindre des réseaux utiles et communiquer leurs progrès de manière responsable.", cards: [{ title: "Fondation", description: "ASIP a été créé pour apporter un soutien concret à l’écosystème technologique africain." }, { title: "Développement du programme", description: "Chaque cycle transforme les besoins des fondateurs en accompagnement ciblé et en rencontres utiles." }, { title: "Le prochain chapitre", description: "La plateforme documentera les entreprises, partenariats, résultats et opportunités vérifiés." }], cta: { slug: "partners", label: "Découvrir nos partenaires" } },
  programme: { eyebrow: "Programme", title: "Un parcours de croissance conçu pour les fondateurs", description: "Une présentation claire du public concerné, du fonctionnement de la participation et de ce que les fondateurs peuvent attendre.", notice: "Les critères, dates et modalités seront publiés après validation.", sectionTitle: "Un parcours simple", sectionDescription: "L’expérience va de la manifestation d’intérêt et de la sélection à l’accélération ciblée et à l’accès à l’écosystème.", cards: [{ title: "01 · Manifester son intérêt", description: "Présentez brièvement l’équipe, l’entreprise, le marché et les progrès actuels." }, { title: "02 · Évaluation et sélection", description: "Les candidatures sont évaluées selon les critères publiés pour le cycle concerné." }, { title: "03 · Parcours du programme", description: "Les fondateurs sélectionnés participent à des sessions structurées, au mentorat et aux échanges entre pairs." }, { title: "04 · Accès au marché", description: "Des introductions et une visibilité pertinentes préparent l’entreprise à sa prochaine étape." }], cta: { slug: "apply", label: "Manifester votre intérêt" } },
  portfolio: { eyebrow: "Portefeuille", title: "Les entreprises de l’écosystème ASIP", description: "Découvrez les entreprises accompagnées par ASIP selon les cohortes, pays et secteurs technologiques.", notice: "Les profils et résultats ne sont publiés qu’après vérification.", sectionTitle: "Une archive d’entreprises en croissance", sectionDescription: "Le portefeuille facilite la découverte des fondateurs, de leurs solutions et de leurs progrès.", cards: [{ title: "Par cohorte", description: "Explorez les entreprises de chaque cycle à mesure que les profils sont approuvés." }, { title: "Par marché", description: "Découvrez les pays et communautés où les entreprises construisent leurs solutions." }, { title: "Par secteur", description: "Explorez la finance, la santé, le climat, le commerce et d’autres domaines." }], cta: { slug: "impact", label: "Découvrir notre impact" } },
  impact: { eyebrow: "Impact", title: "Rendre les progrès visibles et crédibles", description: "La portée vérifiée du portefeuille, les résultats des fondateurs et les histoires de l’écosystème, avec le contexte des chiffres.", notice: "Les chiffres ne seront publiés qu’après examen et approbation.", sectionTitle: "Des preuves accompagnées de contexte", sectionDescription: "Le suivi d’impact associe les résultats mesurables aux histoires qui les expliquent.", cards: [{ title: "Entreprises accompagnées", description: "Les chiffres de participation proviendront des dossiers vérifiés du programme." }, { title: "Marchés atteints", description: "L’expansion sera présentée avec des définitions et périodes de référence claires." }, { title: "Résultats des fondateurs", description: "Les récits relieront les progrès aux enseignements de chaque parcours." }], cta: { slug: "insights", label: "Lire les dernières perspectives" } },
  partners: { eyebrow: "Partenaires", title: "Collaborer à travers l’écosystème", description: "Des organisations qui apportent expertise, accès, visibilité et soutien aux fondateurs technologiques africains.", notice: "Les noms et logos seront affichés après autorisation de publication.", sectionTitle: "Ouvrir des portes utiles", sectionDescription: "ASIP travaille avec des partenaires dont les capacités ont un impact concret sur les entreprises participantes.", cards: [{ title: "Expertise", description: "Des spécialistes et mentors partagent des connaissances pertinentes." }, { title: "Accès au marché", description: "Les relations créent des passerelles vers clients, pairs et nouveaux marchés." }, { title: "Visibilité", description: "Les partenaires médias et communautaires valorisent des histoires crédibles." }], cta: { slug: "contact", label: "Devenir partenaire" } },
  apply: { eyebrow: "Pour les fondateurs", title: "Manifester votre intérêt", description: "Présentez à ASIP votre équipe, votre entreprise technologique, votre marché et votre stade actuel.", notice: "Le formulaire actuel est une démonstration et ne transmet ni ne stocke de données.", sectionTitle: "Préparez le profil de votre entreprise", sectionDescription: "Rassemblez une description concise du problème, de la solution, des progrès et du soutien recherché.", cards: [{ title: "Équipe", description: "Présentez les fondateurs et l’expérience qui vous prépare à résoudre ce problème." }, { title: "Solution", description: "Expliquez le problème client, votre produit et la pertinence de votre approche." }, { title: "Progrès", description: "Résumez la traction, les apprentissages, le stade actuel et les prochaines étapes." }], cta: { slug: "contact", label: "Poser une question" } },
  faq: { eyebrow: "FAQ", title: "Questions fréquentes", description: "Informations pratiques sur le programme, les candidatures, le portefeuille et les partenariats.", notice: "Les dates et critères propres au programme seront actualisés après validation.", sectionTitle: "Les questions des fondateurs et partenaires", sectionDescription: "Ces réponses décrivent la structure actuelle et évolueront avec chaque cycle publié.", cards: [{ title: "Qu’est-ce qu’ASIP ?", description: "Une initiative du Groupe Telecel qui soutient les entreprises technologiques africaines par l’accélération, l’accès à l’écosystème et la visibilité." }, { title: "Qui peut manifester son intérêt ?", description: "Les fondateurs technologiques peuvent se présenter ; les critères définitifs sont publiés pour chaque cycle." }, { title: "Quel soutien est proposé ?", description: "Le programme associe accompagnement structuré, connexions pertinentes, apprentissage entre pairs et visibilité." }, { title: "Comment devenir partenaire ?", description: "Les organisations peuvent contacter ASIP pour discuter expertise, accès, contenu et collaboration." }], cta: { slug: "contact", label: "Poser une autre question" } },
};

export function marketingCopyFor(locale: Locale, slug: MarketingContentSlug) {
  return (locale === "fr" ? fr : en)[slug];
}
