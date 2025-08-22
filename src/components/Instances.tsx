"use client";

import { ErrorCard } from "@/components/ErrorCard";
import { InstanceActions } from "@/components/InstanceActions";
import { InstanceDialog } from "@/components/InstanceDialog";
import { InstanceStatusBadge } from "@/components/InstanceStatusBadge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { VM } from "@/components/VM";
import { InfraService } from "@/lib/requests";
import { calculateAge, cn } from "@/lib/utils";
import type { InstanceDetailsResponse } from "@/types/ResponseInterfaces";
import { useQuery } from "@tanstack/react-query";
import {
  HardDrive,
  MemoryStick,
  Network,
  Plus,
  RefreshCw,
  Server,
  Timer,
} from "lucide-react";
import { useState } from "react";

export function Instances() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogInstance, setDialogInstance] = useState<
    InstanceDetailsResponse | undefined
  >(undefined);
  const [visibleCount, setVisibleCount] = useState(6);
  const [showVM, setShowVM] = useState(false);

  const { data, isLoading, error, refetch, isFetching } = useQuery<
    InstanceDetailsResponse[]
  >({
    queryKey: ["instances", "details"],
    queryFn: () => InfraService.listDetails(),
    refetchInterval: 15000,
    staleTime: 10000,
    enabled: !showVM,
    gcTime: 5 * 60 * 1000,
  });

  const safeData = data ?? [];
  const totalItems = safeData.length;
  const visibleData = safeData.slice(0, visibleCount);
  const hasMore = visibleCount < totalItems;

  const handleShowMore = () => {
    setVisibleCount((prev) => prev + 6);
  };

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
      <div className="space-y-6">
        <Card className="rounded-xl border shadow-lg bg-card text-card-foreground border-border">
          <CardContent className="p-8 text-center">
            <div className="flex flex-col items-center space-y-4">
              <div className="p-3 rounded-full bg-muted">
                <Server className="w-8 h-8 text-muted-foreground" />
              </div>
              <div className="space-y-2">
                <h3 className="text-lg font-semibold text-foreground">
                  No Instances Found
                </h3>
                <p className="max-w-md text-sm text-muted-foreground">
                  You don&apos;t have any instances yet. Create your first
                  instance to get started.
                </p>
              </div>
              <Button
                onClick={() => refetch()}
                disabled={isFetching}
                variant="outline"
                className="mt-4 rounded-full transition-all duration-200 group bg-background text-foreground border-border hover:bg-accent hover:text-accent-foreground"
              >
                {isFetching ? (
                  <>
                    <RefreshCw className="mr-2 w-4 h-4 animate-spin group-hover:text-accent-foreground" />
                    <span className="group-hover:text-accent-foreground">
                      Refreshing...
                    </span>
                  </>
                ) : (
                  <>
                    <RefreshCw className="mr-2 w-4 h-4 group-hover:text-accent-foreground" />
                    <span className="group-hover:text-accent-foreground">
                      Refresh
                    </span>
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleCardClick = (instance: InstanceDetailsResponse) => {
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
        <div className="flex gap-3 justify-end items-center w-full sm:w-auto">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                onClick={() => refetch()}
                disabled={isFetching}
                className="p-0 w-9 h-9 rounded-full border transition-all duration-200 cursor-pointer bg-card text-card-foreground border-border/50"
              >
                <RefreshCw
                  className={cn(
                    "h-4 w-4 transition-transform duration-200",
                    isFetching && "animate-spin",
                  )}
                />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Refresh instances list</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                size="sm"
                onClick={() => setShowVM(true)}
                className="gap-2 px-4 font-semibold rounded-full shadow-md transition-all duration-300 cursor-pointer bg-primary text-primary-foreground"
              >
                <Plus className="w-4 h-4" />
                <span className="hidden sm:inline">Create Instance</span>
                <span className="sm:hidden">New</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>Add a new instance</TooltipContent>
          </Tooltip>
        </div>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {visibleData.map((instance) => (
          <Card
            key={instance.id}
            className="rounded-xl border shadow-lg cursor-pointer bg-card text-card-foreground border-border/50"
            onClick={() => handleCardClick(instance)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                handleCardClick(instance);
              }
            }}
          >
            <CardHeader className="pb-3">
              <div className="flex justify-between items-center">
                <CardTitle className="text-lg font-semibold text-card-foreground truncate">
                  {instance.name}
                </CardTitle>
                <div className="flex gap-2 items-center">
                  <InstanceStatusBadge status={instance.status} />
                  {instance.locked && (
                    <Badge variant="outline" className="text-muted-foreground">
                      Locked
                    </Badge>
                  )}
                </div>
              </div>
            </CardHeader>

            <CardContent className="pt-0">
              <div className="space-y-3">
                <div className="flex flex-col gap-3 mt-2">
                  <div className="flex flex-row gap-3 items-center">
                    <div className="flex flex-1 p-2 min-w-0 rounded-lg bg-muted/60">
                      <div className="flex gap-2 items-center w-full">
                        <span className="inline-flex justify-center items-center w-7 h-7 bg-blue-100 rounded-md dark:bg-blue-900/30">
                          <HardDrive className="w-4 h-4 text-blue-500 dark:text-blue-400" />
                        </span>
                        <div className="flex flex-col min-w-0">
                          <span className="text-xs font-medium text-muted-foreground">
                            Image
                          </span>
                          <span className="text-sm font-semibold text-card-foreground truncate">
                            {instance.image.name}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-1 p-2 min-w-0 rounded-lg bg-muted/60">
                      <div className="flex gap-2 items-center w-full">
                        <span className="inline-flex justify-center items-center w-7 h-7 bg-purple-100 rounded-md dark:bg-purple-900/30">
                          <MemoryStick className="w-4 h-4 text-purple-500 dark:text-purple-400" />
                        </span>
                        <div className="flex flex-col min-w-0">
                          <span className="text-xs font-medium text-muted-foreground">
                            Flavor
                          </span>
                          <span className="text-sm font-semibold text-card-foreground truncate">
                            {instance.flavor.name}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-row gap-3 items-center">
                    <div className="flex flex-1 p-2 min-w-0 rounded-lg bg-muted/60">
                      <div className="flex gap-2 items-center w-full">
                        <span className="inline-flex justify-center items-center w-7 h-7 bg-amber-100 rounded-md dark:bg-amber-900/30">
                          <Timer className="w-4 h-4 text-amber-500 dark:text-amber-400" />
                        </span>
                        <div className="flex flex-col min-w-0">
                          <span className="text-xs font-medium text-muted-foreground">
                            Age
                          </span>
                          <span className="text-sm font-semibold text-card-foreground truncate">
                            {calculateAge(instance.created_at)}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-1 p-2 min-w-0 rounded-lg bg-muted/60">
                      <div className="flex gap-2 items-center w-full">
                        <span className="inline-flex justify-center items-center w-7 h-7 bg-green-100 rounded-md dark:bg-green-900/30">
                          <Network className="w-4 h-4 text-green-500 dark:text-green-400" />
                        </span>
                        <div className="flex flex-col min-w-0">
                          <span className="text-xs font-medium text-muted-foreground">
                            Network
                          </span>
                          <span className="font-mono text-sm font-semibold text-card-foreground truncate">
                            {instance.networks.length > 0 &&
                            instance.networks[0]
                              ? instance.networks[0].ip
                              : "No IP"}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div onClick={(e) => e.stopPropagation()}>
                  <InstanceActions
                    instanceId={instance.id}
                    status={instance.status}
                    disabled={instance.status === "BUILD"}
                  />
                </div>
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
          className={`rounded-full transition-all duration-200 px-6 py-2 bg-background text-foreground border-border ${
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

      <InstanceDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        instance={dialogInstance}
      />
    </div>
  );
}
