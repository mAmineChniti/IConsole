"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
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
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { VolumeService } from "@/lib/requests";
import type { VolumeCreateRequest } from "@/types/RequestInterfaces";
import { VolumeCreateRequestSchema } from "@/types/RequestSchemas";
import type {
  VolumeDetails,
  VolumeType,
  VolumeTypeListResponse,
} from "@/types/ResponseInterfaces";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  ArrowLeft,
  Copy,
  FileText,
  HardDrive,
  Layers,
  Loader2,
  MapPin,
  Plus,
  Server,
  Users,
  X,
} from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

export function VolumeCreateForm({
  onSuccess,
  onCancel,
}: {
  onSuccess: () => void;
  onCancel: () => void;
}) {
  const queryClient = useQueryClient();
  const form = useForm<VolumeCreateRequest>({
    resolver: zodResolver(VolumeCreateRequestSchema),
    defaultValues: {
      name: "",
      size: 1,
      description: undefined,
      volume_type: undefined,
      availability_zone: undefined,
      source_vol_id: undefined,
      group_id: undefined,
    },
    mode: "onChange",
  });
  const {
    data: typesData = [],
    isLoading: isLoadingTypes,
    isError: isErrorTypes,
  } = useQuery<VolumeTypeListResponse>({
    queryKey: ["volumeTypes"],
    queryFn: async () => {
      const res = await VolumeService.listVolumeTypes();
      return Array.isArray(res) ? res : [];
    },
  });

  const {
    data: volumes = [],
    isLoading: isLoadingVolumes,
    isError: isErrorVolumes,
  } = useQuery<VolumeDetails[]>({
    queryKey: ["volumes"],
    queryFn: async () => {
      const res = await VolumeService.list();
      return Array.isArray(res) ? res : [];
    },
  });

  const createMutation = useMutation<VolumeDetails, Error, VolumeCreateRequest>(
    {
      mutationFn: async (values) => {
        return await VolumeService.create(values);
      },
      onSuccess: async (data) => {
        toast.success(`Volume '${data.Name}' created successfully`);
        await queryClient.invalidateQueries({ queryKey: ["volumes"] });
        form.reset();
        onSuccess();
      },
      onError: (err: unknown) => {
        const message =
          err instanceof Error ? err.message : "An unexpected error occurred";
        toast.error(message);
      },
    },
  );

  const onSubmit = (values: VolumeCreateRequest) => {
    createMutation.mutate({
      ...values,
      description: values.description?.trim() ?? undefined,
      volume_type: values.volume_type ?? undefined,
      availability_zone: values.availability_zone?.trim() ?? undefined,
      source_vol_id: values.source_vol_id ?? undefined,
      group_id: values.group_id ?? undefined,
    });
  };

  return (
    <div className="w-full">
      <div className="flex px-2 pt-4 pb-0 mx-auto">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onCancel}
          className="gap-2 px-4 mb-2 rounded-full cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Volumes
        </Button>
      </div>
      <Card className="mx-auto w-full rounded-xl border shadow-lg bg-card text-card-foreground border-border/50">
        <CardHeader>
          <CardTitle className="flex gap-2 items-center">
            <div className="p-2 rounded-full bg-muted">
              <HardDrive className="w-5 h-5 text-primary" />
            </div>
            Create New Volume
          </CardTitle>
          <CardDescription>
            Fill in all required details to create a new volume. Fields marked
            with * are required.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem className="flex flex-col gap-1">
                      <FormLabel className="flex gap-2 items-center font-semibold">
                        <Server className="w-4 h-4 text-muted-foreground" />
                        Name *
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Volume name"
                          {...field}
                          className="rounded-full bg-input text-foreground"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="size"
                  render={({ field }) => (
                    <FormItem className="flex flex-col gap-1">
                      <FormLabel className="flex gap-2 items-center font-semibold">
                        <Layers className="w-4 h-4 text-muted-foreground" />
                        Size (GB) *
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min={1}
                          value={field.value ?? 1}
                          onChange={(e) =>
                            field.onChange(
                              e.currentTarget.value === ""
                                ? undefined
                                : e.currentTarget.valueAsNumber,
                            )
                          }
                          className="rounded-full bg-input text-foreground"
                        />
                      </FormControl>
                      <FormDescription>Minimum size is 1 GB.</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem className="flex flex-col gap-1">
                      <FormLabel className="flex gap-2 items-center font-semibold">
                        <FileText className="w-4 h-4 text-muted-foreground" />
                        Description
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Optional description"
                          {...field}
                          className="rounded-full bg-input text-foreground"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="source_vol_id"
                  render={({ field }) => (
                    <FormItem className="flex flex-col gap-1">
                      <FormLabel className="flex gap-2 items-center font-semibold">
                        <Copy className="w-4 h-4 text-muted-foreground" />
                        Source Volume
                      </FormLabel>
                      <FormControl>
                        <div className="relative w-full">
                          <Select
                            value={field.value ?? ""}
                            onValueChange={(v) =>
                              field.onChange(v || undefined)
                            }
                            disabled={isLoadingVolumes}
                          >
                            <SelectTrigger className="w-full rounded-full cursor-pointer bg-input text-foreground">
                              {isLoadingVolumes ? (
                                <span className="flex gap-2 items-center">
                                  <Loader2 className="w-4 h-4 animate-spin" />
                                  Loading volumes...
                                </span>
                              ) : isErrorVolumes ? (
                                "Error loading volumes"
                              ) : field.value ? (
                                <span className="pr-6">
                                  {volumes.find((v) => v.ID === field.value)
                                    ?.Name ?? field.value}
                                </span>
                              ) : (
                                "Select a source volume (optional)"
                              )}
                            </SelectTrigger>
                            <SelectContent>
                              {volumes.map((volume) => (
                                <SelectItem key={volume.ID} value={volume.ID}>
                                  {volume.Name} ({volume.Size} GB)
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          {field.value &&
                            !isLoadingVolumes &&
                            !isErrorVolumes && (
                              <button
                                type="button"
                                className="absolute right-10 top-1/2 p-1 rounded-full -translate-y-1/2 hover:bg-accent"
                                onClick={(e: React.MouseEvent) => {
                                  e.stopPropagation();
                                  field.onChange(undefined);
                                }}
                              >
                                <X className="w-4 h-4 opacity-50 hover:opacity-100" />
                              </button>
                            )}
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="group_id"
                  render={({ field }) => (
                    <FormItem className="flex flex-col gap-1">
                      <FormLabel className="flex gap-2 items-center font-semibold">
                        <Users className="w-4 h-4 text-muted-foreground" />
                        Group ID
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Group ID (optional)"
                          value={field.value ?? ""}
                          onChange={(e) =>
                            field.onChange(
                              e.currentTarget.value.trim() || undefined,
                            )
                          }
                          className="rounded-full bg-input text-foreground"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="volume_type"
                  render={({ field }) => (
                    <FormItem className="flex flex-col gap-1">
                      <FormLabel className="flex gap-2 items-center font-semibold">
                        <Layers className="w-4 h-4 text-muted-foreground" />
                        Volume Type
                      </FormLabel>
                      <FormControl>
                        <Select
                          value={field.value ?? ""}
                          onValueChange={(value) =>
                            field.onChange(value || undefined)
                          }
                          disabled={isLoadingTypes || isErrorTypes}
                        >
                          <SelectTrigger className="w-full rounded-full cursor-pointer bg-input text-foreground">
                            {isLoadingTypes
                              ? "Loading..."
                              : isErrorTypes
                                ? "Error loading types"
                                : (typesData.find(
                                    (t: VolumeType) => t.ID === field.value,
                                  )?.Name ?? field.value)}
                          </SelectTrigger>
                          <SelectContent>
                            {isLoadingTypes ? (
                              <SelectItem value="__none__" disabled>
                                Loading types...
                              </SelectItem>
                            ) : isErrorTypes ? (
                              <SelectItem value="__none__" disabled>
                                Error loading types
                              </SelectItem>
                            ) : (
                              typesData.map((type: VolumeType) => (
                                <SelectItem key={type.ID} value={type.ID}>
                                  {type.Name}
                                </SelectItem>
                              ))
                            )}
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="availability_zone"
                  render={({ field }) => (
                    <FormItem className="flex flex-col gap-1">
                      <FormLabel className="flex gap-2 items-center font-semibold">
                        <MapPin className="w-4 h-4 text-muted-foreground" />
                        Availability Zone
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="nova"
                          value={field.value}
                          onChange={(e) =>
                            field.onChange(
                              e.currentTarget.value.trim() || undefined,
                            )
                          }
                          className="rounded-full bg-input text-foreground"
                        />
                      </FormControl>
                      <FormDescription>Default: nova</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <Separator />
              <div className="flex gap-3 justify-center pt-2 sm:justify-end">
                <Button
                  type="button"
                  variant="outline"
                  onClick={onCancel}
                  className="py-2 px-6 rounded-full cursor-pointer"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={createMutation.isPending}
                  className="rounded-full cursor-pointer min-w-[120px]"
                >
                  {createMutation.isPending ? (
                    <>
                      <Plus className="w-4 h-4 animate-pulse" /> Creating...
                    </>
                  ) : (
                    <>
                      <Plus className="w-4 h-4" /> Create Volume
                    </>
                  )}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
