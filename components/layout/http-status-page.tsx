import type { Metadata } from "next";

import { footerLabelsFor } from "@/components/layout/site-footer-labels";
import { SiteFooter } from "@/components/layout/site-footer";
import { HttpStatusActions } from "@/components/layout/http-status-actions";
import { navLabelsFor } from "@/components/layout/site-nav-labels";
import { ErrorScreen } from "@/components/layout/error-screen";
import { SiteNavbar } from "@/components/layout/site-navbar";
import type { Locale } from "@/constants/locales";
import {
  httpErrorCopyFor,
  type HttpErrorKind,
} from "@/constants/http-errors";

type HttpStatusPageProps = {
  kind: HttpErrorKind;
  locale?: Locale;
  /** Optional override when kind is generic (e.g. 502). */
  codeLabel?: string | null;
  digest?: string | null;
  /** Skip marketing chrome (global-error / bare shell). */
  bare?: boolean;
  homeAsAnchor?: boolean;
};

export function httpStatusMetadata(
  kind: HttpErrorKind,
  locale: Locale = "en",
): Metadata {
  const copy = httpErrorCopyFor(kind, locale);
  return {
    title: copy.documentTitle,
    robots: { index: false, follow: false },
  };
}

/**
 * Themed HTTP status page — same ErrorScreen language as not-found / route errors.
 */
export function HttpStatusPage({
  kind,
  locale = "en",
  codeLabel,
  digest,
  bare = false,
  homeAsAnchor = false,
}: HttpStatusPageProps) {
  const copy = httpErrorCopyFor(kind, locale);
  const code = kind === "generic" && codeLabel ? codeLabel : copy.code;

  const body = (
    <ErrorScreen
      icon={copy.icon}
      code={code}
      title={copy.title}
      description={copy.description}
      tone={copy.tone}
    >
      <HttpStatusActions
        locale={locale}
        tryAgainLabel={copy.tryAgain}
        goHomeLabel={copy.goHome}
        homeAsAnchor={homeAsAnchor}
        digest={digest}
      />
    </ErrorScreen>
  );

  if (bare) {
    return <div className="flex flex-1 flex-col">{body}</div>;
  }

  return (
    <>
      <SiteNavbar locale={locale} labels={navLabelsFor(locale)} />
      <div className="flex flex-1 flex-col">{body}</div>
      <SiteFooter labels={footerLabelsFor(locale)} />
    </>
  );
}
