import { HttpStatusPage, httpStatusMetadata } from "@/components/layout/http-status-page";

export const metadata = httpStatusMetadata("503");

export default function UnavailablePage() {
  return <HttpStatusPage kind="503" />;
}
