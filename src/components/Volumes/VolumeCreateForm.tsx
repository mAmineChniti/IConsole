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
      availability_zone: "nova",
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
      availability_zone: (values.availability_zone?.trim() ?? "") || "nova",
      source_vol_id: values.source_vol_id ?? undefined,
      group_id: values.group_id ?? undefined,
    });
  };

  return (
    <div className="w-full">
      <div className="mx-auto flex px-2 pt-4 pb-0">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onCancel}
          className="mb-2 cursor-pointer gap-2 rounded-full px-4"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Volumes
        </Button>
      </div>
      <Card className="bg-card text-card-foreground border-border/50 mx-auto w-full rounded-xl border shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <div className="bg-muted rounded-full p-2">
              <HardDrive className="text-primary h-5 w-5" />
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
                      <FormLabel className="flex items-center gap-2 font-semibold">
                        <Server className="text-muted-foreground h-4 w-4" />
                        Name *
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Volume name"
                          {...field}
                          className="bg-input text-foreground rounded-full"
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
                      <FormLabel className="flex items-center gap-2 font-semibold">
                        <Layers className="text-muted-foreground h-4 w-4" />
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
                          className="bg-input text-foreground rounded-full"
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
                      <FormLabel className="flex items-center gap-2 font-semibold">
                        <FileText className="text-muted-foreground h-4 w-4" />
                        Description
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Optional description"
                          {...field}
                          className="bg-input text-foreground rounded-full"
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
                      <FormLabel className="flex items-center gap-2 font-semibold">
                        <Copy className="text-muted-foreground h-4 w-4" />
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
                            <SelectTrigger className="bg-input text-foreground w-full cursor-pointer rounded-full">
                              {isLoadingVolumes ? (
                                <span className="flex items-center gap-2">
                                  <Loader2 className="h-4 w-4 animate-spin" />
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
                              <Button
                                variant="outline"
                                type="button"
                                className="hover:bg-accent absolute top-1/2 right-10 -translate-y-1/2 rounded-full p-1"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  field.onChange(undefined);
                                }}
                              >
                                <X className="h-4 w-4 opacity-50 hover:opacity-100" />
                              </Button>
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
                      <FormLabel className="flex items-center gap-2 font-semibold">
                        <Users className="text-muted-foreground h-4 w-4" />
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
                          className="bg-input text-foreground rounded-full"
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
                      <FormLabel className="flex items-center gap-2 font-semibold">
                        <Layers className="text-muted-foreground h-4 w-4" />
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
                          <SelectTrigger className="bg-input text-foreground w-full cursor-pointer rounded-full">
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
                      <FormLabel className="flex items-center gap-2 font-semibold">
                        <MapPin className="text-muted-foreground h-4 w-4" />
                        Availability Zone
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="nova"
                          {...field}
                          className="bg-input text-foreground rounded-full"
                        />
                      </FormControl>
                      <FormDescription>Default: nova</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <Separator />
              <div className="flex justify-center gap-3 pt-2 sm:justify-end">
                <Button
                  type="button"
                  variant="outline"
                  onClick={onCancel}
                  className="cursor-pointer rounded-full px-6 py-2"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={createMutation.isPending}
                  className="min-w-[120px] cursor-pointer rounded-full"
                >
                  {createMutation.isPending ? (
                    <>
                      <Plus className="h-4 w-4 animate-pulse" /> Creating...
                    </>
                  ) : (
                    <>
                      <Plus className="h-4 w-4" /> Create Volume
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
