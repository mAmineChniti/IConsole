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
import type { ImageUpdateRequest } from "@/types/RequestInterfaces";
import { ImageUpdateRequestSchema } from "@/types/RequestSchemas";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

interface ImageEditDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  imageId?: string;
  initialData?: {
    name: string;
    visibility: "public" | "private" | "shared" | "community";
    protected: boolean;
  };
  onSuccess?: () => void;
}

export function ImageEditDialog({
  open,
  onOpenChange,
  imageId,
  initialData,
  onSuccess,
}: ImageEditDialogProps) {
  const queryClient = useQueryClient();

  const form = useForm<ImageUpdateRequest>({
    resolver: zodResolver(ImageUpdateRequestSchema),
    mode: "onChange",
  });

  const mutation = useMutation({
    mutationFn: async (data: ImageUpdateRequest) => {
      if (!imageId) throw new Error("No image ID provided");
      return await ImageService.updateImage(imageId, data);
    },
    onSuccess: async () => {
      toast.success("Image updated successfully");
      onOpenChange(false);
      await queryClient.invalidateQueries({ queryKey: ["images"] });
      onSuccess?.();
    },
    onError: (err: unknown) => {
      const message =
        err instanceof Error ? err.message : "An unexpected error occurred";
      toast.error(message);
    },
  });

  const onSubmit = form.handleSubmit((values) => {
    if (!imageId) return;

    const dirtyFields = form.formState.dirtyFields;
    const updateData: Partial<ImageUpdateRequest> = {};

    if (dirtyFields.new_name && values.new_name?.trim()) {
      updateData.new_name = values.new_name.trim();
    }

    if (dirtyFields.visibility && values.visibility) {
      updateData.visibility = values.visibility;
    }

    if (dirtyFields.protected !== undefined) {
      updateData.protected = values.protected;
    }

    if (Object.keys(updateData).length === 0) {
      onOpenChange(false);
      return;
    }

    mutation.mutate(updateData as ImageUpdateRequest);
  });

  useEffect(() => {
    if (initialData) {
      form.reset({
        new_name: initialData.name,
        visibility: initialData.visibility,
        protected: initialData.protected,
      });
    }
  }, [initialData, form]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-card text-card-foreground border-border/50 left-1/2 mx-4 max-w-[calc(100vw-2rem)] translate-x-[-50%] rounded-2xl border shadow-lg sm:mx-0 sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="truncate text-lg font-semibold">
            Edit Image
          </DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={onSubmit} className="space-y-4">
            <FormField
              control={form.control}
              name="new_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="My Image"
                      className="h-10 w-full rounded-full"
                      value={field.value ?? ""}
                      onChange={(e) =>
                        field.onChange(
                          e.target.value.trim() === ""
                            ? undefined
                            : e.target.value,
                        )
                      }
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
                        { label: "private", value: "private" },
                        { label: "public", value: "public" },
                        { label: "shared", value: "shared" },
                        { label: "community", value: "community" },
                      ]}
                      value={field.value}
                      onChange={field.onChange}
                      placeholder="Select visibility"
                      searchPlaceholder="Search visibility..."
                      emptyText="No visibility options"
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
                <FormItem className="flex items-center justify-between rounded-lg border px-3 py-2">
                  <div className="space-y-0.5">
                    <FormLabel className="text-sm font-medium">
                      Protected
                    </FormLabel>
                    <p className="text-muted-foreground text-xs">
                      Prevent deletion of this image
                    </p>
                  </div>
                  <FormControl>
                    <Switch
                      className="cursor-pointer"
                      checked={!!field.value}
                      onCheckedChange={field.onChange}
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
                onClick={() => onOpenChange(false)}
                disabled={mutation.isPending}
              >
                <span className="truncate">Cancel</span>
              </Button>
              <Button
                type="submit"
                variant="default"
                disabled={
                  mutation.isPending || !imageId || !form.formState.isDirty
                }
                className="order-1 w-full min-w-[140px] cursor-pointer gap-2 rounded-full sm:order-2 sm:w-auto"
              >
                {mutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 flex-shrink-0 animate-spin" />
                    <span className="truncate">Saving...</span>
                  </>
                ) : (
                  <span className="truncate">Save</span>
                )}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
