"use client";

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
import { Switch } from "@/components/ui/switch";
import { FlavorService } from "@/lib/requests";
import type { FlavorCreateRequest } from "@/types/RequestInterfaces";
import { FlavorCreateRequestSchema } from "@/types/RequestSchemas";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { Loader2, Plus, X } from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

export function FlavorCreateDialog({
  open,
  onOpenChange,
  onSuccess,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => Promise<void> | void;
}) {
  const form = useForm<FlavorCreateRequest>({
    resolver: zodResolver(FlavorCreateRequestSchema),
    defaultValues: {
      name: "",
      vcpus: 1,
      ram: 1024,
      disk: undefined,
      ephemeral: undefined,
      swap: undefined,
      is_public: true,
    },
  });

  const createMutation = useMutation({
    mutationFn: (payload: FlavorCreateRequest) => FlavorService.create(payload),
    onSuccess: async () => {
      toast.success("Flavor created");
      onOpenChange(false);
      form.reset();
      await onSuccess?.();
    },
    onError: (err: unknown) => {
      const message =
        err instanceof Error ? err.message : "Failed to create flavor";
      toast.error(message);
    },
  });

  const onSubmit = (values: FlavorCreateRequest) => {
    const payload: FlavorCreateRequest = {
      ...values,
      vcpus: Number(values.vcpus),
      ram: Number(values.ram),
      ...(values.disk !== undefined && { disk: Number(values.disk) }),
      ...(values.ephemeral !== undefined && {
        ephemeral: Number(values.ephemeral),
      }),
      ...(values.swap !== undefined && { swap: Number(values.swap) }),
      is_public: Boolean(values.is_public),
    };
    createMutation.mutate(payload);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>New Flavor</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g. m1.small"
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
                name="vcpus"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>vCPUs</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min={1}
                        className="rounded-full"
                        value={field.value ?? ""}
                        onChange={(e) =>
                          field.onChange(
                            e.target.value === ""
                              ? undefined
                              : Number(e.target.value),
                          )
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="ram"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>RAM (MB)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min={1}
                        className="rounded-full"
                        value={field.value ?? ""}
                        onChange={(e) =>
                          field.onChange(
                            e.target.value === ""
                              ? undefined
                              : Number(e.target.value),
                          )
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="disk"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Disk (GB){" "}
                      <span className="text-muted-foreground text-xs">
                        (optional)
                      </span>
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min={0}
                        className="rounded-full"
                        value={field.value ?? ""}
                        onChange={(e) =>
                          field.onChange(
                            e.target.value === ""
                              ? undefined
                              : Number(e.target.value),
                          )
                        }
                        placeholder="Optional"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="ephemeral"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Ephemeral (GB)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min={0}
                        className="rounded-full"
                        value={field.value ?? ""}
                        onChange={(e) =>
                          field.onChange(
                            e.target.value === ""
                              ? undefined
                              : Number(e.target.value),
                          )
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="swap"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Swap (MB)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min={0}
                        className="rounded-full"
                        value={field.value ?? ""}
                        onChange={(e) =>
                          field.onChange(
                            e.target.value === ""
                              ? undefined
                              : Number(e.target.value),
                          )
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="is_public"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <div className="flex items-center justify-between pt-2">
                      <FormLabel>Public</FormLabel>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

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
                className="min-w-[140px] cursor-pointer gap-2 rounded-full"
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
