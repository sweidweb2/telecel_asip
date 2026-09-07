import type { ReactNode } from "react";

import { DocumentShell } from "@/components/layout/document-shell";
import { DEFAULT_LOCALE } from "@/constants/locales";
import { rootMetadata } from "@/lib/seo/root-metadata";

import "../globals.css";

export const metadata = rootMetadata;

export default function UnlocalizedRootLayout({
  children,
}: {
  children: ReactNode;
}) {
  return <DocumentShell lang={DEFAULT_LOCALE}>{children}</DocumentShell>;
}
