"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
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
import { VolumeService } from "@/lib/requests";
import type { VolumeTypeCreateRequest } from "@/types/RequestInterfaces";
import { VolumeTypeCreateRequestSchema } from "@/types/RequestSchemas";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Loader2, Plus, X } from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

export function VolumeTypeCreateDialog({
  open,
  onOpenChange,
  onSuccess,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void | Promise<void>;
}) {
  const queryClient = useQueryClient();

  const form = useForm<VolumeTypeCreateRequest>({
    resolver: zodResolver(VolumeTypeCreateRequestSchema),
    defaultValues: {
      name: "",
      description: "",
      is_public: true,
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: VolumeTypeCreateRequest) =>
      VolumeService.createVolumeType({
        name: data.name,
        description: data.description,
        is_public: data.is_public,
      }),
    onSuccess: async () => {
      toast.success("Volume type created successfully");
      form.reset({ name: "", description: "", is_public: true });
      onOpenChange(false);
      await queryClient.invalidateQueries({
        queryKey: ["volume-types", "list"],
      });
      await onSuccess?.();
    },
    onError: (err: unknown) => {
      const msg =
        err instanceof Error
          ? err.message
          : typeof err === "string"
            ? err
            : "Failed to create volume type";
      toast.error(msg);
    },
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="rounded-2xl sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create New Volume Type</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit((vals) => createMutation.mutate(vals))}
            className="flex flex-col gap-4"
          >
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Volume type name"
                      {...field}
                      disabled={createMutation.isPending}
                      className="h-10 rounded-full"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description (optional)</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Volume type description"
                      {...field}
                      disabled={createMutation.isPending}
                      className="h-10 rounded-full"
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
                <FormItem className="flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <FormLabel>Visibility</FormLabel>
                    <div className="flex items-center gap-3">
                      <span className="text-muted-foreground text-xs">
                        {field.value ? "Public" : "Private"}
                      </span>
                      <FormControl>
                        <Switch
                          className="cursor-pointer"
                          checked={!!field.value}
                          onCheckedChange={field.onChange}
                          disabled={createMutation.isPending}
                        />
                      </FormControl>
                    </div>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="mt-4 flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={createMutation.isPending}
                className="cursor-pointer rounded-full"
              >
                <X className="mr-2 h-4 w-4" />
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={createMutation.isPending}
                className="cursor-pointer rounded-full"
              >
                {createMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Plus className="mr-2 h-4 w-4" />
                    Create
                  </>
                )}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
