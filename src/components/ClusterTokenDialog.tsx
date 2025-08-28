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
    if (token) {
      await navigator.clipboard.writeText(token);
      setCopiedToken(token);
      toast.success("Token copied to clipboard");
    }
  };
  if (isLoading) {
    return (
      <Dialog open={isOpen} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex gap-2 items-center">
              <Server className="w-5 h-5" />
              Cluster Dashboard Access
            </DialogTitle>
            <DialogDescription>
              Use the following token to access the Kubernetes dashboard for
              this cluster.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Skeleton className="mb-1.5 w-16 h-4" />
              <Skeleton className="w-full h-10 rounded-md" />
            </div>

            <div>
              <Skeleton className="mb-1.5 w-24 h-4" />
              <div className="relative">
                <Skeleton className="w-full h-20 rounded-md" />
                <Skeleton className="absolute top-2 right-2 w-8 h-8 rounded-full" />
              </div>
            </div>

            <div>
              <Skeleton className="mb-1.5 w-14 h-4" />
              <div className="relative">
                <Skeleton className="w-full h-32 rounded-md" />
                <Skeleton className="absolute top-2 right-2 w-8 h-8 rounded-full" />
              </div>
            </div>

            <div>
              <Skeleton className="mb-1.5 w-24 h-4" />
              <Skeleton className="w-full h-32 rounded-md" />
            </div>
          </div>

          <DialogFooter className="flex justify-between pt-2">
            <Skeleton className="w-40 h-9 rounded-full" />
            <Skeleton className="w-20 h-9 rounded-full" />
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex gap-2 items-center">
            <Server className="w-5 h-5" />
            Cluster Dashboard Access
          </DialogTitle>
          <DialogDescription>
            Use the following token to access the Kubernetes dashboard for this
            cluster.
          </DialogDescription>
        </DialogHeader>
        {isLoading ? (
          <div className="space-y-4">
            {/* Master IP Skeleton */}
            <div>
              <Skeleton className="mb-1.5 w-16 h-4" />
              <Skeleton className="w-full h-10 rounded-md" />
            </div>

            {/* Dashboard URL Skeleton */}
            <div>
              <Skeleton className="mb-1.5 w-24 h-4" />
              <div className="relative">
                <Skeleton className="w-full h-20 rounded-md" />
                <Skeleton className="absolute top-2 right-2 w-8 h-8 rounded-full" />
              </div>
            </div>

            {/* Token Skeleton */}
            <div>
              <Skeleton className="mb-1.5 w-14 h-4" />
              <div className="relative">
                <Skeleton className="w-full h-32 rounded-lg" />
                <Skeleton className="absolute top-2 right-2 w-8 h-8 rounded-full" />
              </div>
            </div>

            {/* Kubeconfig Skeleton */}
            <div>
              <Skeleton className="mb-1.5 w-24 h-4" />
              <Skeleton className="w-full h-32 rounded-md" />
            </div>

            {/* Footer Buttons Skeleton */}
            <div className="flex justify-between pt-2">
              <Skeleton className="w-40 h-9 rounded-full" />
              <Skeleton className="w-20 h-9 rounded-full" />
            </div>
          </div>
        ) : undefined}
        <div className="space-y-4">
          {error ? (
            <div className="p-3 mb-4 text-sm rounded-md text-destructive bg-destructive/10">
              Failed to load dashboard token. Please try again.
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <h4 className="mb-1 text-sm font-medium">Master IP</h4>
                <div className="relative">
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

              <div>
                <h4 className="mb-1 text-sm font-medium">Dashboard URL</h4>
                <div className="relative group">
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
                    className="absolute right-2 top-1/2 p-1.5 transition-colors -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    <ExternalLink className="w-4 h-4" />
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
                    className="absolute top-2 right-2 w-8 h-8 rounded-full cursor-pointer bg-background/80 group hover:bg-background/60"
                    onClick={() => data?.token && handleTokenCopy(data.token)}
                    disabled={!data?.token}
                  >
                    {copiedToken === data?.token ? (
                      <Check className="w-4 h-4 text-green-500" />
                    ) : (
                      <Copy className="w-4 h-4 transition-opacity group-hover:opacity-80" />
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
        <DialogFooter className="flex justify-between">
          <div>
            {data?.kubeconfig && (
              <Button
                asChild
                variant="default"
                size="sm"
                className="gap-1.5 rounded-full cursor-pointer"
              >
                <Link
                  href={`data:application/yaml;charset=utf-8,${encodeURIComponent(data.kubeconfig.trim() + "\n")}`}
                  download={`kubeconfig-${clusterName ?? "cluster"}.yaml`}
                  aria-label="Download kubeconfig"
                >
                  <Download className="w-4 h-4" />
                  <span>Download Kubeconfig</span>
                </Link>
              </Button>
            )}
          </div>
          <Button
            className="rounded-full cursor-pointer"
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
