"use client";

import type { ReactElement } from "react";

import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

type AdminActionTooltipProps = {
  /** Short name of this control's action only, for example "Edit". */
  label: string;
  children: ReactElement;
};

/**
 * Small hover label for one icon action.
 * The popup names that control only, so neighbouring buttons stay quiet.
 */
export function AdminActionTooltip({ label, children }: AdminActionTooltipProps) {
  return (
    <Tooltip disableHoverablePopup>
      <TooltipTrigger delay={0} closeDelay={0} render={children} />
      <TooltipContent side="top">{label}</TooltipContent>
    </Tooltip>
  );
}
