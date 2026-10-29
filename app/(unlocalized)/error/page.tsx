import { HttpStatusPage, httpStatusMetadata } from "@/components/layout/http-status-page";
import {
  httpErrorKindFromCode,
  httpErrorPathFor,
} from "@/constants/http-errors";
import { redirect } from "next/navigation";

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
    const params = new URLSearchParams();
    if (digest) params.set("digest", digest);
    const qs = params.toString();
    redirect(`${httpErrorPathFor(kind)}${qs ? `?${qs}` : ""}`);
  }

  return (
    <HttpStatusPage
      kind="generic"
      codeLabel={code?.trim() ? code.trim() : null}
      digest={digest ?? null}
    />
  );
}
