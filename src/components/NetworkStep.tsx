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
import { makeDupSafeSelect } from "@/lib/utils";
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
            <div className="flex gap-2 items-center">
              <Skeleton className="flex-shrink-0 w-4 h-4" />
              <Skeleton className="w-16 h-4" />
            </div>
            <Skeleton className="w-full h-11" />
          </div>

          <div className="space-y-2">
            <div className="flex gap-2 items-center">
              <Skeleton className="flex-shrink-0 w-4 h-4" />
              <Skeleton className="w-16 h-4" />
            </div>
            <Skeleton className="w-full h-11" />
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex gap-2 items-center">
            <Skeleton className="flex-shrink-0 w-4 h-4" />
            <Skeleton className="w-24 h-4" />
          </div>
          <Skeleton className="w-full h-11" />
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
              const { options, toForm, fromForm } = makeDupSafeSelect(
                netItems,
                (n) => n.id,
                (n) => n.name,
              );
              return (
                <FormItem>
                  <FormLabel className="flex gap-2 items-center text-sm font-medium text-foreground">
                    <Network className="flex-shrink-0 w-4 h-4 text-primary" />
                    <span className="truncate">Network</span>
                  </FormLabel>
                  <Select
                    onValueChange={(val) => field.onChange(toForm(val))}
                    value={fromForm(field.value)}
                  >
                    <FormControl>
                      <SelectTrigger className="w-full h-11 rounded-full border cursor-pointer bg-input text-foreground border-border">
                        <SelectValue placeholder="Select network" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="rounded-xl border shadow-lg bg-card text-card-foreground border-border">
                      {options.map((opt) => (
                        <SelectItem
                          key={`net-${opt.key}`}
                          value={opt.value}
                          className="rounded-full"
                        >
                          <span className="truncate">{opt.label}</span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
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
              const { options, toForm, fromForm } = makeDupSafeSelect(
                kpItems,
                (k) => k.name,
                (k) => k.name,
              );
              return (
                <FormItem>
                  <FormLabel className="flex gap-2 items-center text-sm font-medium text-foreground">
                    <Shield className="flex-shrink-0 w-4 h-4 text-primary" />
                    <span className="truncate">Key Pair</span>
                  </FormLabel>
                  <Select
                    onValueChange={(val) => field.onChange(toForm(val))}
                    value={fromForm(field.value)}
                  >
                    <FormControl>
                      <SelectTrigger className="w-full h-11 rounded-full border cursor-pointer bg-input text-foreground border-border">
                        <SelectValue placeholder="Select key pair" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="rounded-xl border shadow-lg bg-card text-card-foreground border-border">
                      {options.map((opt) => (
                        <SelectItem
                          key={`kp-${opt.key}`}
                          value={opt.value}
                          className="rounded-full"
                        >
                          <span className="truncate">{opt.label}</span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
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
            const { options, toForm, fromForm } = makeDupSafeSelect(
              sgItems,
              (g) => g.name,
              (g) => g.name,
            );
            return (
              <FormItem>
                <FormLabel className="flex gap-2 items-center text-sm font-medium text-foreground">
                  <Shield className="flex-shrink-0 w-4 h-4 text-primary" />
                  <span className="truncate">Security Group</span>
                </FormLabel>
                <Select
                  onValueChange={(val) => field.onChange(toForm(val))}
                  value={fromForm(field.value)}
                >
                  <FormControl>
                    <SelectTrigger className="w-full h-11 rounded-full border cursor-pointer bg-input text-foreground border-border">
                      <SelectValue placeholder="Select security group" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent className="rounded-xl border shadow-lg bg-card text-card-foreground border-border">
                    {options.map((opt) => (
                      <SelectItem
                        key={`sg-${opt.key}`}
                        value={opt.value}
                        className="rounded-full"
                      >
                        <span className="truncate">{opt.label}</span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            );
          }}
        />
      </div>
    </Form>
  );
}
