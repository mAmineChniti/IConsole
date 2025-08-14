import { MonitorStop } from "lucide-react";
import { type UseFormReturn } from "react-hook-form";

import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import type { VMDetailsFormData } from "@/types/RequestInterfaces";

export function DetailsStep({
  form,
}: {
  form: UseFormReturn<VMDetailsFormData>;
}) {
  return (
    <Form {...form}>
      <div className="space-y-6">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="flex items-center gap-2 text-base font-medium">
                <MonitorStop className="h-4 w-4 flex-shrink-0" />
                <span className="truncate">VM Name</span>
              </FormLabel>
              <FormControl>
                <Input
                  {...field}
                  placeholder="Enter VM name"
                  className="h-11 w-full"
                />
              </FormControl>
              <FormDescription className="text-sm text-muted-foreground leading-relaxed">
                A unique name to identify your virtual machine
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid gap-6 grid-cols-1 sm:grid-cols-2">
          <FormField
            control={form.control}
            name="admin_username"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-medium">
                  Admin Username
                </FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    placeholder="Enter admin username"
                    className="h-11 w-full"
                  />
                </FormControl>
                <FormDescription className="text-sm text-muted-foreground leading-relaxed">
                  The administrative username for the VM
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="admin_password"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-medium">
                  Admin Password
                </FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    type="password"
                    placeholder="Enter admin password"
                    className="h-11 w-full"
                  />
                </FormControl>
                <FormDescription className="text-sm text-muted-foreground leading-relaxed">
                  The password for the administrative user
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </div>
    </Form>
  );
}
