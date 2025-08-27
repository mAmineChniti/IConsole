"use client";

import { ConfirmDeleteDialog } from "@/components/ConfirmDeleteDialog";
import { EmptyState } from "@/components/EmptyState";
import { ErrorCard } from "@/components/ErrorCard";
import { HeaderActions } from "@/components/HeaderActions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { XSearch } from "@/components/XSearch";
import { VolumeService } from "@/lib/requests";
import { cn } from "@/lib/utils";
import type {
  VolumeSnapshotDetails,
  VolumeSnapshotListResponse,
} from "@/types/ResponseInterfaces";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  AlertTriangle,
  Box,
  CheckCircle2,
  ChevronDown,
  Clock,
  HardDrive,
  Loader2,
  Pencil,
  RotateCcw,
  Save,
  Trash2,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export function Snapshots() {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [visibleCount, setVisibleCount] = useState(6);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [updateDialogOpen, setUpdateDialogOpen] = useState(false);
  const [restoreDialogOpen, setRestoreDialogOpen] = useState(false);
  const [selectedSnapshotId, setSelectedSnapshotId] = useState<
    string | undefined
  >(undefined);
  const [snapshotToDelete, setSnapshotToDelete] = useState<
    { id: string; name?: string } | undefined
  >(undefined);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  useEffect(() => {
    if (!deleteDialogOpen) {
      setSnapshotToDelete(undefined);
    }
  }, [deleteDialogOpen]);
  useEffect(() => {
    setVisibleCount(6);
  }, [searchTerm]);
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
      await queryClient.invalidateQueries({ queryKey: ["snapshots", "list"] });
    },
    onError: (err: unknown) => {
      const message =
        err instanceof Error ? err.message : "An unexpected error occurred";
      setRestoreError(message);
      toast.error(message);
    },
  });

  const handleCardClick = async (id: string) => {
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
  };

  const handleEditClick = async (id: string) => {
    setSelectedSnapshotId(id);
    setUpdateDialogOpen(true);
    setUpdateLoading(true);
    setUpdateError(undefined);
    try {
      const details = await VolumeService.getSnapshotDetails(id);
      setUpdateName(details.Name);
      setUpdateDescription(details.Description);
    } catch (err) {
      setUpdateError(
        err instanceof Error ? err.message : "Failed to load snapshot details",
      );
    } finally {
      setUpdateLoading(false);
    }
  };

  const handleRestoreClick = (id: string) => {
    setSelectedSnapshotId(id);
    setRestoreDialogOpen(true);
    setRestoreName("");
    setRestoreError(undefined);
  };

  const filteredSnapshots = (snapshots ?? []).filter((s) => {
    const q = searchTerm.toLowerCase();
    return (
      (s.Name || "").toLowerCase().includes(q) ||
      (s.ID || "").toLowerCase().includes(q) ||
      (s["Volume Name"] || "").toLowerCase().includes(q)
    );
  });
  const totalItems = filteredSnapshots.length;
  const visibleData = filteredSnapshots.slice(0, visibleCount);
  const hasMore = visibleCount < totalItems;
  const remaining = Math.max(0, totalItems - visibleCount);

  const renderStatusBadge = (status: string | undefined) => {
    const s = (status ?? "unknown").toLowerCase();
    let Icon = HardDrive;
    let classes = "bg-muted text-foreground border-muted/60";
    if (["available", "ready", "success"].includes(s)) {
      Icon = CheckCircle2;
      classes =
        "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300";
    } else if (
      ["creating", "in-progress", "processing", "pending"].includes(s)
    ) {
      Icon = Clock;
      classes =
        "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300";
    } else if (["error", "failed", "deleting"].includes(s)) {
      Icon = AlertTriangle;
      classes = "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300";
    }
    return (
      <Badge
        variant="outline"
        className={cn(
          "inline-flex items-center gap-1.5 px-3 py-1.5 text-[11px] sm:text-sm",
          classes,
        )}
      >
        <Icon className="w-4 h-4" />
        <span className="capitalize">{status ?? "unknown"}</span>
      </Badge>
    );
  };

  const handleShowMore = () => {
    setVisibleCount((prev) => prev + 6);
  };

  if (isLoading) {
    return (
      <div className="px-2 space-y-6 sm:px-0">
        <div className="flex flex-col gap-2 sm:flex-row sm:gap-0 sm:justify-between sm:items-center">
          <Skeleton className="w-40 h-4" />
        </div>
        <div className="flex flex-col gap-4 items-stretch sm:flex-row sm:items-center">
          <Skeleton className="w-full max-w-md h-10 rounded-full" />
          <Skeleton className="w-full h-10 rounded-full sm:w-auto min-w-[140px]" />
        </div>
        <div className="overflow-x-auto w-full">
          <Table className="w-full">
            <TableHeader>
              <TableRow>
                <TableHead className="py-3">Name</TableHead>
                <TableHead className="py-3">Status</TableHead>
                <TableHead className="py-3">Size</TableHead>
                <TableHead className="py-3">Volume</TableHead>
                <TableHead className="py-3">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {Array.from({ length: 6 }).map((_, idx) => (
                <TableRow key={idx}>
                  <TableCell className="py-3">
                    <Skeleton className="w-40 h-4" />
                  </TableCell>
                  <TableCell className="py-3">
                    <Skeleton className="w-16 h-4" />
                  </TableCell>
                  <TableCell className="py-3">
                    <Skeleton className="w-12 h-4" />
                  </TableCell>
                  <TableCell className="py-3">
                    <Skeleton className="w-32 h-4" />
                  </TableCell>
                  <TableCell className="py-3">
                    <Skeleton className="w-24 h-8" />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
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
        title="Failed to load snapshots"
        message="An error occurred while fetching snapshots."
        onRetry={() => refetch()}
      />
    );
  }

  if (!snapshots || snapshots.length === 0) {
    return (
      <EmptyState
        title="No snapshots found"
        text="Snapshots you create will appear here."
        onRefresh={() => refetch()}
        refreshing={isFetching}
        icon={<HardDrive className="w-7 h-7 text-muted-foreground" />}
        variant="dashed"
      />
    );
  }

  return (
    <div className="px-2 space-y-6 sm:px-0">
      <div className="flex flex-col gap-2 sm:flex-row sm:gap-0 sm:justify-between sm:items-center">
        <div className="text-sm leading-relaxed text-muted-foreground">
          {totalItems} snapshot{totalItems !== 1 ? "s" : ""} total
          {totalItems > 0 && (
            <>
              {" • "}
              Showing {Math.min(visibleCount, totalItems)} of {totalItems}
            </>
          )}
        </div>
        <div className="ml-auto">
          <HeaderActions
            onRefresh={() => refetch()}
            isRefreshing={isFetching}
            refreshTooltip="Refresh snapshots"
          />
        </div>
      </div>

      <div className="flex flex-col gap-4 items-stretch sm:flex-row sm:items-center">
        <div className="flex-1 max-w-full sm:max-w-md">
          <XSearch
            value={searchTerm}
            onChange={setSearchTerm}
            placeholder="Search snapshots..."
            aria-label="Search snapshots"
          />
        </div>
      </div>

      {totalItems === 0 ? (
        <div className="p-8 text-center rounded-2xl border text-muted-foreground">
          No snapshots match your search.
        </div>
      ) : (
        <>
          <div className="overflow-x-auto w-full">
            <Table className="w-full">
              <TableHeader>
                <TableRow>
                  <TableHead className="py-3">Name</TableHead>
                  <TableHead className="py-3">Status</TableHead>
                  <TableHead className="py-3">Size</TableHead>
                  <TableHead className="py-3">Volume</TableHead>
                  <TableHead className="py-3 text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {visibleData.map((s) => (
                  <TableRow key={s.ID}>
                    <TableCell className="py-3">
                      <div className="flex gap-2 items-center">
                        <div className="min-w-0">
                          <button
                            type="button"
                            className="inline-flex items-center max-w-full font-medium text-left underline cursor-pointer underline-offset-2 decoration-muted-foreground/50 truncate hover:decoration-current"
                            onClick={() => handleCardClick(s.ID)}
                            title={s.Name || s.ID}
                          >
                            <span className="truncate">{s.Name || s.ID}</span>
                          </button>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="py-3">
                      {renderStatusBadge(s.Status)}
                    </TableCell>
                    <TableCell className="py-3">{s.Size} GB</TableCell>
                    <TableCell className="py-3">{s["Volume Name"]}</TableCell>
                    <TableCell className="py-3 text-right">
                      <div className="flex gap-2 justify-end">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="outline"
                              size="icon"
                              className="rounded-full cursor-pointer"
                              onClick={() => handleEditClick(s.ID)}
                              aria-label={`Edit ${s.Name || s.ID}`}
                            >
                              <Pencil className="w-4 h-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Edit</TooltipContent>
                        </Tooltip>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="outline"
                              size="icon"
                              className="rounded-full cursor-pointer"
                              onClick={() => handleRestoreClick(s.ID)}
                              aria-label={`Restore ${s.Name || s.ID}`}
                            >
                              <RotateCcw className="w-4 h-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Restore</TooltipContent>
                        </Tooltip>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="destructive"
                              size="icon"
                              className="text-white rounded-full cursor-pointer"
                              aria-label={`Delete ${s.Name || s.ID}`}
                              disabled={
                                deleteMutation.isPending &&
                                snapshotToDelete?.id === s.ID
                              }
                              onClick={() => {
                                setSnapshotToDelete({
                                  id: s.ID,
                                  name: s.Name || undefined,
                                });
                                setDeleteDialogOpen(true);
                              }}
                            >
                              {deleteMutation.isPending &&
                              snapshotToDelete?.id === s.ID ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              ) : (
                                <Trash2 className="w-4 h-4" />
                              )}
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            {deleteMutation.isPending &&
                            snapshotToDelete?.id === s.ID
                              ? "Deleting..."
                              : "Delete"}
                          </TooltipContent>
                        </Tooltip>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          <div className="flex justify-center">
            <Button
              variant="outline"
              disabled={!hasMore}
              onClick={handleShowMore}
              className="py-2 px-4 w-full max-w-xs rounded-full border transition-all duration-200 cursor-pointer sm:px-6 sm:w-auto bg-background text-foreground border-border/50"
            >
              <span className="truncate">
                {hasMore
                  ? `Show More (${Math.min(6, remaining)} more)`
                  : "All snapshots loaded"}
              </span>
              {hasMore && <ChevronDown className="ml-2 w-4 h-4" />}
            </Button>
          </div>
        </>
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
        <DialogContent className="sm:max-w-3xl">
          <DialogHeader>
            <div className="flex gap-4 items-start">
              <div className="flex-1">
                <DialogTitle className="text-lg sm:text-xl">
                  {snapshotDetails?.Name ?? "Snapshot details"}
                </DialogTitle>
                <div className="flex flex-wrap gap-2 items-center mt-2 text-sm">
                  <Badge variant="secondary" className="py-0 px-2 text-xs">
                    {snapshotDetails?.Status ?? "unknown"}
                  </Badge>
                </div>
              </div>
            </div>
          </DialogHeader>

          <div className="pt-1">
            {detailsLoading ? (
              <div className="space-y-3">
                <Skeleton className="w-44 h-4" />
                <Skeleton className="w-64 h-4" />
                <Skeleton className="w-56 h-4" />
              </div>
            ) : detailsError ? (
              <div className="py-6 text-center text-destructive">
                {detailsError}
              </div>
            ) : snapshotDetails ? (
              <div className="space-y-6 text-base">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <Card className="rounded-lg shadow-none border-muted/60">
                    <CardContent className="p-5">
                      <div className="text-sm text-muted-foreground">Size</div>
                      <div className="flex items-center mt-1 font-medium">
                        <Box className="mr-2 w-5 h-5" />
                        {snapshotDetails?.Size != undefined
                          ? `${snapshotDetails.Size} GB`
                          : "-"}
                      </div>
                    </CardContent>
                  </Card>
                  <Card className="rounded-lg shadow-none border-muted/60">
                    <CardContent className="p-5">
                      <div className="text-sm text-muted-foreground">
                        Volume
                      </div>
                      <div className="flex items-center mt-1 font-medium">
                        <HardDrive className="mr-2 w-5 h-5" />
                        {snapshotDetails?.["Volume Name"] ?? "-"}
                      </div>
                    </CardContent>
                  </Card>
                  <Card className="rounded-lg shadow-none border-muted/60">
                    <CardContent className="p-5">
                      <div className="flex gap-2 items-center text-sm text-muted-foreground">
                        <HardDrive className="w-5 h-5" /> Status
                      </div>
                      <div className="mt-2 font-medium">
                        {snapshotDetails?.Status ?? "-"}
                      </div>
                    </CardContent>
                  </Card>
                  <Card className="rounded-lg shadow-none border-muted/60">
                    <CardContent className="p-5">
                      <div className="text-sm text-muted-foreground">
                        Created
                      </div>
                      <div className="mt-2 font-medium">
                        {snapshotDetails?.Created ?? "-"}
                      </div>
                    </CardContent>
                  </Card>
                </div>
                <Card className="rounded-lg shadow-none border-muted/60">
                  <CardContent className="p-5">
                    <div className="text-sm text-muted-foreground">
                      Description
                    </div>
                    <div className="mt-2 font-medium whitespace-pre-line break-words">
                      {snapshotDetails?.Description ?? (
                        <span className="italic text-muted-foreground">
                          No description
                        </span>
                      )}
                    </div>
                  </CardContent>
                </Card>
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
            <DialogTitle>Edit Snapshot</DialogTitle>
          </DialogHeader>
          <div className="py-2 space-y-4">
            <div>
              <Label
                htmlFor="update-name"
                className="mb-1 text-xs font-medium text-muted-foreground"
              >
                Name
              </Label>
              <Input
                id="update-name"
                className="py-2 px-3 !h-10 w-full rounded-full border bg-background text-foreground"
                value={updateName}
                onChange={(e) => setUpdateName(e.target.value)}
                disabled={updateLoading || updateMutation.isPending}
              />
            </div>
            <div>
              <Label
                htmlFor="update-description"
                className="mb-1 text-xs font-medium text-muted-foreground"
              >
                Description
              </Label>
              <Textarea
                id="update-description"
                className="py-2 px-3 w-full rounded-md border resize-none bg-background text-foreground"
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
              className="order-2 py-2 px-6 w-full rounded-full cursor-pointer sm:order-1 sm:w-auto bg-muted text-foreground"
            >
              <X className="mr-1.5 w-4 h-4" />
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
              className="flex order-1 justify-center items-center py-2 px-6 w-full rounded-full cursor-pointer sm:order-2 sm:w-auto text-background bg-primary"
            >
              <Save className="mr-1.5 w-4 h-4" />
              {updateMutation.isPending ? "Saving..." : "Save Changes"}
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
            <DialogTitle>Restore Snapshot</DialogTitle>
          </DialogHeader>
          <div className="py-2 space-y-4">
            <div>
              <Label
                htmlFor="restore-name"
                className="mb-1 text-xs font-medium text-muted-foreground"
              >
                New Volume Name
              </Label>
              <Input
                id="restore-name"
                className="py-2 px-3 w-full rounded-full border bg-background text-foreground"
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
              className="order-2 py-2 px-6 w-full rounded-full cursor-pointer sm:order-1 sm:w-auto bg-muted text-foreground"
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
              className="flex order-1 justify-center items-center py-2 px-6 w-full rounded-full cursor-pointer sm:order-2 sm:w-auto text-background bg-primary"
            >
              <RotateCcw className="mr-1.5 w-4 h-4" />
              {restoreMutation.isPending ? "Restoring..." : "Restore"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmDeleteDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Delete Snapshot"
        description={
          <>
            Are you sure you want to delete this snapshot{" "}
            <span className="font-semibold text-foreground">
              {snapshotToDelete?.name}
            </span>
            ? This action cannot be undone.
          </>
        }
        confirmLabel="Delete"
        cancelLabel="Cancel"
        confirming={deleteMutation.isPending}
        onConfirm={() =>
          snapshotToDelete && deleteMutation.mutate(snapshotToDelete.id)
        }
      />
    </div>
  );
}
