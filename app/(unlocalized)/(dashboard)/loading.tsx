import { StaffPageSkeleton } from "@/components/dashboard/page-skeleton";

/**
 * Content-only fallback while page data resolves.
 * The layout already mounts the real sidebar/header — do not paint a fake shell
 * here (that double-chrome flash is Prompt 15 / UI audit #47).
 */
export default function DashboardSegmentLoading() {
  return <StaffPageSkeleton />;
}
