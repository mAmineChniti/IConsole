import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
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
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { ProjectService, UserService } from "@/lib/requests";
import type {
  AssignUserToProjectRequest,
  RemoveUserFromProjectRequest,
  UpdateUserRolesRequest,
} from "@/types/RequestInterfaces";
import type {
  ProjectDetailsResponse,
  UserRole,
} from "@/types/ResponseInterfaces";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Loader2,
  Settings,
  User,
  UserMinus,
  UserPlus,
  Users,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export function UserManagementDialog({
  project,
  open,
  onOpenChange,
}: {
  project: ProjectDetailsResponse;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const queryClient = useQueryClient();
  const [selectedUser, setSelectedUser] = useState("");
  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);
  const [editingUser, setEditingUser] = useState<
    | {
        userId: string;
        userName: string;
        currentRoles: UserRole[];
      }
    | undefined
  >(undefined);
  const [pendingRoleIds, setPendingRoleIds] = useState<string[]>([]);

  const { data: unassignedUsers, isLoading: loadingUnassigned } = useQuery({
    queryKey: ["unassigned-users", project.id],
    queryFn: () => ProjectService.getUnassignedUsers(project.id),
    enabled: open,
  });

  const { data: roles, isLoading: loadingRoles } = useQuery({
    queryKey: ["user-roles"],
    queryFn: () => UserService.getRoles(),
    enabled: open,
  });

  const assignUserMutation = useMutation({
    mutationFn: (data: AssignUserToProjectRequest) =>
      ProjectService.assignUser(data),
    onSuccess: async () => {
      await queryClient.cancelQueries({
        queryKey: ["projects", "get", project.id],
      });
      await queryClient.invalidateQueries({
        queryKey: ["projects", "get", project.id],
      });
      await queryClient.invalidateQueries({
        queryKey: ["auth", "projects"],
      });
      await queryClient.invalidateQueries({
        queryKey: ["unassigned-users", project.id],
      });
      toast.success("User assigned successfully");
      setSelectedUser("");
      setSelectedRoles([]);
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

  const removeUserMutation = useMutation({
    mutationFn: (data: RemoveUserFromProjectRequest) =>
      ProjectService.removeUser(data),
    onSuccess: async () => {
      await queryClient.cancelQueries({
        queryKey: ["projects", "get", project.id],
      });
      await queryClient.invalidateQueries({
        queryKey: ["projects", "get", project.id],
      });
      await queryClient.invalidateQueries({
        queryKey: ["auth", "projects"],
      });
      await queryClient.invalidateQueries({
        queryKey: ["unassigned-users", project.id],
      });
      toast.success("User removed successfully");
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

  const updateRolesMutation = useMutation({
    mutationFn: (data: UpdateUserRolesRequest) =>
      ProjectService.updateUserRoles(data),
    onSuccess: async () => {
      await queryClient.cancelQueries({
        queryKey: ["projects", "get", project.id],
      });
      await queryClient.invalidateQueries({
        queryKey: ["projects", "get", project.id],
      });
      await queryClient.invalidateQueries({
        queryKey: ["auth", "projects"],
      });
      toast.success("User roles updated successfully");
      setEditingUser(undefined);
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

  const handleAssignUser = () => {
    if (!selectedUser || selectedRoles.length === 0) {
      toast.error("Please select a user and at least one role");
      return;
    }

    assignUserMutation.mutate({
      user_id: selectedUser,
      project_id: project.id,
      role_names: selectedRoles,
    });
  };

  const handleRemoveUser = (userId: string) => {
    removeUserMutation.mutate({
      user_id: userId,
      project_id: project.id,
    });
  };

  const handleUpdateRoles = (newRoleIds: string[]) => {
    if (!editingUser) return;

    if (newRoleIds.length === 0) {
      toast.error("Please select at least one role");
      return;
    }
    updateRolesMutation.mutate({
      user_id: editingUser.userId,
      project_id: project.id,
      role_ids: newRoleIds,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="overflow-y-auto mx-4 max-w-4xl rounded-xl border shadow-lg sm:mx-auto max-h-[90vh] bg-card text-card-foreground border-border">
        <DialogHeader className="space-y-3">
          <DialogTitle className="flex gap-2 items-center text-lg">
            <Users className="flex-shrink-0 w-5 h-5" />
            <span className="truncate">Manage Users - {project.name}</span>
          </DialogTitle>
          <DialogDescription className="text-sm leading-relaxed">
            Assign users to this project and manage their roles
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label
                  id="select-user-label"
                  className="flex gap-2 items-center text-sm font-medium text-slate-700 dark:text-slate-300"
                >
                  <User className="flex-shrink-0 w-4 h-4" />
                  Select User
                </Label>
                <Combobox
                  data={
                    unassignedUsers?.map((user) => ({
                      label: user.user_name,
                      value: user.user_id,
                    })) ?? []
                  }
                  type="user"
                  value={selectedUser}
                  onValueChange={setSelectedUser}
                >
                  <ComboboxTrigger
                    aria-labelledby="select-user-label"
                    className="w-full h-11 rounded-full border transition-all duration-200 cursor-pointer focus:ring-2 border-border bg-input text-foreground focus:border-primary focus:ring-primary/20"
                  />
                  <ComboboxContent
                    popoverOptions={{
                      className:
                        "w-[--radix-popover-trigger-width] p-0 shadow-lg",
                    }}
                  >
                    <ComboboxInput
                      placeholder="Search users..."
                      className="py-2 px-3 text-sm rounded-none border-0 focus:ring-0 focus:ring-offset-0 focus:outline-none text-foreground"
                    />
                    <ComboboxList className="overflow-y-auto p-1 max-h-[200px]">
                      {loadingUnassigned ? (
                        <div className="py-2 px-3 text-sm">
                          Loading users...
                        </div>
                      ) : unassignedUsers && unassignedUsers.length > 0 ? (
                        unassignedUsers.map((user) => (
                          <ComboboxItem
                            key={user.user_id}
                            value={user.user_id}
                            keywords={[user.user_name]}
                            className="py-2 px-3 mx-1 text-sm rounded-full cursor-pointer text-foreground"
                          >
                            {user.user_name}
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
                <Label className="flex gap-2 items-center text-sm font-medium text-slate-700 dark:text-slate-300">
                  <Users className="w-4 h-4" />
                  Select Roles
                </Label>
                <div className="grid overflow-y-auto grid-cols-2 gap-2 p-3 max-h-32 rounded-md border transition-all duration-200 border-border text-foreground">
                  {loadingRoles ? (
                    <div className="col-span-2 text-sm text-center text-muted-foreground">
                      Loading roles...
                    </div>
                  ) : (
                    roles?.map((role) => (
                      <label
                        key={role.id}
                        className="flex items-center space-x-2 cursor-pointer"
                      >
                        <Checkbox
                          className="cursor-pointer bg-input text-foreground border-border"
                          checked={selectedRoles.includes(role.name)}
                          onCheckedChange={(checked) => {
                            if (checked === true) {
                              setSelectedRoles([...selectedRoles, role.name]);
                            } else {
                              setSelectedRoles(
                                selectedRoles.filter((r) => r !== role.name),
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
              onClick={handleAssignUser}
              disabled={
                assignUserMutation.isPending ||
                !selectedUser ||
                selectedRoles.length === 0
              }
              className="w-full rounded-full border-none cursor-pointer bg-primary text-primary-foreground"
            >
              {assignUserMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 w-4 h-4 animate-spin" />
                  Assigning...
                </>
              ) : (
                <>
                  <UserPlus className="mr-2 w-4 h-4" />
                  Assign User
                </>
              )}
            </Button>
          </div>

          <Separator />

          <div className="space-y-4">
            <h3 className="flex gap-2 items-center text-lg font-semibold dark:text-white text-slate-900">
              <Users className="w-5 h-5" />
              Current Users
            </h3>
            <div className="space-y-3">
              {project.assignments.map((assignment) => (
                <Card
                  key={assignment.user_id}
                  className="p-4 rounded-xl border shadow-lg bg-card text-card-foreground border-border"
                >
                  <div className="flex flex-col gap-3 justify-between sm:flex-row sm:items-center">
                    <div className="flex flex-1 gap-3 items-center min-w-0">
                      <Avatar className="flex-shrink-0 w-10 h-10">
                        <AvatarFallback className="text-xs font-medium text-white bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-500 dark:to-indigo-500">
                          {assignment.user_name.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">
                          {assignment.user_name}
                        </p>
                        <div className="flex flex-wrap gap-1 mt-1 max-w-full">
                          {(assignment.roles ?? []).map((role) => (
                            <Badge
                              key={role.role_id}
                              variant="secondary"
                              className="max-w-full text-xs rounded-full truncate"
                            >
                              {role.role_name}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-shrink-0 gap-2 items-center">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setEditingUser({
                            userId: assignment.user_id,
                            userName: assignment.user_name,
                            currentRoles: assignment.roles ?? [],
                          });
                          setPendingRoleIds(
                            (assignment.roles ?? []).map(
                              (role) => role.role_id,
                            ),
                          );
                        }}
                        className="rounded-full border cursor-pointer bg-background text-foreground border-border"
                      >
                        <Settings className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleRemoveUser(assignment.user_id)}
                        disabled={removeUserMutation.isPending}
                        className="rounded-full border cursor-pointer bg-background text-foreground border-border"
                      >
                        <UserMinus className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </div>

        {editingUser && (
          <Dialog
            open={!!editingUser}
            onOpenChange={() => setEditingUser(undefined)}
          >
            <DialogContent className="overflow-y-auto mx-4 max-w-lg rounded-xl border shadow-lg sm:mx-auto bg-card text-card-foreground border-border max-h-[90vh]">
              <DialogHeader className="space-y-3">
                <DialogTitle className="flex gap-2 items-center text-lg dark:text-white text-slate-900">
                  <Settings className="flex-shrink-0 w-5 h-5" />
                  <span className="truncate">
                    Edit Roles - {editingUser.userName}
                  </span>
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid overflow-y-auto grid-cols-1 gap-2 p-3 max-h-48 rounded-md border transition-all duration-200 sm:grid-cols-2 text-foreground">
                  {roles?.map((role) => {
                    const isChecked = pendingRoleIds.includes(role.id);
                    return (
                      <label
                        key={role.id}
                        className="flex items-center space-x-2 cursor-pointer"
                      >
                        <Checkbox
                          className="cursor-pointer text-foreground border-border"
                          checked={isChecked}
                          onCheckedChange={(checked) => {
                            if (checked === true) {
                              setPendingRoleIds([...pendingRoleIds, role.id]);
                            } else {
                              setPendingRoleIds(
                                pendingRoleIds.filter((id) => id !== role.id),
                              );
                            }
                          }}
                        />
                        <span className="text-sm">{role.name}</span>
                      </label>
                    );
                  })}
                </div>
                <div className="flex flex-col gap-3 justify-end pt-4 sm:flex-row">
                  <Button
                    variant="outline"
                    onClick={() => setEditingUser(undefined)}
                    className="order-2 w-full rounded-full border cursor-pointer sm:order-1 sm:w-auto bg-background text-foreground border-border"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={() => handleUpdateRoles(pendingRoleIds)}
                    disabled={updateRolesMutation.isPending}
                    className="order-1 w-full rounded-full border-none cursor-pointer sm:order-2 sm:w-auto bg-primary text-primary-foreground"
                  >
                    {updateRolesMutation.isPending ? (
                      <>
                        <Loader2 className="mr-2 w-4 h-4 animate-spin" />
                        <span className="truncate">Updating...</span>
                      </>
                    ) : (
                      <>
                        <Settings className="mr-2 w-4 h-4" />
                        <span className="truncate">Update Roles</span>
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </DialogContent>
    </Dialog>
  );
}
