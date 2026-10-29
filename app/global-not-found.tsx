import type { Metadata } from "next";

import { DocumentShell } from "@/components/layout/document-shell";
import {
  HttpStatusPage,
  httpStatusMetadata,
} from "@/components/layout/http-status-page";
import { DEFAULT_LOCALE } from "@/constants/locales";

import "./globals.css";

export const metadata: Metadata = httpStatusMetadata("404");

/**
 * App-wide 404 for unmatched URLs.
 * Required with dual root layouts — segment `not-found.tsx` files alone are not enough.
 * @see https://nextjs.org/docs/app/api-reference/file-conventions/not-found#global-not-foundjs-experimental
 */
export default function GlobalNotFound() {
  return (
    <DocumentShell lang={DEFAULT_LOCALE}>
      <HttpStatusPage kind="404" />
    </DocumentShell>
  );
}
