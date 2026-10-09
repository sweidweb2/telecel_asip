"use client";

import { useMemo, useTransition } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2Icon } from "lucide-react";
import { toast } from "sonner";

import { updateAdminSiteSettings } from "@/actions/settings";
import {
  ADMIN_EDITOR_ACTIONS_SAFE_AREA,
  AdminEditorActionsBar,
} from "@/components/dashboard/admin-editor-actions-bar";
import { AdminFormSection } from "@/components/dashboard/admin-form-section";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  backupScheduleLabel,
  backupScheduleSelectOptions,
  type BackupScheduleValue,
} from "@/constants/backup-schedule";
import { SITE_SETTINGS_HELP } from "@/constants/site-settings-help";
import { isAdminFormSubmitDisabled } from "@/lib/admin/form-submit";
import {
  updateAdminSiteSettingsSchema,
  type UpdateAdminSiteSettingsInput,
} from "@/validations/settings";

type AdminBackupSettingsFormProps = {
  openApplications: boolean;
  newsletterSignupEnabled: boolean;
  backupTime: BackupScheduleValue;
};

export function AdminBackupSettingsForm({
  openApplications,
  newsletterSignupEnabled,
  backupTime,
}: AdminBackupSettingsFormProps) {
  const [isPending, startTransition] = useTransition();

  const scheduleOptions = useMemo(
    () => backupScheduleSelectOptions(backupTime),
    [backupTime],
  );

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm<UpdateAdminSiteSettingsInput>({
    resolver: zodResolver(updateAdminSiteSettingsSchema),
    mode: "onChange",
    defaultValues: {
      openApplications,
      newsletterSignupEnabled,
      backupTime,
    },
  });

  const selectedBackupTime = useWatch({ control, name: "backupTime" });

  function onSubmit(values: UpdateAdminSiteSettingsInput) {
    startTransition(async () => {
      const result = await updateAdminSiteSettings(values);

      if (result.status === "error") {
        toast.error(result.message);
        return;
      }

      toast.success(result.message);
      reset(values);
    });
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className={`flex flex-col gap-6 ${ADMIN_EDITOR_ACTIONS_SAFE_AREA}`}
    >
      <AdminFormSection
        title="Backup schedule"
        help={SITE_SETTINGS_HELP.backup}
      >
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <p className="max-w-prose text-sm text-muted-foreground">
            Times use Lebanon (Asia/Beirut). Choose Off or a weekly
            Sunday/Monday 03:00 window. The hourly job follows this cadence.
            Run a one-shot from Create backup above.
          </p>
          <div className="grid w-full gap-3 sm:max-w-xs">
            <Label htmlFor="backup-time" className="sr-only">
              Backup schedule
            </Label>
              <Controller
                control={control}
                name="backupTime"
                render={({ field }) => (
                  <Select
                    value={field.value}
                    items={scheduleOptions.map((option) => ({
                      value: option.value,
                      label: option.label,
                    }))}
                    onValueChange={(value) => {
                      if (value) {
                        field.onChange(value as BackupScheduleValue);
                      }
                    }}
                    disabled={isPending}
                  >
                    <SelectTrigger
                      id="backup-time"
                      className="min-h-11 w-full"
                    >
                      <SelectValue placeholder="Select schedule" />
                    </SelectTrigger>
                    <SelectContent>
                      {scheduleOptions.map((option) => (
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
              <p className="text-xs text-muted-foreground">
                Current selection:{" "}
                {selectedBackupTime
                  ? backupScheduleLabel(selectedBackupTime)
                  : "-"}
              </p>
            </div>
          </div>
      </AdminFormSection>

      <AdminEditorActionsBar>
        <span className="hidden sm:block" />
        <Button
          type="submit"
          disabled={isAdminFormSubmitDisabled({
            isPending,
            isDirty,
            errors,
          })}
          className="min-h-11 w-full sm:ml-auto sm:w-auto"
        >
          {isPending ? <Loader2Icon className="animate-spin" /> : null}
          {isPending ? "Saving…" : "Save settings"}
        </Button>
      </AdminEditorActionsBar>
    </form>
  );
}
