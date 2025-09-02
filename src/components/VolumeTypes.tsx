"use client";

import { ConfirmDeleteDialog } from "@/components/reusable/ConfirmDeleteDialog";
import { EmptyState } from "@/components/reusable/EmptyState";
import { ErrorCard } from "@/components/reusable/ErrorCard";
import { HeaderActions } from "@/components/reusable/HeaderActions";
import { InfoCard } from "@/components/reusable/InfoCard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
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
        <div className="mt-4 flex justify-end gap-2">
          {onCancel && (
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={loading}
              className="cursor-pointer rounded-full"
            >
              Cancel
            </Button>
          )}
          <Button
            type="submit"
            disabled={loading}
            className="cursor-pointer rounded-full"
          >
            {loading ? (
              <>
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
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
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="text-muted-foreground text-sm">
            <Skeleton className="h-4 w-40 rounded-full" />
          </div>
          <div className="flex gap-3">
            <Skeleton className="h-9 w-9 rounded-full" />
            <Skeleton className="h-9 w-40 rounded-full" />
          </div>
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card
              key={i}
              className="flex flex-col rounded-2xl border shadow-sm"
            >
              <CardHeader className="pb-4">
                <div className="flex items-center gap-4">
                  <Skeleton className="h-12 w-12 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-6 w-32 rounded-full" />
                    <Skeleton className="h-4 w-24 rounded-full" />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex justify-end gap-2">
                  <Skeleton className="h-9 w-9 rounded-full" />
                  <Skeleton className="h-9 w-9 rounded-full" />
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
          icon={<HardDrive className="text-muted-foreground h-7 w-7" />}
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
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="text-muted-foreground text-sm leading-relaxed">
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
          <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 flex-shrink-0 -translate-y-1/2" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search (name, description, visibility)"
            className="h-10 w-full rounded-full pl-10"
          />
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
        {filteredTypes.map((vt) => (
          <InfoCard
            key={vt.ID}
            title={vt.Name}
            description={vt.Description || "No description"}
            className="h-full"
            badges={
              <Badge
                variant="secondary"
                className="inline-flex h-5 items-center gap-1 rounded-full px-2 text-xs"
              >
                {vt.Is_Public ? (
                  <>
                    <Eye className="h-3.5 w-3.5" />
                    Public
                  </>
                ) : (
                  <>
                    <Lock className="h-3.5 w-3.5" />
                    Private
                  </>
                )}
              </Badge>
            }
            actionButtons={
              <>
                <Button
                  variant="outline"
                  size="sm"
                  className="cursor-pointer rounded-full"
                  onClick={(e) => {
                    e.stopPropagation();
                    setEditingType(vt);
                    setViewMode("edit");
                  }}
                >
                  <Edit className="mr-2 h-4 w-4" />
                  Edit
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  className="cursor-pointer rounded-full text-white"
                  onClick={(e) => {
                    e.stopPropagation();
                    setTypeToDelete(vt);
                    setShowDelete(true);
                  }}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </Button>
              </>
            }
          />
        ))}
      </div>

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
            <span className="text-foreground font-semibold">
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
