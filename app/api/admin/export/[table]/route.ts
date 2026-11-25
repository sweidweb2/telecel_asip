import { NextResponse } from "next/server";

import { getAuthUser, isCurrentUserStaff } from "@/data/auth";
import { fetchAdminExportPage } from "@/data/admin-export";
import {
  csvReadableStream,
  EXPORT_MAX_ROWS,
  iterateExportRows,
} from "@/lib/admin/export-csv-stream";
import {
  EXPORT_TABLES,
  isExportTable,
  type ExportTable,
} from "@/lib/admin/export-tables";
import { getStaffShell } from "@/lib/admin/get-staff-shell";
import { consumeSharedRateLimit } from "@/lib/rate-limit";
import { createAdminClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";

export { EXPORT_MAX_ROWS };

/** Per-staff exports allowed in the rate window. */
const EXPORT_RATE_LIMIT_PER_USER = 10;
/** Per-IP exports allowed in the rate window (shared staff networks). */
const EXPORT_RATE_LIMIT_PER_IP = 20;
const EXPORT_RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000;

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
  const { table: tableParam } = await context.params;
  if (!isExportTable(tableParam)) {
    return NextResponse.json({ error: "Unknown export table." }, { status: 404 });
  }
  const table: ExportTable = tableParam;

  const [isStaff, user] = await Promise.all([
    isCurrentUserStaff(),
    getAuthUser(),
  ]);
  if (!isStaff || !user) {
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
    return fetchAdminExportPage({
      table,
      from,
      to,
      hideAdminProfiles,
    });
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
