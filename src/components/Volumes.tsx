"use client";

import { ConfirmDeleteDialog } from "@/components/ConfirmDeleteDialog";
import { EmptyState } from "@/components/EmptyState";
import { ErrorCard } from "@/components/ErrorCard";
import { HeaderActions } from "@/components/HeaderActions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { VolumeAttachmentsDialog } from "@/components/VolumeAttachmentsDialog";
import { VolumeChangeTypeDialog } from "@/components/VolumeChangeTypeDialog";
import { VolumeCreateForm } from "@/components/VolumeCreateForm";
import { VolumeCreateSnapshotDialog } from "@/components/VolumeCreateSnapshotDialog";
import { VolumeDetailsDialog } from "@/components/VolumeDetailsDialog";
import { VolumeExtendDialog } from "@/components/VolumeExtendDialog";
import { VolumeUploadToImageDialog } from "@/components/VolumeUploadToImageDialog";
import { XSearch } from "@/components/XSearch";
import { VolumeService } from "@/lib/requests";
import { cn, parseVolumeSizeGiB } from "@/lib/utils";
import type { VolumeDeleteRequest } from "@/types/RequestInterfaces";
import type { VolumeDetails } from "@/types/ResponseInterfaces";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Box,
  Eye,
  HardDrive,
  Loader2,
  Plus,
  RefreshCw,
  Server,
  Trash2,
} from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export function Volumes() {
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [selectedVolumeId, setSelectedVolumeId] = useState<string | undefined>(
    undefined,
  );
  const [visibleCount, setVisibleCount] = useState(6);
  const [showCreate, setShowCreate] = useState(false);
  const [volumeToDelete, setVolumeToDelete] = useState<
    VolumeDetails | undefined
  >(undefined);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [search, setSearch] = useState("");
  useEffect(() => {
    if (!deleteDialogOpen) {
      setVolumeToDelete(undefined);
    }
  }, [deleteDialogOpen]);
  useEffect(() => {
    setVisibleCount(6);
  }, [search]);

  const [extendDialog, setExtendDialog] = useState<{
    open: boolean;
    volumeId?: string;
    currentSize?: number;
  }>({ open: false });
  const [uploadDialog, setUploadDialog] = useState<{
    open: boolean;
    volumeId?: string;
  }>({ open: false });
  const [changeTypeDialog, setChangeTypeDialog] = useState<{
    open: boolean;
    volumeId?: string;
  }>({ open: false });
  const [attachmentsDialog, setAttachmentsDialog] = useState<{
    open: boolean;
    volumeId?: string;
  }>({ open: false });
  const [snapshotDialog, setSnapshotDialog] = useState<{
    open: boolean;
    volumeId?: string;
  }>({ open: false });
  const queryClient = useQueryClient();

  const deleteMutation = useMutation({
    mutationFn: async (volumeToDelete: VolumeDeleteRequest) =>
      VolumeService.delete(volumeToDelete),
    onSuccess: async () => {
      toast.success("Volume deleted successfully");
      setDeleteDialogOpen(false);
      await queryClient.invalidateQueries({ queryKey: ["volumes"] });
    },
    onError: (err: unknown) => {
      toast.error((err as Error).message);
    },
  });

  const { data, isLoading, error, refetch, isFetching } = useQuery<
    VolumeDetails[]
  >({
    queryKey: ["volumes"],
    queryFn: () => VolumeService.list(),
    refetchInterval: 15000,
    staleTime: 10000,
    gcTime: 5 * 60 * 1000,
  });

  const volumes = data ?? [];
  const trimmed = search.trim().toLowerCase();
  const filtered = trimmed
    ? volumes.filter((v) => {
        const fields = [v.Name ?? "", v.Status ?? "", v.Type ?? "", v.ID ?? ""];
        return fields.some((f) => f.toString().toLowerCase().includes(trimmed));
      })
    : volumes;
  const totalItems = filtered.length;
  const visibleData = filtered.slice(0, visibleCount);
  const hasMore = visibleCount < totalItems;
  const selectedVolumeItem = selectedVolumeId
    ? volumes.find((v) => v.ID === selectedVolumeId)
    : undefined;

  const handleShowMore = () => setVisibleCount((prev) => prev + 6);
  const handleCreateSuccess = async () => {
    setShowCreate(false);
    await refetch();
  };

  if (showCreate) {
    return (
      <VolumeCreateForm
        onSuccess={handleCreateSuccess}
        onCancel={() => setShowCreate(false)}
      />
    );
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col gap-2 sm:flex-row sm:gap-0 sm:justify-between sm:items-center">
          <Skeleton className="w-40 h-4" />
          <div className="flex gap-3 justify-end items-center w-full sm:w-auto">
            <Skeleton className="w-9 h-9 rounded-full" />
            <Skeleton className="w-40 h-10 rounded-full" />
          </div>
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card
              key={`skeleton-${i}`}
              className="flex flex-col h-full rounded-xl border shadow-lg transition-all duration-200 cursor-pointer hover:shadow-xl bg-card text-card-foreground border-border/50 group"
            >
              <CardHeader className="pb-3">
                <div className="flex justify-between items-center">
                  <CardTitle className="text-lg font-semibold text-card-foreground truncate">
                    <Skeleton className="w-32 h-6 rounded" />
                  </CardTitle>
                  <span className="py-1 px-2 text-xs rounded bg-muted text-muted-foreground">
                    <Skeleton className="w-16 h-4 rounded" />
                  </span>
                </div>
              </CardHeader>
              <CardContent className="flex flex-col flex-1 pt-0">
                <div className="flex-1 space-y-3">
                  <div className="flex flex-col gap-3 mt-2">
                    <div className="flex flex-row gap-3 items-center">
                      <div className="flex flex-1 p-2 min-w-0 rounded-lg bg-muted/60">
                        <div className="flex gap-2 items-center w-full">
                          <span className="inline-flex justify-center items-center w-7 h-7 bg-blue-100 rounded-md dark:bg-blue-900/30">
                            <Skeleton className="w-4 h-4 rounded" />
                          </span>
                          <div className="flex flex-col min-w-0">
                            <Skeleton className="mb-1 w-10 h-3" />
                            <span className="text-sm font-semibold text-card-foreground truncate">
                              <Skeleton className="w-16 h-4" />
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-1 p-2 min-w-0 rounded-lg bg-muted/60">
                        <div className="flex gap-2 items-center w-full">
                          <span className="inline-flex justify-center items-center w-7 h-7 bg-purple-100 rounded-md dark:bg-purple-900/30">
                            <Skeleton className="w-4 h-4 rounded" />
                          </span>
                          <div className="flex flex-col min-w-0">
                            <Skeleton className="mb-1 w-10 h-3" />
                            <span className="text-sm font-semibold text-card-foreground truncate">
                              <Skeleton className="w-16 h-4" />
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-row gap-3 items-center">
                      <div className="flex flex-1 p-2 min-w-0 rounded-lg bg-muted/60">
                        <div className="flex flex-col min-w-0">
                          <Skeleton className="mb-1 w-10 h-3" />
                          <span className="text-sm font-semibold text-card-foreground truncate">
                            <Skeleton className="w-16 h-4" />
                          </span>
                        </div>
                      </div>
                      <div className="flex flex-1 p-2 min-w-0 rounded-lg bg-muted/60">
                        <div className="flex flex-col min-w-0">
                          <Skeleton className="mb-1 w-10 h-3" />
                          <span className="text-sm font-semibold text-card-foreground truncate">
                            <Skeleton className="w-10 h-4" />
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex flex-col gap-2 mt-4">
                  <div className="flex gap-2 justify-center items-center w-full">
                    <Skeleton className="w-20 h-8 rounded-full" />
                    <Skeleton className="w-20 h-8 rounded-full" />
                    <Skeleton className="w-20 h-8 rounded-full" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="flex justify-center px-4 sm:px-0">
          <Skeleton className="w-40 h-9 rounded-full" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <ErrorCard
        title="Failed to Load Volumes"
        message={
          "There was an error loading your volumes. Please check your connection and try again."
        }
        onRetry={() => refetch()}
        isRetrying={isFetching}
      />
    );
  }

  if (!volumes || volumes.length === 0) {
    return (
      <div className="space-y-6">
        <EmptyState
          title="No volumes found"
          text="Create your first volume to get started."
          onRefresh={() => refetch()}
          refreshing={isFetching}
          icon={<HardDrive className="w-7 h-7 text-muted-foreground" />}
          variant="dashed"
          primaryActions={[
            {
              label: "Create Volume",
              onClick: () => setShowCreate(true),
              icon: <Plus />,
            },
          ]}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:gap-0 sm:justify-between sm:items-center">
        <div className="text-sm leading-relaxed text-muted-foreground">
          {totalItems} volume{totalItems !== 1 ? "s" : ""} total
          {totalItems > 0 && (
            <>
              {" • "}
              Showing {Math.min(visibleCount, totalItems)} of {totalItems}
            </>
          )}
        </div>
        <HeaderActions
          onRefresh={() => refetch()}
          isRefreshing={isFetching}
          refreshTooltip="Refresh"
          refreshAriaLabel="Refresh volumes"
          mainButton={{
            onClick: () => setShowCreate(true),
            label: "Create Volume",
            shortLabel: "New",
            tooltip: "Create a new volume",
          }}
        />
      </div>

      <div className="flex flex-col gap-4 items-stretch sm:flex-row sm:items-center">
        <div className="flex-1 max-w-full sm:max-w-md">
          <XSearch
            value={search}
            onChange={setSearch}
            placeholder="Search volumes..."
            aria-label="Search volumes"
          />
        </div>
      </div>

      {totalItems === 0 ? (
        <div className="p-8 text-center rounded-2xl border text-muted-foreground">
          No volumes match your search.
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {visibleData.map((volume, idx) => (
            <Card
              key={volume.ID || idx}
              className="flex flex-col h-full rounded-xl border shadow-lg transition-all duration-200 bg-card text-card-foreground border-border/50 group"
            >
              <CardHeader className="pb-3">
                <div className="flex justify-between items-center">
                  <CardTitle className="text-lg font-semibold text-card-foreground truncate">
                    {volume.Name ?? "Unnamed"}
                  </CardTitle>
                  <Badge
                    variant={
                      volume.Status === "Available"
                        ? "default"
                        : volume.Status === "In-use"
                          ? "secondary"
                          : "secondary"
                    }
                    className={cn(
                      "gap-1.5",
                      volume.Status === "Available"
                        ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400"
                        : volume.Status === "In-use"
                          ? "bg-muted text-muted-foreground border border-border"
                          : "bg-blue-100 text-blue-700 border border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800",
                    )}
                  >
                    {volume.Status === "Available" ||
                    volume.Status === "In-use" ? (
                      <div
                        className={cn(
                          "w-1.5 h-1.5 rounded-full animate-pulse",
                          volume.Status === "Available"
                            ? "bg-green-500"
                            : "bg-muted-foreground",
                        )}
                      />
                    ) : (
                      <Loader2 className="w-3 h-3 text-blue-500 animate-spin" />
                    )}
                    {volume.Status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="flex flex-col flex-1 pt-0">
                <div className="flex-1 space-y-3">
                  <div className="flex flex-col gap-3 mt-2">
                    <div className="flex flex-row gap-3 items-center">
                      <div className="flex flex-1 p-2 min-w-0 rounded-lg bg-muted/60">
                        <div className="flex gap-2 items-center w-full">
                          <span className="inline-flex justify-center items-center w-7 h-7 bg-blue-100 rounded-md dark:bg-blue-900/30">
                            <HardDrive className="w-4 h-4 text-blue-500 dark:text-blue-400" />
                          </span>
                          <div className="flex flex-col min-w-0">
                            <span className="text-xs font-medium text-muted-foreground">
                              Size
                            </span>
                            <span className="text-sm font-semibold text-card-foreground truncate">
                              {volume.Size}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-1 p-2 min-w-0 rounded-lg bg-muted/60">
                        <div className="flex gap-2 items-center w-full">
                          <span className="inline-flex justify-center items-center w-7 h-7 bg-purple-100 rounded-md dark:bg-purple-900/30">
                            <Server className="w-4 h-4 text-purple-500 dark:text-purple-400" />
                          </span>
                          <div className="flex flex-col min-w-0">
                            <span className="text-xs font-medium text-muted-foreground">
                              Type
                            </span>
                            <span className="text-sm font-semibold text-card-foreground truncate">
                              {volume.Type ?? "-"}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-row gap-3 items-center">
                      <div className="flex flex-1 p-2 min-w-0 rounded-lg bg-muted/60">
                        <div className="flex flex-col min-w-0">
                          <span className="text-xs font-medium text-muted-foreground">
                            Availability Zone
                          </span>
                          <span className="text-sm font-semibold text-card-foreground truncate">
                            {volume["Availability Zone"] ?? "-"}
                          </span>
                        </div>
                      </div>
                      <div className="flex flex-1 p-2 min-w-0 rounded-lg bg-muted/60">
                        <div className="flex flex-col min-w-0">
                          <span className="text-xs font-medium text-muted-foreground">
                            Bootable
                          </span>
                          <span className="text-sm font-semibold text-card-foreground truncate">
                            {volume.Bootable ?? "-"}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex flex-col gap-2 mt-4">
                  <div className="flex gap-2 justify-center w-full">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          className="gap-2 px-3 rounded-full cursor-pointer"
                          aria-label="View details"
                          onClick={() => {
                            setSelectedVolumeId(volume.ID);
                            setDetailsDialogOpen(true);
                          }}
                        >
                          <Eye className="w-4 h-4" /> View
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>View volume details</TooltipContent>
                    </Tooltip>

                    <DropdownMenu>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <span className="inline-flex">
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                                className="gap-2 px-3 rounded-full cursor-pointer"
                                onClick={(e) => e.stopPropagation()}
                                aria-label="Actions"
                              >
                                Actions
                              </Button>
                            </DropdownMenuTrigger>
                          </span>
                        </TooltipTrigger>
                        <TooltipContent>Open volume actions</TooltipContent>
                      </Tooltip>
                      <DropdownMenuContent
                        align="end"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <DropdownMenuItem
                          onSelect={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            setAttachmentsDialog({
                              open: true,
                              volumeId: volume.ID,
                            });
                          }}
                        >
                          <Server className="w-4 h-4" /> Attachments
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onSelect={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            setExtendDialog({
                              open: true,
                              volumeId: volume.ID,
                              currentSize: parseVolumeSizeGiB(volume.Size),
                            });
                          }}
                        >
                          <Plus className="w-4 h-4" /> Extend
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onSelect={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            setUploadDialog({
                              open: true,
                              volumeId: volume.ID,
                            });
                          }}
                        >
                          <HardDrive className="w-4 h-4" /> Upload to Image
                        </DropdownMenuItem>
                        {volume.Status !== "In-use" && (
                          <DropdownMenuItem
                            onSelect={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              setSnapshotDialog({
                                open: true,
                                volumeId: volume.ID,
                              });
                            }}
                          >
                            <Box className="w-4 h-4" /> Create Snapshot
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem
                          onSelect={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            setChangeTypeDialog({
                              open: true,
                              volumeId: volume.ID,
                            });
                          }}
                        >
                          <RefreshCw className="w-4 h-4" /> Change Type
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          variant="destructive"
                          onSelect={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            setVolumeToDelete(volume);
                            setDeleteDialogOpen(true);
                          }}
                        >
                          <Trash2 className="w-4 h-4" /> Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="destructive"
                          size="sm"
                          className="gap-2 px-3 rounded-full cursor-pointer"
                          aria-label="Delete volume"
                          onClick={(e) => {
                            e.stopPropagation();
                            setVolumeToDelete(volume);
                            setDeleteDialogOpen(true);
                          }}
                          disabled={deleteMutation.isPending}
                        >
                          <Trash2 className="w-4 h-4" /> Delete
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Delete this volume</TooltipContent>
                    </Tooltip>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
      <VolumeDetailsDialog
        open={detailsDialogOpen}
        onOpenChange={(open) => {
          setDetailsDialogOpen(open);
          if (!open) setSelectedVolumeId(undefined);
        }}
        volumeId={selectedVolumeId}
        volumeItem={selectedVolumeItem}
      />
      <VolumeExtendDialog
        open={extendDialog.open}
        onOpenChange={(open) =>
          setExtendDialog({
            open,
            volumeId: extendDialog.volumeId,
            currentSize: extendDialog.currentSize,
          })
        }
        volumeId={extendDialog.volumeId}
        currentSize={extendDialog.currentSize ?? 1}
        onSuccess={refetch}
      />
      <VolumeUploadToImageDialog
        open={uploadDialog.open}
        onOpenChange={(open) =>
          setUploadDialog({ open, volumeId: uploadDialog.volumeId })
        }
        volumeId={uploadDialog.volumeId}
        onSuccess={refetch}
      />
      <VolumeChangeTypeDialog
        open={changeTypeDialog.open}
        onOpenChange={(open) =>
          setChangeTypeDialog({ open, volumeId: changeTypeDialog.volumeId })
        }
        volumeId={changeTypeDialog.volumeId}
        onSuccess={refetch}
      />
      <VolumeCreateSnapshotDialog
        open={snapshotDialog.open}
        onOpenChange={(open) =>
          setSnapshotDialog({ open, volumeId: snapshotDialog.volumeId })
        }
        volumeId={snapshotDialog.volumeId}
        onSuccess={async () => {
          await queryClient.invalidateQueries({
            queryKey: ["snapshots", "list"],
          });
        }}
      />
      <VolumeAttachmentsDialog
        open={attachmentsDialog.open}
        onOpenChange={(open) =>
          setAttachmentsDialog({ open, volumeId: attachmentsDialog.volumeId })
        }
        volumeId={attachmentsDialog.volumeId}
      />
      <ConfirmDeleteDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Delete Volume"
        description={
          <>
            Are you sure you want to delete this volume{" "}
            <span className="font-semibold text-foreground">
              {volumeToDelete?.Name}
            </span>
            ? This action cannot be undone.
          </>
        }
        confirmLabel="Delete Volume"
        cancelLabel="Cancel"
        confirming={deleteMutation.isPending}
        onConfirm={() =>
          volumeToDelete &&
          deleteMutation.mutate({ volume_id: volumeToDelete.ID })
        }
      />
      <div className="flex justify-center">
        <Button
          onClick={handleShowMore}
          variant="outline"
          disabled={!hasMore}
          className={`rounded-full transition-all duration-200 px-6 py-2 bg-background text-foreground border-border ${hasMore ? "hover:bg-accent hover:text-accent-foreground hover:scale-105" : "opacity-50 cursor-not-allowed"}`}
        >
          {hasMore
            ? `Show More (${Math.min(6, totalItems - visibleCount)} more)`
            : "All volumes loaded"}
        </Button>
      </div>
    </div>
  );
}
