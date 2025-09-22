"use client";

import { XCombobox } from "@/components/reusable/XCombobox";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { NetworkService } from "@/lib/requests";
import { cn } from "@/lib/utils";
import type {
  AllocationPool,
  NetworkCreateRequest,
} from "@/types/RequestInterfaces";
import { NetworkCreateRequestSchema } from "@/types/RequestSchemas";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import {
  ArrowLeft,
  Cpu,
  DoorOpen,
  FileText,
  Gauge,
  GitBranch,
  Globe,
  Map as MapIcon,
  Network as NetworkIcon,
  Route,
  Router,
  Server,
  Share2,
  ShieldCheck,
  SquareStack,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

export function NetworkCreate({
  onBack,
  onCreated,
}: {
  onBack?: () => void;
  onCreated?: () => void;
}) {
  const form = useForm<NetworkCreateRequest>({
    resolver: zodResolver(NetworkCreateRequestSchema),
    defaultValues: {
      name: "",
      description: undefined,
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
      is_external: false,
    },
  });

  const [allocationPoolsText, setAllocationPoolsText] = useState(
    JSON.stringify(
      form.getValues("subnet.allocation_pools") ?? [],
      undefined,
      2,
    ),
  );

  useEffect(() => {
    const sub = form.watch((value, { name }) => {
      if (name === "subnet.allocation_pools") {
        setAllocationPoolsText(
          JSON.stringify(value?.subnet?.allocation_pools ?? [], undefined, 2),
        );
      }
    });
    return () => sub?.unsubscribe?.();
  }, [form]);

  const createMutation = useMutation({
    mutationFn: async (formData: NetworkCreateRequest) => {
      const payload: NetworkCreateRequest = {
        name: formData.name.trim(),
        description: formData.description?.trim(),
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
        is_external: formData.is_external,
      };
      return NetworkService.create(payload);
    },
    onSuccess: () => {
      toast.success("Network created");
      form.reset();
      onCreated?.();
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

  return (
    <div className="space-y-6">
      <div className="mb-2 flex items-center gap-4">
        {onBack && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onBack}
            className="text-muted-foreground bg-card border-border/50 hover:text-foreground flex cursor-pointer items-center gap-2 rounded-full border transition-all duration-200"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Networks
          </Button>
        )}
      </div>

      <Card className="text-card-foreground border-border/50 overflow-hidden rounded-xl border bg-neutral-50 shadow-lg dark:bg-neutral-900">
        <CardHeader className="space-y-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <div className="bg-primary/10 flex-shrink-0 rounded-full p-2">
              <Cpu className="text-primary h-4 w-4 sm:h-5 sm:w-5" />
            </div>
            <span className="truncate">Create Network</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit((data) =>
                createMutation.mutate(data),
              )}
              className="space-y-4"
            >
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <h3 className="text-sm font-semibold md:col-span-2">
                  Network Settings
                </h3>
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <div className="space-y-2">
                      <FormLabel className="flex items-center gap-2 text-sm font-medium">
                        <span className="bg-muted flex items-center justify-center rounded-full p-1">
                          <NetworkIcon className="text-muted-foreground h-4 w-4" />
                        </span>
                        Network Name
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="network-name"
                          className={cn(
                            "bg-input text-foreground h-10 w-full rounded-full",
                            form.formState.errors.name && "border-destructive",
                          )}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </div>
                  )}
                />
                <FormField
                  control={form.control}
                  name="mtu"
                  render={({ field }) => (
                    <div className="space-y-2">
                      <FormLabel className="flex items-center gap-2 text-sm font-medium">
                        <span className="bg-muted flex items-center justify-center rounded-full p-1">
                          <Gauge className="text-muted-foreground h-4 w-4" />
                        </span>
                        MTU
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="1500"
                          className={cn(
                            "bg-input text-foreground h-10 w-full rounded-full",
                            form.formState.errors.mtu && "border-destructive",
                          )}
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
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <div className="space-y-2 md:col-span-2">
                      <FormLabel className="flex items-center gap-2 text-sm font-medium">
                        <span className="bg-muted flex items-center justify-center rounded-full p-1">
                          <FileText className="text-muted-foreground h-4 w-4" />
                        </span>
                        Description
                      </FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Network description"
                          className={cn(
                            "bg-input text-foreground min-h-24 w-full",
                            form.formState.errors.description &&
                              "border-destructive",
                          )}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </div>
                  )}
                />
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 md:col-span-2">
                  <FormField
                    control={form.control}
                    name="shared"
                    render={({ field }) => (
                      <div className="flex items-center gap-2">
                        <FormLabel
                          htmlFor="shared"
                          className="flex items-center gap-2 text-sm font-medium"
                        >
                          <span className="bg-muted flex items-center justify-center rounded-full p-1">
                            <Share2 className="text-muted-foreground h-4 w-4" />
                          </span>
                          Shared
                        </FormLabel>
                        <Switch
                          checked={!!field.value}
                          onCheckedChange={(c: boolean) =>
                            field.onChange(Boolean(c))
                          }
                          className="cursor-pointer"
                        />
                        <FormMessage />
                      </div>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="port_security_enabled"
                    render={({ field }) => (
                      <div className="flex items-center gap-2">
                        <FormLabel
                          htmlFor="port_security"
                          className="flex items-center gap-2 text-sm font-medium"
                        >
                          <span className="bg-muted flex items-center justify-center rounded-full p-1">
                            <ShieldCheck className="text-muted-foreground h-4 w-4" />
                          </span>
                          Port Security
                        </FormLabel>
                        <Switch
                          checked={!!field.value}
                          onCheckedChange={(c: boolean) =>
                            field.onChange(Boolean(c))
                          }
                          className="cursor-pointer"
                        />
                        <FormMessage />
                      </div>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="is_external"
                    render={({ field }) => (
                      <div className="flex items-center gap-2">
                        <FormLabel
                          htmlFor="is_external"
                          className="flex items-center gap-2 text-sm font-medium"
                        >
                          <span className="bg-muted flex items-center justify-center rounded-full p-1">
                            <Globe className="text-muted-foreground h-4 w-4" />
                          </span>
                          External
                        </FormLabel>
                        <Switch
                          checked={!!field.value}
                          onCheckedChange={(c: boolean) =>
                            field.onChange(Boolean(c))
                          }
                          className="cursor-pointer"
                        />
                        <FormMessage />
                      </div>
                    )}
                  />
                </div>
                <FormField
                  control={form.control}
                  name="availability_zone_hints"
                  render={({ field }) => {
                    const value = Array.isArray(field.value)
                      ? field.value.join(",")
                      : "";
                    return (
                      <div className="space-y-2 md:col-span-2">
                        <FormLabel className="flex items-center gap-2 text-sm font-medium">
                          <span className="bg-muted flex items-center justify-center rounded-full p-1">
                            <MapIcon className="text-muted-foreground h-4 w-4" />
                          </span>
                          Availability Zone Hints (comma separated)
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder="zone1,zone2"
                            className={cn(
                              "bg-input text-foreground h-10 w-full rounded-full",
                              form.formState.errors.availability_zone_hints &&
                                "border-destructive",
                            )}
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

              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <h3 className="text-sm font-semibold md:col-span-2">
                  Subnet Settings
                </h3>
                <FormField
                  control={form.control}
                  name="subnet.name"
                  render={({ field }) => (
                    <div className="space-y-2">
                      <FormLabel className="flex items-center gap-2 text-sm font-medium">
                        <span className="bg-muted flex items-center justify-center rounded-full p-1">
                          <SquareStack className="text-muted-foreground h-4 w-4" />
                        </span>
                        Subnet Name
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="subnet-name (auto-generated if empty)"
                          className={cn(
                            "bg-input text-foreground h-10 w-full rounded-full",
                            form.formState.errors.subnet?.name &&
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
                  control={form.control}
                  name="subnet.ip_version"
                  render={({ field }) => (
                    <div className="space-y-2">
                      <FormLabel className="flex items-center gap-2 text-sm font-medium">
                        <span className="bg-muted flex items-center justify-center rounded-full p-1">
                          <Globe className="text-muted-foreground h-4 w-4" />
                        </span>
                        IP Version
                      </FormLabel>
                      <FormControl>
                        <XCombobox
                          type="IP version"
                          clearable={false}
                          data={[
                            { label: "IPv4", value: "4" },
                            { label: "IPv6", value: "6" },
                          ]}
                          value={String(field.value)}
                          onChange={(v) => field.onChange(Number(v) as 4 | 6)}
                          placeholder="Select IP Version"
                          className="w-full"
                        />
                      </FormControl>
                      <FormMessage />
                    </div>
                  )}
                />
                <FormField
                  control={form.control}
                  name="subnet.enable_dhcp"
                  render={({ field }) => (
                    <div className="flex items-center gap-2 pt-7">
                      <FormLabel
                        htmlFor="enable_dhcp"
                        className="flex items-center gap-2 text-sm font-medium"
                      >
                        <span className="bg-muted flex items-center justify-center rounded-full p-1">
                          <Router className="text-muted-foreground h-4 w-4" />
                        </span>
                        Enable DHCP
                      </FormLabel>
                      <Switch
                        checked={!!field.value}
                        onCheckedChange={(c: boolean) =>
                          field.onChange(Boolean(c))
                        }
                        className="cursor-pointer"
                      />
                      <FormMessage />
                    </div>
                  )}
                />
                <FormField
                  control={form.control}
                  name="subnet.cidr"
                  render={({ field }) => (
                    <div className="space-y-2">
                      <FormLabel className="flex items-center gap-2 text-sm font-medium">
                        <span className="bg-muted flex items-center justify-center rounded-full p-1">
                          <Route className="text-muted-foreground h-4 w-4" />
                        </span>
                        CIDR
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="10.10.10.0/24"
                          className={cn(
                            "bg-input text-foreground h-10 w-full rounded-full",
                            form.formState.errors.subnet?.cidr &&
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
                  control={form.control}
                  name="subnet.gateway_ip"
                  render={({ field }) => (
                    <div className="space-y-2">
                      <FormLabel className="flex items-center gap-2 text-sm font-medium">
                        <span className="bg-muted flex items-center justify-center rounded-full p-1">
                          <DoorOpen className="text-muted-foreground h-4 w-4" />
                        </span>
                        Gateway IP
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="10.10.10.1"
                          className={cn(
                            "bg-input text-foreground h-10 w-full rounded-full",
                            form.formState.errors.subnet?.gateway_ip &&
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
                  control={form.control}
                  name="subnet.dns_nameservers"
                  render={({ field }) => {
                    const value = Array.isArray(field.value)
                      ? field.value.join(",")
                      : "";
                    return (
                      <div className="space-y-2 md:col-span-2">
                        <FormLabel className="flex items-center gap-2 text-sm font-medium">
                          <span className="bg-muted flex items-center justify-center rounded-full p-1">
                            <Server className="text-muted-foreground h-4 w-4" />
                          </span>
                          DNS Nameservers (comma separated)
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder="1.1.1.1,8.8.8.8"
                            className={cn(
                              "bg-input text-foreground h-10 w-full rounded-full",
                              form.formState.errors.subnet?.dns_nameservers &&
                                "border-destructive",
                            )}
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
                  control={form.control}
                  name="subnet.allocation_pools"
                  render={({ field }) => {
                    return (
                      <div className="space-y-2 md:col-span-2">
                        <FormLabel className="flex items-center gap-2 text-sm font-medium">
                          <span className="bg-muted flex items-center justify-center rounded-full p-1">
                            <GitBranch className="text-muted-foreground h-4 w-4" />
                          </span>
                          Allocation Pools (optional, JSON array)
                        </FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder='[{"start": "10.10.10.10", "end": "10.10.10.100"}]'
                            className="min-h-[88px] w-full font-mono text-xs"
                            value={allocationPoolsText}
                            onChange={(e) => {
                              const raw = e.target.value;
                              setAllocationPoolsText(raw);
                              const trimmed = raw.trim();
                              if (!trimmed) {
                                field.onChange([]);
                                form.clearErrors("subnet.allocation_pools");
                                return;
                              }
                              try {
                                const parsed = JSON.parse(
                                  trimmed,
                                ) as AllocationPool[];
                                if (
                                  Array.isArray(parsed) &&
                                  parsed.every(
                                    (p) =>
                                      typeof p?.start === "string" &&
                                      typeof p?.end === "string",
                                  )
                                ) {
                                  field.onChange(parsed);
                                  form.clearErrors("subnet.allocation_pools");
                                } else {
                                  throw new Error("Invalid structure");
                                }
                              } catch {
                                form.setError("subnet.allocation_pools", {
                                  type: "manual",
                                  message: "Invalid JSON for allocation pools",
                                });
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
                  control={form.control}
                  name="subnet.host_routes"
                  render={({ field }) => {
                    const value = Array.isArray(field.value)
                      ? field.value.join(",")
                      : "";
                    return (
                      <div className="space-y-2 md:col-span-2">
                        <FormLabel className="flex items-center gap-2 text-sm font-medium">
                          <span className="bg-muted flex items-center justify-center rounded-full p-1">
                            <Route className="text-muted-foreground h-4 w-4" />
                          </span>
                          Host Routes (optional, comma separated CIDR)
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder="10.0.0.0/24,192.168.0.0/24"
                            className={cn(
                              "bg-input text-foreground h-10 w-full rounded-full",
                              form.formState.errors.subnet?.host_routes &&
                                "border-destructive",
                            )}
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

              <div className="flex justify-end gap-2 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => onBack?.()}
                  className="cursor-pointer rounded-full"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={createMutation.isPending}
                  className={cn(
                    "bg-primary text-primary-foreground min-w-[100px] cursor-pointer rounded-full",
                    createMutation.isPending && "opacity-70",
                  )}
                >
                  <span className="truncate">
                    {createMutation.isPending ? "Creating..." : "Create"}
                  </span>
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
