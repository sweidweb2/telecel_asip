import type { Metadata } from "next";

import { ApplyPageContent } from "@/components/marketing/apply-page-content";
import { marketingCopyFor } from "@/constants/marketing-copy";
import { getOpenApplications } from "@/data/settings";
import { getAuthUser } from "@/lib/admin/get-auth-user";
import { localeFromParams } from "@/lib/i18n/locale-params";
import { buildMarketingMetadata } from "@/lib/seo/marketing-metadata";

type PageProps = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const locale = await localeFromParams(params);
  const openApplications = await getOpenApplications();
  return buildMarketingMetadata(
    locale === "fr"
      ? {
          locale,
          path: "/register-interest",
          title: "Manifester votre intérêt | ASIP",
          description:
            "Inscrivez-vous pour recevoir les dates de candidature confirmées d’ASIP, les critères d’éligibilité et les mises à jour du programme dès leur annonce.",
          // Index only while applications are closed; redirects to Apply when open.
          noIndex: openApplications,
        }
      : {
          locale,
          path: "/register-interest",
          title: "Register Interest | ASIP",
          description:
            "Register to receive confirmed ASIP application dates, eligibility criteria and program updates when announced.",
          noIndex: openApplications,
        },
  );
}

export default async function Page({ params }: PageProps) {
  const locale = await localeFromParams(params);
  const [user, openApplications] = await Promise.all([
    getAuthUser(),
    getOpenApplications(),
  ]);
  const copy = marketingCopyFor(locale, "register-interest");

  return (
    <ApplyPageContent
      locale={locale}
      copy={copy}
      mode="register"
      user={user}
      openApplications={openApplications}
    />
  );
}
