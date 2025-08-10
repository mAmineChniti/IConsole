"use client";
import { GetDistroIcon } from "@/components/GetDistroIcon";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Form, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import type { ImageFormData } from "@/types/RequestInterfaces";
import type { ResourcesResponse } from "@/types/ResponseInterfaces";
import type { useForm } from "react-hook-form";

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
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} className="border-2">
              <CardContent className="p-4">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-full">
                    <Skeleton className="h-5 w-5" />
                  </div>
                  <Skeleton className="h-5 w-24" />
                </div>
                <Skeleton className="h-6 w-20" />
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
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {resources?.images.map((image) => (
                  <Card
                    key={image.id}
                    className={cn(
                      "cursor-pointer transition-all hover:shadow-md border-2",
                      field.value === image.id
                        ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                        : "border-border hover:border-border/80",
                    )}
                    onClick={() => field.onChange(image.id)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="p-2 rounded-full">
                          <GetDistroIcon
                            imageName={
                              typeof image.name === "string" ? image.name : ""
                            }
                          />
                        </div>
                        <h3 className="font-semibold text-base leading-tight break-words">
                          {image.name}
                        </h3>
                      </div>
                      <div className="space-y-2">
                        <Badge
                          variant="secondary"
                          className="text-xs w-fit justify-start"
                        >
                          <span className="truncate">ID: {image.id}</span>
                        </Badge>
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
