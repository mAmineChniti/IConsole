"use client";

import { ClusterDetailsDialog } from "@/components/ClusterDetailsDialog";
import { ClusterTokenDialog } from "@/components/ClusterTokenDialog";
import { ConfirmDeleteDialog } from "@/components/ConfirmDeleteDialog";
import { CreateClusterDialog } from "@/components/CreateClusterDialog";
import { EmptyState } from "@/components/EmptyState";
import { ErrorCard } from "@/components/ErrorCard";
import { HeaderActions } from "@/components/HeaderActions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { XSearch } from "@/components/XSearch";
import { ClusterService } from "@/lib/requests";
import { cn } from "@/lib/utils";
import type { ClusterActionRequest } from "@/types/RequestInterfaces";
import type {
  ClusterListResponse,
  Clusters,
  ResourcesResponse,
} from "@/types/ResponseInterfaces";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Clock,
  Cpu,
  Info,
  Key,
  Plus,
  Power,
  PowerOff,
  Server,
  Trash2,
} from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export const getStatusBadge = (status: string) => {
  const statusMap: Record<string, { bg: string; text: string }> = {
    ACTIVE: { bg: "bg-green-100", text: "text-green-800" },
    CREATING: { bg: "bg-blue-100", text: "text-blue-800" },
    UPDATING: { bg: "bg-blue-100", text: "text-blue-800" },
    DELETING: { bg: "bg-yellow-100", text: "text-yellow-800" },
    ERROR: { bg: "bg-red-100", text: "text-red-800" },
    STOPPED: { bg: "bg-gray-100", text: "text-gray-800" },
  };

  const { bg = "bg-gray-100", text = "text-gray-800" } =
    statusMap[status] ?? {};

  return (
    <span
      className={cn(
        "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium",
        bg,
        text,
      )}
    >
      {status ?? "UNKNOWN"}
    </span>
  );
};

const canStart = (status: string) => {
  return ["stopped", "failed", "error"].includes(status?.toLowerCase());
};

const canStop = (status: string) => {
  return ["running", "active"].includes(status?.toLowerCase());
};

export function Clusters() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isTokenDialogOpen, setIsTokenDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedClusterId, setSelectedClusterId] = useState<
    number | undefined
  >(undefined);
  const [clusterToDelete, setClusterToDelete] = useState<
    { id: number; name?: string } | undefined
  >(undefined);
  const [resources, setResources] = useState<ResourcesResponse>({
    images: [],
    keypairs: [],
    flavors: [],
    networks: [],
    security_groups: [],
  });
  const [visibleCount, setVisibleCount] = useState(6);

  useEffect(() => {
    if (resources) {
      setResources(resources);
    }
  }, [resources]);

  const {
    data: clustersResponse,
    isLoading,
    error,
    refetch,
    isRefetching,
  } = useQuery<ClusterListResponse, Error>({
    queryKey: ["clusters"],
    queryFn: () => ClusterService.list(),
    enabled: true,
  });

  const clusters = clustersResponse?.clusters ?? [];

  const deleteCluster = useMutation({
    mutationFn: (data: ClusterActionRequest) => ClusterService.delete(data),
    onSuccess: async () => {
      toast.success("Cluster deletion started");
      await queryClient.invalidateQueries({ queryKey: ["clusters"] });
      setClusterToDelete(undefined);
    },
    onError: (err: Error) => {
      toast.error(`Failed to delete cluster: ${err.message}`);
    },
  });

  const startCluster = useMutation({
    mutationFn: (data: ClusterActionRequest) => ClusterService.start(data),
    onSuccess: async () => {
      toast.success("Cluster start requested");
      await queryClient.invalidateQueries({ queryKey: ["clusters"] });
    },
    onError: (err: Error) => {
      toast.error(`Failed to start cluster: ${err.message}`);
    },
  });

  const stopCluster = useMutation({
    mutationFn: (data: ClusterActionRequest) => ClusterService.stop(data),
    onSuccess: async () => {
      toast.success("Cluster stop requested");
      await queryClient.invalidateQueries({ queryKey: ["clusters"] });
    },
    onError: (err: Error) => {
      toast.error(`Failed to stop cluster: ${err.message}`);
    },
  });

  const handleClusterAction = (clusterId: number, action: string) => {
    const cluster = clusters.find((c) => c.cluster_id === clusterId);
    if (!cluster) return;

    switch (action) {
      case "start":
        startCluster.mutate({ cluster_id: clusterId });
        break;
      case "stop":
        stopCluster.mutate({ cluster_id: clusterId });
        break;
      case "delete":
        setClusterToDelete({
          id: clusterId,
          name: cluster.cluster_name,
        });
        setIsDeleteDialogOpen(true);
        break;
    }
  };

  const handleCardClick = (clusterId: number) => {
    setSelectedClusterId(clusterId);
    setIsDetailsOpen(true);
  };

  const handleTokenClick = (e: React.MouseEvent, clusterId: number) => {
    e.stopPropagation();
    setSelectedClusterId(clusterId);
    setIsTokenDialogOpen(true);
  };

  useEffect(() => setVisibleCount(6), [search]);

  const filteredClusters = search.trim()
    ? clusters.filter((cluster) =>
        cluster.cluster_name
          .toLowerCase()
          .includes(search.toLowerCase().trim()),
      )
    : clusters;

  const totalItems = filteredClusters.length;
  const visibleData = filteredClusters.slice(0, visibleCount);
  const hasMore = visibleCount < totalItems;

  const handleShowMore = () => {
    setVisibleCount((prev) => prev + 6);
  };
  const handleDeleteCluster = () => {
    if (clusterToDelete) {
      deleteCluster.mutate(
        { cluster_id: clusterToDelete.id },
        {
          onSettled: () => {
            setIsDeleteDialogOpen(false);
            setClusterToDelete(undefined);
          },
        },
      );
    }
  };

  if (isLoading) {
    return (
      <div className="px-2 space-y-6 sm:px-0">
        <div className="flex flex-col gap-2 sm:flex-row sm:justify-between sm:items-center">
          <Skeleton className="w-40 h-8" />
          <div className="flex gap-2 items-center">
            <Skeleton className="w-32 h-9 rounded-full" />
            <Skeleton className="w-9 h-9 rounded-full" />
          </div>
        </div>

        <div className="flex flex-col gap-4 sm:flex-row sm:justify-between sm:items-center">
          <div className="relative w-full max-w-md">
            <Skeleton className="w-full h-10 rounded-full" />
          </div>
          <Skeleton className="w-full h-10 rounded-full sm:w-auto sm:min-w-[140px]" />
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, idx) => (
            <Card
              key={idx}
              className="overflow-hidden transition-shadow hover:shadow-md"
            >
              <CardHeader className="px-4 pt-4 pb-3">
                <div className="flex gap-2 justify-between items-center">
                  <Skeleton className="w-32 h-6 rounded-md" />
                  <Skeleton className="w-20 h-6 rounded-full" />
                </div>
              </CardHeader>
              <CardContent className="p-4 pt-0">
                <div className="grid grid-cols-2 gap-3">
                  {/* Master Nodes */}
                  <div className="flex p-2.5 rounded-lg bg-muted/60">
                    <div className="flex gap-3 items-center w-full">
                      <Skeleton className="w-8 h-8 rounded-md" />
                      <div className="overflow-hidden">
                        <Skeleton className="mb-1 w-16 h-3" />
                        <Skeleton className="w-8 h-4" />
                      </div>
                    </div>
                  </div>

                  {/* Worker Nodes */}
                  <div className="flex p-2.5 rounded-lg bg-muted/60">
                    <div className="flex gap-3 items-center w-full">
                      <Skeleton className="w-8 h-8 rounded-md" />
                      <div className="overflow-hidden">
                        <Skeleton className="mb-1 w-16 h-3" />
                        <Skeleton className="w-8 h-4" />
                      </div>
                    </div>
                  </div>

                  {/* Created */}
                  <div className="flex p-2.5 rounded-lg bg-muted/60">
                    <div className="flex gap-3 items-center w-full">
                      <Skeleton className="w-8 h-8 rounded-md" />
                      <div className="overflow-hidden">
                        <Skeleton className="mb-1 w-16 h-3" />
                        <Skeleton className="w-20 h-4" />
                      </div>
                    </div>
                  </div>

                  {/* Status */}
                  <div className="flex p-2.5 rounded-lg bg-muted/60">
                    <div className="flex gap-3 items-center w-full">
                      <Skeleton className="w-8 h-8 rounded-md" />
                      <div className="overflow-hidden">
                        <Skeleton className="mb-1 w-16 h-3" />
                        <Skeleton className="w-24 h-4" />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2 justify-center items-center pt-4 mt-4 border-t border-border">
                  <Skeleton className="w-16 h-8 rounded-full" />
                  <Skeleton className="w-16 h-8 rounded-full" />
                  <Skeleton className="w-16 h-8 rounded-full" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <ErrorCard
        title="Failed to Load Clusters"
        message={error instanceof Error ? error.message : String(error)}
        onRetry={() => refetch()}
        isRetrying={isRefetching}
      />
    );
  }

  if (!clusters || clusters.length === 0) {
    return (
      <>
        <EmptyState
          title="No clusters found"
          text="You don't have any clusters yet. Create your first cluster to get started."
          onRefresh={() => refetch()}
          refreshing={isRefetching}
          icon={<Cpu />}
          variant="dashed"
          primaryActions={[
            {
              label: "New Cluster",
              onClick: () => setIsCreateDialogOpen(true),
              icon: <Plus />,
            },
          ]}
        />
        <CreateClusterDialog
          open={isCreateDialogOpen}
          onOpenChange={setIsCreateDialogOpen}
          onCreated={() =>
            queryClient.invalidateQueries({ queryKey: ["clusters"] })
          }
        />
      </>
    );
  }

  return (
    <div className="px-2 space-y-6 sm:px-0">
      <div className="flex flex-col gap-2 sm:flex-row sm:gap-0 sm:justify-between sm:items-center">
        <div className="text-sm leading-relaxed text-muted-foreground">
          {totalItems} cluster{totalItems !== 1 ? "s" : ""} total
          {totalItems > 0 && (
            <>
              {" • "} Showing {filteredClusters?.length ?? 0} of {totalItems}
            </>
          )}
        </div>
        <div className="flex flex-wrap gap-2 self-end ml-auto sm:flex-nowrap sm:self-auto">
          <HeaderActions
            onRefresh={() => refetch()}
            isRefreshing={isRefetching}
            refreshTooltip="Refresh clusters"
            mainButtons={[
              {
                label: "New Cluster",
                onClick: () => setIsCreateDialogOpen(true),
                icon: <Plus />,
              },
            ]}
          />
        </div>
      </div>
      <CreateClusterDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        onCreated={() =>
          queryClient.invalidateQueries({ queryKey: ["clusters"] })
        }
      />
      <div className="flex flex-col gap-4 items-stretch sm:flex-row sm:justify-between sm:items-center">
        <div className="flex-1 max-w-full sm:max-w-md">
          <XSearch
            value={search}
            onChange={setSearch}
            placeholder="Search clusters..."
            aria-label="Search clusters"
          />
        </div>
      </div>

      <div className="w-full">
        {filteredClusters?.length === 0 ? (
          <div className="flex col-span-full justify-center items-center p-8 text-center rounded-2xl border text-muted-foreground min-h-32">
            No clusters match your search.
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 w-full sm:grid-cols-2 lg:grid-cols-3">
            {visibleData.map((cluster) => {
              const status = cluster.overall_status?.toLowerCase() ?? "";
              const showStart = canStart(status);
              const showStop = canStop(status);

              return (
                <Card
                  key={cluster.cluster_id}
                  className="flex flex-col w-full h-full rounded-xl border shadow-lg cursor-pointer bg-card text-card-foreground border-border/50"
                  onClick={() => handleCardClick(cluster.cluster_id)}
                >
                  <CardHeader className="px-4 pt-4 pb-3">
                    <div className="flex gap-2 justify-between items-center">
                      <CardTitle className="flex-1 text-base font-semibold text-card-foreground truncate">
                        {cluster.cluster_name ?? "Unnamed Cluster"}
                      </CardTitle>
                      {getStatusBadge(cluster.overall_status)}
                    </div>
                  </CardHeader>
                  <CardContent className="flex flex-col flex-1 p-4 pt-0">
                    <div className="flex-1 space-y-3">
                      <div className="grid grid-cols-2 gap-3">
                        <div className="flex p-2.5 rounded-lg bg-muted/60">
                          <div className="flex gap-3 items-center w-full">
                            <span className="inline-flex flex-shrink-0 justify-center items-center w-8 h-8 bg-blue-100 rounded-md dark:bg-blue-900/30">
                              <Cpu className="w-4 h-4 text-blue-500 dark:text-blue-400" />
                            </span>
                            <div className="overflow-hidden">
                              <span className="block text-xs font-medium text-muted-foreground truncate">
                                Master Nodes
                              </span>
                              <span className="block text-sm font-semibold text-card-foreground truncate">
                                {cluster.master_count ?? 0}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex p-2.5 rounded-lg bg-muted/60">
                          <div className="flex gap-3 items-center w-full">
                            <span className="inline-flex flex-shrink-0 justify-center items-center w-8 h-8 bg-purple-100 rounded-md dark:bg-purple-900/30">
                              <Server className="w-4 h-4 text-purple-500 dark:text-purple-400" />
                            </span>
                            <div className="overflow-hidden">
                              <span className="block text-xs font-medium text-muted-foreground truncate">
                                Worker Nodes
                              </span>
                              <span className="block text-sm font-semibold text-card-foreground truncate">
                                {cluster.worker_count ?? 0}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex p-2.5 rounded-lg bg-muted/60">
                          <div className="flex gap-3 items-center w-full">
                            <span className="inline-flex flex-shrink-0 justify-center items-center w-8 h-8 bg-green-100 rounded-md dark:bg-green-900/30">
                              <Clock className="w-4 h-4 text-green-500 dark:text-green-400" />
                            </span>
                            <div className="overflow-hidden">
                              <span className="block text-xs font-medium text-muted-foreground truncate">
                                Created
                              </span>
                              <span className="block text-sm font-semibold text-card-foreground truncate">
                                {cluster.created_at
                                  ? new Date(
                                      cluster.created_at,
                                    ).toLocaleDateString()
                                  : "N/A"}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex p-2.5 rounded-lg bg-muted/60">
                          <div className="flex gap-3 items-center w-full">
                            <span className="inline-flex flex-shrink-0 justify-center items-center w-8 h-8 bg-amber-100 rounded-md dark:bg-amber-900/30">
                              <Info className="w-4 h-4 text-amber-500 dark:text-amber-400" />
                            </span>
                            <div className="overflow-hidden">
                              <span className="block text-xs font-medium text-muted-foreground truncate">
                                Status
                              </span>
                              <span className="block text-sm font-semibold capitalize text-card-foreground truncate">
                                {status}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2 justify-center items-center pt-4 mt-4 border-t border-border">
                      <div className="flex gap-2">
                        {showStart && (
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                                className="px-3 h-8 rounded-full transition-all duration-200 cursor-pointer group bg-background text-foreground border-border hover:bg-accent hover:text-accent-foreground"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleClusterAction(
                                    cluster.cluster_id,
                                    "start",
                                  );
                                }}
                                disabled={startCluster.isPending}
                              >
                                <Power className="mr-1.5 w-3.5 h-3.5 transition-colors duration-200 group-hover:text-accent-foreground" />
                                <span className="text-xs font-medium transition-colors duration-200 group-hover:text-accent-foreground">
                                  Start
                                </span>
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>Start the cluster</TooltipContent>
                          </Tooltip>
                        )}
                        {showStop && (
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                                className="px-3 h-8 rounded-full transition-all duration-200 cursor-pointer group bg-background text-foreground border-border hover:bg-accent hover:text-accent-foreground"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleClusterAction(
                                    cluster.cluster_id,
                                    "stop",
                                  );
                                }}
                                disabled={stopCluster.isPending}
                              >
                                <PowerOff className="mr-1.5 w-3.5 h-3.5 transition-colors duration-200 group-hover:text-accent-foreground" />
                                <span className="text-xs font-medium transition-colors duration-200 group-hover:text-accent-foreground">
                                  Stop
                                </span>
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>Stop the cluster</TooltipContent>
                          </Tooltip>
                        )}
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              className="px-3 h-8 rounded-full transition-all duration-200 cursor-pointer group bg-background text-foreground border-border hover:bg-accent hover:text-accent-foreground"
                              onClick={(e) =>
                                handleTokenClick(e, cluster.cluster_id)
                              }
                              title="Get Dashboard Token"
                            >
                              <Key className="mr-1.5 w-3.5 h-3.5 transition-colors duration-200 group-hover:text-accent-foreground" />
                              <span className="text-xs font-medium transition-colors duration-200 group-hover:text-accent-foreground">
                                Token
                              </span>
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Get Dashboard Token</TooltipContent>
                        </Tooltip>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="destructive"
                              size="sm"
                              className="gap-1.5 px-3 h-8 text-xs font-medium rounded-full cursor-pointer"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleClusterAction(
                                  cluster.cluster_id,
                                  "delete",
                                );
                              }}
                              disabled={deleteCluster.isPending}
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              <span>Delete</span>
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Delete this cluster</TooltipContent>
                        </Tooltip>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
      {totalItems > 0 && (
        <div className="flex justify-center px-4 sm:px-0">
          <Button
            onClick={handleShowMore}
            variant="outline"
            disabled={!hasMore}
            className={cn(
              "rounded-full transition-all duration-200 px-4 sm:px-6 py-2 w-full sm:w-auto max-w-xs bg-background text-foreground border border-border/50 cursor-pointer",
              hasMore ? "" : "opacity-50 cursor-not-allowed",
            )}
          >
            <span className="truncate">
              {hasMore
                ? `Show More (${totalItems - visibleCount} more)`
                : "All clusters loaded"}
            </span>
          </Button>
        </div>
      )}
      <ConfirmDeleteDialog
        open={isDeleteDialogOpen}
        onOpenChange={(open) => {
          setIsDeleteDialogOpen(open);
          if (!open) {
            setClusterToDelete(undefined);
          }
        }}
        title="Delete Cluster"
        description={
          <p>
            Are you sure you want to delete this cluster {clusterToDelete?.name}
            ? This action cannot be undone.
          </p>
        }
        confirmLabel={
          deleteCluster.isPending ? "Deleting..." : "Delete Cluster"
        }
        confirming={deleteCluster.isPending}
        onConfirm={handleDeleteCluster}
      />
      <ClusterDetailsDialog
        isDetailsOpen={isDetailsOpen}
        setIsDetailsOpen={setIsDetailsOpen}
        selectedCluster={selectedClusterId}
      />
      <ClusterTokenDialog
        clusterId={selectedClusterId}
        clusterName={
          clusters.find((c) => c.cluster_id === selectedClusterId)?.cluster_name
        }
        isOpen={isTokenDialogOpen}
        onOpenChange={setIsTokenDialogOpen}
      />
    </div>
  );
}
