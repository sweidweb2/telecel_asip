"use client";

import { InfoIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import type { AdminFormHelpSection } from "@/types/admin-form-help";

/** Small info control that opens a dialog explaining a form field group. */
export function AdminFormSectionHelp({
  help,
}: {
  help: AdminFormHelpSection;
}) {
  return (
    <Dialog>
      <DialogTrigger
        render={
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            className="size-8 shrink-0 text-muted-foreground hover:text-foreground"
          />
        }
      >
        <InfoIcon className="size-4" />
        <span className="sr-only">About {help.title}</span>
      </DialogTrigger>
      <DialogContent className="max-h-[85vh] max-w-md overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{help.title}</DialogTitle>
          <DialogDescription>{help.intro}</DialogDescription>
        </DialogHeader>
        <dl className="grid gap-3">
          {help.fields.map((field) => (
            <div key={field.name} className="grid gap-1">
              <dt className="text-sm font-medium text-foreground">
                {field.name}
              </dt>
              <dd className="text-sm text-muted-foreground">{field.detail}</dd>
            </div>
          ))}
        </dl>
      </DialogContent>
    </Dialog>
  );
}
