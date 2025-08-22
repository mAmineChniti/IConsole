import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { VolumeService } from "@/lib/requests";
import { useState } from "react";
import { toast } from "sonner";

export function VolumeExtendDialog({
  open,
  onOpenChange,
  volumeId,
  currentSize,
  onSuccess,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  volumeId: string | undefined;
  currentSize: number;
  onSuccess?: () => void;
}) {
  const safeCurrentSize = Number.isFinite(currentSize) ? currentSize : 1;
  const [newSize, setNewSize] = useState(safeCurrentSize);
  const [loading, setLoading] = useState(false);

  const handleExtend = async () => {
    if (!volumeId || newSize <= currentSize) return;
    setLoading(true);
    try {
      await VolumeService.extend({ volume_id: volumeId, new_size: newSize });
      toast.success("Volume extended successfully");
      onOpenChange(false);
      onSuccess?.();
    } catch (e: unknown) {
      toast.error((e as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Extend Volume</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <label className="block mb-1 text-sm font-medium">
              New Size (GB)
            </label>
            <Input
              type="number"
              min={String(safeCurrentSize + 1)}
              value={newSize}
              onChange={(e) => setNewSize(Number(e.target.value))}
              className="w-full rounded-full"
            />
            <div className="mt-1 text-xs text-muted-foreground">
              Current size: {safeCurrentSize} GB
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={loading}
            className="rounded-full cursor-pointer"
          >
            Cancel
          </Button>
          <Button
            variant="default"
            onClick={handleExtend}
            disabled={loading || newSize <= currentSize}
            className="rounded-full cursor-pointer"
          >
            {loading ? "Extending..." : "Extend"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
