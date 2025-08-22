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
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { VolumeService } from "@/lib/requests";
import type {
  VolumeTypeCreateRequest,
  VolumeTypeUpdateRequest,
} from "@/types/RequestInterfaces";
import {
  VolumeTypeCreateRequestSchema,
  VolumeTypeUpdateRequestSchema,
} from "@/types/RequestSchemas";
import type { VolumeType } from "@/types/ResponseInterfaces";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Edit, HardDrive, Plus, RefreshCw, Trash2 } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { type z } from "zod";

interface BaseFormProps<T> {
  onSubmit: (data: T) => void;
  initial?: Partial<T>;
  submitLabel?: string;
  loading?: boolean;
  onCancel?: () => void;
}

function VolumeTypeCreateForm({
  onSubmit,
  initial,
  submitLabel,
  loading,
  onCancel,
}: BaseFormProps<VolumeTypeCreateRequest>) {
  const form = useForm<z.infer<typeof VolumeTypeCreateRequestSchema>>({
    resolver: zodResolver(VolumeTypeCreateRequestSchema),
    defaultValues: {
      name: initial?.name ?? "",
      description: initial?.description ?? "",
      is_public: initial?.is_public ?? true,
    },
  });

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex flex-col gap-4"
      >
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input
                  placeholder="Volume type name"
                  {...field}
                  disabled={loading}
                  className="rounded-full"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description (optional)</FormLabel>
              <FormControl>
                <Input
                  placeholder="Volume type description"
                  {...field}
                  disabled={loading}
                  className="rounded-full"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="is_public"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Visibility</FormLabel>
              <FormControl>
                <Select
                  value={field.value ? "public" : "private"}
                  onValueChange={(val) => field.onChange(val === "public")}
                  disabled={loading}
                >
                  <SelectTrigger className="w-full rounded-full cursor-pointer">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="public">Public</SelectItem>
                    <SelectItem value="private">Private</SelectItem>
                  </SelectContent>
                </Select>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex gap-2 justify-end mt-4">
          {onCancel && (
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={loading}
              className="rounded-full cursor-pointer"
            >
              Cancel
            </Button>
          )}
          <Button
            type="submit"
            disabled={loading}
            className="rounded-full cursor-pointer"
          >
            {loading ? (
              <>
                <RefreshCw className="mr-2 w-4 h-4 animate-spin" />
                Saving...
              </>
            ) : (
              (submitLabel ?? "Create")
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}

function VolumeTypeUpdateForm({
  onSubmit,
  initial,
  submitLabel,
  loading,
  onCancel,
}: BaseFormProps<VolumeTypeUpdateRequest>) {
  const form = useForm<z.infer<typeof VolumeTypeUpdateRequestSchema>>({
    resolver: zodResolver(VolumeTypeUpdateRequestSchema),
    defaultValues: {
      volume_type_id: initial?.volume_type_id ?? "",
      name: initial?.name ?? "",
      description: initial?.description ?? "",
    },
  });

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex flex-col gap-4"
      >
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input
                  placeholder="Volume type name"
                  {...field}
                  disabled={loading}
                  className="rounded-full"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description (optional)</FormLabel>
              <FormControl>
                <Input
                  placeholder="Volume type description"
                  {...field}
                  disabled={loading}
                  className="rounded-full"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        {/* Hidden field to satisfy schema and submit the ID */}
        <input type="hidden" {...form.register("volume_type_id")} />
        <div className="flex gap-2 justify-end mt-4">
          {onCancel && (
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={loading}
              className="rounded-full cursor-pointer"
            >
              Cancel
            </Button>
          )}
          <Button
            type="submit"
            disabled={loading}
            className="rounded-full cursor-pointer"
          >
            {loading ? (
              <>
                <RefreshCw className="mr-2 w-4 h-4 animate-spin" />
                Saving...
              </>
            ) : (
              (submitLabel ?? "Update")
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}

export function VolumeTypes() {
  const queryClient = useQueryClient();
  const [viewMode, setViewMode] = useState<"list" | "edit" | "create">("list");
  const [editingType, setEditingType] = useState<VolumeType | undefined>();
  const [showDelete, setShowDelete] = useState(false);
  const [typeToDelete, setTypeToDelete] = useState<VolumeType | undefined>();
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [selectedType, setSelectedType] = useState<VolumeType | undefined>();

  const {
    data: volumeTypes,
    isLoading,
    isFetching,
    error,
    refetch,
  } = useQuery<VolumeType[]>({
    queryKey: ["volume-types", "list"],
    queryFn: async () => {
      return await VolumeService.listVolumeTypes();
    },
    refetchInterval: 30000,
    staleTime: 15000,
  });

  const createMutation = useMutation({
    mutationFn: async (data: VolumeTypeCreateRequest) =>
      VolumeService.createVolumeType({
        name: data.name,
        description: data.description,
        is_public: data.is_public,
      }),
    onSuccess: async () => {
      toast.success("Volume type created successfully");
      setViewMode("list");
      await queryClient.invalidateQueries({
        queryKey: ["volume-types", "list"],
      });
    },
    onError: (err: Error) => {
      toast.error(err.message || "Failed to create volume type");
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (data: VolumeTypeUpdateRequest) =>
      VolumeService.updateVolumeType({
        volume_type_id: data.volume_type_id,
        name: data.name,
        description: data.description,
      }),
    onSuccess: async () => {
      toast.success("Volume type updated successfully");
      setViewMode("list");
      setEditingType(undefined);
      await queryClient.invalidateQueries({
        queryKey: ["volume-types", "list"],
      });
    },
    onError: (err: Error) => {
      toast.error(err.message || "Failed to update volume type");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => VolumeService.deleteVolumeType(id),
    onSuccess: async () => {
      toast.success("Volume type deleted successfully");
      setShowDelete(false);
      setTypeToDelete(undefined);
      await queryClient.invalidateQueries({
        queryKey: ["volume-types", "list"],
      });
    },
    onError: (err: Error) => {
      toast.error(err.message || "Failed to delete volume type");
    },
  });

  const filteredTypes = volumeTypes ?? [];
  const totalItems = filteredTypes.length;
  const visibleCount = totalItems;

  if (isLoading) {
    return (
      <div className="space-y-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:justify-between sm:items-center">
          <div className="text-sm text-muted-foreground">
            <Skeleton className="w-40 h-4 rounded-full" />
          </div>
          <div className="flex gap-3">
            <Skeleton className="w-9 h-9 rounded-full" />
            <Skeleton className="w-40 h-9 rounded-full" />
          </div>
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card
              key={i}
              className="flex flex-col rounded-2xl border shadow-sm transition-shadow hover:shadow-md"
            >
              <CardHeader className="pb-4">
                <div className="flex gap-4 items-center">
                  <Skeleton className="w-12 h-12 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="w-32 h-6 rounded-full" />
                    <Skeleton className="w-24 h-4 rounded-full" />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex gap-2 justify-end">
                  <Skeleton className="w-9 h-9 rounded-full" />
                  <Skeleton className="w-9 h-9 rounded-full" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <ErrorCard
        title="Failed to Load Volume Types"
        message={error instanceof Error ? error.message : String(error)}
        onRetry={() => refetch()}
        isRetrying={isFetching}
      />
    );
  }

  return (
    <div className="space-y-8">
      <div className="space-y-4">
        <div className="flex flex-col gap-2 sm:flex-row sm:gap-0 sm:justify-between sm:items-center">
          <div className="text-sm leading-relaxed text-muted-foreground">
            {totalItems} volume type{totalItems !== 1 ? "s" : ""} total
            {totalItems > 0 && (
              <>
                {" • "}
                Showing {Math.min(visibleCount, totalItems)} of {totalItems}
              </>
            )}
          </div>
          <div className="flex gap-3">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => refetch()}
                  disabled={isFetching}
                  className="p-0 w-9 h-9 rounded-full border transition-all duration-200 cursor-pointer bg-card text-card-foreground border-border/50"
                >
                  <RefreshCw
                    className={[
                      "h-4 w-4 transition-transform duration-200",
                      isFetching ? "animate-spin" : "",
                    ].join(" ")}
                  />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Refresh volume types</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  size="sm"
                  onClick={() => setViewMode("create")}
                  className="gap-2 px-4 font-semibold rounded-full shadow-md transition-all duration-300 cursor-pointer bg-primary text-primary-foreground"
                >
                  <Plus className="w-4 h-4" />
                  <span className="hidden sm:inline">New Volume Type</span>
                  <span className="sm:hidden">New</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>Add a new volume type</TooltipContent>
            </Tooltip>
          </div>
        </div>
      </div>

      {totalItems === 0 ? (
        <div className="flex flex-col justify-center items-center py-16 text-center rounded-2xl border">
          <div className="flex justify-center items-center mb-6 w-16 h-16 rounded-full bg-primary/10">
            <HardDrive className="w-8 h-8 text-primary" />
          </div>
          <h3 className="mb-2 text-xl font-bold text-foreground">
            No volume types found
          </h3>
          <p className="mb-8 max-w-md text-muted-foreground">
            Get started by creating your first volume type. Volume types let you
            define different storage backends and options for your cloud
            infrastructure.
          </p>
          <Button
            onClick={() => setViewMode("create")}
            className="gap-2 rounded-full cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Create Volume Type
          </Button>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredTypes.map((vt) => (
            <Card
              key={vt.ID}
              className="flex flex-col rounded-2xl border shadow-sm transition-shadow cursor-pointer hover:shadow-md"
              onClick={() => {
                setSelectedType(vt);
                setDetailsDialogOpen(true);
              }}
            >
              <CardHeader className="pb-4">
                <div className="flex gap-4 items-center">
                  <div className="flex justify-center items-center w-12 h-12 rounded-full bg-primary/10">
                    <HardDrive className="w-6 h-6 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex gap-2 justify-between items-center">
                      <CardTitle className="text-lg font-semibold truncate">
                        {vt.Name}
                      </CardTitle>
                      <div className="flex gap-2">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              size="icon"
                              variant="outline"
                              className="rounded-full cursor-pointer"
                              onClick={(e) => {
                                e.stopPropagation();
                                setEditingType(vt);
                                setViewMode("edit");
                              }}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Edit volume type</TooltipContent>
                        </Tooltip>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              size="icon"
                              variant="destructive"
                              className="text-white rounded-full cursor-pointer"
                              onClick={(e) => {
                                e.stopPropagation();
                                setTypeToDelete(vt);
                                setShowDelete(true);
                              }}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Delete volume type</TooltipContent>
                        </Tooltip>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground truncate">
                      {vt.Description || "No description"}
                    </p>
                  </div>
                </div>
              </CardHeader>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={detailsDialogOpen} onOpenChange={setDetailsDialogOpen}>
        <DialogContent className="rounded-2xl sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex gap-2 items-center">
              <HardDrive className="w-5 h-5" />
              Volume Type Details
            </DialogTitle>
          </DialogHeader>
          {selectedType && (
            <div className="py-4 space-y-6">
              <div className="flex gap-4 items-center">
                <div className="flex justify-center items-center w-12 h-12 rounded-full bg-primary/10">
                  <HardDrive className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <div className="text-lg font-semibold">
                    {selectedType.Name}
                  </div>
                  <div className="font-mono text-sm text-muted-foreground">
                    {selectedType.ID}
                  </div>
                </div>
              </div>
              <div className="grid gap-4">
                <div>
                  <h4 className="mb-1 font-medium">Description</h4>
                  <p className="text-muted-foreground">
                    {selectedType.Description || "No description provided"}
                  </p>
                </div>
                <div>
                  <h4 className="mb-1 font-medium">Visibility</h4>
                  <p className="text-muted-foreground">
                    {selectedType.Is_Public ? "Public" : "Private"}
                  </p>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog
        open={viewMode === "edit" && !!editingType}
        onOpenChange={(open) => {
          if (!open) {
            setViewMode("list");
            setEditingType(undefined);
          }
        }}
      >
        <DialogContent className="rounded-2xl sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Volume Type</DialogTitle>
          </DialogHeader>
          <VolumeTypeUpdateForm
            initial={
              editingType
                ? {
                    volume_type_id: editingType.ID,
                    name: editingType.Name,
                    description: editingType.Description,
                  }
                : undefined
            }
            submitLabel="Update"
            loading={updateMutation.isPending}
            onSubmit={(data) => updateMutation.mutate(data)}
            onCancel={() => {
              setViewMode("list");
              setEditingType(undefined);
            }}
          />
        </DialogContent>
      </Dialog>

      <Dialog
        open={viewMode === "create"}
        onOpenChange={(open) => {
          if (!open) setViewMode("list");
        }}
      >
        <DialogContent className="rounded-2xl sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Create New Volume Type</DialogTitle>
          </DialogHeader>
          <VolumeTypeCreateForm
            onSubmit={createMutation.mutate}
            submitLabel="Create"
            loading={createMutation.isPending}
            onCancel={() => setViewMode("list")}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={showDelete} onOpenChange={setShowDelete}>
        <DialogContent className="rounded-2xl sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex gap-2 items-center text-destructive">
              <Trash2 className="w-5 h-5" />
              Delete Volume Type
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to delete{" "}
              <span className="font-semibold">{typeToDelete?.Name}</span>? This
              action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex-col gap-2 sm:flex-row">
            <Button
              variant="outline"
              onClick={() => setShowDelete(false)}
              disabled={deleteMutation.isPending}
              className="flex-1 rounded-full cursor-pointer"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() =>
                typeToDelete && deleteMutation.mutate(typeToDelete.ID)
              }
              disabled={deleteMutation.isPending}
              className="flex-1 gap-2 rounded-full cursor-pointer"
            >
              {deleteMutation.isPending ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 className="w-4 h-4" />
                  Delete
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
