"use client";

import { Button } from "@/components/ui/button";
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxGroup,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
  ComboboxTrigger,
} from "@/components/ui/combobox";
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
import type { RouterCreateRequest } from "@/types/RequestInterfaces";
import { RouterCreateRequestSchema } from "@/types/RequestSchemas";
import type {
  PublicPrivateNetworksResponse,
  RouterCreateResponse,
} from "@/types/ResponseInterfaces";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2, Plus, X } from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

export function CreateRouterDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const queryClient = useQueryClient();

  const form = useForm<RouterCreateRequest>({
    resolver: zodResolver(RouterCreateRequestSchema),
    defaultValues: {
      router_name: "",
      external_network_id: "",
    },
  });

  const { data: publicNetworks, isLoading: isLoadingNetworks } =
    useQuery<PublicPrivateNetworksResponse>({
      queryKey: ["public-networks"],
      queryFn: () => NetworkService.publicNetworks(),
    });

  const comboboxData = (publicNetworks ?? []).map((network) => ({
    label: network.name,
    value: network.id,
  }));

  const createMutation = useMutation<
    RouterCreateResponse,
    unknown,
    RouterCreateRequest
  >({
    mutationFn: (payload: RouterCreateRequest) =>
      NetworkService.createRouter(payload),
    onSuccess: async () => {
      toast.success("Router created successfully");
      onOpenChange(false);
      form.reset();
      await queryClient.invalidateQueries({ queryKey: ["routers"] });
    },
    onError: (err: unknown) => {
      const message =
        err instanceof Error ? err.message : "Failed to create router";
      toast.error(message);
    },
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>New Router</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit((data) => createMutation.mutate(data))}
            className="space-y-4"
          >
            <FormField
              control={form.control}
              name="router_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Router Name</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g. my-router"
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
              name="external_network_id"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>External Network</FormLabel>
                  <Combobox
                    data={comboboxData}
                    type="network"
                    value={field.value}
                    onValueChange={field.onChange}
                  >
                    <FormControl>
                      <ComboboxTrigger
                        className="w-full cursor-pointer rounded-full"
                        disabled={isLoadingNetworks}
                      />
                    </FormControl>
                    <ComboboxContent>
                      <ComboboxInput />
                      <ComboboxList>
                        <ComboboxEmpty />
                        <ComboboxGroup>
                          {comboboxData.map((network) => (
                            <ComboboxItem
                              key={network.value}
                              value={network.value}
                            >
                              {network.label}
                            </ComboboxItem>
                          ))}
                        </ComboboxGroup>
                      </ComboboxList>
                    </ComboboxContent>
                  </Combobox>
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
