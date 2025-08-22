"use client";

import { GetDistroIcon } from "@/components/GetDistroIcon";
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
          <Skeleton className="w-48 h-5" />
          <Skeleton className="w-64 h-4" />
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card
              key={i}
              className="rounded-xl border shadow-lg bg-card text-card-foreground border-border"
            >
              <CardContent className="p-4">
                <div className="flex gap-3 items-center mb-3">
                  <div className="p-2 w-9 h-9 rounded-full bg-accent" />
                  <Skeleton className="w-40 h-5" />
                </div>
                <div className="space-y-2">
                  <Skeleton className="w-32 h-6 rounded-full" />
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
                      "cursor-pointer transition-colors hover:bg-accent",
                      field.value === image.id
                        ? "ring-2 ring-primary"
                        : "border-border",
                    )}
                    onClick={() => field.onChange(image.id)}
                  >
                    <CardContent className="p-4">
                      <div className="flex gap-3 items-center mb-3">
                        <div className="p-2 rounded-full bg-accent">
                          <GetDistroIcon imageName={image.name} />
                        </div>
                        <h3 className="font-semibold leading-none">
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
