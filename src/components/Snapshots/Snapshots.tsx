"use client";

import { ConfirmDeleteDialog } from "@/components/reusable/ConfirmDeleteDialog";
import { EmptyState } from "@/components/reusable/EmptyState";
import { ErrorCard } from "@/components/reusable/ErrorCard";
import { HeaderActions } from "@/components/reusable/HeaderActions";
import { InfoDialog } from "@/components/reusable/InfoDialog";
import { StatusBadge } from "@/components/reusable/StatusBadge";
import { XSearch } from "@/components/reusable/XSearch";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
import { VolumeService } from "@/lib/requests";
import type {
  VolumeSnapshotDetails,
  VolumeSnapshotListResponse,
} from "@/types/ResponseInterfaces";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Calendar,
  ChevronDown,
  FileText,
  HardDrive,
  Loader2,
  Pencil,
  RotateCcw,
  Save,
  Server,
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
    setVisibleCount(6);
  }, [searchTerm]);
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

  const handleViewDetails = async (id: string) => {
    setSelectedSnapshotId(id);
    setDetailsDialogOpen(true);
  };
  const {
    data: snapshotDetails,
    isLoading: snapshotDetailsLoading,
    isFetching: snapshotDetailsFetching,
  } = useQuery<VolumeSnapshotDetails>({
    queryKey: ["snapshots", selectedSnapshotId],
    queryFn: () => VolumeService.getSnapshotDetails(selectedSnapshotId!),
    enabled: !!selectedSnapshotId,
    staleTime: 15000,
  });
  const handleEditClick = async (id: string) => {
    setSelectedSnapshotId(id);
    setUpdateDialogOpen(true);
    setUpdateLoading(true);
    setUpdateError(undefined);
    try {
      const details = await VolumeService.getSnapshotDetails(id);
      setUpdateName(details.Name ?? "");
      setUpdateDescription(details.Description ?? "");
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

  const handleShowMore = () => {
    setVisibleCount((prev) => prev + 6);
  };

  if (isLoading) {
    return (
      <div className="space-y-6 px-2 sm:px-0">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between sm:gap-0">
          <Skeleton className="h-4 w-40" />
        </div>
        <div className="flex flex-col items-stretch gap-4 sm:flex-row sm:items-center">
          <Skeleton className="h-10 w-full max-w-md rounded-full" />
          <Skeleton className="h-10 w-full min-w-[140px] rounded-full sm:w-auto" />
        </div>
        <div className="w-full overflow-x-auto">
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
                    <Skeleton className="h-4 w-40" />
                  </TableCell>
                  <TableCell className="py-3">
                    <Skeleton className="h-4 w-16" />
                  </TableCell>
                  <TableCell className="py-3">
                    <Skeleton className="h-4 w-12" />
                  </TableCell>
                  <TableCell className="py-3">
                    <Skeleton className="h-4 w-32" />
                  </TableCell>
                  <TableCell className="py-3">
                    <Skeleton className="h-8 w-24" />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        <div className="flex justify-center px-4 sm:px-0">
          <Skeleton className="h-9 w-40 rounded-full" />
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
        icon={<HardDrive className="text-muted-foreground h-7 w-7" />}
        variant="dashed"
      />
    );
  }

  return (
    <div className="space-y-6 px-2 sm:px-0">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between sm:gap-0">
        <div className="text-muted-foreground text-sm leading-relaxed">
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

      <div className="flex flex-col items-stretch gap-4 sm:flex-row sm:items-center">
        <div className="max-w-full flex-1 sm:max-w-md">
          <XSearch
            value={searchTerm}
            onChange={setSearchTerm}
            placeholder="Search snapshots..."
            aria-label="Search snapshots"
          />
        </div>
      </div>

      {totalItems === 0 ? (
        <div className="text-muted-foreground rounded-2xl border p-8 text-center">
          No snapshots match your search.
        </div>
      ) : (
        <>
          <div className="w-full overflow-x-auto">
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
                      <div className="flex items-center gap-2">
                        <div className="min-w-0">
                          <Button
                            type="button"
                            variant="outline"
                            className="decoration-muted-foreground/50 inline-flex max-w-full cursor-pointer items-center truncate text-left font-medium underline underline-offset-2 hover:decoration-current"
                            onClick={() => handleViewDetails(s.ID)}
                            title={s.Name || s.ID}
                          >
                            <span className="truncate">{s.Name || s.ID}</span>
                          </Button>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="py-3">
                      <StatusBadge
                        status={s.Status}
                        statusTextMap={{
                          AVAILABLE: "SUCCESS",
                          CREATING: "PENDING",
                          ERROR: "ERROR",
                          DELETING: "UPDATING",
                          IN_PROGRESS: "PENDING",
                          PROCESSING: "PENDING",
                          PENDING: "PENDING",
                          READY: "SUCCESS",
                          STOPPED: "SHUTOFF",
                          STOPPING: "SHUTOFF",
                          SUCCESS: "SUCCESS",
                          UNKNOWN: "SHUTOFF",
                          UPDATING: "UPDATING",
                        }}
                      />
                    </TableCell>
                    <TableCell className="py-3">{s.Size} GB</TableCell>
                    <TableCell className="py-3">{s["Volume Name"]}</TableCell>
                    <TableCell className="py-3 text-right">
                      <div className="flex justify-end gap-2">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="outline"
                              size="icon"
                              className="cursor-pointer rounded-full"
                              onClick={() => handleEditClick(s.ID)}
                              aria-label={`Edit ${s.Name || s.ID}`}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Edit</TooltipContent>
                        </Tooltip>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="outline"
                              size="icon"
                              className="cursor-pointer rounded-full"
                              onClick={() => handleRestoreClick(s.ID)}
                              aria-label={`Restore ${s.Name || s.ID}`}
                            >
                              <RotateCcw className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Restore</TooltipContent>
                        </Tooltip>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="destructive"
                              size="icon"
                              className="cursor-pointer rounded-full text-white"
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
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <Trash2 className="h-4 w-4" />
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
              className="bg-background text-foreground border-border/50 w-full max-w-xs cursor-pointer rounded-full border px-4 py-2 transition-all duration-200 sm:w-auto sm:px-6"
            >
              <span className="truncate">
                {hasMore
                  ? `Show More (${Math.min(6, remaining)} more)`
                  : "All snapshots loaded"}
              </span>
              {hasMore && <ChevronDown className="ml-2 h-4 w-4" />}
            </Button>
          </div>
        </>
      )}

      <InfoDialog
        isLoading={snapshotDetailsLoading || snapshotDetailsFetching}
        open={detailsDialogOpen}
        onOpenChange={setDetailsDialogOpen}
        title={snapshotDetails?.Name ?? "Snapshot Details"}
        badges={
          <Badge variant="secondary" className="px-2 py-0 text-xs">
            {snapshotDetails?.Status ?? "unknown"}
          </Badge>
        }
        infoItems={[
          [
            {
              label: "ID",
              value: snapshotDetails?.ID ?? "N/A",
              icon: FileText,
              variant: "gray",
            },
            {
              label: "Description",
              value: snapshotDetails?.Description ?? "No description",
              icon: FileText,
              variant: "blue",
            },
            {
              label: "Status",
              value: snapshotDetails?.Status ?? "N/A",
              icon: Server,
              variant:
                snapshotDetails?.Status === "available" ? "green" : "gray",
            },
            {
              label: "Size",
              value: snapshotDetails?.Size
                ? `${snapshotDetails.Size} GB`
                : "N/A",
              icon: HardDrive,
              variant: "teal",
            },
            {
              label: "Volume Name",
              value: snapshotDetails?.["Volume Name"] ?? "N/A",
              icon: HardDrive,
              variant: "indigo",
            },
            {
              label: "Created",
              value: snapshotDetails?.Created ?? "N/A",
              icon: Calendar,
              variant: "purple",
            },
          ],
        ]}
        actionButtons={
          <Button
            variant="outline"
            onClick={() => setDetailsDialogOpen(false)}
            className="rounded-full"
          >
            Close
          </Button>
        }
      />

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
          <div className="space-y-4 py-2">
            <div>
              <Label
                htmlFor="update-name"
                className="text-muted-foreground mb-1 text-xs font-medium"
              >
                Name
              </Label>
              <Input
                id="update-name"
                className="bg-background text-foreground !h-10 w-full rounded-full border px-3 py-2"
                value={updateName}
                onChange={(e) => setUpdateName(e.target.value)}
                disabled={updateLoading || updateMutation.isPending}
              />
            </div>
            <div>
              <Label
                htmlFor="update-description"
                className="text-muted-foreground mb-1 text-xs font-medium"
              >
                Description
              </Label>
              <Textarea
                id="update-description"
                className="bg-background text-foreground w-full resize-none rounded-md border px-3 py-2"
                value={updateDescription}
                onChange={(e) => setUpdateDescription(e.target.value)}
                disabled={updateLoading || updateMutation.isPending}
                rows={3}
              />
            </div>
            {updateError && (
              <div className="text-destructive text-xs">{updateError}</div>
            )}
          </div>
          <DialogFooter className="flex-col gap-3 pt-4 sm:flex-row">
            <Button
              variant="outline"
              onClick={() => setUpdateDialogOpen(false)}
              disabled={updateMutation.isPending}
              className="bg-muted text-foreground order-2 w-full cursor-pointer rounded-full px-6 py-2 sm:order-1 sm:w-auto"
            >
              <X className="mr-1.5 h-4 w-4" />
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
              className="text-background bg-primary order-1 flex w-full cursor-pointer items-center justify-center rounded-full px-6 py-2 sm:order-2 sm:w-auto"
            >
              <Save className="mr-1.5 h-4 w-4" />
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
          <div className="space-y-4 py-2">
            <div>
              <Label
                htmlFor="restore-name"
                className="text-muted-foreground mb-1 text-xs font-medium"
              >
                New Volume Name
              </Label>
              <Input
                id="restore-name"
                className="bg-background text-foreground w-full rounded-full border px-3 py-2"
                value={restoreName}
                onChange={(e) => setRestoreName(e.target.value)}
                disabled={restoreMutation.isPending}
              />
            </div>
            {restoreError && (
              <div className="text-destructive text-xs">{restoreError}</div>
            )}
          </div>
          <DialogFooter className="flex-col gap-3 pt-4 sm:flex-row">
            <Button
              variant="outline"
              onClick={() => setRestoreDialogOpen(false)}
              disabled={restoreMutation.isPending}
              className="bg-muted text-foreground order-2 w-full cursor-pointer rounded-full px-6 py-2 sm:order-1 sm:w-auto"
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
              className="text-background bg-primary order-1 flex w-full cursor-pointer items-center justify-center rounded-full px-6 py-2 sm:order-2 sm:w-auto"
            >
              <RotateCcw className="mr-1.5 h-4 w-4" />
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
            <span className="text-foreground font-semibold">
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
