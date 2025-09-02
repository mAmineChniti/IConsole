"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
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
import type { VolumeAttachmentsDetailsResponse } from "@/types/ResponseInterfaces";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";

export function VolumeAttachmentsDialog({
  open,
  onOpenChange,
  volumeId,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  volumeId: string | undefined;
}) {
  const { data, isLoading, error, refetch } = useQuery<
    VolumeAttachmentsDetailsResponse | undefined
  >({
    queryKey: ["volume-attachments", volumeId],
    queryFn: async () => {
      if (!volumeId) return { volume_id: "", volume_name: "", attachments: [] };
      return await VolumeService.getAttachments(volumeId);
    },
    enabled: !!volumeId,
  });
  const [selectedInstance, setSelectedInstance] = useState<
    string | undefined
  >();
  const [attaching, setAttaching] = useState(false);
  const {
    data: instances,
    isLoading: isLoadingInstances,
    error: errorInstances,
  } = useQuery({
    queryKey: ["volume-available-instances", volumeId],
    queryFn: () =>
      volumeId
        ? VolumeService.getAvailableInstances(volumeId)
        : Promise.resolve({
            volume_id: "",
            volume_name: "",
            available_instances: [],
          }),
    enabled: !!volumeId,
  });
  const [detachingId, setDetachingId] = useState<string | undefined>(undefined);
  const handleDetach = async (attachmentId: string) => {
    setDetachingId(attachmentId);
    try {
      await VolumeService.detach({ attachment_id: attachmentId });
      toast.success("Volume detached successfully");
      await refetch();
    } catch (e: unknown) {
      toast.error((e as Error).message || "Failed to detach volume");
    } finally {
      setDetachingId(undefined);
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Volume Attachments</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {isLoading ? (
              <div>Loading attachments...</div>
            ) : error ? (
              <div className="text-destructive">Failed to load attachments</div>
            ) : !data?.attachments?.length ? (
              <>
                <div>No attachments found.</div>
                {isLoadingInstances ? (
                  <div>Loading instances...</div>
                ) : errorInstances ? (
                  <div className="text-destructive">
                    Failed to load instances
                  </div>
                ) : (
                  <>
                    <Select
                      value={selectedInstance}
                      onValueChange={setSelectedInstance}
                    >
                      <SelectTrigger
                        className="w-full cursor-pointer rounded-full"
                        aria-label="Select instance"
                      >
                        {selectedInstance
                          ? (instances?.available_instances?.find(
                              (inst) => inst.id === selectedInstance,
                            )?.name ?? "Select instance")
                          : "Select instance"}
                      </SelectTrigger>
                      <SelectContent>
                        {instances?.available_instances?.length ? (
                          instances.available_instances.map((inst) => (
                            <SelectItem key={inst.id} value={inst.id}>
                              {inst.name}
                            </SelectItem>
                          ))
                        ) : (
                          <SelectItem
                            value="no-instances"
                            disabled
                            className="text-muted-foreground"
                          >
                            No instances found
                          </SelectItem>
                        )}
                      </SelectContent>
                    </Select>
                    <Button
                      variant="default"
                      onClick={async () => {
                        if (!volumeId || !selectedInstance) return;
                        setAttaching(true);
                        try {
                          await VolumeService.attach({
                            volume_id: volumeId,
                            instance_id: selectedInstance,
                          });
                          toast.success("Volume attached successfully");
                          onOpenChange(false);
                          await refetch();
                        } catch (e: unknown) {
                          toast.error((e as Error).message);
                        } finally {
                          setAttaching(false);
                        }
                      }}
                      disabled={attaching || !selectedInstance}
                      className="mt-4 rounded-full"
                    >
                      {attaching ? "Attaching..." : "Attach"}
                    </Button>
                  </>
                )}
              </>
            ) : (
              <ul className="space-y-2">
                {data.attachments?.map(
                  (
                    att: VolumeAttachmentsDetailsResponse["attachments"][number],
                  ) => (
                    <li
                      key={att.attachment_id}
                      className="flex flex-col gap-2 rounded border p-2 sm:flex-row sm:items-center sm:justify-between"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="font-medium">
                          {att.server_name || att.server_id}
                        </div>
                        <div className="text-muted-foreground text-xs">
                          Device: {att.device} | Host: {att.host} | Attached at:{" "}
                          {new Date(att.attached_at).toLocaleString()}
                        </div>
                      </div>
                      <Button
                        size="sm"
                        variant="destructive"
                        className="cursor-pointer rounded-full"
                        onClick={() => handleDetach(att.attachment_id)}
                        disabled={!!detachingId}
                      >
                        {detachingId === att.attachment_id
                          ? "Detaching..."
                          : "Detach"}
                      </Button>
                    </li>
                  ),
                )}
              </ul>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
