"use client";
import { Download, Loader2, Package, Upload } from "lucide-react";
import { useForm } from "react-hook-form";

import type { ResourcesResponse } from "@/types/ResponseInterfaces";

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
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { InfraService } from "@/lib/requests";
import type { ImportVMFormData } from "@/types/RequestInterfaces";
import { importVMSchema } from "@/types/RequestSchemas";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { ErrorCard } from "./ErrorCard";

export function ImportVM() {
  const [importFile, setImportFile] = useState<File | undefined>(undefined);
  const queryClient = useQueryClient();

  const importForm = useForm<ImportVMFormData>({
    resolver: zodResolver(importVMSchema),
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
    mutationFn: async (data: ImportVMFormData) => {
      if (!importFile) {
        throw new Error("Please select a VMDK file to import");
      }
      const formData = new FormData();
      formData.append("vmdk_file", importFile);
      formData.append("vm_name", data.vm_name);
      formData.append("description", data.description ?? "");
      formData.append("min_disk", data.min_disk?.toString() ?? "20");
      formData.append("min_ram", data.min_ram?.toString() ?? "2048");
      formData.append("is_public", data.is_public.toString());
      formData.append("flavor_id", data.flavor_id);
      formData.append("network_id", data.network_id);
      formData.append("key_name", data.key_name);
      formData.append("security_group", data.security_group);
      formData.append("admin_password", data.admin_password);
      return InfraService.importVMwareVM(formData);
    },
    onSuccess: async (response) => {
      toast.success("VM imported successfully!", {
        description: `VM \"${response.server.name}\" has been imported and deployed`,
      });
      importForm.reset();
      setImportFile(undefined);
      await queryClient.invalidateQueries({ queryKey: ["instances-list"] });
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
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (!file.name.toLowerCase().endsWith(".vmdk")) {
        toast.error("Invalid file type", {
          description: "Please select a valid VMDK file",
        });
        return;
      }
      setImportFile(file);
    }
  };

  if (resourcesLoading)
    return (
      <Card className="bg-card text-card-foreground border border-border/50 shadow-lg rounded-xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-full">
              <Skeleton className="h-5 w-5" />
            </div>
            <Skeleton className="h-6 w-48" />
          </CardTitle>
          <CardDescription>
            <Skeleton className="h-4 w-80" />
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="space-y-4">
              <div>
                <Skeleton className="h-4 w-20 mb-2" />
                <div className="flex items-center justify-center w-full">
                  <div className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-border rounded-lg">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <Skeleton className="w-8 h-8 mb-2" />
                      <Skeleton className="h-4 w-40 mb-2" />
                      <Skeleton className="h-3 w-24" />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <Separator />

            <div className="grid gap-6 grid-cols-1 sm:grid-cols-2">
              <div className="space-y-2">
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-10 w-full" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-10 w-full" />
              </div>
            </div>

            <div className="grid gap-6 grid-cols-1 sm:grid-cols-2">
              <div className="space-y-2">
                <Skeleton className="h-4 w-28" />
                <Skeleton className="h-10 w-full" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-4 w-28" />
                <Skeleton className="h-10 w-full" />
              </div>
            </div>

            <div className="grid gap-6 grid-cols-1 sm:grid-cols-2">
              <div className="space-y-2">
                <Skeleton className="h-4 w-12" />
                <Skeleton className="h-10 w-full" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-10 w-full" />
              </div>
            </div>

            <div className="grid gap-6 grid-cols-1 sm:grid-cols-2">
              <div className="space-y-2">
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-10 w-full" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-10 w-full" />
              </div>
            </div>

            <div className="space-y-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-3 w-64" />
            </div>

            <Separator />

            <div className="flex justify-center sm:justify-end">
              <Skeleton className="h-10 w-full sm:w-48" />
            </div>
          </div>
        </CardContent>
      </Card>
    );

  return (
    <Card className="bg-card text-card-foreground border border-border/50 shadow-lg rounded-xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <div className="p-2 bg-muted rounded-full">
            <Upload className="h-5 w-5 text-primary" />
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
                  <div className="flex items-center justify-center w-full">
                    <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-border rounded-lg cursor-pointer hover:border-border/80 transition-colors">
                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <Package className="w-8 h-8 mb-2 text-muted-foreground" />
                        <p className="mb-2 text-sm text-muted-foreground">
                          <span className="font-semibold">Click to upload</span>{" "}
                          or drag and drop
                        </p>
                        <p className="text-xs text-muted-foreground">
                          VMDK files only
                        </p>
                      </div>
                      <input
                        type="file"
                        className="hidden"
                        accept=".vmdk"
                        onChange={handleFileChange}
                      />
                    </label>
                  </div>
                  {importFile && (
                    <div className="mt-2 p-2 bg-muted rounded-lg">
                      <p className="text-sm">
                        Selected: {importFile.name} (
                        {(importFile.size / 1024 / 1024).toFixed(2)} MB)
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <Separator />

            <div className="grid gap-6 grid-cols-1 sm:grid-cols-2">
              <FormField
                control={importForm.control}
                name="vm_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>VM Name</FormLabel>
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
                    <FormLabel>Description (Optional)</FormLabel>
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

            <div className="grid gap-6 grid-cols-1 sm:grid-cols-2">
              <FormField
                control={importForm.control}
                name="min_disk"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Minimum Disk (GB)</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="number"
                        onChange={(e) => field.onChange(Number(e.target.value))}
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
                    <FormLabel>Minimum RAM (MB)</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="number"
                        onChange={(e) => field.onChange(Number(e.target.value))}
                        className="rounded-full bg-input text-foreground"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid gap-6 grid-cols-1 sm:grid-cols-2">
              <FormField
                control={importForm.control}
                name="flavor_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Flavor</FormLabel>
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
                    <FormLabel>Network</FormLabel>
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

            <div className="grid gap-6 grid-cols-1 sm:grid-cols-2">
              <FormField
                control={importForm.control}
                name="key_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Key Pair</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger className="w-full rounded-full cursor-pointer">
                          <SelectValue placeholder="Select key pair" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {resources?.keypairs.map((keypair) => (
                          <SelectItem key={keypair.name} value={keypair.name}>
                            {keypair.name}
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
                name="security_group"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Security Group</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger className="w-full rounded-full cursor-pointer">
                          <SelectValue placeholder="Select security group" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {resources?.security_groups.map((group) => (
                          <SelectItem key={group.name} value={group.name}>
                            {group.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={importForm.control}
              name="admin_password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Admin Password</FormLabel>
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
                className="rounded-full bg-primary text-primary-foreground hover:bg-accent hover:text-accent-foreground cursor-pointer w-full sm:w-auto"
              >
                {importVMMutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin flex-shrink-0" />
                    <span className="truncate">Importing VM...</span>
                  </>
                ) : (
                  <>
                    <Download className="h-4 w-4 mr-2 flex-shrink-0" />
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
