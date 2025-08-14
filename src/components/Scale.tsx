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
    <div className="grid gap-6 md:grid-cols-2">
      <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ServerCog className="h-5 w-5" /> Add Node
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Register a new control / compute / storage node and initiate
            targeted kolla-ansible deploy.
          </p>
          <Button
            variant="outline"
            onClick={() => setShowNodeDialog(true)}
            className="cursor-pointer"
          >
            <PlusCircle className="h-4 w-4 mr-2" /> Add Node
          </Button>
        </CardContent>
      </Card>

      <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" /> Test Alert Email
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Trigger a background task sending a test alert email to validate
            SMTP configuration.
          </p>
          <Button
            variant="outline"
            onClick={() => setShowEmailDialog(true)}
            className="cursor-pointer"
          >
            <Mail className="h-4 w-4 mr-2" /> Send Test Email
          </Button>
        </CardContent>
      </Card>

      <Dialog open={showNodeDialog} onOpenChange={setShowNodeDialog}>
        <DialogContent className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border border-border/50 max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add Node</DialogTitle>
            <DialogDescription>
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
              <div className="grid gap-4 md:grid-cols-2">
                <FormField
                  control={nodeForm.control}
                  name="ip"
                  render={({ field }) => (
                    <div className="space-y-2">
                      <FormLabel>IP</FormLabel>
                      <FormControl>
                        <Input placeholder="192.168.1.10" {...field} />
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
                      <FormLabel>Hostname</FormLabel>
                      <FormControl>
                        <Input placeholder="node-compute-01" {...field} />
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
                      <FormLabel>Type</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger className="w-full cursor-pointer">
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
                    </div>
                  )}
                />
                <FormField
                  control={nodeForm.control}
                  name="neutron_external_interface"
                  render={({ field }) => (
                    <div className="space-y-2">
                      <FormLabel>Neutron External Interface</FormLabel>
                      <FormControl>
                        <Input placeholder="eth1" {...field} />
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
                      <FormLabel>Network Interface</FormLabel>
                      <FormControl>
                        <Input placeholder="eth0" {...field} />
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
                      <FormLabel>SSH User</FormLabel>
                      <FormControl>
                        <Input placeholder="kollauser" {...field} />
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
                      <FormLabel>SSH Password</FormLabel>
                      <FormControl>
                        <Input type="password" {...field} />
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
                      <FormLabel>Deploy Tag</FormLabel>
                      <FormControl>
                        <Input placeholder="compute" {...field} />
                      </FormControl>
                      <FormMessage />
                    </div>
                  )}
                />
              </div>
              <DialogFooter className="gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowNodeDialog(false)}
                  className="cursor-pointer"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={addNodeMutation.isPending}
                  className="cursor-pointer"
                >
                  {addNodeMutation.isPending ? "Submitting..." : "Submit"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <Dialog open={showEmailDialog} onOpenChange={setShowEmailDialog}>
        <DialogContent className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border border-border/50">
          <DialogHeader>
            <DialogTitle>Send Test Email</DialogTitle>
            <DialogDescription>
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
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="ops@example.com"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </div>
                )}
              />
              <DialogFooter className="gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowEmailDialog(false)}
                  className="cursor-pointer"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={testEmailMutation.isPending}
                  className="cursor-pointer"
                >
                  {testEmailMutation.isPending ? "Sending..." : "Send"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
