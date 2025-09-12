"use client";

import { XCombobox } from "@/components/reusable/XCombobox";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { VolumeService } from "@/lib/requests";
import type { VolumeAttachmentsDetailsResponse } from "@/types/ResponseInterfaces";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
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
  const queryClient = useQueryClient();

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

  const detachMutation = useMutation({
    mutationFn: ({ attachment_id }: { attachment_id: string }) =>
      VolumeService.detach({ attachment_id }),
    onSuccess: async () => {
      toast.success("Volume detached successfully");
      await queryClient.invalidateQueries({
        queryKey: ["volume-attachments", volumeId],
      });
      await queryClient.invalidateQueries({
        queryKey: ["volumes"],
      });
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to detach volume");
    },
  });

  const handleDetach = (attachmentId: string) => {
    detachMutation.mutate({ attachment_id: attachmentId });
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
                    <XCombobox
                      type="instance"
                      data={
                        instances?.available_instances?.map((inst) => ({
                          label: inst.name,
                          value: inst.id,
                        })) ?? []
                      }
                      value={selectedInstance}
                      onChange={setSelectedInstance}
                      placeholder={
                        !instances?.available_instances?.length
                          ? "No instances found"
                          : "Select instance"
                      }
                      disabled={!instances?.available_instances?.length}
                      className="w-full"
                      clearable
                    />
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
                        disabled={detachMutation.isPending}
                      >
                        {detachMutation.isPending &&
                        detachMutation.variables?.attachment_id ===
                          att.attachment_id
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
