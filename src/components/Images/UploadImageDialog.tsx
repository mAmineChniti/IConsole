import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
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
import { Switch } from "@/components/ui/switch";
import { ImageService } from "@/lib/requests";
import type { ImageImportFromUploadRequest } from "@/types/RequestInterfaces";
import { ImageImportFromUploadRequestSchema } from "@/types/RequestSchemas";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Loader2, Upload } from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

export function UploadImageDialog({
  open,
  onOpenChange,
  onCancel,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCancel: () => void;
}) {
  const queryClient = useQueryClient();
  const uploadForm = useForm<ImageImportFromUploadRequest>({
    resolver: zodResolver(ImageImportFromUploadRequestSchema),
    defaultValues: {
      file: undefined as unknown as File,
      image_name: "",
      visibility: "private",
    },
  });
  const uploadMutation = useMutation({
    mutationFn: (data: ImageImportFromUploadRequest) =>
      ImageService.importFromUpload(data),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["images"] });
      toast.success("Image uploaded successfully");
      onOpenChange(false);
      uploadForm.reset();
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to upload image");
    },
  });

  const handleUploadImage = (data: ImageImportFromUploadRequest) => {
    uploadMutation.mutate(data);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-card text-card-foreground border-border/50 left-1/2 mx-4 max-w-[calc(100vw-2rem)] translate-x-[-50%] rounded-2xl border shadow-lg sm:mx-0 sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="truncate text-lg font-semibold">
            Upload Image File
          </DialogTitle>
        </DialogHeader>
        <Form {...uploadForm}>
          <form
            onSubmit={uploadForm.handleSubmit(handleUploadImage)}
            className="space-y-4"
          >
            <FormField
              control={uploadForm.control}
              name="file"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Image File</FormLabel>
                  <FormControl>
                    <div>
                      <Dropzone
                        src={field.value ? [field.value] : undefined}
                        maxFiles={1}
                        accept={{
                          "application/octet-stream": [
                            ".qcow2",
                            ".raw",
                            ".vmdk",
                            ".vdi",
                            ".img",
                            ".iso",
                          ],
                          "": [
                            ".qcow2",
                            ".raw",
                            ".vmdk",
                            ".vdi",
                            ".img",
                            ".iso",
                          ],
                        }}
                        onDrop={(accepted) => {
                          const file = accepted?.[0];
                          if (!file) return;
                          field.onChange(file);
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
                              Accepts .qcow2, .raw, .vmdk, .vdi, .img, .iso
                            </p>
                          </div>
                        </DropzoneEmptyState>
                        <DropzoneContent />
                      </Dropzone>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={uploadForm.control}
              name="image_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Image Name</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="My Image"
                      className="h-10 w-full rounded-full"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={uploadForm.control}
              name="visibility"
              render={({ field }) => (
                <FormItem className="flex items-center justify-between rounded-lg border px-3 py-2">
                  <div className="space-y-0.5">
                    <FormLabel className="text-sm font-medium">
                      Visibility
                    </FormLabel>
                    <p className="text-muted-foreground text-xs">
                      Toggle to make the image public
                    </p>
                  </div>
                  <FormControl>
                    <Switch
                      className="cursor-pointer"
                      checked={field.value === "public"}
                      onCheckedChange={(c) =>
                        field.onChange(c ? "public" : "private")
                      }
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            <div className="flex flex-col justify-end gap-3 sm:flex-row">
              <Button
                type="button"
                variant="outline"
                className="order-2 w-full cursor-pointer rounded-full sm:order-1 sm:w-auto"
                onClick={onCancel}
                disabled={uploadMutation.isPending}
              >
                <span className="truncate">Cancel</span>
              </Button>
              <Button
                type="submit"
                variant="default"
                disabled={uploadMutation.isPending}
                className="order-1 w-full min-w-[140px] cursor-pointer gap-2 rounded-full sm:order-2 sm:w-auto"
              >
                {uploadMutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 flex-shrink-0 animate-spin" />
                    <span className="truncate">Uploading...</span>
                  </>
                ) : (
                  <>
                    <Upload className="h-4 w-4 flex-shrink-0" />
                    <span className="truncate">Upload</span>
                  </>
                )}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
