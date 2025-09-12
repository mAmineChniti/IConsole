"use client";

import { GetDistroIcon } from "@/components/Images/GetDistroIcon";
import { Card, CardContent } from "@/components/ui/card";
import { Form, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import type { ImageFormData } from "@/types/RequestInterfaces";
import type { ResourcesResponse } from "@/types/ResponseInterfaces";
import type { useForm } from "react-hook-form";

type ResourceImageItem = ResourcesResponse["images"][number];

export function ImageStep({
  form,
  resources,
  isLoading,
}: {
  form: ReturnType<typeof useForm<ImageFormData>>;
  resources: ResourcesResponse | undefined;
  isLoading: boolean;
}) {
  if (isLoading)
    return (
      <div className="space-y-6">
        <div className="space-y-2">
          <Skeleton className="h-5 w-48" />
          <Skeleton className="h-4 w-64" />
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card
              key={i}
              className="text-card-foreground border-border rounded-xl border bg-neutral-50 shadow-lg dark:bg-neutral-900"
            >
              <CardContent className="p-4">
                <div className="mb-3 flex items-center gap-3">
                  <div className="bg-accent h-9 w-9 rounded-full p-2" />
                  <Skeleton className="h-5 w-40" />
                </div>
                <div className="space-y-2">
                  <Skeleton className="h-6 w-32 rounded-full" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );

  return (
    <Form {...form}>
      <div className="space-y-6">
        <FormField
          control={form.control}
          name="image_id"
          render={({ field }) => (
            <FormItem>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {resources?.images?.map((image: ResourceImageItem) => (
                  <Card
                    key={image.id}
                    className={cn(
                      "hover:bg-accent cursor-pointer transition-colors",
                      field.value === image.id
                        ? "ring-primary ring-2"
                        : "border-border",
                    )}
                    onClick={() => field.onChange(image.id)}
                  >
                    <CardContent className="p-4">
                      <div className="mb-3 flex items-center gap-3">
                        <div className="bg-accent rounded-full p-2">
                          <GetDistroIcon imageName={image.name} />
                        </div>
                        <h3 className="leading-none font-semibold">
                          {image.name}
                        </h3>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </Form>
  );
}
