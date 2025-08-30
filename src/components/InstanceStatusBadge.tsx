import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

export function InstanceStatusBadge({ status }: { status: string }) {
  return (
    <Badge
      variant={
        status === "ACTIVE"
          ? "default"
          : status === "ERROR"
            ? "destructive"
            : status === "BUILD"
              ? "secondary"
              : "secondary"
      }
      className={cn(
        "gap-1.5",
        status === "ACTIVE"
          ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
          : status === "SHUTOFF"
            ? "bg-muted text-muted-foreground border-border border"
            : status === "ERROR"
              ? "bg-destructive text-destructive-foreground border-destructive border"
              : status === "BUILD"
                ? "border border-blue-200 bg-blue-100 text-blue-700 dark:border-blue-800 dark:bg-blue-900/30 dark:text-blue-400"
                : "bg-accent text-accent-foreground border-accent border",
      )}
    >
      {status === "BUILD" ? (
        <Loader2 className="w-3 h-3 text-blue-500 animate-spin" />
      ) : (
        <div
          className={cn(
            "h-1.5 w-1.5 animate-pulse rounded-full",
            status === "ACTIVE"
              ? "bg-green-500"
              : status === "SHUTOFF"
                ? "bg-muted-foreground"
                : status === "ERROR"
                  ? "bg-destructive"
                  : status === "BUILD"
                    ? "bg-blue-500"
                    : "bg-accent",
          )}
        />
      )}
      {status}
    </Badge>
  );
}
