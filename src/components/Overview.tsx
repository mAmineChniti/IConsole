"use client";

import { EmptyState } from "@/components/reusable/EmptyState";
import { ErrorCard } from "@/components/reusable/ErrorCard";
import { HeaderActions } from "@/components/reusable/HeaderActions";
import { Badge } from "@/components/ui/badge";
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
            <Skeleton className="w-10 h-9 rounded-full" />
          </div>
        </div>
        <div className="grid gap-3 md:grid-cols-2 md:gap-4 lg:grid-cols-4 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card
              key={i}
              className="rounded-xl border shadow-lg bg-card text-card-foreground border-border/50"
            >
              <CardContent>
                <div className="flex gap-3 items-center mb-3">
                  <Skeleton className="w-12 h-12 rounded-full" />
                  <Skeleton className="w-32 h-6" />
                </div>
                <div className="text-center">
                  <Skeleton className="mx-auto mb-1 w-24 h-8" />
                  <Skeleton className="mx-auto w-32 h-4" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 gap-3 md:gap-4 lg:grid-cols-2 xl:grid-cols-2">
          {Array.from({ length: 2 }).map((_, i) => (
            <Card
              key={i}
              className="w-full rounded-xl border shadow-lg bg-card text-card-foreground border-border/50"
            >
              <CardHeader>
                <CardTitle className="flex gap-2 items-center">
                  <Skeleton className="w-8 h-8 rounded-full" />
                  <Skeleton className="w-32 h-5" />
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <Skeleton className="w-24 h-4" />
                  <Skeleton className="w-16 h-8" />
                </div>
                <Separator />
                <div className="flex justify-between">
                  <div className="space-y-3">
                    <div className="flex gap-2 items-center">
                      <Skeleton className="w-3 h-3 rounded-full" />
                      <Skeleton className="w-24 h-4" />
                    </div>
                    <div className="flex gap-2 items-center">
                      <Skeleton className="w-3 h-3 rounded-full" />
                      <Skeleton className="w-24 h-4" />
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex gap-2 items-center">
                      <Skeleton className="w-3 h-3 rounded-full" />
                      <Skeleton className="w-24 h-4" />
                    </div>
                    <div className="flex gap-2 items-center">
                      <Skeleton className="w-3 h-3 rounded-full" />
                      <Skeleton className="w-24 h-4" />
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
              className="w-full rounded-xl border shadow-lg bg-card text-card-foreground border-border/50"
            >
              <CardHeader>
                <CardTitle className="flex gap-2 items-center">
                  <Skeleton className="w-8 h-8 rounded-full" />
                  <Skeleton className="w-32 h-5" />
                </CardTitle>
              </CardHeader>
              <CardContent className="flex justify-center items-center p-6">
                <div className="relative w-40 h-40">
                  <Skeleton className="w-full h-full rounded-full" />
                  <div className="flex absolute inset-0 flex-col justify-center items-center">
                    <Skeleton className="mb-1 w-20 h-8" />
                    <Skeleton className="w-12 h-4" />
                  </div>
                </div>
                <div className="ml-10 space-y-3">
                  <div className="flex justify-between items-center">
                    <Skeleton className="w-16 h-4" />
                    <Skeleton className="w-12 h-4" />
                  </div>
                  <div className="flex justify-between items-center">
                    <Skeleton className="w-16 h-4" />
                    <Skeleton className="w-12 h-4" />
                  </div>
                  <div className="flex justify-between items-center">
                    <Skeleton className="w-16 h-4" />
                    <Skeleton className="w-12 h-4" />
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
              className="w-full rounded-xl border shadow-lg bg-card text-card-foreground border-border/50"
            >
              <CardHeader>
                <CardTitle className="flex justify-between items-center">
                  <div className="flex gap-2 items-center">
                    <Skeleton className="w-8 h-8 rounded-full" />
                    <Skeleton className="w-32 h-5" />
                  </div>
                  <Skeleton className="w-16 h-4" />
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {Array.from({ length: 3 }).map((_, j) => (
                    <div
                      key={j}
                      className="flex justify-between items-center p-3 rounded-xl bg-muted/50"
                    >
                      <div className="flex gap-3 items-center">
                        <Skeleton className="w-4 h-4 rounded-full" />
                        <div>
                          <Skeleton className="mb-1 w-24 h-4" />
                          <Skeleton className="w-32 h-3" />
                        </div>
                      </div>
                      <div className="text-right">
                        <Skeleton className="mb-1 w-16 h-3" />
                        <Skeleton className="w-12 h-3" />
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
        icon={<Server className="w-7 h-7 text-muted-foreground" />}
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
        <Card className="rounded-xl border shadow-lg bg-card text-card-foreground border-border/50">
          <CardContent>
            <div className="flex gap-3 items-center mb-3">
              <div className="p-3 rounded-full bg-primary/10">
                <Server className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-base font-medium text-muted-foreground">
                Compute Nodes
              </h3>
            </div>
            <div className="text-center">
              <div className="mb-1 text-4xl font-bold text-foreground">
                {platform_info.nodes}
              </div>
              <p className="text-sm text-muted-foreground">
                Active compute nodes
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-xl border shadow-lg bg-card text-card-foreground border-border/50">
          <CardContent>
            <div className="flex gap-3 items-center mb-3">
              <div className="p-3 rounded-full bg-primary/10">
                <FolderDot className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-base font-medium text-muted-foreground">
                Projects
              </h3>
            </div>
            <div className="text-center">
              <div className="mb-1 text-4xl font-bold text-foreground">
                {platform_info.projects}
              </div>
              <p className="text-sm text-muted-foreground">Total projects</p>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-xl border shadow-lg bg-card text-card-foreground border-border/50">
          <CardContent>
            <div className="flex gap-3 items-center mb-3">
              <div className="p-3 rounded-full bg-primary/10">
                <Users className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-base font-medium text-muted-foreground">
                Users
              </h3>
            </div>
            <div className="text-center">
              <div className="mb-1 text-4xl font-bold text-foreground">
                {platform_info.users}
              </div>
              <p className="text-sm text-muted-foreground">Registered users</p>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-xl border shadow-lg bg-card text-card-foreground border-border/50">
          <CardContent>
            <div className="flex gap-3 items-center mb-3">
              <div
                className={cn(
                  "rounded-full p-3",
                  platform_info.hypervisor_errors.length > 0
                    ? "bg-destructive/10"
                    : "bg-green-100 dark:bg-green-900/30",
                )}
              >
                {platform_info.hypervisor_errors.length > 0 ? (
                  <AlertTriangle className="w-6 h-6 text-destructive" />
                ) : (
                  <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
                )}
              </div>
              <h3 className="text-base font-medium text-muted-foreground">
                System Health
              </h3>
            </div>
            <div className="text-center">
              <div className="mb-1 text-4xl font-bold text-foreground">
                {platform_info.hypervisor_errors.length > 0
                  ? "Issues"
                  : "Healthy"}
              </div>
              <p className="text-sm text-muted-foreground">
                {platform_info.hypervisor_errors.length} errors detected
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-3 md:gap-4 lg:grid-cols-2 xl:grid-cols-2">
        <Card className="w-full rounded-xl border shadow-lg bg-card text-card-foreground border-border/50">
          <CardHeader>
            <CardTitle className="flex gap-2 items-center">
              <div className="p-2 rounded-full bg-primary/10">
                <Server className="w-5 h-5 text-primary" />
              </div>
              Instance Resources
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-base font-medium text-foreground">
                Total Instances
              </span>
              <span className="text-3xl font-bold text-foreground">
                {resources.instances.total}
              </span>
            </div>
            <Separator />
            <div className="flex justify-between">
              <div className="space-y-3">
                <div className="flex gap-2 items-center">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span className="text-base text-foreground">
                    Active: {resources.instances.ACTIVE}
                  </span>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex gap-2 items-center">
                  <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                  <span className="text-base text-foreground">
                    Others: {resources.instances.OTHERS}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="w-full rounded-xl border shadow-lg bg-card text-card-foreground border-border/50">
          <CardHeader>
            <CardTitle className="flex gap-2 items-center">
              <div className="p-2 rounded-full bg-primary/10">
                <HardDrive className="w-5 h-5 text-primary" />
              </div>
              Volume Resources
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-base font-medium text-foreground">
                Total Volumes
              </span>
              <span className="text-3xl font-bold text-foreground">
                {resources.volumes.total}
              </span>
            </div>
            <Separator />
            <div className="flex justify-between">
              <div className="space-y-3">
                <div className="flex gap-2 items-center">
                  <div className="w-3 h-3 rounded-full bg-primary"></div>
                  <span className="text-base text-foreground">
                    Available: {resources.volumes.available}
                  </span>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex gap-2 items-center">
                  <div className="w-3 h-3 rounded-full bg-muted"></div>
                  <span className="text-base text-foreground">
                    Others: {resources.volumes.OTHERS}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-3 md:gap-4 lg:grid-cols-2 xl:grid-cols-2">
        <Card className="w-full rounded-xl border shadow-lg bg-card text-card-foreground border-border/50">
          <CardHeader>
            <CardTitle className="flex gap-2 items-center">
              <div className="p-2 rounded-full bg-primary/10">
                <Cpu className="w-5 h-5 text-primary" />
              </div>
              CPU Usage
            </CardTitle>
          </CardHeader>
          <CardContent className="flex justify-center items-center p-6">
            <div className="relative w-40 h-40">
              <svg
                className="w-40 h-40 transform -rotate-90"
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
              <div className="flex absolute inset-0 flex-col justify-center items-center">
                <span className="text-3xl font-bold text-foreground">
                  {resources.cpu.usage_percent}%
                </span>
                <span className="text-sm text-muted-foreground">CPU</span>
              </div>
            </div>
            <div className="ml-10 space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-base text-muted-foreground">Used:</span>
                <span className="text-base font-medium text-foreground">
                  {resources.cpu.used}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-base text-muted-foreground">Total:</span>
                <span className="text-base font-medium text-foreground">
                  {resources.cpu.total}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-base text-muted-foreground">
                  Available:
                </span>
                <span className="text-base font-medium text-foreground">
                  {resources.cpu.unused}
                </span>
              </div>
              {resources.cpu.note ? (
                <p className="text-xs text-muted-foreground">
                  {resources.cpu.note}
                </p>
              ) : undefined}
            </div>
          </CardContent>
        </Card>

        <Card className="w-full rounded-xl border shadow-lg bg-card text-card-foreground border-border/50">
          <CardHeader>
            <CardTitle className="flex gap-2 items-center">
              <div className="p-2 rounded-full bg-primary/10">
                <MemoryStick className="w-5 h-5 text-primary" />
              </div>
              RAM Usage
            </CardTitle>
          </CardHeader>
          <CardContent className="flex justify-center items-center p-6">
            <div className="relative w-40 h-40">
              <svg
                className="w-40 h-40 transform -rotate-90"
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
              <div className="flex absolute inset-0 flex-col justify-center items-center">
                <span className="text-3xl font-bold text-foreground">
                  {resources.ram.usage_percent}%
                </span>
                <span className="text-sm text-muted-foreground">RAM</span>
              </div>
            </div>
            <div className="ml-10 space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-base text-muted-foreground">Used:</span>
                <span className="text-base font-medium text-foreground">
                  {resources.ram.used} GB
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-base text-muted-foreground">Total:</span>
                <span className="text-base font-medium text-foreground">
                  {resources.ram.total} GB
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-base text-muted-foreground">
                  Available:
                </span>
                <span className="text-base font-medium text-foreground">
                  {resources.ram.unused} GB
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-3 md:gap-4 lg:grid-cols-2 xl:grid-cols-2">
        <Card className="w-full rounded-xl border shadow-lg bg-card text-card-foreground border-border/50">
          <CardHeader>
            <CardTitle className="flex justify-between items-center">
              <div className="flex gap-2 items-center">
                <div className="p-2 rounded-full bg-primary/10">
                  <Zap className="w-5 h-5 text-primary" />
                </div>
                Compute Services
              </div>
              <div className="text-sm text-muted-foreground">
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
                    <div className="flex gap-3 items-center">
                      <div className="flex gap-2 items-center">
                        {isHealthy ? (
                          <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400" />
                        ) : (
                          <XCircle className="w-4 h-4 text-destructive" />
                        )}
                        <div
                          className={cn(
                            "h-2 w-2 animate-pulse rounded-full",
                            isHealthy ? "bg-green-500" : "bg-destructive",
                          )}
                        />
                      </div>
                      <div>
                        <p className="text-base font-medium text-foreground">
                          {service.name}
                        </p>
                        <p className="font-mono text-sm text-muted-foreground">
                          {service.host}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2 items-center text-right">
                      <Badge
                        variant={
                          service.status === "enabled" ? "default" : "secondary"
                        }
                        className={cn(
                          service.status === "enabled"
                            ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                            : undefined,
                        )}
                      >
                        {service.status}
                      </Badge>
                      <Badge
                        variant={
                          service.state === "up" ? "default" : "destructive"
                        }
                        className={cn(
                          service.state === "up"
                            ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                            : "bg-destructive/10 text-destructive",
                        )}
                      >
                        {service.state}
                      </Badge>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        <Card className="w-full rounded-xl border shadow-lg bg-card text-card-foreground border-border/50">
          <CardHeader>
            <CardTitle className="flex justify-between items-center">
              <div className="flex gap-2 items-center">
                <div className="p-2 rounded-full bg-primary/10">
                  <Network className="w-5 h-5 text-primary" />
                </div>
                Network Services
              </div>
              <div className="text-sm text-muted-foreground">
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
                    <div className="flex gap-3 items-center">
                      <div className="flex gap-2 items-center">
                        {isOnline ? (
                          <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400" />
                        ) : (
                          <XCircle className="w-4 h-4 text-destructive" />
                        )}
                        <div
                          className={cn(
                            "h-2 w-2 animate-pulse rounded-full",
                            isOnline ? "bg-green-500" : "bg-destructive",
                          )}
                        />
                      </div>
                      <div>
                        <p className="text-base font-medium text-foreground">
                          {service.name}
                        </p>
                        <p className="font-mono text-sm text-muted-foreground">
                          {service.host}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge
                        variant={isOnline ? "default" : "destructive"}
                        className={cn(
                          "gap-1.5",
                          isOnline
                            ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                            : "bg-destructive/10 text-destructive",
                        )}
                      >
                        <div
                          className={cn(
                            "h-1.5 w-1.5 animate-pulse rounded-full",
                            isOnline ? "bg-green-500" : "bg-destructive",
                          )}
                        />
                        {isOnline ? "Online" : "Offline"}
                      </Badge>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {platform_info.hypervisor_errors.length > 0 && (
        <Card className="rounded-xl border shadow-lg border-destructive bg-destructive/5">
          <CardHeader>
            <CardTitle className="flex gap-2 items-center text-destructive">
              <AlertTriangle className="w-5 h-5" />
              Hypervisor Errors
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {platform_info.hypervisor_errors.map((error, index) => (
                <div
                  key={index}
                  className="p-3 rounded-xl border bg-destructive/10 border-destructive/20"
                >
                  <p className="text-base font-medium text-destructive">
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
