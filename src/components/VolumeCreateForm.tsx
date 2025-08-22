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
  VolumeTypeListResponse,
} from "@/types/ResponseInterfaces";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  ArchiveRestore,
  ArrowLeft,
  Copy,
  FileText,
  HardDrive,
  Image as ImageIcon,
  Layers,
  MapPin,
  Plus,
  Server,
  Users,
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
      description: "",
      snapshot_id: undefined,
      image_id: undefined,
      volume_type: undefined,
      availability_zone: undefined,
      source_vol_id: undefined,
      group_id: undefined,
    },
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
  const createMutation = useMutation({
    mutationFn: async (values: VolumeCreateRequest): Promise<VolumeDetails> => {
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
  });

  const onSubmit = (values: VolumeCreateRequest) => {
    createMutation.mutate(values);
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
                  name="snapshot_id"
                  render={({ field }) => (
                    <FormItem className="flex flex-col gap-1">
                      <FormLabel className="flex gap-2 items-center font-semibold">
                        <ArchiveRestore className="w-4 h-4 text-muted-foreground" />
                        Snapshot ID
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="From snapshot (optional)"
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
                  name="image_id"
                  render={({ field }) => (
                    <FormItem className="flex flex-col gap-1">
                      <FormLabel className="flex gap-2 items-center font-semibold">
                        <ImageIcon className="w-4 h-4 text-muted-foreground" />
                        Image ID
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="From image (optional)"
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
                  name="source_vol_id"
                  render={({ field }) => (
                    <FormItem className="flex flex-col gap-1">
                      <FormLabel className="flex gap-2 items-center font-semibold">
                        <Copy className="w-4 h-4 text-muted-foreground" />
                        Source Volume ID
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="From volume (optional)"
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
                          onValueChange={field.onChange}
                          disabled={isLoadingTypes || isErrorTypes}
                        >
                          <SelectTrigger className="w-full rounded-full cursor-pointer bg-input text-foreground">
                            {isLoadingTypes
                              ? "Loading..."
                              : isErrorTypes
                                ? "Failed to load types"
                                : field.value
                                  ? typesData.find((t) => t.ID === field.value)
                                      ?.Name
                                  : "Select volume type"}
                          </SelectTrigger>
                          <SelectContent>
                            {isLoadingTypes ? (
                              <SelectItem value="Loading" disabled>
                                Loading...
                              </SelectItem>
                            ) : isErrorTypes ? (
                              <SelectItem value="Failed" disabled>
                                Failed to load types
                              </SelectItem>
                            ) : typesData.length > 0 ? (
                              typesData.map((type) => (
                                <SelectItem key={type.ID} value={type.ID}>
                                  {type.Name}
                                </SelectItem>
                              ))
                            ) : (
                              <SelectItem value="" disabled>
                                No types found
                              </SelectItem>
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
                          placeholder="Zone (optional)"
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
