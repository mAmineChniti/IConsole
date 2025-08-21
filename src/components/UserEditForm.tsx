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
            roles: p.roles,
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
      <div className="max-w-6xl min-h-[80vh] mx-auto space-y-8 py-8">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={onBack}
            className="flex items-center gap-2 rounded-full text-muted-foreground hover:text-foreground bg-card border border-border/50 transition-all duration-200 cursor-pointer"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Users
          </Button>
        </div>
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-full">
              <Skeleton className="h-6 w-6 rounded-full" />
            </div>
            <div>
              <Skeleton className="h-8 w-48 mb-2" />
              <Skeleton className="h-4 w-64" />
            </div>
          </div>
          <Skeleton className="h-6 w-40 mt-2 rounded-full" />
        </div>
        <div className="grid gap-6 lg:grid-cols-2 items-start">
          <Card className="bg-card text-card-foreground border border-border/50 shadow-lg rounded-xl flex flex-col">
            <CardHeader>
              <Skeleton className="h-6 w-32" />
            </CardHeader>
            <CardContent className="flex-1 flex flex-col">
              <div className="space-y-4 flex-1">
                <Skeleton className="h-10 w-full rounded-full" />
                <Skeleton className="h-10 w-full rounded-full" />
                <Skeleton className="h-10 w-full rounded-full" />
              </div>
            </CardContent>
          </Card>
          <Card className="bg-card text-card-foreground border border-border/50 shadow-lg rounded-xl flex flex-col">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Skeleton className="h-5 w-5 rounded-full" />
                <Skeleton className="h-6 w-32" />
              </div>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col">
              <div className="space-y-4 flex-1 flex flex-col max-h-[480px] overflow-y-auto">
                <div>
                  <Skeleton className="h-4 w-32 mb-2" />
                  <Skeleton className="h-3 w-48" />
                </div>
                <div className="space-y-3 flex-1 overflow-y-auto max-h-[420px]">
                  {Array.from({ length: 2 }).map((_, i) => (
                    <div
                      key={i}
                      className="p-4 border border-border/50 rounded-xl space-y-3 bg-muted/20"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <Skeleton className="h-5 w-32" />
                        <Skeleton className="h-7 w-7 rounded-full" />
                      </div>
                      <div>
                        <Skeleton className="h-3 w-20 mb-2" />
                        <Skeleton className="h-9 w-full rounded-full" />
                      </div>
                      <div>
                        <Skeleton className="h-3 w-16 mb-2" />
                        <div className="flex flex-wrap gap-1.5 mt-2">
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
                <Skeleton className="h-10 w-full rounded-full mt-4" />
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
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={onBack}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
        </div>
        <div className="text-center py-8">
          <p className="text-muted-foreground">User not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl min-h-[80vh] mx-auto space-y-8 py-8">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={onBack}
          className="flex items-center gap-2 rounded-full text-muted-foreground hover:text-foreground bg-card border border-border/50 transition-all duration-200 cursor-pointer"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Users
        </Button>
      </div>

      <div className="space-y-2">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-full">
            <User className="h-6 w-6 text-primary" />
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
      <div className="grid gap-6 lg:grid-cols-2 items-start">
        <Card className="bg-card text-card-foreground border border-border/50 shadow-lg rounded-xl flex flex-col">
          <CardHeader>
            <CardTitle className="text-lg">Basic Information</CardTitle>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col">
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                id="user-edit-form"
                className="flex-1 flex flex-col"
              >
                <div className="space-y-4 flex-1">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Username</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            className="h-10 rounded-full bg-muted/40 border border-border/50 text-foreground"
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
                            className="h-10 rounded-full bg-muted/40 border border-border/50 text-foreground"
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
                            className="h-10 rounded-full bg-muted/40 border border-border/50 text-foreground"
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

        <Card className="bg-card text-card-foreground border border-border/50 shadow-lg rounded-xl flex flex-col">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" />
              Project Assignments
            </CardTitle>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col">
            <div className="space-y-4 flex-1 flex flex-col max-h-[480px] overflow-y-auto">
              <div>
                <Label className="text-sm font-medium leading-none">
                  Current Assignments
                </Label>
                <p className="text-xs text-muted-foreground">
                  Manage project access and roles for this user
                </p>
              </div>

              <div className="space-y-3 flex-1 overflow-y-auto max-h-[420px]">
                {projectFields.map((field, index) => (
                  <div
                    key={field.id}
                    className="p-4 border border-border/50 rounded-xl space-y-3 bg-muted/20"
                  >
                    <div className="flex items-center justify-between gap-2">
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
                            className="h-7 w-7 p-0 rounded-full text-destructive hover:text-destructive flex-shrink-0 bg-card border border-border/50 cursor-pointer"
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
                            className="border-0 rounded-none px-3 py-2 text-sm text-foreground focus:ring-0 focus:ring-offset-0 focus:outline-none"
                          />
                          <ComboboxList className="max-h-[200px] overflow-y-auto p-1">
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
                          const isSelected = field.roles.includes(role.name);
                          return (
                            <Tooltip key={role.id}>
                              <TooltipTrigger asChild>
                                <Badge
                                  variant={isSelected ? "default" : "outline"}
                                  onClick={() => {
                                    const newRoles = isSelected
                                      ? field.roles.filter(
                                          (r) => r !== role.name,
                                        )
                                      : [...field.roles, role.name];
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
                      {field.roles.length === 0 && (
                        <p className="text-xs text-muted-foreground mt-1">
                          No roles assigned
                        </p>
                      )}
                    </div>
                  </div>
                ))}

                {projectFields.length === 0 && (
                  <div className="text-center py-6 text-muted-foreground text-sm border-2 border-dashed border-muted-foreground/20 rounded-xl">
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
                className="w-full rounded-full px-6 py-2 bg-muted text-foreground border border-border/50 transition-all duration-200 cursor-pointer"
              >
                <Plus className="h-4 w-4 mr-2" />
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
          className="rounded-full px-6 py-2 bg-muted text-foreground border border-border/50 transition-all duration-200 cursor-pointer"
        >
          Cancel
        </Button>
        <Button
          type="submit"
          form="user-edit-form"
          disabled={updateMutation.isPending}
          className="rounded-full min-w-[120px] bg-primary text-primary-foreground transition-all duration-200 cursor-pointer"
        >
          {updateMutation.isPending ? (
            <>
              <Save className="h-4 w-4 mr-2 animate-pulse" />
              Saving...
            </>
          ) : (
            <>
              <Save className="h-4 w-4 mr-2" />
              Save Changes
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
