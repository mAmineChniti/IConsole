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
      <div className="space-y-6 px-2 sm:px-0">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0">
          <Skeleton className="h-4 w-40" />
          <div className="flex gap-3 items-center justify-end w-full sm:w-auto">
            <Skeleton className="h-9 w-9 rounded-full" />
            <Skeleton className="h-10 w-40 rounded-full" />
          </div>
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card
              key={i}
              className="bg-card text-card-foreground border border-border/50 shadow-lg rounded-xl cursor-pointer"
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
                <div className="flex flex-col gap-3 mt-2">
                  <div className="flex flex-row items-center gap-3">
                    <div className="flex flex-1 min-w-0 bg-muted/60 rounded-lg p-2">
                      <div className="flex items-center gap-2 w-full">
                        <Skeleton className="h-7 w-7 rounded-md" />
                        <div className="flex flex-col min-w-0 flex-1">
                          <Skeleton className="h-3 w-12 mb-1" />
                          <Skeleton className="h-4 w-24" />
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-1 min-w-0 bg-muted/60 rounded-lg p-2">
                      <div className="flex items-center gap-2 w-full">
                        <Skeleton className="h-7 w-7 rounded-md" />
                        <div className="flex flex-col min-w-0 flex-1">
                          <Skeleton className="h-3 w-12 mb-1" />
                          <Skeleton className="h-4 w-20" />
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-row items-center gap-3">
                    <div className="flex flex-1 min-w-0 bg-muted/60 rounded-lg p-2">
                      <div className="flex items-center gap-2 w-full">
                        <Skeleton className="h-7 w-7 rounded-md" />
                        <div className="flex flex-col min-w-0 flex-1">
                          <Skeleton className="h-3 w-8 mb-1" />
                          <Skeleton className="h-4 w-28" />
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-1 min-w-0 bg-muted/60 rounded-lg p-2">
                      <div className="flex items-center gap-2 w-full">
                        <Skeleton className="h-7 w-7 rounded-md" />
                        <div className="flex flex-col min-w-0 flex-1">
                          <Skeleton className="h-3 w-12 mb-1" />
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
      <div className="space-y-6">
        <Card className="bg-card text-card-foreground border border-border shadow-lg rounded-xl">
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
                className="mt-4 rounded-full group transition-all duration-200 bg-background text-foreground border-border hover:bg-accent hover:text-accent-foreground"
              >
                {isFetching ? (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin group-hover:text-accent-foreground" />
                    <span className="group-hover:text-accent-foreground">
                      Refreshing...
                    </span>
                  </>
                ) : (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4 group-hover:text-accent-foreground" />
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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0">
        <div className="text-sm text-muted-foreground leading-relaxed">
          {totalItems} instance{totalItems !== 1 ? "s" : ""} total
          {totalItems > 0 && (
            <>
              {" • "}
              Showing {Math.min(visibleCount, totalItems)} of {totalItems}
            </>
          )}
        </div>
        <div className="flex gap-3 items-center justify-end w-full sm:w-auto">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                onClick={() => refetch()}
                disabled={isFetching}
                className="h-9 w-9 p-0 rounded-full bg-card text-card-foreground border border-border/50 transition-all duration-200 cursor-pointer"
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
                className="gap-2 px-4 rounded-full font-semibold shadow-md bg-primary text-primary-foreground transition-all duration-300 cursor-pointer"
              >
                <Plus className="h-4 w-4" />
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
            className="bg-card text-card-foreground border border-border/50 shadow-lg rounded-xl cursor-pointer"
            onClick={() => handleCardClick(instance)}
          >
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-semibold text-card-foreground truncate">
                  {instance.name}
                </CardTitle>
                <div className="flex items-center gap-2">
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
                  <div className="flex flex-row items-center gap-3">
                    <div className="flex flex-1 min-w-0 bg-muted/60 rounded-lg p-2">
                      <div className="flex items-center gap-2 w-full">
                        <span className="inline-flex items-center justify-center h-7 w-7 rounded-md bg-blue-100 dark:bg-blue-900/30">
                          <HardDrive className="h-4 w-4 text-blue-500 dark:text-blue-400" />
                        </span>
                        <div className="flex flex-col min-w-0">
                          <span className="text-xs text-muted-foreground font-medium">
                            Image
                          </span>
                          <span className="text-sm font-semibold text-card-foreground truncate">
                            {instance.image.name}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-1 min-w-0 bg-muted/60 rounded-lg p-2">
                      <div className="flex items-center gap-2 w-full">
                        <span className="inline-flex items-center justify-center h-7 w-7 rounded-md bg-purple-100 dark:bg-purple-900/30">
                          <MemoryStick className="h-4 w-4 text-purple-500 dark:text-purple-400" />
                        </span>
                        <div className="flex flex-col min-w-0">
                          <span className="text-xs text-muted-foreground font-medium">
                            Flavor
                          </span>
                          <span className="text-sm font-semibold text-card-foreground truncate">
                            {instance.flavor.name}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-row items-center gap-3">
                    <div className="flex flex-1 min-w-0 bg-muted/60 rounded-lg p-2">
                      <div className="flex items-center gap-2 w-full">
                        <span className="inline-flex items-center justify-center h-7 w-7 rounded-md bg-amber-100 dark:bg-amber-900/30">
                          <Timer className="h-4 w-4 text-amber-500 dark:text-amber-400" />
                        </span>
                        <div className="flex flex-col min-w-0">
                          <span className="text-xs text-muted-foreground font-medium">
                            Age
                          </span>
                          <span className="text-sm font-semibold text-card-foreground truncate">
                            {calculateAge(instance.created_at)}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-1 min-w-0 bg-muted/60 rounded-lg p-2">
                      <div className="flex items-center gap-2 w-full">
                        <span className="inline-flex items-center justify-center h-7 w-7 rounded-md bg-green-100 dark:bg-green-900/30">
                          <Network className="h-4 w-4 text-green-500 dark:text-green-400" />
                        </span>
                        <div className="flex flex-col min-w-0">
                          <span className="text-xs text-muted-foreground font-medium">
                            Network
                          </span>
                          <span className="text-sm font-semibold text-card-foreground font-mono truncate">
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
