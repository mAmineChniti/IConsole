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
      await queryClient.invalidateQueries({
        queryKey: ["projects", "details"],
      });
      await queryClient.invalidateQueries({
        queryKey: ["auth", "projects"],
      });
      await queryClient.invalidateQueries({ queryKey: ["unassigned-users"] });
      toast.success("User assigned successfully");
      setSelectedUser("");
      setSelectedRoles([]);
    },
    onError: (error) => {
      toast.error(`Failed to assign user: ${error.message}`);
    },
  });

  const removeUserMutation = useMutation({
    mutationFn: (data: RemoveUserFromProjectRequest) =>
      ProjectService.removeUser(data),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["projects", "details"],
      });
      await queryClient.invalidateQueries({
        queryKey: ["auth", "projects"],
      });
      await queryClient.invalidateQueries({ queryKey: ["unassigned-users"] });
      toast.success("User removed successfully");
    },
    onError: (error) => {
      toast.error(`Failed to remove user: ${error.message}`);
    },
  });

  const updateRolesMutation = useMutation({
    mutationFn: (data: UpdateUserRolesRequest) =>
      ProjectService.updateUserRoles(data),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["projects", "details"],
      });
      await queryClient.invalidateQueries({
        queryKey: ["auth", "projects"],
      });
      toast.success("User roles updated successfully");
      setEditingUser(undefined);
    },
    onError: (error) => {
      toast.error(`Failed to update user roles: ${error.message}`);
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
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border border-border/50 mx-4 sm:mx-auto">
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
            <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
              <div className="space-y-2">
                <Label
                  id="select-user-label"
                  className="text-sm font-medium text-slate-700 dark:text-slate-300 flex items-center gap-2"
                >
                  <User className="h-4 w-4 flex-shrink-0" />
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
                    className="w-full cursor-pointer h-11 rounded-xl border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 transition-all duration-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                  />
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
                      {loadingUnassigned ? (
                        <div className="px-3 py-2 text-sm text-slate-500 dark:text-slate-400">
                          Loading users...
                        </div>
                      ) : unassignedUsers && unassignedUsers.length > 0 ? (
                        unassignedUsers.map((user) => (
                          <ComboboxItem
                            key={user.user_id}
                            value={user.user_id}
                            keywords={[user.user_name]}
                            className="px-3 py-2 text-sm cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white text-slate-700 dark:text-slate-300 rounded-sm mx-1 transition-colors"
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
                <Label className="text-sm font-medium text-slate-700 dark:text-slate-300 flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Select Roles
                </Label>
                <div className="grid grid-cols-2 gap-2 max-h-32 overflow-y-auto p-3 border border-slate-200 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-700 transition-all duration-200">
                  {loadingRoles ? (
                    <div className="col-span-2 text-center text-sm text-muted-foreground">
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
              className="w-full cursor-pointer rounded-full group transition-all duration-200"
            >
              {assignUserMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Assigning...
                </>
              ) : (
                <>
                  <UserPlus className="mr-2 h-4 w-4 group-hover:scale-110 transition-transform duration-200" />
                  Assign User
                </>
              )}
            </Button>
          </div>

          <Separator />

          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white flex items-center gap-2">
              <Users className="h-5 w-5" />
              Current Users
            </h3>
            <div className="space-y-3">
              {project.assignments.map((assignment) => (
                <Card
                  key={assignment.user_id}
                  className="p-4 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border border-border/50 hover:shadow-md transition-all duration-200"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <Avatar className="h-10 w-10 flex-shrink-0">
                        <AvatarFallback className="bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-500 dark:to-indigo-500 text-white text-xs font-medium">
                          {assignment.user_name.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">
                          {assignment.user_name}
                        </p>
                        <div className="flex flex-wrap gap-1 mt-1 max-w-full">
                          {assignment.roles.map((role) => (
                            <Badge
                              key={role.role_id}
                              variant="secondary"
                              className="text-xs max-w-full truncate"
                            >
                              {role.role_name}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setEditingUser({
                            userId: assignment.user_id,
                            userName: assignment.user_name,
                            currentRoles: assignment.roles,
                          });
                          setPendingRoleIds(
                            assignment.roles.map((role) => role.role_id),
                          );
                        }}
                        className="cursor-pointer rounded-full group transition-all duration-200"
                      >
                        <Settings className="h-4 w-4 group-hover:rotate-90 transition-transform duration-300" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleRemoveUser(assignment.user_id)}
                        disabled={removeUserMutation.isPending}
                        className="cursor-pointer rounded-full group transition-all duration-200"
                      >
                        <UserMinus className="h-4 w-4 group-hover:scale-110 transition-transform duration-200" />
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
            <DialogContent className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border border-border/50 mx-4 sm:mx-auto max-w-lg max-h-[90vh] overflow-y-auto">
              <DialogHeader className="space-y-3">
                <DialogTitle className="text-slate-900 dark:text-white flex items-center gap-2 text-lg">
                  <Settings className="h-5 w-5 flex-shrink-0" />
                  <span className="truncate">
                    Edit Roles - {editingUser.userName}
                  </span>
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto p-3 border border-slate-200 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-700 transition-all duration-200">
                  {roles?.map((role) => {
                    const isChecked = pendingRoleIds.includes(role.id);
                    return (
                      <label
                        key={role.id}
                        className="flex items-center space-x-2 cursor-pointer"
                      >
                        <Checkbox
                          className="cursor-pointer"
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
                <div className="flex flex-col sm:flex-row justify-end gap-3 pt-4">
                  <Button
                    variant="outline"
                    onClick={() => setEditingUser(undefined)}
                    className="cursor-pointer rounded-full w-full sm:w-auto order-2 sm:order-1"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={() => handleUpdateRoles(pendingRoleIds)}
                    disabled={updateRolesMutation.isPending}
                    className="cursor-pointer rounded-full group transition-all duration-200 w-full sm:w-auto order-1 sm:order-2"
                  >
                    {updateRolesMutation.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        <span className="truncate">Updating...</span>
                      </>
                    ) : (
                      <>
                        <Settings className="mr-2 h-4 w-4 group-hover:rotate-90 transition-transform duration-300" />
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
