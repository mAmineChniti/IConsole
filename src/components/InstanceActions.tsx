"use client";

import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { InfraService } from "@/lib/requests";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Power, PowerOff, RotateCcw, Trash2 } from "lucide-react";
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

  const startMutation = useMutation({
    mutationFn: (id: string) => InfraService.startInstance({ server_id: id }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["instances", "details"],
      });
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
      await queryClient.invalidateQueries({
        queryKey: ["instances", "details"],
      });
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
      await queryClient.invalidateQueries({
        queryKey: ["instances", "details"],
      });
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

  const deleteMutation = useMutation({
    mutationFn: (id: string) => InfraService.deleteInstance({ server_id: id }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["instances", "details"],
      });
      toast.success("Instance deleted successfully");
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

  const isDisabled = disabled || status === "BUILD";
  const canStart = status === "SHUTOFF" && !isDisabled;
  const canStop = status === "ACTIVE" && !isDisabled;
  const canReboot = status === "ACTIVE" && !isDisabled;

  return (
    <div className="flex overflow-x-auto flex-wrap gap-2 gap-y-2 justify-center pt-4 mt-4 w-full max-w-full border-t sm:flex-nowrap border-border">
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

      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            onClick={(e) => {
              e.stopPropagation();
              deleteMutation.mutate(instanceId);
            }}
            disabled={deleteMutation.isPending || isDisabled}
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
    </div>
  );
}
