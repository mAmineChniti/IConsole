"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  HardDrive,
  Key,
  MapPin,
  MemoryStick,
  Network,
  Power,
  PowerOff,
  RefreshCw,
  RotateCcw,
  Server,
  Timer,
  Trash2,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { InfraService } from "@/lib/requests";
import type { InstanceDetailsResponse } from "@/types/ResponseInterfaces";

import { ErrorCard } from "@/components/ErrorCard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { calculateAge } from "@/lib/utils";

function InstanceActions({
  instanceId,
  status,
}: {
  instanceId: string;
  status: string;
}) {
  const queryClient = useQueryClient();

  const startMutation = useMutation({
    mutationFn: (id: string) => InfraService.startInstance(id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["instances-list"] });
      await queryClient.invalidateQueries({ queryKey: ["instances-details"] });
      toast.success("Instance started successfully");
    },
    onError: (error) => {
      toast.error(`Failed to start instance: ${error.message}`);
    },
  });

  const stopMutation = useMutation({
    mutationFn: (id: string) => InfraService.stopInstance(id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["instances-list"] });
      await queryClient.invalidateQueries({ queryKey: ["instances-details"] });
      toast.success("Instance stopped successfully");
    },
    onError: (error) => {
      toast.error(`Failed to stop instance: ${error.message}`);
    },
  });

  const rebootMutation = useMutation({
    mutationFn: (id: string) => InfraService.rebootInstance(id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["instances-list"] });
      await queryClient.invalidateQueries({ queryKey: ["instances-details"] });
      toast.success("Instance rebooted successfully");
    },
    onError: (error) => {
      toast.error(`Failed to reboot instance: ${error.message}`);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => InfraService.deleteInstance(id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["instances-list"] });
      await queryClient.invalidateQueries({ queryKey: ["instances-details"] });
      toast.success("Instance deleted successfully");
    },
    onError: (error) => {
      toast.error(`Failed to delete instance: ${error.message}`);
    },
  });

  const canStart = status === "SHUTOFF";
  const canStop = status === "ACTIVE";
  const canReboot = status === "ACTIVE";

  return (
    <div className="flex justify-center gap-2 pt-4 mt-4 border-t border-border/50">
      {canStart && (
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              onClick={(e) => {
                e.stopPropagation();
                startMutation.mutate(instanceId);
              }}
              disabled={startMutation.isPending}
              size="sm"
              variant="outline"
              className="cursor-pointer rounded-full group transition-all duration-200"
            >
              <Power className="h-4 w-4 mr-1 group-hover:scale-110 transition-transform duration-200" />
              Start
            </Button>
          </TooltipTrigger>
          <TooltipContent>Start the instance</TooltipContent>
        </Tooltip>
      )}

      {canStop && (
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              onClick={(e) => {
                e.stopPropagation();
                stopMutation.mutate(instanceId);
              }}
              disabled={stopMutation.isPending}
              size="sm"
              variant="outline"
              className="cursor-pointer rounded-full group transition-all duration-200"
            >
              <PowerOff className="h-4 w-4 mr-1 group-hover:scale-110 transition-transform duration-200" />
              Stop
            </Button>
          </TooltipTrigger>
          <TooltipContent>Stop the instance</TooltipContent>
        </Tooltip>
      )}

      {canReboot && (
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              onClick={(e) => {
                e.stopPropagation();
                rebootMutation.mutate(instanceId);
              }}
              disabled={rebootMutation.isPending}
              size="sm"
              variant="outline"
              className="cursor-pointer rounded-full group transition-all duration-200"
            >
              <RotateCcw className="h-4 w-4 mr-1 group-hover:rotate-180 transition-transform duration-300" />
              Reboot
            </Button>
          </TooltipTrigger>
          <TooltipContent>Reboot the instance</TooltipContent>
        </Tooltip>
      )}

      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            onClick={(e) => {
              e.stopPropagation();
              deleteMutation.mutate(instanceId);
            }}
            disabled={deleteMutation.isPending}
            size="sm"
            variant="outline"
            className="cursor-pointer rounded-full group transition-all duration-200"
          >
            <Trash2 className="h-4 w-4 mr-1 group-hover:scale-110 transition-transform duration-200" />
            Delete
          </Button>
        </TooltipTrigger>
        <TooltipContent>Delete the instance</TooltipContent>
      </Tooltip>
    </div>
  );
}

export function Instances() {
  const [selectedInstance, setSelectedInstance] = useState<
    InstanceDetailsResponse | undefined
  >(undefined);
  const [visibleCount, setVisibleCount] = useState(6);

  const {
    data: instanceList,
    isLoading: isLoadingList,
    error: listError,
    refetch,
    isFetching,
  } = useQuery({
    queryKey: ["instances-list"],
    queryFn: () => InfraService.listInstances(),
    refetchInterval: 15000,
    staleTime: 10000,
  });

  const { data: detailedInstances, isLoading: isLoadingDetails } = useQuery({
    queryKey: [
      "instances-details",
      instanceList,
      instanceList?.length,
      instanceList
        ?.map((i) => i.id)
        .sort()
        .join(",") ?? "",
    ],
    queryFn: async () => {
      if (!instanceList || instanceList.length === 0) return [];

      const detailPromises = instanceList.map((instance) =>
        InfraService.getInstanceDetails(instance.id),
      );

      return Promise.all(detailPromises);
    },
    enabled: !!instanceList && instanceList.length > 0,
    staleTime: 10000,
    gcTime: 5 * 60 * 1000,
  });

  const isLoading = isLoadingList || isLoadingDetails;
  const data = detailedInstances ?? [];
  const error = listError;

  const totalItems = data.length;
  const visibleData = data.slice(0, visibleCount);
  const hasMore = visibleCount < totalItems;

  const handleShowMore = () => {
    setVisibleCount((prev) => prev + 6);
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-4 w-32" />
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card
              key={i}
              className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border border-border/50"
            >
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                <div className="space-y-2">
                  <Skeleton className="h-4 w-32" />
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-4 w-4 rounded-full" />
                    <Skeleton className="h-3 w-16" />
                  </div>
                </div>
                <Skeleton className="h-6 w-16 rounded" />
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-1.5">
                      <Skeleton className="h-5 w-5 rounded" />
                      <Skeleton className="h-3 w-12" />
                    </div>
                    <div className="pl-5">
                      <Skeleton className="h-4 w-24" />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-1.5">
                      <Skeleton className="h-5 w-5 rounded" />
                      <Skeleton className="h-3 w-12" />
                    </div>
                    <div className="pl-5">
                      <Skeleton className="h-4 w-20" />
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-1.5">
                      <Skeleton className="h-5 w-5 rounded" />
                      <Skeleton className="h-3 w-8" />
                    </div>
                    <div className="pl-5">
                      <Skeleton className="h-4 w-28" />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-1.5">
                      <Skeleton className="h-5 w-5 rounded" />
                      <Skeleton className="h-3 w-12" />
                    </div>
                    <div className="pl-5">
                      <Skeleton className="h-4 w-16" />
                    </div>
                  </div>
                </div>
                <div className="flex justify-center gap-2 pt-4 mt-4 border-t border-border/50">
                  <Skeleton className="h-8 w-8 rounded-full" />
                  <Skeleton className="h-8 w-8 rounded-full" />
                  <Skeleton className="h-8 w-8 rounded-full" />
                  <Skeleton className="h-8 w-8 rounded-full" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="flex justify-center">
          <Skeleton className="h-10 w-48 rounded" />
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

  if (!data || data.length === 0) {
    return (
      <div className="space-y-6">
        <Card className="border-muted bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm">
          <CardContent className="p-8 text-center">
            <div className="flex flex-col items-center space-y-4">
              <div className="p-3 bg-muted rounded-full">
                <Server className="h-8 w-8 text-muted-foreground" />
              </div>
              <div className="space-y-2">
                <h3 className="text-lg font-semibold text-foreground">
                  No Instances Found
                </h3>
                <p className="text-sm text-muted-foreground max-w-md">
                  You don&apos;t have any instances yet. Create your first
                  instance to get started.
                </p>
              </div>
              <Button
                onClick={() => refetch()}
                disabled={isFetching}
                variant="outline"
                className="mt-4 cursor-pointer hover:bg-accent hover:text-accent-foreground transition-all duration-200"
              >
                {isFetching ? (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                    Refreshing...
                  </>
                ) : (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Refresh
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 sm:gap-0">
        <div className="text-sm text-muted-foreground">
          {totalItems} instance{totalItems !== 1 ? "s" : ""} total
          {totalItems > 0 && (
            <>
              {" • "}
              Showing {Math.min(visibleCount, totalItems)} of {totalItems}
            </>
          )}
        </div>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {visibleData.map((instance) => (
          <Card
            key={instance.id}
            className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border border-border/50 cursor-pointer"
            onClick={() => setSelectedInstance(instance)}
          >
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-semibold text-foreground truncate">
                  {instance.name}
                </CardTitle>
                <div className="flex items-center gap-2">
                  <Badge
                    variant={
                      instance.status === "ACTIVE"
                        ? "default"
                        : instance.status === "ERROR"
                          ? "destructive"
                          : "secondary"
                    }
                    className={`gap-1.5 ${
                      instance.status === "ACTIVE"
                        ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 border-green-200 dark:border-green-700"
                        : instance.status === "SHUTOFF"
                          ? "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-700"
                          : instance.status === "ERROR"
                            ? "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 border-red-200 dark:border-red-700"
                            : "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 border-yellow-200 dark:border-yellow-700"
                    }`}
                  >
                    <div
                      className={`w-1.5 h-1.5 rounded-full ${
                        instance.status === "ACTIVE"
                          ? "bg-green-500 animate-pulse"
                          : instance.status === "SHUTOFF"
                            ? "bg-gray-500 animate-pulse"
                            : instance.status === "ERROR"
                              ? "bg-red-500 animate-pulse"
                              : "bg-yellow-500 animate-pulse"
                      }`}
                    />
                    {instance.status}
                  </Badge>
                  {instance.locked && (
                    <Badge variant="outline" className="text-muted-foreground">
                      Locked
                    </Badge>
                  )}
                </div>
              </div>
              <p className="text-xs text-muted-foreground font-mono truncate mt-2 bg-muted/20 px-2 py-1 rounded-md">
                ID: {instance.id}
              </p>
            </CardHeader>

            <CardContent className="pt-0">
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1 p-2 rounded-lg bg-blue-50/50 dark:bg-blue-900/10">
                    <div className="flex items-center gap-1.5">
                      <div className="p-1 bg-blue-100 dark:bg-blue-900/30 rounded">
                        <HardDrive className="h-3 w-3 text-blue-600 dark:text-blue-400" />
                      </div>
                      <p className="text-xs font-medium text-muted-foreground">
                        Image
                      </p>
                    </div>
                    <div className="pl-5">
                      <p className="text-sm font-medium text-foreground truncate">
                        {instance.image.name}
                      </p>
                    </div>
                  </div>
                  <div className="space-y-1 p-2 rounded-lg bg-purple-50/50 dark:bg-purple-900/10">
                    <div className="flex items-center gap-1.5">
                      <div className="p-1 bg-purple-100 dark:bg-purple-900/30 rounded">
                        <MemoryStick className="h-3 w-3 text-purple-600 dark:text-purple-400" />
                      </div>
                      <p className="text-xs font-medium text-muted-foreground">
                        Flavor
                      </p>
                    </div>
                    <div className="pl-5">
                      <p className="text-sm font-medium text-foreground">
                        {instance.flavor.name}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1 p-2 rounded-lg bg-orange-50/50 dark:bg-orange-900/10">
                    <div className="flex items-center gap-1.5">
                      <div className="p-1 bg-orange-100 dark:bg-orange-900/30 rounded">
                        <Timer className="h-3 w-3 text-orange-600 dark:text-orange-400" />
                      </div>
                      <p className="text-xs font-medium text-muted-foreground">
                        Age
                      </p>
                    </div>
                    <div className="pl-5">
                      <p className="text-sm font-medium text-foreground">
                        {calculateAge(instance.created_at)}
                      </p>
                    </div>
                  </div>
                  <div className="space-y-1 p-2 rounded-lg bg-green-50/50 dark:bg-green-900/10">
                    <div className="flex items-center gap-1.5">
                      <div className="p-1 bg-green-100 dark:bg-green-900/30 rounded">
                        <Network className="h-3 w-3 text-green-600 dark:text-green-400" />
                      </div>
                      <p className="text-xs font-medium text-muted-foreground">
                        Network
                      </p>
                    </div>
                    <div className="pl-5">
                      <p className="text-sm font-medium text-foreground font-mono truncate">
                        {instance.networks.length > 0 && instance.networks[0]
                          ? instance.networks[0].ip
                          : "No IP"}
                      </p>
                    </div>
                  </div>
                </div>

                <InstanceActions
                  instanceId={instance.id}
                  status={instance.status}
                />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="flex justify-center">
        <Button
          onClick={handleShowMore}
          variant="outline"
          disabled={!hasMore}
          className={`transition-all duration-200 px-6 py-2 ${
            hasMore
              ? "hover:bg-accent hover:text-accent-foreground hover:scale-105"
              : "opacity-50 cursor-not-allowed"
          }`}
        >
          {hasMore
            ? `Show More (${Math.min(6, totalItems - visibleCount)} more)`
            : "All instances loaded"}
        </Button>
      </div>

      <Dialog
        open={!!selectedInstance}
        onOpenChange={() => setSelectedInstance(undefined)}
      >
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border border-border/50 left-[calc(50%+8rem)] translate-x-[-50%]">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between pr-8">
              <span className="text-xl font-semibold">
                {selectedInstance?.name}
              </span>
              <Badge
                variant={
                  selectedInstance?.status === "ACTIVE"
                    ? "default"
                    : selectedInstance?.status === "ERROR"
                      ? "destructive"
                      : "secondary"
                }
                className={`gap-1.5 ${
                  selectedInstance?.status === "ACTIVE"
                    ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 border-green-200 dark:border-green-700"
                    : selectedInstance?.status === "SHUTOFF"
                      ? "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-700"
                      : selectedInstance?.status === "ERROR"
                        ? "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 border-red-200 dark:border-red-700"
                        : "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 border-yellow-200 dark:border-yellow-700"
                }`}
              >
                <div
                  className={`w-1.5 h-1.5 rounded-full ${
                    selectedInstance?.status === "ACTIVE"
                      ? "bg-green-500 animate-pulse"
                      : selectedInstance?.status === "SHUTOFF"
                        ? "bg-gray-500"
                        : selectedInstance?.status === "ERROR"
                          ? "bg-red-500"
                          : "bg-yellow-500"
                  }`}
                />
                {selectedInstance?.status}
              </Badge>
            </DialogTitle>
            <p className="text-sm text-muted-foreground font-mono mt-2">
              ID: {selectedInstance?.id}
            </p>
          </DialogHeader>

          {selectedInstance && (
            <div className="space-y-6 mt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5">
                    <div className="p-1 bg-blue-100 dark:bg-blue-900/30 rounded">
                      <HardDrive className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                    </div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Image
                    </p>
                  </div>
                  <div className="pl-6">
                    <p className="text-base font-medium text-foreground break-words">
                      {selectedInstance.image.name}
                    </p>
                    <p className="text-sm text-muted-foreground font-mono break-all">
                      ID: {selectedInstance.image.id}
                    </p>
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5">
                    <div className="p-1 bg-indigo-100 dark:bg-indigo-900/30 rounded">
                      <Server className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                    </div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Project ID
                    </p>
                  </div>
                  <div className="pl-6">
                    <p className="text-sm font-mono text-foreground break-all">
                      {selectedInstance.project_id}
                    </p>
                  </div>
                </div>
              </div>

              <Separator />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5">
                    <div className="p-1 bg-green-100 dark:bg-green-900/30 rounded">
                      <Network className="h-4 w-4 text-green-600 dark:text-green-400" />
                    </div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Networks
                    </p>
                  </div>
                  <div className="pl-6 space-y-2">
                    {selectedInstance.networks.map((network, index) => (
                      <div key={index} className="text-sm">
                        <p className="font-mono text-foreground break-all">
                          {network.ip}
                        </p>
                        <p className="text-muted-foreground">
                          {network.network} ({network.type})
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5">
                    <div className="p-1 bg-orange-100 dark:bg-orange-900/30 rounded">
                      <Timer className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                    </div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Created
                    </p>
                  </div>
                  <div className="pl-6">
                    <p className="text-base font-medium text-foreground">
                      {calculateAge(selectedInstance.created_at)}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(
                        selectedInstance.created_at,
                      ).toLocaleDateString()}{" "}
                      {new Date(
                        selectedInstance.created_at,
                      ).toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              </div>

              <Separator />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5">
                    <div className="p-1 bg-cyan-100 dark:bg-cyan-900/30 rounded">
                      <MapPin className="h-4 w-4 text-cyan-600 dark:text-cyan-400" />
                    </div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Host
                    </p>
                  </div>
                  <div className="pl-6">
                    <p className="text-base font-medium text-foreground break-words">
                      {selectedInstance.host}
                    </p>
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5">
                    <div className="p-1 bg-amber-100 dark:bg-amber-900/30 rounded">
                      <Key className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                    </div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Security Groups
                    </p>
                  </div>
                  <div className="pl-6">
                    {selectedInstance.security_groups.length > 0 ? (
                      <div className="flex flex-wrap gap-1">
                        {selectedInstance.security_groups.map(
                          (group, index) => (
                            <Badge
                              key={index}
                              variant="secondary"
                              className="bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-700"
                            >
                              {group}
                            </Badge>
                          ),
                        )}
                      </div>
                    ) : (
                      <p className="text-base text-muted-foreground">
                        No security groups
                      </p>
                    )}
                  </div>
                </div>
              </div>

              <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4">
                <div className="flex items-center gap-1.5 mb-3">
                  <div className="p-1 bg-purple-100 dark:bg-purple-900/30 rounded">
                    <MemoryStick className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                  </div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Flavor Details
                  </p>
                </div>
                <div className="pl-6 space-y-3">
                  <p className="text-lg font-medium text-foreground">
                    {selectedInstance.flavor.name}
                  </p>
                  <div className="grid grid-cols-3 gap-4 pt-2">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                        {selectedInstance.flavor.vcpus}
                      </p>
                      <p className="text-sm text-muted-foreground">vCPUs</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                        {selectedInstance.flavor.ram}
                      </p>
                      <p className="text-sm text-muted-foreground">RAM</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                        {selectedInstance.flavor.disk}
                      </p>
                      <p className="text-sm text-muted-foreground">Disk</p>
                    </div>
                  </div>
                </div>
              </div>

              {selectedInstance.volumes &&
                selectedInstance.volumes.length > 0 && (
                  <div className="bg-slate-50 dark:bg-slate-900/20 rounded-lg p-4">
                    <div className="flex items-center gap-1.5 mb-3">
                      <div className="p-1 bg-slate-100 dark:bg-slate-900/30 rounded">
                        <HardDrive className="h-4 w-4 text-slate-600 dark:text-slate-400" />
                      </div>
                      <p className="text-sm font-medium text-muted-foreground">
                        Attached Volumes
                      </p>
                    </div>
                    <div className="pl-6 space-y-3">
                      {selectedInstance.volumes.map((volume, index) => (
                        <div key={index} className="text-sm">
                          <p className="font-medium text-foreground">
                            {volume.name}
                          </p>
                          <p className="text-muted-foreground font-mono">
                            ID: {volume.id}
                          </p>
                          <p className="text-muted-foreground">
                            Size: {volume.size}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

              {selectedInstance.floating_ips.length > 0 && (
                <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
                  <div className="flex items-center gap-1.5 mb-3">
                    <div className="p-1 bg-blue-100 dark:bg-blue-900/30 rounded">
                      <Network className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                    </div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Floating IPs
                    </p>
                  </div>
                  <div className="pl-6 space-y-1">
                    {selectedInstance.floating_ips.map((ip, index) => (
                      <p
                        key={index}
                        className="text-base font-medium text-blue-600 dark:text-blue-400 font-mono break-all"
                      >
                        {ip}
                      </p>
                    ))}
                  </div>
                </div>
              )}

              <div className="pt-4">
                <InstanceActions
                  instanceId={selectedInstance.id}
                  status={selectedInstance.status}
                />
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
