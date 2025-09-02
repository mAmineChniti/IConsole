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
              <FormLabel className="text-foreground flex items-center gap-2 text-base font-medium">
                <MonitorStop className="text-primary h-4 w-4 flex-shrink-0" />
                <span className="truncate">VM Name</span>
              </FormLabel>
              <FormControl>
                <Input
                  {...field}
                  placeholder="Enter VM name"
                  className="bg-input text-foreground border-border h-11 w-full rounded-full border"
                />
              </FormControl>
              <FormDescription className="text-muted-foreground text-sm leading-relaxed">
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
                <FormLabel className="text-foreground text-sm font-medium">
                  Admin Username
                </FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    placeholder="Enter admin username"
                    className="bg-input text-foreground border-border h-11 w-full rounded-full border"
                  />
                </FormControl>
                <FormDescription className="text-muted-foreground text-sm leading-relaxed">
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
                <FormLabel className="text-foreground text-sm font-medium">
                  Admin Password
                </FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    type="password"
                    placeholder="Enter admin password"
                    className="bg-input text-foreground border-border h-11 w-full rounded-full border"
                  />
                </FormControl>
                <FormDescription className="text-muted-foreground text-sm leading-relaxed">
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
