import { XCombobox } from "@/components/reusable/XCombobox";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Skeleton } from "@/components/ui/skeleton";
import type { NetworkFormData } from "@/types/RequestInterfaces";
import type { ResourcesResponse } from "@/types/ResponseInterfaces";
import { Network, Shield } from "lucide-react";
import { type useForm } from "react-hook-form";

export function NetworkStep({
  form,
  resources,
  isLoading,
}: {
  form: ReturnType<typeof useForm<NetworkFormData>>;
  resources: ResourcesResponse | undefined;
  isLoading: boolean;
}) {
  if (isLoading)
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Skeleton className="h-4 w-4 flex-shrink-0" />
              <Skeleton className="h-4 w-16" />
            </div>
            <Skeleton className="h-11 w-full" />
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Skeleton className="h-4 w-4 flex-shrink-0" />
              <Skeleton className="h-4 w-16" />
            </div>
            <Skeleton className="h-11 w-full" />
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Skeleton className="h-4 w-4 flex-shrink-0" />
            <Skeleton className="h-4 w-24" />
          </div>
          <Skeleton className="h-11 w-full" />
        </div>
      </div>
    );

  return (
    <Form {...form}>
      <div className="space-y-6">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <FormField
            control={form.control}
            name="network_id"
            render={({ field }) => {
              const netItems = resources?.networks ?? [];
              return (
                <FormItem>
                  <FormLabel className="text-foreground flex items-center gap-2 text-sm font-medium">
                    <Network className="text-primary h-4 w-4 flex-shrink-0" />
                    <span className="truncate">Network</span>
                  </FormLabel>
                  <FormControl>
                    <XCombobox
                      data={netItems.map((n) => ({
                        label: n.name,
                        value: n.id,
                      }))}
                      value={field.value}
                      onChange={field.onChange}
                      type="network"
                      placeholder="Select network"
                      className="bg-input text-foreground border-border h-11 w-full"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              );
            }}
          />

          <FormField
            control={form.control}
            name="key_name"
            render={({ field }) => {
              const kpItems = resources?.keypairs ?? [];
              return (
                <FormItem>
                  <FormLabel className="text-foreground flex items-center gap-2 text-sm font-medium">
                    <Shield className="text-primary h-4 w-4 flex-shrink-0" />
                    <span className="truncate">Key Pair</span>
                  </FormLabel>
                  <FormControl>
                    <XCombobox
                      data={kpItems.map((k) => ({
                        label: k.name,
                        value: k.name,
                      }))}
                      value={field.value}
                      onChange={field.onChange}
                      type="key pair"
                      placeholder="Select key pair"
                      className="bg-input text-foreground border-border h-11 w-full"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              );
            }}
          />
        </div>

        <FormField
          control={form.control}
          name="security_group"
          render={({ field }) => {
            const sgItems = resources?.security_groups ?? [];
            return (
              <FormItem>
                <FormLabel className="text-foreground flex items-center gap-2 text-sm font-medium">
                  <Shield className="text-primary h-4 w-4 flex-shrink-0" />
                  <span className="truncate">Security Group</span>
                </FormLabel>
                <FormControl>
                  <XCombobox
                    data={sgItems.map((g) => ({
                      label: g.name,
                      value: g.name,
                    }))}
                    value={field.value}
                    onChange={field.onChange}
                    type="security group"
                    placeholder="Select security group"
                    className="bg-input text-foreground border-border h-11 w-full"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            );
          }}
        />
      </div>
    </Form>
  );
}
