import { CONTACT } from "@/constants/contact";
import type { Locale } from "@/constants/locales";
import type { LegalPageCopy, LegalPageSlug } from "@/types/marketing-page";

type LegalCopy = Record<LegalPageSlug, LegalPageCopy>;

const en: LegalCopy = {
  terms: {
    eyebrow: "Legal",
    title: "Terms of Service",
    description:
      "How visitors and account holders may use the Africa Startup Initiative Program (ASIP) website, accounts, and intake forms.",
    lastUpdated: "Last updated: 9 September 2026",
    notice: "",
    sections: [
      {
        title: "1. Acceptance of terms",
        paragraphs: [
          "By accessing or using this website, you agree to these Terms of Service and to any additional guidelines we publish on the site. If you do not agree, do not use the site.",
          "We may update these terms from time to time. Continued use after changes are posted means you accept the revised terms. The “Last updated” date at the top of this page shows the current version.",
        ],
      },
      {
        title: "2. About ASIP",
        paragraphs: [
          "ASIP is a Telecel Group Program that helps African technology founders test ideas, work with customers and partners, and grow early-stage ventures. Content on this site describes the program for visitors; it is not a binding offer of funding, admission, partnership, or any other commitment unless Telecel Group confirms that in writing.",
          "Program capacity, eligibility, and chapter timing can change. Status banners and CTAs (Apply vs Register Interest) reflect the current settings on this site; they do not guarantee that a cohort is open or that your submission will be selected.",
        ],
      },
      {
        title: "3. Accounts",
        paragraphs: [
          "You can create an account with your name, email, and password. Public signup creates a viewer account: you can use signed-in intake forms, not the Editor or Admin panels. Only staff designated by Telecel Group can manage program content and platform operations.",
          "You must provide accurate information, keep your credentials secure, and not share your account. You are responsible for activity under your account. There is no self-serve password reset on this site, if you cannot sign in, contact the ASIP team using the details in section 8.",
          "We may refuse, suspend, or remove access where we reasonably believe these terms have been breached, or where security or program rules require it.",
        ],
      },
      {
        title: "4. Register Interest and Apply",
        paragraphs: [
          "Register Interest and Apply require a signed-in account. Only one intake path is live at a time, based on the site Applications setting:",
          "When applications are closed, Register Interest is available and Apply redirects to Register Interest. Apply submissions are rejected.",
          "When applications are open, Apply is available and Register Interest redirects to Apply. Interest submissions are rejected.",
          "Register Interest records a short founder and venture profile for updates when the next chapter opens. Apply is the official program intake and asks for additional product, traction, and program-fit detail. Submitting either form does not create a contractual right to join ASIP, receive investment, or obtain any other benefit.",
          "Interest registrations and applications are separate tables. Registering interest does not become an application when Apply opens. Duplicate submissions for the same email and company name may be rejected.",
          "You must confirm the consent checkbox before submit. Optional program-update opt-in is separate. We use rate limits to reduce spam; abuse or automated bulk submit may be blocked.",
        ],
      },
      {
        title: "5. Contact and newsletter",
        paragraphs: [
          "The Contact form lets you send founder, partner, media, or general enquiries without creating an application. Messages are stored for the ASIP team to review; this site does not automatically email a confirmation to you or forward your message to a public mailbox outside the admin tools.",
          "Public newsletter signup on Insights is not offered in the current phase. The setting stays off and the server rejects new subscriptions until a later phase after privacy, routing, and ownership are confirmed.",
        ],
      },
      {
        title: "6. Acceptable use and intellectual property",
        paragraphs: [
          "You agree not to misuse the site, including unauthorized access, disrupting services, scraping content at scale without permission, or submitting unlawful, harmful, or misleading material.",
          "Program materials, branding, founder stories, insights, and other site content remain the property of Telecel Group, its licensors, or named third parties, and may not be reused commercially without prior written consent.",
        ],
      },
      {
        title: "7. Disclaimers and limitation of liability",
        paragraphs: [
          "The site and program information are provided on an “as is” basis. We do not guarantee uninterrupted availability, error-free content, or any particular outcome for applicants, registrants, or partners.",
          "To the fullest extent permitted by law, Telecel Group and its affiliates are not liable for indirect, incidental, or consequential losses arising from use of the site. Nothing in these terms excludes liability that cannot be limited under applicable law.",
        ],
      },
      {
        title: "8. Contact",
        paragraphs: [
          `Questions about these terms can be sent through the Contact page or to ${CONTACT.email}. Formal notices: ${CONTACT.addressLines.join(" ")}; phone ${CONTACT.phone}.`,
        ],
      },
    ],
  },
  privacy: {
    eyebrow: "Legal",
    title: "Privacy Policy",
    description:
      "How ASIP collects, uses, stores, and protects personal information on this website and related program services.",
    lastUpdated: "Last updated: 9 September 2026",
    notice: "",
    sections: [
      {
        title: "1. Who we are",
        paragraphs: [
          "ASIP (Africa Startup Initiative Program) is operated as part of Telecel Group’s programs. This policy covers the public website, viewer accounts, Register Interest and Apply forms, and Contact. Public newsletter signup is not offered in the current phase.",
          `Controller contact for privacy requests: ${CONTACT.email}. Address: ${CONTACT.addressLines.join(" ")}. Phone: ${CONTACT.phone}.`,
        ],
      },
      {
        title: "2. Information we collect",
        paragraphs: [
          "Account signup: name, email, and password (password is handled by our authentication provider; we do not store it in plain text on the ASIP application tables).",
          "Register Interest (signed-in, when applications are closed): founder name and role, email, phone, country, optional LinkedIn and website, company name and country, sector, optional short note, required consent, and optional communications opt-in.",
          "Apply (signed-in, when applications are open): the same profile fields as Register Interest, plus problem and product description, traction, and program fit, with required consent and optional communications opt-in.",
          "Contact (may be anonymous): inquiry type (founder, partner, media, or general), name, email, phone, subject, and message. No separate consent checkbox is required on Contact beyond these terms and this policy.",
          "Newsletter: there is no public signup UI in the current phase; forced or future subscriptions would use email and required consent only when that feature is turned on.",
          "Security and operations: limited request metadata such as IP used for short-window rate limiting; and technical data needed to run the site (for example language preference and signed-in session).",
        ],
      },
      {
        title: "3. How we use information",
        paragraphs: [
          "We use personal data to operate the site, create and secure accounts, review Register Interest and Apply submissions in the admin dashboard, respond to Contact enquiries, improve and protect the service, and meet legal or security obligations. Program-update opt-in on intake forms is recorded for later contact when that channel is active.",
          "Public form submissions are written to our database for ASIP administrators. This site does not currently send automatic confirmation emails to visitors or CRM syncs from those forms. Admins may export inbox data (for example CSV) for program operations.",
          "We do not load third-party marketing or advertising analytics scripts on this site today. If that changes, we will update this policy and, where required, ask for consent.",
        ],
      },
      {
        title: "4. Cookies and preferences",
        id: "cookies",
        paragraphs: [
          "This site uses strictly necessary cookies and similar storage: one remembers your language choice (`en` / `fr`), and session cookies keep you signed in when you have an account. We do not set advertising or third-party analytics cookies, so there is currently nothing optional to opt out of here.",
          "You can clear or block cookies in your browser. Blocking them means the site may not remember your language and you may not stay signed in. If we add non-essential cookies later, we will ask for consent first and describe controls on this page (this section is also linked from “Cookie preferences” in the footer).",
        ],
      },
      {
        title: "5. Sharing, processors, and retention",
        paragraphs: [
          "We use trusted processors to host and run the product, including our database and authentication provider (Supabase), application hosting, under appropriate agreements. We do not sell your personal data.",
          "Admin users with authorized access can view and manage intake and contact records inside the dashboard. Viewer accounts cannot access other people’s submissions through the admin UI.",
          "We retain personal data only as long as needed for program administration, security, and legal requirements, then delete or anonymize it where practicable. You can ask us to review retention for your records using the contact details above.",
        ],
      },
      {
        title: "6. Your choices and rights",
        paragraphs: [
          "Depending on applicable law, you may have rights to access, correct, delete, or restrict processing of your personal data, or to object to certain uses. You can withdraw marketing or newsletter consent where you previously opted in.",
          `To exercise privacy rights, email ${CONTACT.email} or use the Contact page. We may need to verify your identity before acting on a request.`,
        ],
      },
      {
        title: "7. Children",
        paragraphs: [
          "ASIP is aimed at founders and professional contacts. The site is not directed at children, and we do not knowingly collect personal data from children for program intake.",
        ],
      },
      {
        title: "8. Changes to this policy",
        paragraphs: [
          "We may update this Privacy Policy when the product or law changes. The “Last updated” date above will change when a new version is published. Material changes may also be highlighted on the site.",
        ],
      },
    ],
  },
};

const fr: LegalCopy = {
  terms: {
    eyebrow: "Mentions légales",
    title: "Conditions d’utilisation",
    description:
      "Comment les visiteurs et les titulaires de compte peuvent utiliser le site du Programme africain d’initiative pour les startups (ASIP), les comptes et les formulaires d’admission.",
    lastUpdated: "Dernière mise à jour : 9 septembre 2026",
    notice: "",
    sections: [
      {
        title: "1. Acceptation des conditions",
        paragraphs: [
          "En accédant à ce site ou en l’utilisant, vous acceptez les présentes Conditions d’utilisation ainsi que toute consigne supplémentaire publiée sur le site. Si vous n’êtes pas d’accord, n’utilisez pas le site.",
          "Nous pouvons mettre à jour ces conditions de temps à autre. La poursuite de l’utilisation après publication des modifications vaut acceptation des conditions révisées. La date de « Dernière mise à jour » en haut de cette page indique la version en vigueur.",
        ],
      },
      {
        title: "2. À propos d’ASIP",
        paragraphs: [
          "ASIP est un programme du Groupe Telecel qui aide les fondateurs technologiques africains à tester des idées, rencontrer clients et partenaires, et faire croître des entreprises en phase initiale. Le contenu du site décrit le programme pour les visiteurs ; ce n’est pas une offre engageante de financement, d’admission, de partenariat ou d’autre engagement, sauf confirmation écrite du Groupe Telecel.",
          "La capacité du programme, l’éligibilité et le calendrier des chapitres peuvent évoluer. Les bannières et CTA (Postuler vs Manifester votre intérêt) reflètent les réglages actuels du site ; ils ne garantissent ni l’ouverture d’une cohorte ni la sélection de votre dossier.",
        ],
      },
      {
        title: "3. Comptes",
        paragraphs: [
          "Vous pouvez créer un compte avec votre nom, e-mail et mot de passe. L’inscription publique crée un compte viewer : vous pouvez utiliser les formulaires d’admission une fois connecté, pas le tableau de bord admin. Seuls les administrateurs désignés par le Groupe Telecel gèrent le contenu du programme et les boîtes de réception.",
          "Vous devez fournir des informations exactes, protéger vos identifiants et ne pas partager votre compte. Vous êtes responsable de l’activité sous votre compte. Il n’existe pas de réinitialisation de mot de passe en libre-service sur ce site, si vous ne pouvez pas vous connecter, contactez l’équipe ASIP avec les coordonnées de la section 8.",
          "Nous pouvons refuser, suspendre ou retirer l’accès lorsque nous estimons raisonnablement que ces conditions ont été enfreintes, ou lorsque la sécurité ou les règles du programme l’exigent.",
        ],
      },
      {
        title: "4. Manifestation d’intérêt et candidature",
        paragraphs: [
          "Manifester votre intérêt et Postuler exigent un compte connecté. Une seule voie d’admission est active à la fois, selon le réglage Candidatures du site :",
          "Lorsque les candidatures sont fermées, Manifester votre intérêt est disponible et Postuler redirige vers Manifester votre intérêt. Les envois de candidature sont refusés.",
          "Lorsque les candidatures sont ouvertes, Postuler est disponible et Manifester votre intérêt redirige vers Postuler. Les manifestations d’intérêt sont refusées.",
          "Manifester votre intérêt enregistre un court profil fondateur et entreprise pour les mises à jour à l’ouverture du prochain chapitre. Postuler est l’admission officielle et demande des détails supplémentaires sur le produit, la traction et l’adéquation au programme. L’envoi d’un formulaire ne crée aucun droit contractuel d’intégrer ASIP, de recevoir un investissement ou d’obtenir un autre avantage.",
          "Les manifestations d’intérêt et les candidatures sont des tables distinctes. Une manifestation d’intérêt ne devient pas une candidature à l’ouverture de Postuler. Les doublons pour le même e-mail et le même nom d’entreprise peuvent être refusés.",
          "Vous devez cocher la case de consentement avant l’envoi. L’opt-in facultatif aux mises à jour du programme est distinct. Nous utilisons des limites de débit pour réduire le spam ; les abus ou envois automatisés massifs peuvent être bloqués.",
        ],
      },
      {
        title: "5. Contact et newsletter",
        paragraphs: [
          "Le formulaire Contact permet d’envoyer des demandes fondateur, partenaire, presse ou générales sans créer de candidature. Les messages sont stockés pour examen par l’équipe ASIP ; ce site n’envoie pas automatiquement de confirmation par e-mail ni ne transfère votre message vers une boîte publique hors des outils admin.",
          "L’inscription newsletter publique sur Insights n’est pas proposée dans la phase actuelle. Le réglage reste désactivé et le serveur refuse les nouveaux abonnements jusqu’à une phase ultérieure, après confirmation de la confidentialité, du routage et de la responsabilité.",
        ],
      },
      {
        title: "6. Utilisation acceptable et propriété intellectuelle",
        paragraphs: [
          "Vous vous engagez à ne pas faire un usage abusif du site, notamment accès non autorisé, perturbation des services, extraction massive de contenus sans permission, ou envoi de contenus illicites, nuisibles ou trompeurs.",
          "Les supports du programme, la marque, les récits de fondateurs, les insights et les autres contenus du site restent la propriété du Groupe Telecel, de ses concédants ou de tiers nommés, et ne peuvent être réutilisés à des fins commerciales sans accord écrit préalable.",
        ],
      },
      {
        title: "7. Avertissements et limitation de responsabilité",
        paragraphs: [
          "Le site et les informations du programme sont fournis « en l’état ». Nous ne garantissons ni une disponibilité ininterrompue, ni l’absence d’erreurs, ni un résultat particulier pour les candidats, inscrits ou partenaires.",
          "Dans toute la mesure permise par la loi, le Groupe Telecel et ses affiliés ne sont pas responsables des pertes indirectes, accessoires ou consécutives liées à l’utilisation du site. Rien dans ces conditions n’exclut une responsabilité qui ne peut être limitée au regard du droit applicable.",
        ],
      },
      {
        title: "8. Contact",
        paragraphs: [
          `Les questions relatives à ces conditions peuvent être envoyées via la page Contact ou à ${CONTACT.email}. Notifications formelles : ${CONTACT.addressLines.join(" ")} ; téléphone ${CONTACT.phone}.`,
        ],
      },
    ],
  },
  privacy: {
    eyebrow: "Mentions légales",
    title: "Politique de confidentialité",
    description:
      "Comment ASIP collecte, utilise, conserve et protège les données personnelles sur ce site et les services associés du programme.",
    lastUpdated: "Dernière mise à jour : 9 septembre 2026",
    notice: "",
    sections: [
      {
        title: "1. Qui nous sommes",
        paragraphs: [
          "ASIP (Programme africain d’initiative pour les startups) est opéré dans le cadre des programmes du Groupe Telecel. Cette politique couvre le site public, les comptes viewer, les formulaires Manifester votre intérêt et Postuler, et Contact. L’inscription newsletter publique n’est pas proposée dans la phase actuelle.",
          `Contact du responsable pour les demandes de confidentialité : ${CONTACT.email}. Adresse : ${CONTACT.addressLines.join(" ")}. Téléphone : ${CONTACT.phone}.`,
        ],
      },
      {
        title: "2. Informations collectées",
        paragraphs: [
          "Création de compte : nom, e-mail et mot de passe (le mot de passe est géré par notre fournisseur d’authentification ; nous ne le stockons pas en clair dans les tables applicatives ASIP).",
          "Manifester votre intérêt (connecté, lorsque les candidatures sont fermées) : nom et rôle du fondateur, e-mail, téléphone, pays, LinkedIn et site web facultatifs, nom et pays de l’entreprise, secteur, note courte facultative, consentement obligatoire et opt-in communications facultatif.",
          "Postuler (connecté, lorsque les candidatures sont ouvertes) : les mêmes champs de profil que Manifester votre intérêt, plus description du problème et du produit, traction et adéquation au programme, avec consentement obligatoire et opt-in communications facultatif.",
          "Contact (peut être anonyme) : type de demande (fondateur, partenaire, presse ou générale), nom, e-mail, téléphone, objet et message. Aucune case de consentement séparée n’est exigée sur Contact au-delà des présentes conditions et de cette politique.",
          "Newsletter : il n’y a pas d’interface publique d’inscription dans la phase actuelle ; des abonnements forcés ou futurs utiliseraient e-mail et consentement obligatoire uniquement lorsque cette fonctionnalité sera activée.",
          "Sécurité et exploitation : métadonnées limitées de requête telles que l’IP pour le rate limiting à court terme ; et données techniques nécessaires au fonctionnement du site (par exemple préférence de langue et session connectée).",
        ],
      },
      {
        title: "3. Comment nous utilisons les informations",
        paragraphs: [
          "Nous utilisons les données personnelles pour faire fonctionner le site, créer et sécuriser les comptes, examiner les manifestations d’intérêt et candidatures dans le tableau de bord admin, répondre aux demandes Contact, améliorer et protéger le service, et respecter nos obligations légales ou de sécurité. L’opt-in aux mises à jour du programme sur les formulaires d’admission est enregistré pour un contact ultérieur lorsque ce canal sera actif.",
          "Les envois de formulaires publics sont enregistrés dans notre base pour les administrateurs ASIP. Ce site n’envoie actuellement pas d’e-mails de confirmation automatiques aux visiteurs ni de synchronisation CRM depuis ces formulaires. Les admins peuvent exporter les données de boîte de réception (par exemple CSV) pour les opérations du programme.",
          "Nous ne chargeons aujourd’hui aucun script marketing ou d’analyse publicitaire tiers sur ce site. Si cela change, nous mettrons à jour cette politique et, le cas échéant, demanderons votre consentement.",
        ],
      },
      {
        title: "4. Cookies et préférences",
        id: "cookies",
        paragraphs: [
          "Ce site utilise des cookies et un stockage similaire strictement nécessaires : l’un mémorise votre choix de langue (`en` / `fr`), et des cookies de session vous maintiennent connecté si vous avez un compte. Nous ne déposons aucun cookie publicitaire ni d’analyse tierce, il n’y a donc actuellement rien d’optionnel à refuser ici.",
          "Vous pouvez effacer ou bloquer les cookies dans votre navigateur. Les bloquer signifie que le site peut ne pas mémoriser votre langue et que vous pourriez ne pas rester connecté. Si nous ajoutons plus tard des cookies non essentiels, nous demanderons votre consentement au préalable et décrirons les contrôles sur cette page (cette section est aussi liée depuis « Préférences de cookies » dans le pied de page).",
        ],
      },
      {
        title: "5. Partage, sous-traitants et conservation",
        paragraphs: [
          "Nous utilisons des prestataires de confiance pour héberger et faire tourner le produit, notamment notre base de données et authentification (Supabase), l’hébergement applicatif, dans le cadre d’accords appropriés. Nous ne vendons pas vos données personnelles.",
          "Les utilisateurs admin autorisés peuvent consulter et gérer les dossiers d’admission et de contact dans le tableau de bord. Les comptes viewer ne peuvent pas accéder aux dossiers d’autrui via l’interface admin.",
          "Nous conservons les données personnelles uniquement aussi longtemps que nécessaire à l’administration du programme, à la sécurité et aux exigences légales, puis les supprimons ou anonymisons lorsque c’est possible. Vous pouvez nous demander d’examiner la conservation de vos dossiers avec les coordonnées ci-dessus.",
        ],
      },
      {
        title: "6. Vos choix et droits",
        paragraphs: [
          "Selon le droit applicable, vous pouvez disposer de droits d’accès, de rectification, de suppression ou de limitation du traitement de vos données, ou d’opposition à certains usages. Vous pouvez retirer un consentement marketing ou newsletter lorsque vous y avez précédemment souscrit.",
          `Pour exercer vos droits, écrivez à ${CONTACT.email} ou utilisez la page Contact. Nous pourrons devoir vérifier votre identité avant de traiter une demande.`,
        ],
      },
      {
        title: "7. Enfants",
        paragraphs: [
          "ASIP s’adresse aux fondateurs et contacts professionnels. Le site n’est pas destiné aux enfants, et nous ne collectons pas sciemment de données personnelles d’enfants pour l’admission au programme.",
        ],
      },
      {
        title: "8. Modifications de cette politique",
        paragraphs: [
          "Nous pouvons mettre à jour cette Politique de confidentialité lorsque le produit ou la loi évolue. La date de « Dernière mise à jour » ci-dessus changera lors de la publication d’une nouvelle version. Les changements importants pourront aussi être signalés sur le site.",
        ],
      },
    ],
  },
};

export function legalCopyFor(locale: Locale, slug: LegalPageSlug): LegalPageCopy {
  return (locale === "fr" ? fr : en)[slug];
}
