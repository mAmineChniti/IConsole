import { XCombobox } from "@/components/reusable/XCombobox";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
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

  const toggleSelectedRole = (roleName: string) => {
    const next = selectedRoles.includes(roleName)
      ? selectedRoles.filter((r: string) => r !== roleName)
      : [...selectedRoles, roleName];
    setSelectedRoles(next);
  };

  const togglePendingRole = (roleId: string) => {
    const next = pendingRoleIds.includes(roleId)
      ? pendingRoleIds.filter((id: string) => id !== roleId)
      : [...pendingRoleIds, roleId];
    setPendingRoleIds(next);
  };

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
      <DialogContent className="bg-card text-card-foreground border-border mx-4 max-h-[90vh] max-w-4xl overflow-y-auto rounded-xl border shadow-lg sm:mx-auto">
        <DialogHeader className="space-y-3">
          <DialogTitle className="flex items-center gap-2 text-lg">
            <Users className="h-5 w-5 flex-shrink-0" />
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
                  className="flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-300"
                >
                  <User className="h-4 w-4 flex-shrink-0" />
                  Select User
                </Label>
                <XCombobox
                  data={
                    unassignedUsers?.map((user) => ({
                      label: user.user_name,
                      value: user.user_id,
                    })) ?? []
                  }
                  type="user"
                  value={selectedUser}
                  onChange={(value) => setSelectedUser(value ?? "")}
                  placeholder="Select user"
                  searchPlaceholder="Search users..."
                  disabled={loadingUnassigned}
                  className="border-border bg-input text-foreground focus:border-primary focus:ring-primary/20 h-11 w-full cursor-pointer rounded-full border transition-all duration-200 focus:ring-2"
                />
              </div>
              <div className="space-y-2">
                <Label className="flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-300">
                  <Users className="h-4 w-4" />
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
                          const selected = selectedRoles.includes(role.name);
                          return (
                            <Badge
                              key={role.id ?? role.name}
                              variant={selected ? "default" : "outline"}
                              onClick={() => toggleSelectedRole(role.name)}
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
              onClick={handleAssignUser}
              disabled={
                assignUserMutation.isPending ||
                !selectedUser ||
                selectedRoles.length === 0
              }
              className="bg-primary text-primary-foreground w-full cursor-pointer rounded-full border-none"
            >
              {assignUserMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Assigning...
                </>
              ) : (
                <>
                  <UserPlus className="mr-2 h-4 w-4" />
                  Assign User
                </>
              )}
            </Button>
          </div>

          <Separator />

          <div className="space-y-4">
            <h3 className="flex items-center gap-2 text-lg font-semibold text-slate-900 dark:text-white">
              <Users className="h-5 w-5" />
              Current Users
            </h3>
            <div className="space-y-3">
              {project.assignments.map((assignment) => (
                <Card
                  key={assignment.user_id}
                  className="bg-card text-card-foreground border-border rounded-xl border p-4 shadow-lg"
                >
                  <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
                    <div className="flex min-w-0 flex-1 items-center gap-3">
                      <Avatar className="h-10 w-10 flex-shrink-0">
                        <AvatarFallback className="bg-gradient-to-r from-blue-600 to-indigo-600 text-xs font-medium text-white dark:from-blue-500 dark:to-indigo-500">
                          {assignment.user_name.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-medium">
                          {assignment.user_name}
                        </p>
                        <div className="mt-1 flex max-w-full flex-wrap gap-1">
                          {(assignment.roles ?? []).map((role) => (
                            <Badge
                              key={role.role_id}
                              variant="secondary"
                              className="max-w-full truncate rounded-full text-xs"
                            >
                              {role.role_name}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-shrink-0 items-center gap-2">
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
                        className="bg-background text-foreground border-border cursor-pointer rounded-full border"
                      >
                        <Settings className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleRemoveUser(assignment.user_id)}
                        disabled={removeUserMutation.isPending}
                        className="bg-background text-foreground border-border cursor-pointer rounded-full border"
                      >
                        <UserMinus className="h-4 w-4" />
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
            <DialogContent className="bg-card text-card-foreground border-border mx-4 max-h-[90vh] max-w-lg overflow-y-auto rounded-xl border shadow-lg sm:mx-auto">
              <DialogHeader className="space-y-3">
                <DialogTitle className="flex items-center gap-2 text-lg text-slate-900 dark:text-white">
                  <Settings className="h-5 w-5 flex-shrink-0" />
                  <span className="truncate">
                    Edit Roles - {editingUser.userName}
                  </span>
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-3">
                  <div className="flex flex-wrap gap-2">
                    {(roles ?? []).length > 0 ? (
                      (roles ?? []).map((role) => {
                        const selected = pendingRoleIds.includes(role.name);
                        return (
                          <Badge
                            key={role.id ?? role.name}
                            variant={selected ? "default" : "outline"}
                            onClick={() => togglePendingRole(role.name)}
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
                  {pendingRoleIds.length > 0 && (
                    <div className="text-muted-foreground text-sm">
                      Selected:{" "}
                      {(roles ?? [])
                        .filter((r) => pendingRoleIds.includes(r.name))
                        .map((r) => r.name)
                        .join(", ")}
                    </div>
                  )}
                </div>
                <div className="flex flex-col justify-end gap-3 pt-4 sm:flex-row">
                  <Button
                    variant="outline"
                    onClick={() => setEditingUser(undefined)}
                    className="bg-background text-foreground border-border order-2 w-full cursor-pointer rounded-full border sm:order-1 sm:w-auto"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={() => handleUpdateRoles(pendingRoleIds)}
                    disabled={updateRolesMutation.isPending}
                    className="bg-primary text-primary-foreground order-1 w-full cursor-pointer rounded-full border-none sm:order-2 sm:w-auto"
                  >
                    {updateRolesMutation.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        <span className="truncate">Updating...</span>
                      </>
                    ) : (
                      <>
                        <Settings className="mr-2 h-4 w-4" />
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
