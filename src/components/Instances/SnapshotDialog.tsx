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
import { InfraService } from "@/lib/requests";
import type { CreateSnapshotRequest } from "@/types/RequestInterfaces";
import { CreateSnapshotRequestSchema } from "@/types/RequestSchemas";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

export function SnapshotDialog({
  open,
  onOpenChange,
  instanceId,
  instanceName: _instanceName,
  onSuccess,
  disabled,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  instanceId: string;
  instanceName: string;
  onSuccess?: () => void;
  disabled?: boolean;
}) {
  const queryClient = useQueryClient();

  const form = useForm<Omit<CreateSnapshotRequest, "instance_id">>({
    resolver: zodResolver(CreateSnapshotRequestSchema),
    mode: "onChange",
    defaultValues: {
      snapshot_name: "",
    },
  });

  const createSnapshotMutation = useMutation({
    mutationFn: (name: string) =>
      InfraService.createSnapshot({
        instance_id: instanceId,
        snapshot_name: name,
      }),
    onSuccess: async () => {
      onOpenChange(false);
      form.reset();
      await queryClient.invalidateQueries({ queryKey: ["snapshots", "list"] });
      toast.success("Snapshot created successfully");
      if (onSuccess) onSuccess();
    },
    onError: (err: unknown) =>
      toast.error(
        err instanceof Error ? err.message : "Failed to create snapshot",
      ),
  });

  const onSubmit = (data: Omit<CreateSnapshotRequest, "instance_id">) => {
    createSnapshotMutation.mutate(data.snapshot_name);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create Snapshot</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="snapshot_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Snapshot Name</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Snapshot name"
                      disabled={createSnapshotMutation.isPending || disabled}
                      autoFocus
                      className="rounded-full"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter className="flex justify-end gap-2">
              <Button
                type="button"
                onClick={() => onOpenChange(false)}
                variant="outline"
                className="cursor-pointer rounded-full"
                disabled={createSnapshotMutation.isPending}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={
                  createSnapshotMutation.isPending ||
                  !form.formState.isValid ||
                  disabled
                }
                variant="default"
                className="cursor-pointer rounded-full"
              >
                {createSnapshotMutation.isPending
                  ? "Creating..."
                  : "Create Snapshot"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
