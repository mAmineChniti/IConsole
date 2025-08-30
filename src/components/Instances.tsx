"use client";

import { ExtendedInstanceActions } from "@/components/ExtendedInstanceActions";
import { InstanceActions } from "@/components/InstanceActions";
import { InstanceDialog } from "@/components/InstanceDialog";
import InstanceLogs from "@/components/InstanceLogs";
import { InstanceStatusBadge } from "@/components/InstanceStatusBadge";
import { EmptyState } from "@/components/reusable/EmptyState";
import { ErrorCard } from "@/components/reusable/ErrorCard";
import { HeaderActions } from "@/components/reusable/HeaderActions";
import { XSearch } from "@/components/reusable/XSearch";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { VM } from "@/components/VM";
import { InfraService } from "@/lib/requests";
import { cn } from "@/lib/utils";
import type {
  InstanceListItem,
  InstanceListResponse,
} from "@/types/ResponseInterfaces";
import { useQuery } from "@tanstack/react-query";
import { Cpu, HardDrive, Network, Server } from "lucide-react";
import { useEffect, useState } from "react";
import { InfoCard } from "./reusable/InfoCard";

export function Instances() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogInstance, setDialogInstance] = useState<
    InstanceListItem | undefined
  >(undefined);
  const [visibleCount, setVisibleCount] = useState(6);
  const [showVM, setShowVM] = useState(false);
  const [search, setSearch] = useState("");
  const [viewingLogsFor, setViewingLogsFor] = useState<
    InstanceListItem | undefined
  >(undefined);

  useEffect(() => setVisibleCount(6), [search]);

  const handleViewLogs = (instance: InstanceListItem) => {
    setViewingLogsFor(instance);
  };

  const handleBackFromLogs = () => {
    setViewingLogsFor(undefined);
  };

  const {
    data = [],
    isLoading,
    error,
    refetch,
    isFetching,
  } = useQuery<InstanceListResponse>({
    queryKey: ["instances", "details"],
    queryFn: () => InfraService.listInstances(),
    refetchInterval: 15000,
    staleTime: 10000,
    enabled: !showVM,
    gcTime: 5 * 60 * 1000,
  });

  const safeData = data ?? [];
  const q = search.trim().toLowerCase();
  const filteredInstances = q
    ? safeData.filter((instance) => {
        const fields = [
          instance.instance_name,
          instance.image_name,
          instance.flavor,
          instance.status,
          instance.ip_address,
          instance.floating_ip,
        ]
          .filter(Boolean)
          .map((s) => String(s).toLowerCase());
        return fields.some((f) => f.includes(q));
      })
    : safeData;
  const totalItems = filteredInstances.length;
  const visibleData = filteredInstances.slice(0, visibleCount);
  const hasMore = visibleCount < totalItems;

  const handleShowMore = () => {
    setVisibleCount((prev) => prev + 6);
  };

  if (viewingLogsFor) {
    return (
      <InstanceLogs instance={viewingLogsFor} onClose={handleBackFromLogs} />
    );
  }

  if (showVM) {
    return <VM onBack={() => setShowVM(false)} />;
  }

  if (isLoading) {
    return (
      <div className="px-2 space-y-6 sm:px-0">
        <div className="flex flex-col gap-2 sm:flex-row sm:gap-0 sm:justify-between sm:items-center">
          <Skeleton className="w-40 h-4" />
          <div className="flex gap-3 justify-end items-center w-full sm:w-auto">
            <Skeleton className="w-9 h-9 rounded-full" />
            <Skeleton className="w-40 h-10 rounded-full" />
          </div>
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card
              key={i}
              className="rounded-xl border shadow-lg cursor-pointer bg-card text-card-foreground border-border/50"
            >
              <CardHeader className="pb-3">
                <div className="flex justify-between items-center">
                  <Skeleton className="w-32 h-6 rounded" />
                  <div className="flex gap-2 items-center">
                    <Skeleton className="w-20 h-6 rounded-full" />
                    <Skeleton className="w-12 h-6 rounded-full" />
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="flex flex-col gap-3 mt-2">
                  <div className="flex flex-row gap-3 items-center">
                    <div className="flex flex-1 p-2 min-w-0 rounded-lg bg-muted/60">
                      <div className="flex gap-2 items-center w-full">
                        <Skeleton className="w-7 h-7 rounded-md" />
                        <div className="flex flex-col flex-1 min-w-0">
                          <Skeleton className="mb-1 w-12 h-3" />
                          <Skeleton className="w-24 h-4" />
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-1 p-2 min-w-0 rounded-lg bg-muted/60">
                      <div className="flex gap-2 items-center w-full">
                        <Skeleton className="w-7 h-7 rounded-md" />
                        <div className="flex flex-col flex-1 min-w-0">
                          <Skeleton className="mb-1 w-12 h-3" />
                          <Skeleton className="w-20 h-4" />
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-row gap-3 items-center">
                    <div className="flex flex-1 p-2 min-w-0 rounded-lg bg-muted/60">
                      <div className="flex gap-2 items-center w-full">
                        <Skeleton className="w-7 h-7 rounded-md" />
                        <div className="flex flex-col flex-1 min-w-0">
                          <Skeleton className="mb-1 w-8 h-3" />
                          <Skeleton className="w-28 h-4" />
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-1 p-2 min-w-0 rounded-lg bg-muted/60">
                      <div className="flex gap-2 items-center w-full">
                        <Skeleton className="w-7 h-7 rounded-md" />
                        <div className="flex flex-col flex-1 min-w-0">
                          <Skeleton className="mb-1 w-12 h-3" />
                          <Skeleton className="w-16 h-4" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="flex justify-center px-4 sm:px-0">
          <Skeleton className="w-40 h-9 rounded-full" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <ErrorCard
        title="Failed to Load Instances"
        message={
          "There was an error loading your instances. Please check your connection and try again."
        }
        onRetry={() => refetch()}
        isRetrying={isFetching}
      />
    );
  }

  if (!safeData || safeData.length === 0) {
    return (
      <EmptyState
        title="No instances found"
        text="You don't have any instances yet. Create your first instance to get started."
        onRefresh={() => refetch()}
        refreshing={isFetching}
        primaryLabel="Create Instance"
        onPrimary={() => setShowVM(true)}
        icon={<Server className="w-7 h-7 text-muted-foreground" />}
        variant="dashed"
      />
    );
  }

  const handleCardClick = (instance: InstanceListItem) => {
    setDialogInstance(instance);
    setDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:gap-0 sm:justify-between sm:items-center">
        <div className="text-sm leading-relaxed text-muted-foreground">
          {totalItems} instance{totalItems !== 1 ? "s" : ""} total
          {totalItems > 0 && (
            <>
              {" • "}
              Showing {Math.min(visibleCount, totalItems)} of {totalItems}
            </>
          )}
        </div>
        <HeaderActions
          onRefresh={() => refetch()}
          isRefreshing={isFetching}
          refreshTooltip="Refresh instances list"
          refreshAriaLabel="Refresh instances list"
          mainButton={{
            onClick: () => setShowVM(true),
            label: "Create Instance",
            shortLabel: "New",
            tooltip: "Add a new instance",
          }}
        />
      </div>

      <div className="flex-1 max-w-full sm:max-w-md">
        <XSearch
          value={search}
          onChange={setSearch}
          placeholder="Search instances..."
          aria-label="Search instances"
        />
      </div>

      {totalItems === 0 ? (
        <div className="flex justify-center items-center p-8 text-center rounded-2xl border text-muted-foreground min-h-32">
          No instances match your search.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3">
          {visibleData.map((instance) => (
            <InfoCard
              key={instance.id}
              title={instance.instance_name}
              className="rounded-xl border shadow-lg bg-card text-card-foreground border-border/50"
              onClick={() => handleCardClick(instance)}
              badges={
                <>
                  <InstanceStatusBadge status={instance.status} />
                  {instance.power_state === "locked" && (
                    <Badge variant="outline" className="text-muted-foreground">
                      Locked
                    </Badge>
                  )}
                </>
              }
              infoItems={[
                [
                  {
                    label: "Image",
                    value: instance.image_name || "Unknown image",
                    icon: Server,
                    variant: "blue",
                  },
                  {
                    label: "IP Address",
                    value: instance.ip_address || "No IP",
                    icon: Cpu,
                    variant: "purple",
                  },
                ],
                [
                  {
                    label: "Age",
                    value: instance.age || "Unknown",
                    icon: HardDrive,
                    variant: "amber",
                  },
                  {
                    label: "Flavor",
                    value: instance.flavor || "No Flavor",
                    icon: Network,
                    variant: "green",
                  },
                ],
              ]}
              actionButtons={
                <>
                  <InstanceActions
                    instanceId={instance.id}
                    status={instance.status}
                    disabled={instance.status === "BUILD"}
                  />
                  <ExtendedInstanceActions
                    instance={instance}
                    status={instance.status}
                    disabled={instance.status === "BUILD"}
                    onViewLogs={handleViewLogs}
                  />
                </>
              }
            />
          ))}
        </div>
      )}

      <div className="flex justify-center">
        <Button
          onClick={handleShowMore}
          variant="outline"
          disabled={!hasMore}
          className={cn(
            "bg-background text-foreground border-border rounded-full px-6 py-2 transition-all duration-200",
            hasMore
              ? "hover:bg-accent hover:text-accent-foreground hover:scale-105"
              : "cursor-not-allowed opacity-50",
          )}
        >
          {hasMore
            ? `Show More (${Math.min(6, totalItems - visibleCount)} more)`
            : "All instances loaded"}
        </Button>
      </div>

      <InstanceDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        instance={dialogInstance}
      />
    </div>
  );
}
