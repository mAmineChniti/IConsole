"use client";

import { GetDistroIcon } from "@/components/Images/GetDistroIcon";
import { ImageCreateVolumeDialog } from "@/components/Images/ImageCreateVolumeDialog";
import { ImageEditDialog } from "@/components/Images/ImageEditDialog";
import { ImportByNameDialog } from "@/components/Images/ImportByNameDialog";
import { ImportFromUrlDialog } from "@/components/Images/ImportFromUrlDialog";
import { UploadImageDialog } from "@/components/Images/UploadImageDialog";
import { ConfirmDeleteDialog } from "@/components/reusable/ConfirmDeleteDialog";
import { EmptyState } from "@/components/reusable/EmptyState";
import { ErrorCard } from "@/components/reusable/ErrorCard";
import { HeaderActions } from "@/components/reusable/HeaderActions";
import { InfoDialog } from "@/components/reusable/InfoDialog";
import { StatusBadge } from "@/components/reusable/StatusBadge";
import { XSearch } from "@/components/reusable/XSearch";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { ImageService } from "@/lib/requests";
import { cn } from "@/lib/utils";
import type {
  Image,
  ImageDetails,
  ImageListResponse,
} from "@/types/ResponseInterfaces";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Box,
  Disc,
  Edit2,
  Eye,
  EyeOff,
  HardDrive,
  Image as ImageIcon,
  Link,
  Search,
  ShieldCheck,
  ShieldOff,
  Trash2,
  Upload,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export function Images() {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [visibleCount, setVisibleCount] = useState(6);
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [imageToDelete, setImageToDelete] = useState<Image | undefined>(
    undefined,
  );
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);
  const [isImportByNameOpen, setIsImportByNameOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [detailsImage, setDetailsImage] = useState<Image | undefined>(
    undefined,
  );
  const [isCreateVolumeOpen, setIsCreateVolumeOpen] = useState(false);
  const [createVolumeForImage, setCreateVolumeForImage] = useState<
    Image | undefined
  >(undefined);
  const [editImageId, setEditImageId] = useState<string | undefined>(undefined);
  const deleteMutation = useMutation({
    mutationFn: (id: string) => ImageService.deleteImage({ image_id: id }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["images"] });
      toast.success("Image deleted successfully");
      setDeleteDialogOpen(false);
      setImageToDelete(undefined);
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to delete image");
    },
  });

  const {
    data,
    isLoading: loading,
    error,
    refetch: fetchImages,
    isFetching,
  } = useQuery<ImageListResponse>({
    queryKey: ["images"],
    queryFn: async () => {
      return await ImageService.listImages();
    },
  });

  const imageList: ImageListResponse = data ?? [];

  const { data: detailsData, isLoading: detailsLoading } =
    useQuery<ImageDetails>({
      queryKey: ["image-details", detailsImage?.id],
      queryFn: async () => {
        if (!detailsImage?.id) throw new Error("No image ID provided");
        return await ImageService.getImageDetails(detailsImage.id);
      },
      enabled: isDetailsOpen && !!detailsImage?.id,
      staleTime: 60_000,
    });

  const filteredImages = imageList.filter((image) =>
    image.name.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const totalItems = filteredImages.length;
  const visibleData = filteredImages.slice(0, visibleCount);
  const hasMore = visibleCount < totalItems;

  const handleShowMore = () => {
    setVisibleCount((prev) => prev + 6);
  };

  const handleEditImage = (image: Image) => {
    setEditImageId(image.id);
    setIsEditDialogOpen(true);
  };

  if (loading) {
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
          <Table className="w-full table-fixed">
            <TableHeader>
              <TableRow>
                <TableHead className="w-12 py-3">Icon</TableHead>
                <TableHead className="w-1/5 py-3">Name</TableHead>
                <TableHead className="w-1/5 py-3">Status</TableHead>
                <TableHead className="w-1/5 py-3">Visibility</TableHead>
                <TableHead className="w-1/5 py-3">Protected</TableHead>
                <TableHead className="w-1/5 py-3">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {Array.from({ length: 6 }).map((_, idx) => (
                <TableRow key={idx}>
                  <TableCell className="py-3">
                    <Skeleton className="h-8 w-8 rounded-full" />
                  </TableCell>
                  <TableCell className="w-1/5 py-3">
                    <Skeleton className="h-4 w-24" />
                  </TableCell>
                  <TableCell className="w-1/5 py-3">
                    <Skeleton className="h-4 w-16" />
                  </TableCell>
                  <TableCell className="w-1/5 py-3">
                    <Skeleton className="h-4 w-16" />
                  </TableCell>
                  <TableCell className="w-1/5 py-3">
                    <Skeleton className="h-4 w-10" />
                  </TableCell>
                  <TableCell className="w-1/5 py-3">
                    <div className="flex justify-end">
                      <Skeleton className="h-8 w-24" />
                    </div>
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
        title="Failed to Load Images"
        message={
          error?.message ||
          "Unable to fetch image data. Please check your connection and try again."
        }
        onRetry={() => fetchImages()}
        isRetrying={isFetching}
      />
    );
  }
  if (!imageList || imageList.length === 0) {
    return (
      <>
        <EmptyState
          title="No images found"
          text="You don't have any images yet. Import or upload an image to get started."
          onRefresh={() => fetchImages()}
          refreshing={isFetching}
          icon={<ImageIcon />}
          variant="dashed"
          primaryActions={[
            {
              label: "Import from URL",
              onClick: () => setIsImportDialogOpen(true),
              icon: <Link />,
            },
            {
              label: "Import by Name",
              onClick: () => setIsImportByNameOpen(true),
              icon: <Search />,
            },
            {
              label: "Upload Image",
              onClick: () => setIsUploadDialogOpen(true),
              icon: <Upload />,
            },
          ]}
        />

        <ImportFromUrlDialog
          open={isImportDialogOpen}
          onOpenChange={setIsImportDialogOpen}
          onCancel={() => setIsImportDialogOpen(false)}
        />

        <ImportByNameDialog
          open={isImportByNameOpen}
          onOpenChange={setIsImportByNameOpen}
          onCancel={() => setIsImportByNameOpen(false)}
        />

        <UploadImageDialog
          open={isUploadDialogOpen}
          onOpenChange={setIsUploadDialogOpen}
          onCancel={() => setIsUploadDialogOpen(false)}
        />
      </>
    );
  }

  return (
    <div className="space-y-6 px-2 sm:px-0">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between sm:gap-0">
        <div className="text-muted-foreground text-sm leading-relaxed">
          {totalItems} image{totalItems !== 1 ? "s" : ""} total
          {totalItems > 0 && (
            <>
              {" • "}
              Showing {Math.min(visibleCount, totalItems)} of {totalItems}
            </>
          )}
        </div>
        <div className="ml-auto flex flex-wrap gap-2 self-end sm:flex-nowrap sm:self-auto">
          <HeaderActions
            onRefresh={() => fetchImages()}
            isRefreshing={isFetching}
            refreshTooltip="Refresh images"
            mainButtons={[
              {
                label: "Import from URL",
                onClick: () => setIsImportDialogOpen(true),
                icon: <Link />,
              },
              {
                label: "Import by Name",
                onClick: () => setIsImportByNameOpen(true),
                icon: <Search />,
              },
              {
                label: "Upload Image",
                onClick: () => setIsUploadDialogOpen(true),
                icon: <Upload />,
              },
            ]}
          />
        </div>
      </div>

      <div className="flex flex-col items-stretch gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="max-w-full flex-1 sm:max-w-md">
          <XSearch
            value={searchTerm}
            onChange={setSearchTerm}
            placeholder="Search images..."
            aria-label="Search images"
          />
        </div>
      </div>

      {totalItems === 0 ? (
        <div className="text-muted-foreground flex min-h-32 items-center justify-center rounded-2xl border p-8 text-center">
          No images match your search.
        </div>
      ) : (
        <>
          <div className="w-full overflow-x-auto">
            <Table className="w-full table-fixed">
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12 py-3">Icon</TableHead>
                  <TableHead className="w-1/5 py-3">Name</TableHead>
                  <TableHead className="w-1/5 py-3">Status</TableHead>
                  <TableHead className="w-1/5 py-3">Visibility</TableHead>
                  <TableHead className="w-1/5 py-3">Protected</TableHead>
                  <TableHead className="w-1/5 py-3 text-right">
                    Actions
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {visibleData.map((image) => (
                  <TableRow key={image.id}>
                    <TableCell className="py-3">
                      <GetDistroIcon imageName={image.name} />
                    </TableCell>
                    <TableCell className="w-1/5 py-3 align-middle">
                      <button
                        type="button"
                        className="decoration-muted-foreground/50 inline-flex max-w-full cursor-pointer items-center truncate text-left font-medium underline underline-offset-2 hover:decoration-current"
                        onClick={() => {
                          setDetailsImage(image);
                          setIsDetailsOpen(true);
                        }}
                        title={image.name}
                      >
                        <span className="truncate">{image.name}</span>
                      </button>
                    </TableCell>
                    <TableCell className="w-1/5 py-3">
                      <StatusBadge status={image.status} />
                    </TableCell>

                    <TableCell className="w-1/5 py-3">
                      <Badge variant="outline">{image.visibility}</Badge>
                    </TableCell>
                    <TableCell className="w-1/5 py-3">
                      {image.protected ? (
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <span className="inline-flex items-center gap-1">
                              <ShieldCheck className="h-4 w-4 text-green-600" />
                              <span className="text-xs">Protected</span>
                            </span>
                          </TooltipTrigger>
                          <TooltipContent>Protected</TooltipContent>
                        </Tooltip>
                      ) : (
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <span className="inline-flex items-center gap-1">
                              <ShieldOff className="text-muted-foreground h-4 w-4" />
                              <span className="text-xs">Not protected</span>
                            </span>
                          </TooltipTrigger>
                          <TooltipContent>Not protected</TooltipContent>
                        </Tooltip>
                      )}
                    </TableCell>
                    <TableCell className="w-1/5 py-3">
                      <div className="flex justify-end gap-2">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="outline"
                              size="icon"
                              className="cursor-pointer rounded-full"
                              onClick={() => {
                                setCreateVolumeForImage(image);
                                setIsCreateVolumeOpen(true);
                              }}
                            >
                              <HardDrive className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Create Volume</TooltipContent>
                        </Tooltip>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="outline"
                              size="icon"
                              className="cursor-pointer rounded-full"
                              onClick={() => handleEditImage(image)}
                            >
                              <Edit2 className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Edit</TooltipContent>
                        </Tooltip>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="destructive"
                              size="icon"
                              className="cursor-pointer rounded-full text-white"
                              onClick={() => {
                                setImageToDelete(image);
                                setDeleteDialogOpen(true);
                              }}
                              disabled={
                                deleteMutation.isPending || !!image.protected
                              }
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            {image.protected
                              ? "Cannot delete protected image"
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

          <InfoDialog
            open={isDetailsOpen}
            onOpenChange={setIsDetailsOpen}
            isLoading={detailsLoading}
            title={detailsImage?.name ?? "Image details"}
            badges={
              <>
                <StatusBadge
                  status={
                    detailsData?.status ?? detailsImage?.status ?? "unknown"
                  }
                />
                <Badge variant="outline" className="px-2 py-0 text-xs">
                  {detailsData?.visibility ?? detailsImage?.visibility ?? "-"}
                </Badge>
                {(detailsData?.protected ?? detailsImage?.protected) ? (
                  <Badge className="px-2 py-0 text-xs">Protected</Badge>
                ) : (
                  <Badge variant="outline" className="px-2 py-0 text-xs">
                    Not protected
                  </Badge>
                )}
              </>
            }
            infoItems={[
              [
                {
                  label: "Name",
                  value: detailsData?.name ?? detailsImage?.name ?? "-",
                  icon: Box,
                  variant: "gray",
                },
                {
                  label: "Status",
                  value: detailsData?.status ?? detailsImage?.status ?? "-",
                  icon: HardDrive,
                  variant:
                    detailsData?.status === "active" ||
                    detailsImage?.status === "active"
                      ? "green"
                      : "gray",
                },
                {
                  label: "Visibility",
                  value:
                    detailsData?.visibility ?? detailsImage?.visibility ?? "-",
                  icon:
                    (detailsData?.visibility ?? detailsImage?.visibility) ===
                    "public"
                      ? Eye
                      : EyeOff,
                  variant:
                    (detailsData?.visibility ?? detailsImage?.visibility) ===
                    "public"
                      ? "green"
                      : "gray",
                },
                {
                  label: "Size",
                  value: detailsData?.size,
                  icon: HardDrive,
                  variant: "blue",
                },
                {
                  label: "Container Format",
                  value: detailsData?.container_format ?? "-",
                  icon: Box,
                  variant: "purple",
                },
                {
                  label: "Disk Format",
                  value: detailsData?.disk_format ?? "-",
                  icon: Disc,
                  variant: "blue",
                },
                {
                  label: "Protected",
                  value: detailsData?.protected ? "Yes" : "No",
                  icon: detailsData?.protected ? ShieldCheck : ShieldOff,
                  variant: detailsData?.protected ? "green" : "gray",
                },
              ],
            ]}
            actionButtons={
              <>
                <Button
                  onClick={() => setIsDetailsOpen(false)}
                  variant="outline"
                  size="sm"
                  className="cursor-pointer rounded-full"
                >
                  Close
                </Button>
              </>
            }
            className="sm:max-w-3xl"
          />

          <div className="flex justify-center px-4 sm:px-0">
            <Button
              onClick={handleShowMore}
              variant="outline"
              disabled={!hasMore}
              className={cn(
                "bg-background text-foreground border-border/50 w-full max-w-xs rounded-full px-4 py-2 sm:w-auto sm:px-6",
                !hasMore ? "cursor-not-allowed opacity-50" : "cursor-pointer",
              )}
            >
              <span className="truncate">
                {hasMore
                  ? `Show More (${Math.min(6, totalItems - visibleCount)} more)`
                  : "All images loaded"}
              </span>
            </Button>
          </div>
        </>
      )}

      <ImportFromUrlDialog
        open={isImportDialogOpen}
        onOpenChange={setIsImportDialogOpen}
        onCancel={() => setIsImportDialogOpen(false)}
      />

      <ImportByNameDialog
        open={isImportByNameOpen}
        onOpenChange={setIsImportByNameOpen}
        onCancel={() => setIsImportByNameOpen(false)}
      />

      <UploadImageDialog
        open={isUploadDialogOpen}
        onOpenChange={setIsUploadDialogOpen}
        onCancel={() => setIsUploadDialogOpen(false)}
      />

      <ImageCreateVolumeDialog
        open={isCreateVolumeOpen}
        onOpenChange={setIsCreateVolumeOpen}
        image={createVolumeForImage}
      />

      <ImageEditDialog
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        imageId={editImageId ?? undefined}
        initialData={
          editImageId
            ? imageList.find((img) => img.id === editImageId)
            : undefined
        }
        onSuccess={() => {
          setIsEditDialogOpen(false);
          setEditImageId(undefined);
        }}
      />

      <ConfirmDeleteDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Delete Image"
        description={
          <>
            Are you sure you want to delete this image{" "}
            <span className="text-foreground font-semibold">
              {imageToDelete?.name}
            </span>
            ? This action cannot be undone.
          </>
        }
        confirmLabel="Delete"
        cancelLabel="Cancel"
        confirming={deleteMutation.isPending}
        onConfirm={() =>
          imageToDelete && deleteMutation.mutate(imageToDelete.id)
        }
      />
    </div>
  );
}
