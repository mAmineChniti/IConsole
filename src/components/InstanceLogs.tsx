"use client";

import { HeaderActions } from "@/components/reusable/HeaderActions";
import { Button } from "@/components/ui/button";
import { InfraService } from "@/lib/requests";
import { cn } from "@/lib/utils";
import type {
  GetLogsResponse,
  InstanceListItem,
} from "@/types/ResponseInterfaces";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Copy, Loader2, Pause, Play } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { atomDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import { toast } from "sonner";

interface InstanceLogsProps {
  instance: InstanceListItem;
  onClose?: () => void;
}

export default function InstanceLogs({ instance, onClose }: InstanceLogsProps) {
  const logsContainerRef = useRef<HTMLDivElement>(null);
  const logsEndRef = useRef<HTMLDivElement>(null);
  const [autoRefresh, setAutoRefresh] = useState(true);

  const {
    data,
    error,
    isLoading,
    refetch: refetchLogs,
  } = useQuery<GetLogsResponse>({
    queryKey: ["instanceLogs", instance.id],
    queryFn: async () => {
      return await InfraService.getLogs({ instance_id: instance.id });
    },
    refetchInterval: autoRefresh ? 5000 : false,
    enabled: !!instance.id,
  });

  useEffect(() => {
    if (error) {
      console.error("Error fetching logs:", error);
    }
  }, [error]);

  const updateScrollPosition = () => {
    if (logsEndRef.current) {
      logsEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  useEffect(() => {
    updateScrollPosition();
  }, [data?.logs.output]);

  const handleCopyLogs = async () => {
    if (!data?.logs.output) return;

    try {
      await navigator.clipboard.writeText(data.logs.output);
      toast.success("Logs copied to clipboard");
    } catch (err) {
      toast.error("Failed to copy logs");
      console.error("Failed to copy logs:", err);
    }
  };

  return (
    <div className="bg-background flex h-full w-full flex-col overflow-hidden">
      <div className="bg-background/95 sticky top-0 z-10 flex-none border-b p-4 backdrop-blur-sm">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="text-muted-foreground bg-card border-border/50 hover:text-foreground flex cursor-pointer items-center gap-2 rounded-full border transition-all duration-200"
            >
              <ArrowLeft className="h-4 w-4" />
              <span className="hidden sm:inline">Back to Instances</span>
            </Button>
            <div className="flex flex-col sm:flex-row sm:items-center sm:gap-3">
              <h1 className="text-lg font-semibold whitespace-nowrap">
                Logs for{" "}
                <span className="bg-muted rounded px-2 py-0.5 font-mono text-sm">
                  {instance.instance_name}
                </span>
              </h1>
              {data?.logs.output && (
                <div className="bg-muted text-muted-foreground rounded-full px-2 py-0.5 text-xs">
                  {data.logs.output.split("\n").filter(Boolean).length} lines
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div
              className={cn(
                "hidden items-center gap-1.5 rounded-full px-2.5 py-1 text-xs sm:flex",
                autoRefresh
                  ? "bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400"
                  : "bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-400",
              )}
            >
              <div
                className={cn(
                  "h-2 w-2 rounded-full",
                  autoRefresh ? "bg-green-500" : "bg-yellow-500",
                )}
              />
              <span>
                {autoRefresh ? "Auto-refresh: On" : "Auto-refresh: Paused"}
              </span>
            </div>

            <HeaderActions
              onRefresh={refetchLogs}
              isRefreshing={isLoading}
              refreshTooltip="Refresh logs"
              refreshAriaLabel="Refresh logs"
              mainButtons={[
                {
                  onClick: () => setAutoRefresh(!autoRefresh),
                  label: autoRefresh
                    ? "Pause auto-refresh"
                    : "Resume auto-refresh",
                  icon: autoRefresh ? (
                    <Pause className="h-4 w-4" />
                  ) : (
                    <Play className="h-4 w-4" />
                  ),
                  tooltip: autoRefresh
                    ? "Pause auto-refresh"
                    : "Resume auto-refresh",
                  className: "hidden sm:flex",
                },
                {
                  onClick: () => {
                    void handleCopyLogs();
                  },
                  label: "Copy logs",
                  icon: <Copy className="h-4 w-4" />,
                  disabled: !data?.logs.output,
                  tooltip: "Copy logs to clipboard",
                },
              ]}
              className="gap-2"
              refreshButtonClassName="h-8 w-8 p-0 sm:w-auto sm:px-3 sm:gap-2"
            />
          </div>
        </div>
      </div>

      <div className="relative flex flex-1 flex-col overflow-hidden">
        <div
          ref={logsContainerRef}
          className="h-[70vh] min-h-[300px] w-full overflow-auto p-4"
        >
          {isLoading ? (
            <div className="flex h-full items-center justify-center">
              <Loader2 className="text-muted-foreground h-8 w-8 animate-spin" />
            </div>
          ) : error ? (
            <div className="text-destructive bg-destructive/10 m-4 rounded p-4">
              {error.message || "An error occurred while fetching logs"}
            </div>
          ) : data?.logs.output ? (
            <div
              className="h-full w-full overflow-auto"
              style={{ contain: "content" }}
            >
              <SyntaxHighlighter
                language="bash"
                style={atomDark}
                wrapLongLines
                showLineNumbers
                customStyle={{
                  margin: 0,
                  background: "transparent",
                  padding: "1rem",
                  fontSize: "0.875rem",
                  lineHeight: "1.25rem",
                  fontFamily: "monospace",
                  maxHeight: "none",
                  overflow: "visible",
                }}
                lineNumberStyle={{
                  minWidth: "2.5em",
                  paddingRight: "1em",
                  color: "#6b7280",
                  textAlign: "right",
                  userSelect: "none",
                  position: "sticky",
                  left: 0,
                  backgroundColor: "hsl(var(--background))",
                }}
                codeTagProps={{
                  style: {
                    whiteSpace: "pre-wrap",
                    wordBreak: "break-word",
                    overflowWrap: "anywhere",
                    display: "block",
                  },
                }}
              >
                {data?.logs.output}
              </SyntaxHighlighter>
              <div ref={logsEndRef} className="h-4" />
            </div>
          ) : (
            <div className="text-muted-foreground p-4 italic">
              No logs available
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
