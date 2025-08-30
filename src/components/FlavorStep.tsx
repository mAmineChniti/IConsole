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
          <Skeleton className="w-32 h-5" />
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <Card
                key={i}
                className="border shadow-lg bg-card text-card-foreground border-border/50"
              >
                <CardContent className="p-4">
                  <div className="flex justify-between items-center mb-3">
                    <div className="flex gap-2 items-center">
                      <div className="flex justify-center items-center w-8 h-8 rounded-full bg-muted" />
                      <div className="space-y-1">
                        <Skeleton className="w-40 h-5" />
                        <Skeleton className="w-16 h-3" />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex gap-2 items-center">
                      <div className="w-6 h-6 rounded-full bg-muted" />
                      <div className="flex-1">
                        <Skeleton className="w-24 h-4" />
                      </div>
                    </div>
                    <div className="flex gap-2 items-center">
                      <div className="w-6 h-6 rounded-full bg-muted" />
                      <div className="flex-1">
                        <Skeleton className="w-28 h-4" />
                      </div>
                    </div>
                    <div className="flex gap-2 items-center">
                      <div className="w-6 h-6 rounded-full bg-muted" />
                      <div className="flex-1">
                        <Skeleton className="w-20 h-4" />
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
                  <div className="flex flex-col col-span-full justify-center items-center py-12 text-center">
                    <div className="p-3 mb-4 rounded-full bg-muted/50">
                      <Cpu className="w-6 h-6 text-muted-foreground" />
                    </div>
                    <h3 className="mb-2 text-lg font-medium">
                      No flavors available
                    </h3>
                    <p className="max-w-sm text-sm text-muted-foreground">
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
                          "bg-card text-card-foreground cursor-pointer rounded-md border-2 transition-all hover:shadow-md",
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
                          <div className="flex justify-between items-center mb-3">
                            <div className="flex gap-2 items-center">
                              <div className="flex justify-center items-center w-8 h-8 rounded-full bg-primary/10">
                                <Cpu className="w-4 h-4 text-primary" />
                              </div>
                              <div>
                                <h3
                                  id={`flavor-${flavor.id}-label`}
                                  className="font-semibold leading-none"
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
                            <div className="flex gap-2 items-center">
                              <div className="flex justify-center items-center w-6 h-6 rounded-full bg-muted">
                                <Cpu className="w-3 h-3 text-muted-foreground" />
                              </div>
                              <div className="flex-1">
                                <span className="font-medium">
                                  {flavor.vcpus} vCPU
                                  {flavor.vcpus !== 1 ? "s" : ""}
                                </span>
                              </div>
                            </div>
                            <div className="flex gap-2 items-center">
                              <div className="flex justify-center items-center w-6 h-6 rounded-full bg-muted">
                                <MemoryStick className="w-3 h-3 text-muted-foreground" />
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
                            <div className="flex gap-2 items-center">
                              <div className="flex justify-center items-center w-6 h-6 rounded-full bg-muted">
                                <HardDrive className="w-3 h-3 text-muted-foreground" />
                              </div>
                              <div className="flex-1">
                                <span className="font-medium">
                                  {flavor.disk} GB Storage
                                </span>
                              </div>
                            </div>
                            {flavor.ephemeral > 0 && (
                              <div className="flex gap-2 items-center">
                                <div className="flex justify-center items-center w-6 h-6 rounded-full bg-muted">
                                  <HardDrive className="w-3 h-3 text-muted-foreground/60" />
                                </div>
                                <div className="flex-1">
                                  <span className="text-muted-foreground">
                                    {flavor.ephemeral} GB Ephemeral
                                  </span>
                                </div>
                              </div>
                            )}
                            {flavor.swap > 0 && (
                              <div className="flex gap-2 items-center">
                                <div className="flex justify-center items-center w-6 h-6 rounded-full bg-muted">
                                  <MemoryStick className="w-3 h-3 text-muted-foreground/60" />
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
