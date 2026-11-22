import { NextResponse } from "next/server";

import { getAuthUser } from "@/lib/admin/get-auth-user";
import { getStaffShell } from "@/lib/admin/get-staff-shell";
import { isCurrentUserStaff } from "@/lib/admin/is-current-user-staff";
import {
  csvReadableStream,
  EXPORT_MAX_ROWS,
  iterateExportRows,
} from "@/lib/admin/export-csv-stream";
import { consumeSharedRateLimit } from "@/lib/rate-limit";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

export { EXPORT_MAX_ROWS };

/** Per-staff exports allowed in the rate window. */
const EXPORT_RATE_LIMIT_PER_USER = 10;
/** Per-IP exports allowed in the rate window (shared staff networks). */
const EXPORT_RATE_LIMIT_PER_IP = 20;
const EXPORT_RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000;

const EXPORT_TABLES = {
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

type ExportTable = keyof typeof EXPORT_TABLES;

function isExportTable(value: string): value is ExportTable {
  return value in EXPORT_TABLES;
}

function clientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    const first = forwarded.split(",")[0]?.trim();
    if (first) return first;
  }
  return request.headers.get("x-real-ip")?.trim() || "unknown";
}

export async function GET(
  request: Request,
  context: { params: Promise<{ table: string }> },
) {
  const { table } = await context.params;
  if (!isExportTable(table)) {
    return NextResponse.json({ error: "Unknown export table." }, { status: 404 });
  }

  if (!(await isCurrentUserStaff())) {
    return NextResponse.json({ error: "Forbidden." }, { status: 403 });
  }

  const user = await getAuthUser();
  if (!user) {
    return NextResponse.json({ error: "Forbidden." }, { status: 403 });
  }

  const ip = clientIp(request);
  const admin = createAdminClient();
  const allowed =
    (await consumeSharedRateLimit(
      admin,
      `admin-export:user:${user.id}`,
      EXPORT_RATE_LIMIT_PER_USER,
      EXPORT_RATE_LIMIT_WINDOW_MS,
    )) &&
    (await consumeSharedRateLimit(
      admin,
      `admin-export:ip:${ip}`,
      EXPORT_RATE_LIMIT_PER_IP,
      EXPORT_RATE_LIMIT_WINDOW_MS,
    ));

  if (!allowed) {
    return NextResponse.json(
      { error: "Too many exports. Try again later." },
      {
        status: 429,
        headers: { "Retry-After": "3600" },
      },
    );
  }

  const config = EXPORT_TABLES[table];
  const columns = config.columns.split(",");
  const supabase = await createClient();
  const hideAdminProfiles =
    table === "profiles"
      ? await getStaffShell().then(
          (shell) => shell.isEditor && !shell.isAdmin,
        )
      : false;

  async function fetchPage(
    from: number,
    to: number,
  ): Promise<Record<string, unknown>[]> {
    if (table === "profiles") {
      let query = supabase
        .from("profiles")
        .select(config.columns)
        .order("created_at", { ascending: false })
        .range(from, to);
      if (hideAdminProfiles) {
        query = query.neq("role", "admin");
      }
      const result = await query;
      if (result.error) throw result.error;
      return (result.data ?? []) as unknown as Record<string, unknown>[];
    }

    const result = await supabase
      .from(table as Exclude<ExportTable, "profiles">)
      .select(config.columns as never)
      .order("created_at", { ascending: false })
      .range(from, to);
    if (result.error) throw result.error;
    return (result.data ?? []) as unknown as Record<string, unknown>[];
  }

  const stamp = new Date().toISOString().slice(0, 10);

  console.info(
    "[admin-export]",
    JSON.stringify({
      table,
      userId: user.id,
      ip,
      maxRows: EXPORT_MAX_ROWS,
      streamed: true,
    }),
  );

  const stream = csvReadableStream(
    columns,
    iterateExportRows(fetchPage),
  );

  return new NextResponse(stream, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${config.filename}-${stamp}.csv"`,
      "Cache-Control": "no-store",
      "X-Export-Max-Rows": String(EXPORT_MAX_ROWS),
    },
  });
}
