import { StatusBadge } from "@/components/reusable/StatusBadge";
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
          <DialogTitle className="flex items-center gap-2 text-lg font-semibold">
            <Server className="text-primary h-5 w-5" />
            {clusterDetails?.cluster_name}
          </DialogTitle>
        </DialogHeader>

        {clusterDetailsLoading && !clusterDetails ? (
          <div className="flex flex-col items-center justify-center space-y-4 py-12">
            <Loader2 className="text-muted-foreground h-8 w-8 animate-spin" />
            <p className="text-muted-foreground text-sm">
              Loading cluster details...
            </p>
          </div>
        ) : isFetching ? (
          <div className="bg-background/50 absolute inset-0 flex items-center justify-center rounded-xl backdrop-blur-sm">
            <Loader2 className="text-primary h-8 w-8 animate-spin" />
          </div>
        ) : clusterDetailsError ? (
          <div className="flex items-start gap-2 rounded-md bg-red-50 p-4 text-red-600">
            <AlertCircle className="mt-0.5 h-5 w-5 flex-shrink-0" />
            <div>
              <p className="font-medium">Failed to load cluster details</p>
              <p className="mt-1 text-sm">Please try again later</p>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div className="bg-muted/30 space-y-2 rounded-lg p-3">
                <div className="text-muted-foreground flex items-center gap-2 text-sm">
                  <HardDrive className="h-4 w-4" />
                  <span>Status</span>
                </div>
                {clusterDetails?.overall_status && (
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">Status:</span>
                    <StatusBadge
                      status={clusterDetails.overall_status}
                      statusTextMap={{
                        ACTIVE: "ACTIVE",
                        CREATING: "BUILD",
                        UPDATING: "UPDATING",
                        DELETING: "PENDING",
                        ERROR: "ERROR",
                        STOPPED: "STOPPED",
                        FAILED: "FAILED",
                      }}
                      className="px-2 py-0.5"
                    />
                  </div>
                )}
                {!clusterDetails?.overall_status && (
                  <div className="font-medium">&quot;UNAVAILABLE&quot;</div>
                )}
              </div>

              <div className="bg-muted/30 space-y-2 rounded-lg p-3">
                <div className="text-muted-foreground flex items-center gap-2 text-sm">
                  <Cpu className="h-4 w-4" />
                  <span>Nodes</span>
                </div>
                <div className="font-medium">
                  {clusterDetails?.nodes?.length ?? "UNAVAILABLE"} total
                </div>
              </div>

              <div className="bg-muted/30 space-y-2 rounded-lg p-3">
                <div className="text-muted-foreground flex items-center gap-2 text-sm">
                  <Clock className="h-4 w-4" />
                  <span>Created</span>
                </div>
                <div className="text-sm">
                  {clusterDetails?.created_at ?? "N/A"}
                </div>
              </div>
            </div>

            {clusterDetails?.nodes && clusterDetails?.nodes.length > 0 && (
              <div className="border-t pt-4">
                <h3 className="mb-3 flex items-center gap-2 text-sm font-medium">
                  <HardDrive className="h-4 w-4" />
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
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            {node?.role === "master" ? (
                              <Server className="h-4 w-4 text-amber-500" />
                            ) : (
                              <HardDrive className="h-4 w-4 text-blue-500" />
                            )}
                            <h4 className="font-medium">
                              {node?.name ?? "UNAVAILABLE"}
                            </h4>
                            <span className="bg-muted text-muted-foreground rounded-full px-2 py-0.5 text-xs">
                              {node?.role ?? "UNAVAILABLE"}
                            </span>
                          </div>

                          <div className="flex flex-wrap items-center gap-3 text-sm">
                            <div className="flex items-center gap-1.5">
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
                              <div className="text-muted-foreground flex items-center gap-1">
                                <Network className="h-3.5 w-3.5" />
                                <span className="font-mono text-xs">
                                  {node.floating_ip ?? "UNAVAILABLE"}
                                </span>
                              </div>
                            )}

                            {node.ssh_key && (
                              <div className="text-muted-foreground flex items-center gap-1">
                                <Key className="h-3.5 w-3.5" />
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
                          className="group h-8 w-8 cursor-pointer rounded-full"
                          onClick={() =>
                            node.floating_ip && handleIpCopy(node.floating_ip)
                          }
                          disabled={!node.floating_ip}
                        >
                          {copiedIp === node.floating_ip ? (
                            <Check className="h-4 w-4 text-green-500" />
                          ) : (
                            <Copy className="h-4 w-4 transition-opacity group-hover:opacity-80" />
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
            className="w-full cursor-pointer rounded-full sm:w-auto"
          >
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
