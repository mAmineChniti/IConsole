import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
        <div className="grid gap-6 grid-cols-1 sm:grid-cols-2">
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
        <div className="grid gap-6 grid-cols-1 sm:grid-cols-2">
          <FormField
            control={form.control}
            name="network_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-center gap-2 text-sm font-medium text-foreground">
                  <Network className="h-4 w-4 flex-shrink-0 text-primary" />
                  <span className="truncate">Network</span>
                </FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger className="h-11 w-full rounded-full bg-input text-foreground border border-border cursor-pointer">
                      <SelectValue placeholder="Select network" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent className="bg-card text-card-foreground border border-border rounded-xl shadow-lg">
                    {resources?.networks?.map((network) => (
                      <SelectItem
                        key={network.id}
                        value={network.id}
                        className="rounded-full"
                      >
                        <span className="truncate">{network.name}</span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="key_name"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-center gap-2 text-sm font-medium text-foreground">
                  <Shield className="h-4 w-4 flex-shrink-0 text-primary" />
                  <span className="truncate">Key Pair</span>
                </FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger className="h-11 w-full rounded-full bg-input text-foreground border border-border cursor-pointer">
                      <SelectValue placeholder="Select key pair" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent className="bg-card text-card-foreground border border-border rounded-xl shadow-lg">
                    {resources?.keypairs?.map((keypair) => (
                      <SelectItem
                        key={keypair.name}
                        value={keypair.name}
                        className="rounded-full"
                      >
                        <span className="truncate">{keypair.name}</span>
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
          control={form.control}
          name="security_group"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="flex items-center gap-2 text-sm font-medium text-foreground">
                <Shield className="h-4 w-4 flex-shrink-0 text-primary" />
                <span className="truncate">Security Group</span>
              </FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger className="h-11 w-full rounded-full bg-input text-foreground border border-border cursor-pointer">
                    <SelectValue placeholder="Select security group" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent className="bg-card text-card-foreground border border-border rounded-xl shadow-lg">
                  {resources?.security_groups?.map((group) => (
                    <SelectItem
                      key={group.name}
                      value={group.name}
                      className="rounded-full"
                    >
                      <span className="truncate">{group.name}</span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </Form>
  );
}
