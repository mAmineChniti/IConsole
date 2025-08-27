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
      <div className="py-8 mx-auto space-y-8 max-w-6xl min-h-[80vh]">
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
        <div className="space-y-2">
          <div className="flex gap-3 items-center">
            <div className="p-2 rounded-full bg-primary/10">
              <Skeleton className="w-6 h-6 rounded-full" />
            </div>
            <div>
              <Skeleton className="mb-2 w-48 h-8" />
              <Skeleton className="w-64 h-4" />
            </div>
          </div>
          <Skeleton className="mt-2 w-40 h-6 rounded-full" />
        </div>
        <div className="grid gap-6 items-start lg:grid-cols-2">
          <Card className="flex flex-col rounded-xl border shadow-lg bg-card text-card-foreground border-border/50">
            <CardHeader>
              <Skeleton className="w-32 h-6" />
            </CardHeader>
            <CardContent className="flex flex-col flex-1">
              <div className="flex-1 space-y-4">
                <Skeleton className="w-full h-10 rounded-full" />
                <Skeleton className="w-full h-10 rounded-full" />
                <Skeleton className="w-full h-10 rounded-full" />
              </div>
            </CardContent>
          </Card>
          <Card className="flex flex-col rounded-xl border shadow-lg bg-card text-card-foreground border-border/50">
            <CardHeader>
              <div className="flex gap-2 items-center">
                <Skeleton className="w-5 h-5 rounded-full" />
                <Skeleton className="w-32 h-6" />
              </div>
            </CardHeader>
            <CardContent className="flex flex-col flex-1">
              <div className="flex overflow-y-auto flex-col flex-1 space-y-4 max-h-[480px]">
                <div>
                  <Skeleton className="mb-2 w-32 h-4" />
                  <Skeleton className="w-48 h-3" />
                </div>
                <div className="overflow-y-auto flex-1 space-y-3 max-h-[420px]">
                  {Array.from({ length: 2 }).map((_, i) => (
                    <div
                      key={i}
                      className="p-4 space-y-3 rounded-xl border border-border/50 bg-muted/20"
                    >
                      <div className="flex gap-2 justify-between items-center">
                        <Skeleton className="w-32 h-5" />
                        <Skeleton className="w-7 h-7 rounded-full" />
                      </div>
                      <div>
                        <Skeleton className="mb-2 w-20 h-3" />
                        <Skeleton className="w-full h-9 rounded-full" />
                      </div>
                      <div>
                        <Skeleton className="mb-2 w-16 h-3" />
                        <div className="flex flex-wrap gap-1.5 mt-2">
                          {Array.from({ length: 3 }).map((_, j) => (
                            <Skeleton
                              key={j}
                              className="w-16 h-6 rounded-full"
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <Skeleton className="mt-4 w-full h-10 rounded-full" />
              </div>
            </CardContent>
          </Card>
        </div>
        <div className="flex gap-3 justify-end pt-4">
          <Skeleton className="w-32 h-10 rounded-full" />
          <Skeleton className="w-40 h-10 rounded-full" />
        </div>
      </div>
    );
  }

  if (!userDetails) {
    return (
      <div className="mx-auto space-y-6 max-w-2xl">
        <div className="flex gap-4 items-center">
          <Button variant="ghost" size="sm" onClick={onBack}>
            <ArrowLeft className="mr-2 w-4 h-4" />
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
    <div className="py-8 mx-auto space-y-8 max-w-6xl min-h-[80vh]">
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

      <div className="space-y-2">
        <div className="flex gap-3 items-center">
          <div className="p-2 rounded-full bg-primary/10">
            <User className="w-6 h-6 text-primary" />
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
      <div className="grid gap-6 items-start lg:grid-cols-2">
        <Card className="flex flex-col rounded-xl border shadow-lg bg-card text-card-foreground border-border/50">
          <CardHeader>
            <CardTitle className="text-lg">Basic Information</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col flex-1">
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                id="user-edit-form"
                className="flex flex-col flex-1"
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
                            className="h-10 rounded-full border bg-muted/40 border-border/50 text-foreground"
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
                            className="h-10 rounded-full border bg-muted/40 border-border/50 text-foreground"
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
                            className="h-10 rounded-full border bg-muted/40 border-border/50 text-foreground"
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

        <Card className="flex flex-col rounded-xl border shadow-lg bg-card text-card-foreground border-border/50">
          <CardHeader>
            <CardTitle className="flex gap-2 items-center text-lg">
              <Shield className="w-5 h-5 text-primary" />
              Project Assignments
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col flex-1">
            <div className="flex overflow-y-auto flex-col flex-1 space-y-4 max-h-[480px]">
              <div>
                <Label className="text-sm font-medium leading-none">
                  Current Assignments
                </Label>
                <p className="text-xs text-muted-foreground">
                  Manage project access and roles for this user
                </p>
              </div>

              <div className="overflow-y-auto flex-1 space-y-3 max-h-[420px]">
                {projectFields.map((field, index) => (
                  <div
                    key={field.id}
                    className="p-4 space-y-3 rounded-xl border border-border/50 bg-muted/20"
                  >
                    <div className="flex gap-2 justify-between items-center">
                      <span className="text-sm font-medium truncate">
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
                            className="flex-shrink-0 p-0 w-7 h-7 rounded-full border cursor-pointer text-destructive bg-card border-border/50 hover:text-destructive"
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Remove assignment</TooltipContent>
                      </Tooltip>
                    </div>

                    <div>
                      <Label
                        id={`project-label-${index}`}
                        className="text-xs text-muted-foreground"
                      >
                        Project
                      </Label>
                      <Combobox
                        data={(availableProjects?.projects ?? []).map((p) => ({
                          label: p.project_name,
                          value: p.project_id,
                        }))}
                        type="project"
                        value={field.project_id}
                        onValueChange={(value: string) => {
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
                            project_id: value,
                            ...(value === "" && { roles: [] }),
                          };
                          updateProject(index, updatedField);
                          setProjectsModified(true);
                        }}
                      >
                        <ComboboxTrigger
                          id={`project-select-${index}`}
                          aria-labelledby={`project-label-${index}`}
                          className="w-full mt-1 text-sm !h-9 rounded-full bg-muted/40 border border-border/50 cursor-pointer"
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
                            ) : (availableProjects?.projects?.length ?? 0) ===
                              0 ? (
                              <ComboboxItem disabled value="__no-projects">
                                No projects available
                              </ComboboxItem>
                            ) : (
                              (availableProjects?.projects ?? []).map((p) => (
                                <ComboboxItem
                                  key={p.project_id}
                                  value={p.project_id}
                                >
                                  {p.project_name}
                                </ComboboxItem>
                              ))
                            )}
                          </ComboboxList>
                        </ComboboxContent>
                      </Combobox>
                    </div>

                    <div>
                      <Label className="text-xs text-muted-foreground">
                        Roles
                      </Label>
                      <div className="flex flex-wrap gap-1.5 mt-2">
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
                                      ? "cursor-pointer select-none text-xs rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 px-2 py-0.5 gap-1.5 flex items-center"
                                      : "cursor-pointer select-none text-xs rounded-full border border-border/50 px-2 py-0.5 hover:bg-muted/40 transition-opacity"
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
                        <p className="mt-1 text-xs text-muted-foreground">
                          No roles assigned
                        </p>
                      )}
                    </div>
                  </div>
                ))}

                {projectFields.length === 0 && (
                  <div className="py-6 text-sm text-center rounded-xl border-2 border-dashed text-muted-foreground border-muted-foreground/20">
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
                className="py-2 px-6 w-full rounded-full border transition-all duration-200 cursor-pointer bg-muted text-foreground border-border/50"
              >
                <Plus className="mr-2 w-4 h-4" />
                Add Project Assignment
              </Button>
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
          form="user-edit-form"
          disabled={updateMutation.isPending}
          className="rounded-full transition-all duration-200 cursor-pointer min-w-[120px] bg-primary text-primary-foreground"
        >
          {updateMutation.isPending ? (
            <>
              <Save className="mr-2 w-4 h-4 animate-pulse" />
              Saving...
            </>
          ) : (
            <>
              <Save className="mr-2 w-4 h-4" />
              Save Changes
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
