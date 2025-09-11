"use client";

import { EmptyState } from "@/components/reusable/EmptyState";
import { ErrorCard } from "@/components/reusable/ErrorCard";
import { HeaderActions } from "@/components/reusable/HeaderActions";
import { StatusBadge } from "@/components/reusable/StatusBadge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { InfraService } from "@/lib/requests";
import { cn } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import {
  AlertTriangle,
  CheckCircle,
  Cpu,
  FolderDot,
  HardDrive,
  MemoryStick,
  Network,
  Server,
  Users,
  XCircle,
  Zap,
} from "lucide-react";

export function Overview() {
  const { data, isLoading, error, refetch, isFetching } = useQuery({
    queryKey: ["dashboard-overview"],
    queryFn: () => InfraService.getOverview(),
    refetchInterval: 30000,
    staleTime: 15000,
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-end">
          <div className="flex gap-2">
            <Skeleton className="h-9 w-10 rounded-full" />
          </div>
        </div>
        <div className="grid gap-3 md:grid-cols-2 md:gap-4 lg:grid-cols-4 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card
              key={i}
              className="text-card-foreground border-border/50 rounded-xl border bg-neutral-50 shadow-lg dark:bg-neutral-900"
            >
              <CardContent>
                <div className="mb-3 flex items-center gap-3">
                  <Skeleton className="h-12 w-12 rounded-full" />
                  <Skeleton className="h-6 w-32" />
                </div>
                <div className="text-center">
                  <Skeleton className="mx-auto mb-1 h-8 w-24" />
                  <Skeleton className="mx-auto h-4 w-32" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 gap-3 md:gap-4 lg:grid-cols-2 xl:grid-cols-2">
          {Array.from({ length: 2 }).map((_, i) => (
            <Card
              key={i}
              className="text-card-foreground border-border/50 w-full rounded-xl border bg-neutral-50 shadow-lg dark:bg-neutral-900"
            >
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Skeleton className="h-8 w-8 rounded-full" />
                  <Skeleton className="h-5 w-32" />
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-8 w-16" />
                </div>
                <Separator />
                <div className="flex justify-between">
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Skeleton className="h-3 w-3 rounded-full" />
                      <Skeleton className="h-4 w-24" />
                    </div>
                    <div className="flex items-center gap-2">
                      <Skeleton className="h-3 w-3 rounded-full" />
                      <Skeleton className="h-4 w-24" />
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Skeleton className="h-3 w-3 rounded-full" />
                      <Skeleton className="h-4 w-24" />
                    </div>
                    <div className="flex items-center gap-2">
                      <Skeleton className="h-3 w-3 rounded-full" />
                      <Skeleton className="h-4 w-24" />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 gap-3 md:gap-4 lg:grid-cols-2 xl:grid-cols-2">
          {Array.from({ length: 2 }).map((_, i) => (
            <Card
              key={i}
              className="text-card-foreground border-border/50 w-full rounded-xl border bg-neutral-50 shadow-lg dark:bg-neutral-900"
            >
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Skeleton className="h-8 w-8 rounded-full" />
                  <Skeleton className="h-5 w-32" />
                </CardTitle>
              </CardHeader>
              <CardContent className="flex items-center justify-center p-6">
                <div className="relative h-40 w-40">
                  <Skeleton className="h-full w-full rounded-full" />
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <Skeleton className="mb-1 h-8 w-20" />
                    <Skeleton className="h-4 w-12" />
                  </div>
                </div>
                <div className="ml-10 space-y-3">
                  <div className="flex items-center justify-between">
                    <Skeleton className="h-4 w-16" />
                    <Skeleton className="h-4 w-12" />
                  </div>
                  <div className="flex items-center justify-between">
                    <Skeleton className="h-4 w-16" />
                    <Skeleton className="h-4 w-12" />
                  </div>
                  <div className="flex items-center justify-between">
                    <Skeleton className="h-4 w-16" />
                    <Skeleton className="h-4 w-12" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 gap-3 md:gap-4 lg:grid-cols-2 xl:grid-cols-2">
          {Array.from({ length: 2 }).map((_, i) => (
            <Card
              key={i}
              className="text-card-foreground border-border/50 w-full rounded-xl border bg-neutral-50 shadow-lg dark:bg-neutral-900"
            >
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-8 w-8 rounded-full" />
                    <Skeleton className="h-5 w-32" />
                  </div>
                  <Skeleton className="h-4 w-16" />
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {Array.from({ length: 3 }).map((_, j) => (
                    <div
                      key={j}
                      className="bg-muted/50 flex items-center justify-between rounded-xl p-3"
                    >
                      <div className="flex items-center gap-3">
                        <Skeleton className="h-4 w-4 rounded-full" />
                        <div>
                          <Skeleton className="mb-1 h-4 w-24" />
                          <Skeleton className="h-3 w-32" />
                        </div>
                      </div>
                      <div className="text-right">
                        <Skeleton className="mb-1 h-3 w-16" />
                        <Skeleton className="h-3 w-12" />
                      </div>
                    </div>
                  ))}
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
        title="Failed to Load Overview Data"
        message={
          error?.message ||
          "Unable to fetch infrastructure data. Please check your connection and try again."
        }
        onRetry={() => refetch()}
        isRetrying={isFetching}
      />
    );
  }

  if (!data) {
    return (
      <EmptyState
        title="No Data Available"
        text="Infrastructure data is not available at the moment. Please try refreshing to load the latest information."
        onRefresh={() => refetch()}
        refreshing={isFetching}
        icon={<Server className="text-muted-foreground h-7 w-7" />}
        variant="dashed"
      />
    );
  }

  const { platform_info, resources, compute_services, network_services } = data;

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <HeaderActions
          onRefresh={() => refetch()}
          isRefreshing={isFetching}
          refreshTooltip="Refresh"
          refreshAriaLabel="Refresh overview"
        />
      </div>
      <div className="grid gap-3 md:grid-cols-2 md:gap-4 lg:grid-cols-4 xl:grid-cols-4">
        <Card className="text-card-foreground border-border/50 rounded-xl border bg-neutral-50 shadow-lg dark:bg-neutral-900">
          <CardContent>
            <div className="mb-3 flex items-center gap-3">
              <div className="bg-primary/10 rounded-full p-3">
                <Server className="text-primary h-6 w-6" />
              </div>
              <h3 className="text-muted-foreground text-base font-medium">
                Compute Nodes
              </h3>
            </div>
            <div className="text-center">
              <div className="text-foreground mb-1 text-4xl font-bold">
                {platform_info.nodes}
              </div>
              <p className="text-muted-foreground text-sm">
                Active compute nodes
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="text-card-foreground border-border/50 rounded-xl border bg-neutral-50 shadow-lg dark:bg-neutral-900">
          <CardContent>
            <div className="mb-3 flex items-center gap-3">
              <div className="bg-primary/10 rounded-full p-3">
                <FolderDot className="text-primary h-6 w-6" />
              </div>
              <h3 className="text-muted-foreground text-base font-medium">
                Projects
              </h3>
            </div>
            <div className="text-center">
              <div className="text-foreground mb-1 text-4xl font-bold">
                {platform_info.projects}
              </div>
              <p className="text-muted-foreground text-sm">Total projects</p>
            </div>
          </CardContent>
        </Card>

        <Card className="text-card-foreground border-border/50 rounded-xl border bg-neutral-50 shadow-lg dark:bg-neutral-900">
          <CardContent>
            <div className="mb-3 flex items-center gap-3">
              <div className="bg-primary/10 rounded-full p-3">
                <Users className="text-primary h-6 w-6" />
              </div>
              <h3 className="text-muted-foreground text-base font-medium">
                Users
              </h3>
            </div>
            <div className="text-center">
              <div className="text-foreground mb-1 text-4xl font-bold">
                {platform_info.users}
              </div>
              <p className="text-muted-foreground text-sm">Registered users</p>
            </div>
          </CardContent>
        </Card>

        <Card className="text-card-foreground border-border/50 rounded-xl border bg-neutral-50 shadow-lg dark:bg-neutral-900">
          <CardContent>
            <div className="mb-3 flex items-center gap-3">
              <div
                className={cn(
                  "rounded-full p-3",
                  platform_info.hypervisor_errors.length > 0
                    ? "bg-destructive/10"
                    : "bg-green-100 dark:bg-green-900/30",
                )}
              >
                {platform_info.hypervisor_errors.length > 0 ? (
                  <AlertTriangle className="text-destructive h-6 w-6" />
                ) : (
                  <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
                )}
              </div>
              <h3 className="text-muted-foreground text-base font-medium">
                System Health
              </h3>
            </div>
            <div className="text-center">
              <div className="text-foreground mb-1 text-4xl font-bold">
                {platform_info.hypervisor_errors.length > 0
                  ? "Issues"
                  : "Healthy"}
              </div>
              <p className="text-muted-foreground text-sm">
                {platform_info.hypervisor_errors.length} errors detected
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-3 md:gap-4 lg:grid-cols-2 xl:grid-cols-2">
        <Card className="text-card-foreground border-border/50 w-full rounded-xl border bg-neutral-50 shadow-lg dark:bg-neutral-900">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <div className="bg-primary/10 rounded-full p-2">
                <Server className="text-primary h-5 w-5" />
              </div>
              Instance Resources
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-foreground text-base font-medium">
                Total Instances
              </span>
              <span className="text-foreground text-3xl font-bold">
                {resources.instances.total}
              </span>
            </div>
            <Separator />
            <div className="flex justify-between">
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-green-500"></div>
                  <span className="text-foreground text-base">
                    Active: {resources.instances.ACTIVE}
                  </span>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-yellow-500"></div>
                  <span className="text-foreground text-base">
                    Others: {resources.instances.OTHERS}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="text-card-foreground border-border/50 w-full rounded-xl border bg-neutral-50 shadow-lg dark:bg-neutral-900">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <div className="bg-primary/10 rounded-full p-2">
                <HardDrive className="text-primary h-5 w-5" />
              </div>
              Volume Resources
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-foreground text-base font-medium">
                Total Volumes
              </span>
              <span className="text-foreground text-3xl font-bold">
                {resources.volumes.total}
              </span>
            </div>
            <Separator />
            <div className="flex justify-between">
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <div className="bg-primary h-3 w-3 rounded-full"></div>
                  <span className="text-foreground text-base">
                    Available: {resources.volumes.available}
                  </span>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <div className="bg-muted h-3 w-3 rounded-full"></div>
                  <span className="text-foreground text-base">
                    Others: {resources.volumes.OTHERS}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-3 md:gap-4 lg:grid-cols-2 xl:grid-cols-2">
        <Card className="text-card-foreground border-border/50 w-full rounded-xl border bg-neutral-50 shadow-lg dark:bg-neutral-900">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <div className="bg-primary/10 rounded-full p-2">
                <Cpu className="text-primary h-5 w-5" />
              </div>
              CPU Usage
            </CardTitle>
          </CardHeader>
          <CardContent className="flex items-center justify-center p-6">
            <div className="relative h-40 w-40">
              <svg
                className="h-40 w-40 -rotate-90 transform"
                viewBox="0 0 36 36"
              >
                <path
                  d="M18 2.0845
                    a 15.9155 15.9155 0 0 1 0 31.831
                    a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3"
                  className="text-muted-foreground/40"
                />
                <path
                  d="M18 2.0845
                    a 15.9155 15.9155 0 0 1 0 31.831
                    a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3"
                  strokeDasharray={`${resources.cpu.usage_percent}, 100`}
                  strokeLinecap="round"
                  className="text-green-500 transition-all duration-500 ease-in-out"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-foreground text-3xl font-bold">
                  {resources.cpu.usage_percent}%
                </span>
                <span className="text-muted-foreground text-sm">CPU</span>
              </div>
            </div>
            <div className="ml-10 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground text-base">Used:</span>
                <span className="text-foreground text-base font-medium">
                  {resources.cpu.used}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground text-base">Total:</span>
                <span className="text-foreground text-base font-medium">
                  {resources.cpu.total}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground text-base">
                  Available:
                </span>
                <span className="text-foreground text-base font-medium">
                  {resources.cpu.unused}
                </span>
              </div>
              {resources.cpu.note ? (
                <p className="text-muted-foreground text-xs">
                  {resources.cpu.note}
                </p>
              ) : undefined}
            </div>
          </CardContent>
        </Card>

        <Card className="text-card-foreground border-border/50 w-full rounded-xl border bg-neutral-50 shadow-lg dark:bg-neutral-900">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <div className="bg-primary/10 rounded-full p-2">
                <MemoryStick className="text-primary h-5 w-5" />
              </div>
              RAM Usage
            </CardTitle>
          </CardHeader>
          <CardContent className="flex items-center justify-center p-6">
            <div className="relative h-40 w-40">
              <svg
                className="h-40 w-40 -rotate-90 transform"
                viewBox="0 0 36 36"
              >
                <path
                  d="M18 2.0845
                    a 15.9155 15.9155 0 0 1 0 31.831
                    a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3"
                  className="text-muted-foreground/40"
                />
                <path
                  d="M18 2.0845
                    a 15.9155 15.9155 0 0 1 0 31.831
                    a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3"
                  strokeDasharray={`${resources.ram.usage_percent}, 100`}
                  strokeLinecap="round"
                  className="text-green-500 transition-all duration-500 ease-in-out"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-foreground text-3xl font-bold">
                  {resources.ram.usage_percent}%
                </span>
                <span className="text-muted-foreground text-sm">RAM</span>
              </div>
            </div>
            <div className="ml-10 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground text-base">Used:</span>
                <span className="text-foreground text-base font-medium">
                  {resources.ram.used} GB
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground text-base">Total:</span>
                <span className="text-foreground text-base font-medium">
                  {resources.ram.total} GB
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground text-base">
                  Available:
                </span>
                <span className="text-foreground text-base font-medium">
                  {resources.ram.unused} GB
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-3 md:gap-4 lg:grid-cols-2 xl:grid-cols-2">
        <Card className="text-card-foreground border-border/50 w-full rounded-xl border bg-neutral-50 shadow-lg dark:bg-neutral-900">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="bg-primary/10 rounded-full p-2">
                  <Zap className="text-primary h-5 w-5" />
                </div>
                Compute Services
              </div>
              <div className="text-muted-foreground text-sm">
                {
                  compute_services.filter(
                    (s) => s.status === "enabled" && s.state === "up",
                  ).length
                }
                /{compute_services.length} healthy
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {compute_services.map((service, index) => {
                const isHealthy =
                  service.status === "enabled" && service.state === "up";
                return (
                  <div
                    key={index}
                    className={cn(
                      "flex items-center justify-between rounded-xl p-3 transition-colors",
                      isHealthy
                        ? "bg-muted/50 hover:bg-muted/70"
                        : "bg-destructive/10 hover:bg-destructive/20",
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-2">
                        {isHealthy ? (
                          <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
                        ) : (
                          <XCircle className="text-destructive h-4 w-4" />
                        )}
                        <div
                          className={cn(
                            "h-2 w-2 animate-pulse rounded-full",
                            isHealthy ? "bg-green-500" : "bg-destructive",
                          )}
                        />
                      </div>
                      <div>
                        <p className="text-foreground text-base font-medium">
                          {service.name}
                        </p>
                        <p className="text-muted-foreground font-mono text-sm">
                          {service.host}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-right">
                      <StatusBadge
                        status={service.status}
                        statusTextMap={{
                          ENABLED: "ACTIVE",
                          DISABLED: "SHUTOFF",
                        }}
                      />
                      <StatusBadge
                        status={service.state}
                        statusTextMap={{
                          UP: "ACTIVE",
                          DOWN: "ERROR",
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        <Card className="text-card-foreground border-border/50 w-full rounded-xl border bg-neutral-50 shadow-lg dark:bg-neutral-900">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="bg-primary/10 rounded-full p-2">
                  <Network className="text-primary h-5 w-5" />
                </div>
                Network Services
              </div>
              <div className="text-muted-foreground text-sm">
                {network_services.filter((s) => s.alive).length}/
                {network_services.length} online
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {network_services.map((service, index) => {
                const isOnline = service.alive;
                return (
                  <div
                    key={index}
                    className={cn(
                      "flex items-center justify-between rounded-xl p-3 transition-colors",
                      isOnline
                        ? "bg-muted/50 hover:bg-muted/70"
                        : "bg-destructive/10 hover:bg-destructive/20",
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-2">
                        {isOnline ? (
                          <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
                        ) : (
                          <XCircle className="text-destructive h-4 w-4" />
                        )}
                        <div
                          className={cn(
                            "h-2 w-2 animate-pulse rounded-full",
                            isOnline ? "bg-green-500" : "bg-destructive",
                          )}
                        />
                      </div>
                      <div>
                        <p className="text-foreground text-base font-medium">
                          {service.name}
                        </p>
                        <p className="text-muted-foreground font-mono text-sm">
                          {service.host}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <StatusBadge status={isOnline ? "ACTIVE" : "ERROR"} />
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {platform_info.hypervisor_errors.length > 0 && (
        <Card className="border-destructive bg-destructive/5 rounded-xl border shadow-lg">
          <CardHeader>
            <CardTitle className="text-destructive flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Hypervisor Errors
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {platform_info.hypervisor_errors.map((error, index) => (
                <div
                  key={index}
                  className="bg-destructive/10 border-destructive/20 rounded-xl border p-3"
                >
                  <p className="text-destructive text-base font-medium">
                    {error}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
