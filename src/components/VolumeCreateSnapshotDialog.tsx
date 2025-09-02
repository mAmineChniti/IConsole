import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { VolumeService } from "@/lib/requests";
import { useState } from "react";
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
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);

  const reset = () => {
    setName("");
    setDescription("");
  };

  const handleCreate = async () => {
    if (!volumeId || name.trim().length === 0) return;
    setLoading(true);
    try {
      await VolumeService.createSnapshot({
        volume_id: volumeId,
        name: name.trim(),
        description: description.trim() || undefined,
      });
      toast.success("Snapshot creation started");
      onOpenChange(false);
      reset();
      onSuccess?.();
    } catch (e: unknown) {
      toast.error((e as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        onOpenChange(o);
        if (!o) reset();
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create Snapshot</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium">Name</label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Snapshot name"
              className="w-full rounded-full"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">
              Description
            </label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Optional description"
              className="w-full"
              rows={3}
            />
          </div>
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={loading}
            className="cursor-pointer rounded-full"
          >
            Cancel
          </Button>
          <Button
            variant="default"
            onClick={handleCreate}
            disabled={loading || name.trim().length === 0}
            className="cursor-pointer rounded-full"
          >
            {loading ? "Creating..." : "Create Snapshot"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
