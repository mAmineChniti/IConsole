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
    <Card className="bg-card text-card-foreground border border-border/50 shadow-lg rounded-xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <div className="p-2 bg-muted rounded-full">
            <ServerCog className="h-5 w-5 text-primary" />
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
            <div className="grid gap-6 grid-cols-1 sm:grid-cols-2">
              <FormField
                control={nodeForm.control}
                name="ip"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      <span className="p-1 bg-muted rounded-full flex items-center justify-center mr-2">
                        <Globe className="h-4 w-4 text-muted-foreground" />
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
                      <span className="p-1 bg-muted rounded-full flex items-center justify-center mr-2">
                        <Terminal className="h-4 w-4 text-muted-foreground" />
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

            <div className="grid gap-6 grid-cols-1 sm:grid-cols-2">
              <FormField
                control={nodeForm.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      <span className="p-1 bg-muted rounded-full flex items-center justify-center mr-2">
                        <ServerCog className="h-4 w-4 text-muted-foreground" />
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
                      <span className="p-1 bg-muted rounded-full flex items-center justify-center mr-2">
                        <KeyRound className="h-4 w-4 text-muted-foreground" />
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

            <div className="grid gap-6 grid-cols-1 sm:grid-cols-2">
              <FormField
                control={nodeForm.control}
                name="neutron_external_interface"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      <span className="p-1 bg-muted rounded-full flex items-center justify-center mr-2">
                        <Network className="h-4 w-4 text-muted-foreground" />
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
                      <span className="p-1 bg-muted rounded-full flex items-center justify-center mr-2">
                        <Network className="h-4 w-4 text-muted-foreground" />
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

            <div className="grid gap-6 grid-cols-1 sm:grid-cols-2">
              <FormField
                control={nodeForm.control}
                name="ssh_user"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      <span className="p-1 bg-muted rounded-full flex items-center justify-center mr-2">
                        <User className="h-4 w-4 text-muted-foreground" />
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
                      <span className="p-1 bg-muted rounded-full flex items-center justify-center mr-2">
                        <Lock className="h-4 w-4 text-muted-foreground" />
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
                className="rounded-full bg-primary text-primary-foreground cursor-pointer w-full sm:w-auto"
              >
                {addNodeMutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin flex-shrink-0" />
                    <span className="truncate">Adding Node...</span>
                  </>
                ) : (
                  <>
                    <ServerCog className="h-4 w-4 mr-2 flex-shrink-0" />
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
