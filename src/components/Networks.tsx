"use client";

import { NetworkCreate } from "@/components/NetworkCreate";
import { ConfirmDeleteDialog } from "@/components/reusable/ConfirmDeleteDialog";
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
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { NetworkService } from "@/lib/requests";
import { cn } from "@/lib/utils";
import type { RouterCreateRequest } from "@/types/RequestInterfaces";
import { RouterCreateRequestSchema } from "@/types/RequestSchemas";
import type {
  NetworkListItem,
  NetworkListResponse,
  RouterCreateResponse,
} from "@/types/ResponseInterfaces";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Network, Plus, Router, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

export function Networks() {
  const queryClient = useQueryClient();
  const [showCreate, setShowCreate] = useState(false);
  const [visibleCount, setVisibleCount] = useState(6);
  const [search, setSearch] = useState("");
  const [showRouterDialog, setShowRouterDialog] = useState(false);
  const [selectedNetworkId, setSelectedNetworkId] = useState<
    string | undefined
  >(undefined);
  const [networkToDelete, setNetworkToDelete] = useState<
    NetworkListItem | undefined
  >(undefined);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  useEffect(() => {
    if (!deleteDialogOpen) {
      setNetworkToDelete(undefined);
    }
  }, [deleteDialogOpen]);

  const routerForm = useForm<RouterCreateRequest>({
    resolver: zodResolver(RouterCreateRequestSchema),
    defaultValues: {
      router_name: "",
      external_network_id: "",
    },
  });

  const {
    data: networks,
    isLoading,
    isFetching,
    error,
    refetch,
  } = useQuery<NetworkListResponse>({
    queryKey: ["networks", "list"],
    queryFn: () => NetworkService.list(),
    refetchInterval: 30000,
    staleTime: 15000,
  });

  const networkList: NetworkListResponse = networks ?? [];

  useEffect(() => {
    setVisibleCount(6);
  }, [search]);

  const createRouterMutation = useMutation({
    mutationFn: async (data: RouterCreateRequest) => {
      return NetworkService.createRouter(data);
    },
    onSuccess: async (router: RouterCreateResponse) => {
      if (selectedNetworkId) {
        const current =
          queryClient.getQueryData<NetworkListResponse>(["networks", "list"]) ??
          [];
        const net = current.find((n) => n.id === selectedNetworkId);
        const firstSubnetId = net?.subnets?.[0];
        if (firstSubnetId) {
          try {
            await NetworkService.addRouterInterface(router.id, {
              subnet_id: firstSubnetId,
            });
          } catch {
            toast.error(
              "Router created but failed to attach first subnet (attach manually)",
            );
          }
        }
      }
      toast.success("Router created");
      setShowRouterDialog(false);
      routerForm.reset();
      await queryClient.invalidateQueries({ queryKey: ["networks", "list"] });
    },
    onError: (err: unknown) => {
      const message =
        err instanceof Error
          ? err.message
          : typeof err === "string"
            ? err
            : "An unexpected error occurred";
      toast.error(message);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => NetworkService.delete({ network_id: id }),
    onSuccess: async () => {
      toast.success("Delete requested (ensure sub-resources detached)");
      await queryClient.invalidateQueries({ queryKey: ["networks", "list"] });
      setDeleteDialogOpen(false);
      setNetworkToDelete(undefined);
    },
    onError: (err: unknown) => {
      const message =
        err instanceof Error
          ? err.message
          : typeof err === "string"
            ? err
            : "An unexpected error occurred";
      toast.error(message);
    },
  });

  const q = search.trim().toLowerCase();
  const filtered = q
    ? networkList.filter((n) =>
        [n.name ?? "", n.status ?? "", n.id ?? ""].some((v) =>
          v.toLowerCase().includes(q),
        ),
      )
    : networkList;
  const totalItems = filtered.length;
  const visibleData = filtered.slice(0, visibleCount);
  const hasMore = visibleCount < totalItems;
  const handleShowMore = () => setVisibleCount((prev) => prev + 6);

  if (isLoading) {
    return (
      <div className="space-y-6 px-2 sm:px-0">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between sm:gap-0">
          <Skeleton className="h-4 w-40" />
          <div className="flex gap-2">
            <Skeleton className="h-9 w-9 flex-shrink-0 rounded-full" />
            <Skeleton className="h-9 w-28 rounded-full" />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card
              key={i}
              className="bg-card border-border/50 overflow-hidden rounded-xl border shadow-sm"
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-2 sm:items-center">
                  <div className="flex min-w-0 flex-1 items-center gap-2">
                    <Skeleton className="h-5 w-32 rounded sm:h-6" />
                    <Skeleton className="h-5 w-16 rounded-full" />
                  </div>
                  <div className="flex flex-shrink-0 gap-1 sm:gap-2">
                    <Skeleton className="h-6 w-10 rounded-full" />
                    <Skeleton className="h-8 w-8 rounded-full" />
                    <Skeleton className="h-8 w-8 rounded-full" />
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <Skeleton className="h-4 w-24 rounded" />
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
        title="Failed to Load Networks"
        message={
          error instanceof Error ? error.message : "Unable to load networks"
        }
        onRetry={() => refetch()}
        isRetrying={isFetching}
      />
    );
  }
  if (!networkList || networkList.length === 0) {
    return (
      <>
        {showCreate ? (
          <NetworkCreate
            onBack={() => setShowCreate(false)}
            onCreated={async () => {
              await queryClient.invalidateQueries({
                queryKey: ["networks", "list"],
              });
              setShowCreate(false);
            }}
          />
        ) : (
          <EmptyState
            title="No networks found"
            text="Create a network to get started."
            onRefresh={() => refetch()}
            refreshing={isFetching}
            icon={<Network className="text-muted-foreground h-7 w-7" />}
            variant="dashed"
            primaryActions={[
              {
                label: "New Network",
                onClick: () => setShowCreate(true),
                icon: <Plus />,
              },
            ]}
          />
        )}
      </>
    );
  }

  return (
    <div className="space-y-6 px-2 sm:px-0">
      {showCreate ? (
        <NetworkCreate
          onBack={() => setShowCreate(false)}
          onCreated={async () => {
            await queryClient.invalidateQueries({
              queryKey: ["networks", "list"],
            });
            setShowCreate(false);
          }}
        />
      ) : (
        <>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between sm:gap-0">
            <div className="text-muted-foreground text-sm leading-relaxed">
              {totalItems} network{totalItems !== 1 ? "s" : ""}
              {totalItems > 0 && (
                <>
                  {" • "}
                  Showing {Math.min(visibleCount, totalItems)} of {totalItems}
                </>
              )}
            </div>
            <div className="flex gap-2">
              <HeaderActions
                onRefresh={() => refetch()}
                isRefreshing={isFetching}
                refreshTooltip="Refresh networks"
                mainButtons={[
                  {
                    label: "New Network",
                    onClick: () => setShowCreate(true),
                    icon: <Plus />,
                  },
                ]}
              />
            </div>
          </div>

          <div className="flex flex-col items-stretch gap-4 sm:flex-row sm:items-center">
            <div className="max-w-full flex-1 sm:max-w-md">
              <XSearch
                value={search}
                onChange={setSearch}
                placeholder="Search networks..."
                aria-label="Search networks"
              />
            </div>
          </div>

          {totalItems === 0 ? (
            <div className="text-muted-foreground rounded-2xl border p-8 text-center">
              No networks match your search.
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3">
                {visibleData.map((n: NetworkListItem) => (
                  <InfoCard
                    key={n.id}
                    title={n.name}
                    badges={
                      <>
                        <StatusBadge status={n.status} />
                        <Badge
                          variant={n.is_external ? "default" : "secondary"}
                          className="rounded-full px-2 py-1 text-xs"
                        >
                          {n.is_external ? "External" : "Internal"}
                        </Badge>
                      </>
                    }
                    infoItems={[
                      [
                        {
                          label: "Subnets",
                          value: n.subnets?.length?.toString() || "0",
                          icon: Network,
                          variant: "purple",
                        },
                      ],
                    ]}
                    actionButtons={
                      <>
                        <Button
                          size="sm"
                          variant="outline"
                          className="cursor-pointer rounded-full"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedNetworkId(n.id);
                            setShowRouterDialog(true);
                          }}
                        >
                          <Router className="h-3 w-3 sm:h-4 sm:w-4" />
                          Add Router
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          className="cursor-pointer rounded-full"
                          onClick={(e) => {
                            e.stopPropagation();
                            setNetworkToDelete(n);
                            setDeleteDialogOpen(true);
                          }}
                          disabled={deleteMutation.isPending}
                        >
                          <Trash2 className="h-3 w-3 sm:h-4 sm:w-4" />
                          Delete Network
                        </Button>
                      </>
                    }
                  />
                ))}
              </div>
              <div className="mt-4 flex justify-center">
                <Button
                  onClick={handleShowMore}
                  variant="outline"
                  disabled={!hasMore}
                  className={cn(
                    "bg-background text-foreground border-border cursor-pointer rounded-full px-6 py-2 transition-all duration-200",
                    hasMore
                      ? "hover:bg-accent hover:text-accent-foreground hover:scale-105"
                      : "cursor-not-allowed opacity-50",
                  )}
                >
                  {hasMore
                    ? `Show More (${Math.min(6, totalItems - visibleCount)} more)`
                    : "All networks loaded"}
                </Button>
              </div>
            </>
          )}
        </>
      )}

      <ConfirmDeleteDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Delete Network"
        description={
          <>
            Are you sure you want to delete this network{" "}
            <span className="text-foreground font-semibold">
              {networkToDelete?.name}
            </span>
            ? This action cannot be undone.
          </>
        }
        confirmLabel="Delete"
        cancelLabel="Cancel"
        confirming={deleteMutation.isPending}
        onConfirm={() =>
          networkToDelete && deleteMutation.mutate(networkToDelete.id)
        }
      />

      <Dialog open={showRouterDialog} onOpenChange={setShowRouterDialog}>
        <DialogContent className="bg-card text-card-foreground border-border mx-4 max-w-[calc(100vw-2rem)] overflow-hidden border shadow-lg sm:mx-0 sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="truncate text-lg font-semibold">
              Create Router
            </DialogTitle>
            <DialogDescription className="text-muted-foreground text-sm leading-relaxed">
              Attach a router to an external network (then interface).
            </DialogDescription>
          </DialogHeader>
          <Form {...routerForm}>
            <form
              onSubmit={routerForm.handleSubmit((data) =>
                createRouterMutation.mutate(data),
              )}
              className="space-y-4"
            >
              <FormField
                control={routerForm.control}
                name="router_name"
                render={({ field }) => (
                  <div className="space-y-2">
                    <FormLabel className="text-sm font-medium">
                      Router Name
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="router-name"
                        className={cn(
                          "bg-input text-foreground h-10 w-full rounded-full",
                          routerForm.formState.errors.router_name &&
                            "border-destructive",
                        )}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </div>
                )}
              />
              <FormField
                control={routerForm.control}
                name="external_network_id"
                render={({ field }) => (
                  <div className="space-y-2">
                    <FormLabel className="text-sm font-medium">
                      External Network ID
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="external-network-id"
                        className={cn(
                          "bg-input text-foreground h-10 w-full rounded-full",
                          routerForm.formState.errors.external_network_id &&
                            "border-destructive",
                        )}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </div>
                )}
              />
              <DialogFooter className="flex flex-col gap-2 pt-4 sm:flex-row sm:gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowRouterDialog(false)}
                  className={cn(
                    "bg-background text-foreground border-border order-2 w-full cursor-pointer rounded-full border sm:order-1 sm:w-auto",
                  )}
                >
                  <span className="truncate">Cancel</span>
                </Button>
                <Button
                  type="submit"
                  disabled={createRouterMutation.isPending}
                  className={cn(
                    "bg-primary text-primary-foreground order-1 w-full min-w-[100px] cursor-pointer rounded-full sm:order-2 sm:w-auto",
                    createRouterMutation.isPending && "opacity-70",
                  )}
                >
                  <span className="truncate">
                    {createRouterMutation.isPending ? "Creating..." : "Create"}
                  </span>
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
