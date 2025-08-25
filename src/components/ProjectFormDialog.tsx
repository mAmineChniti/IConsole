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
      <DialogContent className="overflow-y-auto mx-4 max-w-3xl rounded-xl border shadow-lg sm:mx-auto bg-card text-card-foreground border-border max-h-[90vh]">
        <DialogHeader className="space-y-3">
          <DialogTitle className="text-lg text-card-foreground">
            {isEditing ? "Edit Project" : "Create New Project"}
          </DialogTitle>
          <DialogDescription className="text-sm leading-relaxed text-muted-foreground">
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
                  <FormItem className="flex flex-row justify-between items-center p-3 rounded-lg border shadow-sm bg-muted/30">
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
                        className="cursor-pointer border-border bg-background"
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
                  <div className="flex gap-2 items-center">
                    <Users className="w-5 h-5 text-foreground" />
                    <h3 className="text-lg font-semibold text-card-foreground">
                      User Assignments
                    </h3>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Assign users to this project and define their roles
                  </p>

                  <Card className="rounded-xl border shadow-md bg-card text-card-foreground border-border">
                    <CardHeader>
                      <CardTitle className="flex gap-2 items-center text-base text-card-foreground">
                        <UserPlus className="w-4 h-4 text-foreground" />
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
                            <ComboboxTrigger className="w-full rounded-full cursor-pointer bg-input text-foreground border-border" />
                            <ComboboxContent
                              popoverOptions={{
                                className:
                                  "w-[--radix-popover-trigger-width] p-0 border-border shadow-lg",
                              }}
                            >
                              <ComboboxInput
                                placeholder="Search users..."
                                className="py-2 px-3 text-sm rounded-none border-0 focus:ring-0 focus:ring-offset-0 focus:outline-none text-foreground"
                              />
                              <ComboboxList className="overflow-y-auto p-1 max-h-[200px]">
                                {loadingUsers ? (
                                  <div className="py-2 px-3 text-sm text-slate-500 dark:text-slate-400">
                                    Loading users...
                                  </div>
                                ) : availableUsers.length > 0 ? (
                                  availableUsers.map((user) => (
                                    <ComboboxItem
                                      key={user.id}
                                      value={user.id}
                                      keywords={[user.name]}
                                      className="py-2 px-3 mx-1 text-sm rounded-full transition-colors cursor-pointer text-foreground hover:bg-accent hover:text-accent-foreground"
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
                          <div className="grid overflow-y-auto grid-cols-1 gap-2 p-3 max-h-32 rounded-md border border-border text-foreground">
                            {loadingRoles ? (
                              <div className="text-sm text-center text-muted-foreground">
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
                        className="w-full rounded-full transition-all duration-200 cursor-pointer bg-primary text-primary-foreground group hover:bg-accent hover:text-accent-foreground"
                      >
                        <UserPlus className="mr-2 w-4 h-4 transition-transform duration-200 group-hover:scale-110" />
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
                            className="rounded-xl border shadow bg-card text-card-foreground border-border"
                          >
                            <CardContent className="p-4">
                              <div className="flex justify-between items-center">
                                <div className="flex gap-3 items-center">
                                  <div className="flex flex-wrap gap-1 mt-1">
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
                                  className="rounded-full transition-all duration-200 cursor-pointer bg-background text-foreground border-border group hover:bg-accent hover:text-accent-foreground"
                                >
                                  <X className="w-4 h-4 transition-transform duration-200 group-hover:scale-110" />
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

            <div className="flex flex-col gap-3 justify-end pt-4 sm:flex-row">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                className="order-2 w-full rounded-full transition-all duration-200 cursor-pointer sm:order-1 sm:w-auto bg-background text-foreground border-border group hover:bg-accent hover:text-accent-foreground"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={createMutation.isPending || updateMutation.isPending}
                className="order-1 w-full rounded-full transition-all duration-200 cursor-pointer sm:order-2 sm:w-auto bg-primary text-primary-foreground group"
              >
                {createMutation.isPending || updateMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 w-4 h-4 animate-spin" />
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
