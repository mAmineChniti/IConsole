"use client";

import { ErrorCard } from "@/components/ErrorCard";
import { NetworkCreate } from "@/components/NetworkCreate";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
// Select components no longer used here after extraction
import { Skeleton } from "@/components/ui/skeleton";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
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
import { Network, Plus, RefreshCw, Router, Trash2 } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

export function Networks() {
  const queryClient = useQueryClient();
  const [showCreate, setShowCreate] = useState(false);
  const [visibleCount, setVisibleCount] = useState(6);
  const [showRouterDialog, setShowRouterDialog] = useState(false);
  const [selectedNetworkId, setSelectedNetworkId] = useState<
    string | undefined
  >(undefined);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [networkToDelete, setNetworkToDelete] = useState<string | undefined>(
    undefined,
  );

  // Creation moved to NetworkCreate component

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

  // Create mutation handled in NetworkCreate

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
      setShowDeleteDialog(false);
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

  const totalItems = networkList.length;
  const visibleData = networkList.slice(0, visibleCount);
  const hasMore = visibleCount < totalItems;
  const handleShowMore = () => setVisibleCount((prev) => prev + 6);

  if (isLoading) {
    return (
      <div className="px-2 space-y-6 sm:px-0">
        <div className="flex flex-col gap-4 sm:flex-row sm:gap-0 sm:justify-between sm:items-center">
          <Skeleton className="w-40 h-4" />
          <div className="flex gap-2">
            <Skeleton className="flex-shrink-0 w-9 h-9 rounded-full" />
            <Skeleton className="w-28 h-9 rounded-full" />
          </div>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card
              key={i}
              className="overflow-hidden rounded-xl border shadow-sm bg-card border-border/50"
            >
              <CardHeader className="pb-3">
                <div className="flex gap-2 justify-between items-start sm:items-center">
                  <div className="flex flex-1 gap-2 items-center min-w-0">
                    <Skeleton className="w-32 h-5 rounded sm:h-6" />
                    <Skeleton className="w-16 h-5 rounded-full" />
                  </div>
                  <div className="flex flex-shrink-0 gap-1 sm:gap-2">
                    <Skeleton className="w-10 h-6 rounded-full" />
                    <Skeleton className="w-8 h-8 rounded-full" />
                    <Skeleton className="w-8 h-8 rounded-full" />
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <Skeleton className="w-24 h-4 rounded" />
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
        title="Failed to Load Networks"
        message={error?.message || "Unable to load networks"}
        onRetry={() => refetch()}
        isRetrying={isFetching}
      />
    );
  }

  return (
    <div className="px-2 space-y-6 sm:px-0">
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
          <div className="flex flex-col gap-4 sm:flex-row sm:gap-0 sm:justify-between sm:items-center">
            <div className="text-sm leading-relaxed text-muted-foreground">
              {totalItems} network{totalItems !== 1 ? "s" : ""}
              {totalItems > 0 && (
                <>
                  {" • "}
                  Showing {Math.min(visibleCount, totalItems)} of {totalItems}
                </>
              )}
            </div>
            <div className="flex gap-2">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => refetch()}
                    disabled={isFetching}
                    className={cn(
                      "cursor-pointer w-10 h-9 p-0 sm:w-auto sm:px-3 rounded-full",
                      isFetching && "opacity-70",
                    )}
                  >
                    {isFetching ? (
                      <RefreshCw className="flex-shrink-0 w-4 h-4 animate-spin" />
                    ) : (
                      <RefreshCw className="flex-shrink-0 w-4 h-4" />
                    )}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Refresh</TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    size="sm"
                    onClick={() => setShowCreate(true)}
                    className={cn(
                      "cursor-pointer flex-1 sm:flex-none min-w-[120px] rounded-full",
                    )}
                  >
                    <Plus className="flex-shrink-0 mr-2 w-4 h-4" />
                    <span className="truncate">New Network</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Create a new network</TooltipContent>
              </Tooltip>
            </div>
          </div>

          {totalItems === 0 ? (
            <Card className="overflow-hidden border-dashed bg-card border-border">
              <CardContent className="p-6 text-center sm:p-8">
                <Network className="flex-shrink-0 mx-auto mb-4 w-10 h-10 sm:w-12 sm:h-12 text-muted-foreground" />
                <p className="text-sm leading-relaxed sm:text-base text-muted-foreground">
                  No networks found. Create your first network.
                </p>
              </CardContent>
            </Card>
          ) : (
            <>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3">
                {visibleData.map((n: NetworkListItem) => (
                  <Card
                    key={n.id}
                    className="overflow-hidden border shadow-sm bg-card border-border/50"
                  >
                    <CardHeader className="pb-3">
                      <div className="flex gap-2 justify-between items-start sm:items-center">
                        <div className="flex flex-1 gap-2 items-center min-w-0">
                          <CardTitle className="text-base font-semibold leading-tight break-words sm:text-lg">
                            {n.name || n.id}
                          </CardTitle>
                        </div>
                        <Badge
                          variant={
                            n.status === "ACTIVE" ? "default" : "destructive"
                          }
                          className={cn(
                            "gap-1.5",
                            n.status === "ACTIVE"
                              ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400"
                              : "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400",
                          )}
                        >
                          <div
                            className={cn(
                              "w-1.5 h-1.5 rounded-full animate-pulse",
                              n.status === "ACTIVE"
                                ? "bg-green-500"
                                : "bg-red-400 dark:bg-red-500",
                            )}
                          />
                          {n.status === "ACTIVE"
                            ? "Online"
                            : n.status === "DOWN"
                              ? "Offline"
                              : (n.status?.toLowerCase() ?? "unknown")}
                        </Badge>
                        <div className="flex flex-shrink-0 gap-1 sm:gap-2">
                          <Badge
                            variant={n.is_external ? "default" : "secondary"}
                            className="py-1 px-2 text-xs rounded-full"
                          >
                            {n.is_external ? "Ext" : "Int"}
                          </Badge>
                          <Button
                            size="sm"
                            variant="outline"
                            className={cn(
                              "h-7 w-7 sm:h-8 sm:w-8 p-0 cursor-pointer flex-shrink-0 rounded-full",
                            )}
                            onClick={() => {
                              setSelectedNetworkId(n.id);
                              setShowRouterDialog(true);
                            }}
                          >
                            <Router className="w-3 h-3 sm:w-4 sm:h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            className={cn(
                              "h-7 w-7 sm:h-8 sm:w-8 p-0 cursor-pointer flex-shrink-0 rounded-full",
                              deleteMutation.isPending && "opacity-70",
                            )}
                            onClick={() => {
                              setNetworkToDelete(n.id);
                              setShowDeleteDialog(true);
                            }}
                            disabled={deleteMutation.isPending}
                          >
                            <Trash2 className="w-3 h-3 sm:w-4 sm:h-4" />
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0 space-y-3">
                      <div className="text-xs text-muted-foreground">
                        Subnets: {n.subnets?.length ?? 0}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
              <div className="flex justify-center mt-4">
                <Button
                  onClick={handleShowMore}
                  variant="outline"
                  disabled={!hasMore}
                  className={cn(
                    "rounded-full cursor-pointer transition-all duration-200 px-6 py-2 bg-background text-foreground border-border",
                    hasMore
                      ? "hover:bg-accent hover:text-accent-foreground hover:scale-105"
                      : "opacity-50 cursor-not-allowed",
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

      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent className="rounded-2xl sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex gap-2 items-center text-destructive">
              <Trash2 className="w-5 h-5" />
              Delete Network
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this network? This action cannot
              be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex-col gap-2 sm:flex-row">
            <Button
              variant="outline"
              onClick={() => setShowDeleteDialog(false)}
              disabled={deleteMutation.isPending}
              className="flex-1 rounded-full cursor-pointer"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                if (networkToDelete) {
                  deleteMutation.mutate(networkToDelete);
                }
              }}
              disabled={deleteMutation.isPending}
              className="flex-1 gap-2 rounded-full cursor-pointer"
            >
              {deleteMutation.isPending ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 className="w-4 h-4" />
                  Delete
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showRouterDialog} onOpenChange={setShowRouterDialog}>
        <DialogContent className="overflow-hidden mx-4 border shadow-lg sm:mx-0 sm:max-w-md max-w-[calc(100vw-2rem)] bg-card text-card-foreground border-border">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold truncate">
              Create Router
            </DialogTitle>
            <DialogDescription className="text-sm leading-relaxed text-muted-foreground">
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
                          "h-10 w-full rounded-full bg-input text-foreground",
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
                          "h-10 w-full rounded-full bg-input text-foreground",
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
                    "cursor-pointer w-full sm:w-auto order-2 sm:order-1 rounded-full bg-background text-foreground border border-border",
                  )}
                >
                  <span className="truncate">Cancel</span>
                </Button>
                <Button
                  type="submit"
                  disabled={createRouterMutation.isPending}
                  className={cn(
                    "cursor-pointer w-full sm:w-auto order-1 sm:order-2 min-w-[100px] rounded-full bg-primary text-primary-foreground",
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
