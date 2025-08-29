import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { InfraService } from "@/lib/requests";
import {
  type AvailableVolumesResponse,
  type AttachedVolumesResponse,
} from "@/types/ResponseInterfaces";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { HardDriveUpload, Loader2, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export function InstanceVolumeDialog({
  open,
  onOpenChange,
  instanceId,
  hasVolume,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  instanceId: string;
  hasVolume: boolean;
}) {
  const [selectedVolume, setSelectedVolume] = useState<string>("");
  const queryClient = useQueryClient();

  const { data: attachedVolumes = [], isLoading: isLoadingAttached } = useQuery(
    {
      queryKey: ["attachedVolumes", instanceId],
      queryFn: async () => {
        const response = await InfraService.listAttachedVolumes({
          instance_id: instanceId,
        });
        return response;
      },
      enabled: hasVolume && open,
      initialData: [] as AttachedVolumesResponse,
      select: (data) => data,
    },
  );

  const { data: availableVolumes = [], isLoading: isLoadingAvailable } =
    useQuery<AvailableVolumesResponse>({
      queryKey: ["availableVolumes"],
      queryFn: () => InfraService.listAvailableVolumes(),
      enabled: !hasVolume && open,
      select: (data) => data,
    });

  const attachMutation = useMutation({
    mutationFn: async (volumeId: string) => {
      await InfraService.attachVolume({
        instance_id: instanceId,
        volume_id: volumeId,
      });
    },
    onSuccess: async () => {
      toast.success("Volume attached successfully");
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["instances", "details"] }),
        queryClient.invalidateQueries({
          queryKey: ["attachedVolumes", instanceId],
        }),
        queryClient.invalidateQueries({ queryKey: ["availableVolumes"] }),
      ]);
      onOpenChange(false);
    },
    onError: (error: Error) => {
      toast.error(
        `Failed to attach volume: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    },
  });

  const detachMutation = useMutation({
    mutationFn: async (volumeId: string) => {
      await InfraService.detachVolume({
        instance_id: instanceId,
        volume_id: volumeId,
      });
    },
    onSuccess: async () => {
      toast.success("Volume detached successfully");
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["instances", "details"] }),
        queryClient.invalidateQueries({
          queryKey: ["attachedVolumes", instanceId],
        }),
        queryClient.invalidateQueries({ queryKey: ["availableVolumes"] }),
      ]);
      onOpenChange(false);
    },
    onError: (error: Error) => {
      toast.error(
        `Failed to detach volume: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    },
  });

  const handleDetach = () => {
    const volumeToDetach = attachedVolumes?.[0];
    if (volumeToDetach?.id) {
      detachMutation.mutate(volumeToDetach.id);
    }
  };

  const handleAttach = () => {
    if (selectedVolume) {
      attachMutation.mutate(selectedVolume);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {hasVolume ? "Detach Volume" : "Attach Volume"}
          </DialogTitle>
          <DialogDescription>
            {hasVolume
              ? "Detach a volume from this instance."
              : "Attach an existing volume to this instance."}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {hasVolume ? (
            <div>
              <h4 className="font-medium">Attached Volume</h4>
              {isLoadingAttached ? (
                <div className="flex items-center space-x-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Loading volume information...</span>
                </div>
              ) : attachedVolumes?.length ? (
                <div className="p-3 mt-2 rounded-lg border">
                  <p className="font-medium">
                    {attachedVolumes[0]?.name ?? "Unnamed Volume"}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    ID: {attachedVolumes[0]?.id ?? "N/A"}
                  </p>
                  <Button
                    variant="destructive"
                    size="sm"
                    className="mt-2 w-full rounded-full cursor-pointer"
                    onClick={handleDetach}
                    disabled={detachMutation.isPending}
                  >
                    {detachMutation.isPending ? (
                      <Loader2 className="mr-2 w-4 h-4 animate-spin" />
                    ) : (
                      <Trash2 className="mr-2 w-4 h-4" />
                    )}
                    Detach Volume
                  </Button>
                </div>
              ) : (
                <p className="text-muted-foreground">No volume attached</p>
              )}
            </div>
          ) : (
            <div>
              <h4 className="mb-2 font-medium">Available Volumes</h4>
              {isLoadingAvailable ? (
                <div className="flex items-center space-x-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Loading available volumes...</span>
                </div>
              ) : availableVolumes.length > 0 ? (
                <div className="space-y-2">
                  <Select
                    value={selectedVolume}
                    onValueChange={setSelectedVolume}
                  >
                    <SelectTrigger className="w-full rounded-full cursor-pointer">
                      <SelectValue placeholder="Select a volume to attach" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableVolumes.map((volume) => (
                        <SelectItem key={volume.id} value={volume.id}>
                          {volume.name || "Unnamed Volume"} (ID: {volume.id})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button
                    onClick={handleAttach}
                    className="w-full rounded-full cursor-pointer"
                    disabled={!selectedVolume || attachMutation.isPending}
                  >
                    {attachMutation.isPending ? (
                      <Loader2 className="mr-2 w-4 h-4 animate-spin" />
                    ) : (
                      <HardDriveUpload className="mr-2 w-4 h-4" />
                    )}
                    Attach Volume
                  </Button>
                </div>
              ) : (
                <p className="text-muted-foreground">
                  No volumes available to attach
                </p>
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
