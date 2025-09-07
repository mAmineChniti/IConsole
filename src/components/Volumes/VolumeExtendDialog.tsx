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
import { useMutation, useQueryClient } from "@tanstack/react-query";
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
  const queryClient = useQueryClient();
  const safeCurrentSize = Number.isFinite(currentSize) ? currentSize : 1;
  const [newSize, setNewSize] = useState(safeCurrentSize + 1);

  const extendMutation = useMutation({
    mutationFn: ({
      volume_id,
      new_size,
    }: {
      volume_id: string;
      new_size: number;
    }) => VolumeService.extend({ volume_id, new_size }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["volumes"] });
      toast.success("Volume extended successfully");
      onOpenChange(false);
      onSuccess?.();
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to extend volume");
    },
  });

  const handleExtend = async () => {
    if (!volumeId || !Number.isInteger(newSize) || newSize <= safeCurrentSize)
      return;
    extendMutation.mutate({ volume_id: volumeId, new_size: newSize });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Extend Volume</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium">
              New Size (GB)
            </label>
            <Input
              type="number"
              min={safeCurrentSize + 1}
              step={1}
              value={newSize}
              onChange={(e) =>
                setNewSize(parseInt(e.target.value, 10) || safeCurrentSize + 1)
              }
              className="w-full rounded-full"
            />
            <div className="text-muted-foreground mt-1 text-xs">
              Current size: {safeCurrentSize} GB
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={extendMutation.isPending}
            className="cursor-pointer rounded-full"
          >
            Cancel
          </Button>
          <Button
            variant="default"
            onClick={handleExtend}
            disabled={
              extendMutation.isPending ||
              !Number.isInteger(newSize) ||
              newSize <= safeCurrentSize
            }
            className="rounded-full"
          >
            {extendMutation.isPending ? "Extending..." : "Extend"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
