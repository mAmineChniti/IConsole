"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Dropzone,
  DropzoneContent,
  DropzoneEmptyState,
} from "@/components/ui/dropzone";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { KeyPairService } from "@/lib/requests";
import type { KeyPairImportFromFileRequest } from "@/types/RequestInterfaces";
import { KeyPairImportFromFileRequestSchema } from "@/types/RequestSchemas";
import type { KeyPairImportResponse } from "@/types/ResponseInterfaces";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { Loader2, Upload, X } from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

export function KeyPairImportDialog({
  open,
  onOpenChange,
  onSuccess,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: (res: KeyPairImportResponse) => void | Promise<void>;
}) {
  const form = useForm<KeyPairImportFromFileRequest>({
    resolver: zodResolver(KeyPairImportFromFileRequestSchema),
    defaultValues: {
      name: "",
      public_key: undefined as unknown as File,
    },
  });

  const watchedFile = form.watch("public_key") as File | undefined;

  const importMutation = useMutation<
    KeyPairImportResponse,
    unknown,
    KeyPairImportFromFileRequest
  >({
    mutationFn: (payload: KeyPairImportFromFileRequest) =>
      KeyPairService.importFromFile({
        name: payload.name,
        public_key: payload.public_key,
      }),
    onSuccess: async (res: KeyPairImportResponse) => {
      toast.success(res?.message ?? "Key pair imported");
      onOpenChange(false);
      form.reset();
      await onSuccess?.(res);
    },
    onError: (err: unknown) => {
      const message =
        err instanceof Error ? err.message : "Failed to import key pair";
      toast.error(message);
    },
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Import Public Key</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit((data) => importMutation.mutate(data))}
            className="space-y-4"
          >
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g. laptop-rsa"
                      className="rounded-full"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="public_key"
              render={() => (
                <FormItem>
                  <FormLabel>Public key file (.pub)</FormLabel>
                  <FormControl>
                    <div className="space-y-2">
                      <Dropzone
                        accept={{
                          "text/plain": [".pub"],
                          "application/octet-stream": [".pub"],
                        }}
                        maxFiles={1}
                        src={watchedFile ? [watchedFile] : undefined}
                        onDrop={(accepted) => {
                          const file = accepted?.[0];
                          if (file) {
                            form.setValue("public_key", file, {
                              shouldValidate: true,
                            });
                          }
                          form.clearErrors("public_key");
                        }}
                        onError={(err) => {
                          form.setError("public_key", {
                            type: "validate",
                            message: err.message || "Invalid key file",
                          });
                          toast.error(err.message || "Invalid key file");
                        }}
                        className="p-0 rounded-2xl border-dashed cursor-pointer"
                      >
                        <DropzoneEmptyState className="py-6" />
                        <DropzoneContent className="py-6" />
                      </Dropzone>
                      {watchedFile && (
                        <div className="text-sm text-muted-foreground">
                          Selected: {watchedFile.name} (
                          {(watchedFile.size / 1024).toFixed(2)} KB)
                        </div>
                      )}
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                className="gap-2 rounded-full cursor-pointer"
                onClick={() => onOpenChange(false)}
                disabled={importMutation.isPending}
              >
                <X className="w-4 h-4" />
                <span>Cancel</span>
              </Button>
              <Button
                type="submit"
                variant="default"
                className="gap-2 rounded-full cursor-pointer min-w-[120px]"
                disabled={importMutation.isPending}
              >
                {importMutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Importing...</span>
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4" />
                    <span>Import</span>
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
