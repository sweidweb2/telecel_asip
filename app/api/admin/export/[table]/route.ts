import { NextResponse } from "next/server";

import { isCurrentUserEditor } from "@/lib/admin/is-current-user-editor";
import { rowsToCsv } from "@/lib/backups/serialize";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

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
  contact_messages: {
    filename: "contact-messages",
    columns:
      "id,enquiry_type,full_name,email,phone,subject,message,inbox_status,created_at" as const,
  },
} as const;

type ExportTable = keyof typeof EXPORT_TABLES;

function isExportTable(value: string): value is ExportTable {
  return value in EXPORT_TABLES;
}

export async function GET(
  _request: Request,
  context: { params: Promise<{ table: string }> },
) {
  const { table } = await context.params;
  if (!isExportTable(table)) {
    return NextResponse.json({ error: "Unknown export table." }, { status: 404 });
  }

  if (!(await isCurrentUserEditor())) {
    return NextResponse.json({ error: "Forbidden." }, { status: 403 });
  }

  const config = EXPORT_TABLES[table];
  const columns = config.columns.split(",");
  const supabase = await createClient();

  const { data, error } = await supabase
    .from(table)
    .select(config.columns as string)
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json(
      { error: "Could not export rows." },
      { status: 500 },
    );
  }

  const csv = rowsToCsv(
    columns,
    (data ?? []) as unknown as Record<string, unknown>[],
  );
  const stamp = new Date().toISOString().slice(0, 10);

  return new NextResponse(csv, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${config.filename}-${stamp}.csv"`,
      "Cache-Control": "no-store",
    },
  });
}
