"use client";

import { Cpu, HardDrive, MemoryStick } from "lucide-react";
import { type useForm } from "react-hook-form";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Form, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import type { FlavorFormData } from "@/types/RequestInterfaces";
import type { ResourcesResponse } from "@/types/ResponseInterfaces";

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
          <Skeleton className="h-4 w-80" />
        </div>
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card
              key={i}
              className="bg-card text-card-foreground border border-border/50 shadow-lg"
            >
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
                    <Skeleton className="h-5 w-5" />
                  </div>
                  <div className="space-y-1">
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-3 w-12" />
                  </div>
                </div>
                <div className="space-y-3">
                  {Array.from({ length: 3 }).map((_, j) => (
                    <div key={j} className="flex items-center gap-2">
                      <div className="flex h-6 w-6 items-center justify-center bg-muted">
                        <Skeleton className="h-3 w-3" />
                      </div>
                      <Skeleton className="h-3 w-16" />
                    </div>
                  ))}
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
          name="flavor_id"
          render={({ field }) => (
            <FormItem>
              <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                {resources?.flavors.length === 0 ? (
                  <div className="col-span-full flex flex-col items-center justify-center py-12 text-center">
                    <div className="rounded-full bg-muted/50 p-3 mb-4">
                      <Cpu className="h-6 w-6 text-muted-foreground" />
                    </div>
                    <h3 className="text-lg font-medium mb-2">
                      No flavors available
                    </h3>
                    <p className="text-sm text-muted-foreground max-w-sm">
                      Contact your administrator to create flavors before you
                      can launch instances.
                    </p>
                  </div>
                ) : (
                  resources?.flavors.map((flavor) => (
                    <Card
                      key={flavor.id}
                      className={cn(
                        "cursor-pointer transition-all hover:shadow-md border-2 rounded-md bg-card text-card-foreground",
                        field.value === flavor.id
                          ? "border-primary bg-primary/5"
                          : "border-border hover:border-border/80",
                      )}
                      onClick={() => field.onChange(flavor.id)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
                              <Cpu className="h-4 w-4 text-primary" />
                            </div>
                            <div>
                              <h3 className="font-semibold leading-none">
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
                            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-muted">
                              <Cpu className="h-3 w-3 text-muted-foreground" />
                            </div>
                            <div className="flex-1">
                              <span className="font-medium">
                                {flavor.vcpus} vCPU
                                {flavor.vcpus !== 1 ? "s" : ""}
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-muted">
                              <MemoryStick className="h-3 w-3 text-muted-foreground" />
                            </div>
                            <div className="flex-1">
                              <span className="font-medium">
                                {(flavor.ram / 1024).toFixed(
                                  flavor.ram >= 1024 ? 1 : 0,
                                )}{" "}
                                {flavor.ram >= 1024 ? "GB" : "MB"} RAM
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-muted">
                              <HardDrive className="h-3 w-3 text-muted-foreground" />
                            </div>
                            <div className="flex-1">
                              <span className="font-medium">
                                {flavor.disk} GB Storage
                              </span>
                            </div>
                          </div>
                          {flavor.ephemeral > 0 && (
                            <div className="flex items-center gap-2">
                              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-muted">
                                <HardDrive className="h-3 w-3 text-muted-foreground/60" />
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
                              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-muted">
                                <MemoryStick className="h-3 w-3 text-muted-foreground/60" />
                              </div>
                              <div className="flex-1">
                                <span className="text-muted-foreground text-xs">
                                  {flavor.swap} MB Swap
                                </span>
                              </div>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))
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
