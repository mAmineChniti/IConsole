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
import { useEffect, useState } from "react";
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

  useEffect(() => {
    if (isEditing && project && open) {
      form.reset({
        name: project.name ?? "",
        description: project.description ?? "",
        enabled: project.enabled ?? true,
        assignments: [],
      });
    }
  }, [isEditing, project, open, form]);

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
      await queryClient.invalidateQueries({
        queryKey: ["projects"],
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
      await queryClient.invalidateQueries({
        queryKey: ["projects"],
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
        roles: a.roles ?? [],
      })),
    };
    createMutation.mutate(createPayload);
  };

  const availableUsers =
    users?.filter((user) => !assignments.some((a) => a.user_id === user.id)) ??
    [];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-card text-card-foreground border-border mx-4 max-h-[90vh] max-w-3xl overflow-y-auto rounded-xl border shadow-lg sm:mx-auto">
        <DialogHeader className="space-y-3">
          <DialogTitle className="text-card-foreground text-lg">
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
                    <Users className="text-foreground h-5 w-5" />
                    <h3 className="text-card-foreground text-lg font-semibold">
                      User Assignments
                    </h3>
                  </div>
                  <p className="text-muted-foreground text-sm">
                    Assign users to this project and define their roles
                  </p>

                  <Card className="bg-card text-card-foreground border-border rounded-xl border shadow-md">
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
                            <ComboboxTrigger className="bg-input text-foreground border-border w-full cursor-pointer rounded-full" />
                            <ComboboxContent
                              popoverOptions={{
                                className:
                                  "w-[--radix-popover-trigger-width] p-0 border-border shadow-lg",
                              }}
                            >
                              <ComboboxInput
                                placeholder="Search users..."
                                className="text-foreground rounded-none border-0 px-3 py-2 text-sm focus:ring-0 focus:ring-offset-0 focus:outline-none"
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
                                      className="text-foreground hover:bg-accent hover:text-accent-foreground mx-1 cursor-pointer rounded-full px-3 py-2 text-sm transition-colors"
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
                          <div className="border-border text-foreground grid max-h-32 grid-cols-1 gap-2 overflow-y-auto rounded-md border p-3">
                            {loadingRoles ? (
                              <div className="text-muted-foreground text-center text-sm">
                                Loading roles...
                              </div>
                            ) : (
                              roles?.map((role) => (
                                <label
                                  key={role.id}
                                  className="flex cursor-pointer items-center space-x-2"
                                >
                                  <Checkbox
                                    className="border-border cursor-pointer"
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
                                  <span className="text-foreground text-sm">
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
                onClick={() => onOpenChange(false)}
                className="bg-background text-foreground border-border group hover:bg-accent hover:text-accent-foreground order-2 w-full cursor-pointer rounded-full transition-all duration-200 sm:order-1 sm:w-auto"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={createMutation.isPending || updateMutation.isPending}
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
