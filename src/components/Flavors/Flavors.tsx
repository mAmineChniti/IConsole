"use client";

import { FlavorCreateDialog } from "@/components/Flavors/FlavorCreateDialog";
import { ConfirmDeleteDialog } from "@/components/reusable/ConfirmDeleteDialog";
import { EmptyState } from "@/components/reusable/EmptyState";
import { ErrorCard } from "@/components/reusable/ErrorCard";
import { HeaderActions } from "@/components/reusable/HeaderActions";
import { InfoCard } from "@/components/reusable/InfoCard";
import { StatusBadge } from "@/components/reusable/StatusBadge";
import { XSearch } from "@/components/reusable/XSearch";
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

  const { data, isLoading, error, isFetching, refetch } = useQuery<
    FlavorDetails[]
  >({
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
      is_public: false,
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
        ephemeral: selected.ephemeral,
        swap: selected.swap,
        is_public: selected.is_public,
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
    const existingFlavor = list.find((f) => f.id === flavorId);

    if (existingFlavor) {
      setSelected(existingFlavor);
      setEditOpen(true);
      return;
    }

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
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between sm:gap-0">
          <Skeleton className="h-4 w-64" />
        </div>
        <div className="flex flex-col items-stretch gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative max-w-full flex-1 sm:max-w-md">
            <Skeleton className="h-10 w-full rounded-full" />
            <div className="bg-muted/50 absolute top-1/2 right-2.5 h-6 w-6 -translate-y-1/2 rounded-full" />
          </div>
          <div className="ml-auto flex gap-2 self-end sm:self-auto">
            <Skeleton className="h-10 w-10 rounded-full" />
            <Skeleton className="h-10 w-28 rounded-full" />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card
              key={i}
              className="bg-card text-card-foreground border-border/50 border shadow-lg"
            >
              <CardContent className="p-3">
                <div className="mb-2 flex items-center">
                  <div className="flex items-center gap-3">
                    <div className="bg-muted flex h-8 w-8 items-center justify-center rounded-full" />
                    <div className="space-y-1">
                      <Skeleton className="h-4 w-36" />
                      <Skeleton className="h-3 w-14" />
                    </div>
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <div className="bg-muted h-6 w-6 rounded-full" />
                    <div className="flex-1">
                      <Skeleton className="h-3 w-24" />
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="bg-muted h-6 w-6 rounded-full" />
                    <div className="flex-1">
                      <Skeleton className="h-3 w-28" />
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="bg-muted h-6 w-6 rounded-full" />
                    <div className="flex-1">
                      <Skeleton className="h-3 w-20" />
                    </div>
                  </div>
                </div>
                <div className="flex justify-center gap-2 pt-2">
                  <Skeleton className="h-8 w-20 rounded-full" />
                  <Skeleton className="h-8 w-20 rounded-full" />
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
          icon={<Cpu className="text-muted-foreground h-7 w-7" />}
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
    <div className="space-y-6 px-2 sm:px-0">
      <div className="space-y-3">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between sm:gap-0">
          <div className="text-muted-foreground text-sm leading-relaxed">
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
        <div className="max-w-full flex-1 sm:max-w-md">
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
            <div className="text-muted-foreground flex min-h-32 items-center justify-center rounded-2xl border p-8 text-center">
              No flavors match your search.
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3">
              {visible.map((flavor) => (
                <InfoCard
                  key={flavor.id}
                  title={flavor.name}
                  badges={
                    <StatusBadge
                      status={flavor.is_public ? "ACTIVE" : "DISABLED"}
                      statusTextMap={{
                        ACTIVE: "ACTIVE",
                        DISABLED: "SHUTOFF",
                      }}
                    />
                  }
                  infoItems={[
                    [
                      {
                        label: "vCPUs",
                        value: flavor.vcpus.toString(),
                        icon: Cpu,
                        variant: "blue",
                      },
                      {
                        label: "RAM",
                        value: flavor.ram,
                        icon: MemoryStick,
                        variant: "green",
                      },
                    ],
                    [
                      {
                        label: "Storage",
                        value: flavor.disk,
                        icon: HardDrive,
                        variant: "purple",
                      },
                      {
                        label: "Ephemeral",
                        value: flavor.ephemeral,
                        icon: HardDrive,
                        variant: "amber",
                      },
                    ],
                    [
                      {
                        label: "Swap",
                        value: flavor.swap,
                        icon: MemoryStick,
                        variant: "purple",
                      },
                    ],
                  ]}
                  actionButtons={
                    <div className="flex gap-2">
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            className="cursor-pointer gap-1.5 rounded-full px-3 py-1 text-sm"
                            onClick={() => openEdit(flavor.id)}
                          >
                            <Pencil className="h-4 w-4" /> Edit
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Edit flavor</TooltipContent>
                      </Tooltip>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="destructive"
                            size="sm"
                            className="cursor-pointer gap-1.5 rounded-full px-3 py-1 text-sm"
                            onClick={() => {
                              setDeleteOpen(true);
                              setToDelete({ flavor_id: flavor.id });
                            }}
                            disabled={deleteMutation.isPending}
                            aria-label={`Delete ${flavor.name}`}
                          >
                            <Trash2 className="h-4 w-4" />
                            Delete
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Delete flavor</TooltipContent>
                      </Tooltip>
                    </div>
                  }
                />
              ))}
            </div>
          )}
          <div className="flex justify-center pt-2">
            <Button
              onClick={() => setLimit((l) => l + 6)}
              variant="outline"
              disabled={!hasMore}
              className={`rounded-full ${hasMore ? "" : "cursor-not-allowed opacity-60"}`}
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
                    <FormItem className="col-span-full flex items-center justify-between pt-2">
                      <FormLabel>Public</FormLabel>
                      <FormControl>
                        <Switch
                          checked={!!field.value}
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
                  className="cursor-pointer gap-2 rounded-full"
                  onClick={() => setEditOpen(false)}
                  disabled={updateMutation.isPending}
                >
                  <X className="h-4 w-4" />
                  <span>Cancel</span>
                </Button>
                <Button
                  type="submit"
                  variant="default"
                  className="min-w-[140px] cursor-pointer gap-2 rounded-full"
                  disabled={updateMutation.isPending}
                >
                  {updateMutation.isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Updating...</span>
                    </>
                  ) : (
                    <>
                      <Pencil className="h-4 w-4" />
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
              <span className="text-foreground font-semibold">
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
