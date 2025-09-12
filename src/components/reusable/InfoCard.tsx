import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";
import type { MouseEventHandler, ReactNode } from "react";

const iconVariants = {
  gray: {
    bg: "bg-slate-100 dark:bg-slate-800/50",
    text: "text-slate-600 dark:text-slate-400",
  },
  blue: {
    bg: "bg-blue-50 dark:bg-blue-900/20",
    text: "text-blue-600 dark:text-blue-400",
  },
  sky: {
    bg: "bg-sky-50 dark:bg-sky-900/20",
    text: "text-sky-600 dark:text-sky-400",
  },
  indigo: {
    bg: "bg-indigo-50 dark:bg-indigo-900/20",
    text: "text-indigo-600 dark:text-indigo-400",
  },
  green: {
    bg: "bg-emerald-50 dark:bg-emerald-900/20",
    text: "text-emerald-600 dark:text-emerald-400",
  },
  emerald: {
    bg: "bg-emerald-50 dark:bg-emerald-900/20",
    text: "text-emerald-600 dark:text-emerald-400",
  },
  teal: {
    bg: "bg-teal-50 dark:bg-teal-900/20",
    text: "text-teal-600 dark:text-teal-400",
  },
  amber: {
    bg: "bg-amber-50 dark:bg-amber-900/20",
    text: "text-amber-600 dark:text-amber-500",
  },
  orange: {
    bg: "bg-orange-50 dark:bg-orange-900/20",
    text: "text-orange-600 dark:text-orange-400",
  },
  red: {
    bg: "bg-red-50 dark:bg-red-900/20",
    text: "text-red-600 dark:text-red-400",
  },
  rose: {
    bg: "bg-rose-50 dark:bg-rose-900/20",
    text: "text-rose-600 dark:text-rose-400",
  },
  purple: {
    bg: "bg-purple-50 dark:bg-purple-900/20",
    text: "text-purple-600 dark:text-purple-400",
  },
  violet: {
    bg: "bg-violet-50 dark:bg-violet-900/20",
    text: "text-violet-600 dark:text-violet-400",
  },
  cyan: {
    bg: "bg-cyan-50 dark:bg-cyan-900/20",
    text: "text-cyan-600 dark:text-cyan-400",
  },
  pink: {
    bg: "bg-pink-50 dark:bg-pink-900/20",
    text: "text-pink-600 dark:text-pink-400",
  },
  fuchsia: {
    bg: "bg-fuchsia-50 dark:bg-fuchsia-900/20",
    text: "text-fuchsia-600 dark:text-fuchsia-400",
  },
} as const;

type IconVariant = keyof typeof iconVariants;

const DEFAULT_VARIANT: IconVariant = "gray";

type InfoItem = {
  label: string;
  value: string | ReactNode;
  icon: LucideIcon;
  variant?: IconVariant;
};

type InstanceCardProps = {
  title: string | ReactNode;
  description?: string;
  onClick?: MouseEventHandler<HTMLDivElement>;
  badges?: ReactNode;
  infoItems?: InfoItem[][];
  actionButtons?: ReactNode;
  isLoading?: boolean;
  className?: string;
  centerTitle?: boolean;
};

export function InfoCard({
  title,
  description,
  onClick,
  badges,
  infoItems,
  actionButtons,
  isLoading = false,
  className,
  centerTitle = false,
}: InstanceCardProps) {
  return (
    <Card
      className={cn(
        "flex flex-col bg-neutral-50 dark:bg-neutral-900",
        infoItems && infoItems.length > 0 ? "h-full py-6" : "h-auto py-2",
        onClick && "cursor-pointer",
        className,
      )}
      onClick={onClick}
    >
      <CardHeader
        className={cn(
          centerTitle
            ? "flex flex-col items-center space-y-0"
            : "flex flex-row items-start justify-between space-y-0",
          infoItems && infoItems.length > 0 ? "px-6 pb-2" : "px-4 pb-0",
        )}
      >
        {centerTitle ? (
          // Centered layout
          <div className="w-full text-center">
            <CardTitle className="text-base font-medium">
              {isLoading ? <Skeleton className="mx-auto h-5 w-32" /> : title}
            </CardTitle>
            {isLoading ? (
              <Skeleton className="mx-auto mt-1 h-4 w-24" />
            ) : description ? (
              <p className="text-muted-foreground mt-1 line-clamp-1 text-sm">
                {description}
              </p>
            ) : undefined}
            {isLoading ? (
              <Skeleton className="mx-auto mt-2 h-5 w-16" />
            ) : badges ? (
              <div className="mt-2 flex justify-center gap-2">{badges}</div>
            ) : undefined}
          </div>
        ) : (
          <>
            <div
              className={cn(
                infoItems && infoItems.length > 0 ? "space-y-1" : "space-y-0.5",
              )}
            >
              <CardTitle className="text-base font-medium">
                {isLoading ? <Skeleton className="h-5 w-32" /> : title}
              </CardTitle>
              {isLoading ? (
                <Skeleton className="h-4 w-24" />
              ) : description ? (
                <p className="text-muted-foreground line-clamp-1 text-sm">
                  {description}
                </p>
              ) : undefined}
            </div>
            {isLoading ? (
              <Skeleton className="h-5 w-16" />
            ) : badges ? (
              <div className="flex gap-2">{badges}</div>
            ) : undefined}
          </>
        )}
      </CardHeader>

      <CardContent
        className={cn(
          "flex flex-1 flex-col pt-0",
          infoItems && infoItems.length > 0 ? "px-6" : "px-4",
        )}
      >
        <div className="flex-1 space-y-3">
          {isLoading ? (
            <div className="flex flex-row items-center gap-3">
              {Array.from({ length: 4 }).map((_, index) => (
                <div
                  key={index}
                  className="bg-muted/60 flex min-w-0 flex-1 rounded-lg p-2"
                >
                  <div className="flex w-full items-center gap-2">
                    <span
                      className={cn(
                        "inline-flex h-7 w-7 items-center justify-center rounded-md",
                        iconVariants.gray.bg,
                        iconVariants.gray.text,
                      )}
                    >
                      <Skeleton className="h-4 w-4 rounded-md" />
                    </span>
                    <div className="flex min-w-0 flex-col">
                      <span className="text-muted-foreground text-xs font-medium">
                        <Skeleton className="h-3 w-20" />
                      </span>
                      <span className="text-card-foreground truncate text-sm font-semibold">
                        <Skeleton className="mt-1 h-4 w-24" />
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            infoItems?.map((row, rowIndex) => (
              <div key={rowIndex} className="flex flex-row items-center gap-3">
                {row.map((item, itemIndex) => (
                  <div
                    key={itemIndex}
                    className="bg-muted/60 flex min-w-0 flex-1 rounded-lg p-2"
                  >
                    <div className="flex w-full items-center gap-2">
                      <span
                        className={cn(
                          "inline-flex h-7 w-7 items-center justify-center rounded-md",
                          iconVariants[item.variant ?? DEFAULT_VARIANT].bg,
                          iconVariants[item.variant ?? DEFAULT_VARIANT].text,
                        )}
                      >
                        <item.icon className="h-4 w-4" />
                      </span>
                      <div className="flex min-w-0 flex-col">
                        <span className="text-muted-foreground text-xs font-medium">
                          {item.label}
                        </span>
                        <span className="text-card-foreground truncate text-sm font-semibold">
                          {item.value}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ))
          )}
        </div>
        {actionButtons && (
          <div
            onClick={(e) => e.stopPropagation()}
            className={cn(
              "relative w-full pt-0",
              infoItems && infoItems.length > 0 ? "mt-4" : "mt-2",
            )}
          >
            <div className="absolute top-0 right-0 left-0">
              <Separator className="m-0" />
            </div>
            <div
              className={cn(
                "flex w-full flex-wrap items-center justify-center gap-2",
                infoItems && infoItems.length > 0 ? "pt-4" : "pt-2",
              )}
            >
              {actionButtons}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
