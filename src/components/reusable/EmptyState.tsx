"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Inbox, Plus, RefreshCw } from "lucide-react";
import type { CSSProperties, ReactNode } from "react";

export type EmptyPrimaryAction = {
  label: string;
  onClick: () => void;
  disabled?: boolean;
  icon?: ReactNode;
  className?: string;
};

export type EmptyStateProps = {
  text: string;
  onRefresh: () => void;
  refreshing?: boolean;
  primaryLabel?: string;
  onPrimary?: () => void;
  primaryDisabled?: boolean;
  title?: string;
  icon?: ReactNode;
  variant?: "elevated" | "subtle" | "dashed";
  compact?: boolean;

  primaryActions?: EmptyPrimaryAction[];
};

export function EmptyState({
  text,
  onRefresh,
  refreshing,
  primaryLabel,
  onPrimary,
  primaryDisabled,
  title,
  icon,
  variant = "elevated",
  compact = false,
  primaryActions,
}: EmptyStateProps) {
  const padding = compact ? "p-5 sm:p-6" : "p-6 sm:p-8 lg:p-10";
  const minH = compact ? "min-h-[180px]" : "min-h-[220px]";
  const cardBase =
    "relative w-full overflow-hidden rounded-xl bg-background text-foreground";
  const cardVariant =
    variant === "elevated"
      ? "border ring-1 ring-border/60 shadow-sm"
      : variant === "dashed"
        ? "border border-dashed border-[3px] border-border/70"
        : "border border-border/60";

  const dashedStyle =
    variant === "dashed"
      ? ({
          borderImage:
            "repeating-linear-gradient(90deg, hsl(var(--border)) 0 16px, transparent 16px 28px) 1",
        } as CSSProperties)
      : undefined;

  return (
    <div className="px-2">
      <Card className={cn(cardBase, cardVariant)} style={dashedStyle}>
        <CardContent className={cn(padding, "flex flex-col")}>
          <div
            className={cn(
              "flex flex-col items-center gap-3 text-center sm:gap-4",
              minH,
            )}
          >
            <div className="inline-flex justify-center items-center w-14 h-14 rounded-full border shadow-sm border-border/60 bg-muted/40">
              {icon ?? <Inbox className="w-7 h-7 text-muted-foreground" />}
            </div>

            {title ? (
              <h3 className="text-lg font-medium tracking-tight sm:text-xl text-foreground/90">
                {title}
              </h3>
            ) : undefined}

            <p className="mx-auto max-w-xl leading-relaxed sm:text-base text-muted-foreground text-[15px]">
              {text}
            </p>
          </div>

          <div className="pt-4 mt-auto sm:pt-6">
            <div className="flex flex-col gap-2 justify-center items-center w-full sm:flex-row">
              <Button
                variant="outline"
                size="sm"
                onClick={onRefresh}
                disabled={!!refreshing}
                className="px-5 w-full h-9 rounded-full cursor-pointer sm:w-auto hover:bg-transparent hover:shadow-none"
              >
                {refreshing ? (
                  <>
                    <RefreshCw className="mr-2 w-4 h-4 animate-spin" />
                    Refreshing...
                  </>
                ) : (
                  <>
                    <RefreshCw className="mr-2 w-4 h-4" />
                    Refresh
                  </>
                )}
              </Button>

              {(primaryActions && primaryActions.length > 0
                ? primaryActions
                : primaryLabel && onPrimary
                  ? [
                      {
                        label: primaryLabel,
                        onClick: onPrimary,
                        disabled: primaryDisabled,
                      },
                    ]
                  : []
              ).map((action, idx) => (
                <Button
                  key={idx}
                  size="sm"
                  onClick={action.onClick}
                  disabled={action.disabled}
                  className={cn(
                    "hover:bg-primary h-9 w-full cursor-pointer gap-2 rounded-full px-5 hover:shadow-none sm:w-auto",
                    action.className,
                  )}
                >
                  {action.icon ?? <Plus className="w-4 h-4" />}
                  {action.label}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
