"use client";

import { ConfirmDeleteDialog } from "@/components/ConfirmDeleteDialog";
import { EmptyState } from "@/components/EmptyState";
import { ErrorCard } from "@/components/ErrorCard";
import { FlavorCreateDialog } from "@/components/FlavorCreateDialog";
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
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { XSearch } from "@/components/XSearch";
import { FlavorService } from "@/lib/requests";
import type {
  FlavorDeleteRequest,
  FlavorUpdateRequest,
} from "@/types/RequestInterfaces";
import { FlavorUpdateRequestSchema } from "@/types/RequestSchemas";
import type { FlavorDetails } from "@/types/ResponseInterfaces";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Cpu,
  HardDrive,
  Loader2,
  MemoryStick,
  Pencil,
  Trash2,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

export function Flavors() {
  const qc = useQueryClient();

  const [search, setSearch] = useState("");
  const [limit, setLimit] = useState(6);

  const [createOpen, setCreateOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const [selected, setSelected] = useState<FlavorDetails | undefined>();
  const [toDelete, setToDelete] = useState<FlavorDeleteRequest | undefined>();

  useEffect(() => setLimit(6), [search]);

  const { data, isLoading, error, isFetching, refetch } = useQuery({
    queryKey: ["flavors"],
    queryFn: () => FlavorService.list(),
  });

  const list = data ?? [];
  const q = search.trim().toLowerCase();
  const filtered = q
    ? list.filter((f) => f.name.toLowerCase().includes(q))
    : list;
  const totalItems = filtered.length;
  const visible = filtered.slice(0, limit);
  const hasMore = limit < totalItems;

  const updateForm = useForm<Omit<FlavorUpdateRequest, "flavor_id">>({
    resolver: zodResolver(FlavorUpdateRequestSchema.omit({ flavor_id: true })),
    defaultValues: {
      name: "",
      vcpus: undefined,
      ram: undefined,
      disk: undefined,
      ephemeral: undefined,
      swap: undefined,
      is_public: undefined,
      description: undefined,
    },
  });

  useEffect(() => {
    if (editOpen && selected) {
      updateForm.reset({
        name: selected.name,
        vcpus: selected.vcpus,
        ram: selected.ram,
        disk: selected.disk,
        ephemeral: selected.ephemeral_disk,
        swap: selected.swap,
        is_public: selected.public,
      });
    }
  }, [editOpen, selected, updateForm]);

  const updateMutation = useMutation({
    mutationFn: (payload: { data: FlavorUpdateRequest }) =>
      FlavorService.update(payload.data),
    onSuccess: async () => {
      toast.success("Flavor updated");
      setEditOpen(false);
      await qc.invalidateQueries({ queryKey: ["flavors"] });
    },
    onError: (err: unknown) => {
      const message =
        err instanceof Error ? err.message : "Failed to update flavor";
      toast.error(message);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (payload: FlavorDeleteRequest) => FlavorService.delete(payload),
    onSuccess: async (res) => {
      toast.success(res.message || "Flavor deleted");
      setDeleteOpen(false);
      await qc.invalidateQueries({ queryKey: ["flavors"] });
    },
    onError: (err: unknown) => {
      const message =
        err instanceof Error ? err.message : "Failed to delete flavor";
      toast.error(message);
    },
  });

  const openEdit = async (flavorId: string) => {
    try {
      const details = await FlavorService.get(flavorId);
      setSelected(details);
      setEditOpen(true);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to load flavor";
      toast.error(message);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex flex-col gap-2 sm:flex-row sm:gap-0 sm:justify-between sm:items-center">
          <Skeleton className="w-64 h-4" />
        </div>
        <div className="flex flex-col gap-4 items-stretch sm:flex-row sm:justify-between sm:items-center">
          <div className="relative flex-1 max-w-full sm:max-w-md">
            <Skeleton className="w-full h-10 rounded-full" />
            <div className="absolute right-2.5 top-1/2 w-6 h-6 rounded-full -translate-y-1/2 bg-muted/50" />
          </div>
          <div className="flex gap-2 self-end ml-auto sm:self-auto">
            <Skeleton className="w-10 h-10 rounded-full" />
            <Skeleton className="w-28 h-10 rounded-full" />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card
              key={i}
              className="border shadow-lg bg-card text-card-foreground border-border/50"
            >
              <CardContent className="p-3">
                <div className="flex items-center mb-2">
                  <div className="flex gap-3 items-center">
                    <div className="flex justify-center items-center w-8 h-8 rounded-full bg-muted" />
                    <div className="space-y-1">
                      <Skeleton className="w-36 h-4" />
                      <Skeleton className="w-14 h-3" />
                    </div>
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="flex gap-2 items-center">
                    <div className="w-6 h-6 rounded-full bg-muted" />
                    <div className="flex-1">
                      <Skeleton className="w-24 h-3" />
                    </div>
                  </div>
                  <div className="flex gap-2 items-center">
                    <div className="w-6 h-6 rounded-full bg-muted" />
                    <div className="flex-1">
                      <Skeleton className="w-28 h-3" />
                    </div>
                  </div>
                  <div className="flex gap-2 items-center">
                    <div className="w-6 h-6 rounded-full bg-muted" />
                    <div className="flex-1">
                      <Skeleton className="w-20 h-3" />
                    </div>
                  </div>
                </div>
                <div className="flex gap-2 justify-center pt-2">
                  <Skeleton className="w-20 h-8 rounded-full" />
                  <Skeleton className="w-20 h-8 rounded-full" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }
  if (!list || list.length === 0) {
    return (
      <>
        <EmptyState
          title="No flavors found"
          text="You don't have any flavors yet. Create your first flavor to get started."
          onRefresh={() => refetch()}
          refreshing={isFetching}
          primaryLabel="New Flavor"
          onPrimary={() => setCreateOpen(true)}
          icon={<Cpu className="w-7 h-7 text-muted-foreground" />}
          variant="dashed"
        />
        <FlavorCreateDialog
          open={createOpen}
          onOpenChange={setCreateOpen}
          onSuccess={async () => {
            await qc.invalidateQueries({ queryKey: ["flavors"] });
          }}
        />
      </>
    );
  }

  return (
    <div className="px-2 space-y-6 sm:px-0">
      <div className="space-y-3">
        <div className="flex flex-col gap-2 sm:flex-row sm:gap-0 sm:justify-between sm:items-center">
          <div className="text-sm leading-relaxed text-muted-foreground">
            {totalItems} flavor{totalItems !== 1 ? "s" : ""} total
            {totalItems > 0 && (
              <>
                {" • "}
                Showing {Math.min(limit, totalItems)} of {totalItems}
              </>
            )}
          </div>
          <HeaderActions
            onRefresh={() => refetch()}
            isRefreshing={isFetching}
            refreshTooltip="Refresh"
            refreshAriaLabel="Refresh flavors"
            mainButton={{
              onClick: () => setCreateOpen(true),
              label: "New Flavor",
              shortLabel: "New",
              tooltip: "Create a new flavor",
            }}
          />
        </div>
        <div className="flex-1 max-w-full sm:max-w-md">
          <XSearch
            value={search}
            onChange={setSearch}
            placeholder="Search flavors..."
          />
        </div>
      </div>

      {error ? (
        <ErrorCard
          title="Failed to Load Flavors"
          message={error instanceof Error ? error.message : String(error)}
          onRetry={() => refetch()}
          isRetrying={isFetching}
        />
      ) : (
        <div className="space-y-4">
          {visible.length === 0 ? (
            <div className="flex justify-center items-center p-8 text-center rounded-2xl border text-muted-foreground min-h-32">
              No flavors match your search.
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {visible.map((flavor) => (
                <Card
                  key={flavor.id}
                  className="rounded-md border-2 transition-all hover:shadow-md bg-card text-card-foreground"
                >
                  <CardContent className="p-2">
                    <div className="flex items-center mb-1">
                      <div className="flex gap-3 items-center">
                        <div className="flex justify-center items-center w-8 h-8 rounded-full bg-primary/10">
                          <Cpu className="w-4 h-4 text-primary" />
                        </div>
                        <div>
                          <h3 className="text-base font-semibold leading-none">
                            {flavor.name}
                          </h3>
                          {!flavor.public && (
                            <Badge
                              variant="secondary"
                              className="mt-0.5 text-xs"
                            >
                              Private
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="space-y-1 text-sm">
                      <div className="flex gap-2 items-center">
                        <div className="flex justify-center items-center w-6 h-6 rounded-full bg-muted">
                          <Cpu className="w-3 h-3 text-muted-foreground" />
                        </div>
                        <div className="flex-1">
                          <span className="font-medium">
                            {flavor.vcpus} vCPU{flavor.vcpus !== 1 ? "s" : ""}
                          </span>
                        </div>
                      </div>
                      <div className="flex gap-2 items-center">
                        <div className="flex justify-center items-center w-6 h-6 rounded-full bg-muted">
                          <MemoryStick className="w-3 h-3 text-muted-foreground/60" />
                        </div>
                        <div className="flex-1">
                          <span className="font-medium">
                            {flavor.ram >= 1024
                              ? `${(flavor.ram / 1024).toFixed(1)} GB`
                              : `${flavor.ram} MB`}{" "}
                            RAM
                          </span>
                        </div>
                      </div>
                      <div className="flex gap-2 items-center">
                        <div className="flex justify-center items-center w-6 h-6 rounded-full bg-muted">
                          <HardDrive className="w-3 h-3 text-muted-foreground/60" />
                        </div>
                        <div className="flex-1">
                          <span className="font-medium">
                            {flavor.disk} GB Storage
                          </span>
                        </div>
                      </div>
                      {flavor.ephemeral_disk > 0 && (
                        <div className="flex gap-2 items-center">
                          <div className="flex justify-center items-center w-6 h-6 rounded-full bg-muted">
                            <HardDrive className="w-3 h-3 text-muted-foreground/60" />
                          </div>
                          <div className="flex-1">
                            <span className="text-muted-foreground">
                              {flavor.ephemeral_disk} GB Ephemeral
                            </span>
                          </div>
                        </div>
                      )}
                      {flavor.swap > 0 && (
                        <div className="flex gap-2 items-center">
                          <div className="flex justify-center items-center w-6 h-6 rounded-full bg-muted">
                            <MemoryStick className="w-3 h-3 text-muted-foreground/60" />
                          </div>
                          <div className="flex-1">
                            <span className="text-muted-foreground">
                              {flavor.swap} MB Swap
                            </span>
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="flex gap-2 justify-center pt-1">
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            className="gap-1.5 py-1 px-3 text-sm rounded-full cursor-pointer"
                            onClick={() => openEdit(flavor.id)}
                          >
                            <Pencil className="w-4 h-4" /> Edit
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Edit flavor</TooltipContent>
                      </Tooltip>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="destructive"
                            size="sm"
                            className="gap-1.5 py-1 px-3 text-sm text-white rounded-full cursor-pointer"
                            onClick={() => {
                              setToDelete({ flavor_id: flavor.id });
                              setDeleteOpen(true);
                            }}
                            disabled={deleteMutation.isPending}
                            aria-label={`Delete ${flavor.name}`}
                          >
                            <Trash2 className="w-4 h-4" />
                            Delete
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Delete flavor</TooltipContent>
                      </Tooltip>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
          <div className="flex justify-center pt-2">
            <Button
              onClick={() => setLimit((l) => l + 6)}
              variant="outline"
              disabled={!hasMore}
              className={`rounded-full ${hasMore ? "" : "opacity-60 cursor-not-allowed"}`}
            >
              {hasMore
                ? `Show More (${Math.min(6, totalItems - visible.length)} more)`
                : "All flavors loaded"}
            </Button>
          </div>
        </div>
      )}

      <FlavorCreateDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        onSuccess={async () => {
          await qc.invalidateQueries({ queryKey: ["flavors"] });
        }}
      />

      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit Flavor</DialogTitle>
          </DialogHeader>
          <Form {...updateForm}>
            <form
              onSubmit={updateForm.handleSubmit((values) => {
                if (!selected) return;
                updateMutation.mutate({
                  data: { ...values, flavor_id: selected.id },
                });
              })}
              className="space-y-4"
            >
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <FormField
                  control={updateForm.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Name</FormLabel>
                      <FormControl>
                        <Input className="rounded-full" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={updateForm.control}
                  name="vcpus"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>vCPUs</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min={1}
                          className="rounded-full"
                          {...field}
                          value={field.value ?? ""}
                          onChange={(e) =>
                            field.onChange(
                              e.target.value === ""
                                ? undefined
                                : Number(e.target.value),
                            )
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={updateForm.control}
                  name="ram"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>RAM (MB)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min={1}
                          className="rounded-full"
                          {...field}
                          value={field.value ?? ""}
                          onChange={(e) =>
                            field.onChange(
                              e.target.value === ""
                                ? undefined
                                : Number(e.target.value),
                            )
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={updateForm.control}
                  name="disk"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Disk (GB)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min={0}
                          className="rounded-full"
                          {...field}
                          value={field.value ?? ""}
                          onChange={(e) =>
                            field.onChange(
                              e.target.value === ""
                                ? undefined
                                : Number(e.target.value),
                            )
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={updateForm.control}
                  name="ephemeral"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Ephemeral (GB)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min={0}
                          className="rounded-full"
                          {...field}
                          value={field.value ?? ""}
                          onChange={(e) =>
                            field.onChange(
                              e.target.value === ""
                                ? undefined
                                : Number(e.target.value),
                            )
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={updateForm.control}
                  name="swap"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Swap (MB)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min={0}
                          className="rounded-full"
                          {...field}
                          value={field.value ?? ""}
                          onChange={(e) =>
                            field.onChange(
                              e.target.value === ""
                                ? undefined
                                : Number(e.target.value),
                            )
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={updateForm.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem className="col-span-full">
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea rows={3} className="rounded-md" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={updateForm.control}
                  name="is_public"
                  render={({ field }) => (
                    <FormItem className="flex col-span-full justify-between items-center pt-2">
                      <FormLabel>Public</FormLabel>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          className="cursor-pointer"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  className="gap-2 rounded-full cursor-pointer"
                  onClick={() => setEditOpen(false)}
                  disabled={updateMutation.isPending}
                >
                  <X className="w-4 h-4" />
                  <span>Cancel</span>
                </Button>
                <Button
                  type="submit"
                  variant="default"
                  className="gap-2 rounded-full cursor-pointer min-w-[140px]"
                  disabled={updateMutation.isPending}
                >
                  {updateMutation.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Updating...</span>
                    </>
                  ) : (
                    <>
                      <Pencil className="w-4 h-4" />
                      <span>Save</span>
                    </>
                  )}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <ConfirmDeleteDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title="Delete flavor"
        description={
          toDelete ? (
            <>
              Are you sure you want to delete flavor{" "}
              <span className="font-semibold text-foreground">
                {list.find((f) => f.id === toDelete.flavor_id)?.name ??
                  toDelete.flavor_id}
              </span>
              ?
            </>
          ) : (
            ""
          )
        }
        confirmLabel="Delete"
        cancelLabel="Cancel"
        onConfirm={() =>
          toDelete && deleteMutation.mutate({ flavor_id: toDelete.flavor_id })
        }
        confirming={deleteMutation.isPending}
      />
    </div>
  );
}
