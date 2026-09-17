import { StaffPageSkeleton } from "@/components/dashboard/page-skeleton";

/**
 * Content-only fallback while page data resolves.
 * The layout already mounts the real sidebar/header — do not paint a fake shell.
 */
export default function AdminSegmentLoading() {
  return <StaffPageSkeleton />;
}
