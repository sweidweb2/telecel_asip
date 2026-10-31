import { redirect } from "next/navigation";

import { HttpStatusPage, httpStatusMetadata } from "@/components/layout/http-status-page";
import {
  httpErrorHref,
  httpErrorKindFromCode,
} from "@/constants/http-errors";

export const metadata = httpStatusMetadata("generic");

type PageProps = {
  searchParams: Promise<{ code?: string; digest?: string }>;
};

/**
 * Catch-all themed error page for statuses without a dedicated route.
 * Known codes (`403` / `404` / `500` / `503`) redirect to their own URLs.
 */
export default async function GenericErrorPage({ searchParams }: PageProps) {
  const { code, digest } = await searchParams;
  const kind = httpErrorKindFromCode(code);

  if (kind !== "generic") {
    redirect(httpErrorHref(kind, { digest }));
  }

  return (
    <HttpStatusPage
      kind="generic"
      codeLabel={code?.trim() ? code.trim() : null}
      digest={digest ?? null}
    />
  );
}
