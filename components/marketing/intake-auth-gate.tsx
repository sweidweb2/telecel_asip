import Link from "next/link";

import type { ApplyAuthGateLabels } from "@/components/marketing/apply-labels";
import { Button } from "@/components/ui/button";
import type { Locale } from "@/constants/locales";
import { authPath, publicPath } from "@/constants/routes";

type IntakeAuthGateProps = {
  locale: Locale;
  mode: "register" | "apply";
  labels: ApplyAuthGateLabels;
};

export function IntakeAuthGate({ locale, mode, labels }: IntakeAuthGateProps) {
  const returnPath = publicPath(
    locale,
    mode === "apply" ? "apply" : "register-interest",
  );
  const next = encodeURIComponent(returnPath);
  const loginHref = `${authPath(locale, "login")}?next=${next}`;
  const signupHref = `${authPath(locale, "signup")}?next=${next}`;

  return (
    <div className="grid gap-4 rounded-xl border border-dashed p-6 sm:p-8">
      <div className="grid gap-2">
        <h2 className="font-heading text-lg font-semibold tracking-tight">
          {labels.title}
        </h2>
        <p className="text-sm leading-6 text-muted-foreground">
          {labels.description}
        </p>
      </div>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <Button
          nativeButton={false}
          render={<Link href={loginHref} />}
          className="min-h-11 w-full sm:w-auto"
        >
          {labels.signInLabel}
        </Button>
        <Button
          variant="outline"
          nativeButton={false}
          render={<Link href={signupHref} />}
          className="min-h-11 w-full sm:w-auto"
        >
          {labels.signUpLabel}
        </Button>
      </div>
    </div>
  );
}
