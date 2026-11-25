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
};

const EN: ContactLabels = {
  pageTitle: "Start with the right conversation.",
  pageDescription: "Choose the route that best matches what you need.",
  routesLegend: "Enquiry route",
  routesHint: "Choose the route that best matches what you need.",
  routes: [
    {
      id: "founder",
      label: "Founder enquiry",
      microcopy:
        "Eligibility, cohort status, applications or founder support.",
    },
    {
      id: "partner",
      label: "Investor / partner enquiry",
      microcopy:
        "Portfolio, current activity, technology, investment or commercial collaboration.",
    },
    {
      id: "media",
      label: "Media enquiry",
      microcopy:
        "Approved data, founder stories, interviews, imagery or programme information.",
    },
    {
      id: "general",
      label: "General enquiry",
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
  enquiryTypeLabel: "Enquiry route",
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
  successToast: "Thank you. Your message has been sent.",
  successTitle: "Thank you",
  successDescription:
    "Your message has been sent. The ASIP team will get back to you shortly.",
  successCloseLabel: "Close",
};

const FR: ContactLabels = {
  pageTitle: "Commencez par la bonne conversation.",
  pageDescription: "Choisissez le parcours qui correspond le mieux à votre besoin.",
  routesLegend: "Type de demande",
  routesHint: "Choisissez le parcours qui correspond le mieux à votre besoin.",
  routes: [
    {
      id: "founder",
      label: "Demande fondateur",
      microcopy:
        "Éligibilité, statut de la cohorte, candidatures ou accompagnement des fondateurs.",
    },
    {
      id: "partner",
      label: "Demande investisseur / partenaire",
      microcopy:
        "Portefeuille, activité en cours, technologie, investissement ou collaboration commerciale.",
    },
    {
      id: "media",
      label: "Demande presse",
      microcopy:
        "Données validées, histoires de fondateurs, interviews, images ou informations sur le programme.",
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
  successToast: "Merci. Votre message a bien été envoyé.",
  successTitle: "Merci",
  successDescription:
    "Votre message a bien été envoyé. L’équipe ASIP vous répondra rapidement.",
  successCloseLabel: "Fermer",
};

export function contactLabelsFor(locale: Locale): ContactLabels {
  return locale === "fr" ? FR : EN;
}
