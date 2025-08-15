"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Network, Plus, RefreshCw, Router, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { ErrorCard } from "@/components/ErrorCard";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { NetworkService } from "@/lib/requests";
import type {
  AllocationPool,
  NetworkCreateRequest,
  RouterCreateRequest,
} from "@/types/RequestInterfaces";
import {
  NetworkCreateFormDataSchema,
  RouterCreateRequestSchema,
} from "@/types/RequestSchemas";
import type {
  NetworkListResponse,
  RouterCreateResponse,
} from "@/types/ResponseInterfaces";

export function NetworksManager() {
  const queryClient = useQueryClient();
  const [showCreate, setShowCreate] = useState(false);
  const [showRouterDialog, setShowRouterDialog] = useState(false);
  const [selectedNetworkId, setSelectedNetworkId] = useState<
    string | undefined
  >(undefined);

  const networkForm = useForm<NetworkCreateRequest>({
    resolver: zodResolver(NetworkCreateFormDataSchema),
    defaultValues: {
      name: "",
      description: "",
      mtu: 1500,
      shared: false,
      port_security_enabled: true,
      availability_zone_hints: [],
      subnet: {
        name: "",
        ip_version: 4 as const,
        cidr: "10.10.10.0/24",
        gateway_ip: "10.10.10.1",
        enable_dhcp: true,
        dns_nameservers: ["1.1.1.1", "8.8.8.8"],
        allocation_pools: [],
        host_routes: [],
      },
    },
  });

  const [allocationPoolsText, setAllocationPoolsText] = useState("");
  // keep text in sync with form state so it reflects resets/defaults
  useEffect(() => {
    const pools = networkForm.getValues("subnet.allocation_pools") ?? [];
    setAllocationPoolsText(JSON.stringify(pools));
  }, [showCreate, networkForm]); // re-sync when dialog opens/closes; adjust as needed

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

  const createMutation = useMutation({
    mutationFn: async (formData: NetworkCreateRequest) => {
      const payload: NetworkCreateRequest = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        mtu: formData.mtu,
        shared: formData.shared,
        port_security_enabled: formData.port_security_enabled,
        availability_zone_hints: formData.availability_zone_hints.map((s) =>
          s.trim(),
        ),
        subnet: {
          name: formData.subnet.name.trim(),
          ip_version: formData.subnet.ip_version,
          cidr: formData.subnet.cidr.trim(),
          gateway_ip: formData.subnet.gateway_ip.trim(),
          enable_dhcp: formData.subnet.enable_dhcp,
          allocation_pools: formData.subnet.allocation_pools.map((ap) => ({
            start: ap.start.trim(),
            end: ap.end.trim(),
          })),
          dns_nameservers: formData.subnet.dns_nameservers.map((d) => d.trim()),
          host_routes: formData.subnet.host_routes.map((r) => r.trim()),
        },
      };
      return NetworkService.create(payload);
    },
    onSuccess: async () => {
      toast.success("Network created");
      setShowCreate(false);
      networkForm.reset();
      await queryClient.invalidateQueries({ queryKey: ["networks", "list"] });
    },
    onError: (error) => toast.error(error.message),
  });

  const createRouterMutation = useMutation({
    mutationFn: async (data: RouterCreateRequest) => {
      return NetworkService.createRouter(data);
    },
    onSuccess: async (_router: RouterCreateResponse) => {
      if (selectedNetworkId) {
        const net = networks?.find((n) => n.id === selectedNetworkId);
        const firstSubnetId = net?.subnets?.[0];
        if (firstSubnetId) {
          try {
            await NetworkService.addRouterInterface(selectedNetworkId, {
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
    onError: (error) => toast.error(error.message),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => NetworkService.delete(id),
    onSuccess: async () => {
      toast.success("Delete requested (ensure sub-resources detached)");
      await queryClient.invalidateQueries({ queryKey: ["networks", "list"] });
    },
    onError: (error) => toast.error(error.message),
  });

  if (isLoading) {
    return (
      <div className="space-y-6 px-2 sm:px-0">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 sm:gap-0">
          <Skeleton className="h-4 w-20" />
          <div className="flex gap-2">
            <Skeleton className="h-9 w-9 flex-shrink-0" />
            <Skeleton className="h-9 w-28" />
          </div>
        </div>
        <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card
              key={i}
              className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border border-border/50 overflow-hidden"
            >
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between gap-2">
                  <Skeleton className="h-5 sm:h-6 w-32 flex-1" />
                  <div className="flex gap-2 flex-shrink-0">
                    <Skeleton className="h-6 w-16" />
                    <Skeleton className="h-8 w-8" />
                    <Skeleton className="h-8 w-8" />
                  </div>
                </div>
                <Skeleton className="h-4 sm:h-6 w-full mt-2" />
              </CardHeader>
              <CardContent className="space-y-3 pt-0">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-3 w-20" />
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
        title="Failed to Load Networks"
        message={error?.message || "Unable to load networks"}
        onRetry={() => refetch()}
        isRetrying={isFetching}
      />
    );
  }

  const list = networks ?? [];

  return (
    <div className="space-y-6 px-2 sm:px-0">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 sm:gap-0">
        <div className="text-sm text-muted-foreground leading-relaxed">
          {list.length} network{list.length !== 1 ? "s" : ""}
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            disabled={isFetching}
            className="cursor-pointer w-10 h-9 p-0 sm:w-auto sm:px-3"
          >
            {isFetching ? (
              <RefreshCw className="h-4 w-4 animate-spin flex-shrink-0" />
            ) : (
              <RefreshCw className="h-4 w-4 flex-shrink-0" />
            )}
            <span className="sr-only sm:not-sr-only sm:ml-2">Refresh</span>
          </Button>
          <Button
            size="sm"
            onClick={() => setShowCreate(true)}
            className="cursor-pointer flex-1 sm:flex-none min-w-[120px]"
          >
            <Plus className="h-4 w-4 mr-2 flex-shrink-0" />
            <span className="truncate">New Network</span>
          </Button>
        </div>
      </div>

      {list.length === 0 ? (
        <Card className="border-dashed overflow-hidden">
          <CardContent className="p-6 sm:p-8 text-center">
            <Network className="mx-auto h-10 w-10 sm:h-12 sm:w-12 text-muted-foreground mb-4 flex-shrink-0" />
            <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
              No networks found. Create your first network.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {list.map((n) => (
            <Card
              key={n.id}
              className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border border-border/50 overflow-hidden"
            >
              <CardHeader className="pb-3">
                <div className="flex items-start sm:items-center justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <CardTitle className="text-base sm:text-lg font-semibold break-words leading-tight">
                      {n.name || n.id}
                    </CardTitle>
                  </div>
                  <div className="flex gap-1 sm:gap-2 flex-shrink-0">
                    <Badge
                      variant={n.is_external ? "default" : "secondary"}
                      className={`text-xs ${
                        n.is_external
                          ? "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400"
                          : ""
                      }`}
                    >
                      {n.is_external ? "Ext" : "Int"}
                    </Badge>
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-7 w-7 sm:h-8 sm:w-8 p-0 cursor-pointer flex-shrink-0"
                      onClick={() => {
                        setSelectedNetworkId(n.id);
                        setShowRouterDialog(true);
                      }}
                    >
                      <Router className="h-3 w-3 sm:h-4 sm:w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-7 w-7 sm:h-8 sm:w-8 p-0 cursor-pointer flex-shrink-0"
                      onClick={() => deleteMutation.mutate(n.id)}
                      disabled={deleteMutation.isPending}
                    >
                      <Trash2 className="h-3 w-3 sm:h-4 sm:w-4" />
                    </Button>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground font-mono break-all mt-2 bg-muted/20 px-2 py-1 rounded leading-relaxed">
                  ID: {n.id}
                </p>
              </CardHeader>
              <CardContent className="space-y-3 pt-0">
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-muted-foreground">Status:</span>
                  <span className="truncate">{n.status}</span>
                </div>
                <div className="text-xs text-muted-foreground">
                  Subnets: {n.subnets.length}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent className="mx-4 sm:mx-0 max-w-[calc(100vw-2rem)] sm:max-w-2xl overflow-hidden max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold truncate">
              Create network
            </DialogTitle>
          </DialogHeader>
          <Form {...networkForm}>
            <form
              onSubmit={networkForm.handleSubmit((data) =>
                createMutation.mutate(data),
              )}
              className="space-y-4"
            >
              <div className="space-y-4">
                <h3 className="text-sm font-semibold">Network Settings</h3>
                <FormField
                  control={networkForm.control}
                  name="name"
                  render={({ field }) => (
                    <div className="space-y-2">
                      <FormLabel className="text-sm font-medium">
                        Network Name
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="network-name"
                          className="h-10 w-full"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </div>
                  )}
                />
                <FormField
                  control={networkForm.control}
                  name="description"
                  render={({ field }) => (
                    <div className="space-y-2">
                      <FormLabel className="text-sm font-medium">
                        Description
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Network description"
                          className="h-10 w-full"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </div>
                  )}
                />
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={networkForm.control}
                    name="shared"
                    render={({ field }) => (
                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id="shared"
                          checked={field.value}
                          onChange={(e) => field.onChange(e.target.checked)}
                          className="h-4 w-4"
                        />
                        <FormLabel
                          htmlFor="shared"
                          className="text-sm font-medium"
                        >
                          Shared
                        </FormLabel>
                        <FormMessage />
                      </div>
                    )}
                  />
                  <FormField
                    control={networkForm.control}
                    name="port_security_enabled"
                    render={({ field }) => (
                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id="port_security"
                          checked={field.value}
                          onChange={(e) => field.onChange(e.target.checked)}
                          className="h-4 w-4"
                        />
                        <FormLabel
                          htmlFor="port_security"
                          className="text-sm font-medium"
                        >
                          Port Security
                        </FormLabel>
                        <FormMessage />
                      </div>
                    )}
                  />
                </div>
                <FormField
                  control={networkForm.control}
                  name="mtu"
                  render={({ field }) => (
                    <div className="space-y-2">
                      <FormLabel className="text-sm font-medium">MTU</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="1500"
                          className="h-10 w-full"
                          {...field}
                          onChange={(e) =>
                            field.onChange(Number(e.target.value))
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </div>
                  )}
                />
                <FormField
                  control={networkForm.control}
                  name="availability_zone_hints"
                  render={({ field }) => {
                    const value = Array.isArray(field.value)
                      ? field.value.join(",")
                      : "";
                    return (
                      <div className="space-y-2">
                        <FormLabel className="text-sm font-medium">
                          Availability Zone Hints (comma separated)
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder="zone1,zone2"
                            className="h-10 w-full"
                            value={value}
                            onChange={(e) => {
                              const arr = e.target.value
                                .split(",")
                                .map((s) => s.trim())
                                .filter(Boolean);
                              field.onChange(arr);
                            }}
                          />
                        </FormControl>
                        <FormMessage />
                      </div>
                    );
                  }}
                />
              </div>

              <div className="space-y-4">
                <h3 className="text-sm font-semibold">Subnet Settings</h3>
                <FormField
                  control={networkForm.control}
                  name="subnet.name"
                  render={({ field }) => (
                    <div className="space-y-2">
                      <FormLabel className="text-sm font-medium">
                        Subnet Name
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="subnet-name (auto-generated if empty)"
                          className="h-10 w-full"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </div>
                  )}
                />
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={networkForm.control}
                    name="subnet.ip_version"
                    render={({ field }) => (
                      <div className="space-y-2">
                        <FormLabel className="text-sm font-medium">
                          IP Version
                        </FormLabel>
                        <Select
                          value={String(field.value)}
                          onValueChange={(v) =>
                            field.onChange(Number(v) as 4 | 6)
                          }
                        >
                          <FormControl>
                            <SelectTrigger className="h-10 w-full">
                              <SelectValue placeholder="Select IP Version" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="4">IPv4</SelectItem>
                            <SelectItem value="6">IPv6</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </div>
                    )}
                  />
                  <FormField
                    control={networkForm.control}
                    name="subnet.enable_dhcp"
                    render={({ field }) => (
                      <div className="flex items-center space-x-2 pt-7">
                        <input
                          type="checkbox"
                          id="enable_dhcp"
                          checked={field.value}
                          onChange={(e) => field.onChange(e.target.checked)}
                          className="h-4 w-4"
                        />
                        <FormLabel
                          htmlFor="enable_dhcp"
                          className="text-sm font-medium"
                        >
                          Enable DHCP
                        </FormLabel>
                        <FormMessage />
                      </div>
                    )}
                  />
                </div>
                <FormField
                  control={networkForm.control}
                  name="subnet.cidr"
                  render={({ field }) => (
                    <div className="space-y-2">
                      <FormLabel className="text-sm font-medium">
                        CIDR
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="10.10.10.0/24"
                          className="h-10 w-full"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </div>
                  )}
                />
                <FormField
                  control={networkForm.control}
                  name="subnet.gateway_ip"
                  render={({ field }) => (
                    <div className="space-y-2">
                      <FormLabel className="text-sm font-medium">
                        Gateway IP
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="10.10.10.1"
                          className="h-10 w-full"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </div>
                  )}
                />
                <FormField
                  control={networkForm.control}
                  name="subnet.dns_nameservers"
                  render={({ field }) => {
                    const value = Array.isArray(field.value)
                      ? field.value.join(",")
                      : "";
                    return (
                      <div className="space-y-2">
                        <FormLabel className="text-sm font-medium">
                          DNS Nameservers (comma separated)
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder="1.1.1.1,8.8.8.8"
                            className="h-10 w-full"
                            value={value}
                            onChange={(e) =>
                              field.onChange(
                                e.target.value
                                  .split(",")
                                  .map((d) => d.trim())
                                  .filter(Boolean),
                              )
                            }
                          />
                        </FormControl>
                        <FormMessage />
                      </div>
                    );
                  }}
                />
                <FormField
                  control={networkForm.control}
                  name="subnet.allocation_pools"
                  render={({ field }) => {
                    return (
                      <div className="space-y-2">
                        <FormLabel className="text-sm font-medium">
                          Allocation Pools (optional, JSON array)
                        </FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder='[{"start": "10.10.10.10", "end": "10.10.10.100"}]'
                            className="min-h-[88px] w-full font-mono text-xs"
                            value={allocationPoolsText}
                            onChange={(e) =>
                              setAllocationPoolsText(e.target.value)
                            }
                            onBlur={() => {
                              const raw = allocationPoolsText.trim();
                              if (!raw) {
                                field.onChange([]);
                                networkForm.clearErrors(
                                  "subnet.allocation_pools",
                                );
                                return;
                              }
                              try {
                                const parsed = JSON.parse(
                                  raw,
                                ) as AllocationPool[];
                                if (
                                  Array.isArray(parsed) &&
                                  parsed.every(
                                    (p) =>
                                      typeof p?.start === "string" &&
                                      typeof p?.end === "string",
                                  )
                                ) {
                                  field.onChange(
                                    parsed as { start: string; end: string }[],
                                  );
                                  networkForm.clearErrors(
                                    "subnet.allocation_pools",
                                  );
                                } else {
                                  throw new Error("Invalid structure");
                                }
                              } catch {
                                networkForm.setError(
                                  "subnet.allocation_pools",
                                  {
                                    type: "manual",
                                    message:
                                      "Invalid JSON for allocation pools",
                                  },
                                );
                              }
                            }}
                          />
                        </FormControl>
                        <FormMessage />
                      </div>
                    );
                  }}
                />
                <FormField
                  control={networkForm.control}
                  name="subnet.host_routes"
                  render={({ field }) => {
                    const value = Array.isArray(field.value)
                      ? field.value.join(",")
                      : "";
                    return (
                      <div className="space-y-2">
                        <FormLabel className="text-sm font-medium">
                          Host Routes (optional, comma separated CIDR)
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder="10.0.0.0/24,192.168.0.0/24"
                            className="h-10 w-full"
                            value={value}
                            onChange={(e) =>
                              field.onChange(
                                e.target.value
                                  .split(",")
                                  .map((r) => r.trim())
                                  .filter(Boolean),
                              )
                            }
                          />
                        </FormControl>
                        <FormMessage />
                      </div>
                    );
                  }}
                />
              </div>
              <DialogFooter className="pt-4">
                <Button
                  type="submit"
                  disabled={createMutation.isPending}
                  className="w-full sm:w-auto min-w-[100px]"
                >
                  <span className="truncate">
                    {createMutation.isPending ? "Creating..." : "Create"}
                  </span>
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <Dialog open={showRouterDialog} onOpenChange={setShowRouterDialog}>
        <DialogContent className="mx-4 sm:mx-0 max-w-[calc(100vw-2rem)] sm:max-w-md bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border border-border/50 overflow-hidden">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold truncate">
              Create Router
            </DialogTitle>
            <DialogDescription className="text-sm leading-relaxed">
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
                        className="h-10 w-full"
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
                        className="h-10 w-full"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </div>
                )}
              />
              <DialogFooter className="flex flex-col sm:flex-row gap-2 sm:gap-2 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowRouterDialog(false)}
                  className="cursor-pointer w-full sm:w-auto order-2 sm:order-1"
                >
                  <span className="truncate">Cancel</span>
                </Button>
                <Button
                  type="submit"
                  disabled={createRouterMutation.isPending}
                  className="cursor-pointer w-full sm:w-auto order-1 sm:order-2 min-w-[100px]"
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
