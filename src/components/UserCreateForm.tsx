"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Combobox,
  ComboboxContent,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
  ComboboxTrigger,
} from "@/components/ui/combobox";
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
import { AuthService, UserService } from "@/lib/requests";
import type { UserCreateRequest } from "@/types/RequestInterfaces";
import { UserCreateRequestSchema } from "@/types/RequestSchemas";
import type {
  ProjectsResponse,
  RolesResponse,
} from "@/types/ResponseInterfaces";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Plus, Shield, User } from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

interface UserCreateFormProps {
  onBack: () => void;
  onSuccess: () => void;
}

export function UserCreateForm({ onBack, onSuccess }: UserCreateFormProps) {
  const queryClient = useQueryClient();

  const form = useForm<UserCreateRequest>({
    resolver: zodResolver(UserCreateRequestSchema),
    defaultValues: {
      name: "",
      email: undefined,
      password: "",
      project_id: undefined,
      roles: ["member"],
    },
  });

  const { data: roles } = useQuery<RolesResponse>({
    queryKey: ["users", "roles"],
    queryFn: () => UserService.getRoles(),
    staleTime: 5 * 60 * 1000,
  });

  const { data: availableProjects, isLoading: isProjectsLoading } =
    useQuery<ProjectsResponse>({
      queryKey: ["auth", "projects"],
      queryFn: () => AuthService.getProjects(),
      staleTime: 5 * 60 * 1000,
    });

  const createMutation = useMutation({
    mutationFn: async (values: UserCreateRequest) => {
      return UserService.create(values);
    },
    onSuccess: async () => {
      toast.success("User created successfully");
      await queryClient.invalidateQueries({ queryKey: ["users", "list"] });
      form.reset({
        name: "",
        email: undefined,
        password: "",
        project_id: undefined,
        roles: ["member"],
      });
      onSuccess();
    },
    onError: (err: unknown) => {
      const message =
        err instanceof Error
          ? err.message
          : typeof err === "string"
            ? err
            : "An unexpected error occurred";
      toast.error(message);
    },
  });

  const onSubmit = (values: UserCreateRequest) => {
    createMutation.mutate(values);
  };

  return (
    <div className="py-8 mx-auto space-y-8 max-w-6xl min-h-[80vh]">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <div className="flex gap-4 items-center">
            <Button
              variant="ghost"
              size="sm"
              onClick={onBack}
              className="flex gap-2 items-center rounded-full border transition-all duration-200 cursor-pointer text-muted-foreground bg-card border-border/50 hover:text-foreground"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Users
            </Button>
          </div>

          <div className="flex gap-4 items-center">
            <div className="flex justify-center items-center p-3 rounded-full bg-primary/10">
              <User className="w-7 h-7 text-primary" />
            </div>
            <div>
              <h1 className="mb-1 text-2xl font-bold tracking-tight text-foreground">
                Create New User
              </h1>
              <p className="text-sm leading-relaxed text-muted-foreground">
                Add a new user to your system with project and role assignments
              </p>
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <Card className="rounded-xl border shadow-lg bg-card text-card-foreground border-border/50">
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-foreground">
                  Basic Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-semibold">
                          Username
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder="jdoe"
                            {...field}
                            className="h-10 rounded-full"
                          />
                        </FormControl>
                        <FormDescription>
                          Choose a unique username for the user
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-semibold">
                          Email Address
                        </FormLabel>
                        <FormControl>
                          <Input
                            type="email"
                            placeholder="user@example.com"
                            value={field.value ?? ""}
                            onChange={(e) =>
                              field.onChange(e.target.value || undefined)
                            }
                            className="h-10 rounded-full"
                          />
                        </FormControl>
                        <FormDescription>
                          User&apos;s email address for notifications
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-semibold">
                          Password
                        </FormLabel>
                        <FormControl>
                          <Input
                            type="password"
                            placeholder="Enter a secure password"
                            {...field}
                            className="h-10 rounded-full"
                          />
                        </FormControl>
                        <FormDescription>
                          Create a strong password for the user account
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-xl border shadow-lg bg-card text-card-foreground border-border/50">
              <CardHeader>
                <CardTitle className="flex gap-2 items-center text-lg font-semibold text-foreground">
                  <Shield className="w-5 h-5 text-primary" />
                  Project & Permissions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <FormField
                    control={form.control}
                    name="project_id"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-semibold">
                          Default Project
                        </FormLabel>
                        <div className="flex gap-2 items-center">
                          <Combobox
                            data={(availableProjects?.projects ?? []).map(
                              (p) => ({
                                label: p.project_name,
                                value: p.project_id,
                              }),
                            )}
                            type="project"
                            value={field.value}
                            onValueChange={(v: string) =>
                              field.onChange(v || undefined)
                            }
                          >
                            <ComboboxTrigger
                              className="!h-10 flex-1 cursor-pointer rounded-full"
                              disabled={
                                isProjectsLoading ||
                                (availableProjects?.projects?.length ?? 0) === 0
                              }
                            />
                            <ComboboxContent
                              popoverOptions={{
                                className:
                                  "w-[--radix-popover-trigger-width] p-0 border-border shadow-lg",
                              }}
                            >
                              <ComboboxInput
                                placeholder="Search projects..."
                                className="py-2 px-3 text-sm rounded-none border-0 focus:ring-0 focus:ring-offset-0 focus:outline-none text-foreground"
                              />
                              <ComboboxList className="overflow-y-auto p-1 max-h-[200px]">
                                {isProjectsLoading ? (
                                  <ComboboxItem disabled value="__loading">
                                    Loading projects…
                                  </ComboboxItem>
                                ) : (availableProjects?.projects?.length ??
                                    0) === 0 ? (
                                  <ComboboxItem disabled value="__no-projects">
                                    No projects available
                                  </ComboboxItem>
                                ) : (
                                  (availableProjects?.projects ?? []).map(
                                    (p) => (
                                      <ComboboxItem
                                        key={p.project_id}
                                        value={p.project_id}
                                      >
                                        {p.project_name}
                                      </ComboboxItem>
                                    ),
                                  )
                                )}
                              </ComboboxList>
                            </ComboboxContent>
                          </Combobox>
                          {field.value && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => field.onChange(undefined)}
                              className="flex-shrink-0 px-3 h-10 rounded-full"
                            >
                              Clear
                            </Button>
                          )}
                        </div>
                        <FormDescription>
                          The primary project this user will have access to
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="roles"
                    render={({ field }) => {
                      const current = field.value ?? [];
                      const toggle = (roleName: string) => {
                        const next = current.includes(roleName)
                          ? current.filter((r: string) => r !== roleName)
                          : [...current, roleName];
                        field.onChange(next);
                      };

                      return (
                        <FormItem>
                          <FormLabel className="font-semibold">
                            User Roles
                          </FormLabel>
                          <div className="space-y-3">
                            <div className="flex flex-wrap gap-2">
                              {(roles ?? []).length > 0 ? (
                                (roles ?? []).map((r) => {
                                  const selected = current.includes(r.name);
                                  return (
                                    <Badge
                                      key={r.id ?? r.name}
                                      variant={selected ? "default" : "outline"}
                                      onClick={() => toggle(r.name)}
                                      className={
                                        "cursor-pointer rounded-full px-3 py-1 text-sm font-medium transition-opacity select-none hover:opacity-80" +
                                        (selected
                                          ? " bg-primary text-primary-foreground"
                                          : "")
                                      }
                                    >
                                      {r.name}
                                    </Badge>
                                  );
                                })
                              ) : (
                                <Badge
                                  variant="outline"
                                  className="rounded-full opacity-50"
                                >
                                  No roles available
                                </Badge>
                              )}
                            </div>
                            {current.length > 0 && (
                              <div className="text-sm text-muted-foreground">
                                Selected: {current.join(", ")}
                              </div>
                            )}
                          </div>
                          <FormDescription>
                            Click on role badges to toggle user permissions
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      );
                    }}
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="flex gap-3 justify-end pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onBack}
              className="py-2 px-6 rounded-full border transition-all duration-200 cursor-pointer bg-muted text-foreground border-border/50"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={createMutation.isPending}
              className="rounded-full transition-all duration-200 cursor-pointer bg-primary text-primary-foreground min-w-[120px]"
            >
              {createMutation.isPending ? (
                <>
                  <Plus className="w-4 h-4 animate-pulse" />
                  Creating...
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4" />
                  Create User
                </>
              )}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
