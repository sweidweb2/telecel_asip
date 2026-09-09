export type LocalizedCopy<T = string> = { en: T; fr: T };

export type MarketingMedia = {
  src: string;
  alt: LocalizedCopy;
  position?: string;
};

export const MARKETING_MEDIA = {
  home: { src: "/asip-media/home-founder.webp", alt: { en: "ASIP founder in conversation at a programme event", fr: "Fondateur ASIP en conversation lors d'un evenement du programme" }, position: "center 38%" },
  about: { src: "/asip-media/about-origin.webp", alt: { en: "Founders and ecosystem leaders gathering in Dakar", fr: "Fondateurs et acteurs de l'ecosysteme reunis a Dakar" }, position: "center 42%" },
  programme: { src: "/asip-media/programme-mentor.webp", alt: { en: "A mentor working directly with an ASIP founder", fr: "Un mentor travaillant directement avec un fondateur ASIP" }, position: "center 40%" },
  founders: { src: "/asip-media/founders-community.webp", alt: { en: "ASIP founders and programme community", fr: "Fondateurs ASIP et communaute du programme" }, position: "center 42%" },
  impact: {
    src: "/asip-media/impact-community.webp",
    alt: {
      en: "ASIP founders, mentors, and partners celebrating Demo Day",
      fr: "Fondateurs, mentors et partenaires ASIP célébrant le Demo Day",
    },
    position: "center 42%",
  },
  partners: { src: "/asip-media/partners-network.webp", alt: { en: "ASIP partners and founders meeting at an ecosystem event", fr: "Partenaires et fondateurs ASIP lors d'un evenement ecosystemique" }, position: "center 40%" },
  insights: { src: "/asip-media/insights-conversation.webp", alt: { en: "Founder conversation at an ASIP gathering", fr: "Conversation entre fondateurs lors d'une rencontre ASIP" }, position: "center 46%" },
  alumni: { src: "/asip-media/alumni-community.webp", alt: { en: "ASIP alumni celebrating together", fr: "Les alumni ASIP reunis pour celebrer" }, position: "center 42%" },
  apply: { src: "/asip-media/apply-founder.webp", alt: { en: "An African technology founder presenting at ASIP", fr: "Un fondateur technologique africain presente son projet a ASIP" }, position: "center 38%" },
  contact: { src: "/asip-media/contact-workshop.webp", alt: { en: "Two ASIP founders collaborating during a workshop", fr: "Deux fondatrices ASIP collaborant pendant un atelier" }, position: "center 42%" },
} satisfies Record<string, MarketingMedia>;
