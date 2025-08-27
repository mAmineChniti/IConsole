"use client";

import { ConfirmDeleteDialog } from "@/components/ConfirmDeleteDialog";
import { EmptyState } from "@/components/EmptyState";
import { ErrorCard } from "@/components/ErrorCard";
import { GetDistroIcon } from "@/components/GetDistroIcon";
import { HeaderActions } from "@/components/HeaderActions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Dropzone,
  DropzoneContent,
  DropzoneEmptyState,
} from "@/components/ui/dropzone";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
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
import { XSearch } from "@/components/XSearch";
import { ImageService } from "@/lib/requests";
import { cn } from "@/lib/utils";
import type {
  ImageCreateVolumeRequest,
  ImageImportFromNameRequest,
  ImageImportFromUploadRequest,
  ImageImportFromUrlRequest,
  ImageUpdateRequest,
} from "@/types/RequestInterfaces";
import {
  ImageCreateVolumeRequestSchema,
  ImageImportFromNameRequestSchema,
  ImageImportFromUploadRequestSchema,
  ImageImportFromUrlRequestSchema,
  ImageUpdateRequestSchema,
} from "@/types/RequestSchemas";
import type { ImageDetails } from "@/types/ResponseInterfaces";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  useMutation,
  useQueries,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import {
  Box,
  Disc,
  Edit2,
  Eye,
  EyeOff,
  HardDrive,
  Image as ImageIcon,
  Link,
  Loader2,
  Search,
  ShieldCheck,
  ShieldOff,
  Trash2,
  Upload,
} from "lucide-react";
import { useEffect, useState, type FormEventHandler } from "react";
import { useForm, type UseFormReturn } from "react-hook-form";
import { toast } from "sonner";

type ImportFromUrlDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  form: UseFormReturn<ImageImportFromUrlRequest>;
  onSubmit: FormEventHandler<HTMLFormElement>;
  isPending: boolean;
  onCancel: () => void;
};

function ImportFromUrlDialog({
  open,
  onOpenChange,
  form,
  onSubmit,
  isPending,
  onCancel,
}: ImportFromUrlDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="mx-4 sm:mx-0 max-w-[calc(100vw-2rem)] sm:max-w-md bg-card text-card-foreground border border-border/50 shadow-lg left-1/2 translate-x-[-50%] rounded-2xl">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold truncate">
            Import Image from URL
          </DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={onSubmit} className="space-y-4">
            <FormField
              control={form.control}
              name="image_url"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Image URL</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="https://.../image.qcow2"
                      className="w-full h-10 rounded-full"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="image_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Image Name</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="my-image"
                      className="w-full h-10 rounded-full"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="visibility"
              render={({ field }) => (
                <FormItem className="flex justify-between items-center py-2 px-3 rounded-lg border">
                  <div className="space-y-0.5">
                    <FormLabel className="text-sm font-medium">
                      Visibility
                    </FormLabel>
                    <p className="text-xs text-muted-foreground">
                      Toggle to make the image public
                    </p>
                  </div>
                  <FormControl>
                    <Switch
                      className="cursor-pointer"
                      checked={field.value === "public"}
                      onCheckedChange={(c) =>
                        field.onChange(c ? "public" : "private")
                      }
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            <div className="flex flex-col gap-3 justify-end sm:flex-row">
              <Button
                type="button"
                variant="outline"
                className="order-2 w-full rounded-full cursor-pointer sm:order-1 sm:w-auto"
                onClick={onCancel}
                disabled={isPending}
              >
                <span className="truncate">Cancel</span>
              </Button>
              <Button
                type="submit"
                variant="default"
                disabled={isPending}
                className="order-1 gap-2 w-full rounded-full cursor-pointer sm:order-2 sm:w-auto min-w-[140px]"
              >
                {isPending ? (
                  <>
                    <Loader2 className="flex-shrink-0 w-4 h-4 animate-spin" />
                    <span className="truncate">Importing...</span>
                  </>
                ) : (
                  <>
                    <Upload className="flex-shrink-0 w-4 h-4" />
                    <span className="truncate">Import</span>
                  </>
                )}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

type ImportByNameDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  form: UseFormReturn<ImageImportFromNameRequest>;
  onSubmit: FormEventHandler<HTMLFormElement>;
  isPending: boolean;
  onCancel: () => void;
};

function ImportByNameDialog({
  open,
  onOpenChange,
  form,
  onSubmit,
  isPending,
  onCancel,
}: ImportByNameDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="mx-4 sm:mx-0 max-w-[calc(100vw-2rem)] sm:max-w-md bg-card text-card-foreground border border-border/50 shadow-lg left-1/2 translate-x-[-50%] rounded-2xl">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold truncate">
            Import Image by Name/Description
          </DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={onSubmit} className="space-y-4">
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Describe the image to import"
                      className="w-full h-10 rounded-full"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="visibility"
              render={({ field }) => (
                <FormItem className="flex justify-between items-center py-2 px-3 rounded-lg border">
                  <div className="space-y-0.5">
                    <FormLabel className="text-sm font-medium">
                      Visibility
                    </FormLabel>
                    <p className="text-xs text-muted-foreground">
                      Toggle to make the image public
                    </p>
                  </div>
                  <FormControl>
                    <Switch
                      className="cursor-pointer"
                      checked={field.value === "public"}
                      onCheckedChange={(c) =>
                        field.onChange(c ? "public" : "private")
                      }
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            <div className="flex flex-col gap-3 justify-end sm:flex-row">
              <Button
                type="button"
                variant="outline"
                className="order-2 w-full rounded-full cursor-pointer sm:order-1 sm:w-auto"
                onClick={onCancel}
                disabled={isPending}
              >
                <span className="truncate">Cancel</span>
              </Button>
              <Button
                type="submit"
                variant="default"
                disabled={isPending}
                className="order-1 gap-2 w-full rounded-full cursor-pointer sm:order-2 sm:w-auto min-w-[140px]"
              >
                {isPending ? (
                  <>
                    <Loader2 className="flex-shrink-0 w-4 h-4 animate-spin" />
                    <span className="truncate">Importing...</span>
                  </>
                ) : (
                  <>
                    <Upload className="flex-shrink-0 w-4 h-4" />
                    <span className="truncate">Import</span>
                  </>
                )}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

type UploadImageDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  form: UseFormReturn<ImageImportFromUploadRequest>;
  onSubmit: FormEventHandler<HTMLFormElement>;
  isPending: boolean;
  onCancel: () => void;
};

function UploadImageDialog({
  open,
  onOpenChange,
  form,
  onSubmit,
  isPending,
  onCancel,
}: UploadImageDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="mx-4 sm:mx-0 max-w-[calc(100vw-2rem)] sm:max-w-md bg-card text-card-foreground border border-border/50 shadow-lg left-1/2 translate-x-[-50%] rounded-2xl">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold truncate">
            Upload Image File
          </DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={onSubmit} className="space-y-4">
            <FormField
              control={form.control}
              name="file"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Image File</FormLabel>
                  <FormControl>
                    <div>
                      <Dropzone
                        src={field.value ? [field.value] : undefined}
                        maxFiles={1}
                        accept={{
                          "application/octet-stream": [
                            ".qcow2",
                            ".raw",
                            ".vmdk",
                            ".vdi",
                            ".img",
                            ".iso",
                          ],
                          "": [
                            ".qcow2",
                            ".raw",
                            ".vmdk",
                            ".vdi",
                            ".img",
                            ".iso",
                          ],
                        }}
                        onDrop={(accepted) => {
                          const file = accepted?.[0];
                          if (!file) return;
                          field.onChange(file);
                        }}
                        className="h-32 cursor-pointer"
                      >
                        <DropzoneEmptyState>
                          <div className="flex flex-col justify-center items-center">
                            <div className="flex justify-center items-center rounded-md size-8 bg-muted text-muted-foreground">
                              <Upload size={16} />
                            </div>
                            <p className="my-2 w-full text-sm font-medium truncate text-wrap">
                              Upload a file
                            </p>
                            <p className="w-full text-xs truncate text-wrap text-muted-foreground">
                              Drag and drop or click to upload
                            </p>
                            <p className="text-xs text-wrap text-muted-foreground">
                              Accepts .qcow2, .raw, .vmdk, .vdi, .img, .iso
                            </p>
                          </div>
                        </DropzoneEmptyState>
                        <DropzoneContent />
                      </Dropzone>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="image_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Image Name</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="My Image"
                      className="w-full h-10 rounded-full"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="visibility"
              render={({ field }) => (
                <FormItem className="flex justify-between items-center py-2 px-3 rounded-lg border">
                  <div className="space-y-0.5">
                    <FormLabel className="text-sm font-medium">
                      Visibility
                    </FormLabel>
                    <p className="text-xs text-muted-foreground">
                      Toggle to make the image public
                    </p>
                  </div>
                  <FormControl>
                    <Switch
                      className="cursor-pointer"
                      checked={field.value === "public"}
                      onCheckedChange={(c) =>
                        field.onChange(c ? "public" : "private")
                      }
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            <div className="flex flex-col gap-3 justify-end sm:flex-row">
              <Button
                type="button"
                variant="outline"
                className="order-2 w-full rounded-full cursor-pointer sm:order-1 sm:w-auto"
                onClick={onCancel}
                disabled={isPending}
              >
                <span className="truncate">Cancel</span>
              </Button>
              <Button
                type="submit"
                variant="default"
                disabled={isPending}
                className="order-1 gap-2 w-full rounded-full cursor-pointer sm:order-2 sm:w-auto min-w-[140px]"
              >
                {isPending ? (
                  <>
                    <Loader2 className="flex-shrink-0 w-4 h-4 animate-spin" />
                    <span className="truncate">Uploading...</span>
                  </>
                ) : (
                  <>
                    <Upload className="flex-shrink-0 w-4 h-4" />
                    <span className="truncate">Upload</span>
                  </>
                )}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

export function Images() {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [visibleCount, setVisibleCount] = useState(6);
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);
  const [isImportByNameOpen, setIsImportByNameOpen] = useState(false);
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  const [isCreateVolumeOpen, setIsCreateVolumeOpen] = useState(false);
  const [createVolumeForImage, setCreateVolumeForImage] = useState<
    ImageDetails | undefined
  >(undefined);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [detailsImage, setDetailsImage] = useState<ImageDetails | undefined>(
    undefined,
  );
  const [imageToDelete, setImageToDelete] = useState<ImageDetails | undefined>(
    undefined,
  );
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  useEffect(() => {
    if (!deleteDialogOpen) {
      setImageToDelete(undefined);
    }
  }, [deleteDialogOpen]);

  const importUrlForm = useForm<ImageImportFromUrlRequest>({
    resolver: zodResolver(ImageImportFromUrlRequestSchema),
    defaultValues: {
      image_url: "",
      image_name: "",
      visibility: "private",
    },
  });

  const importByNameForm = useForm<ImageImportFromNameRequest>({
    resolver: zodResolver(ImageImportFromNameRequestSchema),
    defaultValues: {
      description: "",
      visibility: "private",
    },
  });

  const uploadForm = useForm<ImageImportFromUploadRequest>({
    resolver: zodResolver(ImageImportFromUploadRequestSchema),
    defaultValues: {
      file: undefined as unknown as File,
      image_name: "",
      visibility: "private",
    },
  });

  const createVolumeForm = useForm<ImageCreateVolumeRequest>({
    resolver: zodResolver(ImageCreateVolumeRequestSchema),
    defaultValues: {
      name: "",
      size: 1,
      image_id: "",
      visibility: "private",
      protected: false,
    },
  });

  const {
    data,
    isLoading: loading,
    error,
    refetch: fetchImages,
    isFetching,
  } = useQuery<ImageDetails[]>({
    queryKey: ["images"],
    queryFn: async () => {
      return await ImageService.listImages();
    },
  });

  const imageList: ImageDetails[] = data ?? [];

  const detailsQueries = useQueries({
    queries: imageList.map((img) => ({
      queryKey: ["image", img.id],
      queryFn: () => ImageService.getImageDetails(img.id),
      enabled: imageList.length > 0,
      staleTime: 60_000,
    })),
  });

  const enrichedImages: ImageDetails[] = imageList.map((img, idx) => {
    const q = detailsQueries[idx];
    return q?.data ? { ...img, ...q.data } : img;
  });

  const { data: detailsData, isLoading: detailsLoading } =
    useQuery<ImageDetails>({
      queryKey: ["image-details", detailsImage?.id],
      queryFn: async () => await ImageService.getImageDetails(detailsImage!.id),
      enabled: isDetailsOpen && !!detailsImage?.id,
      staleTime: 60_000,
    });

  const importMutation = useMutation({
    mutationFn: async (formData: ImageImportFromUrlRequest) => {
      return await ImageService.importFromUrl({
        image_url: formData.image_url,
        image_name: formData.image_name,
        visibility: formData.visibility,
      });
    },
    onSuccess: async () => {
      importUrlForm.reset({
        image_url: "",
        image_name: "",
        visibility: "private",
      });
      setIsImportDialogOpen(false);
      await queryClient.invalidateQueries({ queryKey: ["images"] });
    },
    onError: (err: unknown) => {
      const message =
        err instanceof Error
          ? err.message
          : typeof err === "string"
            ? err
            : "An unexpected error occurred";
      toast.error(message);
    },
  });

  const handleImportImage = importUrlForm.handleSubmit((values) => {
    importMutation.mutate(values);
  });

  const importByNameMutation = useMutation({
    mutationFn: async (formData: ImageImportFromNameRequest) => {
      return await ImageService.importFromName(formData);
    },
    onSuccess: async () => {
      importByNameForm.reset({ description: "", visibility: "private" });
      setIsImportByNameOpen(false);
      await queryClient.invalidateQueries({ queryKey: ["images"] });
    },
    onError: (err: unknown) => {
      const message =
        err instanceof Error
          ? err.message
          : typeof err === "string"
            ? err
            : "An unexpected error occurred";
      toast.error(message);
    },
  });

  const handleImportByName = importByNameForm.handleSubmit((values) => {
    importByNameMutation.mutate(values);
  });

  const uploadMutation = useMutation({
    mutationFn: async (formData: ImageImportFromUploadRequest) => {
      return await ImageService.importFromUpload(formData);
    },
    onSuccess: async () => {
      uploadForm.reset({
        file: undefined as unknown as File,
        image_name: "",
        visibility: "private",
      });
      setIsUploadDialogOpen(false);
      await queryClient.invalidateQueries({ queryKey: ["images"] });
    },
    onError: (err: unknown) => {
      const message =
        err instanceof Error
          ? err.message
          : typeof err === "string"
            ? err
            : "An unexpected error occurred";
      toast.error(message);
    },
  });

  const handleUploadImage = uploadForm.handleSubmit((values) => {
    uploadMutation.mutate(values);
  });

  const createVolumeMutation = useMutation({
    mutationFn: async (formData: ImageCreateVolumeRequest) => {
      return await ImageService.createVolume(formData);
    },
    onSuccess: async () => {
      createVolumeForm.reset({
        name: "",
        size: 1,
        image_id: "",
        visibility: "private",
        protected: false,
      });
      setIsCreateVolumeOpen(false);
      toast.success("Volume creation requested");
    },
    onError: (err: unknown) => {
      const message =
        err instanceof Error
          ? err.message
          : typeof err === "string"
            ? err
            : "An unexpected error occurred";
      toast.error(message);
    },
  });

  const handleCreateVolume = createVolumeForm.handleSubmit((values) => {
    createVolumeMutation.mutate(values);
  });

  const filteredImages = enrichedImages.filter((image) => {
    const q = searchTerm.trim().toLowerCase();
    if (!q) return true;
    const fields = [image.name, image.status, image.visibility]
      .filter(Boolean)
      .map((v) => String(v).toLowerCase());
    return fields.some((f) => f.includes(q));
  });

  // Reset pagination when search changes
  useEffect(() => {
    setVisibleCount(6);
  }, [searchTerm]);

  const deleteMutation = useMutation({
    mutationFn: async (imageId: string) => {
      return await ImageService.deleteImage({ image_id: imageId });
    },
    onSuccess: async () => {
      toast.success("Image deleted successfully");
      await queryClient.invalidateQueries({ queryKey: ["images"] });
      setDeleteDialogOpen(false);
    },
    onError: (err: unknown) => {
      const message =
        err instanceof Error
          ? err.message
          : typeof err === "string"
            ? err
            : "An unexpected error occurred";
      toast.error(message);
    },
  });

  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editImageId, setEditImageId] = useState<string | undefined>(undefined);

  const editForm = useForm<ImageUpdateRequest>({
    resolver: zodResolver(ImageUpdateRequestSchema),
    defaultValues: {
      name: "",
      visibility: "private",
      protected: false,
      tags: [],
    },
  });

  const editMutation = useMutation({
    mutationFn: async (vars: { imageId: string; data: ImageUpdateRequest }) => {
      return await ImageService.updateImage(vars.imageId, vars.data);
    },
    onSuccess: async () => {
      toast.success("Image updated successfully");
      setIsEditDialogOpen(false);
      setEditImageId(undefined);
      await queryClient.invalidateQueries({ queryKey: ["images"] });
    },
    onError: (err: unknown) => {
      const message =
        err instanceof Error
          ? err.message
          : typeof err === "string"
            ? err
            : "An unexpected error occurred";
      toast.error(message);
    },
  });
  const handleEditImage = (image: ImageDetails) => {
    setEditImageId(image.id);
    editForm.reset({
      name: image.name,
      visibility: image.visibility,
      protected: !!image.protected,
    });
    setIsEditDialogOpen(true);
  };

  const handleEditImageSubmit = editForm.handleSubmit((values) => {
    if (!editImageId) return;
    editMutation.mutate({ imageId: editImageId, data: values });
  });

  const totalItems = filteredImages.length;
  const visibleData = filteredImages.slice(0, visibleCount);
  const hasMore = visibleCount < totalItems;

  const handleShowMore = () => {
    setVisibleCount((prev) => prev + 6);
  };

  useEffect(() => {
    setVisibleCount(6);
  }, [searchTerm]);

  if (loading) {
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
          <Table className="w-full table-fixed">
            <TableHeader>
              <TableRow>
                <TableHead className="py-3 w-12">Icon</TableHead>
                <TableHead className="py-3 w-1/5">Name</TableHead>
                <TableHead className="py-3 w-1/5">Status</TableHead>
                <TableHead className="py-3 w-1/5">Visibility</TableHead>
                <TableHead className="py-3 w-1/5">Protected</TableHead>
                <TableHead className="py-3 w-1/5">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {Array.from({ length: 6 }).map((_, idx) => (
                <TableRow key={idx}>
                  <TableCell className="py-3">
                    <Skeleton className="w-8 h-8 rounded-full" />
                  </TableCell>
                  <TableCell className="py-3 w-1/5">
                    <Skeleton className="w-24 h-4" />
                  </TableCell>
                  <TableCell className="py-3 w-1/5">
                    <Skeleton className="w-16 h-4" />
                  </TableCell>
                  <TableCell className="py-3 w-1/5">
                    <Skeleton className="w-16 h-4" />
                  </TableCell>
                  <TableCell className="py-3 w-1/5">
                    <Skeleton className="w-10 h-4" />
                  </TableCell>
                  <TableCell className="py-3 w-1/5">
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
          form={importUrlForm}
          onSubmit={handleImportImage}
          isPending={importMutation.isPending}
          onCancel={() => setIsImportDialogOpen(false)}
        />

        <ImportByNameDialog
          open={isImportByNameOpen}
          onOpenChange={setIsImportByNameOpen}
          form={importByNameForm}
          onSubmit={handleImportByName}
          isPending={importByNameMutation.isPending}
          onCancel={() => setIsImportByNameOpen(false)}
        />

        <UploadImageDialog
          open={isUploadDialogOpen}
          onOpenChange={setIsUploadDialogOpen}
          form={uploadForm}
          onSubmit={handleUploadImage}
          isPending={uploadMutation.isPending}
          onCancel={() => setIsUploadDialogOpen(false)}
        />
      </>
    );
  }

  return (
    <div className="px-2 space-y-6 sm:px-0">
      <div className="flex flex-col gap-2 sm:flex-row sm:gap-0 sm:justify-between sm:items-center">
        <div className="text-sm leading-relaxed text-muted-foreground">
          {totalItems} image{totalItems !== 1 ? "s" : ""} total
          {totalItems > 0 && (
            <>
              {" • "}
              Showing {Math.min(visibleCount, totalItems)} of {totalItems}
            </>
          )}
        </div>
        <div className="flex flex-wrap gap-2 self-end ml-auto sm:flex-nowrap sm:self-auto">
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

          <ImportFromUrlDialog
            open={isImportDialogOpen}
            onOpenChange={setIsImportDialogOpen}
            form={importUrlForm}
            onSubmit={handleImportImage}
            isPending={importMutation.isPending}
            onCancel={() => setIsImportDialogOpen(false)}
          />

          <ImportByNameDialog
            open={isImportByNameOpen}
            onOpenChange={setIsImportByNameOpen}
            form={importByNameForm}
            onSubmit={handleImportByName}
            isPending={importByNameMutation.isPending}
            onCancel={() => setIsImportByNameOpen(false)}
          />

          <UploadImageDialog
            open={isUploadDialogOpen}
            onOpenChange={setIsUploadDialogOpen}
            form={uploadForm}
            onSubmit={handleUploadImage}
            isPending={uploadMutation.isPending}
            onCancel={() => setIsUploadDialogOpen(false)}
          />
        </div>
      </div>

      <div className="flex flex-col gap-4 items-stretch sm:flex-row sm:justify-between sm:items-center">
        <div className="flex-1 max-w-full sm:max-w-md">
          <XSearch
            value={searchTerm}
            onChange={setSearchTerm}
            placeholder="Search images..."
            aria-label="Search images"
          />
        </div>
        <div className="flex flex-wrap gap-2 self-end ml-auto sm:flex-nowrap sm:self-auto"></div>
      </div>

      <Dialog
        open={isCreateVolumeOpen}
        onOpenChange={(open) => {
          setIsCreateVolumeOpen(open);
          if (!open) return;
          if (createVolumeForImage) {
            createVolumeForm.reset({
              name: `${createVolumeForImage.name}-volume`,
              size:
                Math.max(
                  1,
                  Math.round(
                    Number(createVolumeForImage.size ?? 1) / 1024 ** 3,
                  ),
                ) || 1,
              image_id: createVolumeForImage.id,
              visibility: "private",
              protected: false,
            });
          }
        }}
      >
        <DialogContent className="mx-4 sm:mx-0 max-w-[calc(100vw-2rem)] sm:max-w-md bg-card text-card-foreground border border-border/50 shadow-lg left-1/2 translate-x-[-50%] rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold truncate">
              Create Volume
            </DialogTitle>
          </DialogHeader>
          {createVolumeForImage && (
            <div className="mb-2 text-sm text-muted-foreground">
              From image:{" "}
              <span className="font-medium text-foreground">
                {createVolumeForImage.name}
              </span>
            </div>
          )}
          <Form {...createVolumeForm}>
            <form onSubmit={handleCreateVolume} className="space-y-4">
              <FormField
                control={createVolumeForm.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Volume Name</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="My Volume"
                        className="w-full h-10 rounded-full"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={createVolumeForm.control}
                name="size"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Size (GB)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min={1}
                        className="w-full h-10 rounded-full"
                        value={field.value}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={createVolumeForm.control}
                name="volume_type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Volume Type (optional)</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g. fast-ssd"
                        className="w-full h-10 rounded-full"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={createVolumeForm.control}
                name="visibility"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Visibility</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger className="w-full h-10 rounded-full cursor-pointer">
                          <SelectValue placeholder="Select visibility" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="private">private</SelectItem>
                        <SelectItem value="public">public</SelectItem>
                        <SelectItem value="shared">shared</SelectItem>
                        <SelectItem value="community">community</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={createVolumeForm.control}
                name="protected"
                render={({ field }) => (
                  <FormItem className="flex justify-between items-center py-2 px-3 rounded-lg border">
                    <div className="space-y-0.5">
                      <FormLabel className="text-sm font-medium">
                        Protected
                      </FormLabel>
                      <p className="text-xs text-muted-foreground">
                        Prevent deletion of the created volume
                      </p>
                    </div>
                    <FormControl>
                      <Switch
                        className="cursor-pointer"
                        checked={!!field.value}
                        onCheckedChange={(c) => field.onChange(c)}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              <div className="flex flex-col gap-3 justify-end sm:flex-row">
                <Button
                  type="button"
                  variant="outline"
                  className="order-2 w-full rounded-full cursor-pointer sm:order-1 sm:w-auto"
                  onClick={() => setIsCreateVolumeOpen(false)}
                  disabled={createVolumeMutation.isPending}
                >
                  <span className="truncate">Cancel</span>
                </Button>
                <Button
                  type="submit"
                  variant="default"
                  disabled={createVolumeMutation.isPending}
                  className="order-1 gap-2 w-full rounded-full cursor-pointer sm:order-2 sm:w-auto min-w-[140px]"
                >
                  {createVolumeMutation.isPending ? "Creating..." : "Create"}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <Dialog
        open={isEditDialogOpen}
        onOpenChange={(open) => {
          setIsEditDialogOpen(open);
          if (!open) return;
        }}
      >
        <DialogContent className="mx-4 sm:mx-0 max-w-[calc(100vw-2rem)] sm:max-w-md bg-card text-card-foreground border border-border/50 shadow-lg left-1/2 translate-x-[-50%] rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold truncate">
              Edit Image
            </DialogTitle>
          </DialogHeader>
          <Form {...editForm}>
            <form onSubmit={handleEditImageSubmit} className="space-y-4">
              <FormField
                control={editForm.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="My Image"
                        className="w-full h-10 rounded-full"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={editForm.control}
                name="visibility"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Visibility</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger className="w-full h-10 rounded-full cursor-pointer">
                          <SelectValue placeholder="Select visibility" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="private">private</SelectItem>
                        <SelectItem value="public">public</SelectItem>
                        <SelectItem value="shared">shared</SelectItem>
                        <SelectItem value="community">community</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={editForm.control}
                name="protected"
                render={({ field }) => (
                  <FormItem className="flex justify-between items-center py-2 px-3 rounded-lg border">
                    <div className="space-y-0.5">
                      <FormLabel className="text-sm font-medium">
                        Protected
                      </FormLabel>
                      <p className="text-xs text-muted-foreground">
                        Prevent deletion of this image
                      </p>
                    </div>
                    <FormControl>
                      <Switch
                        className="cursor-pointer"
                        checked={!!field.value}
                        onCheckedChange={(c) => field.onChange(c)}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              <div className="flex flex-col gap-3 justify-end sm:flex-row">
                <Button
                  type="button"
                  variant="outline"
                  className="order-2 w-full rounded-full cursor-pointer sm:order-1 sm:w-auto"
                  onClick={() => setIsEditDialogOpen(false)}
                  disabled={editMutation.isPending}
                >
                  <span className="truncate">Cancel</span>
                </Button>
                <Button
                  type="submit"
                  variant="default"
                  disabled={editMutation.isPending || !editImageId}
                  className="order-1 gap-2 w-full rounded-full cursor-pointer sm:order-2 sm:w-auto min-w-[140px]"
                >
                  {editMutation.isPending ? (
                    <>
                      <Loader2 className="flex-shrink-0 w-4 h-4 animate-spin" />
                      <span className="truncate">Saving...</span>
                    </>
                  ) : (
                    <span className="truncate">Save</span>
                  )}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <ConfirmDeleteDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Delete Image"
        description={
          <>
            Are you sure you want to delete this image{" "}
            <span className="font-semibold text-foreground">
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
      {totalItems === 0 ? (
        <div className="flex justify-center items-center p-8 text-center rounded-2xl border text-muted-foreground min-h-32">
          No images match your search.
        </div>
      ) : (
        <>
          <div className="overflow-x-auto w-full">
            <Table className="w-full table-fixed">
              <TableHeader>
                <TableRow>
                  <TableHead className="py-3 w-12">Icon</TableHead>
                  <TableHead className="py-3 w-1/5">Name</TableHead>
                  <TableHead className="py-3 w-1/5">Status</TableHead>
                  <TableHead className="py-3 w-1/5">Visibility</TableHead>
                  <TableHead className="py-3 w-1/5">Protected</TableHead>
                  <TableHead className="py-3 w-1/5">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {visibleData.map((image) => (
                  <TableRow key={image.id}>
                    <TableCell className="py-3">
                      <GetDistroIcon imageName={image.name} />
                    </TableCell>
                    <TableCell className="py-3 w-1/5 align-middle">
                      <button
                        type="button"
                        className="inline-flex items-center max-w-full font-medium text-left underline cursor-pointer underline-offset-2 decoration-muted-foreground/50 truncate hover:decoration-current"
                        onClick={() => {
                          setDetailsImage(image);
                          setIsDetailsOpen(true);
                        }}
                        title={image.name}
                      >
                        <span className="truncate">{image.name}</span>
                      </button>
                    </TableCell>
                    <TableCell className="py-3 w-1/5">
                      <Badge variant="secondary" className="py-0 px-2 text-xs">
                        {image.status ?? "unknown"}
                      </Badge>
                    </TableCell>

                    <TableCell className="py-3 w-1/5">
                      <Badge variant="outline">{image.visibility}</Badge>
                    </TableCell>
                    <TableCell className="py-3 w-1/5">
                      {image.protected ? (
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <span className="inline-flex gap-1 items-center">
                              <ShieldCheck className="w-4 h-4 text-green-600" />
                              <span className="text-xs">Protected</span>
                            </span>
                          </TooltipTrigger>
                          <TooltipContent>Protected</TooltipContent>
                        </Tooltip>
                      ) : (
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <span className="inline-flex gap-1 items-center">
                              <ShieldOff className="w-4 h-4 text-muted-foreground" />
                              <span className="text-xs">Not protected</span>
                            </span>
                          </TooltipTrigger>
                          <TooltipContent>Not protected</TooltipContent>
                        </Tooltip>
                      )}
                    </TableCell>
                    <TableCell className="py-3 space-x-2 w-1/5">
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="outline"
                            size="icon"
                            className="rounded-full cursor-pointer"
                            onClick={() => {
                              setCreateVolumeForImage(image);
                              setIsCreateVolumeOpen(true);
                            }}
                          >
                            <HardDrive className="w-4 h-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Create Volume</TooltipContent>
                      </Tooltip>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="outline"
                            size="icon"
                            className="rounded-full cursor-pointer"
                            onClick={() => handleEditImage(image)}
                          >
                            <Edit2 className="w-4 h-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Edit</TooltipContent>
                      </Tooltip>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="destructive"
                            size="icon"
                            className="text-white rounded-full cursor-pointer"
                            onClick={() => {
                              setImageToDelete(image);
                              setDeleteDialogOpen(true);
                            }}
                            disabled={
                              deleteMutation.isPending || !!image.protected
                            }
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          {image.protected
                            ? "Cannot delete protected image"
                            : "Delete"}
                        </TooltipContent>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
            <DialogContent className="sm:max-w-3xl">
              <DialogHeader>
                <div className="flex gap-4 items-start">
                  {detailsImage?.name && (
                    <div className="p-2 rounded-md border shrink-0 bg-muted/40">
                      <GetDistroIcon imageName={detailsImage.name} />
                    </div>
                  )}
                  <div className="flex-1">
                    <DialogTitle className="text-lg sm:text-xl">
                      {detailsImage?.name ?? "Image details"}
                    </DialogTitle>
                    <div className="flex flex-wrap gap-2 items-center mt-2 text-sm">
                      <Badge variant="secondary" className="py-0 px-2 text-xs">
                        {detailsData?.status ??
                          detailsImage?.status ??
                          "unknown"}
                      </Badge>
                      <Badge variant="outline" className="py-0 px-2 text-xs">
                        {detailsData?.visibility ??
                          detailsImage?.visibility ??
                          "-"}
                      </Badge>
                      {(detailsData?.protected ?? detailsImage?.protected) ? (
                        <Badge className="py-0 px-2 text-xs">Protected</Badge>
                      ) : (
                        <Badge variant="outline" className="py-0 px-2 text-xs">
                          Not protected
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              </DialogHeader>

              {detailsLoading ? (
                <div className="space-y-3">
                  <Skeleton className="w-44 h-4" />
                  <Skeleton className="w-64 h-4" />
                  <Skeleton className="w-56 h-4" />
                </div>
              ) : (
                <div className="space-y-6 text-base">
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <Card className="rounded-lg shadow-none border-muted/60">
                      <CardContent className="p-5">
                        <div className="text-sm text-muted-foreground">
                          Size
                        </div>
                        <div className="flex items-center mt-1 font-medium">
                          <Box className="mr-2 w-5 h-5" />
                          {detailsData?.size != undefined
                            ? `${Math.max(1, Math.round(Number(detailsData.size) / 1024 ** 3))} GB`
                            : "-"}
                        </div>
                      </CardContent>
                    </Card>
                    <Card className="rounded-lg shadow-none border-muted/60">
                      <CardContent className="p-5">
                        <div className="text-sm text-muted-foreground">
                          Disk format
                        </div>
                        <div className="flex items-center mt-1 font-medium">
                          <Disc className="mr-2 w-5 h-5" />
                          {detailsData?.disk_format ?? "-"}
                        </div>
                      </CardContent>
                    </Card>
                    <Card className="rounded-lg shadow-none border-muted/60">
                      <CardContent className="p-5">
                        <div className="text-sm text-muted-foreground">
                          Container format
                        </div>
                        <div className="flex items-center mt-1 font-medium">
                          <Box className="mr-2 w-5 h-5" />
                          {detailsData?.container_format ?? "-"}
                        </div>
                      </CardContent>
                    </Card>
                    <Card className="rounded-lg shadow-none border-muted/60">
                      <CardContent className="p-5">
                        <div className="flex gap-2 items-center text-sm text-muted-foreground">
                          <HardDrive className="w-5 h-5" /> Status
                        </div>
                        <div className="mt-2 font-medium">
                          {detailsData?.status ?? detailsImage?.status ?? "-"}
                        </div>
                      </CardContent>
                    </Card>
                    <Card className="rounded-lg shadow-none border-muted/60">
                      <CardContent className="p-5">
                        <div className="flex gap-2 items-center text-sm text-muted-foreground">
                          {(detailsData?.visibility ??
                            detailsImage?.visibility) === "public" ? (
                            <Eye className="w-5 h-5" />
                          ) : (
                            <EyeOff className="w-5 h-5" />
                          )}
                          Visibility
                        </div>
                        <div className="mt-2 font-medium">
                          {detailsData?.visibility ??
                            detailsImage?.visibility ??
                            "-"}
                        </div>
                      </CardContent>
                    </Card>
                    <Card className="rounded-lg shadow-none border-muted/60">
                      <CardContent className="p-5">
                        <div className="flex gap-2 items-center text-sm text-muted-foreground">
                          {(detailsData?.protected ??
                          detailsImage?.protected) ? (
                            <ShieldCheck className="w-5 h-5" />
                          ) : (
                            <ShieldOff className="w-5 h-5" />
                          )}
                          Protected
                        </div>
                        <div className="mt-2 font-medium">
                          {(detailsData?.protected ?? detailsImage?.protected)
                            ? "Yes"
                            : "No"}
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              )}
            </DialogContent>
          </Dialog>

          <div className="flex justify-center px-4 sm:px-0">
            <Button
              onClick={handleShowMore}
              variant="outline"
              disabled={!hasMore}
              className={cn(
                "rounded-full px-4 sm:px-6 py-2 w-full sm:w-auto max-w-xs bg-background text-foreground border-border/50",
                !hasMore ? "opacity-50 cursor-not-allowed" : "cursor-pointer",
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
    </div>
  );
}
