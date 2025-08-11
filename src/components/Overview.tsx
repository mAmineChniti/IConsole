"use client";

import { useQuery } from "@tanstack/react-query";
import {
  AlertTriangle,
  CheckCircle,
  Cpu,
  FolderDot,
  HardDrive,
  MemoryStick,
  Network,
  RefreshCw,
  Server,
  Users,
  XCircle,
  Zap,
} from "lucide-react";

import { InfraService } from "@/lib/requests";

import { ErrorCard } from "@/components/ErrorCard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";

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
        <div className="grid gap-3 md:gap-4 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card
              key={i}
              className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border border-border/50"
            >
              <CardContent>
                <div className="flex items-center gap-3 mb-3">
                  <Skeleton className="h-12 w-12 rounded-full" />
                  <Skeleton className="h-4 w-20" />
                </div>
                <div className="text-center">
                  <Skeleton className="h-8 w-16 mb-1 mx-auto" />
                  <Skeleton className="h-3 w-28 mx-auto" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid gap-3 md:gap-4 md:grid-cols-1 lg:grid-cols-2 xl:grid-cols-2">
          {Array.from({ length: 2 }).map((_, i) => (
            <Card
              key={i}
              className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border border-border/50"
            >
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Skeleton className="h-9 w-9 rounded-full" />
                  <Skeleton className="h-5 w-32" />
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-8 w-8" />
                </div>
                <Separator />
                <div className="flex justify-between">
                  <div className="space-y-3">
                    {Array.from({ length: 2 }).map((_, j) => (
                      <div key={j} className="flex items-center gap-2">
                        <Skeleton className="h-3 w-3 rounded-full" />
                        <Skeleton className="h-3 w-16" />
                      </div>
                    ))}
                  </div>
                  <div className="space-y-3">
                    {Array.from({ length: 2 }).map((_, j) => (
                      <div key={j} className="flex items-center gap-2">
                        <Skeleton className="h-3 w-3 rounded-full" />
                        <Skeleton className="h-3 w-16" />
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid gap-3 md:gap-4 md:grid-cols-1 lg:grid-cols-2 xl:grid-cols-2">
          {Array.from({ length: 2 }).map((_, i) => (
            <Card
              key={i}
              className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border border-border/50"
            >
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Skeleton className="h-9 w-9 rounded-full" />
                  <Skeleton className="h-5 w-32" />
                </CardTitle>
              </CardHeader>
              <CardContent className="flex items-center justify-center p-6">
                <div className="relative w-40 h-40">
                  <Skeleton className="w-full h-full rounded-full" />
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <Skeleton className="h-6 w-12 mb-1" />
                    <Skeleton className="h-3 w-8" />
                  </div>
                </div>
                <div className="ml-10 space-y-3">
                  {Array.from({ length: 3 }).map((_, j) => (
                    <div key={j} className="flex items-center justify-between">
                      <Skeleton className="h-3 w-12" />
                      <Skeleton className="h-3 w-8" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid gap-3 md:gap-4 md:grid-cols-1 lg:grid-cols-2 xl:grid-cols-2">
          {Array.from({ length: 2 }).map((_, i) => (
            <Card
              key={i}
              className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border border-border/50"
            >
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-9 w-9 rounded-full" />
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
                      className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
                    >
                      <div className="flex items-center gap-3">
                        <Skeleton className="h-4 w-4 rounded-full" />
                        <div>
                          <Skeleton className="h-4 w-24 mb-1" />
                          <Skeleton className="h-3 w-32" />
                        </div>
                      </div>
                      <div className="text-right">
                        <Skeleton className="h-3 w-16 mb-1" />
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
      <div className="space-y-6 px-2 sm:px-4 lg:px-6 max-w-none">
        <Card className="border-muted bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm w-full">
          <CardContent className="p-8 text-center">
            <div className="flex flex-col items-center space-y-4">
              <div className="p-3 bg-muted rounded-full">
                <Server className="h-8 w-8 text-muted-foreground" />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-semibold">No Data Available</h3>
                <p className="text-base text-muted-foreground max-w-md">
                  Infrastructure data is not available at the moment. Please try
                  refreshing to load the latest information.
                </p>
              </div>
              <Button
                onClick={() => refetch()}
                disabled={isFetching}
                variant="outline"
                className="mt-4 cursor-pointer"
              >
                {isFetching ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Loading...
                  </>
                ) : (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Refresh Data
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const { platform_info, resources, compute_services, network_services } = data;

  return (
    <div className="space-y-6">
      <div className="grid gap-3 md:gap-4 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-4">
        <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border border-border/50">
          <CardContent>
            <div className="flex items-center gap-3 mb-3">
              <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-full">
                <Server className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="text-base font-medium text-muted-foreground">
                Compute Nodes
              </h3>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-foreground mb-1">
                {platform_info.nodes}
              </div>
              <p className="text-sm text-muted-foreground">
                Active compute nodes
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border border-border/50">
          <CardContent>
            <div className="flex items-center gap-3 mb-3">
              <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-full">
                <FolderDot className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
              <h3 className="text-base font-medium text-muted-foreground">
                Projects
              </h3>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-foreground mb-1">
                {platform_info.projects}
              </div>
              <p className="text-sm text-muted-foreground">Total projects</p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border border-border/50">
          <CardContent>
            <div className="flex items-center gap-3 mb-3">
              <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-full">
                <Users className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              </div>
              <h3 className="text-base font-medium text-muted-foreground">
                Users
              </h3>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-foreground mb-1">
                {platform_info.users}
              </div>
              <p className="text-sm text-muted-foreground">Registered users</p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border border-border/50">
          <CardContent>
            <div className="flex items-center gap-3 mb-3">
              <div
                className={`p-3 rounded-full ${
                  platform_info.hypervisor_errors.length > 0
                    ? "bg-red-100 dark:bg-red-900/30"
                    : "bg-emerald-100 dark:bg-emerald-900/30"
                }`}
              >
                {platform_info.hypervisor_errors.length > 0 ? (
                  <AlertTriangle className="h-6 w-6 text-red-600 dark:text-red-400" />
                ) : (
                  <CheckCircle className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
                )}
              </div>
              <h3 className="text-base font-medium text-muted-foreground">
                System Health
              </h3>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-foreground mb-1">
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

      <div className="grid gap-3 md:gap-4 md:grid-cols-1 lg:grid-cols-2 xl:grid-cols-2">
        <Card className="w-full bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-full">
                <Server className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              Instance Resources
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-base font-medium">Total Instances</span>
              <span className="text-3xl font-bold">
                {resources.instances.total}
              </span>
            </div>
            <Separator />
            <div className="flex justify-between">
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span className="text-base">
                    Active: {resources.instances.ACTIVE}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-gray-500 rounded-full"></div>
                  <span className="text-base">
                    Stopped: {resources.instances.SHUTOFF}
                  </span>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  <span className="text-base">
                    Error: {resources.instances.ERROR}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                  <span className="text-base">
                    Others: {resources.instances.OTHERS}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="w-full bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-full">
                <HardDrive className="h-5 w-5 text-orange-600 dark:text-orange-400" />
              </div>
              Volume Resources
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-base font-medium">Total Volumes</span>
              <span className="text-3xl font-bold">
                {resources.volumes.total}
              </span>
            </div>
            <Separator />
            <div className="flex justify-between">
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                  <span className="text-base">
                    Available: {resources.volumes.available}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                  <span className="text-base">
                    In-use: {resources.volumes["in-use"]}
                  </span>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  <span className="text-base">
                    Error: {resources.volumes.error}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-gray-500 rounded-full"></div>
                  <span className="text-base">
                    Others: {resources.volumes.OTHERS}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-3 md:gap-4 md:grid-cols-1 lg:grid-cols-2 xl:grid-cols-2">
        <Card className="w-full bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-full">
                <Cpu className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              CPU Usage
            </CardTitle>
          </CardHeader>
          <CardContent className="flex items-center justify-center p-6">
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
                  className="text-blue-600 dark:text-blue-400 transition-all duration-500 ease-in-out"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-3xl font-bold text-foreground">
                  {resources.cpu.usage_percent.toFixed(1)}%
                </span>
                <span className="text-sm text-muted-foreground">CPU</span>
              </div>
            </div>
            <div className="ml-10 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-base text-muted-foreground">Used:</span>
                <span className="text-base font-medium">
                  {resources.cpu.used}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-base text-muted-foreground">Total:</span>
                <span className="text-base font-medium">
                  {resources.cpu.total}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-base text-muted-foreground">
                  Available:
                </span>
                <span className="text-base font-medium">
                  {resources.cpu.unused}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="w-full bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-full">
                <MemoryStick className="h-5 w-5 text-purple-600 dark:text-purple-400" />
              </div>
              RAM Usage
            </CardTitle>
          </CardHeader>
          <CardContent className="flex items-center justify-center p-6">
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
                  className="text-purple-600 dark:text-purple-400 transition-all duration-500 ease-in-out"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-3xl font-bold text-foreground">
                  {resources.ram.usage_percent.toFixed(1)}%
                </span>
                <span className="text-sm text-muted-foreground">RAM</span>
              </div>
            </div>
            <div className="ml-10 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-base text-muted-foreground">Used:</span>
                <span className="text-base font-medium">
                  {(resources.ram.used / 1024).toFixed(1)} GB
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-base text-muted-foreground">Total:</span>
                <span className="text-base font-medium">
                  {(resources.ram.total / 1024).toFixed(1)} GB
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-base text-muted-foreground">
                  Available:
                </span>
                <span className="text-base font-medium">
                  {(resources.ram.unused / 1024).toFixed(1)} GB
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-3 md:gap-4 md:grid-cols-1 lg:grid-cols-2 xl:grid-cols-2">
        <Card className="w-full bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-yellow-100 dark:bg-yellow-900/30 rounded-full">
                  <Zap className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
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
                    className={`flex items-center justify-between p-3 rounded-lg transition-colors ${
                      isHealthy
                        ? "bg-muted/50 hover:bg-muted/70"
                        : "bg-red-50/80 dark:bg-red-900/20 hover:bg-red-50 dark:hover:bg-red-900/30"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-2">
                        {isHealthy ? (
                          <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
                        ) : (
                          <XCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
                        )}
                        <div
                          className={`w-2 h-2 rounded-full ${
                            isHealthy
                              ? "bg-green-500 animate-pulse"
                              : "bg-red-500 animate-pulse"
                          }`}
                        />
                      </div>
                      <div>
                        <p className="font-medium text-base">{service.name}</p>
                        <p className="text-sm text-muted-foreground font-mono">
                          {service.host}
                        </p>
                      </div>
                    </div>
                    <div className="text-right flex items-center gap-2">
                      <Badge
                        variant={
                          service.status === "enabled" ? "default" : "secondary"
                        }
                        className={
                          service.status === "enabled"
                            ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400"
                            : undefined
                        }
                      >
                        {service.status}
                      </Badge>
                      <Badge
                        variant={
                          service.state === "up" ? "default" : "destructive"
                        }
                        className={
                          service.state === "up"
                            ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400"
                            : "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400"
                        }
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

        <Card className="w-full bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-cyan-100 dark:bg-cyan-900/30 rounded-full">
                  <Network className="h-5 w-5 text-cyan-600 dark:text-cyan-400" />
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
                    className={`flex items-center justify-between p-3 rounded-lg transition-colors ${
                      isOnline
                        ? "bg-muted/50 hover:bg-muted/70"
                        : "bg-red-50/80 dark:bg-red-900/20 hover:bg-red-50 dark:hover:bg-red-900/30"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-2">
                        {isOnline ? (
                          <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
                        ) : (
                          <XCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
                        )}
                        <div
                          className={`w-2 h-2 rounded-full ${
                            isOnline
                              ? "bg-green-500 animate-pulse"
                              : "bg-red-500 animate-pulse"
                          }`}
                        />
                      </div>
                      <div>
                        <p className="font-medium text-base">{service.name}</p>
                        <p className="text-sm text-muted-foreground font-mono">
                          {service.host}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge
                        variant={isOnline ? "default" : "destructive"}
                        className={`gap-1.5 ${
                          isOnline
                            ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400"
                            : "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400"
                        }`}
                      >
                        <div
                          className={`w-1.5 h-1.5 rounded-full ${
                            isOnline
                              ? "bg-green-500 animate-pulse"
                              : "bg-red-500"
                          }`}
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
        <Card className="border-destructive bg-destructive/5 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-5 w-5" />
              Hypervisor Errors
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {platform_info.hypervisor_errors.map((error, index) => (
                <div
                  key={index}
                  className="p-3 rounded-lg bg-destructive/10 border border-destructive/20"
                >
                  <p className="text-base text-destructive font-medium">
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
