import type { Metadata } from "next";
import { BarChart3Icon } from "lucide-react";

import { AdminComingSoon } from "@/components/dashboard/admin-coming-soon";
import { requireAdmin } from "@/data/auth";

export const metadata: Metadata = {
  title: "Analytics | ASIP Admin",
};

export default async function AnalyticsPage() {
  await requireAdmin();

  return (
    <AdminComingSoon
      title="Analytics"
      description="Programme and site metrics will land here in a later phase."
      icon={BarChart3Icon}
    />
  );
}
