import { NextResponse } from "next/server";

import { applyAutomatedBackupRetention } from "@/lib/backups/retention";
import { runBackupJob } from "@/lib/backups/run-backup";
import { createAdminClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";
export const maxDuration = 300;

function authorizeCron(request: Request): boolean {
  const secret = process.env.BACKUP_CRON_SECRET?.trim();
  if (!secret) return false;

  const header = request.headers.get("authorization");
  if (header === `Bearer ${secret}`) return true;

  const url = new URL(request.url);
  return url.searchParams.get("secret") === secret;
}

export async function POST(request: Request) {
  if (!authorizeCron(request)) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const admin = createAdminClient();
  const { data: row, error } = await admin
    .from("backups")
    .insert({
      user_id: null,
      scope: "automated",
      format: "json",
      target_tables: null,
      status: "pending",
    })
    .select("id")
    .single();

  if (error || !row?.id) {
    console.error("[backups] weekly cron insert failed", error);
    return NextResponse.json(
      { error: "Could not create backup record." },
      { status: 500 },
    );
  }

  try {
    await runBackupJob({
      backupId: row.id,
      scope: "automated",
      format: "json",
      targetTables: null,
    });

    const retention = await applyAutomatedBackupRetention();

    return NextResponse.json({
      ok: true,
      backupId: row.id,
      retentionDeleted: retention.deleted,
    });
  } catch (err) {
    console.error("[backups] weekly cron job failed", {
      backupId: row.id,
      err,
    });
    return NextResponse.json(
      {
        error: err instanceof Error ? err.message : "Backup failed.",
        backupId: row.id,
      },
      { status: 500 },
    );
  }
}
