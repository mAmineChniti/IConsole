import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";
import type { ReactNode } from "react";

type StatusVariant = "default" | "destructive" | "secondary" | "outline";

type StatusConfig = {
  variant: StatusVariant;
  className: string;
  icon?: ReactNode;
  dotColor?: string;
};

type StatusMapping = Record<string, StatusConfig>;

const DEFAULT_STATUS_MAPPING: StatusMapping = {
  ACTIVE: {
    variant: "default",
    className:
      "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
    dotColor: "bg-green-500",
  },
  RUNNING: {
    variant: "default",
    className:
      "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
    dotColor: "bg-emerald-500",
  },
  COMPLETED: {
    variant: "default",
    className:
      "bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400",
    dotColor: "bg-teal-500",
  },
  SUCCESS: {
    variant: "default",
    className:
      "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
    dotColor: "bg-green-500",
  },
  ONLINE: {
    variant: "default",
    className:
      "bg-lime-100 text-lime-700 dark:bg-lime-900/30 dark:text-lime-400",
    dotColor: "bg-lime-500",
  },
  BUILD: {
    variant: "secondary",
    className:
      "border border-blue-200 bg-blue-100 text-blue-700 dark:border-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
    dotColor: "bg-blue-500",
    icon: <Loader2 className="h-3 w-3 animate-spin" />,
  },
  PENDING: {
    variant: "secondary",
    className:
      "border border-amber-200 bg-amber-100 text-amber-700 dark:border-amber-800 dark:bg-amber-900/30 dark:text-amber-400",
    dotColor: "bg-amber-500",
  },
  UPDATING: {
    variant: "secondary",
    className:
      "border border-sky-200 bg-sky-100 text-sky-700 dark:border-sky-800 dark:bg-sky-900/30 dark:text-sky-400",
    dotColor: "bg-sky-500",
    icon: <Loader2 className="h-3 w-3 animate-spin" />,
  },
  PROVISIONING: {
    variant: "secondary",
    className:
      "border border-purple-200 bg-purple-100 text-purple-700 dark:border-purple-800 dark:bg-purple-900/30 dark:text-purple-400",
    dotColor: "bg-purple-500",
    icon: <Loader2 className="h-3 w-3 animate-spin" />,
  },
  ERROR: {
    variant: "destructive",
    className:
      "bg-destructive text-destructive-foreground border-destructive border",
    dotColor: "bg-destructive",
  },
  FAILED: {
    variant: "destructive",
    className:
      "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400 border-rose-200 dark:border-rose-800 border",
    dotColor: "bg-rose-500",
  },
  CRASHED: {
    variant: "destructive",
    className:
      "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 border-red-200 dark:border-red-800 border",
    dotColor: "bg-red-500",
  },
  DEGRADED: {
    variant: "destructive",
    className:
      "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400 border-orange-200 dark:border-orange-800 border",
    dotColor: "bg-orange-500",
  },
  SHUTOFF: {
    variant: "outline",
    className: "bg-muted text-muted-foreground border-border border",
    dotColor: "bg-muted-foreground",
  },
  STOPPED: {
    variant: "outline",
    className:
      "bg-gray-100 text-gray-700 dark:bg-gray-800/30 dark:text-gray-400 border-gray-200 dark:border-gray-700 border",
    dotColor: "bg-gray-500",
  },
  SUSPENDED: {
    variant: "outline",
    className:
      "bg-slate-100 text-slate-700 dark:bg-slate-800/30 dark:text-slate-400 border-slate-200 dark:border-slate-700 border",
    dotColor: "bg-slate-500",
  },
  MAINTENANCE: {
    variant: "outline",
    className:
      "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border-amber-200 dark:border-amber-800 border",
    dotColor: "bg-amber-500",
    icon: <Loader2 className="h-3 w-3 animate-spin" />,
  },
};

const STATUS_THEMES = {
  ACTIVE: "ACTIVE",
  RUNNING: "RUNNING",
  COMPLETED: "COMPLETED",
  SUCCESS: "SUCCESS",
  ONLINE: "ONLINE",
  BUILD: "BUILD",
  PENDING: "PENDING",
  UPDATING: "UPDATING",
  PROVISIONING: "PROVISIONING",
  ERROR: "ERROR",
  FAILED: "FAILED",
  CRASHED: "CRASHED",
  DEGRADED: "DEGRADED",
  SHUTOFF: "SHUTOFF",
  STOPPED: "STOPPED",
  SUSPENDED: "SUSPENDED",
  MAINTENANCE: "MAINTENANCE",
} as const;
type StatusTheme = keyof typeof STATUS_THEMES;
const DEFAULT_STATUS: StatusTheme = "SHUTOFF";

export function StatusBadge({
  status,
  statusTextMap = {},
  className,
}: {
  status: string;
  statusTextMap?: Record<string, StatusTheme>;
  className?: string;
}) {
  const normalized = status.trim().toUpperCase();
  const statusTheme: StatusTheme =
    statusTextMap[normalized] ??
    (normalized in STATUS_THEMES
      ? (normalized as StatusTheme)
      : DEFAULT_STATUS);

  const config = DEFAULT_STATUS_MAPPING[statusTheme] ??
    DEFAULT_STATUS_MAPPING[DEFAULT_STATUS] ?? {
      variant: "secondary",
      className:
        "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300",
      dotColor: "bg-gray-500",
    };
  const hasCustomIcon = "icon" in config && config.icon !== undefined;

  return (
    <Badge
      variant={config.variant}
      className={cn("gap-1.5", config.className, className)}
    >
      {hasCustomIcon ? (
        config.icon
      ) : (
        <div
          className={cn(
            "h-1.5 w-1.5 animate-pulse rounded-full",
            config.dotColor,
          )}
        />
      )}
      {status}
    </Badge>
  );
}
