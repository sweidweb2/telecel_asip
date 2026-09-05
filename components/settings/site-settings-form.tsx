"use client";

import { useTransition } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2Icon } from "lucide-react";
import { toast } from "sonner";

import { updateSiteSettings } from "@/actions/settings";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  updateSiteSettingsSchema,
  type UpdateSiteSettingsInput,
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
    control,
    handleSubmit,
    reset,
    setValue,
    formState: { isDirty },
  } = useForm<UpdateSiteSettingsInput>({
    resolver: zodResolver(updateSiteSettingsSchema),
    defaultValues: { openApplications, newsletterSignupEnabled },
  });

  const isOpen = useWatch({ control, name: "openApplications" });
  const isNewsletterOn = useWatch({
    control,
    name: "newsletterSignupEnabled",
  });

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

  return (
    <Card>
      <CardContent className="p-4 sm:p-6">
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="flex flex-col gap-6"
        >
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0">
              <Label htmlFor="open-applications" className="text-base">
                Applications open
              </Label>
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
              <Label htmlFor="newsletter-signup" className="text-base">
                Newsletter signup
              </Label>
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

          <div className="flex">
            <Button
              type="submit"
              disabled={isPending || !isDirty}
              className="w-full sm:w-auto"
            >
              {isPending ? <Loader2Icon className="animate-spin" /> : null}
              {isPending ? "Saving…" : "Save changes"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
