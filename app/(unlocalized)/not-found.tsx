import { HttpStatusPage, httpStatusMetadata } from "@/components/layout/http-status-page";

export const metadata = httpStatusMetadata("404");

export default function NotFound() {
  return <HttpStatusPage kind="404" />;
}
