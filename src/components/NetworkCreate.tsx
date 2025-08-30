"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
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
  useEffect(() => {
    const pools = form.getValues("subnet.allocation_pools") ?? [];
    setAllocationPoolsText(JSON.stringify(pools));
  }, [form]);

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
      <div className="flex gap-4 items-center mb-2">
        {onBack && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onBack}
            className="flex gap-2 items-center rounded-full border transition-all duration-200 cursor-pointer text-muted-foreground bg-card border-border/50 hover:text-foreground"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Networks
          </Button>
        )}
      </div>

      <Card className="overflow-hidden rounded-xl border shadow-lg bg-card text-card-foreground border-border/50">
        <CardHeader className="space-y-3">
          <CardTitle className="flex gap-2 items-center text-lg">
            <div className="flex-shrink-0 p-2 rounded-full bg-primary/10">
              <Cpu className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
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
                      <FormLabel className="flex gap-2 items-center text-sm font-medium">
                        <span className="flex justify-center items-center p-1 rounded-full bg-muted">
                          <NetworkIcon className="w-4 h-4 text-muted-foreground" />
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
                      <FormLabel className="flex gap-2 items-center text-sm font-medium">
                        <span className="flex justify-center items-center p-1 rounded-full bg-muted">
                          <Gauge className="w-4 h-4 text-muted-foreground" />
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
                      <FormLabel className="flex gap-2 items-center text-sm font-medium">
                        <span className="flex justify-center items-center p-1 rounded-full bg-muted">
                          <FileText className="w-4 h-4 text-muted-foreground" />
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
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:col-span-2">
                  <FormField
                    control={form.control}
                    name="shared"
                    render={({ field }) => (
                      <div className="flex gap-2 items-center">
                        <Checkbox
                          id="shared"
                          checked={!!field.value}
                          onCheckedChange={(c) => field.onChange(Boolean(c))}
                          className="cursor-pointer"
                        />
                        <FormLabel
                          htmlFor="shared"
                          className="flex gap-2 items-center text-sm font-medium"
                        >
                          <span className="flex justify-center items-center p-1 rounded-full bg-muted">
                            <Share2 className="w-4 h-4 text-muted-foreground" />
                          </span>
                          Shared
                        </FormLabel>
                        <FormMessage />
                      </div>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="port_security_enabled"
                    render={({ field }) => (
                      <div className="flex gap-2 items-center">
                        <Checkbox
                          id="port_security"
                          checked={!!field.value}
                          onCheckedChange={(c) => field.onChange(Boolean(c))}
                          className="cursor-pointer"
                        />
                        <FormLabel
                          htmlFor="port_security"
                          className="flex gap-2 items-center text-sm font-medium"
                        >
                          <span className="flex justify-center items-center p-1 rounded-full bg-muted">
                            <ShieldCheck className="w-4 h-4 text-muted-foreground" />
                          </span>
                          Port Security
                        </FormLabel>
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
                        <FormLabel className="flex gap-2 items-center text-sm font-medium">
                          <span className="flex justify-center items-center p-1 rounded-full bg-muted">
                            <MapIcon className="w-4 h-4 text-muted-foreground" />
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
                      <FormLabel className="flex gap-2 items-center text-sm font-medium">
                        <span className="flex justify-center items-center p-1 rounded-full bg-muted">
                          <SquareStack className="w-4 h-4 text-muted-foreground" />
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
                      <FormLabel className="flex gap-2 items-center text-sm font-medium">
                        <span className="flex justify-center items-center p-1 rounded-full bg-muted">
                          <Globe className="w-4 h-4 text-muted-foreground" />
                        </span>
                        IP Version
                      </FormLabel>
                      <Select
                        value={String(field.value)}
                        onValueChange={(v) =>
                          field.onChange(Number(v) as 4 | 6)
                        }
                      >
                        <FormControl>
                          <SelectTrigger className="w-full h-10 rounded-full cursor-pointer">
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
                  control={form.control}
                  name="subnet.enable_dhcp"
                  render={({ field }) => (
                    <div className="flex gap-2 items-center pt-7">
                      <Checkbox
                        id="enable_dhcp"
                        checked={!!field.value}
                        onCheckedChange={(c) => field.onChange(Boolean(c))}
                        className="cursor-pointer"
                      />
                      <FormLabel
                        htmlFor="enable_dhcp"
                        className="flex gap-2 items-center text-sm font-medium"
                      >
                        <span className="flex justify-center items-center p-1 rounded-full bg-muted">
                          <Router className="w-4 h-4 text-muted-foreground" />
                        </span>
                        Enable DHCP
                      </FormLabel>
                      <FormMessage />
                    </div>
                  )}
                />
                <FormField
                  control={form.control}
                  name="subnet.cidr"
                  render={({ field }) => (
                    <div className="space-y-2">
                      <FormLabel className="flex gap-2 items-center text-sm font-medium">
                        <span className="flex justify-center items-center p-1 rounded-full bg-muted">
                          <Route className="w-4 h-4 text-muted-foreground" />
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
                      <FormLabel className="flex gap-2 items-center text-sm font-medium">
                        <span className="flex justify-center items-center p-1 rounded-full bg-muted">
                          <DoorOpen className="w-4 h-4 text-muted-foreground" />
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
                        <FormLabel className="flex gap-2 items-center text-sm font-medium">
                          <span className="flex justify-center items-center p-1 rounded-full bg-muted">
                            <Server className="w-4 h-4 text-muted-foreground" />
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
                        <FormLabel className="flex gap-2 items-center text-sm font-medium">
                          <span className="flex justify-center items-center p-1 rounded-full bg-muted">
                            <GitBranch className="w-4 h-4 text-muted-foreground" />
                          </span>
                          Allocation Pools (optional, JSON array)
                        </FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder='[{"start": "10.10.10.10", "end": "10.10.10.100"}]'
                            className="w-full font-mono text-xs min-h-[88px]"
                            value={allocationPoolsText}
                            onChange={(e) =>
                              setAllocationPoolsText(e.target.value)
                            }
                            onBlur={() => {
                              const raw = allocationPoolsText.trim();
                              if (!raw) {
                                field.onChange([]);
                                form.clearErrors("subnet.allocation_pools");
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
                        <FormLabel className="flex gap-2 items-center text-sm font-medium">
                          <span className="flex justify-center items-center p-1 rounded-full bg-muted">
                            <Route className="w-4 h-4 text-muted-foreground" />
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

              <div className="flex gap-2 justify-end pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => onBack?.()}
                  className="rounded-full cursor-pointer"
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
