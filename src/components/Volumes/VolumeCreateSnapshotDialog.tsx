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
import { Textarea } from "@/components/ui/textarea";
import { VolumeService } from "@/lib/requests";
import type { VolumeSnapshotCreateRequest } from "@/types/RequestInterfaces";
import { VolumeSnapshotCreateRequestSchema } from "@/types/RequestSchemas";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

export function VolumeCreateSnapshotDialog({
  open,
  onOpenChange,
  volumeId,
  onSuccess,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  volumeId: string | undefined;
  onSuccess?: () => void;
}) {
  const queryClient = useQueryClient();

  const form = useForm<Omit<VolumeSnapshotCreateRequest, "volume_id">>({
    resolver: zodResolver(
      VolumeSnapshotCreateRequestSchema.omit({ volume_id: true }),
    ),
    defaultValues: {
      name: "",
      description: "",
    },
  });

  const createSnapshotMutation = useMutation({
    mutationFn: (data: VolumeSnapshotCreateRequest) =>
      VolumeService.createSnapshot(data),
    onSuccess: async () => {
      toast.success("Snapshot creation started");
      form.reset();
      onOpenChange(false);
      await queryClient.invalidateQueries({
        queryKey: ["snapshots", "list"],
      });
      onSuccess?.();
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to create snapshot");
    },
  });

  const onSubmit = (values: Omit<VolumeSnapshotCreateRequest, "volume_id">) => {
    if (!volumeId) return;
    createSnapshotMutation.mutate({
      volume_id: volumeId,
      name: values.name.trim(),
      description: values.description?.trim() ?? undefined,
    });
  };

  const handleOpenChange = (open: boolean) => {
    onOpenChange(open);
    if (!open) {
      form.reset();
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create Snapshot</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Snapshot name"
                      className="w-full rounded-full"
                      {...field}
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
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Optional description"
                      className="w-full"
                      rows={3}
                      {...field}
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
                onClick={() => handleOpenChange(false)}
                disabled={createSnapshotMutation.isPending}
                className="cursor-pointer rounded-full"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="default"
                disabled={createSnapshotMutation.isPending}
                className="cursor-pointer rounded-full"
              >
                {createSnapshotMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  "Create Snapshot"
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
