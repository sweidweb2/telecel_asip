import type { ContactEnquiryType } from "@/constants/contact-enquiry";
import type { Locale } from "@/constants/locales";

export type ContactEnquiryRoute = {
  id: ContactEnquiryType;
  label: string;
  /** Short description of what belongs on this route. */
  microcopy: string;
};

export type ContactLabels = {
  pageTitle: string;
  pageDescription: string;
  routesLegend: string;
  routesHint: string;
  routes: readonly ContactEnquiryRoute[];
  infoTitle: string;
  infoDescription: string;
  addressLabel: string;
  emailLabel: string;
  phoneLabel: string;
  formTitle: string;
  formDescription: string;
  enquiryTypeLabel: string;
  nameLabel: string;
  namePlaceholder: string;
  phoneFieldLabel: string;
  phonePlaceholder: string;
  emailFieldLabel: string;
  emailPlaceholder: string;
  subjectLabel: string;
  subjectPlaceholder: string;
  messageLabel: string;
  messagePlaceholder: string;
  submitLabel: string;
  submittingLabel: string;
  successToast: string;
  successTitle: string;
  successDescription: string;
  successCloseLabel: string;
  turnstileHint: string;
};

const EN: ContactLabels = {
  pageTitle: "Contact us",
  pageDescription:
    "Choose a founder, partner, media or general inquiry route and the ASIP team will direct it to the relevant owner.",
  routesLegend: "Inquiry route",
  routesHint: "Pick the route that matches your inquiry.",
  routes: [
    {
      id: "founder",
      label: "Founder inquiry",
      microcopy:
        "Questions about eligibility, applications, cohorts or portfolio support.",
    },
    {
      id: "partner",
      label: "Partner inquiry",
      microcopy:
        "Corporate, investor, technology, development or ecosystem collaboration.",
    },
    {
      id: "media",
      label: "Media inquiry",
      microcopy:
        "Interview requests, approved data, founder stories, imagery and event information.",
    },
    {
      id: "general",
      label: "General inquiry",
      microcopy: "Use when none of the defined routes applies.",
    },
  ],
  infoTitle: "Contact details",
  infoDescription: "Reach the ASIP team by post, email or phone.",
  addressLabel: "Address",
  emailLabel: "Email",
  phoneLabel: "Phone number",
  formTitle: "Send a message",
  formDescription: "Tell us how we can help. We will get back to you shortly.",
  enquiryTypeLabel: "Inquiry route",
  nameLabel: "Name",
  namePlaceholder: "Your name",
  phoneFieldLabel: "Phone",
  phonePlaceholder: "Your phone number",
  emailFieldLabel: "Email",
  emailPlaceholder: "you@example.com",
  subjectLabel: "Subject",
  subjectPlaceholder: "How can we help?",
  messageLabel: "Message",
  messagePlaceholder: "Write your message (at least 20 characters)",
  submitLabel: "Send message",
  submittingLabel: "Sending…",
  successToast: "Thank you - your message has been sent.",
  successTitle: "Thank you",
  successDescription:
    "Your message has been sent. The ASIP team will get back to you shortly.",
  successCloseLabel: "Close",
  turnstileHint: "Complete the security check before sending.",
};

const FR: ContactLabels = {
  pageTitle: "Nous contacter",
  pageDescription:
    "Choisissez une demande fondateur, partenaire, presse ou générale et l’équipe ASIP la dirigera vers le bon interlocuteur.",
  routesLegend: "Type de demande",
  routesHint: "Choisissez le parcours qui correspond à votre demande.",
  routes: [
    {
      id: "founder",
      label: "Demande fondateur",
      microcopy:
        "Questions sur l’éligibilité, les candidatures, les cohortes ou l’accompagnement du portefeuille.",
    },
    {
      id: "partner",
      label: "Demande partenaire",
      microcopy:
        "Collaboration entreprise, investisseur, technologie, développement ou écosystème.",
    },
    {
      id: "media",
      label: "Demande presse",
      microcopy:
        "Demandes d’interview, données validées, histoires de fondateurs, images et informations sur les événements.",
    },
    {
      id: "general",
      label: "Demande générale",
      microcopy: "À utiliser lorsqu’aucun des parcours définis ne s’applique.",
    },
  ],
  infoTitle: "Coordonnées",
  infoDescription:
    "Contactez l’équipe ASIP par courrier, e-mail ou téléphone.",
  addressLabel: "Adresse",
  emailLabel: "E-mail",
  phoneLabel: "Numéro de téléphone",
  formTitle: "Envoyer un message",
  formDescription:
    "Dites-nous comment nous pouvons vous aider. Nous vous répondrons rapidement.",
  enquiryTypeLabel: "Type de demande",
  nameLabel: "Nom",
  namePlaceholder: "Votre nom",
  phoneFieldLabel: "Téléphone",
  phonePlaceholder: "Votre numéro de téléphone",
  emailFieldLabel: "E-mail",
  emailPlaceholder: "vous@exemple.com",
  subjectLabel: "Objet",
  subjectPlaceholder: "Comment pouvons-nous vous aider ?",
  messageLabel: "Message",
  messagePlaceholder: "Écrivez votre message (au moins 20 caractères)",
  submitLabel: "Envoyer le message",
  submittingLabel: "Envoi…",
  successToast: "Merci - votre message a bien été envoyé.",
  successTitle: "Merci",
  successDescription:
    "Votre message a bien été envoyé. L’équipe ASIP vous répondra rapidement.",
  successCloseLabel: "Fermer",
  turnstileHint: "Complétez la vérification de sécurité avant d’envoyer.",
};

export function contactLabelsFor(locale: Locale): ContactLabels {
  return locale === "fr" ? FR : EN;
}
