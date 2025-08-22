import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { VolumeService } from "@/lib/requests";
import { useState } from "react";
import { toast } from "sonner";

export function VolumeDetachDialog({
  open,
  onOpenChange,
  attachmentId,
  onSuccess,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  attachmentId: string | undefined;
  onSuccess?: () => void;
}) {
  const [loading, setLoading] = useState(false);

  const handleDetach = async () => {
    if (!attachmentId) return;
    setLoading(true);
    try {
      await VolumeService.detach({ attachment_id: attachmentId });
      toast.success("Volume detached successfully");
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
          <DialogTitle>Detach Volume</DialogTitle>
        </DialogHeader>
        <div className="py-4">Are you sure you want to detach this volume?</div>
        <DialogFooter>
          <Button
            variant="outline"
            className="rounded-full cursor-pointer"
            onClick={() => onOpenChange(false)}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            className="rounded-full cursor-pointer"
            onClick={handleDetach}
            disabled={loading}
          >
            {loading ? "Detaching..." : "Detach"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
