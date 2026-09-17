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
          path: "/apply",
          title: "Candidater - ASIP",
          description:
            "Préparez et présentez le profil de votre entreprise à ASIP.",
          noIndex: !openApplications,
        }
      : {
          locale,
          path: "/apply",
          title: "Apply - ASIP",
          description: "Prepare and share your ASIP venture profile.",
          // Index only when applications are formally open; closed redirects to Register Interest.
          noIndex: !openApplications,
        },
  );
}

export default async function Page({ params }: PageProps) {
  const locale = await localeFromParams(params);
  const [user, openApplications] = await Promise.all([
    getAuthUser(),
    getOpenApplications(),
  ]);
  const copy = marketingCopyFor(locale, "apply");

  return (
    <ApplyPageContent
      locale={locale}
      copy={copy}
      mode="apply"
      user={user}
      openApplications={openApplications}
    />
  );
}
