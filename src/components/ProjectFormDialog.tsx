import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
  ComboboxTrigger,
} from "@/components/ui/combobox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { Loader2, UserPlus, Users, X } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

export function ProjectFormDialog({
  project,
  open,
  onOpenChange,
}: {
  project?: ProjectDetailsResponse;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const queryClient = useQueryClient();
  const isEditing = !!project;
  const [assignments, setAssignments] = useState<ProjectAssignment[]>([]);
  const [selectedUser, setSelectedUser] = useState("");
  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);

  const form = useForm<ProjectCreateRequest>({
    resolver: zodResolver(ProjectCreateRequestSchema),
    defaultValues: {
      name: project?.name ?? "",
      description: project?.description ?? "",
      enabled: project?.enabled ?? true,
      assignments: [],
    },
  });

  const { data: users, isLoading: loadingUsers } = useQuery({
    queryKey: ["users"],
    queryFn: () => UserService.list(),
    enabled: open && !isEditing,
  });

  const { data: roles, isLoading: loadingRoles } = useQuery({
    queryKey: ["roles"],
    queryFn: () => UserService.getRoles(),
    enabled: open,
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
      toast.success("Project created successfully");
      onOpenChange(false);
      form.reset();
      setAssignments([]);
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
      toast.success("Project updated successfully");
      onOpenChange(false);
      form.reset();
      setAssignments([]);
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
        roles: a.roles,
      })),
    };
    createMutation.mutate(createPayload);
  };

  const availableUsers =
    users?.filter((user) => !assignments.some((a) => a.user_id === user.id)) ??
    [];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-card text-card-foreground border border-border shadow-lg rounded-xl mx-4 sm:mx-auto max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="space-y-3">
          <DialogTitle className="text-lg text-card-foreground">
            {isEditing ? "Edit Project" : "Create New Project"}
          </DialogTitle>
          <DialogDescription className="text-muted-foreground text-sm leading-relaxed">
            {isEditing
              ? "Update the project details"
              : "Create a new project and assign users with roles"}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium text-foreground">
                      Project Name
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter project name"
                        className="rounded-full bg-input text-foreground border-border"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage className="text-xs text-destructive" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium text-foreground">
                      Description
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter project description"
                        className="rounded-full bg-input text-foreground border-border"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription className="text-xs text-muted-foreground">
                      Optional description for the project
                    </FormDescription>
                    <FormMessage className="text-xs text-destructive" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="enabled"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm bg-muted/30">
                    <div className="space-y-0.5">
                      <FormLabel className="text-sm font-medium text-foreground">
                        Enabled
                      </FormLabel>
                      <FormDescription className="text-xs text-muted-foreground">
                        Toggle to enable or disable this project
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        className="border-border bg-background cursor-pointer"
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
                    <Users className="h-5 w-5 text-foreground" />
                    <h3 className="text-lg font-semibold text-card-foreground">
                      User Assignments
                    </h3>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Assign users to this project and define their roles
                  </p>

                  <Card className="bg-card text-card-foreground border border-border shadow-md rounded-xl">
                    <CardHeader>
                      <CardTitle className="text-base flex items-center gap-2 text-card-foreground">
                        <UserPlus className="h-4 w-4 text-foreground" />
                        Add User Assignment
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
                        <div className="space-y-2">
                          <Label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                            Select User
                          </Label>
                          <Combobox
                            data={
                              availableUsers?.map((user) => ({
                                label: user.name,
                                value: user.id,
                              })) ?? []
                            }
                            type="user"
                            value={selectedUser}
                            onValueChange={setSelectedUser}
                          >
                            <ComboboxTrigger className="w-full cursor-pointer rounded-full bg-input text-foreground border-border" />
                            <ComboboxContent
                              popoverOptions={{
                                className:
                                  "w-[--radix-popover-trigger-width] p-0 border-border shadow-lg",
                              }}
                            >
                              <ComboboxInput
                                placeholder="Search users..."
                                className="border-0 rounded-none px-3 py-2 text-sm text-foreground focus:ring-0 focus:ring-offset-0 focus:outline-none"
                              />
                              <ComboboxList className="max-h-[200px] overflow-y-auto p-1">
                                {loadingUsers ? (
                                  <div className="px-3 py-2 text-sm text-slate-500 dark:text-slate-400">
                                    Loading users...
                                  </div>
                                ) : availableUsers.length > 0 ? (
                                  availableUsers.map((user) => (
                                    <ComboboxItem
                                      key={user.id}
                                      value={user.id}
                                      keywords={[user.name]}
                                      className="px-3 py-2 text-sm cursor-pointer hover:bg-accent hover:text-accent-foreground text-foreground rounded-full mx-1 transition-colors"
                                    >
                                      {user.name}
                                    </ComboboxItem>
                                  ))
                                ) : (
                                  <ComboboxEmpty />
                                )}
                              </ComboboxList>
                            </ComboboxContent>
                          </Combobox>
                        </div>

                        <div className="space-y-2">
                          <Label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                            Select Roles
                          </Label>
                          <div className="grid grid-cols-1 gap-2 max-h-32 overflow-y-auto p-3 border border-border rounded-md text-foreground">
                            {loadingRoles ? (
                              <div className="text-center text-sm text-muted-foreground">
                                Loading roles...
                              </div>
                            ) : (
                              roles?.map((role) => (
                                <label
                                  key={role.id}
                                  className="flex items-center space-x-2 cursor-pointer"
                                >
                                  <Checkbox
                                    className="cursor-pointer border-border"
                                    checked={selectedRoles.includes(role.name)}
                                    onCheckedChange={(checked) => {
                                      if (checked === true) {
                                        setSelectedRoles([
                                          ...selectedRoles,
                                          role.name,
                                        ]);
                                      } else {
                                        setSelectedRoles(
                                          selectedRoles.filter(
                                            (r) => r !== role.name,
                                          ),
                                        );
                                      }
                                    }}
                                  />
                                  <span className="text-sm text-foreground">
                                    {role.name}
                                  </span>
                                </label>
                              ))
                            )}
                          </div>
                        </div>
                      </div>

                      <Button
                        type="button"
                        onClick={handleAddUserAssignment}
                        disabled={!selectedUser || selectedRoles.length === 0}
                        className="w-full rounded-full bg-primary text-primary-foreground hover:bg-accent hover:text-accent-foreground cursor-pointer group transition-all duration-200"
                      >
                        <UserPlus className="mr-2 h-4 w-4 group-hover:scale-110 transition-transform duration-200" />
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
                            className="bg-card text-card-foreground border border-border shadow rounded-xl"
                          >
                            <CardContent className="p-4">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                  <div className="flex flex-wrap gap-1 mt-1">
                                    {assignment.roles.map((role: string) => (
                                      <Badge
                                        key={role}
                                        variant="secondary"
                                        className="text-xs"
                                      >
                                        {role}
                                      </Badge>
                                    ))}
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
                                  className="rounded-full bg-background text-foreground border-border hover:bg-accent hover:text-accent-foreground cursor-pointer group transition-all duration-200"
                                >
                                  <X className="h-4 w-4 group-hover:scale-110 transition-transform duration-200" />
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

            <div className="flex flex-col sm:flex-row justify-end gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                className="rounded-full bg-background text-foreground border-border hover:bg-accent hover:text-accent-foreground cursor-pointer group transition-all duration-200 w-full sm:w-auto order-2 sm:order-1"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={createMutation.isPending || updateMutation.isPending}
                className="rounded-full bg-primary text-primary-foreground cursor-pointer group transition-all duration-200 w-full sm:w-auto order-1 sm:order-2"
              >
                {createMutation.isPending || updateMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    <span className="truncate">
                      {isEditing ? "Updating..." : "Creating..."}
                    </span>
                  </>
                ) : (
                  <span className="truncate">
                    {isEditing ? "Update Project" : "Create Project"}
                  </span>
                )}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
