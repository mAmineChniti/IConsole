"use client";

import { ErrorCard } from "@/components/ErrorCard";
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
      <Card className="rounded-xl border shadow-lg bg-card text-card-foreground border-border/50">
        <CardHeader>
          <CardTitle className="flex gap-2 items-center">
            <div className="p-2 rounded-full bg-muted">
              <Skeleton className="w-5 h-5" />
            </div>
            <Skeleton className="w-44 h-6" />
          </CardTitle>
          <CardDescription>
            <Skeleton className="w-64 h-4" />
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div>
              <Skeleton className="mb-2 w-24 h-4" />
              <div className="flex justify-center items-center w-full">
                <div className="flex flex-col justify-center items-center w-full h-32 rounded-lg border-2 border-dashed border-border">
                  <div className="flex flex-col justify-center items-center pt-5 pb-6">
                    <div className="p-2 mb-2 rounded-full bg-muted">
                      <Skeleton className="w-8 h-8" />
                    </div>
                    <Skeleton className="mb-2 w-40 h-4" />
                    <Skeleton className="w-24 h-3" />
                  </div>
                </div>
              </div>
            </div>

            <Separator />

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div className="space-y-2">
                <div className="flex gap-2 items-center mb-1">
                  <div className="p-1 rounded-full bg-muted">
                    <Skeleton className="w-4 h-4" />
                  </div>
                  <Skeleton className="w-24 h-4" />
                </div>
                <Skeleton className="w-full h-10 rounded-full" />
              </div>
              <div className="space-y-2">
                <div className="flex gap-2 items-center mb-1">
                  <div className="p-1 rounded-full bg-muted">
                    <Skeleton className="w-4 h-4" />
                  </div>
                  <Skeleton className="w-32 h-4" />
                </div>
                <Skeleton className="w-full h-10 rounded-full" />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div className="space-y-2">
                <div className="flex gap-2 items-center mb-1">
                  <div className="p-1 rounded-full bg-muted">
                    <Skeleton className="w-4 h-4" />
                  </div>
                  <Skeleton className="w-24 h-4" />
                </div>
                <Skeleton className="w-full h-10 rounded-full" />
              </div>
              <div className="space-y-2">
                <div className="flex gap-2 items-center mb-1">
                  <div className="p-1 rounded-full bg-muted">
                    <Skeleton className="w-4 h-4" />
                  </div>
                  <Skeleton className="w-24 h-4" />
                </div>
                <Skeleton className="w-full h-10 rounded-full" />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div className="space-y-2">
                <div className="flex gap-2 items-center mb-1">
                  <div className="p-1 rounded-full bg-muted">
                    <Skeleton className="w-4 h-4" />
                  </div>
                  <Skeleton className="w-28 h-4" />
                </div>
                <Skeleton className="w-full h-10 rounded-full" />
              </div>
              <div className="space-y-2">
                <div className="flex gap-2 items-center mb-1">
                  <div className="p-1 rounded-full bg-muted">
                    <Skeleton className="w-4 h-4" />
                  </div>
                  <Skeleton className="w-32 h-4" />
                </div>
                <Skeleton className="w-full h-10 rounded-full" />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div className="space-y-2">
                <div className="flex gap-2 items-center mb-1">
                  <div className="p-1 rounded-full bg-muted">
                    <Skeleton className="w-4 h-4" />
                  </div>
                  <Skeleton className="w-28 h-4" />
                </div>
                <Skeleton className="w-full h-10 rounded-full" />
              </div>
              <div className="space-y-2">
                <div className="flex gap-2 items-center mb-1">
                  <div className="p-1 rounded-full bg-muted">
                    <Skeleton className="w-4 h-4" />
                  </div>
                  <Skeleton className="w-36 h-4" />
                </div>
                <Skeleton className="w-full h-10 rounded-full" />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex gap-2 items-center mb-1">
                <div className="p-1 rounded-full bg-muted">
                  <Skeleton className="w-4 h-4" />
                </div>
                <Skeleton className="w-36 h-4" />
              </div>
              <Skeleton className="w-full h-10 rounded-full" />
            </div>

            <Separator />

            <div className="flex justify-center sm:justify-end">
              <Skeleton className="w-full h-10 rounded-full sm:w-48" />
            </div>
          </div>
        </CardContent>
      </Card>
    );

  return (
    <Card className="rounded-xl border shadow-lg bg-card text-card-foreground border-border/50">
      <CardHeader>
        <CardTitle className="flex gap-2 items-center">
          <div className="p-2 rounded-full bg-muted">
            <Upload className="w-5 h-5 text-primary" />
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
                      "": [".vmdk"],
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
                          Accepts .vmdk
                        </p>
                      </div>
                    </DropzoneEmptyState>
                    <DropzoneContent />
                  </Dropzone>
                  {importForm.formState.errors.vmdk_file && (
                    <p className="mt-2 text-sm text-destructive">
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
                    <FormLabel className="flex gap-2 items-center">
                      <span className="flex justify-center items-center p-1 rounded-full bg-muted">
                        <Server className="w-4 h-4 text-muted-foreground" />
                      </span>
                      VM Name
                    </FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="Enter VM name"
                        className="rounded-full bg-input text-foreground"
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
                    <FormLabel className="flex gap-2 items-center">
                      <span className="flex justify-center items-center p-1 rounded-full bg-muted">
                        <FileText className="w-4 h-4 text-muted-foreground" />
                      </span>
                      Description (Optional)
                    </FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="Brief description"
                        className="rounded-full bg-input text-foreground"
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
                    <FormLabel className="flex gap-2 items-center">
                      <span className="flex justify-center items-center p-1 rounded-full bg-muted">
                        <HardDrive className="w-4 h-4 text-muted-foreground" />
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
                        className="rounded-full bg-input text-foreground"
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
                    <FormLabel className="flex gap-2 items-center">
                      <span className="flex justify-center items-center p-1 rounded-full bg-muted">
                        <MemoryStick className="w-4 h-4 text-muted-foreground" />
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
                        className="rounded-full bg-input text-foreground"
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
                    <FormLabel className="flex gap-2 items-center">
                      <span className="flex justify-center items-center p-1 rounded-full bg-muted">
                        <IceCream className="w-4 h-4 rotate-45 text-muted-foreground" />
                      </span>
                      Flavor
                    </FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger className="w-full rounded-full cursor-pointer">
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
                    <FormLabel className="flex gap-2 items-center">
                      <span className="flex justify-center items-center p-1 rounded-full bg-muted">
                        <Network className="w-4 h-4 text-muted-foreground" />
                      </span>
                      Network
                    </FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger className="w-full rounded-full cursor-pointer">
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
                      <FormLabel className="flex gap-2 items-center">
                        <span className="flex justify-center items-center p-1 rounded-full bg-muted">
                          <KeyRound className="w-4 h-4 text-muted-foreground" />
                        </span>
                        Key Pair
                      </FormLabel>
                      <Select
                        onValueChange={(val) => field.onChange(toForm(val))}
                        value={fromForm(field.value)}
                      >
                        <FormControl>
                          <SelectTrigger className="w-full rounded-full cursor-pointer">
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
                      <FormLabel className="flex gap-2 items-center">
                        <span className="flex justify-center items-center p-1 rounded-full bg-muted">
                          <ShieldCheck className="w-4 h-4 text-muted-foreground" />
                        </span>
                        Security Group
                      </FormLabel>
                      <Select
                        onValueChange={(val) => field.onChange(toForm(val))}
                        value={fromForm(field.value)}
                      >
                        <FormControl>
                          <SelectTrigger className="w-full rounded-full cursor-pointer">
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
                  <FormLabel className="flex gap-2 items-center">
                    <span className="flex justify-center items-center p-1 rounded-full bg-muted">
                      <UserCog className="w-4 h-4 text-muted-foreground" />
                    </span>
                    Admin Password
                  </FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      type="password"
                      placeholder="Enter admin password"
                      className="rounded-full bg-input text-foreground"
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
                className="w-full rounded-full cursor-pointer sm:w-auto bg-primary text-primary-foreground hover:bg-accent hover:text-accent-foreground"
              >
                {importVMMutation.isPending ? (
                  <>
                    <Loader2 className="flex-shrink-0 mr-2 w-4 h-4 animate-spin" />
                    <span className="truncate">Importing VM...</span>
                  </>
                ) : (
                  <>
                    <Download className="flex-shrink-0 mr-2 w-4 h-4" />
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
