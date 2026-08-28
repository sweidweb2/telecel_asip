"use client";

import Link from "next/link";
import Image from "next/image";
import { format } from "date-fns";
import { ArrowUpRight } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { portfolioEditPath } from "@/constants/routes";
import type { StartupListItem } from "@/types/startup";

type StartupAdminCardProps = {
  startup: StartupListItem;
};

function statusVariant(status: StartupListItem["status"]) {
  if (status === "active") return "default" as const;
  if (status === "inactive") return "outline" as const;
  return "secondary" as const;
}

export function StartupAdminCard({ startup }: StartupAdminCardProps) {
  const href = portfolioEditPath(startup.id);
  const dateLabel = startup.founded_at
    ? format(new Date(startup.founded_at), "d MMM yyyy")
    : format(new Date(startup.created_at), "d MMM yyyy");

  return (
    <Link
      href={href}
      className="group flex flex-col gap-4 rounded-2xl outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
    >
      <div className="relative aspect-[1.5] w-full overflow-hidden rounded-2xl bg-muted">
        {startup.logo_url ? (
          <Image
            src={startup.logo_url}
            alt={startup.name}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-[1.02]"
            sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
        ) : null}
        <div className="absolute left-3 top-3 flex flex-wrap gap-2">
          <Badge variant={statusVariant(startup.status)}>{startup.status}</Badge>
        </div>
      </div>
      <div className="flex flex-col gap-2">
        <div className="flex gap-3">
          <h3 className="flex-1 font-heading text-lg font-semibold tracking-tight text-balance group-hover:underline group-hover:underline-offset-4">
            {startup.name}
          </h3>
          <ArrowUpRight className="mt-0.5 size-5 shrink-0" />
        </div>
        <p className="line-clamp-2 text-sm text-muted-foreground">
          {startup.description}
        </p>
        <p className="text-sm text-muted-foreground">
          {startup.slug} · {dateLabel}
        </p>
      </div>
    </Link>
  );
}
