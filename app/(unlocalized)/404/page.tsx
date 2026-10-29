import { HttpStatusPage, httpStatusMetadata } from "@/components/layout/http-status-page";

export const metadata = httpStatusMetadata("404");

/** Explicit `/404` route — mirrors `not-found` UI for direct navigation. */
export default function NotFoundStatusPage() {
  return <HttpStatusPage kind="404" />;
}
