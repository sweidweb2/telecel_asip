"use client";

import { useTransition } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2Icon } from "lucide-react";
import { toast } from "sonner";

import { updateEditorSiteSettings } from "@/actions/settings";
import {
  ADMIN_EDITOR_ACTIONS_SAFE_AREA,
  AdminEditorActionsBar,
} from "@/components/dashboard/admin-editor-actions-bar";
import { AdminFormSection } from "@/components/dashboard/admin-form-section";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { SITE_SETTINGS_HELP } from "@/constants/site-settings-help";
import { isAdminFormSubmitDisabled } from "@/lib/admin/form-submit";
import {
  updateEditorSiteSettingsSchema,
  type UpdateEditorSiteSettingsInput,
} from "@/validations/settings";

type SiteSettingsFormProps = {
  openApplications: boolean;
  newsletterSignupEnabled: boolean;
};

export function SiteSettingsForm({
  openApplications,
  newsletterSignupEnabled,
}: SiteSettingsFormProps) {
  const [isPending, startTransition] = useTransition();

  const {
    handleSubmit,
    reset,
    setValue,
    control,
    formState: { errors, isDirty },
  } = useForm<UpdateEditorSiteSettingsInput>({
    resolver: zodResolver(updateEditorSiteSettingsSchema),
    mode: "onChange",
    defaultValues: {
      openApplications,
      newsletterSignupEnabled,
    },
  });

  const isOpen = useWatch({ control, name: "openApplications" });

  function onSubmit(values: UpdateEditorSiteSettingsInput) {
    startTransition(async () => {
      const result = await updateEditorSiteSettings(values);

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
        title="Applications open"
        help={SITE_SETTINGS_HELP.applications}
      >
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <p className="max-w-prose text-sm text-muted-foreground">
            When on, the public navbar promotes Apply, Apply accepts
            submissions, and Register Interest redirects to Apply. When off,
            Register Interest is the live intake, Apply redirects there, and
            the open banner is hidden.
          </p>
          <div className="flex min-h-11 items-center gap-3">
            <Switch
              id="open-applications"
              checked={isOpen}
              disabled={isPending}
              onCheckedChange={(checked) =>
                setValue("openApplications", checked, { shouldDirty: true })
              }
            />
            <Label htmlFor="open-applications" className="text-sm font-medium">
              {isOpen ? "Open" : "Closed"}
            </Label>
          </div>
        </div>
      </AdminFormSection>

      <p className="text-sm text-muted-foreground">
        Automated backup schedule is managed by administrators on the Backup
        page.
      </p>

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
          {isPending ? "Saving…" : "Save changes"}
        </Button>
      </AdminEditorActionsBar>
    </form>
  );
}
