"use client";

import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { Plus, RefreshCw } from "lucide-react";
import type { ReactNode } from "react";

type HeaderActionsMainButton = {
  onClick: () => void;
  label: string;
  shortLabel?: string;
  icon?: ReactNode;
  disabled?: boolean;
  tooltip?: string;
  className?: string;
};

export function HeaderActions({
  onRefresh,
  isRefreshing = false,
  refreshTooltip = "Refresh",
  refreshAriaLabel = "Refresh",
  className,
  refreshButtonClassName,
  mainButton,
  mainButtons,
}: {
  onRefresh: () => void;
  isRefreshing?: boolean;
  refreshTooltip?: string;
  refreshAriaLabel?: string;
  className?: string;
  refreshButtonClassName?: string;

  mainButton?: HeaderActionsMainButton;

  mainButtons?: HeaderActionsMainButton[];
}) {
  return (
    <div
      className={cn(
        "flex w-full items-center justify-end gap-3 sm:w-auto",
        className,
      )}
    >
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            onClick={onRefresh}
            disabled={isRefreshing}
            className={cn(
              "bg-card text-card-foreground border-border/50 h-9 w-9 cursor-pointer rounded-full border p-0 transition-all duration-200",
              isRefreshing && "opacity-70",
              refreshButtonClassName,
            )}
            aria-label={refreshAriaLabel}
          >
            <RefreshCw
              className={cn("h-4 w-4", isRefreshing && "animate-spin")}
            />
          </Button>
        </TooltipTrigger>
        <TooltipContent>{refreshTooltip}</TooltipContent>
      </Tooltip>

      {(mainButtons && mainButtons.length > 0
        ? mainButtons
        : mainButton
          ? [mainButton]
          : []
      ).map((btn, idx) => (
        <Tooltip key={idx}>
          <TooltipTrigger asChild>
            <Button
              size="sm"
              onClick={btn.onClick}
              disabled={btn.disabled}
              className={cn(
                "bg-primary text-primary-foreground cursor-pointer gap-2 rounded-full px-4 font-semibold shadow-md transition-all duration-300",
                btn.className,
              )}
            >
              {btn.icon ?? <Plus className="h-4 w-4" />}
              <span className="hidden sm:inline">{btn.label}</span>
              <span className="sm:hidden">{btn.shortLabel ?? "New"}</span>
            </Button>
          </TooltipTrigger>
          {btn.tooltip && <TooltipContent>{btn.tooltip}</TooltipContent>}
        </Tooltip>
      ))}
    </div>
  );
}
