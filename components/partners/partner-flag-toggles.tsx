"use client";

import { useState, useTransition } from "react";
import { useRouter } from "nextjs-toploader/app";
import { toast } from "sonner";

import {
  updatePartnerActive,
  updatePartnerLogoPermission,
} from "@/actions/partners";
import { Switch } from "@/components/ui/switch";

function PartnerFlagToggle({
  checked,
  onCheckedChange,
  isPending,
  onLabel,
  offLabel,
  ariaLabelOn,
  ariaLabelOff,
}: {
  checked: boolean;
  onCheckedChange: (next: boolean) => void;
  isPending: boolean;
  onLabel: string;
  offLabel: string;
  ariaLabelOn: string;
  ariaLabelOff: string;
}) {
  return (
    <div
      className="flex items-center gap-2"
      onClick={(event) => event.stopPropagation()}
    >
      <Switch
        size="sm"
        checked={checked}
        disabled={isPending}
        onCheckedChange={onCheckedChange}
        aria-label={checked ? ariaLabelOn : ariaLabelOff}
      />
      <span className="text-sm text-muted-foreground">
        {checked ? onLabel : offLabel}
      </span>
    </div>
  );
}

export function PartnerActiveToggle({
  partnerId,
  isActive,
}: {
  partnerId: string;
  isActive: boolean;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [checked, setChecked] = useState(isActive);
  const [prevActive, setPrevActive] = useState(isActive);

  if (isActive !== prevActive) {
    setPrevActive(isActive);
    setChecked(isActive);
  }

  function onCheckedChange(nextChecked: boolean) {
    if (isPending || nextChecked === checked) return;

    const previous = checked;
    setChecked(nextChecked);

    startTransition(async () => {
      try {
        const result = await updatePartnerActive({
          id: partnerId,
          isActive: nextChecked,
        });
        if (result.status === "error") {
          setChecked(previous);
          toast.error(result.message);
          return;
        }
        toast.success(result.message);
        router.refresh();
      } catch {
        setChecked(previous);
        toast.error("Could not update partner status. Please try again.");
      }
    });
  }

  return (
    <PartnerFlagToggle
      checked={checked}
      onCheckedChange={onCheckedChange}
      isPending={isPending}
      onLabel="Active"
      offLabel="Historical"
      ariaLabelOn="Mark partner as historical"
      ariaLabelOff="Mark partner as active"
    />
  );
}

export function PartnerLogoPermissionToggle({
  partnerId,
  logoPermission,
}: {
  partnerId: string;
  logoPermission: boolean;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [checked, setChecked] = useState(logoPermission);
  const [prevPermission, setPrevPermission] = useState(logoPermission);

  if (logoPermission !== prevPermission) {
    setPrevPermission(logoPermission);
    setChecked(logoPermission);
  }

  function onCheckedChange(nextChecked: boolean) {
    if (isPending || nextChecked === checked) return;

    const previous = checked;
    setChecked(nextChecked);

    startTransition(async () => {
      try {
        const result = await updatePartnerLogoPermission({
          id: partnerId,
          logoPermission: nextChecked,
        });
        if (result.status === "error") {
          setChecked(previous);
          toast.error(result.message);
          return;
        }
        toast.success(result.message);
        router.refresh();
      } catch {
        setChecked(previous);
        toast.error("Could not update logo permission. Please try again.");
      }
    });
  }

  return (
    <PartnerFlagToggle
      checked={checked}
      onCheckedChange={onCheckedChange}
      isPending={isPending}
      onLabel="Granted"
      offLabel="Not granted"
      ariaLabelOn="Revoke logo permission"
      ariaLabelOff="Grant logo permission"
    />
  );
}
