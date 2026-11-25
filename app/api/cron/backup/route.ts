import { NextResponse } from "next/server";

import {
  applyAutomatedBackupRetention,
  failStuckInFlightBackups,
  runScheduledBackupWindow,
} from "@/lib/backups/automated";
import { getCronBackupSchedule } from "@/lib/backups/get-cron-backup-schedule";
import {
  isScheduleDue,
  scheduleWindowKey,
} from "@/lib/backups/schedule";

export const runtime = "nodejs";
export const maxDuration = 300;

function authorizeCron(request: Request): boolean {
  const secret = process.env.BACKUP_CRON_SECRET?.trim();
  if (!secret) return false;
  // Bearer only — never accept ?secret= (leaks via logs / Referer).
  return request.headers.get("authorization") === `Bearer ${secret}`;
}

export async function POST(request: Request) {
  if (!authorizeCron(request)) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  try {
    await failStuckInFlightBackups();
  } catch (err) {
    console.error("[backups] stuck cleanup failed", err);
  }

  const backupTime = await getCronBackupSchedule();
  if (backupTime === null) {
    return NextResponse.json(
      { error: "Could not read backup schedule." },
      { status: 500 },
    );
  }

  async function safeRetention(now?: Date): Promise<number> {
    try {
      const retention = await applyAutomatedBackupRetention(now);
      return retention.deleted;
    } catch (err) {
      console.error("[backups] cron retention failed", err);
      return 0;
    }
  }

  if (backupTime === "off") {
    const retentionDeleted = await safeRetention();
    return NextResponse.json({
      ok: true,
      skipped: "off",
      retentionDeleted,
    });
  }

  const now = new Date();
  if (!isScheduleDue(backupTime, now)) {
    const retentionDeleted = await safeRetention(now);
    return NextResponse.json({
      ok: true,
      skipped: "not_due",
      retentionDeleted,
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

  const retentionDeleted = await safeRetention(now);

  if (result.status === "failed") {
    console.error("[backups] scheduled window failed", result);
    return NextResponse.json(
      {
        error: "Backup window failed after retries.",
        ...result,
        retentionDeleted,
      },
      { status: 500 },
    );
  }

  return NextResponse.json({
    ok: true,
    ...result,
    scheduleWindow: windowKey,
    retentionDeleted,
  });
}
