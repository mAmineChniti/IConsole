"use client";

import { XCombobox } from "@/components/reusable/XCombobox";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { ScaleService } from "@/lib/requests";
import type { ScaleNodeRequest } from "@/types/RequestInterfaces";
import { ScaleNodeRequestSchema } from "@/types/RequestSchemas";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import {
  Globe,
  HardDrive,
  Key,
  Loader2,
  Lock,
  Network,
  ServerCog,
  Tag,
  Terminal,
  User,
} from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

export function Scaling() {
  const nodeForm = useForm<ScaleNodeRequest>({
    resolver: zodResolver(ScaleNodeRequestSchema),
    defaultValues: {
      ip: "",
      hostname: "",
      type: "compute",
      neutron_external_interface: "eth1",
      network_interface: "eth0",
      ssh_user: "kollauser",
      ssh_password: "",
      deploy_tag: "compute",
    },
  });

  const addNodeMutation = useMutation({
    mutationFn: (data: ScaleNodeRequest) => ScaleService.addNode(data),
    onSuccess: (res) => {
      toast.success(res.message || "Node scaling initiated");
      nodeForm.reset();
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
    <div className="w-full">
      <Card className="text-card-foreground border-border/50 mx-auto w-full rounded-xl border bg-neutral-50 shadow-lg dark:bg-neutral-900">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <div className="flex items-center gap-4">
              <div className="flex items-center justify-center rounded-full bg-gradient-to-br from-blue-600 to-blue-400 p-3">
                <ServerCog className="h-7 w-7 text-white" />
              </div>
              <div>
                <h1 className="mb-1 bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-2xl font-bold tracking-tight text-transparent dark:from-blue-400 dark:to-indigo-400">
                  Add Node
                </h1>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  Register a new control, compute, or storage node and initiate
                  targeted kolla-ansible deployment
                </p>
              </div>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...nodeForm}>
            <form
              onSubmit={nodeForm.handleSubmit((data) =>
                addNodeMutation.mutate(data),
              )}
              className="space-y-4"
            >
              <div className="space-y-3">
                <h3 className="text-foreground text-lg font-semibold">
                  Node Information
                </h3>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <FormField
                    control={nodeForm.control}
                    name="ip"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2 font-semibold">
                          <div className="bg-muted flex items-center justify-center rounded-full p-1">
                            <Globe className="text-muted-foreground h-4 w-4" />
                          </div>
                          IP Address
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder="192.168.1.10"
                            className="h-10 rounded-full"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          The IP address of the node to be added
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={nodeForm.control}
                    name="hostname"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2 font-semibold">
                          <div className="bg-muted flex items-center justify-center rounded-full p-1">
                            <Terminal className="text-muted-foreground h-4 w-4" />
                          </div>
                          Hostname
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder="node-compute-01"
                            className="h-10 rounded-full"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          Unique hostname for the node
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <FormField
                    control={nodeForm.control}
                    name="type"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2 font-semibold">
                          <div className="bg-muted flex items-center justify-center rounded-full p-1">
                            <HardDrive className="text-muted-foreground h-4 w-4" />
                          </div>
                          Node Type
                        </FormLabel>
                        <FormControl>
                          <XCombobox
                            data={[
                              { label: "Control", value: "control" },
                              { label: "Compute", value: "compute" },
                              { label: "Storage", value: "storage" },
                            ]}
                            value={field.value}
                            onChange={field.onChange}
                            type="node type"
                            placeholder="Select node type"
                            className="!h-10 w-full cursor-pointer rounded-full"
                          />
                        </FormControl>
                        <FormDescription>
                          The role this node will serve in the cluster
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={nodeForm.control}
                    name="deploy_tag"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2 font-semibold">
                          <div className="bg-muted flex items-center justify-center rounded-full p-1">
                            <Tag className="text-muted-foreground h-4 w-4" />
                          </div>
                          Deploy Tag
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder="compute"
                            className="h-10 rounded-full"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          Ansible tag for targeted deployment
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              <div className="border-t pt-4">
                <div className="space-y-3">
                  <h3 className="text-foreground flex items-center gap-2 text-lg font-semibold">
                    <Network className="text-primary h-5 w-5" />
                    Network Configuration
                  </h3>
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <FormField
                      control={nodeForm.control}
                      name="neutron_external_interface"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center gap-2 font-semibold">
                            <div className="bg-muted flex items-center justify-center rounded-full p-1">
                              <Network className="text-muted-foreground h-4 w-4" />
                            </div>
                            Neutron External Interface
                          </FormLabel>
                          <FormControl>
                            <Input
                              placeholder="eth1"
                              className="h-10 rounded-full"
                              {...field}
                            />
                          </FormControl>
                          <FormDescription>
                            Network interface for external connectivity
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={nodeForm.control}
                      name="network_interface"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center gap-2 font-semibold">
                            <div className="bg-muted flex items-center justify-center rounded-full p-1">
                              <Network className="text-muted-foreground h-4 w-4" />
                            </div>
                            Network Interface
                          </FormLabel>
                          <FormControl>
                            <Input
                              placeholder="eth0"
                              className="h-10 rounded-full"
                              {...field}
                            />
                          </FormControl>
                          <FormDescription>
                            Primary network interface for the node
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              </div>

              <div className="border-t pt-4">
                <div className="space-y-3">
                  <h3 className="text-foreground flex items-center gap-2 text-lg font-semibold">
                    <Lock className="text-primary h-5 w-5" />
                    SSH Authentication
                  </h3>
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <FormField
                      control={nodeForm.control}
                      name="ssh_user"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center gap-2 font-semibold">
                            <div className="bg-muted flex items-center justify-center rounded-full p-1">
                              <User className="text-muted-foreground h-4 w-4" />
                            </div>
                            SSH User
                          </FormLabel>
                          <FormControl>
                            <Input
                              placeholder="kollauser"
                              className="h-10 rounded-full"
                              {...field}
                            />
                          </FormControl>
                          <FormDescription>
                            Username for SSH access to the node
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={nodeForm.control}
                      name="ssh_password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center gap-2 font-semibold">
                            <div className="bg-muted flex items-center justify-center rounded-full p-1">
                              <Key className="text-muted-foreground h-4 w-4" />
                            </div>
                            SSH Password
                          </FormLabel>
                          <FormControl>
                            <Input
                              type="password"
                              placeholder="Enter SSH password"
                              className="h-10 rounded-full"
                              {...field}
                            />
                          </FormControl>
                          <FormDescription>
                            Password for SSH authentication
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end border-t pt-4">
                <Button
                  type="submit"
                  disabled={addNodeMutation.isPending}
                  className="bg-primary text-primary-foreground min-w-[140px] cursor-pointer rounded-full transition-all duration-200"
                >
                  {addNodeMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Adding Node...
                    </>
                  ) : (
                    <>
                      <ServerCog className="mr-2 h-4 w-4" />
                      Add Node
                    </>
                  )}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
