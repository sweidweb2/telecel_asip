import { Suspense } from "react";
import type { Metadata } from "next";

import { loginLabelsFor } from "@/components/auth/auth-labels";
import { LoginForm } from "@/components/auth/login-form";
import { InstitutionalHeroField } from "@/components/marketing/institutional-hero-field";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
    <main className="relative isolate flex flex-1 items-center justify-center overflow-hidden bg-[#14333b] px-4 py-10 sm:px-6 sm:py-16">
      <InstitutionalHeroField patternId="login-field" composition="portal" />
      <Card className="relative z-10 w-full max-w-sm border-white/10 bg-card/95 shadow-xl backdrop-blur-sm">
        <CardHeader>
          <CardTitle>{labels.title}</CardTitle>
          <CardDescription>{labels.description}</CardDescription>
        </CardHeader>
        <CardContent>
          <Suspense fallback={<LoginFormFallback />}>
            <LoginForm locale={locale} labels={labels} />
          </Suspense>
        </CardContent>
      </Card>
    </main>
  );
}
