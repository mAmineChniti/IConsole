import { XCombobox } from "@/components/reusable/XCombobox";
import { Button } from "@/components/ui/button";
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
import { VolumeService } from "@/lib/requests";
import type { VolumeUploadToImageRequest } from "@/types/RequestInterfaces";
import { VolumeUploadToImageRequestSchema } from "@/types/RequestSchemas";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

export function VolumeUploadToImageDialog({
  open,
  onOpenChange,
  volumeId,
  onSuccess,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  volumeId: string;
  onSuccess?: () => void;
}) {
  const queryClient = useQueryClient();

  const form = useForm<Omit<VolumeUploadToImageRequest, "volume_id">>({
    resolver: zodResolver(
      VolumeUploadToImageRequestSchema.omit({ volume_id: true }),
    ),
    defaultValues: {
      image_name: "",
      disk_format: "qcow2",
      container_format: "bare",
    },
  });

  const uploadToImageMutation = useMutation({
    mutationFn: (data: VolumeUploadToImageRequest) =>
      VolumeService.uploadToImage(data),
    onSuccess: async () => {
      toast.success("Volume uploaded to image successfully");
      onOpenChange(false);
      form.reset();
      await queryClient.invalidateQueries({ queryKey: ["images"] });
      await queryClient.invalidateQueries({ queryKey: ["volumes"] });
      onSuccess?.();
    },
    onError: (error: unknown) => {
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to upload volume to image",
      );
    },
  });

  const onSubmit = (data: Omit<VolumeUploadToImageRequest, "volume_id">) => {
    if (!volumeId) {
      return;
    }
    const submitData: VolumeUploadToImageRequest = {
      volume_id: volumeId,
      ...data,
    };
    uploadToImageMutation.mutate(submitData);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Upload Volume to Image</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="image_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Image Name</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="Enter a name for the new image"
                      className="rounded-full"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="disk_format"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Disk Format (Optional)</FormLabel>
                  <FormControl>
                    <XCombobox
                      type="disk format"
                      data={[
                        { label: "RAW", value: "raw" },
                        { label: "QCOW2 (default)", value: "qcow2" },
                        { label: "VMDK", value: "vmdk" },
                        { label: "VDI", value: "vdi" },
                      ]}
                      value={field.value}
                      onChange={field.onChange}
                      placeholder="Select disk format (default: qcow2)"
                      className="w-full"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="container_format"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Container Format (Optional)</FormLabel>
                  <FormControl>
                    <XCombobox
                      type="container format"
                      data={[
                        { label: "Bare (default)", value: "bare" },
                        { label: "OVF", value: "ovf" },
                        { label: "OVA", value: "ova" },
                      ]}
                      value={field.value}
                      onChange={field.onChange}
                      placeholder="Select container format (default: bare)"
                      className="w-full"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                className="cursor-pointer rounded-full"
                onClick={() => onOpenChange(false)}
                disabled={uploadToImageMutation.isPending}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="default"
                className="cursor-pointer rounded-full"
                disabled={uploadToImageMutation.isPending}
              >
                {uploadToImageMutation.isPending ? "Uploading..." : "Upload"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
