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

export function VolumeUploadToImageDialog({
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
  const [imageName, setImageName] = useState("");
  const [loading, setLoading] = useState(false);

  const handleUpload = async () => {
    if (!volumeId || !imageName) return;
    setLoading(true);
    try {
      await VolumeService.uploadToImage({
        volume_id: volumeId,
        image_name: imageName,
      });
      toast.success("Volume uploaded to image successfully");
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
          <DialogTitle>Upload Volume to Image</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <label className="block mb-1 text-sm font-medium">Image Name</label>
            <Input
              value={imageName}
              className="w-full rounded-full"
              onChange={(e) => setImageName(e.target.value)}
            />
          </div>
        </div>
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
            variant="default"
            className="rounded-full cursor-pointer"
            onClick={handleUpload}
            disabled={loading || !imageName}
          >
            {loading ? "Uploading..." : "Upload"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
