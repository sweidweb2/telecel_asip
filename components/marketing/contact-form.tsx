"use client";

import type { FormEvent } from "react";

import type { ContactLabels } from "@/components/marketing/contact-labels";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

type ContactFormProps = {
  labels: ContactLabels;
};

export function ContactForm({ labels }: ContactFormProps) {
  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
  }

  return (
    <Card className="lg:col-span-3">
      <CardHeader>
        <CardTitle>{labels.formTitle}</CardTitle>
        <CardDescription>{labels.formDescription}</CardDescription>
      </CardHeader>
      <CardContent>
        <form className="grid gap-4" onSubmit={handleSubmit}>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="contact-name">{labels.nameLabel}</Label>
              <Input
                id="contact-name"
                name="name"
                type="text"
                autoComplete="name"
                placeholder={labels.namePlaceholder}
                className="min-h-11"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="contact-phone">{labels.phoneFieldLabel}</Label>
              <Input
                id="contact-phone"
                name="phone"
                type="tel"
                autoComplete="tel"
                placeholder={labels.phonePlaceholder}
                className="min-h-11"
              />
            </div>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="contact-email">
              {labels.emailFieldLabel}{" "}
              <span className="font-normal text-muted-foreground">
                {labels.emailOptional}
              </span>
            </Label>
            <Input
              id="contact-email"
              name="email"
              type="email"
              autoComplete="email"
              placeholder={labels.emailPlaceholder}
              className="min-h-11"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="contact-subject">{labels.subjectLabel}</Label>
            <Input
              id="contact-subject"
              name="subject"
              type="text"
              placeholder={labels.subjectPlaceholder}
              className="min-h-11"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="contact-message">{labels.messageLabel}</Label>
            <Textarea
              id="contact-message"
              name="message"
              rows={5}
              placeholder={labels.messagePlaceholder}
              className="min-h-32"
            />
          </div>
          <Button type="submit" className="min-h-11 w-full sm:w-auto">
            {labels.submitLabel}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
