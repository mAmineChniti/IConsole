"use client";

import { InstanceFlavorSelectDialog } from "@/components/Instances/InstanceFlavorSelectDialog";
import { InstanceVolumeDialog } from "@/components/Instances/InstanceVolumeDialog";
import { SnapshotDialog } from "@/components/Instances/SnapshotDialog";
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
import type { IdRequest, ResizeRequest } from "@/types/RequestInterfaces";
import type { InstanceListItem } from "@/types/ResponseInterfaces";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Box,
  Camera,
  FileText,
  HardDrive,
  Pause,
  ShieldAlert,
  Terminal,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";

export function InstanceActionsDropdown({
  instance,
  status,
  disabled = false,
  onViewLogs,
}: {
  instance: InstanceListItem;
  status: string;
  disabled?: boolean;
  onViewLogs?: (instance: InstanceListItem) => void;
}) {
  const queryClient = useQueryClient();
  const isDisabled = disabled || status === "BUILD";
  const [isResizeDialogOpen, setIsResizeDialogOpen] = useState(false);
  const [isVolumeDialogOpen, setIsVolumeDialogOpen] = useState(false);
  const [showSnapshotDialog, setShowSnapshotDialog] = useState(false);

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
  });

  const consoleUrl = consoleData?.url;
  const currentFlavorId = flavors?.find((f) => f.name === instance.flavor)?.id;

  const supportedActions = {
    pause: true,
    suspend: true,
    shelve: true,
    rescue: true,
    console: true,
    logs: true,
    resize: true,
    volumes: true,
  };

  const handleViewLogs = () => {
    if (onViewLogs) {
      onViewLogs(instance);
    }
  };

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

  const handleResize = (flavorId: string) => {
    if (flavorId) {
      resizeMutation.mutate({
        instance_id: instance.id,
        new_flavor: flavorId,
      });
    }
  };

  const canSnapshot =
    !isDisabled && (status === "ACTIVE" || status === "SHUTOFF");

  return (
    <>
      <DropdownMenu>
        <Tooltip>
          <TooltipTrigger asChild>
            <DropdownMenuTrigger asChild>
              <div
                className="text-muted-foreground hover:text-foreground cursor-pointer px-1 transition-colors duration-200"
                onClick={(e) => e.stopPropagation()}
              >
                <span className="flex rotate-90 flex-col items-center -space-y-1 text-lg leading-none select-none">
                  <span>•••</span>
                </span>
              </div>
            </DropdownMenuTrigger>
          </TooltipTrigger>
          <TooltipContent>Instance actions</TooltipContent>
        </Tooltip>
        <DropdownMenuContent align="end">
          {supportedActions.pause && (
            <DropdownMenuItem
              onClick={(e) => {
                e.stopPropagation();
                pauseMutation.mutate({ instance_id: instance.id });
              }}
              disabled={isDisabled || status !== "ACTIVE"}
            >
              <Pause className="mr-2 h-4 w-4" /> Pause
            </DropdownMenuItem>
          )}
          {supportedActions.suspend && (
            <DropdownMenuItem
              onClick={(e) => {
                e.stopPropagation();
                suspendMutation.mutate({ instance_id: instance.id });
              }}
              disabled={isDisabled || status !== "ACTIVE"}
            >
              <Pause className="mr-2 h-4 w-4" /> Suspend
            </DropdownMenuItem>
          )}
          {supportedActions.shelve && (
            <DropdownMenuItem
              onClick={(e) => {
                e.stopPropagation();
                shelveMutation.mutate({ instance_id: instance.id });
              }}
              disabled={isDisabled || status !== "ACTIVE"}
            >
              <Pause className="mr-2 h-4 w-4" /> Shelve
            </DropdownMenuItem>
          )}
          {supportedActions.rescue && (
            <DropdownMenuItem
              onClick={(e) => {
                e.stopPropagation();
                rescueMutation.mutate({ instance_id: instance.id });
              }}
              disabled={isDisabled || status !== "ACTIVE"}
            >
              <ShieldAlert className="mr-2 h-4 w-4" /> Rescue Mode
            </DropdownMenuItem>
          )}

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
                {supportedActions.console && (
                  <DropdownMenuItem
                    asChild
                    disabled={isDisabled || isConsoleLoading || !consoleUrl}
                  >
                    <Link
                      href={consoleUrl!}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (!consoleUrl) {
                          e.preventDefault();
                          toast.error("Console URL not available");
                        }
                      }}
                    >
                      <Terminal className="mr-2 h-4 w-4" />
                      {isConsoleLoading ? "Loading console..." : "Open Console"}
                    </Link>
                  </DropdownMenuItem>
                )}
                {supportedActions.logs && (
                  <DropdownMenuItem
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleViewLogs();
                    }}
                    disabled={isDisabled}
                  >
                    <FileText className="mr-2 h-4 w-4" /> View Logs
                  </DropdownMenuItem>
                )}
              </DropdownMenuSubContent>
            </DropdownMenuPortal>
          </DropdownMenuSub>

          {supportedActions.resize && (
            <>
              <DropdownMenuSeparator />
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
                <HardDrive className="mr-2 h-4 w-4" />{" "}
                {instance.has_volume ? "Detach Volume" : "Attach Volume"}
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

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
    </>
  );
}
