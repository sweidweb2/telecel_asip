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
      variant={VARIANT[status]}
      className={cn("whitespace-nowrap", className)}
    >
      {INBOX_STATUS_LABELS[status]}
    </Badge>
  );
}
