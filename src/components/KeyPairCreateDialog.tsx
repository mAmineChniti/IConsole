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
  Form,
  FormControl,
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
import { KeyPairService } from "@/lib/requests";
import type { KeyPairCreateRequest } from "@/types/RequestInterfaces";
import { KeyPairCreateRequestSchema } from "@/types/RequestSchemas";
import type { KeyPairCreateResponse } from "@/types/ResponseInterfaces";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { Loader2, Plus, X } from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

export function KeyPairCreateDialog({
  open,
  onOpenChange,
  onSuccess,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: (res: KeyPairCreateResponse) => void | Promise<void>;
}) {
  const form = useForm<KeyPairCreateRequest>({
    resolver: zodResolver(KeyPairCreateRequestSchema),
    defaultValues: {
      name: "",
      key_type: undefined,
    },
  });

  const createMutation = useMutation<
    KeyPairCreateResponse,
    unknown,
    KeyPairCreateRequest
  >({
    mutationFn: (payload: KeyPairCreateRequest) =>
      KeyPairService.create(payload),
    onSuccess: async (res: KeyPairCreateResponse) => {
      toast.success(res?.message ?? "Key pair created");
      onOpenChange(false);
      form.reset();
      await onSuccess?.(res);
    },
    onError: (err: unknown) => {
      const message =
        err instanceof Error ? err.message : "Failed to create key pair";
      toast.error(message);
    },
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>New Key Pair</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit((data) => createMutation.mutate(data))}
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
                      placeholder="e.g. workstation-ed25519"
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
              name="key_type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Key type (optional)</FormLabel>
                  <Select
                    value={field.value ?? ""}
                    onValueChange={(value) => {
                      field.onChange(
                        value === ""
                          ? undefined
                          : (value as KeyPairCreateRequest["key_type"]),
                      );
                    }}
                  >
                    <FormControl>
                      <SelectTrigger className="h-10 w-full cursor-pointer rounded-full">
                        <SelectValue placeholder="Default (provider)" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="ssh">ssh</SelectItem>
                      <SelectItem value="x509">x509</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                className="cursor-pointer gap-2 rounded-full"
                onClick={() => onOpenChange(false)}
                disabled={createMutation.isPending}
              >
                <X className="h-4 w-4" />
                <span>Cancel</span>
              </Button>
              <Button
                type="submit"
                variant="default"
                className="min-w-[120px] cursor-pointer gap-2 rounded-full"
                disabled={createMutation.isPending}
              >
                {createMutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Creating...</span>
                  </>
                ) : (
                  <>
                    <Plus className="h-4 w-4" />
                    <span>Create</span>
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
