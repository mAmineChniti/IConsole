"use client";

import { XCombobox } from "@/components/reusable/XCombobox";
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
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { AuthService, UserService } from "@/lib/requests";
import type { UserUpdateRequest } from "@/types/RequestInterfaces";
import { UserUpdateRequestSchema } from "@/types/RequestSchemas";
import type {
  ProjectsResponse,
  RolesResponse,
  UserDetailsResponse,
} from "@/types/ResponseInterfaces";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Plus, Save, Shield, User, X } from "lucide-react";
import { useEffect, useState } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { toast } from "sonner";

interface UserEditFormProps {
  userId: string;
  onBack: () => void;
  onSuccess: () => void;
}

export function UserEditForm({ userId, onBack, onSuccess }: UserEditFormProps) {
  const queryClient = useQueryClient();
  const [projectsModified, setProjectsModified] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const form = useForm<UserUpdateRequest>({
    resolver: zodResolver(UserUpdateRequestSchema),
    defaultValues: {
      name: "",
      email: undefined,
      password: undefined,
      projects: undefined,
    },
  });

  const {
    fields: projectFields,
    append: appendProject,
    remove: removeProject,
    update: updateProject,
  } = useFieldArray({
    control: form.control,
    name: "projects",
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

  const [userDetails, setUserDetails] = useState<
    UserDetailsResponse | undefined
  >(undefined);

  useEffect(() => {
    const loadUserDetails = async () => {
      try {
        setIsLoading(true);
        const details = await UserService.get(userId);
        setUserDetails(details);
        form.reset({
          name: details.name,
          email: details.email ?? undefined,
          password: undefined,
          projects: details.projects.map((p) => ({
            project_id: p.project_id,
            roles: p.roles ?? [],
          })),
        });
      } catch {
        toast.error("Failed to load user details");
        onBack();
      } finally {
        setIsLoading(false);
      }
    };

    if (userId) {
      void loadUserDetails();
    }
  }, [userId, form, onBack]);

  const updateMutation = useMutation({
    mutationFn: async (values: UserUpdateRequest) => {
      let projectsToSend: typeof values.projects = undefined;

      if (projectsModified) {
        const projects = values.projects;
        projectsToSend =
          projects && projects.length > 0
            ? projects.filter((p) => p.project_id && p.project_id.trim() !== "")
            : [];
      }

      return UserService.update(userId, {
        name: values.name ?? undefined,
        email: values.email ?? undefined,
        password:
          values.password && values.password.trim() !== ""
            ? values.password
            : undefined,
        ...(projectsModified && { projects: projectsToSend }),
      });
    },
    onSuccess: async () => {
      toast.success("User updated successfully");
      setProjectsModified(false);
      await queryClient.invalidateQueries({ queryKey: ["users", "list"] });
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

  const onSubmit = (values: UserUpdateRequest) => {
    updateMutation.mutate(values);
  };

  if (isLoading) {
    return (
      <div className="min-h-[80vh] w-full space-y-8 py-8">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={onBack}
            className="text-muted-foreground bg-card border-border/50 hover:text-foreground flex cursor-pointer items-center gap-2 rounded-full border transition-all duration-200"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Users
          </Button>
        </div>
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="bg-primary/10 rounded-full p-2">
              <Skeleton className="h-6 w-6 rounded-full" />
            </div>
            <div>
              <Skeleton className="mb-2 h-8 w-48" />
              <Skeleton className="h-4 w-64" />
            </div>
          </div>
          <Skeleton className="mt-2 h-6 w-40 rounded-full" />
        </div>
        <div className="grid items-start gap-6 lg:grid-cols-2">
          <Card className="text-card-foreground border-border/50 flex flex-col rounded-xl border bg-neutral-50 shadow-lg dark:bg-neutral-900">
            <CardHeader>
              <Skeleton className="h-6 w-32" />
            </CardHeader>
            <CardContent className="flex flex-1 flex-col">
              <div className="flex-1 space-y-4">
                <Skeleton className="h-10 w-full rounded-full" />
                <Skeleton className="h-10 w-full rounded-full" />
                <Skeleton className="h-10 w-full rounded-full" />
              </div>
            </CardContent>
          </Card>
          <Card className="text-card-foreground border-border/50 flex flex-col rounded-xl border bg-neutral-50 shadow-lg dark:bg-neutral-900">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Skeleton className="h-5 w-5 rounded-full" />
                <Skeleton className="h-6 w-32" />
              </div>
            </CardHeader>
            <CardContent className="flex flex-1 flex-col">
              <div className="flex max-h-[480px] flex-1 flex-col space-y-4 overflow-y-auto">
                <div>
                  <Skeleton className="mb-2 h-4 w-32" />
                  <Skeleton className="h-3 w-48" />
                </div>
                <div className="max-h-[420px] flex-1 space-y-3 overflow-y-auto">
                  {Array.from({ length: 2 }).map((_, i) => (
                    <div
                      key={i}
                      className="border-border/50 bg-muted/20 space-y-3 rounded-xl border p-4"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <Skeleton className="h-5 w-32" />
                        <Skeleton className="h-7 w-7 rounded-full" />
                      </div>
                      <div>
                        <Skeleton className="mb-2 h-3 w-20" />
                        <Skeleton className="h-9 w-full rounded-full" />
                      </div>
                      <div>
                        <Skeleton className="mb-2 h-3 w-16" />
                        <div className="mt-2 flex flex-wrap gap-1.5">
                          {Array.from({ length: 3 }).map((_, j) => (
                            <Skeleton
                              key={j}
                              className="h-6 w-16 rounded-full"
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <Skeleton className="mt-4 h-10 w-full rounded-full" />
              </div>
            </CardContent>
          </Card>
        </div>
        <div className="flex justify-end gap-3 pt-4">
          <Skeleton className="h-10 w-32 rounded-full" />
          <Skeleton className="h-10 w-40 rounded-full" />
        </div>
      </div>
    );
  }

  if (!userDetails) {
    return (
      <div className="w-full space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={onBack}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
        </div>
        <div className="py-8 text-center">
          <p className="text-muted-foreground">User not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[80vh] w-full space-y-8 py-8">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={onBack}
          className="text-muted-foreground bg-card border-border/50 hover:text-foreground flex cursor-pointer items-center gap-2 rounded-full border transition-all duration-200"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Users
        </Button>
      </div>

      <div className="space-y-2">
        <div className="flex items-center gap-3">
          <div className="bg-primary/10 rounded-full p-2">
            <User className="text-primary h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              Edit User: {userDetails.name}
            </h1>
            <p className="text-muted-foreground">
              Update user information and manage project assignments
            </p>
          </div>
        </div>
      </div>
      <div className="grid items-start gap-6 lg:grid-cols-2">
        <Card className="text-card-foreground border-border/50 flex flex-col rounded-xl border bg-neutral-50 shadow-lg dark:bg-neutral-900">
          <CardHeader>
            <CardTitle className="text-lg">Basic Information</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-1 flex-col">
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                id="user-edit-form"
                className="flex flex-1 flex-col"
              >
                <div className="flex-1 space-y-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Username</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            className="bg-muted/40 border-border/50 text-foreground h-10 rounded-full border"
                          />
                        </FormControl>
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
                            value={field.value ?? ""}
                            onChange={(e) =>
                              field.onChange(e.target.value || undefined)
                            }
                            className="bg-muted/40 border-border/50 text-foreground h-10 rounded-full border"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>New Password</FormLabel>
                        <FormControl>
                          <Input
                            type="password"
                            placeholder="Leave empty to keep current password"
                            value={field.value ?? ""}
                            onChange={(e) =>
                              field.onChange(e.target.value || undefined)
                            }
                            className="bg-muted/40 border-border/50 text-foreground h-10 rounded-full border"
                          />
                        </FormControl>
                        <FormDescription>
                          Only enter a password if you want to change it
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>

        <Card className="text-card-foreground border-border/50 flex flex-col rounded-xl border bg-neutral-50 shadow-lg dark:bg-neutral-900">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Shield className="text-primary h-5 w-5" />
              Project Assignments
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-1 flex-col">
            <div className="flex max-h-[480px] flex-1 flex-col space-y-4 overflow-y-auto">
              <div>
                <Label className="text-sm leading-none font-medium">
                  Current Assignments
                </Label>
                <p className="text-muted-foreground text-xs">
                  Manage project access and roles for this user
                </p>
              </div>

              <div className="max-h-[420px] flex-1 space-y-3 overflow-y-auto">
                {projectFields.map((field, index) => (
                  <div
                    key={field.id}
                    className="border-border/50 bg-muted/20 space-y-3 rounded-xl border p-4"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="truncate text-sm font-medium">
                        Assignment #{index + 1}
                      </span>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              removeProject(index);
                              setProjectsModified(true);
                            }}
                            className="text-destructive bg-card border-border/50 hover:text-destructive h-7 w-7 flex-shrink-0 cursor-pointer rounded-full border p-0"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Remove assignment</TooltipContent>
                      </Tooltip>
                    </div>

                    <div>
                      <Label
                        id={`project-label-${index}`}
                        className="text-muted-foreground text-xs"
                      >
                        Project
                      </Label>
                      <XCombobox
                        data={(availableProjects?.projects ?? []).map((p) => ({
                          label: p.project_name,
                          value: p.project_id,
                        }))}
                        type="project"
                        value={field.project_id}
                        onChange={(value: string | undefined) => {
                          if (
                            value &&
                            projectFields.some(
                              (p, i) => i !== index && p.project_id === value,
                            )
                          ) {
                            toast.error("This project is already assigned");
                            return;
                          }
                          const updatedField = {
                            ...field,
                            project_id: value ?? "",
                            ...((!value || value === "") && { roles: [] }),
                          };
                          updateProject(index, updatedField);
                          setProjectsModified(true);
                        }}
                        placeholder="Select project"
                        searchPlaceholder="Search projects..."
                        disabled={
                          isProjectsLoading ||
                          (availableProjects?.projects?.length ?? 0) === 0
                        }
                        className="bg-muted/40 border-border/50 mt-1 !h-9 w-full cursor-pointer rounded-full border text-sm"
                      />
                    </div>

                    <div>
                      <Label className="text-muted-foreground text-xs">
                        Roles
                      </Label>
                      <div className="mt-2 flex flex-wrap gap-1.5">
                        {roles?.map((role) => {
                          const isSelected = (field.roles ?? []).includes(
                            role.name,
                          );
                          return (
                            <Tooltip key={role.id}>
                              <TooltipTrigger asChild>
                                <Badge
                                  variant={isSelected ? "default" : "outline"}
                                  onClick={() => {
                                    const newRoles = isSelected
                                      ? (field.roles ?? []).filter(
                                          (r) => r !== role.name,
                                        )
                                      : [...(field.roles ?? []), role.name];
                                    const updatedField = {
                                      ...field,
                                      roles: newRoles,
                                    };
                                    updateProject(index, updatedField);
                                    setProjectsModified(true);
                                  }}
                                  className={
                                    isSelected
                                      ? "flex cursor-pointer items-center gap-1.5 rounded-full bg-green-100 px-2 py-0.5 text-xs text-green-700 select-none dark:bg-green-900/30 dark:text-green-400"
                                      : "border-border/50 hover:bg-muted/40 cursor-pointer rounded-full border px-2 py-0.5 text-xs transition-opacity select-none"
                                  }
                                >
                                  {role.name}
                                </Badge>
                              </TooltipTrigger>
                              <TooltipContent>
                                {isSelected
                                  ? `Remove ${role.name} role`
                                  : `Add ${role.name} role`}
                              </TooltipContent>
                            </Tooltip>
                          );
                        })}
                      </div>
                      {(field.roles ?? []).length === 0 && (
                        <p className="text-muted-foreground mt-1 text-xs">
                          No roles assigned
                        </p>
                      )}
                    </div>
                  </div>
                ))}

                {projectFields.length === 0 && (
                  <div className="text-muted-foreground border-muted-foreground/20 rounded-xl border-2 border-dashed py-6 text-center text-sm">
                    No project assignments
                  </div>
                )}
              </div>

              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  if (projectFields.some((p) => !p.project_id)) {
                    toast.info("Complete current assignment first");
                    return;
                  }
                  appendProject({ project_id: "", roles: [] });
                  setProjectsModified(true);
                }}
                className="bg-muted text-foreground border-border/50 w-full cursor-pointer rounded-full border px-6 py-2 transition-all duration-200"
              >
                <Plus className="mr-2 h-4 w-4" />
                Add Project Assignment
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-end gap-3 pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={onBack}
          className="bg-muted text-foreground border-border/50 cursor-pointer rounded-full border px-6 py-2 transition-all duration-200"
        >
          Cancel
        </Button>
        <Button
          type="submit"
          form="user-edit-form"
          disabled={updateMutation.isPending}
          className="bg-primary text-primary-foreground min-w-[120px] cursor-pointer rounded-full transition-all duration-200"
        >
          {updateMutation.isPending ? (
            <>
              <Save className="mr-2 h-4 w-4 animate-pulse" />
              Saving...
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              Save Changes
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
