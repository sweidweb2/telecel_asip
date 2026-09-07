import type { ReactNode } from "react";

import { DocumentShell } from "@/components/layout/document-shell";
import { LOCALES } from "@/constants/locales";
import { localeFromParams } from "@/lib/i18n/locale-params";
import { rootMetadata } from "@/lib/seo/root-metadata";

import "../globals.css";

export const metadata = rootMetadata;

export function generateStaticParams() {
  return LOCALES.map((locale) => ({ locale }));
}

type LocaleRootLayoutProps = {
  children: ReactNode;
  params: Promise<{ locale: string }>;
};

export default async function LocaleRootLayout({
  children,
  params,
}: LocaleRootLayoutProps) {
  const locale = await localeFromParams(params);
  return <DocumentShell lang={locale}>{children}</DocumentShell>;
}
