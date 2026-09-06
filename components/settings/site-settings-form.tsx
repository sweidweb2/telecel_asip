"use client";

import { useTransition } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2Icon } from "lucide-react";
import { toast } from "sonner";

import { runBackupNow, updateSiteSettings } from "@/actions/settings";
import {
  ADMIN_EDITOR_ACTIONS_SAFE_AREA,
  AdminEditorActionsBar,
} from "@/components/dashboard/admin-editor-actions-bar";
import { AdminFormSectionHelp } from "@/components/dashboard/admin-form-section-help";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { SITE_SETTINGS_HELP } from "@/constants/site-settings-help";
import { isAdminFormSubmitDisabled } from "@/lib/admin/form-submit";
import {
  BACKUP_SCHEDULE_OPTIONS,
  type BackupScheduleValue,
} from "@/lib/backups/schedule";
import {
  updateSiteSettingsSchema,
  type UpdateSiteSettingsInput,
} from "@/validations/settings";

type SiteSettingsFormProps = {
  openApplications: boolean;
  newsletterSignupEnabled: boolean;
  backupTime: BackupScheduleValue;
};

export function SiteSettingsForm({
  openApplications,
  newsletterSignupEnabled,
  backupTime,
}: SiteSettingsFormProps) {
  const [isPending, startTransition] = useTransition();
  const [isBackupPending, startBackupTransition] = useTransition();

  const {
    control,
    handleSubmit,
    reset,
    setValue,
    formState: { errors, isDirty },
  } = useForm<UpdateSiteSettingsInput>({
    resolver: zodResolver(updateSiteSettingsSchema),
    mode: "onChange",
    defaultValues: {
      openApplications,
      newsletterSignupEnabled,
      backupTime,
    },
  });

  const isOpen = useWatch({ control, name: "openApplications" });
  const isNewsletterOn = useWatch({
    control,
    name: "newsletterSignupEnabled",
  });
  const selectedBackupTime = useWatch({ control, name: "backupTime" });

  function onSubmit(values: UpdateSiteSettingsInput) {
    startTransition(async () => {
      const result = await updateSiteSettings(values);

      if (result.status === "error") {
        toast.error(result.message);
        return;
      }

      toast.success(result.message);
      reset(values);
    });
  }

  function onRunBackupNow() {
    startBackupTransition(async () => {
      const result = await runBackupNow();
      if (result.status === "error") {
        toast.error(result.message);
        return;
      }
      toast.success(result.message);
    });
  }

  return (
    <Card>
      <CardContent className="p-4 sm:p-6">
        <form
          onSubmit={handleSubmit(onSubmit)}
          className={`flex flex-col gap-6 ${ADMIN_EDITOR_ACTIONS_SAFE_AREA}`}
        >
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0">
              <div className="flex items-start justify-between gap-2">
                <Label htmlFor="open-applications" className="text-base">
                  Applications open
                </Label>
                <AdminFormSectionHelp help={SITE_SETTINGS_HELP.applications} />
              </div>
              <p className="mt-1 max-w-prose text-sm text-muted-foreground">
                When on, the public navbar promotes Apply and a status banner
                appears under the nav. When off, the navbar promotes Register
                Interest and the banner is hidden. Both pages stay live;
                submissions still go to separate Leads and Applications tables.
              </p>
            </div>
            <div className="flex min-h-11 items-center gap-3">
              <Switch
                id="open-applications"
                checked={isOpen}
                disabled={isPending}
                onCheckedChange={(checked) =>
                  setValue("openApplications", checked, { shouldDirty: true })
                }
              />
              <span className="text-sm font-medium">
                {isOpen ? "Open" : "Closed"}
              </span>
            </div>
          </div>

          <div className="flex flex-col gap-4 border-t pt-6 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0">
              <div className="flex items-start justify-between gap-2">
                <Label htmlFor="newsletter-signup" className="text-base">
                  Newsletter signup
                </Label>
                <AdminFormSectionHelp help={SITE_SETTINGS_HELP.newsletter} />
              </div>
              <p className="mt-1 max-w-prose text-sm text-muted-foreground">
                When off, the Insights updates form stays inactive and rejects
                submissions. Turn on only after privacy, routing, and owner are
                confirmed.
              </p>
            </div>
            <div className="flex min-h-11 items-center gap-3">
              <Switch
                id="newsletter-signup"
                checked={isNewsletterOn}
                disabled={isPending}
                onCheckedChange={(checked) =>
                  setValue("newsletterSignupEnabled", checked, {
                    shouldDirty: true,
                  })
                }
              />
              <span className="text-sm font-medium">
                {isNewsletterOn ? "Enabled" : "Disabled"}
              </span>
            </div>
          </div>

          <div className="grid gap-4 border-t pt-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div className="min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <Label htmlFor="backup-time" className="text-base">
                    Automated backup schedule
                  </Label>
                  <AdminFormSectionHelp help={SITE_SETTINGS_HELP.backup} />
                </div>
                <p className="mt-1 max-w-prose text-sm text-muted-foreground">
                  Times use Lebanon (Asia/Beirut). Saving only updates the
                  schedule; the hourly job follows the new cadence. Use Run
                  backup now for a one-shot. Off disables scheduled runs.
                </p>
              </div>
              <div className="grid w-full gap-3 sm:max-w-xs">
                <Controller
                  control={control}
                  name="backupTime"
                  render={({ field }) => (
                    <Select
                      value={field.value}
                      items={BACKUP_SCHEDULE_OPTIONS.map((option) => ({
                        value: option.value,
                        label: option.label,
                      }))}
                      onValueChange={(value) => {
                        if (value) {
                          field.onChange(value as BackupScheduleValue);
                        }
                      }}
                      disabled={isPending || isBackupPending}
                    >
                      <SelectTrigger
                        id="backup-time"
                        className="min-h-11 w-full"
                      >
                        <SelectValue placeholder="Select schedule" />
                      </SelectTrigger>
                      <SelectContent>
                        {BACKUP_SCHEDULE_OPTIONS.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.backupTime ? (
                  <p className="text-sm text-destructive">
                    {errors.backupTime.message}
                  </p>
                ) : null}
                <Button
                  type="button"
                  variant="outline"
                  className="min-h-11 w-full"
                  disabled={isPending || isBackupPending}
                  onClick={onRunBackupNow}
                >
                  {isBackupPending ? (
                    <Loader2Icon className="animate-spin" />
                  ) : null}
                  {isBackupPending ? "Backing up…" : "Run backup now"}
                </Button>
                <p className="text-xs text-muted-foreground">
                  Current selection:{" "}
                  {BACKUP_SCHEDULE_OPTIONS.find(
                    (o) => o.value === selectedBackupTime,
                  )?.label ?? selectedBackupTime}
                </p>
              </div>
            </div>
          </div>

          <AdminEditorActionsBar>
            <span className="hidden sm:block" />
            <Button
              type="submit"
              disabled={
                isBackupPending ||
                isAdminFormSubmitDisabled({ isPending, isDirty, errors })
              }
              className="min-h-11 w-full sm:ml-auto sm:w-auto"
            >
              {isPending ? <Loader2Icon className="animate-spin" /> : null}
              {isPending ? "Saving…" : "Save changes"}
            </Button>
          </AdminEditorActionsBar>
        </form>
      </CardContent>
    </Card>
  );
}
