import type { Metadata } from "next";

import { signupLabelsFor } from "@/components/auth/auth-labels";
import { SignupForm } from "@/components/auth/signup-form";
import { InstitutionalHeroField } from "@/components/marketing/institutional-hero-field";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { localeFromParams } from "@/lib/i18n/locale-params";

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
    <main className="relative isolate flex flex-1 items-center justify-center overflow-hidden bg-[#14333b] px-4 py-10 sm:px-6 sm:py-16">
      <InstitutionalHeroField patternId="signup-field" composition="gateway" />
      <Card className="relative z-10 w-full max-w-sm border-white/10 bg-card/95 shadow-xl backdrop-blur-sm">
        <CardHeader>
          <CardTitle>{labels.title}</CardTitle>
          <CardDescription>{labels.description}</CardDescription>
        </CardHeader>
        <CardContent>
          <SignupForm locale={locale} labels={labels} />
        </CardContent>
      </Card>
    </main>
  );
}
