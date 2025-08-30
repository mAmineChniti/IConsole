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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";
import { VolumeService } from "@/lib/requests";
import type { VolumeType } from "@/types/ResponseInterfaces";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";

export function VolumeChangeTypeDialog({
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
  const {
    data: types,
    isLoading,
    error,
  } = useQuery<VolumeType[]>({
    queryKey: ["volume-types", "list"],
    queryFn: () => VolumeService.listVolumeTypes(),
  });
  const [selectedType, setSelectedType] = useState<string | undefined>();
  const [loading, setLoading] = useState(false);

  const handleChangeType = async () => {
    if (!volumeId || !selectedType) return;
    setLoading(true);
    try {
      await VolumeService.changeType(
        {
          volume_type: selectedType,
        },
        volumeId,
      );
      toast.success("Volume type changed successfully");
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
          <DialogTitle>Change Volume Type</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          {isLoading ? (
            <div>Loading types...</div>
          ) : error ? (
            <div className="text-destructive">Failed to load types</div>
          ) : (
            <Select value={selectedType} onValueChange={setSelectedType}>
              <SelectTrigger
                className="w-full rounded-full cursor-pointer"
                aria-label="Select type"
              >
                {selectedType
                  ? (types?.find((type) => type.ID === selectedType)?.Name ??
                    "Select type")
                  : "Select type"}
              </SelectTrigger>
              <SelectContent>
                {types && types.length > 0 ? (
                  types.map((type: VolumeType) => (
                    <SelectItem key={type.ID} value={type.ID}>
                      {type.Name}
                    </SelectItem>
                  ))
                ) : (
                  <SelectItem
                    value="no-types"
                    disabled
                    className="text-muted-foreground"
                  >
                    No types found
                  </SelectItem>
                )}
              </SelectContent>
            </Select>
          )}
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
            onClick={handleChangeType}
            disabled={loading || !selectedType}
            className="rounded-full cursor-pointer"
          >
            {loading ? "Changing..." : "Change Type"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
