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
import type { VolumeExtendRequest } from "@/types/RequestInterfaces";
import { VolumeExtendRequestSchema } from "@/types/RequestSchemas";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

export function VolumeExtendDialog({
  open,
  onOpenChange,
  volumeId,
  currentSize,
  onSuccess,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  volumeId: string | undefined;
  currentSize: number;
  onSuccess?: () => void;
}) {
  const queryClient = useQueryClient();
  const safeCurrentSize = Number.isFinite(currentSize) ? currentSize : 1;

  const form = useForm<Omit<VolumeExtendRequest, "volume_id">>({
    resolver: zodResolver(VolumeExtendRequestSchema),
    defaultValues: {
      new_size: safeCurrentSize + 1,
    },
  });

  const extendMutation = useMutation({
    mutationFn: ({
      volume_id,
      new_size,
    }: {
      volume_id: string;
      new_size: number;
    }) => VolumeService.extend({ volume_id, new_size }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["volumes"] });
      toast.success("Volume extended successfully");
      onOpenChange(false);
      onSuccess?.();
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to extend volume");
    },
  });

  const onSubmit = (data: Omit<VolumeExtendRequest, "volume_id">) => {
    if (!volumeId || data.new_size <= safeCurrentSize) return;
    extendMutation.mutate({ volume_id: volumeId, new_size: data.new_size });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Extend Volume</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="new_size"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>New Size (GB)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min={safeCurrentSize + 1}
                      step={1}
                      placeholder={(safeCurrentSize + 1).toString()}
                      className="w-full rounded-full"
                      {...field}
                      onChange={(e) =>
                        field.onChange(
                          parseInt(e.target.value, 10) || safeCurrentSize + 1,
                        )
                      }
                    />
                  </FormControl>
                  <div className="text-muted-foreground mt-1 text-xs">
                    Current size: {safeCurrentSize} GB
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={extendMutation.isPending}
                className="cursor-pointer rounded-full"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="default"
                disabled={
                  extendMutation.isPending ||
                  form.watch("new_size") <= safeCurrentSize
                }
                className="rounded-full"
              >
                {extendMutation.isPending ? "Extending..." : "Extend"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
