import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, ArrowUpRight } from "lucide-react";

import { StartupCard } from "@/components/marketing/startup-card";
import { buttonVariants } from "@/components/ui/button";
import type { Locale } from "@/constants/locales";
import { publicPath } from "@/constants/routes";
import { formatFoundedDate, startupInitials } from "@/lib/startup-display";
import type {
  StartupPublicDetail,
  StartupPublicListItem,
} from "@/types/startup";
import { cn } from "@/lib/utils";

type StartupDetailLabels = {
  backToPortfolio: string;
  portfolio: string;
  founded: string;
  moreStartups: string;
};

type StartupDetailPageContentProps = {
  locale: Locale;
  startup: StartupPublicDetail;
  related: StartupPublicListItem[];
  fromPage?: number;
};

const LABELS: Record<Locale, StartupDetailLabels> = {
  en: {
    backToPortfolio: "Back to portfolio",
    portfolio: "Portfolio",
    founded: "Founded",
    moreStartups: "More startups",
  },
  fr: {
    backToPortfolio: "Retour au portefeuille",
    portfolio: "Portefeuille",
    founded: "Fondée",
    moreStartups: "Autres startups",
  },
};

function portfolioBackHref(locale: Locale, fromPage?: number) {
  const base = publicPath(locale, "portfolio");
  if (fromPage !== undefined && fromPage > 1) {
    return `${base}?page=${fromPage}`;
  }
  return base;
}

export function StartupDetailPageContent({
  locale,
  startup,
  related,
  fromPage,
}: StartupDetailPageContentProps) {
  const labels = LABELS[locale];
  const foundedLabel = startup.founded_at
    ? formatFoundedDate(startup.founded_at, locale)
    : null;

  return (
    <main>
      <article className="pb-16 lg:pb-24">
        <div className="mx-auto w-full max-w-6xl px-4 pt-8 sm:px-6 sm:pt-10 lg:pt-12">
          <Link
            href={portfolioBackHref(locale, fromPage)}
            className={cn(
              buttonVariants({ variant: "ghost", size: "sm" }),
              "min-h-11 gap-2 px-0 hover:bg-transparent",
            )}
          >
            <ArrowLeft className="size-4" />
            {labels.backToPortfolio}
          </Link>
        </div>

        <div className="mx-auto mt-6 w-full max-w-6xl px-4 sm:mt-8 sm:px-6">
          <div className="relative aspect-[16/10] w-full overflow-hidden rounded-2xl bg-muted md:aspect-[2/1]">
            {startup.logo_url ? (
              <Image
                src={startup.logo_url}
                alt={startup.name}
                fill
                priority
                className="object-cover"
                sizes="(max-width: 1152px) 100vw, 1152px"
              />
            ) : (
              <div
                aria-hidden
                className="flex size-full items-center justify-center bg-gradient-to-br from-primary/15 via-muted to-primary/5"
              >
                <span className="font-heading text-4xl font-semibold tracking-tight text-primary/50 sm:text-5xl lg:text-6xl">
                  {startupInitials(startup.name)}
                </span>
              </div>
            )}
          </div>

          <header className="mt-8 max-w-3xl sm:mt-10">
            <p className="text-sm font-semibold text-primary">
              {labels.portfolio}
            </p>
            <h1 className="mt-3 font-heading text-3xl font-semibold tracking-tight text-balance sm:text-4xl lg:text-5xl">
              {startup.name}
            </h1>
            <p className="mt-4 text-base text-muted-foreground sm:mt-6 sm:text-lg">
              {startup.description}
            </p>
            {foundedLabel ? (
              <p className="mt-4 text-sm text-muted-foreground sm:mt-5">
                <span className="font-semibold text-foreground">
                  {labels.founded}:
                </span>{" "}
                {foundedLabel}
              </p>
            ) : null}
          </header>
        </div>

        {related.length > 0 ? (
          <section className="mx-auto mt-16 w-full max-w-6xl px-4 sm:mt-20 sm:px-6">
            <div className="flex items-end justify-between gap-4">
              <h2 className="font-heading text-2xl font-semibold tracking-tight sm:text-3xl">
                {labels.moreStartups}
              </h2>
              <Link
                href={publicPath(locale, "portfolio")}
                className={cn(
                  buttonVariants({ variant: "ghost", size: "sm" }),
                  "min-h-11 shrink-0 gap-1",
                )}
              >
                {labels.backToPortfolio}
                <ArrowUpRight className="size-4" />
              </Link>
            </div>
            <ul className="mt-8 grid grid-cols-1 gap-x-8 gap-y-12 md:grid-cols-2 lg:grid-cols-3">
              {related.map((item) => (
                <li key={item.id}>
                  <StartupCard locale={locale} startup={item} />
                </li>
              ))}
            </ul>
          </section>
        ) : null}
      </article>
    </main>
  );
}
