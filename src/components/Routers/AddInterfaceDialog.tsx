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
import { NetworkService } from "@/lib/requests";
import type { AttachPrivateNetworkRequest } from "@/types/RequestInterfaces";
import { AttachPrivateNetworkRequestSchema } from "@/types/RequestSchemas";
import type {
  PublicPrivateNetworksResponse,
  RouterListItem,
} from "@/types/ResponseInterfaces";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2, Plus, X } from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

export function AddInterfaceDialog({
  open,
  onOpenChange,
  router,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  router: RouterListItem;
}) {
  const queryClient = useQueryClient();

  const form = useForm<Pick<AttachPrivateNetworkRequest, "private_network_id">>(
    {
      resolver: zodResolver(
        AttachPrivateNetworkRequestSchema.pick({ private_network_id: true }),
      ),
      defaultValues: {
        private_network_id: "",
      },
    },
  );

  const { data: privateNetworks, isLoading: isLoadingNetworks } =
    useQuery<PublicPrivateNetworksResponse>({
      queryKey: ["private-networks"],
      queryFn: () => NetworkService.privateNetworks(),
    });

  const comboboxData = (privateNetworks ?? []).map((net) => ({
    label: net.name,
    value: net.id,
  }));

  const attachMutation = useMutation<
    unknown,
    unknown,
    AttachPrivateNetworkRequest
  >({
    mutationFn: (payload) => NetworkService.attachPrivateNetwork(payload),
    onSuccess: async () => {
      toast.success("Interface added successfully");
      onOpenChange(false);
      form.reset();
      await queryClient.invalidateQueries({
        queryKey: ["router-interfaces", router.id],
      });
    },
    onError: (err: unknown) => {
      const message =
        err instanceof Error ? err.message : "Failed to add interface";
      toast.error(message);
    },
  });

  const onSubmit = (
    data: Pick<AttachPrivateNetworkRequest, "private_network_id">,
  ) => {
    const payload: AttachPrivateNetworkRequest = {
      router_id: router.id,
      private_network_id: data.private_network_id,
    };
    attachMutation.mutate(payload);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add Interface to {router.name}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="private_network_id"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Private Network</FormLabel>
                  <Combobox
                    data={comboboxData}
                    type="Network"
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
                          {comboboxData.map((net) => (
                            <ComboboxItem key={net.value} value={net.value}>
                              {net.label}
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
              >
                <X className="h-4 w-4" />
                <span>Cancel</span>
              </Button>
              <Button
                type="submit"
                variant="default"
                className="min-w-[120px] cursor-pointer gap-2 rounded-full"
                disabled={attachMutation.isPending}
              >
                {attachMutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Adding...</span>
                  </>
                ) : (
                  <>
                    <Plus className="h-4 w-4" />
                    <span>Add Interface</span>
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
