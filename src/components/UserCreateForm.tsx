"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Plus, Shield, User } from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { AuthService, UserService } from "@/lib/requests";
import type { UserCreateRequest } from "@/types/RequestInterfaces";
import { UserCreateRequestSchema } from "@/types/RequestSchemas";
import type {
  ProjectsResponse,
  RolesResponse,
} from "@/types/ResponseInterfaces";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";

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
    onError: (error) => toast.error(error.message),
  });

  const onSubmit = (values: UserCreateRequest) => {
    createMutation.mutate(values);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={onBack}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Users
        </Button>
      </div>

      <div className="space-y-2">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-lg">
            <User className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              Create New User
            </h1>
            <p className="text-muted-foreground">
              Add a new user to your system with project and role assignments
            </p>
          </div>
        </div>
      </div>

      <Separator />

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">User Information</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Username</FormLabel>
                      <FormControl>
                        <Input placeholder="jdoe" {...field} className="h-10" />
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
                      <FormLabel>Email Address</FormLabel>
                      <FormControl>
                        <Input
                          type="email"
                          placeholder="user@example.com"
                          value={field.value ?? ""}
                          onChange={(e) =>
                            field.onChange(e.target.value || undefined)
                          }
                          className="h-10"
                        />
                      </FormControl>
                      <FormDescription>
                        User&apos;s email address for notifications
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="Enter a secure password"
                        {...field}
                        className="h-10"
                      />
                    </FormControl>
                    <FormDescription>
                      Create a strong password for the user account
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Separator />

              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-medium flex items-center gap-2">
                    <Shield className="h-5 w-5 text-primary" />
                    Project & Permissions
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Assign the user to a project and define their roles
                  </p>
                </div>

                <FormField
                  control={form.control}
                  name="project_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Default Project</FormLabel>
                      <div className="flex items-center gap-2">
                        <Select
                          onValueChange={(v) => field.onChange(v || undefined)}
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger
                              disabled={
                                isProjectsLoading ||
                                (availableProjects?.projects?.length ?? 0) === 0
                              }
                              className="flex-1 h-10"
                            >
                              <SelectValue placeholder="Select a project (optional)" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {isProjectsLoading ? (
                              <SelectItem value="__loading" disabled>
                                Loading projects…
                              </SelectItem>
                            ) : (availableProjects?.projects?.length ?? 0) ===
                              0 ? (
                              <SelectItem value="__no-projects" disabled>
                                No projects available
                              </SelectItem>
                            ) : (
                              availableProjects?.projects?.map((p) => (
                                <SelectItem
                                  key={p.project_id}
                                  value={p.project_id}
                                >
                                  {p.project_name}
                                </SelectItem>
                              ))
                            )}
                          </SelectContent>
                        </Select>
                        {field.value && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => field.onChange(undefined)}
                            className="h-10 px-3 flex-shrink-0"
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
                    const current = field.value || [];
                    const toggle = (roleName: string) => {
                      const next = current.includes(roleName)
                        ? current.filter((r: string) => r !== roleName)
                        : [...current, roleName];
                      field.onChange(next);
                    };

                    return (
                      <FormItem>
                        <FormLabel>User Roles</FormLabel>
                        <div className="space-y-3">
                          <div className="flex flex-wrap gap-2">
                            {roles && roles.length > 0 ? (
                              roles.map((r) => {
                                const selected = current.includes(r.name);
                                return (
                                  <Badge
                                    key={r.id}
                                    variant={selected ? "default" : "outline"}
                                    onClick={() => toggle(r.name)}
                                    className="cursor-pointer select-none hover:opacity-80 transition-opacity px-3 py-1"
                                  >
                                    {r.name}
                                  </Badge>
                                );
                              })
                            ) : (
                              <Badge variant="outline" className="opacity-50">
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

              <Separator />

              <div className="flex justify-end gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={onBack}
                  className="min-w-[100px]"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={createMutation.isPending}
                  className="min-w-[100px]"
                >
                  {createMutation.isPending ? (
                    <>
                      <Plus className="h-4 w-4 mr-2 animate-pulse" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <Plus className="h-4 w-4 mr-2" />
                      Create User
                    </>
                  )}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
