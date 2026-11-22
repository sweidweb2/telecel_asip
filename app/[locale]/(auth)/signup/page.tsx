import { Suspense } from "react";
import type { Metadata } from "next";

import { signupLabelsFor } from "@/constants/auth-labels";
import { AuthShell } from "@/components/auth/auth-shell";
import { SignupForm } from "@/components/auth/signup-form";
import { Skeleton } from "@/components/ui/skeleton";
import { localeFromParams } from "@/lib/i18n/locale-params";

function SignupFormFallback() {
  return (
    <div className="grid gap-4">
      <Skeleton className="h-8 w-full" />
      <Skeleton className="h-8 w-full" />
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
  return { title: locale === "fr" ? "Inscription" : "Sign up" };
}

export default async function SignupPage({ params }: PageProps) {
  const locale = await localeFromParams(params);
  const labels = signupLabelsFor(locale);

  return (
    <AuthShell title={labels.title} description={labels.description}>
      <Suspense fallback={<SignupFormFallback />}>
        <SignupForm locale={locale} labels={labels} />
      </Suspense>
    </AuthShell>
  );
}
