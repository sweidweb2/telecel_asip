/**
 * Staff CSV export table configs — column lists stay explicit (no select('*')).
 */

export const EXPORT_TABLES = {
  applications: {
    filename: "applications",
    columns:
      "id,full_name,founder_role,email,phone,country,linkedin,company_name,website,company_country,sector,problem_product,traction,programme_fit,consent,comms_opt_in,inbox_status,created_at" as const,
  },
  interest_registrations: {
    filename: "interest-registrations",
    columns:
      "id,full_name,founder_role,email,phone,country,linkedin,company_name,website,company_country,sector,pitch,consent,comms_opt_in,inbox_status,created_at" as const,
  },
  investor_interests: {
    filename: "investor-interests",
    columns:
      "id,full_name,email,phone,organization,job_title,linkedin,investor_type,focus_note,consent,comms_opt_in,inbox_status,locale,created_at" as const,
  },
  investor_engagements: {
    filename: "investor-engagements",
    columns:
      "id,full_name,email,phone,organization,job_title,linkedin,investor_type,stages,ticket_size,sectors,geographies,engagement_intent,thesis,timeline,referred_by,message,consent,comms_opt_in,inbox_status,locale,created_at" as const,
  },
  contact_messages: {
    filename: "contact-messages",
    columns:
      "id,enquiry_type,full_name,email,phone,subject,message,inbox_status,created_at" as const,
  },
  newsletter_subscribers: {
    filename: "newsletter-subscribers",
    columns: "id,email,consent,source_page,created_at" as const,
  },
  profiles: {
    filename: "users",
    columns: "id,email,full_name,role,created_at,updated_at" as const,
  },
} as const;

export type ExportTable = keyof typeof EXPORT_TABLES;

export function isExportTable(value: string): value is ExportTable {
  return value in EXPORT_TABLES;
}
