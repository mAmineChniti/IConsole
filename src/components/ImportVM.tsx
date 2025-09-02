"use client";

import { ErrorCard } from "@/components/reusable/ErrorCard";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dropzone,
  DropzoneContent,
  DropzoneEmptyState,
} from "@/components/ui/dropzone";
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
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { InfraService } from "@/lib/requests";
import { makeDupSafeSelect } from "@/lib/utils";
import type { ImportVMwareRequest } from "@/types/RequestInterfaces";
import { ImportVMwareRequestSchema } from "@/types/RequestSchemas";
import type { ResourcesResponse } from "@/types/ResponseInterfaces";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Download,
  FileText,
  HardDrive,
  IceCream,
  KeyRound,
  Loader2,
  MemoryStick,
  Network,
  Server,
  ShieldCheck,
  Upload,
  UserCog,
} from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

export function ImportVM() {
  const [importFile, setImportFile] = useState<File | undefined>(undefined);
  const queryClient = useQueryClient();

  const importForm = useForm<ImportVMwareRequest>({
    resolver: zodResolver(ImportVMwareRequestSchema),
    defaultValues: {
      vm_name: "",
      description: "",
      min_disk: 20,
      min_ram: 2048,
      is_public: false,
      flavor_id: "",
      network_id: "",
      key_name: "",
      security_group: "",
      admin_password: "",
    },
  });

  const {
    data: resources,
    isLoading: resourcesLoading,
    isError: resourcesIsError,
    error: resourcesError,
    refetch: refetchResources,
  } = useQuery<ResourcesResponse, Error>({
    queryKey: ["vm-resources"],
    queryFn: () => InfraService.listResources(),
    staleTime: 5 * 60 * 1000,
  });

  const importVMMutation = useMutation({
    mutationFn: async (data: ImportVMwareRequest) => {
      if (!importFile) {
        throw new Error("Please select a VMDK file to import");
      }
      const payload: ImportVMwareRequest = {
        ...data,
        is_public: data.is_public ?? false,
        vmdk_file: importFile,
      };
      return InfraService.importVMwareVM(payload);
    },
    onSuccess: async (response) => {
      toast.success("VM imported successfully!", {
        description: `VM \"${response.server.name}\" has been imported and deployed`,
      });
      importForm.reset();
      setImportFile(undefined);
      await queryClient.invalidateQueries({
        queryKey: ["instances", "details"],
      });
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

  if (resourcesIsError) {
    return (
      <ErrorCard
        title="Failed to Load Resources"
        message={
          resourcesError.message ||
          "Unable to fetch VM resources. Please check your connection and try again."
        }
        onRetry={() => refetchResources()}
      />
    );
  }

  if (resourcesLoading)
    return (
      <Card className="bg-card text-card-foreground border-border/50 rounded-xl border shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <div className="bg-muted rounded-full p-2">
              <Skeleton className="h-5 w-5" />
            </div>
            <Skeleton className="h-6 w-44" />
          </CardTitle>
          <CardDescription>
            <Skeleton className="h-4 w-64" />
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div>
              <Skeleton className="mb-2 h-4 w-24" />
              <div className="flex w-full items-center justify-center">
                <div className="border-border flex h-32 w-full flex-col items-center justify-center rounded-lg border-2 border-dashed">
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <div className="bg-muted mb-2 rounded-full p-2">
                      <Skeleton className="h-8 w-8" />
                    </div>
                    <Skeleton className="mb-2 h-4 w-40" />
                    <Skeleton className="h-3 w-24" />
                  </div>
                </div>
              </div>
            </div>

            <Separator />

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div className="space-y-2">
                <div className="mb-1 flex items-center gap-2">
                  <div className="bg-muted rounded-full p-1">
                    <Skeleton className="h-4 w-4" />
                  </div>
                  <Skeleton className="h-4 w-24" />
                </div>
                <Skeleton className="h-10 w-full rounded-full" />
              </div>
              <div className="space-y-2">
                <div className="mb-1 flex items-center gap-2">
                  <div className="bg-muted rounded-full p-1">
                    <Skeleton className="h-4 w-4" />
                  </div>
                  <Skeleton className="h-4 w-32" />
                </div>
                <Skeleton className="h-10 w-full rounded-full" />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div className="space-y-2">
                <div className="mb-1 flex items-center gap-2">
                  <div className="bg-muted rounded-full p-1">
                    <Skeleton className="h-4 w-4" />
                  </div>
                  <Skeleton className="h-4 w-24" />
                </div>
                <Skeleton className="h-10 w-full rounded-full" />
              </div>
              <div className="space-y-2">
                <div className="mb-1 flex items-center gap-2">
                  <div className="bg-muted rounded-full p-1">
                    <Skeleton className="h-4 w-4" />
                  </div>
                  <Skeleton className="h-4 w-24" />
                </div>
                <Skeleton className="h-10 w-full rounded-full" />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div className="space-y-2">
                <div className="mb-1 flex items-center gap-2">
                  <div className="bg-muted rounded-full p-1">
                    <Skeleton className="h-4 w-4" />
                  </div>
                  <Skeleton className="h-4 w-28" />
                </div>
                <Skeleton className="h-10 w-full rounded-full" />
              </div>
              <div className="space-y-2">
                <div className="mb-1 flex items-center gap-2">
                  <div className="bg-muted rounded-full p-1">
                    <Skeleton className="h-4 w-4" />
                  </div>
                  <Skeleton className="h-4 w-32" />
                </div>
                <Skeleton className="h-10 w-full rounded-full" />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div className="space-y-2">
                <div className="mb-1 flex items-center gap-2">
                  <div className="bg-muted rounded-full p-1">
                    <Skeleton className="h-4 w-4" />
                  </div>
                  <Skeleton className="h-4 w-28" />
                </div>
                <Skeleton className="h-10 w-full rounded-full" />
              </div>
              <div className="space-y-2">
                <div className="mb-1 flex items-center gap-2">
                  <div className="bg-muted rounded-full p-1">
                    <Skeleton className="h-4 w-4" />
                  </div>
                  <Skeleton className="h-4 w-36" />
                </div>
                <Skeleton className="h-10 w-full rounded-full" />
              </div>
            </div>

            <div className="space-y-2">
              <div className="mb-1 flex items-center gap-2">
                <div className="bg-muted rounded-full p-1">
                  <Skeleton className="h-4 w-4" />
                </div>
                <Skeleton className="h-4 w-36" />
              </div>
              <Skeleton className="h-10 w-full rounded-full" />
            </div>

            <Separator />

            <div className="flex justify-center sm:justify-end">
              <Skeleton className="h-10 w-full rounded-full sm:w-48" />
            </div>
          </div>
        </CardContent>
      </Card>
    );

  return (
    <Card className="bg-card text-card-foreground border-border/50 rounded-xl border shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <div className="bg-muted rounded-full p-2">
            <Upload className="text-primary h-5 w-5" />
          </div>
          Import Virtual Machine
        </CardTitle>
        <CardDescription>
          Import an existing VM from a VMDK file or external source
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...importForm}>
          <form
            onSubmit={importForm.handleSubmit((data) => {
              importVMMutation.mutate(data);
            })}
            className="space-y-6"
          >
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">VMDK File</label>
                <div className="mt-2">
                  <Dropzone
                    src={importFile ? [importFile] : undefined}
                    maxFiles={1}
                    accept={{
                      "application/octet-stream": [".vmdk"],
                      "application/x-vmdk": [".vmdk"],
                      "*/*": [".vmdk"],
                    }}
                    onDrop={(accepted) => {
                      const file = accepted?.[0];
                      if (!file) return;
                      if (!file.name.toLowerCase().endsWith(".vmdk")) {
                        toast.error("Invalid file type", {
                          description: "Please select a valid VMDK file",
                        });
                        importForm.setError("vmdk_file", {
                          type: "validate",
                          message: "Only .vmdk files are supported",
                        });
                        return;
                      }
                      setImportFile(file);
                      importForm.setValue("vmdk_file", file, {
                        shouldValidate: true,
                        shouldDirty: true,
                      });
                      importForm.clearErrors("vmdk_file");
                    }}
                    className="h-32 cursor-pointer"
                  >
                    <DropzoneEmptyState>
                      <div className="flex flex-col items-center justify-center">
                        <div className="bg-muted text-muted-foreground flex size-8 items-center justify-center rounded-md">
                          <Upload size={16} />
                        </div>
                        <p className="my-2 w-full truncate text-sm font-medium text-wrap">
                          Upload a file
                        </p>
                        <p className="text-muted-foreground w-full truncate text-xs text-wrap">
                          Drag and drop or click to upload
                        </p>
                        <p className="text-muted-foreground text-xs text-wrap">
                          Accepts .vmdk
                        </p>
                      </div>
                    </DropzoneEmptyState>
                    <DropzoneContent />
                  </Dropzone>
                  {importForm.formState.errors.vmdk_file && (
                    <p className="text-destructive mt-2 text-sm">
                      {importForm.formState.errors.vmdk_file.message?.toString() ??
                        "Please select a VMDK file"}
                    </p>
                  )}
                </div>
              </div>
            </div>

            <Separator />

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <FormField
                control={importForm.control}
                name="vm_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <span className="bg-muted flex items-center justify-center rounded-full p-1">
                        <Server className="text-muted-foreground h-4 w-4" />
                      </span>
                      VM Name
                    </FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="Enter VM name"
                        className="bg-input text-foreground rounded-full"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={importForm.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <span className="bg-muted flex items-center justify-center rounded-full p-1">
                        <FileText className="text-muted-foreground h-4 w-4" />
                      </span>
                      Description (Optional)
                    </FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="Brief description"
                        className="bg-input text-foreground rounded-full"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <FormField
                control={importForm.control}
                name="min_disk"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <span className="bg-muted flex items-center justify-center rounded-full p-1">
                        <HardDrive className="text-muted-foreground h-4 w-4" />
                      </span>
                      Minimum Disk (GB)
                    </FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="number"
                        min={0}
                        step={1}
                        inputMode="numeric"
                        onChange={(e) => {
                          const v = e.target.value;
                          if (v === "") return field.onChange(undefined);
                          const n = Number(v);
                          field.onChange(
                            Number.isFinite(n)
                              ? Math.max(0, Math.floor(n))
                              : undefined,
                          );
                        }}
                        className="bg-input text-foreground rounded-full"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={importForm.control}
                name="min_ram"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <span className="bg-muted flex items-center justify-center rounded-full p-1">
                        <MemoryStick className="text-muted-foreground h-4 w-4" />
                      </span>
                      Minimum RAM (MB)
                    </FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="number"
                        min={0}
                        step={1}
                        inputMode="numeric"
                        onChange={(e) => {
                          const v = e.target.value;
                          if (v === "") return field.onChange(undefined);
                          const n = Number(v);
                          field.onChange(
                            Number.isFinite(n)
                              ? Math.max(0, Math.floor(n))
                              : undefined,
                          );
                        }}
                        className="bg-input text-foreground rounded-full"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <FormField
                control={importForm.control}
                name="flavor_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <span className="bg-muted flex items-center justify-center rounded-full p-1">
                        <IceCream className="text-muted-foreground h-4 w-4 rotate-45" />
                      </span>
                      Flavor
                    </FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger className="w-full cursor-pointer rounded-full">
                          <SelectValue placeholder="Select flavor" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {resources?.flavors.map((flavor) => (
                          <SelectItem key={flavor.id} value={flavor.id}>
                            {flavor.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={importForm.control}
                name="network_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <span className="bg-muted flex items-center justify-center rounded-full p-1">
                        <Network className="text-muted-foreground h-4 w-4" />
                      </span>
                      Network
                    </FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger className="w-full cursor-pointer rounded-full">
                          <SelectValue placeholder="Select network" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {resources?.networks.map((network) => (
                          <SelectItem key={network.id} value={network.id}>
                            {network.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <FormField
                control={importForm.control}
                name="key_name"
                render={({ field }) => {
                  const kpItems = resources?.keypairs ?? [];
                  const { options, toForm, fromForm } = makeDupSafeSelect(
                    kpItems,
                    (k) => k.name,
                    (k) => k.name,
                  );
                  return (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <span className="bg-muted flex items-center justify-center rounded-full p-1">
                          <KeyRound className="text-muted-foreground h-4 w-4" />
                        </span>
                        Key Pair
                      </FormLabel>
                      <Select
                        onValueChange={(val) => field.onChange(toForm(val))}
                        value={fromForm(field.value)}
                      >
                        <FormControl>
                          <SelectTrigger className="w-full cursor-pointer rounded-full">
                            <SelectValue placeholder="Select key pair" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {options.map((opt) => (
                            <SelectItem key={`kp-${opt.key}`} value={opt.value}>
                              {opt.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  );
                }}
              />

              <FormField
                control={importForm.control}
                name="security_group"
                render={({ field }) => {
                  const sgItems = resources?.security_groups ?? [];
                  const { options, toForm, fromForm } = makeDupSafeSelect(
                    sgItems,
                    (g) => g.name,
                    (g) => g.name,
                  );
                  return (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <span className="bg-muted flex items-center justify-center rounded-full p-1">
                          <ShieldCheck className="text-muted-foreground h-4 w-4" />
                        </span>
                        Security Group
                      </FormLabel>
                      <Select
                        onValueChange={(val) => field.onChange(toForm(val))}
                        value={fromForm(field.value)}
                      >
                        <FormControl>
                          <SelectTrigger className="w-full cursor-pointer rounded-full">
                            <SelectValue placeholder="Select security group" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {options.map((opt) => (
                            <SelectItem key={`sg-${opt.key}`} value={opt.value}>
                              {opt.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  );
                }}
              />
            </div>

            <FormField
              control={importForm.control}
              name="admin_password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2">
                    <span className="bg-muted flex items-center justify-center rounded-full p-1">
                      <UserCog className="text-muted-foreground h-4 w-4" />
                    </span>
                    Admin Password
                  </FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      type="password"
                      placeholder="Enter admin password"
                      className="bg-input text-foreground rounded-full"
                    />
                  </FormControl>
                  <FormDescription>
                    Password for the imported VM&apos;s admin user
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Separator />

            <div className="flex justify-center sm:justify-end">
              <Button
                type="submit"
                disabled={importVMMutation.isPending || !importFile}
                className="bg-primary text-primary-foreground hover:bg-accent hover:text-accent-foreground w-full cursor-pointer rounded-full sm:w-auto"
              >
                {importVMMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 flex-shrink-0 animate-spin" />
                    <span className="truncate">Importing VM...</span>
                  </>
                ) : (
                  <>
                    <Download className="mr-2 h-4 w-4 flex-shrink-0" />
                    <span className="truncate">Import Virtual Machine</span>
                  </>
                )}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
