import { HttpStatusPage, httpStatusMetadata } from "@/components/layout/http-status-page";
import { getRequestLocale } from "@/lib/i18n/request-locale";

export async function generateMetadata() {
  const locale = await getRequestLocale();
  return httpStatusMetadata("404", locale);
}

export default async function NotFound() {
  const locale = await getRequestLocale();
  return <HttpStatusPage kind="404" locale={locale} />;
}
