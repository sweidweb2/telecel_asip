import { NextResponse } from "next/server";

import {
  applyAutomatedBackupRetention,
  runScheduledBackupWindow,
} from "@/lib/backups/automated";
import {
  isScheduleDue,
  scheduleWindowKey,
  type BackupScheduleValue,
  BACKUP_SCHEDULE_VALUES,
} from "@/lib/backups/schedule";
import { createAdminClient } from "@/lib/supabase/admin";
import { SITE_SETTINGS_ID } from "@/data/settings";

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

function isBackupSchedule(value: string): value is BackupScheduleValue {
  return (BACKUP_SCHEDULE_VALUES as readonly string[]).includes(value);
}

export async function POST(request: Request) {
  if (!authorizeCron(request)) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const admin = createAdminClient();
  const { data: settings, error: settingsError } = await admin
    .from("site_settings")
    .select("backup_time")
    .eq("id", SITE_SETTINGS_ID)
    .maybeSingle();

  if (settingsError || !settings) {
    console.error("[backups] cron settings read failed", settingsError);
    return NextResponse.json(
      { error: "Could not read backup schedule." },
      { status: 500 },
    );
  }

  const backupTime = settings.backup_time;
  if (!isBackupSchedule(backupTime) || backupTime === "off") {
    const retention = await applyAutomatedBackupRetention();
    return NextResponse.json({
      ok: true,
      skipped: "off",
      retentionDeleted: retention.deleted,
    });
  }

  const now = new Date();
  if (!isScheduleDue(backupTime, now)) {
    const retention = await applyAutomatedBackupRetention(now);
    return NextResponse.json({
      ok: true,
      skipped: "not_due",
      retentionDeleted: retention.deleted,
    });
  }

  const windowKey = scheduleWindowKey(backupTime, now);
  if (!windowKey) {
    return NextResponse.json({ ok: true, skipped: "no_window" });
  }

  const result = await runScheduledBackupWindow({
    backupTime,
    scheduleWindow: windowKey,
  });

  const retention = await applyAutomatedBackupRetention(now);

  if (result.status === "failed") {
    console.error("[backups] scheduled window failed", result);
    return NextResponse.json(
      {
        error: "Backup window failed after retries.",
        ...result,
        retentionDeleted: retention.deleted,
      },
      { status: 500 },
    );
  }

  return NextResponse.json({
    ok: true,
    ...result,
    scheduleWindow: windowKey,
    retentionDeleted: retention.deleted,
  });
}
