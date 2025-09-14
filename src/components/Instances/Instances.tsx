"use client";

import { InstanceActions } from "@/components/Instances/InstanceActions";
import InstanceLogs from "@/components/Instances/InstanceLogs";
import { VM } from "@/components/Instances/VM";
import { EmptyState } from "@/components/reusable/EmptyState";
import { ErrorCard } from "@/components/reusable/ErrorCard";
import { HeaderActions } from "@/components/reusable/HeaderActions";
import { InfoCard } from "@/components/reusable/InfoCard";
import { StatusBadge } from "@/components/reusable/StatusBadge";
import { XSearch } from "@/components/reusable/XSearch";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { InfraService, ProjectService } from "@/lib/requests";
import { cn } from "@/lib/utils";
import type {
  InstanceDetailsResponse,
  InstanceListItem,
  InstanceListResponse,
  ProjectDetailsResponse,
} from "@/types/ResponseInterfaces";
import { useQuery } from "@tanstack/react-query";
import {
  Cpu,
  Disc3,
  Folder,
  KeyRound,
  ListChecks,
  Lock,
  MemoryStick,
  Network,
  Power,
  Server,
  Shield,
  Timer,
} from "lucide-react";
import { useEffect, useState } from "react";

export function Instances() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogInstance, setDialogInstance] = useState<
    InstanceListItem | undefined
  >(undefined);
  const [instanceId, setInstanceId] = useState<string | undefined>(undefined);
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

  const { data: fullDetails } = useQuery<InstanceDetailsResponse>({
    queryKey: ["instance", instanceId],
    queryFn: () =>
      instanceId
        ? InfraService.getInstanceDetails(instanceId)
        : Promise.reject(new Error("No instanceId provided")),
    enabled: dialogOpen && !!instanceId,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });

  const { data: projectDetails } = useQuery<ProjectDetailsResponse>({
    queryKey: ["project", fullDetails?.project_id],
    queryFn: () =>
      fullDetails?.project_id
        ? ProjectService.get(fullDetails.project_id)
        : Promise.reject(new Error("No project_id available")),
    enabled: dialogOpen && !!fullDetails?.project_id,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
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

  const handleCardClick = (instance: InstanceListItem) => {
    setDialogInstance(instance);
    setInstanceId(instance.id);
    setDialogOpen(true);
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
              className="text-card-foreground border-border/50 cursor-pointer rounded-xl border bg-neutral-50 shadow-lg dark:bg-neutral-900"
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
              className="text-card-foreground border-border/50 rounded-xl border bg-neutral-50 shadow-lg dark:bg-neutral-900"
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
                    label: "Floating IP",
                    value: instance.floating_ip || "None",
                    icon: Network,
                    variant: "indigo",
                  },
                  {
                    label: "IP Address",
                    value: instance.ip_address || "No IP",
                    icon: Network,
                    variant: "teal",
                  },
                ],
                [
                  {
                    label: "Availability Zone",
                    value: instance.availability_zone || "Unknown",
                    icon: Server,
                    variant: "orange",
                  },
                  {
                    label: "Flavor",
                    value: instance.flavor || "No Flavor",
                    icon: MemoryStick,
                    variant: "pink",
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

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="bg-card flex max-h-[85vh] max-w-4xl flex-col p-0">
          <DialogHeader className="border-b px-6 py-4">
            <div className="flex w-full items-center justify-between">
              <DialogTitle className="text-xl font-bold">
                {fullDetails?.name ??
                  dialogInstance?.instance_name ??
                  "Unknown Instance"}
              </DialogTitle>
              <div className="flex items-center gap-3">
                <StatusBadge
                  status={
                    fullDetails?.status ?? dialogInstance?.status ?? "UNKNOWN"
                  }
                />
                {/* Power state and Locked displayed alongside the status badge */}
                {dialogInstance?.power_state && (
                  <Badge
                    variant="secondary"
                    className={cn(
                      "h-6 rounded-full px-2 text-[11px]",
                      (dialogInstance.power_state || "").toUpperCase() ===
                        "ACTIVE"
                        ? "border-emerald-200 bg-emerald-100 text-emerald-700"
                        : (dialogInstance.power_state || "").toUpperCase() ===
                              "SHUTOFF" ||
                            (dialogInstance.power_state || "").toUpperCase() ===
                              "STOPPED"
                          ? "border-slate-200 bg-slate-100 text-slate-700"
                          : (dialogInstance.power_state || "").toUpperCase() ===
                              "ERROR"
                            ? "border-red-200 bg-red-100 text-red-700"
                            : [
                                  "PAUSED",
                                  "SUSPENDED",
                                  "REBOOT",
                                  "BUILD",
                                  "PENDING",
                                ].includes(
                                  (
                                    dialogInstance.power_state || ""
                                  ).toUpperCase(),
                                )
                              ? "border-blue-200 bg-blue-100 text-blue-700"
                              : "border-slate-200 bg-slate-100 text-slate-700",
                    )}
                  >
                    <Power className="mr-1 h-3 w-3" />
                    {dialogInstance.power_state}
                  </Badge>
                )}
                {typeof fullDetails?.locked !== "undefined" &&
                  (fullDetails.locked ? (
                    <Badge variant="outline" className="h-6 px-2 text-[11px]">
                      <Lock className="mr-1 h-3 w-3" /> Locked
                    </Badge>
                  ) : (
                    <Badge variant="secondary" className="h-6 px-2 text-[11px]">
                      Unlocked
                    </Badge>
                  ))}
              </div>
            </div>
          </DialogHeader>

          <div className="flex-1 space-y-6 overflow-y-auto px-6 py-4">
            <Card>
              <CardHeader>
                <h3 className="flex items-center gap-2 text-lg font-semibold">
                  <Server className="text-muted-foreground h-5 w-5" />
                  System Information
                </h3>
              </CardHeader>
              <CardContent className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                <div className="bg-muted/60 flex min-h-[48px] items-center gap-3 rounded-lg p-2">
                  <span className="inline-flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-md bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400">
                    <Server className="h-4 w-4" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-muted-foreground text-[11px] font-medium">
                      Image
                    </p>
                    <p className="text-xs leading-tight font-normal">
                      {fullDetails?.image?.name ??
                        dialogInstance?.image_name ??
                        "Unknown"}
                    </p>
                  </div>
                </div>
                <div className="bg-muted/60 flex min-h-[48px] items-center gap-3 rounded-lg p-2">
                  <span className="inline-flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-md bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400">
                    <Network className="h-4 w-4" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-muted-foreground text-[11px] font-medium">
                      IP Address
                    </p>
                    <p className="text-xs leading-tight font-normal">
                      {fullDetails?.networks?.[0]?.ip ??
                        dialogInstance?.ip_address ??
                        "No IP"}
                    </p>
                  </div>
                </div>
                <div className="bg-muted/60 flex min-h-[48px] items-center gap-3 rounded-lg p-2">
                  <span className="inline-flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-md bg-orange-50 text-orange-600 dark:bg-orange-900/20 dark:text-orange-400">
                    <Timer className="h-4 w-4" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-muted-foreground text-[11px] font-medium">
                      Created At
                    </p>
                    <p className="text-xs leading-tight font-normal">
                      {fullDetails?.created_at ??
                        dialogInstance?.age ??
                        "Unknown"}
                    </p>
                  </div>
                </div>

                <div className="bg-muted/60 flex min-h-[48px] items-center gap-3 rounded-lg p-2">
                  <span className="inline-flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-md bg-slate-100 text-slate-600 dark:bg-slate-800/50 dark:text-slate-400">
                    <Server className="h-4 w-4" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-muted-foreground text-[11px] font-medium">
                      Host
                    </p>
                    <p className="text-xs leading-tight font-normal">
                      {fullDetails?.host ?? "Unknown"}
                    </p>
                  </div>
                </div>
                <div className="bg-muted/60 flex min-h-[48px] items-center gap-3 rounded-lg p-2">
                  <span className="inline-flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-md bg-slate-100 text-slate-600 dark:bg-slate-800/50 dark:text-slate-400">
                    <Server className="h-4 w-4" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-muted-foreground text-[11px] font-medium">
                      Availability Zone
                    </p>
                    <div className="mt-0.5">
                      <Badge
                        variant="secondary"
                        className="h-5 px-2 text-[10px]"
                      >
                        {dialogInstance?.availability_zone ?? "Unknown"}
                      </Badge>
                    </div>
                  </div>
                </div>
                <div className="bg-muted/60 flex min-h-[48px] items-center gap-3 rounded-lg p-2">
                  <span className="inline-flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-md bg-indigo-50 text-indigo-600 dark:bg-indigo-900/20 dark:text-indigo-400">
                    <Folder className="h-4 w-4" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-muted-foreground text-[11px] font-medium">
                      Project
                    </p>
                    <p className="text-xs leading-tight font-normal">
                      {projectDetails?.name ??
                        fullDetails?.project_id ??
                        "Unknown"}
                    </p>
                  </div>
                </div>
                <div className="bg-muted/60 flex min-h-[48px] items-center gap-3 rounded-lg p-2">
                  <span className="inline-flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-md bg-amber-50 text-amber-600 dark:bg-amber-900/20 dark:text-amber-500">
                    <KeyRound className="h-4 w-4" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-muted-foreground text-[11px] font-medium">
                      Key Pair
                    </p>
                    <div className="mt-0.5">
                      <Badge
                        variant="outline"
                        className="h-5 px-2 font-mono text-[10px]"
                      >
                        {dialogInstance?.key_pair ?? "Unknown"}
                      </Badge>
                    </div>
                  </div>
                </div>
                <div className="bg-muted/60 flex min-h-[48px] items-center gap-3 rounded-lg p-2">
                  <span className="inline-flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-md bg-amber-50 text-amber-600 dark:bg-amber-900/20 dark:text-amber-500">
                    <ListChecks className="h-4 w-4" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-muted-foreground text-[11px] font-medium">
                      Task
                    </p>
                    <p className="text-xs leading-tight font-normal">
                      {dialogInstance?.task ?? "Unknown"}
                    </p>
                  </div>
                </div>
                {/* Power State and Locked removed from System Information; now shown in header */}
                {Array.isArray(fullDetails?.security_groups) &&
                  fullDetails.security_groups.length > 0 && (
                    <div className="bg-muted/60 flex min-h-[48px] items-center gap-3 rounded-lg p-2">
                      <span className="inline-flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-md bg-sky-50 text-sky-600 dark:bg-sky-900/20 dark:text-sky-400">
                        <Shield className="h-4 w-4" />
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="text-muted-foreground text-[11px] font-medium">
                          Security Groups
                        </p>
                        <div className="mt-1 flex flex-wrap gap-1.5">
                          {fullDetails.security_groups.map(
                            (group: string, idx: number) => (
                              <Badge
                                key={`${group}-${idx}`}
                                variant="secondary"
                                className="border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-700 dark:bg-amber-900/20 dark:text-amber-400"
                              >
                                {group}
                              </Badge>
                            ),
                          )}
                        </div>
                      </div>
                    </div>
                  )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <h3 className="flex items-center gap-2 text-lg font-semibold">
                  <Cpu className="h-5 w-5 text-purple-500" />
                  Flavor Configuration
                </h3>
              </CardHeader>
              <CardContent className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                <div className="flex min-h-[72px] items-center gap-3 rounded-lg bg-purple-500/10 p-3">
                  <Cpu className="h-5 w-5 flex-shrink-0 text-purple-500" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">
                      {fullDetails?.flavor?.vcpus ?? "-"}
                    </p>
                    <p className="text-muted-foreground text-xs">
                      Processing Power
                    </p>
                  </div>
                </div>
                <div className="flex min-h-[72px] items-center gap-3 rounded-lg bg-purple-500/10 p-3">
                  <MemoryStick className="h-5 w-5 flex-shrink-0 text-purple-500" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">
                      {fullDetails?.flavor?.ram ?? "-"}
                    </p>
                    <p className="text-muted-foreground text-xs">Memory</p>
                  </div>
                </div>
                <div className="flex min-h-[72px] items-center gap-3 rounded-lg bg-purple-500/10 p-3">
                  <Disc3 className="h-5 w-5 flex-shrink-0 text-purple-500" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">
                      {fullDetails?.flavor?.disk ?? "-"}
                    </p>
                    <p className="text-muted-foreground text-xs">Disk</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {(Array.isArray(fullDetails?.networks) &&
              fullDetails.networks.length > 0) ||
            (dialogInstance?.floating_ip &&
              dialogInstance.floating_ip !== "") ? (
              <Card>
                <CardHeader>
                  <h3 className="flex items-center gap-2 text-lg font-semibold">
                    <Network className="h-5 w-5 text-emerald-500" />
                    Network Information
                  </h3>
                </CardHeader>
                <CardContent className="space-y-3">
                  {Array.isArray(fullDetails?.networks) &&
                    fullDetails.networks.map((net, idx) => (
                      <div
                        key={idx}
                        className="bg-muted/60 flex items-center gap-3 rounded-lg p-2"
                      >
                        <span className="inline-flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-md bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400">
                          <Network className="h-4 w-4" />
                        </span>
                        <span className="text-xs font-medium">
                          {net.network}
                        </span>
                        <span className="text-xs">{net.ip}</span>
                        <span className="text-muted-foreground text-xs">
                          {net.type}
                        </span>
                      </div>
                    ))}
                  {Array.isArray(fullDetails?.floating_ips) &&
                  fullDetails.floating_ips.length > 0 ? (
                    fullDetails.floating_ips.map((ip, idx) => (
                      <div
                        key={idx}
                        className="bg-muted/60 flex items-center gap-3 rounded-lg p-2"
                      >
                        <span className="inline-flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-md bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400">
                          <Network className="h-4 w-4" />
                        </span>
                        <span className="text-xs font-medium">Floating IP</span>
                        <span className="text-xs">{String(ip)}</span>
                      </div>
                    ))
                  ) : dialogInstance?.floating_ip ? (
                    <div className="bg-muted/60 flex items-center gap-3 rounded-lg p-2">
                      <span className="inline-flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-md bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400">
                        <Network className="h-4 w-4" />
                      </span>
                      <span className="text-xs font-medium">Floating IP</span>
                      <span className="text-xs">
                        {dialogInstance.floating_ip}
                      </span>
                    </div>
                  ) : (
                    <div className="text-muted-foreground text-xs">N/A</div>
                  )}
                </CardContent>
              </Card>
            ) : undefined}

            <Card>
              <CardHeader>
                <h3 className="flex items-center gap-2 text-lg font-semibold">
                  <Disc3 className="h-5 w-5 text-blue-500" />
                  Attached Volumes
                </h3>
              </CardHeader>
              <CardContent>
                {dialogInstance?.has_volume ? (
                  <div className="border-border/60 text-foreground/80 flex min-h-24 items-center justify-center rounded-xl border-2 border-dashed p-3 text-center text-xs">
                    <div className="flex items-center gap-2">
                      <Disc3 className="h-4 w-4 text-blue-500" />
                      <span>Volumes attached</span>
                    </div>
                  </div>
                ) : (
                  <div className="text-muted-foreground/80 border-border/60 flex min-h-24 items-center justify-center rounded-xl border-2 border-dashed p-3 text-center text-xs">
                    No volumes attached
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {dialogInstance && (
            <div className="flex items-center justify-center gap-3 border-t px-6 py-4">
              <InstanceActions
                instance={dialogInstance}
                status={dialogInstance.status}
                disabled={dialogInstance.status === "BUILD"}
                onViewLogs={handleViewLogs}
              />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
