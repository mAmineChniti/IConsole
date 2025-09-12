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
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { ProjectService, UserService } from "@/lib/requests";
import type {
  ProjectAssignment,
  ProjectCreateRequest,
  ProjectUpdateRequest,
} from "@/types/RequestInterfaces";
import { ProjectCreateRequestSchema } from "@/types/RequestSchemas";
import type { ProjectDetailsResponse } from "@/types/ResponseInterfaces";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Loader2, Plus, UserPlus, Users, X } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

export function ProjectForm({
  project,
  onBack,
  onSuccess,
}: {
  project?: ProjectDetailsResponse;
  onBack: () => void;
  onSuccess: () => void;
}) {
  const queryClient = useQueryClient();
  const isEditing = !!project;
  const [assignments, setAssignments] = useState<ProjectAssignment[]>([]);
  const [selectedUser, setSelectedUser] = useState("");
  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);

  const toggleSelectedRole = (roleName: string) => {
    const next = selectedRoles.includes(roleName)
      ? selectedRoles.filter((r: string) => r !== roleName)
      : [...selectedRoles, roleName];
    setSelectedRoles(next);
  };

  const form = useForm<ProjectCreateRequest>({
    resolver: zodResolver(ProjectCreateRequestSchema),
    defaultValues: {
      name: project?.name ?? "",
      description: project?.description ?? "",
      enabled: project?.enabled ?? true,
      assignments: [],
    },
  });

  useEffect(() => {
    if (isEditing && project) {
      form.reset({
        name: project.name ?? "",
        description: project.description ?? "",
        enabled: project.enabled ?? true,
        assignments: [],
      });
    }
  }, [isEditing, project, form]);

  const { data: users, isLoading: loadingUsers } = useQuery({
    queryKey: ["users"],
    queryFn: () => UserService.list(),
    enabled: !isEditing,
  });

  const { data: roles, isLoading: loadingRoles } = useQuery({
    queryKey: ["roles"],
    queryFn: () => UserService.getRoles(),
  });

  const createMutation = useMutation({
    mutationFn: (data: ProjectCreateRequest) => ProjectService.create(data),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["projects", "details"],
      });
      await queryClient.invalidateQueries({
        queryKey: ["auth", "projects"],
      });
      await queryClient.invalidateQueries({
        queryKey: ["projects"],
      });
      toast.success("Project created successfully");
      form.reset();
      setAssignments([]);
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

  const updateMutation = useMutation({
    mutationFn: ({ id, ...data }: ProjectUpdateRequest & { id: string }) =>
      ProjectService.update(id, data),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["projects", "details"],
      });
      await queryClient.invalidateQueries({
        queryKey: ["auth", "projects"],
      });
      await queryClient.invalidateQueries({
        queryKey: ["projects"],
      });
      toast.success("Project updated successfully");
      form.reset();
      setAssignments([]);
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

  const handleAddUserAssignment = () => {
    if (!selectedUser || selectedRoles.length === 0) {
      toast.error("Please select a user and at least one role");
      return;
    }

    const user = users?.find((u) => u.id === selectedUser);
    if (!user) {
      toast.error("Selected user not found");
      return;
    }

    if (assignments.some((a) => a.user_id === selectedUser)) {
      toast.error("User is already assigned to this project");
      return;
    }

    const newAssignment: ProjectAssignment = {
      user_id: selectedUser,
      roles: selectedRoles,
    };

    setAssignments([...assignments, newAssignment]);
    setSelectedUser("");
    setSelectedRoles([]);
    toast.success("User assignment added");
  };

  const handleRemoveUserAssignment = (userId: string) => {
    setAssignments(assignments.filter((a) => a.user_id !== userId));
    toast.success("User assignment removed");
  };

  const onSubmit = (data: ProjectCreateRequest) => {
    if (isEditing && project) {
      const updatePayload: ProjectUpdateRequest = {
        name: data.name,
        description: data.description,
        enabled: data.enabled,
      };
      updateMutation.mutate({ ...updatePayload, id: project.id });
      return;
    }

    const createPayload: ProjectCreateRequest = {
      ...data,
      assignments: assignments.map((a) => ({
        user_id: a.user_id,
        roles: a.roles ?? [],
      })),
    };
    createMutation.mutate(createPayload);
  };

  const availableUsers =
    users?.filter((user) => !assignments.some((a) => a.user_id === user.id)) ??
    [];

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
          Back to Projects
        </Button>
      </div>

      <Card className="text-card-foreground border-border/50 mx-auto w-full rounded-xl border bg-neutral-50 shadow-lg dark:bg-neutral-900">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <div className="flex items-center gap-4">
              <div className="bg-primary/10 flex items-center justify-center rounded-full p-3">
                <Users className="text-primary h-7 w-7" />
              </div>
              <div>
                <h1 className="text-foreground mb-1 text-2xl font-bold tracking-tight">
                  {isEditing ? "Edit Project" : "Create New Project"}
                </h1>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {isEditing
                    ? "Update the project details"
                    : "Create a new project and assign users with roles"}
                </p>
              </div>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-foreground text-sm font-medium">
                        Project Name
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Enter project name"
                          className="bg-input text-foreground border-border rounded-full"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage className="text-destructive text-xs" />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-foreground text-sm font-medium">
                        Description
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Enter project description"
                          className="bg-input text-foreground border-border rounded-full"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription className="text-muted-foreground text-xs">
                        Optional description for the project
                      </FormDescription>
                      <FormMessage className="text-destructive text-xs" />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="enabled"
                  render={({ field }) => (
                    <FormItem className="bg-muted/30 flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                      <div className="space-y-0.5">
                        <FormLabel className="text-foreground text-sm font-medium">
                          Enabled
                        </FormLabel>
                        <FormDescription className="text-muted-foreground text-xs">
                          Toggle to enable or disable this project
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          className="cursor-pointer"
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>

              {!isEditing && (
                <>
                  <Separator />
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <Users className="text-foreground h-5 w-5" />
                      <h3 className="text-card-foreground text-lg font-semibold">
                        User Assignments
                      </h3>
                    </div>
                    <p className="text-muted-foreground text-sm">
                      Assign users to this project and define their roles
                    </p>

                    <Card className="text-card-foreground border-border rounded-xl border bg-neutral-50 shadow-md dark:bg-neutral-900">
                      <CardHeader>
                        <CardTitle className="text-card-foreground flex items-center gap-2 text-base">
                          <UserPlus className="text-foreground h-4 w-4" />
                          Add User Assignment
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                          <div className="space-y-2">
                            <Label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                              Select User
                            </Label>
                            <XCombobox
                              data={
                                availableUsers?.map((user) => ({
                                  label: user.name,
                                  value: user.id,
                                })) ?? []
                              }
                              type="user"
                              value={selectedUser}
                              onChange={(value) => setSelectedUser(value ?? "")}
                              placeholder={
                                loadingUsers
                                  ? "Loading users..."
                                  : "Select user"
                              }
                              searchPlaceholder="Search users..."
                              emptyText="No users found."
                              disabled={loadingUsers}
                              className="bg-input text-foreground border-border w-full cursor-pointer rounded-full"
                            />
                          </div>

                          <div className="space-y-2">
                            <Label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                              Select Roles
                            </Label>
                            <div className="space-y-3">
                              {loadingRoles ? (
                                <div className="text-muted-foreground text-center text-sm">
                                  Loading roles...
                                </div>
                              ) : (
                                <div className="flex flex-wrap gap-2">
                                  {(roles ?? []).length > 0 ? (
                                    (roles ?? []).map((role) => {
                                      const selected = selectedRoles.includes(
                                        role.name,
                                      );
                                      return (
                                        <Badge
                                          key={role.id ?? role.name}
                                          variant={
                                            selected ? "default" : "outline"
                                          }
                                          onClick={() =>
                                            toggleSelectedRole(role.name)
                                          }
                                          className={
                                            "cursor-pointer rounded-full px-3 py-1 text-sm font-medium transition-opacity select-none hover:opacity-80" +
                                            (selected
                                              ? " bg-primary text-primary-foreground"
                                              : "")
                                          }
                                        >
                                          {role.name}
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
                              )}
                              {selectedRoles.length > 0 && (
                                <div className="text-muted-foreground text-sm">
                                  Selected: {selectedRoles.join(", ")}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>

                        <Button
                          type="button"
                          onClick={handleAddUserAssignment}
                          disabled={!selectedUser || selectedRoles.length === 0}
                          className="bg-primary text-primary-foreground group hover:bg-accent hover:text-accent-foreground w-full cursor-pointer rounded-full transition-all duration-200"
                        >
                          <UserPlus className="mr-2 h-4 w-4 transition-transform duration-200 group-hover:scale-110" />
                          Add User Assignment
                        </Button>
                      </CardContent>
                    </Card>

                    {assignments.length > 0 && (
                      <div className="space-y-3">
                        <h4 className="text-sm font-medium text-slate-700 dark:text-slate-300">
                          Current Assignments ({assignments.length})
                        </h4>
                        <div className="space-y-2">
                          {assignments.map((assignment) => (
                            <Card
                              key={assignment.user_id}
                              className="bg-card text-card-foreground border-border rounded-xl border shadow"
                            >
                              <CardContent className="p-4">
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-3">
                                    <span className="text-foreground text-sm font-medium">
                                      {users?.find(
                                        (u) => u.id === assignment.user_id,
                                      )?.name ?? assignment.user_id}
                                    </span>
                                    <div className="mt-1 flex flex-wrap gap-1">
                                      {(assignment.roles ?? []).map(
                                        (role: string) => (
                                          <Badge
                                            key={role}
                                            variant="secondary"
                                            className="text-xs"
                                          >
                                            {role}
                                          </Badge>
                                        ),
                                      )}
                                    </div>
                                  </div>
                                  <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() =>
                                      handleRemoveUserAssignment(
                                        assignment.user_id,
                                      )
                                    }
                                    className="bg-background text-foreground border-border group hover:bg-accent hover:text-accent-foreground cursor-pointer rounded-full transition-all duration-200"
                                  >
                                    <X className="h-4 w-4 transition-transform duration-200 group-hover:scale-110" />
                                  </Button>
                                </div>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </>
              )}

              <div className="flex flex-col justify-end gap-3 pt-4 sm:flex-row">
                <Button
                  type="button"
                  variant="outline"
                  onClick={onBack}
                  className="bg-background text-foreground border-border group hover:bg-accent hover:text-accent-foreground order-2 w-full cursor-pointer rounded-full transition-all duration-200 sm:order-1 sm:w-auto"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={
                    createMutation.isPending || updateMutation.isPending
                  }
                  className="bg-primary text-primary-foreground group order-1 w-full cursor-pointer rounded-full transition-all duration-200 sm:order-2 sm:w-auto"
                >
                  {createMutation.isPending || updateMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      <span className="truncate">
                        {isEditing ? "Updating..." : "Creating..."}
                      </span>
                    </>
                  ) : (
                    <>
                      <Plus className="mr-2 h-4 w-4" />
                      <span className="truncate">
                        {isEditing ? "Update Project" : "Create Project"}
                      </span>
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
