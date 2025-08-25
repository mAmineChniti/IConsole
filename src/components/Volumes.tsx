"use client";

import { ErrorCard } from "@/components/ErrorCard";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import { VolumeAttachmentsDialog } from "@/components/VolumeAttachmentsDialog";
import { VolumeChangeTypeDialog } from "@/components/VolumeChangeTypeDialog";
import { VolumeCreateForm } from "@/components/VolumeCreateForm";
import { VolumeDetailsDialog } from "@/components/VolumeDetailsDialog";
import { VolumeExtendDialog } from "@/components/VolumeExtendDialog";
import { VolumeUploadToImageDialog } from "@/components/VolumeUploadToImageDialog";
import { VolumeService } from "@/lib/requests";
import { cn } from "@/lib/utils";
import type { VolumeDeleteRequest } from "@/types/RequestInterfaces";
import type { VolumeDetails } from "@/types/ResponseInterfaces";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Eye,
  HardDrive,
  Loader2,
  Plus,
  RefreshCw,
  Server,
  Trash2,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Badge } from "./ui/badge";

export function Volumes() {
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [selectedVolumeId, setSelectedVolumeId] = useState<string | undefined>(
    undefined,
  );
  const [visibleCount, setVisibleCount] = useState(6);
  const [showCreate, setShowCreate] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [volumeToDelete, setVolumeToDelete] = useState<
    VolumeDetails | undefined
  >(undefined);

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
  const queryClient = useQueryClient();

  const deleteMutation = useMutation({
    mutationFn: async (volumeToDelete: VolumeDeleteRequest) =>
      VolumeService.delete(volumeToDelete),
    onSuccess: async () => {
      toast.success("Volume deleted successfully");
      setShowDeleteDialog(false);
      setVolumeToDelete(undefined);
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
  const totalItems = volumes.length;
  const visibleData = volumes.slice(0, visibleCount);
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
                    <div className="mt-2 text-xs text-muted-foreground">
                      <Skeleton className="w-24 h-3" />
                    </div>
                  </div>
                </div>
                <div className="flex flex-col gap-2 mt-4">
                  <div className="flex flex-row flex-wrap gap-2 justify-end w-full">
                    {Array.from({ length: 6 }).map((_, btnIdx) => (
                      <Skeleton
                        key={btnIdx}
                        className="w-20 h-8 rounded-full"
                      />
                    ))}
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
        <Card className="rounded-xl border shadow-lg bg-card text-card-foreground border-border">
          <CardContent className="p-8 text-center">
            <div className="flex flex-col items-center space-y-4">
              <div className="p-3 rounded-full bg-muted">
                <HardDrive className="w-8 h-8 text-muted-foreground" />
              </div>
              <div className="space-y-2">
                <h3 className="text-lg font-semibold text-foreground">
                  No Volumes Found
                </h3>
                <p className="max-w-md text-sm text-muted-foreground">
                  You don&apos;t have any volumes yet. Create your first volume
                  to get started.
                </p>
              </div>
              <Button
                onClick={() => setShowCreate(true)}
                variant="default"
                className="gap-2 rounded-full"
              >
                <Plus className="w-4 h-4" /> Create Volume
              </Button>
              <Button
                onClick={() => refetch()}
                disabled={isFetching}
                variant="outline"
                className="mt-2 rounded-full transition-all duration-200 group bg-background text-foreground border-border hover:bg-accent hover:text-accent-foreground"
              >
                {isFetching ? (
                  <>
                    <RefreshCw className="mr-2 w-4 h-4 animate-spin group-hover:text-accent-foreground" />
                    <span className="group-hover:text-accent-foreground">
                      Refreshing...
                    </span>
                  </>
                ) : (
                  <>
                    <RefreshCw className="mr-2 w-4 h-4 group-hover:text-accent-foreground" />
                    <span className="group-hover:text-accent-foreground">
                      Refresh
                    </span>
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
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
        <div className="flex gap-3 justify-end items-center w-full sm:w-auto">
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            disabled={isFetching}
            className="p-0 w-9 h-9 rounded-full border transition-all duration-200 cursor-pointer bg-card text-card-foreground border-border/50"
          >
            <RefreshCw
              className={isFetching ? "h-4 w-4 animate-spin" : "h-4 w-4"}
            />
          </Button>
          <Button
            size="sm"
            onClick={() => setShowCreate(true)}
            className="gap-2 px-4 font-semibold rounded-full shadow-md transition-all duration-300 cursor-pointer bg-primary text-primary-foreground"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Create Volume</span>
            <span className="sm:hidden">New</span>
          </Button>
        </div>
      </div>

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
                  <DropdownMenu>
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
                            currentSize: Number.parseInt(volume.Size, 10),
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
                          setShowDeleteDialog(true);
                        }}
                      >
                        <Trash2 className="w-4 h-4" /> Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

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
        <VolumeAttachmentsDialog
          open={attachmentsDialog.open}
          onOpenChange={(open) =>
            setAttachmentsDialog({ open, volumeId: attachmentsDialog.volumeId })
          }
          volumeId={attachmentsDialog.volumeId}
        />

        <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
          <DialogContent className="overflow-y-auto mx-4 max-w-lg rounded-xl border shadow-lg sm:mx-auto bg-card text-card-foreground border-border/50 max-h-[90vh]">
            <DialogHeader>
              <DialogTitle className="flex gap-2 items-center text-lg text-foreground">
                <Trash2 className="flex-shrink-0 w-5 h-5 text-foreground" />
                <span className="truncate">Delete Volume</span>
              </DialogTitle>
              <DialogDescription className="text-sm leading-relaxed text-muted-foreground">
                Are you sure you want to delete this volume? This action cannot
                be undone.
              </DialogDescription>
            </DialogHeader>
            {volumeToDelete && (
              <div className="py-4">
                <div className="p-3 rounded-xl border sm:p-4 bg-destructive/10 border-destructive">
                  <div className="flex gap-3 items-start">
                    <div className="flex-shrink-0 p-2 rounded-full bg-destructive/20">
                      <HardDrive className="w-4 h-4 text-destructive" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-destructive truncate">
                        {volumeToDelete.Name}
                      </h4>
                      {volumeToDelete.Description && (
                        <p className="mt-1 text-sm text-destructive line-clamp-2">
                          {volumeToDelete.Description}
                        </p>
                      )}
                      <p className="py-1 px-2 mt-2 font-mono text-xs rounded text-destructive w-fit truncate bg-destructive/10">
                        ID: {volumeToDelete.ID}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
            <DialogFooter className="flex-col gap-3 pt-4 sm:flex-row">
              <Button
                variant="outline"
                onClick={() => {
                  setShowDeleteDialog(false);
                  setVolumeToDelete(undefined);
                }}
                className="order-2 py-2 px-6 w-full rounded-full cursor-pointer sm:order-1 sm:w-auto bg-muted text-foreground"
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={() =>
                  volumeToDelete &&
                  deleteMutation.mutate({ volume_id: volumeToDelete.ID })
                }
                disabled={deleteMutation.isPending}
                className="order-1 py-2 px-6 w-full text-white rounded-full cursor-pointer sm:order-2 sm:w-auto bg-destructive"
              >
                {deleteMutation.isPending ? (
                  <>
                    <div className="mr-2 w-4 h-4 rounded-full border-2 animate-spin border-destructive-foreground border-t-transparent" />
                    <span className="truncate">Deleting...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="mr-2 w-4 h-4" />
                    <span className="truncate">Delete Volume</span>
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

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
