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
import { MonitorStop } from "lucide-react";
import { type UseFormReturn } from "react-hook-form";

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
              <FormLabel className="flex gap-2 items-center text-base font-medium text-foreground">
                <MonitorStop className="flex-shrink-0 w-4 h-4 text-primary" />
                <span className="truncate">VM Name</span>
              </FormLabel>
              <FormControl>
                <Input
                  {...field}
                  placeholder="Enter VM name"
                  className="w-full h-11 rounded-full border bg-input text-foreground border-border"
                />
              </FormControl>
              <FormDescription className="text-sm leading-relaxed text-muted-foreground">
                A unique name to identify your virtual machine
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <FormField
            control={form.control}
            name="admin_username"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-medium text-foreground">
                  Admin Username
                </FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    placeholder="Enter admin username"
                    className="w-full h-11 rounded-full border bg-input text-foreground border-border"
                  />
                </FormControl>
                <FormDescription className="text-sm leading-relaxed text-muted-foreground">
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
                <FormLabel className="text-sm font-medium text-foreground">
                  Admin Password
                </FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    type="password"
                    placeholder="Enter admin password"
                    className="w-full h-11 rounded-full border bg-input text-foreground border-border"
                  />
                </FormControl>
                <FormDescription className="text-sm leading-relaxed text-muted-foreground">
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
