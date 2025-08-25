"use client";

import { ErrorCard } from "@/components/ErrorCard";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { VolumeService } from "@/lib/requests";
import type {
  VolumeSnapshotDetails,
  VolumeSnapshotListResponse,
} from "@/types/ResponseInterfaces";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Camera, Edit, Info, RefreshCw, RotateCcw, Trash2 } from "lucide-react";
import { useCallback, useState } from "react";
import { toast } from "sonner";

export function Snapshots() {
  const queryClient = useQueryClient();
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [updateDialogOpen, setUpdateDialogOpen] = useState(false);
  const [restoreDialogOpen, setRestoreDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedSnapshotId, setSelectedSnapshotId] = useState<
    string | undefined
  >(undefined);
  const [snapshotToDelete, setSnapshotToDelete] = useState<string | undefined>(
    undefined,
  );
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [detailsError, setDetailsError] = useState<string | undefined>(
    undefined,
  );
  const [snapshotDetails, setSnapshotDetails] = useState<
    VolumeSnapshotDetails | undefined
  >(undefined);
  const [updateName, setUpdateName] = useState("");
  const [updateDescription, setUpdateDescription] = useState("");
  const [updateLoading, setUpdateLoading] = useState(false);
  const [updateError, setUpdateError] = useState<string | undefined>(undefined);
  const [restoreName, setRestoreName] = useState("");
  const [restoreError, setRestoreError] = useState<string | undefined>(
    undefined,
  );

  const {
    data: snapshots,
    isLoading,
    isFetching,
    error,
    refetch,
  } = useQuery<VolumeSnapshotListResponse>({
    queryKey: ["snapshots", "list"],
    queryFn: () => VolumeService.listSnapshots(),
    refetchInterval: 30000,
    staleTime: 15000,
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) =>
      VolumeService.deleteSnapshot({ snapshot_id: id }),
    onSuccess: async () => {
      toast.success("Snapshot deleted successfully");
      setDeleteDialogOpen(false);
      setSnapshotToDelete(undefined);
      await queryClient.invalidateQueries({ queryKey: ["snapshots", "list"] });
    },
    onError: (err: unknown) => {
      const message =
        err instanceof Error ? err.message : "An unexpected error occurred";
      toast.error(message);
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({
      id,
      name,
      description,
    }: {
      id: string;
      name: string;
      description: string;
    }) => VolumeService.updateSnapshot({ name, description }, id),
    onSuccess: async () => {
      toast.success("Snapshot updated successfully");
      setUpdateDialogOpen(false);
      setSelectedSnapshotId(undefined);
      await queryClient.invalidateQueries({ queryKey: ["snapshots", "list"] });
    },
    onError: (err: unknown) => {
      const message =
        err instanceof Error ? err.message : "An unexpected error occurred";
      setUpdateError(message);
      toast.error(message);
    },
  });

  const restoreMutation = useMutation({
    mutationFn: async ({ id, name }: { id: string; name: string }) =>
      VolumeService.createVolumeFromSnapshot({ snapshot_id: id, name }),
    onSuccess: async () => {
      toast.success("Volume restore started");
      setRestoreDialogOpen(false);
      setSelectedSnapshotId(undefined);
    },
    onError: (err: unknown) => {
      const message =
        err instanceof Error ? err.message : "An unexpected error occurred";
      setRestoreError(message);
      toast.error(message);
    },
  });

  const handleCardClick = useCallback(async (id: string) => {
    setSelectedSnapshotId(id);
    setDetailsDialogOpen(true);
    setDetailsLoading(true);
    setDetailsError(undefined);
    try {
      const details = await VolumeService.getSnapshotDetails(id);
      setSnapshotDetails(details);
    } catch (err) {
      setDetailsError(
        err instanceof Error ? err.message : "Failed to load snapshot details",
      );
      setSnapshotDetails(undefined);
    } finally {
      setDetailsLoading(false);
    }
  }, []);

  const handleEditClick = useCallback(async (id: string) => {
    setSelectedSnapshotId(id);
    setUpdateDialogOpen(true);
    setUpdateLoading(true);
    setUpdateError(undefined);
    try {
      const details = await VolumeService.getSnapshotDetails(id);
      setUpdateName(details.name);
      setUpdateDescription(details.description);
    } catch (err) {
      setUpdateError(
        err instanceof Error ? err.message : "Failed to load snapshot details",
      );
    } finally {
      setUpdateLoading(false);
    }
  }, []);

  const handleRestoreClick = useCallback((id: string) => {
    setSelectedSnapshotId(id);
    setRestoreDialogOpen(true);
    setRestoreName("");
    setRestoreError(undefined);
  }, []);

  if (isLoading) {
    return (
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <Card
            key={i}
            className="flex overflow-hidden flex-col rounded-xl border shadow-lg bg-card border-border/50"
          >
            <CardHeader className="flex items-center pb-4 min-h-[80px]">
              <div className="flex flex-1 gap-4 items-center min-w-0">
                <div className="flex justify-center items-center w-12 h-12 rounded-full ring-1 bg-muted ring-border/50">
                  <Skeleton className="w-6 h-6 rounded-md" />
                </div>
                <div className="flex-1 min-w-0">
                  <Skeleton className="w-32 h-6" />
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-0 space-y-4">
              <Skeleton className="w-24 h-4" />
              <Skeleton className="w-32 h-4" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <ErrorCard
        title="Failed to load snapshots"
        message="An error occurred while fetching snapshots."
        onRetry={() => refetch()}
      />
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-2 mb-4 sm:flex-row sm:gap-0 sm:justify-between sm:items-center">
        <div className="text-sm leading-relaxed text-muted-foreground">
          {snapshots?.length ?? 0} snapshot
          {snapshots && snapshots.length !== 1 ? "s" : ""} total
        </div>
        <div className="flex gap-3">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                onClick={() => refetch()}
                disabled={isFetching}
                className="p-0 w-9 h-9 rounded-full border bg-card text-card-foreground border-border/50"
              >
                <RefreshCw
                  className={isFetching ? "h-4 w-4 animate-spin" : "h-4 w-4"}
                />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Refresh snapshots list</TooltipContent>
          </Tooltip>
        </div>
      </div>
      {!snapshots || snapshots.length === 0 ? (
        <Card className="bg-gradient-to-br border-2 border-dashed border-muted-foreground/20 from-muted/30 to-muted/10">
          <CardContent className="flex flex-col justify-center items-center py-16 text-center">
            <div className="mb-6">
              <div className="flex justify-center items-center w-16 h-16 bg-gradient-to-br rounded-2xl ring-1 from-primary/10 to-primary/5 ring-primary/10">
                <Camera className="w-8 h-8 text-primary" />
              </div>
            </div>
            <h3 className="mb-2 text-xl font-bold text-foreground">
              No snapshots found
            </h3>
            <p className="mb-8 max-w-md leading-relaxed text-muted-foreground">
              No volume snapshots have been created yet.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {snapshots.map((snap) => (
            <Card
              key={snap.id}
              className="flex overflow-hidden relative flex-col rounded-xl border shadow-lg cursor-pointer bg-card border-border/50 group"
              tabIndex={0}
              role="button"
              aria-label={`View details for snapshot ${snap.name}`}
              onClick={() => void handleCardClick(snap.id)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  void handleCardClick(snap.id);
                }
              }}
            >
              <CardHeader className="flex items-center pb-4 min-h-[80px]">
                <div className="flex flex-1 gap-4 items-center min-w-0">
                  <div className="flex justify-center items-center w-12 h-12 rounded-full ring-1 bg-muted ring-border/50">
                    <Camera className="w-6 h-6 text-muted-foreground" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <CardTitle className="text-lg font-bold truncate">
                      {snap.name}
                    </CardTitle>
                    <div className="text-xs text-muted-foreground truncate">
                      {snap.description}
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0 space-y-2">
                <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                  <span>
                    Status:{" "}
                    <span className="font-semibold text-foreground">
                      {snap.status}
                    </span>
                  </span>
                  <span>
                    Size:{" "}
                    <span className="font-semibold text-foreground">
                      {snap.size} GB
                    </span>
                  </span>
                  {snap.volume_name && (
                    <span>
                      Volume:{" "}
                      <span className="font-semibold text-foreground">
                        {snap.volume_name}
                      </span>
                    </span>
                  )}
                </div>
                <div className="flex z-10 gap-1 mt-4">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="rounded-full"
                        tabIndex={-1}
                        onClick={(e) => {
                          e.stopPropagation();
                          void handleCardClick(snap.id);
                        }}
                        aria-label={`Snapshot details for ${snap.name}`}
                      >
                        <Info className="w-4 h-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Snapshot details</TooltipContent>
                  </Tooltip>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="rounded-full"
                        tabIndex={-1}
                        onClick={(e) => {
                          e.stopPropagation();
                          void handleEditClick(snap.id);
                        }}
                        aria-label={`Edit snapshot ${snap.name}`}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Edit snapshot</TooltipContent>
                  </Tooltip>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="rounded-full"
                        tabIndex={-1}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRestoreClick(snap.id);
                        }}
                        aria-label={`Restore snapshot ${snap.name}`}
                      >
                        <RotateCcw className="w-4 h-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Restore snapshot</TooltipContent>
                  </Tooltip>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="rounded-full"
                        tabIndex={-1}
                        onClick={(e) => {
                          e.stopPropagation();
                          setSnapshotToDelete(snap.id);
                          setDeleteDialogOpen(true);
                        }}
                        aria-label={`Delete snapshot ${snap.name}`}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Delete snapshot</TooltipContent>
                  </Tooltip>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
      <Dialog
        open={detailsDialogOpen}
        onOpenChange={(open) => {
          setDetailsDialogOpen(open);
          if (!open) {
            setSelectedSnapshotId(undefined);
            setSnapshotDetails(undefined);
            setDetailsError(undefined);
          }
        }}
      >
        <DialogContent className="overflow-hidden p-0 max-w-lg">
          <div className="flex flex-col gap-3 items-center p-6 bg-gradient-to-br rounded-t-lg border-b from-primary/5 to-background/80 border-border">
            <div className="flex justify-center items-center mb-2 w-16 h-16 rounded-full ring-2 bg-muted ring-primary/30">
              <Camera className="w-8 h-8 text-primary" />
            </div>
            <div className="flex gap-2 items-center text-2xl font-bold text-center text-foreground">
              {snapshotDetails?.name ?? (
                <span className="text-muted-foreground">Snapshot</span>
              )}
            </div>
            <div className="py-1 px-3 font-mono text-xs rounded-full text-muted-foreground bg-muted/60 w-fit">
              {snapshotDetails?.id}
            </div>
          </div>
          <div className="p-6">
            {detailsLoading ? (
              <div className="py-8 text-center text-muted-foreground">
                <RefreshCw className="mx-auto mb-2 w-6 h-6 animate-spin text-primary" />
                Loading snapshot details...
              </div>
            ) : detailsError ? (
              <div className="py-8 text-center text-destructive">
                <Trash2 className="mx-auto mb-2 w-6 h-6 text-destructive" />
                {detailsError}
              </div>
            ) : snapshotDetails ? (
              <div className="space-y-6">
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                  <div className="flex gap-3 items-center">
                    <Camera className="w-5 h-5 text-muted-foreground" />
                    <div>
                      <div className="mb-1 text-xs font-medium text-muted-foreground">
                        Volume
                      </div>
                      <div className="text-sm font-medium break-all">
                        {snapshotDetails?.volume_name ?? (
                          <span className="italic text-muted-foreground">
                            -
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-3 items-center">
                    <Edit className="w-5 h-5 text-muted-foreground" />
                    <div>
                      <div className="mb-1 text-xs font-medium text-muted-foreground">
                        Status
                      </div>
                      <div className="text-sm font-medium">
                        {snapshotDetails?.status}
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-3 items-center">
                    <RotateCcw className="w-5 h-5 text-muted-foreground" />
                    <div>
                      <div className="mb-1 text-xs font-medium text-muted-foreground">
                        Size
                      </div>
                      <div className="text-sm font-medium">
                        {snapshotDetails?.size} GB
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-3 items-center">
                    <Info className="w-5 h-5 text-muted-foreground" />
                    <div>
                      <div className="mb-1 text-xs font-medium text-muted-foreground">
                        Created
                      </div>
                      <div className="text-sm font-medium">
                        {snapshotDetails?.created}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="mt-4">
                  <div className="mb-1 text-xs font-medium text-muted-foreground">
                    Description
                  </div>
                  <div className="text-sm font-medium whitespace-pre-line break-words">
                    {snapshotDetails?.description ?? (
                      <span className="italic text-muted-foreground">
                        No description
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ) : undefined}
          </div>
        </DialogContent>
      </Dialog>

      <Dialog
        open={updateDialogOpen}
        onOpenChange={(open) => {
          setUpdateDialogOpen(open);
          setUpdateError(undefined);
          if (!open) {
            setSelectedSnapshotId(undefined);
          }
        }}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex gap-2 items-center text-foreground">
              <Edit className="w-5 h-5" />
              Edit Snapshot
            </DialogTitle>
          </DialogHeader>
          <div className="py-2 space-y-4">
            <div>
              <label className="block mb-1 text-xs font-medium text-muted-foreground">
                Name
              </label>
              <input
                className="py-2 px-3 w-full rounded-md border bg-background text-foreground"
                value={updateName}
                onChange={(e) => setUpdateName(e.target.value)}
                disabled={updateLoading || updateMutation.isPending}
              />
            </div>
            <div>
              <label className="block mb-1 text-xs font-medium text-muted-foreground">
                Description
              </label>
              <textarea
                className="py-2 px-3 w-full rounded-md border bg-background text-foreground"
                value={updateDescription}
                onChange={(e) => setUpdateDescription(e.target.value)}
                disabled={updateLoading || updateMutation.isPending}
                rows={3}
              />
            </div>
            {updateError && (
              <div className="text-xs text-destructive">{updateError}</div>
            )}
          </div>
          <DialogFooter className="flex-col gap-3 pt-4 sm:flex-row">
            <Button
              variant="outline"
              onClick={() => setUpdateDialogOpen(false)}
              disabled={updateMutation.isPending}
              className="order-2 py-2 px-6 w-full rounded-full sm:order-1 sm:w-auto bg-muted text-foreground"
            >
              Cancel
            </Button>
            <Button
              variant="default"
              onClick={() =>
                selectedSnapshotId &&
                updateMutation.mutate({
                  id: selectedSnapshotId,
                  name: updateName,
                  description: updateDescription,
                })
              }
              disabled={updateMutation.isPending || !updateName}
              className="flex order-1 justify-center items-center py-2 px-6 w-full text-white rounded-full sm:order-2 sm:w-auto bg-primary"
            >
              {updateMutation.isPending ? (
                <>
                  <Edit className="mr-2 w-4 h-4" />
                  Saving...
                </>
              ) : (
                <>
                  <Edit className="mr-2 w-4 h-4" />
                  Save Changes
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={restoreDialogOpen}
        onOpenChange={(open) => {
          setRestoreDialogOpen(open);
          setRestoreError(undefined);
          if (!open) {
            setSelectedSnapshotId(undefined);
          }
        }}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex gap-2 items-center text-foreground">
              <RotateCcw className="w-5 h-5" />
              Restore Snapshot
            </DialogTitle>
          </DialogHeader>
          <div className="py-2 space-y-4">
            <div>
              <label className="block mb-1 text-xs font-medium text-muted-foreground">
                New Volume Name
              </label>
              <input
                className="py-2 px-3 w-full rounded-md border bg-background text-foreground"
                value={restoreName}
                onChange={(e) => setRestoreName(e.target.value)}
                disabled={restoreMutation.isPending}
              />
            </div>
            {restoreError && (
              <div className="text-xs text-destructive">{restoreError}</div>
            )}
          </div>
          <DialogFooter className="flex-col gap-3 pt-4 sm:flex-row">
            <Button
              variant="outline"
              onClick={() => setRestoreDialogOpen(false)}
              disabled={restoreMutation.isPending}
              className="order-2 py-2 px-6 w-full rounded-full sm:order-1 sm:w-auto bg-muted text-foreground"
            >
              Cancel
            </Button>
            <Button
              variant="default"
              onClick={() =>
                selectedSnapshotId &&
                restoreName &&
                restoreMutation.mutate({
                  id: selectedSnapshotId,
                  name: restoreName,
                })
              }
              disabled={restoreMutation.isPending || !restoreName}
              className="flex order-1 justify-center items-center py-2 px-6 w-full text-white rounded-full sm:order-2 sm:w-auto bg-primary"
            >
              {restoreMutation.isPending ? (
                <>
                  <RotateCcw className="mr-2 w-4 h-4" />
                  Restoring...
                </>
              ) : (
                <>
                  <RotateCcw className="mr-2 w-4 h-4" />
                  Restore
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex gap-2 items-center text-foreground">
              <Trash2 className="w-5 h-5" />
              Delete Snapshot
            </DialogTitle>
          </DialogHeader>
          <div className="py-4 text-center text-muted-foreground">
            Are you sure you want to delete this snapshot? This action cannot be
            undone.
          </div>
          <DialogFooter className="flex-col gap-3 pt-4 sm:flex-row">
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
              disabled={deleteMutation.isPending}
              className="order-2 py-2 px-6 w-full rounded-full sm:order-1 sm:w-auto bg-muted text-foreground"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() =>
                snapshotToDelete && deleteMutation.mutate(snapshotToDelete)
              }
              disabled={deleteMutation.isPending || !snapshotToDelete}
              className="flex order-1 justify-center items-center py-2 px-6 w-full text-white rounded-full sm:order-2 sm:w-auto bg-destructive"
            >
              {deleteMutation.isPending ? (
                <>
                  <Trash2 className="mr-2 w-4 h-4" />
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 className="mr-2 w-4 h-4" />
                  Delete Snapshot
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
