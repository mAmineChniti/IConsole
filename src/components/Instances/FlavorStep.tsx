"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Form, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import type { FlavorFormData } from "@/types/RequestInterfaces";
import type { ResourcesResponse } from "@/types/ResponseInterfaces";
import { Cpu, HardDrive, MemoryStick } from "lucide-react";
import { type useForm } from "react-hook-form";

type ResourceFlavorItem = ResourcesResponse["flavors"][number];

export function FlavorStep({
  form,
  resources,
  isLoading,
}: {
  form: ReturnType<typeof useForm<FlavorFormData>>;
  resources: ResourcesResponse | undefined;
  isLoading: boolean;
}) {
  if (isLoading)
    return (
      <div className="space-y-6">
        <div className="space-y-2">
          <Skeleton className="h-5 w-32" />
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <Card
                key={i}
                className="text-card-foreground border-border/50 border bg-neutral-50 shadow-lg dark:bg-neutral-900"
              >
                <CardContent className="p-4">
                  <div className="mb-3 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="bg-muted flex h-8 w-8 items-center justify-center rounded-full" />
                      <div className="space-y-1">
                        <Skeleton className="h-5 w-40" />
                        <Skeleton className="h-3 w-16" />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <div className="bg-muted h-6 w-6 rounded-full" />
                      <div className="flex-1">
                        <Skeleton className="h-4 w-24" />
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="bg-muted h-6 w-6 rounded-full" />
                      <div className="flex-1">
                        <Skeleton className="h-4 w-28" />
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="bg-muted h-6 w-6 rounded-full" />
                      <div className="flex-1">
                        <Skeleton className="h-4 w-20" />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );

  return (
    <Form {...form}>
      <div className="space-y-6">
        <FormField
          control={form.control}
          name="flavor_id"
          render={({ field }) => (
            <FormItem>
              <div
                className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3"
                role="radiogroup"
                aria-label="Available flavors"
              >
                {(resources?.flavors?.length ?? 0) === 0 ? (
                  <div className="col-span-full flex flex-col items-center justify-center py-12 text-center">
                    <div className="bg-muted/50 mb-4 rounded-full p-3">
                      <Cpu className="text-muted-foreground h-6 w-6" />
                    </div>
                    <h3 className="mb-2 text-lg font-medium">
                      No flavors available
                    </h3>
                    <p className="text-muted-foreground max-w-sm text-sm">
                      Contact your administrator to create flavors before you
                      can launch instances.
                    </p>
                  </div>
                ) : (
                  (resources?.flavors ?? []).map(
                    (flavor: ResourceFlavorItem) => (
                      <Card
                        key={flavor.id}
                        className={cn(
                          "text-card-foreground cursor-pointer rounded-md border-2 bg-neutral-50 transition-all hover:shadow-md dark:bg-neutral-900",
                          field.value === flavor.id
                            ? "border-primary bg-primary/5"
                            : "border-border hover:border-border/80",
                        )}
                        onClick={() => field.onChange(flavor.id)}
                        role="radio"
                        aria-checked={field.value === flavor.id}
                        aria-labelledby={`flavor-${flavor.id}-label`}
                        tabIndex={0}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === " ") {
                            e.preventDefault();
                            field.onChange(flavor.id);
                          }
                        }}
                      >
                        <CardContent className="p-4">
                          <div className="mb-3 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <div className="bg-primary/10 flex h-8 w-8 items-center justify-center rounded-full">
                                <Cpu className="text-primary h-4 w-4" />
                              </div>
                              <div>
                                <h3
                                  id={`flavor-${flavor.id}-label`}
                                  className="leading-none font-semibold"
                                >
                                  {flavor.name}
                                </h3>
                                {!flavor.is_public && (
                                  <Badge
                                    variant="secondary"
                                    className="mt-1 text-xs"
                                  >
                                    Private
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </div>
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <div className="bg-muted flex h-6 w-6 items-center justify-center rounded-full">
                                <Cpu className="text-muted-foreground h-3 w-3" />
                              </div>
                              <div className="flex-1">
                                <span className="font-medium">
                                  {flavor.vcpus} vCPU
                                  {flavor.vcpus !== 1 ? "s" : ""}
                                </span>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <div className="bg-muted flex h-6 w-6 items-center justify-center rounded-full">
                                <MemoryStick className="text-muted-foreground h-3 w-3" />
                              </div>
                              <div className="flex-1">
                                <span className="font-medium">
                                  {flavor.ram >= 1024
                                    ? `${(flavor.ram / 1024).toFixed(1)} GB`
                                    : `${flavor.ram} MB`}{" "}
                                  RAM
                                </span>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <div className="bg-muted flex h-6 w-6 items-center justify-center rounded-full">
                                <HardDrive className="text-muted-foreground h-3 w-3" />
                              </div>
                              <div className="flex-1">
                                <span className="font-medium">
                                  {flavor.disk} GB Storage
                                </span>
                              </div>
                            </div>
                            {flavor.ephemeral > 0 && (
                              <div className="flex items-center gap-2">
                                <div className="bg-muted flex h-6 w-6 items-center justify-center rounded-full">
                                  <HardDrive className="text-muted-foreground/60 h-3 w-3" />
                                </div>
                                <div className="flex-1">
                                  <span className="text-muted-foreground">
                                    {flavor.ephemeral} GB Ephemeral
                                  </span>
                                </div>
                              </div>
                            )}
                            {flavor.swap > 0 && (
                              <div className="flex items-center gap-2">
                                <div className="bg-muted flex h-6 w-6 items-center justify-center rounded-full">
                                  <MemoryStick className="text-muted-foreground/60 h-3 w-3" />
                                </div>
                                <div className="flex-1">
                                  <span className="text-muted-foreground">
                                    {flavor.swap} MB Swap
                                  </span>
                                </div>
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ),
                  )
                )}
              </div>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </Form>
  );
}
