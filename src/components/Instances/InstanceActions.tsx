"use client";

import { ConfirmDeleteDialog } from "@/components/reusable/ConfirmDeleteDialog";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { InfraService } from "@/lib/requests";
import type {
  InstanceDeleteRequest,
  InstanceRebootRequest,
  InstanceStartRequest,
  InstanceStopRequest,
} from "@/types/RequestInterfaces";
import type {
  InstanceListItem,
  InstanceStatus,
} from "@/types/ResponseInterfaces";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Power, PowerOff, RotateCcw, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export function InstanceActions({
  instance,
  status,
  disabled = false,
}: {
  instance: InstanceListItem;
  status: InstanceStatus;
  disabled?: boolean;
}) {
  const queryClient = useQueryClient();
  const isDisabled = disabled || status === "BUILD";
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const deleteMutation = useMutation({
    mutationFn: (data: InstanceDeleteRequest) =>
      InfraService.deleteInstance(data),
    onSuccess: async () => {
      setShowDeleteDialog(false);
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["instances"] }),
        queryClient.invalidateQueries({ queryKey: ["instance", instance.id] }),
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
    mutationFn: (data: InstanceStartRequest) =>
      InfraService.startInstance(data),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["instances"] }),
        queryClient.invalidateQueries({ queryKey: ["instance", instance.id] }),
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
    mutationFn: (data: InstanceStopRequest) => InfraService.stopInstance(data),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["instances"] }),
        queryClient.invalidateQueries({ queryKey: ["instance", instance.id] }),
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
    mutationFn: (data: InstanceRebootRequest) =>
      InfraService.rebootInstance(data),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["instances"] }),
        queryClient.invalidateQueries({ queryKey: ["instance", instance.id] }),
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

  const canStart = status === "SHUTOFF" && !isDisabled;
  const canStop = status === "ACTIVE" && !isDisabled;
  const canReboot = status === "ACTIVE" && !isDisabled;

  return (
    <div className="flex flex-wrap items-center justify-center gap-2">
      {canStart && (
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              onClick={(e) => {
                e.stopPropagation();
                startMutation.mutate({ server_id: instance.id });
              }}
              disabled={startMutation.isPending || isDisabled}
              size="sm"
              variant="outline"
              className="group bg-background text-foreground border-border hover:bg-accent hover:text-accent-foreground cursor-pointer rounded-full transition-all duration-200"
            >
              <Power className="group-hover:text-accent-foreground mr-1 h-4 w-4 transition-colors duration-200" />
              <span className="group-hover:text-accent-foreground transition-colors duration-200">
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
                stopMutation.mutate({ server_id: instance.id });
              }}
              disabled={stopMutation.isPending || isDisabled}
              size="sm"
              variant="outline"
              className="group bg-background text-foreground border-border hover:bg-accent hover:text-accent-foreground cursor-pointer rounded-full transition-all duration-200"
            >
              <PowerOff className="group-hover:text-accent-foreground mr-1 h-4 w-4 transition-colors duration-200" />
              <span className="group-hover:text-accent-foreground transition-colors duration-200">
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
                rebootMutation.mutate({ server_id: instance.id });
              }}
              disabled={rebootMutation.isPending || isDisabled}
              size="sm"
              variant="outline"
              className="group bg-background text-foreground border-border hover:bg-accent hover:text-accent-foreground cursor-pointer rounded-full transition-all duration-200"
            >
              <RotateCcw className="group-hover:text-accent-foreground mr-1 h-4 w-4 transition-all duration-300 group-hover:rotate-180" />
              <span className="group-hover:text-accent-foreground transition-colors duration-200">
                Reboot
              </span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>Reboot the instance</TooltipContent>
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
            className="group bg-destructive text-destructive-foreground border-border cursor-pointer rounded-full transition-all duration-200"
          >
            <Trash2 className="mr-1 h-4 w-4 text-white transition-colors duration-200" />
            <span className="text-white transition-colors duration-200">
              Delete
            </span>
          </Button>
        </TooltipTrigger>
        <TooltipContent>Delete the instance</TooltipContent>
      </Tooltip>

      <div onClick={(e) => e.stopPropagation()}>
        <ConfirmDeleteDialog
          open={showDeleteDialog}
          onOpenChange={setShowDeleteDialog}
          title="Delete Instance"
          description="Are you sure you want to delete this instance? This action cannot be undone."
          confirmLabel={
            deleteMutation.isPending ? "Deleting..." : "Delete Instance"
          }
          confirming={deleteMutation.isPending}
          onConfirm={() => deleteMutation.mutate({ server_id: instance.id })}
        />
      </div>
    </div>
  );
}
