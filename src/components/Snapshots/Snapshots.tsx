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
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
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
  VolumeCreateFromSnapshotRequest,
  VolumeSnapshotUpdateRequest,
} from "@/types/RequestInterfaces";
import {
  VolumeCreateFromSnapshotRequestSchema,
  VolumeSnapshotUpdateRequestSchema,
} from "@/types/RequestSchemas";
import type {
  VolumeSnapshotDetails,
  VolumeSnapshotListResponse,
} from "@/types/ResponseInterfaces";
import { zodResolver } from "@hookform/resolvers/zod";
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
import { useForm } from "react-hook-form";
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

  // Form for updating snapshot
  const updateForm = useForm<VolumeSnapshotUpdateRequest>({
    resolver: zodResolver(VolumeSnapshotUpdateRequestSchema),
    mode: "onChange",
    defaultValues: {
      name: "",
      description: "",
    },
  });

  const restoreForm = useForm<VolumeCreateFromSnapshotRequest>({
    resolver: zodResolver(VolumeCreateFromSnapshotRequestSchema),
    mode: "onChange",
    defaultValues: {
      name: "",
      description: "",
      snapshot_id: "",
    },
  });

  useEffect(() => {
    setVisibleCount(6);
  }, [searchTerm]);

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
    mutationFn: async (data: VolumeSnapshotUpdateRequest & { id: string }) =>
      VolumeService.updateSnapshot(
        { name: data.name, description: data.description },
        data.id,
      ),
    onSuccess: async () => {
      toast.success("Snapshot updated successfully");
      setUpdateDialogOpen(false);
      setSelectedSnapshotId(undefined);
      updateForm.reset();
      await queryClient.invalidateQueries({ queryKey: ["snapshots", "list"] });
    },
    onError: (err: unknown) => {
      const message =
        err instanceof Error ? err.message : "An unexpected error occurred";
      toast.error(message);
    },
  });

  const restoreMutation = useMutation({
    mutationFn: async (data: VolumeCreateFromSnapshotRequest) =>
      VolumeService.createVolumeFromSnapshot(data),
    onSuccess: async () => {
      toast.success("Volume restore started");
      setRestoreDialogOpen(false);
      setSelectedSnapshotId(undefined);
      restoreForm.reset();
      await queryClient.invalidateQueries({ queryKey: ["snapshots", "list"] });
    },
    onError: (err: unknown) => {
      const message =
        err instanceof Error ? err.message : "An unexpected error occurred";
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

    try {
      const details = await VolumeService.getSnapshotDetails(id);
      updateForm.reset({
        name: details.Name ?? "",
        description: details.Description ?? "",
      });
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to load snapshot details";
      toast.error(message);
    }
  };

  const handleRestoreClick = (id: string) => {
    setSelectedSnapshotId(id);
    setRestoreDialogOpen(true);
    restoreForm.reset({
      name: "",
      description: "",
      snapshot_id: id,
    });
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
                            variant="ghost"
                            className="decoration-muted-foreground/50 inline-flex h-auto max-w-full cursor-pointer items-center truncate border-none p-0 text-left font-medium underline underline-offset-2 hover:bg-transparent hover:decoration-current"
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
                    <TableCell className="py-3">
                      {s["Volume Name"]?.trim() || "N/A"}
                    </TableCell>
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
        title={
          snapshotDetails?.Name ?? snapshotDetails?.ID ?? "Snapshot Details"
        }
        badges={
          <Badge variant="secondary" className="px-2 py-0 text-xs">
            {snapshotDetails?.Status ?? "unknown"}
          </Badge>
        }
        infoItems={[
          [
            {
              label: "Description",
              value: (snapshotDetails?.Description?.trim() ?? "") || "N/A",
              icon: FileText,
              variant: "blue",
            },
            {
              label: "Status",
              value: (snapshotDetails?.Status?.trim() ?? "") || "N/A",
              icon: Server,
              variant:
                snapshotDetails?.Status?.trim().toLowerCase() === "available"
                  ? "green"
                  : "orange",
            },
            {
              label: "Size",
              value: snapshotDetails?.Size
                ? `${snapshotDetails.Size} GB`
                : "N/A",
              icon: HardDrive,
              variant: "emerald",
            },
            {
              label: "Volume Name",
              value: (snapshotDetails?.["Volume Name"]?.trim() ?? "") || "N/A",
              icon: HardDrive,
              variant: "violet",
            },
            {
              label: "Created",
              value: (snapshotDetails?.Created?.trim() ?? "") || "N/A",
              icon: Calendar,
              variant: "cyan",
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
          if (!open) {
            setSelectedSnapshotId(undefined);
            updateForm.reset();
          }
        }}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Snapshot</DialogTitle>
          </DialogHeader>
          <Form {...updateForm}>
            <form
              onSubmit={updateForm.handleSubmit(
                (data) =>
                  selectedSnapshotId &&
                  updateMutation.mutate({
                    ...data,
                    id: selectedSnapshotId,
                  }),
              )}
              className="space-y-4 py-2"
            >
              <FormField
                control={updateForm.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-muted-foreground text-xs font-medium">
                      Name
                    </FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        className="bg-background text-foreground !h-10 w-full rounded-full border px-3 py-2"
                        disabled={updateMutation.isPending}
                      />
                    </FormControl>
                    <FormMessage className="text-xs" />
                  </FormItem>
                )}
              />
              <FormField
                control={updateForm.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-muted-foreground text-xs font-medium">
                      Description
                    </FormLabel>
                    <FormControl>
                      <Textarea
                        {...field}
                        value={field.value ?? ""}
                        className="bg-background text-foreground w-full resize-none rounded-md border px-3 py-2"
                        disabled={updateMutation.isPending}
                        rows={3}
                      />
                    </FormControl>
                    <FormMessage className="text-xs" />
                  </FormItem>
                )}
              />
              <DialogFooter className="flex-col gap-3 pt-4 sm:flex-row">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setUpdateDialogOpen(false)}
                  disabled={updateMutation.isPending}
                  className="bg-muted text-foreground order-2 w-full cursor-pointer rounded-full px-6 py-2 sm:order-1 sm:w-auto"
                >
                  <X className="mr-1.5 h-4 w-4" />
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="default"
                  disabled={
                    updateMutation.isPending || !updateForm.formState.isValid
                  }
                  className="bg-primary text-primary-foreground hover:bg-primary/90 order-1 w-full cursor-pointer rounded-full px-6 py-2 sm:order-2 sm:w-auto"
                >
                  {updateMutation.isPending ? (
                    <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
                  ) : (
                    <Save className="mr-1.5 h-4 w-4" />
                  )}
                  {updateMutation.isPending ? "Updating..." : "Update"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <Dialog
        open={restoreDialogOpen}
        onOpenChange={(open) => {
          setRestoreDialogOpen(open);
          if (!open) {
            setSelectedSnapshotId(undefined);
            restoreForm.reset();
          }
        }}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Restore Snapshot</DialogTitle>
          </DialogHeader>
          <Form {...restoreForm}>
            <form
              onSubmit={restoreForm.handleSubmit((data) =>
                restoreMutation.mutate(data),
              )}
              className="space-y-4 py-2"
            >
              <FormField
                control={restoreForm.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-muted-foreground text-xs font-medium">
                      New Volume Name
                    </FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        className="bg-background text-foreground w-full rounded-full border px-3 py-2"
                        disabled={restoreMutation.isPending}
                        placeholder="Enter volume name..."
                      />
                    </FormControl>
                    <FormMessage className="text-xs" />
                  </FormItem>
                )}
              />
              <FormField
                control={restoreForm.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-muted-foreground text-xs font-medium">
                      Description (Optional)
                    </FormLabel>
                    <FormControl>
                      <Textarea
                        {...field}
                        value={field.value ?? ""}
                        className="bg-background text-foreground w-full resize-none rounded-md border px-3 py-2"
                        disabled={restoreMutation.isPending}
                        rows={3}
                        placeholder="Enter description..."
                      />
                    </FormControl>
                    <FormMessage className="text-xs" />
                  </FormItem>
                )}
              />
              <DialogFooter className="flex-col gap-3 pt-4 sm:flex-row">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setRestoreDialogOpen(false)}
                  disabled={restoreMutation.isPending}
                  className="bg-muted text-foreground order-2 w-full cursor-pointer rounded-full px-6 py-2 sm:order-1 sm:w-auto"
                >
                  <X className="mr-1.5 h-4 w-4" />
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="default"
                  disabled={
                    restoreMutation.isPending || !restoreForm.formState.isValid
                  }
                  className="bg-primary text-primary-foreground hover:bg-primary/90 order-1 w-full cursor-pointer rounded-full px-6 py-2 sm:order-2 sm:w-auto"
                >
                  {restoreMutation.isPending ? (
                    <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
                  ) : (
                    <RotateCcw className="mr-1.5 h-4 w-4" />
                  )}
                  {restoreMutation.isPending
                    ? "Restoring..."
                    : "Restore Volume"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
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
