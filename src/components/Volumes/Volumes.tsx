"use client";

import { ConfirmDeleteDialog } from "@/components/reusable/ConfirmDeleteDialog";
import { EmptyState } from "@/components/reusable/EmptyState";
import { ErrorCard } from "@/components/reusable/ErrorCard";
import { HeaderActions } from "@/components/reusable/HeaderActions";
import { InfoCard } from "@/components/reusable/InfoCard";
import { InfoDialog } from "@/components/reusable/InfoDialog";
import { StatusBadge } from "@/components/reusable/StatusBadge";
import { XSearch } from "@/components/reusable/XSearch";
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
import { VolumeAttachmentsDialog } from "@/components/Volumes/VolumeAttachmentsDialog";
import { VolumeChangeTypeDialog } from "@/components/Volumes/VolumeChangeTypeDialog";
import { VolumeCreateForm } from "@/components/Volumes/VolumeCreateForm";
import { VolumeCreateSnapshotDialog } from "@/components/Volumes/VolumeCreateSnapshotDialog";
import { VolumeExtendDialog } from "@/components/Volumes/VolumeExtendDialog";
import { VolumeUploadToImageDialog } from "@/components/Volumes/VolumeUploadToImageDialog";
import { VolumeService } from "@/lib/requests";
import { parseVolumeSizeGiB } from "@/lib/utils";
import type { VolumeDeleteRequest } from "@/types/RequestInterfaces";
import type {
  VolumeDetails,
  VolumeGetDetails,
} from "@/types/ResponseInterfaces";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Box,
  Calendar,
  Folder,
  HardDrive,
  Link2,
  Lock as LockIcon,
  MapPin,
  MoreHorizontal,
  Plus,
  RefreshCw,
  Server,
  Trash2,
  Users,
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

  const { data: volumeDetails, isLoading: volumeDetailsLoading } = useQuery<
    VolumeGetDetails | undefined
  >({
    queryKey: ["volume-details", selectedVolumeId],
    queryFn: () =>
      selectedVolumeId
        ? VolumeService.get(selectedVolumeId)
        : Promise.resolve({} as VolumeGetDetails),
    enabled: !!selectedVolumeId,
    staleTime: 10000,
    gcTime: 5 * 60 * 1000,
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
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between sm:gap-0">
          <Skeleton className="h-4 w-40" />
          <div className="flex w-full items-center justify-end gap-3 sm:w-auto">
            <Skeleton className="h-9 w-9 rounded-full" />
            <Skeleton className="h-10 w-40 rounded-full" />
          </div>
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card
              key={`skeleton-${i}`}
              className="bg-card text-card-foreground border-border/50 group flex h-full cursor-pointer flex-col rounded-xl border shadow-lg transition-all duration-200 hover:shadow-xl"
            >
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-card-foreground truncate text-lg font-semibold">
                    <Skeleton className="h-6 w-32 rounded" />
                  </CardTitle>
                  <span className="bg-muted text-muted-foreground rounded px-2 py-1 text-xs">
                    <Skeleton className="h-4 w-16 rounded" />
                  </span>
                </div>
              </CardHeader>
              <CardContent className="flex flex-1 flex-col pt-0">
                <div className="flex-1 space-y-3">
                  <div className="mt-2 flex flex-col gap-3">
                    <div className="flex flex-row items-center gap-3">
                      <div className="bg-muted/60 flex min-w-0 flex-1 rounded-lg p-2">
                        <div className="flex w-full items-center gap-2">
                          <span className="inline-flex h-7 w-7 items-center justify-center rounded-md bg-blue-100 dark:bg-blue-900/30">
                            <Skeleton className="h-4 w-4 rounded" />
                          </span>
                          <div className="flex min-w-0 flex-col">
                            <Skeleton className="mb-1 h-3 w-10" />
                            <span className="text-card-foreground truncate text-sm font-semibold">
                              <Skeleton className="h-4 w-16" />
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="bg-muted/60 flex min-w-0 flex-1 rounded-lg p-2">
                        <div className="flex w-full items-center gap-2">
                          <span className="inline-flex h-7 w-7 items-center justify-center rounded-md bg-purple-100 dark:bg-purple-900/30">
                            <Skeleton className="h-4 w-4 rounded" />
                          </span>
                          <div className="flex min-w-0 flex-col">
                            <Skeleton className="mb-1 h-3 w-10" />
                            <span className="text-card-foreground truncate text-sm font-semibold">
                              <Skeleton className="h-4 w-16" />
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-row items-center gap-3">
                      <div className="bg-muted/60 flex min-w-0 flex-1 rounded-lg p-2">
                        <div className="flex min-w-0 flex-col">
                          <Skeleton className="mb-1 h-3 w-10" />
                          <span className="text-card-foreground truncate text-sm font-semibold">
                            <Skeleton className="h-4 w-16" />
                          </span>
                        </div>
                      </div>
                      <div className="bg-muted/60 flex min-w-0 flex-1 rounded-lg p-2">
                        <div className="flex min-w-0 flex-col">
                          <Skeleton className="mb-1 h-3 w-10" />
                          <span className="text-card-foreground truncate text-sm font-semibold">
                            <Skeleton className="h-4 w-10" />
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="mt-4 flex flex-col gap-2">
                  <div className="flex w-full items-center justify-center gap-2">
                    <Skeleton className="h-8 w-20 rounded-full" />
                    <Skeleton className="h-8 w-20 rounded-full" />
                    <Skeleton className="h-8 w-20 rounded-full" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
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
          icon={<HardDrive className="text-muted-foreground h-7 w-7" />}
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
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between sm:gap-0">
        <div className="text-muted-foreground text-sm leading-relaxed">
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

      <div className="flex flex-col items-stretch gap-4 sm:flex-row sm:items-center">
        <div className="max-w-full flex-1 sm:max-w-md">
          <XSearch
            value={search}
            onChange={setSearch}
            placeholder="Search volumes..."
            aria-label="Search volumes"
          />
        </div>
      </div>

      {totalItems === 0 ? (
        <div className="text-muted-foreground rounded-2xl border p-8 text-center">
          No volumes match your search.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3">
          {visibleData.map((volume) => (
            <InfoCard
              key={volume.ID}
              title={volume.Name || volume.ID}
              className="h-full"
              onClick={() => {
                setSelectedVolumeId(volume.ID);
                setDetailsDialogOpen(true);
              }}
              badges={
                <div className="flex items-center space-x-1">
                  <StatusBadge
                    status={volume.Status}
                    statusTextMap={{
                      AVAILABLE: "SUCCESS",
                      "IN-USE": "ACTIVE",
                      CREATING: "PENDING",
                      DELETING: "UPDATING",
                      ERROR: "ERROR",
                      IN_PROGRESS: "PENDING",
                      DETACHING: "UPDATING",
                      ATTACHING: "UPDATING",
                    }}
                  />
                  <Badge variant="outline" className="flex items-center gap-1">
                    <HardDrive className="h-3 w-3" />
                    {volume.Size} GB
                  </Badge>
                </div>
              }
              infoItems={[
                [
                  {
                    label: "Size",
                    value: volume.Size,
                    icon: HardDrive,
                    variant: "blue",
                  },
                  {
                    label: "Type",
                    value: volume.Type || "-",
                    icon: Server,
                    variant: "purple",
                  },
                ],
                [
                  {
                    label: "Availability Zone",
                    value: volume["Availability Zone"] || "-",
                    icon: MapPin,
                    variant: "emerald",
                  },
                  {
                    label: "Bootable",
                    value: volume.Bootable || "-",
                    icon: HardDrive,
                    variant: volume.Bootable === "true" ? "emerald" : "gray",
                  },
                ],
              ]}
              actionButtons={
                <>
                  <DropdownMenu>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <span className="inline-flex">
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              className="cursor-pointer gap-2 rounded-full px-3"
                              onClick={(e) => e.stopPropagation()}
                              aria-label="Actions"
                            >
                              <MoreHorizontal className="h-4 w-4" />
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
                        <Server className="h-4 w-4" /> Attachments
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
                        <Plus className="h-4 w-4" /> Extend
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
                        <HardDrive className="h-4 w-4" /> Upload to Image
                      </DropdownMenuItem>
                      {volume.Status?.toUpperCase() !== "IN-USE" && (
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
                          <Box className="h-4 w-4" /> Create Snapshot
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
                        <RefreshCw className="h-4 w-4" /> Change Type
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        variant="destructive"
                        onSelect={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setVolumeToDelete(volume);
                          setDeleteDialogOpen(true);
                        }}
                        disabled={deleteMutation.isPending}
                      >
                        <Trash2 className="mr-2 h-4 w-4" /> Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="destructive"
                        size="sm"
                        className="cursor-pointer gap-2 rounded-full px-3"
                        aria-label="Delete volume"
                        onClick={(e) => {
                          e.stopPropagation();
                          setVolumeToDelete(volume);
                          setDeleteDialogOpen(true);
                        }}
                        disabled={deleteMutation.isPending}
                      >
                        <Trash2 className="h-4 w-4" /> Delete
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Delete this volume</TooltipContent>
                  </Tooltip>
                </>
              }
            />
          ))}
        </div>
      )}
      <InfoDialog
        open={detailsDialogOpen}
        onOpenChange={setDetailsDialogOpen}
        isLoading={volumeDetailsLoading}
        title={volumeDetails?.Nom ?? "Volume Details"}
        badges={<StatusBadge status={selectedVolumeItem?.Status ?? ""} />}
        description={volumeDetails?.Description ?? "N/A"}
        infoItems={[
          [
            {
              label: "Project",
              value: volumeDetails?.Projet ?? "N/A",
              icon: Folder,
              variant: "blue",
            },
            {
              label: "Status",
              value: volumeDetails?.Statut ?? "N/A",
              icon: Server,
              variant:
                volumeDetails?.Statut === "En ligne"
                  ? "green"
                  : volumeDetails?.Statut === "Erreur"
                    ? "red"
                    : "gray",
            },
            {
              label: "Group",
              value: volumeDetails?.Groupe ?? "N/A",
              icon: Users,
              variant: "indigo",
            },
            {
              label: "Size",
              value: volumeDetails?.Spécifications?.Taille ?? "N/A",
              icon: HardDrive,
              variant: "teal",
            },
            {
              label: "Type",
              value: volumeDetails?.Spécifications?.Type ?? "N/A",
              icon: HardDrive,
              variant: "violet",
            },
            {
              label: "Bootable",
              value: volumeDetails?.Spécifications?.Amorçable ?? "No",
              icon: Server,
              variant:
                volumeDetails?.Spécifications?.Amorçable === "Oui"
                  ? "emerald"
                  : "gray",
            },
            {
              label: "Encrypted",
              value: volumeDetails?.Spécifications?.Chiffré ?? "No",
              icon: LockIcon,
              variant:
                volumeDetails?.Spécifications?.Chiffré === "Oui"
                  ? "green"
                  : "gray",
            },
            {
              label: "Created",
              value: volumeDetails?.Spécifications?.["Créé"]
                ? new Date(
                    volumeDetails.Spécifications["Créé"],
                  ).toLocaleString()
                : "N/A",
              icon: Calendar,
              variant: "purple",
            },
            {
              label: "Attached To",
              value:
                volumeDetails?.Attachements?.["Attaché à"] ?? "Not attached",
              icon: Link2,
              variant: volumeDetails?.Attachements?.["Attaché à"]
                ? "sky"
                : "gray",
            },
            {
              label: "Availability Zone",
              value: selectedVolumeItem?.["Availability Zone"] ?? "N/A",
              icon: MapPin,
              variant: "blue",
            },
          ],
        ]}
        actionButtons={
          <Button
            variant="outline"
            className="cursor-pointer rounded-full"
            onClick={() => setDetailsDialogOpen(false)}
          >
            Close
          </Button>
        }
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
            <span className="text-foreground font-semibold">
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
          className={`bg-background text-foreground border-border rounded-full px-6 py-2 transition-all duration-200 ${hasMore ? "hover:bg-accent hover:text-accent-foreground hover:scale-105" : "cursor-not-allowed opacity-50"}`}
        >
          {hasMore
            ? `Show More (${Math.min(6, totalItems - visibleCount)} more)`
            : "All volumes loaded"}
        </Button>
      </div>
    </div>
  );
}
