"use client";

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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
    <Card className="rounded-xl border shadow-lg bg-card text-card-foreground border-border/50">
      <CardHeader>
        <CardTitle className="flex gap-2 items-center">
          <div className="p-2 rounded-full bg-muted">
            <ServerCog className="w-5 h-5 text-primary" />
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
                      <span className="flex justify-center items-center p-1 mr-2 rounded-full bg-muted">
                        <Globe className="w-4 h-4 text-muted-foreground" />
                      </span>
                      IP Address
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="192.168.1.10"
                        className="rounded-full bg-input text-foreground"
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
                      <span className="flex justify-center items-center p-1 mr-2 rounded-full bg-muted">
                        <Terminal className="w-4 h-4 text-muted-foreground" />
                      </span>
                      Hostname
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="node-compute-01"
                        className="rounded-full bg-input text-foreground"
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
                      <span className="flex justify-center items-center p-1 mr-2 rounded-full bg-muted">
                        <ServerCog className="w-4 h-4 text-muted-foreground" />
                      </span>
                      Node Type
                    </FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger className="w-full rounded-full cursor-pointer">
                          <SelectValue placeholder="Select node type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="control">Control</SelectItem>
                        <SelectItem value="compute">Compute</SelectItem>
                        <SelectItem value="storage">Storage</SelectItem>
                      </SelectContent>
                    </Select>
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
                      <span className="flex justify-center items-center p-1 mr-2 rounded-full bg-muted">
                        <KeyRound className="w-4 h-4 text-muted-foreground" />
                      </span>
                      Deploy Tag
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="compute"
                        className="rounded-full bg-input text-foreground"
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
                      <span className="flex justify-center items-center p-1 mr-2 rounded-full bg-muted">
                        <Network className="w-4 h-4 text-muted-foreground" />
                      </span>
                      Neutron External Interface
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="eth1"
                        className="rounded-full bg-input text-foreground"
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
                      <span className="flex justify-center items-center p-1 mr-2 rounded-full bg-muted">
                        <Network className="w-4 h-4 text-muted-foreground" />
                      </span>
                      Network Interface
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="eth0"
                        className="rounded-full bg-input text-foreground"
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
                      <span className="flex justify-center items-center p-1 mr-2 rounded-full bg-muted">
                        <User className="w-4 h-4 text-muted-foreground" />
                      </span>
                      SSH User
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="kollauser"
                        className="rounded-full bg-input text-foreground"
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
                      <span className="flex justify-center items-center p-1 mr-2 rounded-full bg-muted">
                        <Lock className="w-4 h-4 text-muted-foreground" />
                      </span>
                      SSH Password
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        className="rounded-full bg-input text-foreground"
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
                className="w-full rounded-full cursor-pointer sm:w-auto bg-primary text-primary-foreground"
              >
                {addNodeMutation.isPending ? (
                  <>
                    <Loader2 className="flex-shrink-0 mr-2 w-4 h-4 animate-spin" />
                    <span className="truncate">Adding Node...</span>
                  </>
                ) : (
                  <>
                    <ServerCog className="flex-shrink-0 mr-2 w-4 h-4" />
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
