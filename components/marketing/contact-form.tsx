"use client";

import { useCallback, useEffect, useState, useTransition } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2Icon } from "lucide-react";
import { toast } from "sonner";

import { submitContactMessage } from "@/actions/submit-contact-message";
import type { ContactLabels } from "@/components/marketing/contact-labels";
import { ContactRoutePicker } from "@/components/marketing/contact-route-picker";
import { TurnstileField } from "@/components/marketing/turnstile-field";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  DEFAULT_CONTACT_ENQUIRY_TYPE,
  type ContactEnquiryType,
} from "@/constants/contact-enquiry";
import type { Locale } from "@/constants/locales";
import { useTurnstile } from "@/hooks/use-turnstile";
import { TURNSTILE_CONTACT_ACTION } from "@/types/turnstile";
import {
  contactMessageSchemaFor,
  type ContactMessageInput,
} from "@/validations/contact-message";

type ContactFormProps = {
  locale: Locale;
  labels: ContactLabels;
};

export function ContactForm({ locale, labels }: ContactFormProps) {
  const [isPending, startTransition] = useTransition();
  const [successOpen, setSuccessOpen] = useState(false);
  const [enquiryType, setEnquiryType] = useState<ContactEnquiryType>(
    DEFAULT_CONTACT_ENQUIRY_TYPE,
  );

  const {
    register,
    handleSubmit,
    control,
    reset,
    setValue,
    formState: { errors },
  } = useForm<ContactMessageInput>({
    resolver: zodResolver(contactMessageSchemaFor(locale)),
    defaultValues: {
      enquiryType,
      fullName: "",
      email: "",
      phone: "",
      subject: "",
      message: "",
      turnstileToken: "",
    },
  });

  const turnstileToken = useWatch({ control, name: "turnstileToken" });

  useEffect(() => {
    setValue("enquiryType", enquiryType);
  }, [enquiryType, setValue]);

  const turnstile = useTurnstile({
    action: TURNSTILE_CONTACT_ACTION,
    onTokenChange: useCallback(
      (token: string) =>
        setValue("turnstileToken", token, { shouldValidate: token !== "" }),
      [setValue],
    ),
  });

  function onSubmit(values: ContactMessageInput) {
    startTransition(async () => {
      try {
        const result = await submitContactMessage(values);

        if (result.status === "error") {
          toast.error(result.message);
          return;
        }

        reset({
          enquiryType,
          fullName: "",
          email: "",
          phone: "",
          subject: "",
          message: "",
          turnstileToken: "",
        });
        setSuccessOpen(true);
      } finally {
        turnstile.reset();
      }
    });
  }

  return (
    <>
    <Card className="lg:col-span-3">
      <CardHeader>
        <CardTitle>{labels.formTitle}</CardTitle>
        <CardDescription>{labels.formDescription}</CardDescription>
      </CardHeader>
      <CardContent>
        <form
          className="grid gap-4"
          onSubmit={handleSubmit(onSubmit)}
          noValidate
        >
          <ContactRoutePicker
            routes={labels.routes}
            value={enquiryType}
            onChange={setEnquiryType}
            legend={labels.routesLegend}
            hint={labels.routesHint}
            disabled={isPending}
          />
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="contact-fullName">{labels.nameLabel}</Label>
              <Input
                id="contact-fullName"
                type="text"
                autoComplete="name"
                placeholder={labels.namePlaceholder}
                aria-invalid={Boolean(errors.fullName)}
                disabled={isPending}
                className="min-h-11"
                {...register("fullName")}
              />
              {errors.fullName ? (
                <p className="text-sm text-destructive">
                  {errors.fullName.message}
                </p>
              ) : null}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="contact-phone">{labels.phoneFieldLabel}</Label>
              <Input
                id="contact-phone"
                type="tel"
                autoComplete="tel"
                placeholder={labels.phonePlaceholder}
                aria-invalid={Boolean(errors.phone)}
                disabled={isPending}
                className="min-h-11"
                {...register("phone")}
              />
              {errors.phone ? (
                <p className="text-sm text-destructive">
                  {errors.phone.message}
                </p>
              ) : null}
            </div>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="contact-email">{labels.emailFieldLabel}</Label>
            <Input
              id="contact-email"
              type="email"
              autoComplete="email"
              placeholder={labels.emailPlaceholder}
              aria-invalid={Boolean(errors.email)}
              disabled={isPending}
              className="min-h-11"
              {...register("email")}
            />
            {errors.email ? (
              <p className="text-sm text-destructive">{errors.email.message}</p>
            ) : null}
          </div>
          <div className="grid gap-2">
            <Label htmlFor="contact-subject">{labels.subjectLabel}</Label>
            <Input
              id="contact-subject"
              type="text"
              placeholder={labels.subjectPlaceholder}
              aria-invalid={Boolean(errors.subject)}
              disabled={isPending}
              className="min-h-11"
              {...register("subject")}
            />
            {errors.subject ? (
              <p className="text-sm text-destructive">
                {errors.subject.message}
              </p>
            ) : null}
          </div>
          <div className="grid gap-2">
            <Label htmlFor="contact-message">{labels.messageLabel}</Label>
            <Textarea
              id="contact-message"
              rows={5}
              placeholder={labels.messagePlaceholder}
              aria-invalid={Boolean(errors.message)}
              disabled={isPending}
              className="min-h-32"
              {...register("message")}
            />
            {errors.message ? (
              <p className="text-sm text-destructive">
                {errors.message.message}
              </p>
            ) : null}
          </div>
          <input type="hidden" {...register("turnstileToken")} />
          <TurnstileField
            turnstile={turnstile}
            hasToken={Boolean(turnstileToken)}
            hint={labels.turnstileHint}
            error={errors.turnstileToken?.message}
            testId="contact-turnstile"
          />
          <Button
            type="submit"
            className="min-h-11 w-full sm:w-auto"
            disabled={isPending || !turnstileToken}
          >
            {isPending ? (
              <>
                <Loader2Icon className="animate-spin" />
                {labels.submittingLabel}
              </>
            ) : (
              labels.submitLabel
            )}
          </Button>
        </form>
      </CardContent>
    </Card>

    <Dialog open={successOpen} onOpenChange={setSuccessOpen}>
      <DialogContent className="sm:max-w-md" showCloseButton>
        <DialogHeader>
          <DialogTitle className="pr-8 text-lg">
            {labels.successTitle}
          </DialogTitle>
          <DialogDescription>
            {labels.successDescription}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="sm:justify-end">
          <DialogClose
            render={
              <Button variant="default" className="min-h-11 w-full sm:w-auto" />
            }
          >
            {labels.successCloseLabel}
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
    </>
  );
}
