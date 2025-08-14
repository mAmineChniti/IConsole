"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Plus, Save, Shield, User, X } from "lucide-react";
import { useEffect, useState } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { toast } from "sonner";

import { AuthService, UserService } from "@/lib/requests";
import type { UserUpdateRequest } from "@/types/RequestInterfaces";
import { UserUpdateRequestSchema } from "@/types/RequestSchemas";
import type {
  ProjectsResponse,
  RolesResponse,
  UserDetailsResponse,
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
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

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
    onError: (error) => toast.error(error.message),
  });

  const onSubmit = (values: UserUpdateRequest) => {
    updateMutation.mutate(values);
  };

  if (isLoading) {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={onBack}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
        </div>
        <div className="space-y-4">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-96" />
          <Separator />
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-32" />
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
              </div>
            </CardContent>
          </Card>
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
    <div className="max-w-4xl mx-auto space-y-6">
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
              Edit User: {userDetails.name}
            </h1>
            <p className="text-muted-foreground">
              Update user information and manage project assignments
            </p>
          </div>
        </div>
        <div className="text-xs text-muted-foreground font-mono bg-muted/20 px-3 py-2 rounded-md inline-block">
          ID: {userDetails.id}
        </div>
      </div>

      <Separator />

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Basic Information</CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} id="user-edit-form">
                <div className="space-y-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Username</FormLabel>
                        <FormControl>
                          <Input {...field} className="h-10" />
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
                            className="h-10"
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
                            className="h-10"
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

        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" />
              Project Assignments
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <Label className="text-sm font-medium leading-none">
                  Current Assignments
                </Label>
                <p className="text-xs text-muted-foreground">
                  Manage project access and roles for this user
                </p>
              </div>

              <div className="space-y-3 max-h-96 overflow-y-auto">
                {projectFields.map((field, index) => (
                  <div
                    key={field.id}
                    className="p-4 border rounded-lg space-y-3 bg-muted/20"
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
                            className="h-6 w-6 p-0 text-destructive hover:text-destructive flex-shrink-0"
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
                      <Select
                        value={field.project_id}
                        onValueChange={(value) => {
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
                        <SelectTrigger
                          id={`project-select-${index}`}
                          aria-labelledby={`project-label-${index}`}
                          className="w-full mt-1 text-sm h-9"
                          disabled={
                            isProjectsLoading ||
                            (availableProjects?.projects?.length ?? 0) === 0
                          }
                        >
                          <SelectValue placeholder="Select a project" />
                        </SelectTrigger>
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
                                  className="cursor-pointer select-none text-xs hover:opacity-80 transition-opacity"
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
                  <div className="text-center py-6 text-muted-foreground text-sm border-2 border-dashed border-muted-foreground/20 rounded-lg">
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
                    toast.message("Complete current assignment first");
                    return;
                  }
                  appendProject({ project_id: "", roles: [] });
                  setProjectsModified(true);
                }}
                className="w-full"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Project Assignment
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-end gap-3 pt-4 border-t">
        <Button type="button" variant="outline" onClick={onBack}>
          Cancel
        </Button>
        <Button
          type="submit"
          form="user-edit-form"
          disabled={updateMutation.isPending}
          className="min-w-[120px]"
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
