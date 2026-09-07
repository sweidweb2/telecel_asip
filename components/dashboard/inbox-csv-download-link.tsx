import { DownloadIcon } from "lucide-react";

import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type InboxCsvDownloadLinkProps = {
  href: string;
};

/** Compact CSV export action for inbox list pages (Applications / Registrations / Contact). */
export function InboxCsvDownloadLink({ href }: InboxCsvDownloadLinkProps) {
  return (
    <a
      href={href}
      className={cn(
        buttonVariants({ variant: "outline" }),
        "min-h-11 w-full sm:w-auto",
      )}
    >
      <DownloadIcon className="size-4" />
      Download CSV
    </a>
  );
}
