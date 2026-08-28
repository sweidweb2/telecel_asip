import { requireAdmin } from "@/data/auth";

export default async function BackupPage() {
  await requireAdmin();

  return <div className="flex flex-1" />;
}
