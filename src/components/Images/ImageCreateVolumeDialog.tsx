import { XCombobox } from "@/components/reusable/XCombobox";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
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
import { Switch } from "@/components/ui/switch";
import { ImageService } from "@/lib/requests";
import type { ImageCreateVolumeRequest } from "@/types/RequestInterfaces";
import { ImageCreateVolumeRequestSchema } from "@/types/RequestSchemas";
import type { Image } from "@/types/ResponseInterfaces";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

interface ImageCreateVolumeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  image: Image | undefined;
}

type CreateVolumeFormValues = Omit<ImageCreateVolumeRequest, "image_id">;
const CreateVolumeFormSchema = ImageCreateVolumeRequestSchema.omit({
  image_id: true,
});

export function ImageCreateVolumeDialog({
  open,
  onOpenChange,
  image,
}: ImageCreateVolumeDialogProps) {
  const form = useForm<CreateVolumeFormValues>({
    resolver: zodResolver(CreateVolumeFormSchema),
    defaultValues: {
      name: "",
      size: 1,
      visibility: "private",
      protected: false,
    },
  });

  const createVolumeMutation = useMutation({
    mutationFn: async (formData: ImageCreateVolumeRequest) => {
      return await ImageService.createVolume(formData);
    },
    onSuccess: async () => {
      toast.success("Volume created successfully");
      form.reset();
      onOpenChange(false);
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

  const handleSubmit = form.handleSubmit((values) => {
    if (!image) return;
    createVolumeMutation.mutate({
      ...values,
      image_id: image.id,
    });
  });

  useEffect(() => {
    if (open && image) {
      form.reset({
        name: `${image.name}-volume`,
        size: 1,
        visibility: image.visibility === "public" ? "public" : "private",
        protected: image.protected,
      });
    }
  }, [open, image, form]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-card text-card-foreground border-border/50 left-1/2 mx-4 max-w-[calc(100vw-2rem)] translate-x-[-50%] rounded-2xl border shadow-lg sm:mx-0 sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="truncate text-lg font-semibold">
            Create Volume
          </DialogTitle>
        </DialogHeader>
        {image && (
          <div className="text-muted-foreground mb-2 text-sm">
            From image:{" "}
            <span className="text-foreground font-medium">{image.name}</span>
          </div>
        )}
        <Form {...form}>
          <form onSubmit={handleSubmit} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Volume Name</FormLabel>
                  <FormControl>
                    <Input type="text" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="size"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Volume Size (GB)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min={1}
                      {...field}
                      onChange={(e) => field.onChange(Number(e.target.value))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="visibility"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Visibility</FormLabel>
                  <FormControl>
                    <XCombobox
                      type="visibility"
                      data={[
                        { label: "Private", value: "private" },
                        { label: "Public", value: "public" },
                      ]}
                      value={field.value}
                      onChange={field.onChange}
                      placeholder="Select visibility"
                      className="w-full"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="protected"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">Protected</FormLabel>
                    <p className="text-muted-foreground text-sm">
                      Prevents accidental deletion
                    </p>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            <Button
              type="submit"
              className="w-full"
              disabled={createVolumeMutation.isPending}
            >
              {createVolumeMutation.isPending ? "Creating..." : "Create Volume"}
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
