"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { Mail, PlusCircle, ServerCog } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { ScaleService } from "@/lib/requests";
import type {
  ScaleNodeRequest,
  SendTestEmailRequest,
} from "@/types/RequestInterfaces";
import {
  ScaleNodeRequestSchema,
  SendTestEmailRequestSchema,
} from "@/types/RequestSchemas";

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

export function ScaleOperations() {
  const [showNodeDialog, setShowNodeDialog] = useState(false);
  const [showEmailDialog, setShowEmailDialog] = useState(false);

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

  const emailForm = useForm<SendTestEmailRequest>({
    resolver: zodResolver(SendTestEmailRequestSchema),
    defaultValues: {
      to: "",
    },
  });

  const addNodeMutation = useMutation({
    mutationFn: (data: ScaleNodeRequest) => ScaleService.addNode(data),
    onSuccess: (res) => {
      toast.success(res.message || "Node scaling initiated");
      setShowNodeDialog(false);
      nodeForm.reset();
    },
    onError: (error) => toast.error(error.message),
  });

  const testEmailMutation = useMutation({
    mutationFn: (data: SendTestEmailRequest) =>
      ScaleService.sendTestEmail(data),
    onSuccess: (res) => {
      toast.success(res.message || "Test email sent");
      setShowEmailDialog(false);
      emailForm.reset();
    },
    onError: (error) => toast.error(error.message),
  });

  return (
    <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2">
      <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border border-border/50 overflow-hidden">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
            <ServerCog className="h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0" />
            <span className="truncate">Add Node</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground leading-relaxed">
            Register a new control / compute / storage node and initiate
            targeted kolla-ansible deploy.
          </p>
          <Button
            variant="outline"
            onClick={() => setShowNodeDialog(true)}
            className="cursor-pointer w-full sm:w-auto min-w-[120px]"
          >
            <PlusCircle className="h-4 w-4 mr-2 flex-shrink-0" />
            <span className="truncate">Add Node</span>
          </Button>
        </CardContent>
      </Card>

      <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border border-border/50 overflow-hidden">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
            <Mail className="h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0" />
            <span className="truncate">Test Alert Email</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground leading-relaxed">
            Trigger a background task sending a test alert email to validate
            SMTP configuration.
          </p>
          <Button
            variant="outline"
            onClick={() => setShowEmailDialog(true)}
            className="cursor-pointer w-full sm:w-auto min-w-[140px]"
          >
            <Mail className="h-4 w-4 mr-2 flex-shrink-0" />
            <span className="truncate">Send Test Email</span>
          </Button>
        </CardContent>
      </Card>

      <Dialog open={showNodeDialog} onOpenChange={setShowNodeDialog}>
        <DialogContent className="mx-4 sm:mx-0 max-w-[calc(100vw-2rem)] sm:max-w-2xl bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border border-border/50 max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold truncate">
              Add Node
            </DialogTitle>
            <DialogDescription className="text-sm leading-relaxed">
              Provide node connection and classification parameters.
            </DialogDescription>
          </DialogHeader>
          <Form {...nodeForm}>
            <form
              onSubmit={nodeForm.handleSubmit((data) =>
                addNodeMutation.mutate(data),
              )}
              className="space-y-4"
            >
              <div className="grid gap-4 grid-cols-1 sm:grid-cols-2">
                <FormField
                  control={nodeForm.control}
                  name="ip"
                  render={({ field }) => (
                    <div className="space-y-2">
                      <FormLabel className="text-sm font-medium">IP</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="192.168.1.10"
                          className="h-10 w-full"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </div>
                  )}
                />
                <FormField
                  control={nodeForm.control}
                  name="hostname"
                  render={({ field }) => (
                    <div className="space-y-2">
                      <FormLabel className="text-sm font-medium">
                        Hostname
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="node-compute-01"
                          className="h-10 w-full"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </div>
                  )}
                />
                <FormField
                  control={nodeForm.control}
                  name="type"
                  render={({ field }) => (
                    <div className="space-y-2">
                      <FormLabel className="text-sm font-medium">
                        Type
                      </FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger className="w-full cursor-pointer h-10">
                            <SelectValue placeholder="Select node type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="control">
                            <span className="truncate">Control</span>
                          </SelectItem>
                          <SelectItem value="compute">
                            <span className="truncate">Compute</span>
                          </SelectItem>
                          <SelectItem value="storage">
                            <span className="truncate">Storage</span>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </div>
                  )}
                />
                <FormField
                  control={nodeForm.control}
                  name="neutron_external_interface"
                  render={({ field }) => (
                    <div className="space-y-2">
                      <FormLabel className="text-sm font-medium">
                        Neutron External Interface
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="eth1"
                          className="h-10 w-full"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </div>
                  )}
                />
                <FormField
                  control={nodeForm.control}
                  name="network_interface"
                  render={({ field }) => (
                    <div className="space-y-2">
                      <FormLabel className="text-sm font-medium">
                        Network Interface
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="eth0"
                          className="h-10 w-full"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </div>
                  )}
                />
                <FormField
                  control={nodeForm.control}
                  name="ssh_user"
                  render={({ field }) => (
                    <div className="space-y-2">
                      <FormLabel className="text-sm font-medium">
                        SSH User
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="kollauser"
                          className="h-10 w-full"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </div>
                  )}
                />
                <FormField
                  control={nodeForm.control}
                  name="ssh_password"
                  render={({ field }) => (
                    <div className="space-y-2">
                      <FormLabel className="text-sm font-medium">
                        SSH Password
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="password"
                          className="h-10 w-full"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </div>
                  )}
                />
                <FormField
                  control={nodeForm.control}
                  name="deploy_tag"
                  render={({ field }) => (
                    <div className="space-y-2">
                      <FormLabel className="text-sm font-medium">
                        Deploy Tag
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="compute"
                          className="h-10 w-full"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </div>
                  )}
                />
              </div>
              <DialogFooter className="flex flex-col sm:flex-row gap-2 sm:gap-2 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowNodeDialog(false)}
                  className="cursor-pointer w-full sm:w-auto order-2 sm:order-1"
                >
                  <span className="truncate">Cancel</span>
                </Button>
                <Button
                  type="submit"
                  disabled={addNodeMutation.isPending}
                  className="cursor-pointer w-full sm:w-auto order-1 sm:order-2 min-w-[120px]"
                >
                  <span className="truncate">
                    {addNodeMutation.isPending ? "Submitting..." : "Submit"}
                  </span>
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <Dialog open={showEmailDialog} onOpenChange={setShowEmailDialog}>
        <DialogContent className="mx-4 sm:mx-0 max-w-[calc(100vw-2rem)] sm:max-w-md bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border border-border/50 overflow-hidden">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold truncate">
              Send Test Email
            </DialogTitle>
            <DialogDescription className="text-sm leading-relaxed">
              Provide destination address (leave blank to use backend default if
              configured).
            </DialogDescription>
          </DialogHeader>
          <Form {...emailForm}>
            <form
              onSubmit={emailForm.handleSubmit((data) =>
                testEmailMutation.mutate(data),
              )}
              className="space-y-4"
            >
              <FormField
                control={emailForm.control}
                name="to"
                render={({ field }) => (
                  <div className="space-y-2">
                    <FormLabel className="text-sm font-medium">Email</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="ops@example.com"
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
                  onClick={() => setShowEmailDialog(false)}
                  className="cursor-pointer w-full sm:w-auto order-2 sm:order-1"
                >
                  <span className="truncate">Cancel</span>
                </Button>
                <Button
                  type="submit"
                  disabled={testEmailMutation.isPending}
                  className="cursor-pointer w-full sm:w-auto order-1 sm:order-2 min-w-[100px]"
                >
                  <span className="truncate">
                    {testEmailMutation.isPending ? "Sending..." : "Send"}
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
