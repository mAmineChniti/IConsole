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
import { Input } from "@/components/ui/input";
import { NetworkService } from "@/lib/requests";
import type { FloatingIPCreateRequest } from "@/types/RequestInterfaces";
import { FloatingIpCreateRequestSchema } from "@/types/RequestSchemas";
import type { PublicPrivateNetworksResponse } from "@/types/ResponseInterfaces";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2, Plus, X } from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

export function CreateFloatingIpDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const queryClient = useQueryClient();

  const form = useForm<FloatingIPCreateRequest>({
    resolver: zodResolver(FloatingIpCreateRequestSchema),
    defaultValues: {
      description: undefined,
      external_network_name: undefined,
      floating_ip: undefined,
    },
  });

  const { data: publicNetworks, isLoading: isLoadingNetworks } =
    useQuery<PublicPrivateNetworksResponse>({
      queryKey: ["public-networks"],
      queryFn: () => NetworkService.publicNetworks(),
    });

  const comboboxData = (publicNetworks ?? []).map((net) => ({
    label: net.name,
    value: net.name,
  }));

  const createMutation = useMutation<unknown, unknown, FloatingIPCreateRequest>(
    {
      mutationFn: (payload: FloatingIPCreateRequest) =>
        NetworkService.createFloatingIP(payload),
      onSuccess: async () => {
        toast.success("Floating IP created successfully");
        onOpenChange(false);
        form.reset();
        await queryClient.invalidateQueries({ queryKey: ["floating-ips"] });
      },
      onError: (err: unknown) => {
        const message =
          err instanceof Error ? err.message : "Failed to create floating IP";
        toast.error(message);
      },
    },
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>New Floating IP</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit((data) => {
              const payload: FloatingIPCreateRequest = {
                external_network_name: data.external_network_name,
                ...(data.floating_ip?.trim()
                  ? { floating_ip: data.floating_ip.trim() }
                  : {}),
                ...(data.description?.trim()
                  ? { description: data.description.trim() }
                  : {}),
              };
              createMutation.mutate(payload);
            })}
            className="space-y-4"
          >
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g. my-floating-ip-description"
                      className="rounded-full"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="floating_ip"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Floating IP (Optional)</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g. 192.168.1.100"
                      className="rounded-full"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="external_network_name"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Network</FormLabel>
                  <FormControl>
                    <XCombobox
                      data={comboboxData}
                      type="network"
                      value={field.value}
                      onChange={field.onChange}
                      placeholder="Select network"
                      disabled={isLoadingNetworks}
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
                disabled={createMutation.isPending}
              >
                <X className="h-4 w-4" />
                <span>Cancel</span>
              </Button>
              <Button
                type="submit"
                variant="default"
                className="min-w-[120px] cursor-pointer gap-2 rounded-full"
                disabled={createMutation.isPending}
              >
                {createMutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Creating...</span>
                  </>
                ) : (
                  <>
                    <Plus className="h-4 w-4" />
                    <span>Create</span>
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
