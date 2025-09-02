import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { ClusterService } from "@/lib/requests";
import { useQuery } from "@tanstack/react-query";
import { Check, Copy, Download, ExternalLink, Server } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { atomDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import { toast } from "sonner";

export function ClusterTokenDialog({
  clusterId,
  clusterName,
  isOpen,
  onOpenChange,
}: {
  clusterId: number | undefined;
  clusterName: string | undefined;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const { data, isLoading, error } = useQuery({
    queryKey: ["cluster-token", clusterId],
    queryFn: () => {
      if (!clusterId) throw new Error("No cluster ID provided");
      return ClusterService.getDashboardToken({ cluster_id: clusterId });
    },
    enabled: isOpen && !!clusterId,
    staleTime: 5 * 60 * 1000,
  });

  const [copiedToken, setCopiedToken] = useState<string | undefined>(undefined);

  useEffect(() => {
    if (copiedToken) {
      const timer = setTimeout(() => setCopiedToken(undefined), 1000);
      return () => clearTimeout(timer);
    }
  }, [copiedToken]);

  const handleTokenCopy = async (token: string) => {
    try {
      if (token) {
        await navigator.clipboard.writeText(token);
        setCopiedToken(token);
        toast.success("Token copied to clipboard");
      }
    } catch {
      toast.error(
        "Failed to copy token to clipboard. Please copy it manually.",
      );
    }
  };
  if (isLoading) {
    return (
      <Dialog open={isOpen} onOpenChange={onOpenChange}>
        <DialogContent className="max-h-[90vh] w-[95vw] max-w-4xl overflow-y-auto sm:max-w-[90vw] md:max-w-2xl lg:max-w-4xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Server className="h-5 w-5" />
              Cluster Dashboard Access
            </DialogTitle>
            <DialogDescription>
              Use the following token to access the Kubernetes dashboard for
              this cluster.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Skeleton className="mb-1.5 h-4 w-16" />
              <Skeleton className="h-10 w-full rounded-md" />
            </div>

            <div>
              <Skeleton className="mb-1.5 h-4 w-24" />
              <div className="relative">
                <Skeleton className="h-20 w-full rounded-md" />
                <Skeleton className="absolute top-2 right-2 h-8 w-8 rounded-full" />
              </div>
            </div>

            <div>
              <Skeleton className="mb-1.5 h-4 w-14" />
              <div className="relative">
                <Skeleton className="h-32 w-full rounded-md" />
                <Skeleton className="absolute top-2 right-2 h-8 w-8 rounded-full" />
              </div>
            </div>

            <div>
              <Skeleton className="mb-1.5 h-4 w-24" />
              <Skeleton className="h-32 w-full rounded-md" />
            </div>
          </div>

          <DialogFooter className="flex justify-between pt-2">
            <Skeleton className="h-9 w-40 rounded-full" />
            <Skeleton className="h-9 w-20 rounded-full" />
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] w-[95vw] max-w-4xl overflow-y-auto sm:max-w-[90vw] md:max-w-2xl lg:max-w-4xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Server className="h-5 w-5" />
            Cluster Dashboard Access
          </DialogTitle>
          <DialogDescription>
            Use the following token to access the Kubernetes dashboard for this
            cluster.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          {error ? (
            <div className="text-destructive bg-destructive/10 mb-4 rounded-md p-3 text-sm">
              Failed to load dashboard token. Please try again.
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <h4 className="mb-1 text-sm font-medium">Master IP</h4>
                <div className="relative">
                  <div className="overflow-x-auto">
                    <SyntaxHighlighter
                      language="bash"
                      style={atomDark}
                      wrapLongLines
                      customStyle={{
                        margin: 0,
                        borderRadius: "0.5rem",
                        background: "#0a0a0a",
                        padding: "0.5rem 0.75rem",
                        fontSize: "0.875rem",
                        lineHeight: "1.25rem",
                        minWidth: "min(100%, 20rem)",
                      }}
                      codeTagProps={{
                        style: {
                          whiteSpace: "pre-wrap",
                          wordBreak: "break-word",
                          overflowWrap: "anywhere",
                        },
                      }}
                    >
                      {data?.master_ip ?? "Unknown"}
                    </SyntaxHighlighter>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="mb-1 text-sm font-medium">Dashboard URL</h4>
                <div className="group relative">
                  <Link
                    href={data?.dashboard_path ?? "#"}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block w-full hover:underline"
                  >
                    <SyntaxHighlighter
                      language="bash"
                      style={atomDark}
                      wrapLongLines
                      customStyle={{
                        margin: 0,
                        borderRadius: "0.5rem",
                        background: "#0a0a0a",
                        padding: "0.5rem 2.5rem 0.5rem 0.75rem",
                        maxHeight: "5rem",
                        overflow: "auto",
                        fontSize: "0.875rem",
                        lineHeight: "1.25rem",
                        cursor: "pointer",
                        minWidth: "min(100%, 20rem)",
                      }}
                      codeTagProps={{
                        style: {
                          whiteSpace: "pre-wrap",
                          wordBreak: "break-word",
                          overflowWrap: "anywhere",
                        },
                      }}
                    >
                      {data?.dashboard_path ?? "Unknown"}
                    </SyntaxHighlighter>
                  </Link>
                  <Link
                    href={data?.dashboard_path ?? "#"}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-muted-foreground hover:text-foreground absolute top-1/2 right-2 z-10 -translate-y-1/2 p-1.5 transition-colors"
                  >
                    <ExternalLink className="h-4 w-4" />
                  </Link>
                </div>
              </div>

              <div>
                <h4 className="mb-1 text-sm font-medium">Token</h4>
                <div className="relative">
                  <SyntaxHighlighter
                    language="bash"
                    style={atomDark}
                    wrapLongLines
                    customStyle={{
                      margin: 0,
                      borderRadius: "0.75rem",
                      background: "#0a0a0a",
                      padding: "0.75rem",
                      maxHeight: "12rem",
                      overflow: "auto",
                      minWidth: "min(100%, 20rem)",
                    }}
                    codeTagProps={{
                      style: {
                        whiteSpace: "pre-wrap",
                        wordBreak: "break-word",
                        overflowWrap: "anywhere",
                      },
                    }}
                  >
                    {data?.token ?? "No token available"}
                  </SyntaxHighlighter>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="bg-background/80 group hover:bg-background/60 absolute top-2 right-2 flex h-7 w-7 cursor-pointer items-center justify-center rounded-full sm:h-8 sm:w-8"
                    onClick={() => data?.token && handleTokenCopy(data.token)}
                    disabled={!data?.token}
                  >
                    {copiedToken === data?.token ? (
                      <Check className="h-4 w-4 text-green-500" />
                    ) : (
                      <Copy className="h-4 w-4 transition-opacity group-hover:opacity-80" />
                    )}
                  </Button>
                </div>
              </div>

              {data?.kubeconfig && (
                <div>
                  <h4 className="mb-1 text-sm font-medium">Kubeconfig</h4>
                  <div className="relative">
                    <SyntaxHighlighter
                      className="w-full"
                      language="yaml"
                      style={atomDark}
                      wrapLongLines
                      customStyle={{
                        margin: 0,
                        borderRadius: "0.5rem",
                        background: "#0a0a0a",
                        padding: "0.5rem 0.75rem",
                        maxHeight: "12rem",
                        overflow: "auto",
                        fontSize: "0.75rem",
                        lineHeight: "1.1",
                        minWidth: "min(100%, 20rem)",
                      }}
                      codeTagProps={{
                        style: {
                          whiteSpace: "pre-wrap",
                          wordBreak: "break-word",
                          overflowWrap: "anywhere",
                        },
                      }}
                    >
                      {data.kubeconfig}
                    </SyntaxHighlighter>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
        <DialogFooter className="flex flex-col justify-end gap-3 sm:flex-row sm:items-center">
          {data?.kubeconfig && (
            <Button
              asChild
              variant="default"
              size="sm"
              className="w-full cursor-pointer gap-1.5 rounded-full sm:w-auto"
            >
              <Link
                href={`data:application/yaml;charset=utf-8,${encodeURIComponent(data.kubeconfig.trim() + "\n")}`}
                download={`kubeconfig-${clusterName ?? "cluster"}.yaml`}
                aria-label="Download kubeconfig"
              >
                <Download className="h-4 w-4" />
                <span>Download Kubeconfig</span>
              </Link>
            </Button>
          )}
          <Button
            variant="outline"
            className="w-full cursor-pointer rounded-full sm:w-auto"
            onClick={() => onOpenChange(false)}
          >
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
