import { requireAdmin } from "@/data/auth";

export default async function AnalyticsPage() {
  await requireAdmin();

  return <div className="flex flex-1" />;
}
