import { HttpStatusPage, httpStatusMetadata } from "@/components/layout/http-status-page";

export const metadata = httpStatusMetadata("403");

export default function ForbiddenPage() {
  return <HttpStatusPage kind="403" />;
}
