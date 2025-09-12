"use client";

import { XCombobox } from "@/components/reusable/XCombobox";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { ScaleService } from "@/lib/requests";
import type { ScaleNodeRequest } from "@/types/RequestInterfaces";
import { ScaleNodeRequestSchema } from "@/types/RequestSchemas";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import {
  Globe,
  KeyRound,
  Loader2,
  Lock,
  Network,
  ServerCog,
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
    <Card className="text-card-foreground border-border/50 rounded-xl border bg-neutral-50 shadow-lg dark:bg-neutral-900">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <div className="bg-muted rounded-full p-2">
            <ServerCog className="text-primary h-5 w-5" />
          </div>
          Add Node
        </CardTitle>
        <CardDescription>
          Register a new control / compute / storage node and initiate targeted
          kolla-ansible deploy.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...nodeForm}>
          <form
            onSubmit={nodeForm.handleSubmit((data) =>
              addNodeMutation.mutate(data),
            )}
            className="space-y-6"
          >
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <FormField
                control={nodeForm.control}
                name="ip"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      <span className="bg-muted mr-2 flex items-center justify-center rounded-full p-1">
                        <Globe className="text-muted-foreground h-4 w-4" />
                      </span>
                      IP Address
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="192.168.1.10"
                        className="bg-input text-foreground rounded-full"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={nodeForm.control}
                name="hostname"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      <span className="bg-muted mr-2 flex items-center justify-center rounded-full p-1">
                        <Terminal className="text-muted-foreground h-4 w-4" />
                      </span>
                      Hostname
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="node-compute-01"
                        className="bg-input text-foreground rounded-full"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <FormField
                control={nodeForm.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      <span className="bg-muted mr-2 flex items-center justify-center rounded-full p-1">
                        <ServerCog className="text-muted-foreground h-4 w-4" />
                      </span>
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
                        className="w-full"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={nodeForm.control}
                name="deploy_tag"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      <span className="bg-muted mr-2 flex items-center justify-center rounded-full p-1">
                        <KeyRound className="text-muted-foreground h-4 w-4" />
                      </span>
                      Deploy Tag
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="compute"
                        className="bg-input text-foreground rounded-full"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <Separator />

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <FormField
                control={nodeForm.control}
                name="neutron_external_interface"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      <span className="bg-muted mr-2 flex items-center justify-center rounded-full p-1">
                        <Network className="text-muted-foreground h-4 w-4" />
                      </span>
                      Neutron External Interface
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="eth1"
                        className="bg-input text-foreground rounded-full"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={nodeForm.control}
                name="network_interface"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      <span className="bg-muted mr-2 flex items-center justify-center rounded-full p-1">
                        <Network className="text-muted-foreground h-4 w-4" />
                      </span>
                      Network Interface
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="eth0"
                        className="bg-input text-foreground rounded-full"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <Separator />

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <FormField
                control={nodeForm.control}
                name="ssh_user"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      <span className="bg-muted mr-2 flex items-center justify-center rounded-full p-1">
                        <User className="text-muted-foreground h-4 w-4" />
                      </span>
                      SSH User
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="kollauser"
                        className="bg-input text-foreground rounded-full"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={nodeForm.control}
                name="ssh_password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      <span className="bg-muted mr-2 flex items-center justify-center rounded-full p-1">
                        <Lock className="text-muted-foreground h-4 w-4" />
                      </span>
                      SSH Password
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        className="bg-input text-foreground rounded-full"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <Separator />

            <div className="flex justify-center sm:justify-end">
              <Button
                type="submit"
                disabled={addNodeMutation.isPending}
                className="bg-primary text-primary-foreground w-full cursor-pointer rounded-full sm:w-auto"
              >
                {addNodeMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 flex-shrink-0 animate-spin" />
                    <span className="truncate">Adding Node...</span>
                  </>
                ) : (
                  <>
                    <ServerCog className="mr-2 h-4 w-4 flex-shrink-0" />
                    <span className="truncate">Add Node</span>
                  </>
                )}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
