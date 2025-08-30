"use client";

import { Button } from "@/components/ui/button";
import { ConfirmDeleteDialog } from "@/components/reusable/ConfirmDeleteDialog";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { InfraService } from "@/lib/requests";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Camera, Power, PowerOff, RotateCcw, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export function InstanceActions({
  instanceId,
  status,
  disabled = false,
}: {
  instanceId: string;
  status: string;
  disabled?: boolean;
}) {
  const queryClient = useQueryClient();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const deleteMutation = useMutation({
    mutationFn: (id: string) => InfraService.deleteInstance({ server_id: id }),
    onSuccess: async () => {
      setShowDeleteDialog(false);
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["instances"] }),
        queryClient.invalidateQueries({ queryKey: ["instance", instanceId] }),
      ]);
      toast.success("Instance deleted successfully");
    },
    onError: (error: unknown) => {
      toast.error(
        error instanceof Error ? error.message : "Failed to delete instance",
      );
    },
  });

  const startMutation = useMutation({
    mutationFn: (id: string) => InfraService.startInstance({ server_id: id }),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["instances"] }),
        queryClient.invalidateQueries({ queryKey: ["instance", instanceId] }),
      ]);
      toast.success("Instance started successfully");
    },
    onError: (err: unknown) => {
      const message =
        err instanceof Error
          ? err.message
          : typeof err === "string"
            ? err
            : "An unexpected error occurred";
      toast.error(message);
    },
  });

  const stopMutation = useMutation({
    mutationFn: (id: string) => InfraService.stopInstance({ server_id: id }),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["instances"] }),
        queryClient.invalidateQueries({ queryKey: ["instance", instanceId] }),
      ]);
      toast.success("Instance stopped successfully");
    },
    onError: (err: unknown) => {
      const message =
        err instanceof Error
          ? err.message
          : typeof err === "string"
            ? err
            : "An unexpected error occurred";
      toast.error(message);
    },
  });

  const rebootMutation = useMutation({
    mutationFn: (id: string) => InfraService.rebootInstance({ server_id: id }),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["instances"] }),
        queryClient.invalidateQueries({ queryKey: ["instance", instanceId] }),
      ]);
      toast.success("Instance rebooted successfully");
    },
    onError: (err: unknown) => {
      const message =
        err instanceof Error
          ? err.message
          : typeof err === "string"
            ? err
            : "An unexpected error occurred";
      toast.error(message);
    },
  });

  const createSnapshotMutation = useMutation({
    mutationFn: () =>
      InfraService.createSnapshot({
        instance_id: instanceId,
        snapshot_name: `snapshot-${instanceId.slice(0, 8)}-${Date.now()}`,
      }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["snapshots", "list"] });
      toast.success("Snapshot created successfully");
    },
    onError: (err: unknown) =>
      toast.error(
        err instanceof Error ? err.message : "Failed to create snapshot",
      ),
  });

  const isDisabled = disabled || status === "BUILD";
  const canStart = status === "SHUTOFF" && !isDisabled;
  const canStop = status === "ACTIVE" && !isDisabled;
  const canReboot = status === "ACTIVE" && !isDisabled;
  const canSnapshot =
    !isDisabled && (status === "ACTIVE" || status === "SHUTOFF");

  return (
    <div className="flex flex-wrap gap-2">
      {canStart && (
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              onClick={(e) => {
                e.stopPropagation();
                startMutation.mutate(instanceId);
              }}
              disabled={startMutation.isPending || isDisabled}
              size="sm"
              variant="outline"
              className="rounded-full transition-all duration-200 cursor-pointer group bg-background text-foreground border-border hover:bg-accent hover:text-accent-foreground"
            >
              <Power className="mr-1 w-4 h-4 transition-colors duration-200 group-hover:text-accent-foreground" />
              <span className="transition-colors duration-200 group-hover:text-accent-foreground">
                Start
              </span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>Start the instance</TooltipContent>
        </Tooltip>
      )}

      {canStop && (
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              onClick={(e) => {
                e.stopPropagation();
                stopMutation.mutate(instanceId);
              }}
              disabled={stopMutation.isPending || isDisabled}
              size="sm"
              variant="outline"
              className="rounded-full transition-all duration-200 cursor-pointer group bg-background text-foreground border-border hover:bg-accent hover:text-accent-foreground"
            >
              <PowerOff className="mr-1 w-4 h-4 transition-colors duration-200 group-hover:text-accent-foreground" />
              <span className="transition-colors duration-200 group-hover:text-accent-foreground">
                Stop
              </span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>Stop the instance</TooltipContent>
        </Tooltip>
      )}

      {canReboot && (
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              onClick={(e) => {
                e.stopPropagation();
                rebootMutation.mutate(instanceId);
              }}
              disabled={rebootMutation.isPending || isDisabled}
              size="sm"
              variant="outline"
              className="rounded-full transition-all duration-200 cursor-pointer group bg-background text-foreground border-border hover:bg-accent hover:text-accent-foreground"
            >
              <RotateCcw className="mr-1 w-4 h-4 transition-all duration-300 group-hover:rotate-180 group-hover:text-accent-foreground" />
              <span className="transition-colors duration-200 group-hover:text-accent-foreground">
                Reboot
              </span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>Reboot the instance</TooltipContent>
        </Tooltip>
      )}

      {canSnapshot && (
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              onClick={(e) => {
                e.stopPropagation();
                createSnapshotMutation.mutate();
              }}
              disabled={createSnapshotMutation.isPending || isDisabled}
              size="sm"
              variant="outline"
              className="rounded-full transition-all duration-200 cursor-pointer group bg-background text-foreground border-border hover:bg-accent hover:text-accent-foreground"
            >
              <Camera className="mr-1 w-4 h-4 transition-colors duration-200 group-hover:text-accent-foreground" />
              <span className="transition-colors duration-200 group-hover:text-accent-foreground">
                Snapshot
              </span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>Create snapshot</TooltipContent>
        </Tooltip>
      )}

      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            onClick={(e) => {
              e.stopPropagation();
              setShowDeleteDialog(true);
            }}
            disabled={isDisabled}
            size="sm"
            variant="destructive"
            className="rounded-full transition-all duration-200 cursor-pointer group bg-destructive text-destructive-foreground border-border"
          >
            <Trash2 className="mr-1 w-4 h-4 text-white transition-colors duration-200" />
            <span className="text-white transition-colors duration-200">
              Delete
            </span>
          </Button>
        </TooltipTrigger>
        <TooltipContent>Delete the instance</TooltipContent>
      </Tooltip>

      <ConfirmDeleteDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        title="Delete Instance"
        description="Are you sure you want to delete this instance? This action cannot be undone."
        confirmLabel={
          deleteMutation.isPending ? "Deleting..." : "Delete Instance"
        }
        confirming={deleteMutation.isPending}
        onConfirm={() => deleteMutation.mutate(instanceId)}
      />
    </div>
  );
}
