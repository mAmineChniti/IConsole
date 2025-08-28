import { Button } from "@/components/ui/button";
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
  FormDescription,
  FormField,
  FormItem,
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
import { ClusterService, InfraService } from "@/lib/requests";
import { cn, makeDupSafeSelect } from "@/lib/utils";
import type { ClusterCreateRequest } from "@/types/RequestInterfaces";
import { ClusterCreateRequestSchema } from "@/types/RequestSchemas";
import type { ResourcesResponse } from "@/types/ResponseInterfaces";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Eye, EyeOff, Loader2, Plus } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

// Type removed as it's not used

interface CreateClusterDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated?: () => void;
}

export function CreateClusterDialog({
  open,
  onOpenChange,
  onCreated,
}: CreateClusterDialogProps) {
  const [showPassword, setShowPassword] = useState(false);
  const { data: resources } = useQuery<ResourcesResponse>({
    queryKey: ["clusterResources"],
    queryFn: () => InfraService.listResources(),
    enabled: open,
    initialData: {
      images: [],
      flavors: [],
      networks: [],
      keypairs: [],
      security_groups: [],
    } as ResourcesResponse,
  });

  // Ensure resources is never undefined
  const safeResources = resources ?? {
    images: [],
    flavors: [],
    networks: [],
    keypairs: [],
    security_groups: [],
  };

  const form = useForm<ClusterCreateRequest>({
    resolver: zodResolver(ClusterCreateRequestSchema),
    defaultValues: {
      name: "",
      password: "0000",
      nombremaster: 0,
      nombreworker: 0,
      node_config: {
        name_prefix: "",
        image_id: "",
        flavor_id: "",
        network_id: "",
        key_name: "",
        security_group: "",
      },
    },
  });

  const createCluster = useMutation({
    mutationFn: (formData: ClusterCreateRequest) => {
      const request: ClusterCreateRequest = {
        ...formData,
        node_config: {
          ...formData.node_config,
          name_prefix: formData.node_config.name_prefix ?? "k8s",
          security_group: formData.node_config.security_group ?? "default",
        },
      };

      return ClusterService.createAuto(request);
    },
    onSuccess: () => {
      toast.success("Cluster creation started");
      form.reset({
        name: "",
        password: "0000",
        nombremaster: 0,
        nombreworker: 0,
        node_config: {
          name_prefix: "",
          image_id: "",
          flavor_id: "",
          network_id: "",
          security_group: "",
          key_name: "",
        },
      });
      onOpenChange(false);
      onCreated?.();
    },
    onError: (err: Error) => {
      toast.error(`Failed to create cluster: ${err.message}`);
    },
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="mx-4 sm:mx-0 max-w-[calc(100vw-2rem)] sm:max-w-2xl bg-card text-card-foreground border border-border/50 shadow-lg left-1/2 translate-x-[-50%] rounded-2xl">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold truncate">
            Create New Kubernetes Cluster
          </DialogTitle>
          <DialogDescription>
            Configure your new Kubernetes cluster with the options below.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit((data) => createCluster.mutate(data))}
            className="space-y-6"
          >
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Cluster Name</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="my-cluster"
                      className="w-full h-10 rounded-full"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password (optional)</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        type={showPassword ? "text" : "password"}
                        placeholder="Leave empty for default (0000)"
                        className={cn(
                          "w-full h-10 rounded-full pr-10",
                          "border border-input bg-background text-foreground",
                          "focus:border-ring focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background",
                        )}
                        {...field}
                        value={field.value ?? ""}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-2 top-1/2 flex-shrink-0 p-0 w-6 h-6 rounded-full transform -translate-y-1/2 cursor-pointer sm:w-8 sm:h-8"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? (
                          <EyeOff className="w-4 h-4 text-muted-foreground" />
                        ) : (
                          <Eye className="w-4 h-4 text-muted-foreground" />
                        )}
                      </Button>
                    </div>
                  </FormControl>
                  <FormDescription>
                    Default password for the cluster if not specified: 0000
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="nombremaster"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Master Nodes</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min={1}
                        max={5}
                        className="w-full h-10 rounded-full"
                        {...field}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="nombreworker"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Worker Nodes</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min={0}
                        max={10}
                        className="w-full h-10 rounded-full"
                        {...field}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="node_config.image_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Image</FormLabel>
                  <FormControl>
                    {(() => {
                      const { options, toForm, fromForm } = makeDupSafeSelect(
                        safeResources.images,
                        (img) => img.id,
                        (img) => img.name ?? `Image (${img.id})`,
                      );

                      const selectedItem = safeResources.images.find(
                        (img) => img.id === field.value,
                      );
                      const duplicateCount = selectedItem
                        ? safeResources.images.filter(
                            (img) => img.name === selectedItem.name,
                          ).length
                        : 0;

                      return (
                        <Select
                          onValueChange={(val) => field.onChange(toForm(val))}
                          value={fromForm(field.value)}
                        >
                          <FormControl>
                            <SelectTrigger className="w-full rounded-full cursor-pointer">
                              <SelectValue>
                                {field.value && selectedItem
                                  ? `${selectedItem?.name ?? `Image (${selectedItem?.id})`}${duplicateCount > 1 ? ` (${safeResources.images.findIndex((img) => img.id === field.value) + 1})` : ""}`
                                  : "Select an image"}
                              </SelectValue>
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {options.map((option) => {
                              const optionDuplicates =
                                safeResources.images.filter((img) => {
                                  if (
                                    !option.original ||
                                    !("name" in option.original)
                                  )
                                    return false;
                                  return img.name === option.original.name;
                                }).length;

                              return (
                                <SelectItem
                                  key={option.key}
                                  value={option.value}
                                >
                                  {optionDuplicates > 1
                                    ? `${option.label} (${
                                        safeResources.images.findIndex(
                                          (img) => {
                                            if (
                                              !option.original ||
                                              !("id" in option.original)
                                            )
                                              return false;
                                            return (
                                              img.id === option.original.id
                                            );
                                          },
                                        ) + 1
                                      })`
                                    : option.label}
                                </SelectItem>
                              );
                            })}
                          </SelectContent>
                        </Select>
                      );
                    })()}
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="node_config.flavor_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Instance Type</FormLabel>
                  <FormControl>
                    {(() => {
                      const { options, toForm, fromForm } = makeDupSafeSelect(
                        safeResources.flavors,
                        (f) => f.id,
                        (f) => f.name,
                      );

                      const selectedItem = safeResources.flavors.find(
                        (f) => f.id === field.value,
                      );
                      const duplicateCount = selectedItem
                        ? safeResources.flavors.filter(
                            (f) => f.name === selectedItem.name,
                          ).length
                        : 0;

                      return (
                        <Select
                          onValueChange={(val) => field.onChange(toForm(val))}
                          value={fromForm(field.value)}
                        >
                          <FormControl>
                            <SelectTrigger className="w-full rounded-full cursor-pointer">
                              <SelectValue>
                                {field.value && selectedItem
                                  ? `${selectedItem?.name}${duplicateCount > 1 ? ` (${safeResources.flavors.findIndex((f) => f.id === field.value) + 1})` : ""} (${selectedItem?.vcpus} vCPU, ${selectedItem?.ram}MB RAM, ${selectedItem?.disk}GB Disk)`
                                  : "Select a flavor"}
                              </SelectValue>
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {options.map((option) => {
                              const optionDuplicates =
                                safeResources.flavors.filter((f) => {
                                  if (
                                    !option.original ||
                                    !("name" in option.original)
                                  )
                                    return false;
                                  return f.name === option.original.name;
                                }).length;

                              return (
                                <SelectItem
                                  key={option.key}
                                  value={option.value}
                                >
                                  {`${option.label}${
                                    optionDuplicates > 1
                                      ? ` (${
                                          safeResources.flavors.findIndex(
                                            (f) => {
                                              if (
                                                !option.original ||
                                                !("id" in option.original)
                                              )
                                                return false;
                                              return (
                                                f.id === option.original.id
                                              );
                                            },
                                          ) + 1
                                        })`
                                      : ""
                                  } (${option.original?.vcpus ?? "N/A"} vCPU, ${option.original?.ram ?? "N/A"}MB RAM, ${option.original?.disk ?? "N/A"}GB Disk)`}
                                </SelectItem>
                              );
                            })}
                          </SelectContent>
                        </Select>
                      );
                    })()}
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="node_config.network_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Network</FormLabel>
                  <FormControl>
                    {(() => {
                      const { options, toForm, fromForm } = makeDupSafeSelect(
                        safeResources.networks,
                        (n) => n.id,
                        (n) => n.name ?? `Network (${n.id})`,
                      );

                      const selectedItem = safeResources.networks.find(
                        (n) => n.id === field.value,
                      );
                      const duplicateCount = selectedItem
                        ? safeResources.networks.filter(
                            (n) =>
                              (n.name ?? `Network (${n.id})`) ===
                              (selectedItem?.name ??
                                `Network (${selectedItem?.id})`),
                          ).length
                        : 0;

                      return (
                        <Select
                          onValueChange={(val) => field.onChange(toForm(val))}
                          value={fromForm(field.value)}
                        >
                          <FormControl>
                            <SelectTrigger className="w-full rounded-full cursor-pointer">
                              <SelectValue>
                                {field.value && selectedItem
                                  ? `${selectedItem?.name ?? `Network (${selectedItem?.id})`}${duplicateCount > 1 ? ` (${safeResources.networks.findIndex((n) => n.id === field.value) + 1})` : ""}`
                                  : "Select a network"}
                              </SelectValue>
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {options.map((option) => {
                              const optionDuplicates =
                                safeResources.networks.filter((n) => {
                                  if (
                                    !option.original ||
                                    !("name" in option.original) ||
                                    !("id" in option.original)
                                  )
                                    return false;
                                  return (
                                    (n.name ?? `Network (${n.id})`) ===
                                    (option.original.name ??
                                      `Network (${option.original.id})`)
                                  );
                                }).length;

                              return (
                                <SelectItem
                                  key={option.key}
                                  value={option.value}
                                >
                                  {optionDuplicates > 1
                                    ? `${option.label} (${
                                        safeResources.networks.findIndex(
                                          (n) => {
                                            if (
                                              !option.original ||
                                              !("id" in option.original)
                                            )
                                              return false;
                                            return n.id === option.original.id;
                                          },
                                        ) + 1
                                      })`
                                    : option.label}
                                </SelectItem>
                              );
                            })}
                          </SelectContent>
                        </Select>
                      );
                    })()}
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="node_config.key_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>SSH Key Pair</FormLabel>
                    <FormControl>
                      {(() => {
                        const { options, toForm, fromForm } = makeDupSafeSelect(
                          safeResources.keypairs,
                          (kp) => kp.name,
                          (kp) => kp.name,
                        );

                        const selectedItem = safeResources.keypairs.find(
                          (kp) => kp.name === field.value,
                        );
                        const duplicateCount = selectedItem
                          ? safeResources.keypairs.filter(
                              (kp) => kp.name === selectedItem.name,
                            ).length
                          : 0;

                        return (
                          <Select
                            onValueChange={(val) => field.onChange(toForm(val))}
                            value={fromForm(field.value)}
                          >
                            <FormControl>
                              <SelectTrigger className="w-full rounded-full cursor-pointer">
                                <SelectValue>
                                  {field.value && selectedItem
                                    ? `${selectedItem?.name}${duplicateCount > 1 ? ` (${safeResources.keypairs.findIndex((kp) => kp.name === field.value) + 1})` : ""}`
                                    : "Select a key pair"}
                                </SelectValue>
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {options.map((option) => {
                                const optionDuplicates =
                                  safeResources.keypairs.filter((kp) => {
                                    if (
                                      !option.original ||
                                      !("name" in option.original)
                                    )
                                      return false;
                                    return kp.name === option.original.name;
                                  }).length;

                                return (
                                  <SelectItem
                                    key={option.key}
                                    value={option.value}
                                  >
                                    {optionDuplicates > 1
                                      ? `${option.label} (${
                                          safeResources.keypairs.findIndex(
                                            (kp) => {
                                              if (
                                                !option.original ||
                                                !("name" in option.original)
                                              )
                                                return false;
                                              return (
                                                kp.name === option.original.name
                                              );
                                            },
                                          ) + 1
                                        })`
                                      : option.label}
                                  </SelectItem>
                                );
                              })}
                            </SelectContent>
                          </Select>
                        );
                      })()}
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="node_config.security_group"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Security Group</FormLabel>
                    <FormControl>
                      {(() => {
                        const { options, toForm, fromForm } = makeDupSafeSelect(
                          safeResources.security_groups,
                          (sg) => sg.name,
                          (sg) => sg.name,
                        );

                        const selectedItem = safeResources.security_groups.find(
                          (sg) => sg.name === field.value,
                        );
                        const duplicateCount = selectedItem
                          ? safeResources.security_groups.filter(
                              (sg) => sg.name === selectedItem.name,
                            ).length
                          : 0;

                        return (
                          <Select
                            onValueChange={(val) => field.onChange(toForm(val))}
                            value={fromForm(field.value)}
                          >
                            <FormControl>
                              <SelectTrigger className="w-full rounded-full cursor-pointer">
                                <SelectValue>
                                  {field.value && selectedItem
                                    ? `${selectedItem?.name}${duplicateCount > 1 ? ` (${safeResources.security_groups.findIndex((sg) => sg.name === field.value) + 1})` : ""}`
                                    : "Select a security group"}
                                </SelectValue>
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {options.map((option) => {
                                const optionDuplicates =
                                  safeResources.security_groups.filter((sg) => {
                                    if (
                                      !option.original ||
                                      !("name" in option.original)
                                    )
                                      return false;
                                    return sg.name === option.original.name;
                                  }).length;

                                return (
                                  <SelectItem
                                    key={option.key}
                                    value={option.value}
                                  >
                                    {optionDuplicates > 1
                                      ? `${option.label} (${
                                          safeResources.security_groups.findIndex(
                                            (sg) => {
                                              if (
                                                !option.original ||
                                                !("name" in option.original)
                                              )
                                                return false;
                                              return (
                                                sg.name === option.original.name
                                              );
                                            },
                                          ) + 1
                                        })`
                                      : option.label}
                                  </SelectItem>
                                );
                              })}
                            </SelectContent>
                          </Select>
                        );
                      })()}
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={createCluster.isPending}
                className="order-2 w-full rounded-full cursor-pointer sm:order-1 sm:w-auto"
              >
                <span className="truncate">Cancel</span>
              </Button>
              <Button
                type="submit"
                disabled={createCluster.isPending}
                className="order-1 gap-2 w-full rounded-full cursor-pointer sm:order-2 sm:w-auto min-w-[140px]"
              >
                {createCluster.isPending ? (
                  <>
                    <Loader2 className="flex-shrink-0 w-4 h-4 animate-spin" />
                    <span className="truncate">Creating...</span>
                  </>
                ) : (
                  <>
                    <Plus className="flex-shrink-0 w-4 h-4" />
                    <span className="truncate">Create</span>
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
