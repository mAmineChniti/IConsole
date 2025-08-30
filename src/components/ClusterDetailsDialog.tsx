import { getStatusBadge } from "@/components/Clusters";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ClusterService } from "@/lib/requests";
import { cn } from "@/lib/utils";
import type { ClusterDetails, NodeInfo } from "@/types/ResponseInterfaces";
import { useQuery } from "@tanstack/react-query";
import {
  AlertCircle,
  Check,
  Clock,
  Copy,
  Cpu,
  HardDrive,
  Key,
  Loader2,
  Network,
  Server,
} from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export function ClusterDetailsDialog({
  isDetailsOpen,
  setIsDetailsOpen,
  selectedCluster,
}: {
  isDetailsOpen: boolean;
  setIsDetailsOpen: (open: boolean) => void;
  selectedCluster: number | undefined;
}) {
  const [copiedIp, setCopiedIp] = useState<string | undefined>(undefined);

  useEffect(() => {
    if (copiedIp) {
      const timer = setTimeout(() => setCopiedIp(undefined), 1000);
      return () => clearTimeout(timer);
    }
  }, [copiedIp]);

  const handleIpCopy = async (ip: string) => {
    try {
      if (ip) {
        await navigator.clipboard.writeText(ip);
        setCopiedIp(ip);
        toast.success("IP copied to clipboard");
      }
    } catch {
      toast.error("Failed to copy IP to clipboard. Please copy it manually.");
    }
  };

  const {
    data: clusterDetails,
    isLoading: clusterDetailsLoading,
    error: clusterDetailsError,
    isFetching,
  } = useQuery<ClusterDetails, Error>({
    queryKey: ["cluster-details", selectedCluster],
    queryFn: async () => {
      if (!selectedCluster) {
        throw new Error("No cluster ID provided");
      }
      return await ClusterService.get(selectedCluster);
    },
    enabled: isDetailsOpen && !!selectedCluster,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
  return (
    <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
      <DialogContent
        className={cn(
          "mx-4 max-w-[calc(100vw-2rem)] sm:mx-0 sm:max-w-2xl",
          "bg-card text-card-foreground border-border/50 border shadow-lg",
          "left-1/2 translate-x-[-50%] rounded-2xl",
        )}
      >
        <DialogHeader>
          <DialogTitle className="flex gap-2 items-center text-lg font-semibold">
            <Server className="w-5 h-5 text-primary" />
            {clusterDetails?.cluster_name}
          </DialogTitle>
        </DialogHeader>

        {clusterDetailsLoading && !clusterDetails ? (
          <div className="flex flex-col justify-center items-center py-12 space-y-4">
            <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              Loading cluster details...
            </p>
          </div>
        ) : isFetching ? (
          <div className="flex absolute inset-0 justify-center items-center rounded-xl bg-background/50 backdrop-blur-sm">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : clusterDetailsError ? (
          <div className="flex gap-2 items-start p-4 text-red-600 bg-red-50 rounded-md">
            <AlertCircle className="flex-shrink-0 mt-0.5 w-5 h-5" />
            <div>
              <p className="font-medium">Failed to load cluster details</p>
              <p className="mt-1 text-sm">Please try again later</p>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div className="p-3 space-y-2 rounded-lg bg-muted/30">
                <div className="flex gap-2 items-center text-sm text-muted-foreground">
                  <HardDrive className="w-4 h-4" />
                  <span>Status</span>
                </div>
                <div className="font-medium">
                  {clusterDetails?.overall_status
                    ? getStatusBadge(clusterDetails.overall_status)
                    : "UNAVAILABLE"}
                </div>
              </div>

              <div className="p-3 space-y-2 rounded-lg bg-muted/30">
                <div className="flex gap-2 items-center text-sm text-muted-foreground">
                  <Cpu className="w-4 h-4" />
                  <span>Nodes</span>
                </div>
                <div className="font-medium">
                  {clusterDetails?.nodes?.length ?? "UNAVAILABLE"} total
                </div>
              </div>

              <div className="p-3 space-y-2 rounded-lg bg-muted/30">
                <div className="flex gap-2 items-center text-sm text-muted-foreground">
                  <Clock className="w-4 h-4" />
                  <span>Created</span>
                </div>
                <div className="text-sm">
                  {clusterDetails?.created_at ?? "N/A"}
                </div>
              </div>
            </div>

            {clusterDetails?.nodes && clusterDetails?.nodes.length > 0 && (
              <div className="pt-4 border-t">
                <h3 className="flex gap-2 items-center mb-3 text-sm font-medium">
                  <HardDrive className="w-4 h-4" />
                  Nodes ({clusterDetails?.nodes?.length ?? "UNAVAILABLE"})
                </h3>
                <div className="space-y-3">
                  {clusterDetails?.nodes?.map((node: NodeInfo) => (
                    <div
                      key={node.id}
                      className={cn(
                        "rounded-lg border p-4 transition-colors",
                        "hover:bg-muted/20",
                      )}
                    >
                      <div className="flex flex-col gap-3 sm:flex-row sm:justify-between sm:items-start">
                        <div className="space-y-2">
                          <div className="flex gap-2 items-center">
                            {node?.role === "master" ? (
                              <Server className="w-4 h-4 text-amber-500" />
                            ) : (
                              <HardDrive className="w-4 h-4 text-blue-500" />
                            )}
                            <h4 className="font-medium">
                              {node?.name ?? "UNAVAILABLE"}
                            </h4>
                            <span className="py-0.5 px-2 text-xs rounded-full bg-muted text-muted-foreground">
                              {node?.role ?? "UNAVAILABLE"}
                            </span>
                          </div>

                          <div className="flex flex-wrap gap-3 items-center text-sm">
                            <div className="flex gap-1.5 items-center">
                              <div
                                className={cn(
                                  "h-2 w-2 rounded-full",
                                  node?.status === "ACTIVE"
                                    ? "bg-green-500"
                                    : "bg-red-500",
                                )}
                              />
                              <span className="capitalize">
                                {node?.status
                                  ? node.status.toLowerCase()
                                  : "unavailable"}
                              </span>
                            </div>

                            {node.floating_ip && (
                              <div className="flex gap-1 items-center text-muted-foreground">
                                <Network className="w-3.5 h-3.5" />
                                <span className="font-mono text-xs">
                                  {node.floating_ip ?? "UNAVAILABLE"}
                                </span>
                              </div>
                            )}

                            {node.ssh_key && (
                              <div className="flex gap-1 items-center text-muted-foreground">
                                <Key className="w-3.5 h-3.5" />
                                <span className="text-xs">
                                  {node.ssh_key ?? "UNAVAILABLE"}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="w-8 h-8 rounded-full cursor-pointer group"
                          onClick={() => handleIpCopy(node.floating_ip)}
                          disabled={!node.floating_ip}
                        >
                          {copiedIp === node.floating_ip ? (
                            <Check className="w-4 h-4 text-green-500" />
                          ) : (
                            <Copy className="w-4 h-4 transition-opacity group-hover:opacity-80" />
                          )}
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => setIsDetailsOpen(false)}
            className="w-full rounded-full cursor-pointer sm:w-auto"
          >
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
