import { Suspense } from "react";
import type { Metadata } from "next";

import { loginLabelsFor } from "@/constants/auth-labels";
import { AuthShell } from "@/components/auth/auth-shell";
import { LoginForm } from "@/components/auth/login-form";
import { Skeleton } from "@/components/ui/skeleton";
import { localeFromParams } from "@/lib/i18n/locale-params";

function LoginFormFallback() {
  return (
    <div className="grid gap-4">
      <Skeleton className="h-8 w-full" />
      <Skeleton className="h-8 w-full" />
      <Skeleton className="h-9 w-full" />
    </div>
  );
}

type PageProps = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const locale = await localeFromParams(params);
  return { title: locale === "fr" ? "Connexion" : "Login" };
}

export default async function LoginPage({ params }: PageProps) {
  const locale = await localeFromParams(params);
  const labels = loginLabelsFor(locale);

  return (
    <AuthShell title={labels.title} description={labels.description}>
      <Suspense fallback={<LoginFormFallback />}>
        <LoginForm locale={locale} labels={labels} />
      </Suspense>
    </AuthShell>
  );
}
