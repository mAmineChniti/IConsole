import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { InfraService } from "@/lib/requests";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
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
  const [snapshotName, setSnapshotName] = useState("");

  const createSnapshotMutation = useMutation({
    mutationFn: (name: string) =>
      InfraService.createSnapshot({
        instance_id: instanceId,
        snapshot_name: name,
      }),
    onSuccess: async () => {
      onOpenChange(false);
      setSnapshotName("");
      await queryClient.invalidateQueries({ queryKey: ["snapshots", "list"] });
      toast.success("Snapshot created successfully");
      if (onSuccess) onSuccess();
    },
    onError: (err: unknown) =>
      toast.error(
        err instanceof Error ? err.message : "Failed to create snapshot",
      ),
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create Snapshot</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <Input
            value={snapshotName}
            onChange={(e) => setSnapshotName(e.target.value)}
            placeholder="Snapshot name"
            disabled={createSnapshotMutation.isPending || disabled}
            autoFocus
            className="rounded-full"
          />
        </div>
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
            onClick={() => createSnapshotMutation.mutate(snapshotName.trim())}
            disabled={
              createSnapshotMutation.isPending ||
              !snapshotName.trim() ||
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
      </DialogContent>
    </Dialog>
  );
}
