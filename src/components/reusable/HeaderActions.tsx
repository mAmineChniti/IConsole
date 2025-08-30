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

export type HeaderActionsMainButton = {
  onClick: () => void;
  label: string;
  shortLabel?: string;
  icon?: ReactNode;
  disabled?: boolean;
  tooltip?: string;
  className?: string;
};

export type HeaderActionsProps = {
  onRefresh: () => void;
  isRefreshing?: boolean;
  refreshTooltip?: string;
  refreshAriaLabel?: string;
  className?: string;
  refreshButtonClassName?: string;

  mainButton?: HeaderActionsMainButton;

  mainButtons?: HeaderActionsMainButton[];
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
}: HeaderActionsProps) {
  return (
    <div
      className={cn(
        "flex gap-3 justify-end items-center w-full sm:w-auto",
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
              "p-0 w-9 h-9 rounded-full border transition-all duration-200 cursor-pointer bg-card text-card-foreground border-border/50",
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
                "gap-2 px-4 font-semibold rounded-full shadow-md transition-all duration-300 cursor-pointer bg-primary text-primary-foreground",
                btn.className,
              )}
            >
              {btn.icon ?? <Plus className="w-4 h-4" />}
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
