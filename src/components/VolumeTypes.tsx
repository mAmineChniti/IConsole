"use client";

import { ConfirmDeleteDialog } from "@/components/ConfirmDeleteDialog";
import { EmptyState } from "@/components/EmptyState";
import { ErrorCard } from "@/components/ErrorCard";
import { HeaderActions } from "@/components/HeaderActions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
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
import { VolumeTypeCreateDialog } from "@/components/VolumeTypeCreateDialog";
import { VolumeService } from "@/lib/requests";
import type { VolumeTypeUpdateRequest } from "@/types/RequestInterfaces";
import { VolumeTypeUpdateRequestSchema } from "@/types/RequestSchemas";
import type { VolumeType } from "@/types/ResponseInterfaces";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Edit,
  Eye,
  HardDrive,
  Lock,
  RefreshCw,
  Search,
  Trash2,
} from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

interface BaseFormProps<T> {
  onSubmit: (data: T) => void;
  initial?: Partial<T>;
  submitLabel?: string;
  loading?: boolean;
  onCancel?: () => void;
}

function VolumeTypeUpdateForm({
  onSubmit,
  initial,
  submitLabel,
  loading,
  onCancel,
}: BaseFormProps<VolumeTypeUpdateRequest>) {
  const form = useForm<VolumeTypeUpdateRequest>({
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
                  className="h-10 rounded-full"
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
                  className="h-10 rounded-full"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Input type="hidden" {...form.register("volume_type_id")} />
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

  const [search, setSearch] = useState("");

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

  // creation handled inside VolumeTypeCreateDialog

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

  const filteredTypes = (volumeTypes ?? []).filter((vt) => {
    const q = search.trim().toLowerCase();
    if (!q) return true;
    const name = vt.Name?.toLowerCase() ?? "";
    const desc = vt.Description?.toLowerCase() ?? "";
    const vis = vt.Is_Public ? "public" : "private";
    return name.includes(q) || desc.includes(q) || vis.includes(q);
  });
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
              className="flex flex-col rounded-2xl border shadow-sm"
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

  if (!totalItems || totalItems === 0) {
    return (
      <>
        <EmptyState
          title="No volume types found"
          text="Get started by creating your first volume type. Volume types let you define different storage backends and options for your cloud infrastructure."
          onRefresh={() => refetch()}
          refreshing={isFetching}
          icon={<HardDrive className="w-7 h-7 text-muted-foreground" />}
          variant="dashed"
          primaryLabel="Create Volume Type"
          onPrimary={() => setViewMode("create")}
        />
        <VolumeTypeCreateDialog
          open={viewMode === "create"}
          onOpenChange={(open) => setViewMode(open ? "create" : "list")}
        />
      </>
    );
  }

  return (
    <div className="space-y-8">
      <div className="space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:justify-between sm:items-center">
          <div className="text-sm leading-relaxed text-muted-foreground">
            {totalItems} volume type{totalItems !== 1 ? "s" : ""} total
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
            refreshTooltip="Refresh volume types"
            mainButton={{
              onClick: () => setViewMode("create"),
              label: "New Volume Type",
              shortLabel: "New",
              tooltip: "Add a new volume type",
            }}
          />
        </div>

        <div className="relative max-w-full sm:max-w-md">
          <Search className="absolute left-3 top-1/2 flex-shrink-0 w-4 h-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search (name, description, visibility)"
            className="pl-10 w-full h-10 rounded-full"
          />
        </div>
      </div>

      {
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          {filteredTypes.map((vt) => (
            <Card
              key={vt.ID}
              className="flex flex-col rounded-xl border shadow-sm"
            >
              <CardHeader className="pb-2">
                <div className="flex gap-3 items-center">
                  <div className="flex justify-center items-center w-10 h-10 rounded-full bg-primary/10">
                    <HardDrive className="w-5 h-5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex gap-2 justify-between items-center">
                      <CardTitle className="text-base font-semibold truncate">
                        {vt.Name}
                      </CardTitle>
                      <Badge
                        variant="secondary"
                        className="inline-flex gap-1 items-center px-2 h-5 text-xs rounded-full"
                      >
                        {vt.Is_Public ? (
                          <>
                            <Eye className="w-3.5 h-3.5" />
                            Public
                          </>
                        ) : (
                          <>
                            <Lock className="w-3.5 h-3.5" />
                            Private
                          </>
                        )}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground line-clamp-2">
                      {vt.Description || "No description"}
                    </p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-2">
                <div className="flex gap-3 justify-center">
                  <Button
                    variant="outline"
                    className="rounded-full cursor-pointer"
                    onClick={() => {
                      setEditingType(vt);
                      setViewMode("edit");
                    }}
                  >
                    <Edit className="mr-2 w-4 h-4" />
                    Edit
                  </Button>
                  <Button
                    variant="destructive"
                    className="text-white rounded-full cursor-pointer"
                    onClick={() => {
                      setTypeToDelete(vt);
                      setShowDelete(true);
                    }}
                  >
                    <Trash2 className="mr-2 w-4 h-4" />
                    Delete
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      }

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

      <VolumeTypeCreateDialog
        open={viewMode === "create"}
        onOpenChange={(open) => setViewMode(open ? "create" : "list")}
      />

      <ConfirmDeleteDialog
        open={showDelete}
        onOpenChange={setShowDelete}
        title="Delete Volume Type"
        description={
          <>
            Are you sure you want to delete this volume type{" "}
            <span className="font-semibold text-foreground">
              {typeToDelete?.Name}
            </span>
            ? This action cannot be undone.
          </>
        }
        confirmLabel="Delete"
        cancelLabel="Cancel"
        confirming={deleteMutation.isPending}
        onConfirm={() => typeToDelete && deleteMutation.mutate(typeToDelete.ID)}
      />
    </div>
  );
}
