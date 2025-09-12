"use client";

import { XCombobox } from "@/components/reusable/XCombobox";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { NetworkService } from "@/lib/requests";
import type { FloatingIPAssociateRequest } from "@/types/RequestInterfaces";
import { FloatingIPAssociateRequestSchema } from "@/types/RequestSchemas";
import type {
  FloatingIpsListItem,
  VMListResponse,
} from "@/types/ResponseInterfaces";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2, Plus, X } from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

export function AssociateIpDialog({
  open,
  onOpenChange,
  floatingIp,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  floatingIp: FloatingIpsListItem;
}) {
  const queryClient = useQueryClient();

  const form = useForm<Pick<FloatingIPAssociateRequest, "vm_id">>({
    resolver: zodResolver(
      FloatingIPAssociateRequestSchema.pick({ vm_id: true }),
    ),
    defaultValues: {
      vm_id: "",
    },
  });

  const { data: vms, isLoading: isLoadingVms } = useQuery<VMListResponse>({
    queryKey: ["vms-list"],
    queryFn: () => NetworkService.listVMS(),
  });

  const comboboxData = (vms ?? []).map((vm) => ({
    label: vm.vm_name,
    value: vm.vm_id,
  }));

  const associateMutation = useMutation<
    unknown,
    unknown,
    FloatingIPAssociateRequest
  >({
    mutationFn: (payload) => NetworkService.associateFloatingIP(payload),
    onSuccess: async () => {
      toast.success("Floating IP associated successfully");
      onOpenChange(false);
      form.reset();
      await queryClient.invalidateQueries({ queryKey: ["floating-ips"] });
    },
    onError: (err: unknown) => {
      const message =
        err instanceof Error ? err.message : "Failed to associate floating IP";
      toast.error(message);
    },
  });

  const onSubmit = (data: Pick<FloatingIPAssociateRequest, "vm_id">) => {
    const payload: FloatingIPAssociateRequest = {
      floating_ip_id: floatingIp.id,
      vm_id: data.vm_id,
    };
    associateMutation.mutate(payload);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Associate Floating IP</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="vm_id"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Virtual Machine</FormLabel>
                  <FormControl>
                    <XCombobox
                      data={comboboxData}
                      type="VM"
                      value={field.value}
                      onChange={field.onChange}
                      placeholder="Select virtual machine"
                      disabled={isLoadingVms}
                      className="w-full cursor-pointer rounded-full"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                className="cursor-pointer gap-2 rounded-full"
                onClick={() => onOpenChange(false)}
                disabled={associateMutation.isPending}
              >
                <X className="h-4 w-4" />
                <span>Cancel</span>
              </Button>
              <Button
                type="submit"
                variant="default"
                className="min-w-[120px] cursor-pointer gap-2 rounded-full"
                disabled={associateMutation.isPending}
              >
                {associateMutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Associating...</span>
                  </>
                ) : (
                  <>
                    <Plus className="h-4 w-4" />
                    <span>Associate</span>
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
