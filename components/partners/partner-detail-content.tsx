import Image from "next/image";
import {
  ArrowUpDownIcon,
  CalendarIcon,
  CheckCircle2Icon,
  ExternalLinkIcon,
  LinkIcon,
  PencilIcon,
  ShieldAlertIcon,
  ShieldCheckIcon,
} from "lucide-react";

import { ADMIN_ICON_BUTTON_CLASS } from "@/components/dashboard/admin-icon-button";
import { PartnerFormDialog } from "@/components/partners/partner-form-dialog";
import { PartnerLogoManager } from "@/components/partners/partner-logo-manager";
import { PartnerRowActions } from "@/components/partners/partner-row-actions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { formatAdminDateTime } from "@/lib/admin-format";
import { PARTNER_TYPE_LABELS } from "@/constants/partner-types";
import { startupInitials } from "@/lib/startup-display";
import type { PartnerListItem } from "@/types/partner";

function Stat({
  icon: Icon,
  label,
  children,
}: {
  icon: typeof LinkIcon;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-w-0 items-start gap-3">
      <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground">
        <Icon className="size-4" />
      </span>
      <div className="min-w-0">
        <dt className="text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">
          {label}
        </dt>
        <dd className="mt-1 text-sm break-words">{children}</dd>
      </div>
    </div>
  );
}

export function PartnerDetailContent({ partner }: { partner: PartnerListItem }) {
  const PermissionIcon = partner.logo_permission
    ? ShieldCheckIcon
    : ShieldAlertIcon;

  return (
    <div className="grid min-w-0 gap-6 lg:grid-cols-3">
      <div className="flex min-w-0 flex-col gap-6 lg:col-span-2">
        <Card>
          <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex min-w-0 items-center gap-4">
              <span className="flex size-14 shrink-0 items-center justify-center overflow-hidden rounded-xl border bg-muted/30">
                {partner.logo_url ? (
                  <Image
                    src={partner.logo_url}
                    alt={`${partner.name} logo`}
                    width={56}
                    height={56}
                    sizes="56px"
                    className="size-full object-contain p-1.5"
                  />
                ) : (
                  <span className="font-heading text-sm font-semibold">
                    {startupInitials(partner.name)}
                  </span>
                )}
              </span>
              <div className="min-w-0">
                <CardTitle className="line-clamp-2 font-heading text-2xl tracking-tight break-words">
                  {partner.name}
                </CardTitle>
                <p className="mt-1 line-clamp-2 text-sm break-words text-muted-foreground">
                  {partner.org || "No organisation recorded"}
                </p>
              </div>
            </div>

            <div className="flex shrink-0 items-center gap-2 sm:mt-1">
              <PartnerRowActions
                partner={partner}
                redirectOnDelete
                editSlot={
                  <PartnerFormDialog
                    mode="edit"
                    partner={partner}
                    triggerRender={
                      <Button
                        variant="ghost"
                        size="icon"
                        className={ADMIN_ICON_BUTTON_CLASS}
                        aria-label={`Edit ${partner.name}`}
                      />
                    }
                    triggerContent={<PencilIcon />}
                  />
                }
              />
            </div>
          </CardHeader>

          <CardContent className="flex flex-col gap-6">
            <div className="flex min-w-0 flex-wrap items-center gap-2">
              <Badge variant="secondary" className="max-w-full">
                <span className="truncate">
                  {PARTNER_TYPE_LABELS[partner.type]}
                </span>
              </Badge>
              <Badge variant={partner.is_active ? "default" : "outline"}>
                <CheckCircle2Icon />
                {partner.is_active ? "Active" : "Historical"}
              </Badge>
              <Badge
                variant={partner.logo_permission ? "default" : "destructive"}
                className="max-w-full"
              >
                <PermissionIcon />
                <span className="truncate">
                  {partner.logo_permission
                    ? "Logo permission granted"
                    : "Logo permission not granted"}
                </span>
              </Badge>
            </div>

            <Separator />

            <dl className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <Stat icon={LinkIcon} label="Link">
                {partner.link ? (
                  <a
                    href={partner.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    title={partner.link}
                    className="flex min-w-0 max-w-full items-center gap-1 text-primary hover:underline"
                  >
                    <span className="truncate">{partner.link}</span>
                    <ExternalLinkIcon className="size-3.5 shrink-0" />
                  </a>
                ) : (
                  <span className="text-muted-foreground">Not set</span>
                )}
              </Stat>

              <Stat icon={ArrowUpDownIcon} label="Display order">
                {partner.sort_order}
                <span className="ml-1 text-muted-foreground">
                  (lowest shows first)
                </span>
              </Stat>

              <Stat icon={CalendarIcon} label="Created">
                {formatAdminDateTime(partner.created_at)}
              </Stat>

              <Stat icon={CalendarIcon} label="Last updated">
                {formatAdminDateTime(partner.updated_at)}
              </Stat>
            </dl>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Role / contribution</CardTitle>
          </CardHeader>
          <CardContent>
            {partner.contribution ? (
              <p className="text-sm leading-7 break-words whitespace-pre-line">
                {partner.contribution}
              </p>
            ) : (
              <p className="text-sm text-muted-foreground">
                No contribution recorded yet. Describe what this partner
                actually does with founders.
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="flex min-w-0 flex-col gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Logo</CardTitle>
          </CardHeader>
          <CardContent>
            <PartnerLogoManager partner={partner} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Record</CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="grid gap-1 text-xs">
              <dt className="font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                Partner ID
              </dt>
              <dd className="break-all font-mono">{partner.id}</dd>
            </dl>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
