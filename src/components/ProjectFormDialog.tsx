import type {
  ProjectAssignment,
  ProjectCreateRequest,
  ProjectUpdateRequest,
} from "@/types/RequestInterfaces";
import type { ProjectDetailsResponse } from "@/types/ResponseInterfaces";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2, UserPlus, Users, X } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

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
import { ProjectCreateRequestSchema } from "@/types/RequestSchemas";

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

  // Fetch users for assignment (only during creation)
  const { data: users, isLoading: loadingUsers } = useQuery({
    queryKey: ["users"],
    queryFn: () => UserService.list(),
    enabled: open && !isEditing,
  });

  // Fetch available roles
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
    onError: (error) => {
      toast.error(`Failed to create project: ${error.message}`);
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
    onError: (error) => {
      toast.error(`Failed to update project: ${error.message}`);
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
      <DialogContent className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border border-border/50 left-[calc(50%+8rem)] translate-x-[-50%] max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-slate-900 dark:text-white">
            {isEditing ? "Edit Project" : "Create New Project"}
          </DialogTitle>
          <DialogDescription className="text-slate-600 dark:text-slate-400">
            {isEditing
              ? "Update the project details"
              : "Create a new project and assign users with roles"}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Basic Project Information */}
            <div className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium text-slate-700 dark:text-slate-300">
                      Project Name
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter project name"
                        className="h-11 rounded-xl border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 transition-all duration-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage className="text-xs text-red-500" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium text-slate-700 dark:text-slate-300">
                      Description
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter project description"
                        className="h-11 rounded-xl border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 transition-all duration-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription className="text-xs text-slate-500 dark:text-slate-400">
                      Optional description for the project
                    </FormDescription>
                    <FormMessage className="text-xs text-red-500" />
                  </FormItem>
                )}
              />
            </div>

            {/* User Assignment Section - Only show during creation */}
            {!isEditing && (
              <>
                <Separator />
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                      User Assignments
                    </h3>
                  </div>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    Assign users to this project and define their roles
                  </p>

                  {/* Add User Assignment Form */}
                  <Card className="bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600">
                    <CardHeader>
                      <CardTitle className="text-base flex items-center gap-2">
                        <UserPlus className="h-4 w-4" />
                        Add User Assignment
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid gap-4 md:grid-cols-2">
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
                            <ComboboxTrigger className="w-full cursor-pointer h-11 rounded-xl border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 transition-all duration-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10" />
                            <ComboboxContent
                              popoverOptions={{
                                className:
                                  "w-[--radix-popover-trigger-width] p-0 border-slate-200 dark:border-slate-700 shadow-lg",
                              }}
                            >
                              <ComboboxInput
                                placeholder="Search users..."
                                className="border-0 rounded-none px-3 py-2 text-sm focus:ring-0 focus:ring-offset-0 focus:outline-none"
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
                                      className="px-3 py-2 text-sm cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white text-slate-700 dark:text-slate-300 rounded-sm mx-1 transition-colors"
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
                          <div className="grid grid-cols-1 gap-2 max-h-32 overflow-y-auto p-3 border border-slate-200 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-700 transition-all duration-200">
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
                                    className="cursor-pointer"
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
                                  <span className="text-sm">{role.name}</span>
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
                        className="w-full cursor-pointer rounded-full group transition-all duration-200"
                      >
                        <UserPlus className="mr-2 h-4 w-4 group-hover:scale-110 transition-transform duration-200" />
                        Add User Assignment
                      </Button>
                    </CardContent>
                  </Card>

                  {/* Current Assignments */}
                  {assignments.length > 0 && (
                    <div className="space-y-3">
                      <h4 className="text-sm font-medium text-slate-700 dark:text-slate-300">
                        Current Assignments ({assignments.length})
                      </h4>
                      <div className="space-y-2">
                        {assignments.map((assignment) => (
                          <Card
                            key={assignment.user_id}
                            className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600"
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
                                  className="cursor-pointer rounded-full group transition-all duration-200"
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

            <div className="flex justify-end gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                className="cursor-pointer rounded-full group transition-all duration-200"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={createMutation.isPending || updateMutation.isPending}
                className="cursor-pointer rounded-full group transition-all duration-200"
              >
                {createMutation.isPending || updateMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {isEditing ? "Updating..." : "Creating..."}
                  </>
                ) : (
                  <>{isEditing ? "Update Project" : "Create Project"}</>
                )}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
