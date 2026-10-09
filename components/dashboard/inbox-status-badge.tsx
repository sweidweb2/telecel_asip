import { Badge } from "@/components/ui/badge";
import {
  INBOX_STATUS_LABELS,
  type InboxStatus,
} from "@/constants/inbox";
import { cn } from "@/lib/utils";

const VARIANT: Record<
  InboxStatus,
  "default" | "secondary" | "outline"
> = {
  unread: "default",
  reviewed: "secondary",
  archived: "outline",
};

export function InboxStatusBadge({
  status,
  className,
}: {
  status: InboxStatus;
  className?: string;
}) {
  return (
    <Badge
      variant={status === "unread" ? "outline" : VARIANT[status]}
      data-inbox-status={status}
      className={cn(
        "whitespace-nowrap",
        status === "unread" &&
          "border-transparent bg-[var(--portal-accent)] text-white",
        className,
      )}
    >
      {INBOX_STATUS_LABELS[status]}
    </Badge>
  );
}
