"use client";

import { InstanceActions } from "@/components/Instances/InstanceActions";
import InstanceLogs from "@/components/Instances/InstanceLogs";
import { VM } from "@/components/Instances/VM";
import { EmptyState } from "@/components/reusable/EmptyState";
import { ErrorCard } from "@/components/reusable/ErrorCard";
import { HeaderActions } from "@/components/reusable/HeaderActions";
import { InfoCard } from "@/components/reusable/InfoCard";
import { InfoDialog } from "@/components/reusable/InfoDialog";
import { StatusBadge } from "@/components/reusable/StatusBadge";
import { XSearch } from "@/components/reusable/XSearch";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { InfraService } from "@/lib/requests";
import { cn } from "@/lib/utils";
import type {
  InstanceListItem,
  InstanceListResponse,
} from "@/types/ResponseInterfaces";
import { useQuery } from "@tanstack/react-query";
import {
  Bolt,
  ClipboardList,
  Cpu,
  HardDrive,
  MapPin,
  MemoryStick,
  Network,
  Server,
  Timer,
} from "lucide-react";
import { useEffect, useState } from "react";

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
      <div className="space-y-6 px-2 sm:px-0">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between sm:gap-0">
          <Skeleton className="h-4 w-40" />
          <div className="flex w-full items-center justify-end gap-3 sm:w-auto">
            <Skeleton className="h-9 w-9 rounded-full" />
            <Skeleton className="h-10 w-40 rounded-full" />
          </div>
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card
              key={i}
              className="bg-card text-card-foreground border-border/50 cursor-pointer rounded-xl border shadow-lg"
            >
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <Skeleton className="h-6 w-32 rounded" />
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-6 w-20 rounded-full" />
                    <Skeleton className="h-6 w-12 rounded-full" />
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="mt-2 flex flex-col gap-3">
                  <div className="flex flex-row items-center gap-3">
                    <div className="bg-muted/60 flex min-w-0 flex-1 rounded-lg p-2">
                      <div className="flex w-full items-center gap-2">
                        <Skeleton className="h-7 w-7 rounded-md" />
                        <div className="flex min-w-0 flex-1 flex-col">
                          <Skeleton className="mb-1 h-3 w-12" />
                          <Skeleton className="h-4 w-24" />
                        </div>
                      </div>
                    </div>
                    <div className="bg-muted/60 flex min-w-0 flex-1 rounded-lg p-2">
                      <div className="flex w-full items-center gap-2">
                        <Skeleton className="h-7 w-7 rounded-md" />
                        <div className="flex min-w-0 flex-1 flex-col">
                          <Skeleton className="mb-1 h-3 w-12" />
                          <Skeleton className="h-4 w-20" />
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-row items-center gap-3">
                    <div className="bg-muted/60 flex min-w-0 flex-1 rounded-lg p-2">
                      <div className="flex w-full items-center gap-2">
                        <Skeleton className="h-7 w-7 rounded-md" />
                        <div className="flex min-w-0 flex-1 flex-col">
                          <Skeleton className="mb-1 h-3 w-8" />
                          <Skeleton className="h-4 w-28" />
                        </div>
                      </div>
                    </div>
                    <div className="bg-muted/60 flex min-w-0 flex-1 rounded-lg p-2">
                      <div className="flex w-full items-center gap-2">
                        <Skeleton className="h-7 w-7 rounded-md" />
                        <div className="flex min-w-0 flex-1 flex-col">
                          <Skeleton className="mb-1 h-3 w-12" />
                          <Skeleton className="h-4 w-16" />
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
          <Skeleton className="h-9 w-40 rounded-full" />
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
        icon={<Server className="text-muted-foreground h-7 w-7" />}
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
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between sm:gap-0">
        <div className="text-muted-foreground text-sm leading-relaxed">
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

      <div className="max-w-full flex-1 sm:max-w-md">
        <XSearch
          value={search}
          onChange={setSearch}
          placeholder="Search instances..."
          aria-label="Search instances"
        />
      </div>

      {totalItems === 0 ? (
        <div className="text-muted-foreground flex min-h-32 items-center justify-center rounded-2xl border p-8 text-center">
          No instances match your search.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3">
          {visibleData.map((instance) => (
            <InfoCard
              key={instance.id}
              title={instance.instance_name}
              className="bg-card text-card-foreground border-border/50 rounded-xl border shadow-lg"
              onClick={() => handleCardClick(instance)}
              badges={
                <>
                  <StatusBadge status={instance.status} />
                  {instance.power_state?.toUpperCase() === "LOCKED" && (
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

      <InfoDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        title={dialogInstance?.instance_name ?? "Instance Details"}
        badges={
          <StatusBadge
            key="status"
            status={dialogInstance?.status ?? "unknown"}
          />
        }
        infoItems={[
          [
            {
              label: "Image",
              value: dialogInstance?.image_name ?? "Unknown",
              icon: HardDrive,
              variant: "blue",
            },
            {
              label: "Flavor",
              value: dialogInstance?.flavor ?? "N/A",
              icon: MemoryStick,
              variant: "pink",
            },
            {
              label: "IP Address",
              value: dialogInstance?.ip_address,
              icon: Network,
              variant: "teal",
            },
            {
              label: "Availability Zone",
              value: dialogInstance?.availability_zone ?? "N/A",
              icon: MapPin,
              variant: "sky",
            },

            {
              label: "Key Pair",
              value: dialogInstance?.key_pair ?? "N/A",
              icon: Cpu,
              variant: "indigo",
            },
            {
              label: "Age",
              value: dialogInstance?.age ?? "Unknown",
              icon: Timer,
              variant: "orange",
            },

            {
              label: "Power State",
              value: dialogInstance?.power_state ?? "N/A",
              icon: Bolt,
              variant: "violet",
            },
            {
              label: "Task",
              value: dialogInstance?.task ?? "N/A",
              icon: ClipboardList,
              variant: "purple",
            },
            {
              label: "Has Volume",
              value: dialogInstance?.has_volume ? "Yes" : "No",
              icon: HardDrive,
              variant: dialogInstance?.has_volume ? "emerald" : "red",
            },
          ],
        ]}
        actionButtons={
          dialogInstance && (
            <InstanceActions
              instance={dialogInstance}
              status={dialogInstance?.status}
              disabled={dialogInstance?.status === "BUILD"}
              onViewLogs={() => setViewingLogsFor(dialogInstance)}
            />
          )
        }
      />
    </div>
  );
}
