"use client";

import { CreateFloatingIpDialog } from "@/components/FloatingIps/CreateFloatingIpDialog";
import { FloatingIpActions } from "@/components/FloatingIps/FloatingIpActions";
import { EmptyState } from "@/components/reusable/EmptyState";
import { ErrorCard } from "@/components/reusable/ErrorCard";
import { HeaderActions } from "@/components/reusable/HeaderActions";
import { InfoCard } from "@/components/reusable/InfoCard";
import { StatusBadge } from "@/components/reusable/StatusBadge";
import { XSearch } from "@/components/reusable/XSearch";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { NetworkService } from "@/lib/requests";
import type {
  FloatingIpsListItem,
  FloatingIpsListResponse,
} from "@/types/ResponseInterfaces";
import { useQuery } from "@tanstack/react-query";
import { Globe, Plus, Server, Waves } from "lucide-react";
import { useEffect, useState } from "react";

export function FloatingIps() {
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [visibleCount, setVisibleCount] = useState(6);
  const [search, setSearch] = useState("");

  useEffect(() => {
    setVisibleCount(6);
  }, [search]);

  const { data, isLoading, error, refetch, isFetching } =
    useQuery<FloatingIpsListResponse>({
      queryKey: ["floating-ips"],
      queryFn: () => NetworkService.listFloatingIPs(),
      refetchInterval: 15000,
      staleTime: 10000,
      gcTime: 5 * 60 * 1000,
    });

  const floatingIps = data ?? [];
  const trimmed = search.trim().toLowerCase();
  const filtered = trimmed
    ? floatingIps.filter((ip) => {
        const fields = [
          ip.ip_address,
          ip.description,
          ip.vm_name ?? "",
          ip.pool,
          ip.status,
        ];
        return fields.some((f) => f.toString().toLowerCase().includes(trimmed));
      })
    : floatingIps;
  const totalItems = filtered.length;
  const visibleData = filtered.slice(0, visibleCount);
  const hasMore = visibleCount < totalItems;

  const handleShowMore = () => setVisibleCount((prev) => prev + 6);

  if (isLoading) {
    return (
      <div className="space-y-6">
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
              key={`skeleton-${i}`}
              className="text-card-foreground border-border/50 group flex h-full cursor-pointer flex-col rounded-xl border bg-neutral-50 shadow-lg transition-all duration-200 hover:shadow-xl dark:bg-neutral-900"
            >
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-card-foreground truncate text-lg font-semibold">
                    <Skeleton className="h-6 w-32 rounded" />
                  </CardTitle>
                  <span className="bg-muted text-muted-foreground rounded px-2 py-1 text-xs">
                    <Skeleton className="h-4 w-16 rounded" />
                  </span>
                </div>
              </CardHeader>
              <CardContent className="flex flex-1 flex-col pt-0">
                <div className="flex-1 space-y-3" />
                <div className="mt-4 flex flex-col gap-2">
                  <div className="flex w-full items-center justify-center gap-2">
                    <Skeleton className="h-8 w-20 rounded-full" />
                    <Skeleton className="h-8 w-20 rounded-full" />
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
        title="Failed to Load Floating IPs"
        message={
          "There was an error loading your floating IPs. Please check your connection and try again."
        }
        onRetry={() => refetch()}
        isRetrying={isFetching}
      />
    );
  }

  if (!floatingIps || floatingIps.length === 0) {
    return (
      <div className="space-y-6">
        <EmptyState
          title="No floating IPs found"
          text="Create your first floating IP to get started."
          onRefresh={() => refetch()}
          refreshing={isFetching}
          icon={<Globe className="text-muted-foreground h-7 w-7" />}
          variant="dashed"
          primaryActions={[
            {
              label: "Create Floating IP",
              onClick: () => setCreateDialogOpen(true),
              icon: <Plus />,
            },
          ]}
        />
      </div>
    );
  }

  return (
    <>
      <CreateFloatingIpDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
      />
      <div className="space-y-6">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between sm:gap-0">
          <div className="text-muted-foreground text-sm leading-relaxed">
            {totalItems} floating IP{totalItems !== 1 ? "s" : ""} total
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
            refreshTooltip="Refresh"
            refreshAriaLabel="Refresh floating IPs"
            mainButton={{
              onClick: () => setCreateDialogOpen(true),
              label: "Create Floating IP",
              shortLabel: "New",
              tooltip: "Create a new floating IP",
            }}
          />
        </div>

        <div className="flex flex-col items-stretch gap-4 sm:flex-row sm:items-center">
          <div className="max-w-full flex-1 sm:max-w-md">
            <XSearch
              value={search}
              onChange={setSearch}
              placeholder="Search floating IPs..."
              aria-label="Search floating IPs"
            />
          </div>
        </div>

        {totalItems === 0 ? (
          <div className="text-muted-foreground rounded-2xl border p-8 text-center">
            No floating IPs match your search.
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3">
            {visibleData.map((ip: FloatingIpsListItem) => (
              <InfoCard
                key={ip.id}
                title={ip.ip_address}
                description={ip.description}
                className="h-full"
                badges={
                  <div className="flex items-center space-x-1">
                    <StatusBadge status={ip.status} />
                  </div>
                }
                infoItems={[
                  [
                    {
                      label: "Associated VM",
                      value: ip.vm_name ?? "N/A",
                      icon: Server,
                      variant: "green",
                    },
                    {
                      label: "Pool",
                      value: ip.pool,
                      icon: Waves,
                      variant: "blue",
                    },
                  ],
                ]}
                actionButtons={<FloatingIpActions ip={ip} />}
              />
            ))}
          </div>
        )}
        <div className="flex justify-center">
          <Button
            onClick={handleShowMore}
            variant="outline"
            disabled={!hasMore}
            className={`bg-background text-foreground border-border rounded-full px-6 py-2 transition-all duration-200 ${hasMore ? "hover:bg-accent hover:text-accent-foreground hover:scale-105" : "cursor-not-allowed opacity-50"}`}
          >
            {hasMore
              ? `Show More (${Math.min(6, totalItems - visibleCount)} more)`
              : "All floating IPs loaded"}
          </Button>
        </div>
      </div>
    </>
  );
}
