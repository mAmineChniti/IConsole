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
          ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400"
          : status === "SHUTOFF"
            ? "bg-muted text-muted-foreground border border-border"
            : status === "ERROR"
              ? "bg-destructive text-destructive-foreground border border-destructive"
              : status === "BUILD"
                ? "bg-blue-100 text-blue-700 border border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800"
                : "bg-accent text-accent-foreground border border-accent",
      )}
    >
      {status === "BUILD" ? (
        <Loader2 className="w-3 h-3 text-blue-500 animate-spin" />
      ) : (
        <div
          className={cn(
            "w-1.5 h-1.5 rounded-full animate-pulse",
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
