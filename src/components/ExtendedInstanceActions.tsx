"use client";

import { InstanceFlavorSelectDialog } from "@/components/InstanceFlavorSelectDialog";
import { InstanceVolumeDialog } from "@/components/InstanceVolumeDialog";
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
import { InfraService } from "@/lib/requests";
import type { InstanceListItem } from "@/types/ResponseInterfaces";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Box,
  FileText,
  GripVertical,
  HardDrive,
  Pause,
  ShieldAlert,
  Terminal,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";

export function ExtendedInstanceActions({
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

  const consoleUrl = consoleData?.url;

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
    mutationFn: () => InfraService.pause({ instance_id: instance.id }),
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
    mutationFn: () => InfraService.suspend({ instance_id: instance.id }),
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
    mutationFn: () => InfraService.shelve({ instance_id: instance.id }),
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
    mutationFn: () => InfraService.rescue({ instance_id: instance.id }),
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
    mutationFn: (newFlavorId: string) =>
      InfraService.resize({
        instance_id: instance.id,
        new_flavor: newFlavorId,
      }),
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
    if (flavorId && flavorId !== instance.flavor) {
      resizeMutation.mutate(flavorId);
    }
  };

  return (
    <div className="flex flex-wrap gap-2">
      <DropdownMenu>
        <Tooltip>
          <TooltipTrigger asChild>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                disabled={isDisabled}
                size="sm"
                className="rounded-full transition-all duration-200 cursor-pointer group bg-background text-foreground border-border hover:bg-accent hover:text-accent-foreground"
              >
                <GripVertical className="mr-1 w-4 h-4 transition-colors duration-200 group-hover:text-accent-foreground" />
                <span className="transition-colors duration-200 group-hover:text-accent-foreground">
                  Instance
                </span>
              </Button>
            </DropdownMenuTrigger>
          </TooltipTrigger>
          <TooltipContent>Instance actions</TooltipContent>
        </Tooltip>
        <DropdownMenuContent align="end">
          {supportedActions.pause && (
            <DropdownMenuItem
              onClick={(e) => {
                e.stopPropagation();
                pauseMutation.mutate();
              }}
              disabled={isDisabled || status !== "ACTIVE"}
            >
              <Pause className="mr-2 w-4 h-4" /> Pause
            </DropdownMenuItem>
          )}
          {supportedActions.suspend && (
            <DropdownMenuItem
              onClick={(e) => {
                e.stopPropagation();
                suspendMutation.mutate();
              }}
              disabled={isDisabled || status !== "ACTIVE"}
            >
              <Pause className="mr-2 w-4 h-4" /> Suspend
            </DropdownMenuItem>
          )}
          {supportedActions.shelve && (
            <DropdownMenuItem
              onClick={(e) => {
                e.stopPropagation();
                shelveMutation.mutate();
              }}
              disabled={isDisabled || status !== "ACTIVE"}
            >
              <Pause className="mr-2 w-4 h-4" /> Shelve
            </DropdownMenuItem>
          )}
          {supportedActions.rescue && (
            <DropdownMenuItem
              onClick={(e) => {
                e.stopPropagation();
                rescueMutation.mutate();
              }}
              disabled={isDisabled || status !== "ACTIVE"}
            >
              <ShieldAlert className="mr-2 w-4 h-4" /> Rescue Mode
            </DropdownMenuItem>
          )}

          <DropdownMenuSeparator />
          <DropdownMenuSub>
            <DropdownMenuSubTrigger
              disabled={isDisabled}
              onMouseEnter={() => refetchConsole()}
            >
              <Terminal className="mr-2 w-4 h-4" /> Console
            </DropdownMenuSubTrigger>
            <DropdownMenuPortal>
              <DropdownMenuSubContent>
                {supportedActions.console && (
                  <Link
                    href={consoleUrl ?? "#"}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    passHref
                  >
                    <DropdownMenuItem
                      onClick={(e) => {
                        if (!consoleUrl) {
                          e.preventDefault();
                          e.stopPropagation();
                          toast.error("Console URL not available");
                        }
                      }}
                      disabled={isDisabled || isConsoleLoading || !consoleUrl}
                    >
                      <Terminal className="mr-2 w-4 h-4" />
                      {isConsoleLoading ? "Loading console..." : "Open Console"}
                    </DropdownMenuItem>
                  </Link>
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
                    <FileText className="mr-2 w-4 h-4" /> View Logs
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
                disabled={!["ACTIVE", "SHUTOFF"].includes(status)}
              >
                <Box className="mr-2 w-4 h-4" /> Resize Instance
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="outline"
            disabled={isDisabled}
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              setIsVolumeDialogOpen(true);
            }}
            className="rounded-full transition-all duration-200 cursor-pointer group bg-background text-foreground border-border hover:bg-accent hover:text-accent-foreground"
          >
            <HardDrive className="mr-1 w-4 h-4 transition-colors duration-200 group-hover:text-accent-foreground" />
            <span className="transition-colors duration-200 group-hover:text-accent-foreground">
              {instance.has_volume ? "Detach Volume" : "Attach Volume"}
            </span>
          </Button>
        </TooltipTrigger>
        <TooltipContent>Manage volume attachments</TooltipContent>
      </Tooltip>

      <InstanceVolumeDialog
        open={isVolumeDialogOpen}
        onOpenChange={setIsVolumeDialogOpen}
        instanceId={instance.id}
        hasVolume={instance.has_volume ?? false}
      />
      <InstanceFlavorSelectDialog
        open={isResizeDialogOpen}
        onOpenChange={setIsResizeDialogOpen}
        currentFlavorName={instance.flavor ?? ""}
        onSelect={handleResize}
      />
    </div>
  );
}
