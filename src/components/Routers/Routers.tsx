"use client";

import { EmptyState } from "@/components/reusable/EmptyState";
import { ErrorCard } from "@/components/reusable/ErrorCard";
import { HeaderActions } from "@/components/reusable/HeaderActions";
import { InfoCard } from "@/components/reusable/InfoCard";
import { InfoDialog } from "@/components/reusable/InfoDialog";
import { StatusBadge } from "@/components/reusable/StatusBadge";
import { XSearch } from "@/components/reusable/XSearch";
import { CreateRouterDialog } from "@/components/Routers/CreateRouterDialog";
import { RouterActions } from "@/components/Routers/RouterActions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { NetworkService } from "@/lib/requests";
import type {
  RouterDetails,
  RouterListItem,
  RouterListResponse,
} from "@/types/ResponseInterfaces";
import { useQuery } from "@tanstack/react-query";
import {
  Activity,
  FileText,
  Globe,
  MapPin,
  Plus,
  Router as RouterIcon,
  Server,
  Shield,
  ToggleRight,
} from "lucide-react";
import { useEffect, useState } from "react";

export function Routers() {
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [selectedRouter, setSelectedRouter] = useState<
    RouterListItem | undefined
  >(undefined);
  const [visibleCount, setVisibleCount] = useState(6);
  const [search, setSearch] = useState("");

  useEffect(() => {
    setVisibleCount(6);
  }, [search]);

  const { data, isLoading, error, refetch, isFetching } =
    useQuery<RouterListResponse>({
      queryKey: ["routers"],
      queryFn: () => NetworkService.routersList(),
      refetchInterval: 15000,
      staleTime: 10000,
      gcTime: 5 * 60 * 1000,
    });

  const { data: routerDetails, isLoading: isLoadingDetails } =
    useQuery<RouterDetails>({
      queryKey: ["router", selectedRouter?.id],
      queryFn: () =>
        NetworkService.getRouter({ router_id: selectedRouter!.id }),
      enabled: !!selectedRouter?.id && detailsDialogOpen,
      staleTime: 30000,
      gcTime: 5 * 60 * 1000,
    });

  const routers = data ?? [];
  const trimmed = search.trim().toLowerCase();
  const filtered = trimmed
    ? routers.filter((r) => {
        const fields = [r.name ?? "", r.status ?? ""];
        return fields.some((f) => f.toString().toLowerCase().includes(trimmed));
      })
    : routers;
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
        title="Failed to Load Routers"
        message={
          "There was an error loading your routers. Please check your connection and try again."
        }
        onRetry={() => refetch()}
        isRetrying={isFetching}
      />
    );
  }

  if (!routers || routers.length === 0) {
    return (
      <div className="space-y-6">
        <EmptyState
          title="No routers found"
          text="Create your first router to get started."
          onRefresh={() => refetch()}
          refreshing={isFetching}
          icon={<RouterIcon className="text-muted-foreground h-7 w-7" />}
          variant="dashed"
          primaryActions={[
            {
              label: "Create Router",
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
      <CreateRouterDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
      />
      <div className="space-y-6">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between sm:gap-0">
          <div className="text-muted-foreground text-sm leading-relaxed">
            {totalItems} router{totalItems !== 1 ? "s" : ""} total
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
            refreshAriaLabel="Refresh routers"
            mainButton={{
              onClick: () => setCreateDialogOpen(true),
              label: "Create Router",
              shortLabel: "New",
              tooltip: "Create a new router",
            }}
          />
        </div>

        <div className="flex flex-col items-stretch gap-4 sm:flex-row sm:items-center">
          <div className="max-w-full flex-1 sm:max-w-md">
            <XSearch
              value={search}
              onChange={setSearch}
              placeholder="Search routers..."
              aria-label="Search routers"
            />
          </div>
        </div>

        {totalItems === 0 ? (
          <div className="text-muted-foreground rounded-2xl border p-8 text-center">
            No routers match your search.
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3">
            {visibleData.map((router) => (
              <InfoCard
                key={router.id}
                title={router.name}
                className="h-full"
                onClick={() => {
                  setSelectedRouter(router);
                  setDetailsDialogOpen(true);
                }}
                badges={
                  <div className="flex items-center space-x-1">
                    <StatusBadge status={router.status} />
                  </div>
                }
                infoItems={[
                  [
                    {
                      label: "External Network",
                      value: router.external_network_name,
                      icon: Globe,
                      variant: "blue",
                    },
                    {
                      label: "External IP",
                      value: router.external_ip,
                      icon: Server,
                      variant: "sky",
                    },
                  ],
                  [
                    {
                      label: "Admin State",
                      value: router.admin_state ? "Up" : "Down",
                      icon: ToggleRight,
                      variant: "green",
                    },
                    {
                      label: "Zones",
                      value: router.availability_zones.join(", "),
                      icon: MapPin,
                      variant: "amber",
                    },
                  ],
                ]}
                actionButtons={
                  <div onClick={(e) => e.stopPropagation()}>
                    <RouterActions router={router} />
                  </div>
                }
              />
            ))}
          </div>
        )}
        <InfoDialog
          open={detailsDialogOpen}
          onOpenChange={setDetailsDialogOpen}
          isLoading={isLoadingDetails}
          title={
            routerDetails?.name ?? selectedRouter?.name ?? "Router Details"
          }
          badges={
            <StatusBadge
              status={routerDetails?.status ?? selectedRouter?.status ?? ""}
            />
          }
          description={routerDetails?.description ?? "No description available"}
          infoItems={[
            [
              {
                label: "Name",
                value: routerDetails?.name ?? selectedRouter?.name ?? "N/A",
                icon: FileText,
                variant: "indigo",
              },
              {
                label: "Status",
                value: routerDetails?.status ?? selectedRouter?.status ?? "N/A",
                icon: Activity,
                variant: "rose",
              },
            ],
            [
              {
                label: "Project",
                value: routerDetails?.project_name ?? "N/A",
                icon: Shield,
                variant: "purple",
              },
              {
                label: "Admin State",
                value: routerDetails?.admin_state_up
                  ? "Up"
                  : selectedRouter?.admin_state
                    ? "Up"
                    : "Down",
                icon: ToggleRight,
                variant: "green",
              },
            ],
            [
              {
                label: "External IP",
                value:
                  routerDetails?.external_gateway_info?.external_fixed_ips?.[0]
                    ?.ip_address ??
                  selectedRouter?.external_ip ??
                  "N/A",
                icon: Server,
                variant: "sky",
              },
              {
                label: "SNAT Enabled",
                value:
                  routerDetails?.external_gateway_info?.enable_snat !==
                  undefined
                    ? routerDetails.external_gateway_info.enable_snat
                      ? "Yes"
                      : "No"
                    : "N/A",
                icon: Globe,
                variant: "emerald",
              },
            ],
            [
              {
                label: "Availability Zones",
                value:
                  (
                    routerDetails?.availability_zones ??
                    selectedRouter?.availability_zones
                  )?.join(", ") ?? "N/A",
                icon: MapPin,
                variant: "amber",
              },
            ],
          ]}
          actionButtons={
            <Button
              variant="outline"
              className="cursor-pointer rounded-full"
              onClick={() => setDetailsDialogOpen(false)}
            >
              Close
            </Button>
          }
        />
        <div className="flex justify-center">
          <Button
            onClick={handleShowMore}
            variant="outline"
            disabled={!hasMore}
            className={`bg-background text-foreground border-border rounded-full px-6 py-2 transition-all duration-200 ${hasMore ? "hover:bg-accent hover:text-accent-foreground hover:scale-105" : "cursor-not-allowed opacity-50"}`}
          >
            {hasMore
              ? `Show More (${Math.min(6, totalItems - visibleCount)} more)`
              : "All routers loaded"}
          </Button>
        </div>
      </div>
    </>
  );
}
