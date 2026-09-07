import { notFound } from "next/navigation";

import { isLocale, type Locale } from "@/constants/locales";

/**
 * Resolve and validate the `[locale]` segment from a page/layout `params` promise.
 */
export async function localeFromParams(
  params: Promise<{ locale: string }>,
): Promise<Locale> {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  return locale;
}
