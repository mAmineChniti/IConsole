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
    <div className="flex overflow-hidden flex-col w-full h-full bg-background">
      <div className="sticky top-0 z-10 flex-none p-4 border-b bg-background/95 backdrop-blur-sm">
        <div className="flex gap-4 justify-between items-center">
          <div className="flex gap-3 items-center">
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="flex gap-2 items-center rounded-full border transition-all duration-200 cursor-pointer text-muted-foreground bg-card border-border/50 hover:text-foreground"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Back to Instances</span>
            </Button>
            <div className="flex flex-col sm:flex-row sm:gap-3 sm:items-center">
              <h1 className="text-lg font-semibold whitespace-nowrap">
                Logs for{" "}
                <span className="py-0.5 px-2 font-mono text-sm rounded bg-muted">
                  {instance.instance_name}
                </span>
              </h1>
              {data?.logs.output && (
                <div className="py-0.5 px-2 text-xs rounded-full bg-muted text-muted-foreground">
                  {data.logs.output.split("\n").filter(Boolean).length} lines
                </div>
              )}
            </div>
          </div>

          <div className="flex gap-2 items-center">
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
                    <Pause className="w-4 h-4" />
                  ) : (
                    <Play className="w-4 h-4" />
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
                  icon: <Copy className="w-4 h-4" />,
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

      <div className="flex overflow-hidden relative flex-col flex-1">
        <div
          ref={logsContainerRef}
          className="overflow-auto p-4 w-full h-[70vh] min-h-[300px]"
        >
          {isLoading ? (
            <div className="flex justify-center items-center h-full">
              <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
            </div>
          ) : error ? (
            <div className="p-4 m-4 rounded text-destructive bg-destructive/10">
              {error.message || "An error occurred while fetching logs"}
            </div>
          ) : data?.logs.output ? (
            <div className="overflow-auto w-full h-full contain-content">
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
            <div className="p-4 italic text-muted-foreground">
              No logs available
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
