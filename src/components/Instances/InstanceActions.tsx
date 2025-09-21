"use client";

import { InstanceFlavorSelectDialog } from "@/components/Instances/InstanceFlavorSelectDialog";
import { InstanceVolumeDialog } from "@/components/Instances/InstanceVolumeDialog";
import { SnapshotDialog } from "@/components/Instances/SnapshotDialog";
import { ConfirmDeleteDialog } from "@/components/reusable/ConfirmDeleteDialog";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuPortal,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { FlavorService, InfraService } from "@/lib/requests";
import type {
  IdRequest,
  InstanceDeleteRequest,
  InstanceRebootRequest,
  InstanceStartRequest,
  InstanceStopRequest,
  ResizeRequest,
} from "@/types/RequestInterfaces";
import type {
  InstanceListItem,
  InstanceStatus,
} from "@/types/ResponseInterfaces";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Box,
  Camera,
  FileText,
  HardDrive,
  MoreVertical,
  Pause,
  Power,
  PowerOff,
  RotateCcw,
  ShieldAlert,
  Terminal,
  Trash2,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";

export function InstanceActions({
  instance,
  status,
  disabled = false,
  onViewLogs,
}: {
  instance: InstanceListItem;
  status: InstanceStatus;
  disabled?: boolean;
  onViewLogs?: (instance: InstanceListItem) => void;
}) {
  const queryClient = useQueryClient();
  const isDisabled = disabled || status === "BUILD";
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isResizeDialogOpen, setIsResizeDialogOpen] = useState(false);
  const [isVolumeDialogOpen, setIsVolumeDialogOpen] = useState(false);
  const [showSnapshotDialog, setShowSnapshotDialog] = useState(false);

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

  const {
    data: consoleData,
    isLoading: isConsoleLoading,
    refetch: refetchConsole,
  } = useQuery({
    queryKey: ["console", instance.id],
    queryFn: () => InfraService.getConsole({ instance_id: instance.id }),
    enabled: false,
    refetchOnWindowFocus: false,
    retry: 1,
  });

  const { data: flavors = [] } = useQuery({
    queryKey: ["flavors"],
    queryFn: () => FlavorService.list(),
    staleTime: 5 * 60 * 1000,
    enabled: isResizeDialogOpen,
  });

  const consoleUrl = consoleData?.url;
  const currentFlavorId = flavors?.find((f) => f.name === instance.flavor)?.id;

  const canSnapshot =
    !isDisabled && (status === "ACTIVE" || status === "SHUTOFF");

  const handleResize = (flavorId: string) => {
    if (flavorId) {
      resizeMutation.mutate({
        instance_id: instance.id,
        new_flavor: flavorId,
      });
    }
  };

  const resizeMutation = useMutation({
    mutationFn: (data: ResizeRequest) => InfraService.resize(data),
    onSuccess: async () => {
      toast.success("Instance resize started successfully");
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["instances"] }),
        queryClient.invalidateQueries({ queryKey: ["instance", instance.id] }),
      ]);
    },
    onError: (error: Error) => {
      toast.error(`Failed to resize instance: ${error.message}`);
    },
  });

  // Pause/Suspend/Shelve/Rescue mutations (ported from dropdown component)
  const pauseMutation = useMutation({
    mutationFn: (data: IdRequest) => InfraService.pause(data),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["instances"] }),
        queryClient.invalidateQueries({ queryKey: ["instance", instance.id] }),
      ]);
      toast.success("Instance paused successfully");
    },
    onError: (err: unknown) =>
      toast.error(err instanceof Error ? err.message : "Failed to pause"),
  });

  const suspendMutation = useMutation({
    mutationFn: (data: IdRequest) => InfraService.suspend(data),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["instances"] }),
        queryClient.invalidateQueries({ queryKey: ["instance", instance.id] }),
      ]);
      toast.success("Instance suspended successfully");
    },
    onError: (err: unknown) =>
      toast.error(err instanceof Error ? err.message : "Failed to suspend"),
  });

  const shelveMutation = useMutation({
    mutationFn: (data: IdRequest) => InfraService.shelve(data),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["instances"] }),
        queryClient.invalidateQueries({ queryKey: ["instance", instance.id] }),
      ]);
      toast.success("Instance shelved successfully");
    },
    onError: (err: unknown) =>
      toast.error(err instanceof Error ? err.message : "Failed to shelve"),
  });

  const rescueMutation = useMutation({
    mutationFn: (data: IdRequest) => InfraService.rescue(data),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["instances"] }),
        queryClient.invalidateQueries({ queryKey: ["instance", instance.id] }),
      ]);
      toast.success("Rescue mode activated");
    },
    onError: (err: unknown) =>
      toast.error(err instanceof Error ? err.message : "Failed to rescue"),
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

  const canStart = ["SHUTOFF", "PAUSED"].includes(status) && !isDisabled;
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

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            onClick={(e) => e.stopPropagation()}
            disabled={isDisabled}
            className="group bg-background text-foreground border-border hover:bg-accent hover:text-accent-foreground cursor-pointer rounded-full transition-all duration-200"
          >
            <MoreVertical className="group-hover:text-accent-foreground mr-1 h-4 w-4 transition-colors duration-200" />
            <span className="group-hover:text-accent-foreground transition-colors duration-200">
              Actions
            </span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem
            onClick={(e) => {
              e.stopPropagation();
              setIsResizeDialogOpen(true);
            }}
            disabled={isDisabled || !["ACTIVE", "SHUTOFF"].includes(status)}
          >
            <Box className="mr-2 h-4 w-4" /> Resize Instance
          </DropdownMenuItem>
          {canSnapshot && (
            <DropdownMenuItem
              onClick={(e) => {
                e.stopPropagation();
                setShowSnapshotDialog(true);
              }}
              disabled={isDisabled}
            >
              <Camera className="mr-2 h-4 w-4" /> Create Snapshot
            </DropdownMenuItem>
          )}
          <DropdownMenuItem
            onClick={(e) => {
              e.stopPropagation();
              setIsVolumeDialogOpen(true);
            }}
            disabled={isDisabled}
          >
            <HardDrive className="mr-2 h-4 w-4" />
            {instance.has_volume ? "Detach Volume" : "Attach Volume"}
          </DropdownMenuItem>

          <DropdownMenuSeparator />

          <DropdownMenuSub>
            <DropdownMenuSubTrigger
              disabled={isDisabled}
              onMouseEnter={() => refetchConsole()}
            >
              <Terminal className="mr-2 h-4 w-4" /> Console
            </DropdownMenuSubTrigger>
            <DropdownMenuPortal>
              <DropdownMenuSubContent>
                {isConsoleLoading && (
                  <DropdownMenuItem disabled>
                    <Terminal className="mr-2 h-4 w-4 animate-pulse" />
                    Loading console...
                  </DropdownMenuItem>
                )}
                {!isConsoleLoading && consoleUrl && (
                  <DropdownMenuItem asChild disabled={isDisabled}>
                    <Link
                      href={consoleUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Terminal className="mr-2 h-4 w-4" /> Open Console
                    </Link>
                  </DropdownMenuItem>
                )}
                {!isConsoleLoading && !consoleUrl && (
                  <DropdownMenuItem disabled>
                    <Terminal className="mr-2 h-4 w-4" /> Console Unavailable
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    if (onViewLogs) {
                      onViewLogs(instance);
                    }
                  }}
                  disabled={isDisabled}
                >
                  <FileText className="mr-2 h-4 w-4" /> View Logs
                </DropdownMenuItem>
              </DropdownMenuSubContent>
            </DropdownMenuPortal>
          </DropdownMenuSub>

          <DropdownMenuSeparator />

          <DropdownMenuItem
            onClick={(e) => {
              e.stopPropagation();
              pauseMutation.mutate({ instance_id: instance.id });
            }}
            disabled={isDisabled || status !== "ACTIVE"}
          >
            <Pause className="mr-2 h-4 w-4" /> Pause
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={(e) => {
              e.stopPropagation();
              suspendMutation.mutate({ instance_id: instance.id });
            }}
            disabled={isDisabled || status !== "ACTIVE"}
          >
            <Pause className="mr-2 h-4 w-4" /> Suspend
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={(e) => {
              e.stopPropagation();
              shelveMutation.mutate({ instance_id: instance.id });
            }}
            disabled={isDisabled || status !== "ACTIVE"}
          >
            <Pause className="mr-2 h-4 w-4" /> Shelve
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={(e) => {
              e.stopPropagation();
              rescueMutation.mutate({ instance_id: instance.id });
            }}
            disabled={isDisabled || status !== "ACTIVE"}
          >
            <ShieldAlert className="mr-2 h-4 w-4" /> Rescue Mode
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

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

      <div onClick={(e) => e.stopPropagation()}>
        <InstanceVolumeDialog
          open={isVolumeDialogOpen}
          onOpenChange={setIsVolumeDialogOpen}
          instanceId={instance.id}
          hasVolume={instance.has_volume}
        />
      </div>
      <div onClick={(e) => e.stopPropagation()}>
        <InstanceFlavorSelectDialog
          open={isResizeDialogOpen}
          onOpenChange={setIsResizeDialogOpen}
          currentFlavorId={currentFlavorId}
          onSelect={handleResize}
        />
      </div>
      <div onClick={(e) => e.stopPropagation()}>
        <SnapshotDialog
          open={showSnapshotDialog}
          onOpenChange={setShowSnapshotDialog}
          instanceId={instance.id}
          instanceName={instance.instance_name}
          disabled={isDisabled}
        />
      </div>
    </div>
  );
}
