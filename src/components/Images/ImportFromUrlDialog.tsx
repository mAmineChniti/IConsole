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
import type { ImageImportFromUrlRequest } from "@/types/RequestInterfaces";
import { ImageImportFromUrlRequestSchema } from "@/types/RequestSchemas";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Loader2, Upload } from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

export function ImportFromUrlDialog({
  open,
  onOpenChange,
  onCancel,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCancel: () => void;
}) {
  const queryClient = useQueryClient();

  const form = useForm<ImageImportFromUrlRequest>({
    resolver: zodResolver(ImageImportFromUrlRequestSchema),
    defaultValues: {
      image_url: "",
      image_name: "",
      visibility: "private",
    },
  });

  const importMutation = useMutation({
    mutationFn: (data: ImageImportFromUrlRequest) =>
      ImageService.importFromUrl(data),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["images"] });
      onOpenChange(false);
      form.reset();
      toast.success("Image imported successfully");
    },
    onError: (error: Error) => {
      toast.error(`Failed to import image: ${error.message}`);
    },
  });

  const handleSubmit = form.handleSubmit((data) => {
    importMutation.mutate(data);
  });
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-card text-card-foreground border-border/50 left-1/2 mx-4 max-w-[calc(100vw-2rem)] translate-x-[-50%] rounded-2xl border shadow-lg sm:mx-0 sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="truncate text-lg font-semibold">
            Import Image from URL
          </DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={handleSubmit} className="space-y-4">
            <FormField
              control={form.control}
              name="image_url"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Image URL</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="https://.../image.qcow2"
                      className="h-10 w-full rounded-full"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="image_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Image Name</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="my-image"
                      className="h-10 w-full rounded-full"
                      {...field}
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
                disabled={importMutation.isPending}
              >
                <span className="truncate">Cancel</span>
              </Button>
              <Button
                type="submit"
                variant="default"
                disabled={importMutation.isPending}
                className="order-1 w-full min-w-[140px] cursor-pointer gap-2 rounded-full sm:order-2 sm:w-auto"
              >
                {importMutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 flex-shrink-0 animate-spin" />
                    <span className="truncate">Importing...</span>
                  </>
                ) : (
                  <>
                    <Upload className="h-4 w-4 flex-shrink-0" />
                    <span className="truncate">Import</span>
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
