import { requireAdmin } from "@/data/auth";

export default async function DashboardPage() {
  await requireAdmin();

  return <div className="flex flex-1" />;
}
