import { MonitorStop } from "lucide-react";
import { type useForm } from "react-hook-form";
import type { z } from "zod";

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
import { type vmDetailsSchema } from "@/types/RequestSchemas";

type VMDetailsFormData = z.infer<typeof vmDetailsSchema>;

export function DetailsStep({
  form,
}: {
  form: ReturnType<typeof useForm<VMDetailsFormData>>;
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
                <MonitorStop className="h-4 w-4" />
                VM Name
              </FormLabel>
              <FormControl>
                <Input
                  {...field}
                  placeholder="Enter VM name"
                  className="h-11"
                />
              </FormControl>
              <FormDescription className="text-sm text-muted-foreground">
                A unique name to identify your virtual machine
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid gap-6 md:grid-cols-2">
          <FormField
            control={form.control}
            name="admin_username"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-base font-medium">
                  Admin Username
                </FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    placeholder="Enter admin username"
                    className="h-11"
                  />
                </FormControl>
                <FormDescription className="text-sm text-muted-foreground">
                  Default administrator account name
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
                <FormLabel className="text-base font-medium">
                  Admin Password
                </FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    type="password"
                    placeholder="Enter admin password"
                    className="h-12"
                  />
                </FormControl>
                <FormDescription className="text-sm text-muted-foreground">
                  Minimum 8 characters required
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
