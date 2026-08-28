/** Mirrors the `public.contact_enquiry_type` Postgres enum. */
export const CONTACT_ENQUIRY_TYPES = [
  "founder",
  "partner",
  "media",
  "general",
] as const;

export type ContactEnquiryType = (typeof CONTACT_ENQUIRY_TYPES)[number];

export const DEFAULT_CONTACT_ENQUIRY_TYPE: ContactEnquiryType = "general";

/** Dashboard-facing labels. Public copy lives in `contact-labels.ts`. */
export const CONTACT_ENQUIRY_ADMIN_LABELS: Record<ContactEnquiryType, string> =
  {
    founder: "Founder",
    partner: "Partner",
    media: "Media",
    general: "General",
  };
