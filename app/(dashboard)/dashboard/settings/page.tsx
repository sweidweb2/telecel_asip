import { requireAdmin } from "@/data/auth";

export default async function SettingsPage() {
  await requireAdmin();

  return <div className="flex flex-1" />;
}
