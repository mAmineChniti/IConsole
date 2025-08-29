import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { Separator } from "@/components/ui/separator";

const iconVariants = {
  // Grayscale
  gray: {
    bg: "bg-gray-100 dark:bg-gray-800",
    text: "text-gray-600 dark:text-gray-300",
  },
  // Blues
  blue: {
    bg: "bg-blue-100 dark:bg-blue-900/30",
    text: "text-blue-600 dark:text-blue-400",
  },
  sky: {
    bg: "bg-sky-100 dark:bg-sky-900/30",
    text: "text-sky-600 dark:text-sky-400",
  },
  // Greens
  green: {
    bg: "bg-green-100 dark:bg-green-900/30",
    text: "text-green-600 dark:text-green-400",
  },
  emerald: {
    bg: "bg-emerald-100 dark:bg-emerald-900/30",
    text: "text-emerald-600 dark:text-emerald-400",
  },
  // Yellows/Oranges
  amber: {
    bg: "bg-amber-100 dark:bg-amber-900/30",
    text: "text-amber-600 dark:text-amber-400",
  },
  yellow: {
    bg: "bg-yellow-100 dark:bg-yellow-900/30",
    text: "text-yellow-600 dark:text-yellow-400",
  },
  // Reds
  red: {
    bg: "bg-red-100 dark:bg-red-900/30",
    text: "text-red-600 dark:text-red-400",
  },
  rose: {
    bg: "bg-rose-100 dark:bg-rose-900/30",
    text: "text-rose-600 dark:text-rose-400",
  },
  // Purples
  purple: {
    bg: "bg-purple-100 dark:bg-purple-900/30",
    text: "text-purple-600 dark:text-purple-400",
  },
  violet: {
    bg: "bg-violet-100 dark:bg-violet-900/30",
    text: "text-violet-600 dark:text-violet-400",
  },
  // Cyans/Teals
  cyan: {
    bg: "bg-cyan-100 dark:bg-cyan-900/30",
    text: "text-cyan-600 dark:text-cyan-400",
  },
  teal: {
    bg: "bg-teal-100 dark:bg-teal-900/30",
    text: "text-teal-600 dark:text-teal-400",
  },
  // Pinks
  pink: {
    bg: "bg-pink-100 dark:bg-pink-900/30",
    text: "text-pink-600 dark:text-pink-400",
  },
  fuchsia: {
    bg: "bg-fuchsia-100 dark:bg-fuchsia-900/30",
    text: "text-fuchsia-600 dark:text-fuchsia-400",
  },
} as const;

type IconVariant = keyof typeof iconVariants;

// Default variant if none is specified
const DEFAULT_VARIANT: IconVariant = "gray";

type InfoItem = {
  label: string;
  value: string | ReactNode;
  icon: LucideIcon;
  variant?: IconVariant;
};

type InstanceCardProps = {
  title: string;
  description?: string;
  onClick?: (e: React.MouseEvent) => void;
  badges?: ReactNode;
  infoItems?: InfoItem[][];
  actionButtons?: ReactNode;
  className?: string;
};

export function InfoCard({
  title,
  description,
  onClick,
  badges,
  infoItems,
  actionButtons,
  className,
}: InstanceCardProps) {
  return (
    <Card
      className={cn(
        "flex flex-col h-full",
        onClick && "cursor-pointer",
        className,
      )}
      onClick={onClick}
    >
      <CardHeader className="flex flex-row justify-between items-start pb-2 space-y-0">
        <div className="space-y-1">
          <CardTitle className="text-base font-medium">{title}</CardTitle>
          {description && (
            <p className="text-sm text-muted-foreground line-clamp-1">
              {description}
            </p>
          )}
        </div>
        {badges && <div className="flex gap-2">{badges}</div>}
      </CardHeader>

      <CardContent className="flex flex-col flex-1 pt-0">
        <div className="flex-1 space-y-3">
          {infoItems?.map((row, rowIndex) => (
            <div key={rowIndex} className="flex flex-row gap-3 items-center">
              {row.map((item, itemIndex) => (
                <div
                  key={itemIndex}
                  className="flex flex-1 p-2 min-w-0 rounded-lg bg-muted/60"
                >
                  <div className="flex gap-2 items-center w-full">
                    <span
                      className={cn(
                        "inline-flex justify-center items-center w-7 h-7 rounded-md",
                        iconVariants[item.variant ?? DEFAULT_VARIANT].bg,
                        iconVariants[item.variant ?? DEFAULT_VARIANT].text,
                      )}
                    >
                      <item.icon className="w-4 h-4" />
                    </span>
                    <div className="flex flex-col min-w-0">
                      <span className="text-xs font-medium text-muted-foreground">
                        {item.label}
                      </span>
                      <span className="text-sm font-semibold text-card-foreground truncate">
                        {item.value}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
        {actionButtons && (
          <div className="relative pt-0 mt-4 w-full">
            <div className="absolute top-0 right-0 left-0">
              <Separator className="m-0" />
            </div>
            <div className="flex flex-wrap gap-2 justify-center items-center pt-4 w-full">
              {actionButtons}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
