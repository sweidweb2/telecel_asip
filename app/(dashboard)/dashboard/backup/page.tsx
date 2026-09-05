import type { Metadata } from "next";
import { DatabaseBackupIcon } from "lucide-react";

import { AdminComingSoon } from "@/components/dashboard/admin-coming-soon";
import { requireAdmin } from "@/data/auth";

export const metadata: Metadata = {
  title: "Backup | ASIP Admin",
};

export default async function BackupPage() {
  await requireAdmin();

  return (
    <AdminComingSoon
      title="Backup"
      description="Export and restore controls will land here in a later phase."
      icon={DatabaseBackupIcon}
    />
  );
}
