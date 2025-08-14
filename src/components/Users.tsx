"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Edit, Plus, RefreshCw, Shield, Trash2, User, X } from "lucide-react";
import { useState } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { toast } from "sonner";

import { AuthService, UserService } from "@/lib/requests";
import type {
  ProjectsResponse,
  RolesResponse,
  UserDetailsResponse,
  UserListResponse,
} from "@/types/ResponseInterfaces";

import { ErrorCard } from "@/components/ErrorCard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
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
import type {
  UserCreateRequest,
  UserUpdateRequest,
} from "@/types/RequestInterfaces";
import {
  UserCreateRequestSchema,
  UserUpdateRequestSchema,
} from "@/types/RequestSchemas";

export function UsersManager() {
  const queryClient = useQueryClient();
  const [showCreate, setShowCreate] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [userToDelete, setUserToDelete] = useState<string | undefined>();
  const [editingUser, setEditingUser] = useState<
    UserDetailsResponse | undefined
  >();
  const [projectsModified, setProjectsModified] = useState(false);

  const createForm = useForm<UserCreateRequest>({
    resolver: zodResolver(UserCreateRequestSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      project_id: "",
      roles: ["member"],
    },
  });

  const editForm = useForm<UserUpdateRequest>({
    resolver: zodResolver(UserUpdateRequestSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      projects: undefined,
    },
  });

  const {
    fields: projectFields,
    append: appendProject,
    remove: removeProject,
    update: updateProject,
  } = useFieldArray({
    control: editForm.control,
    name: "projects",
  });

  const {
    data: users,
    isLoading,
    isFetching,
    error,
    refetch,
  } = useQuery<UserListResponse>({
    queryKey: ["users", "list"],
    queryFn: () => UserService.list(),
    refetchInterval: 30000,
    staleTime: 15000,
  });

  const { data: roles } = useQuery<RolesResponse>({
    queryKey: ["users", "roles"],
    queryFn: () => UserService.getRoles(),
    staleTime: 5 * 60 * 1000,
  });

  const { data: availableProjects } = useQuery<ProjectsResponse>({
    queryKey: ["auth", "projects"],
    queryFn: () => AuthService.getProjects(),
    staleTime: 5 * 60 * 1000,
  });

  const createMutation = useMutation({
    mutationFn: async () => {
      const values = createForm.getValues();
      return UserService.create(values);
    },
    onSuccess: async () => {
      toast.success("User created");
      setShowCreate(false);
      createForm.reset({
        name: "",
        email: "",
        password: "",
        project_id: "",
        roles: ["member"],
      });
      await queryClient.invalidateQueries({ queryKey: ["users", "list"] });
    },
    onError: (error) => toast.error(error.message),
  });

  const updateMutation = useMutation({
    mutationFn: async () => {
      if (!editingUser) throw new Error("No user selected");
      const values = editForm.getValues();

      let projectsToSend: typeof values.projects = undefined;

      if (projectsModified) {
        const projects = values.projects;
        projectsToSend =
          projects && projects.length > 0
            ? projects.filter((p) => p.project_id && p.project_id.trim() !== "")
            : [];
      }

      return UserService.update(editingUser.id, {
        name: values.name ?? undefined,
        email: values.email ?? undefined,
        password: values.password ?? undefined,
        ...(projectsModified && { projects: projectsToSend }),
      });
    },
    onSuccess: async () => {
      toast.success("User updated");
      setEditingUser(undefined);
      setProjectsModified(false);
      editForm.reset();
      await queryClient.invalidateQueries({ queryKey: ["users", "list"] });
    },
    onError: (error) => toast.error(error.message),
  });

  const deleteMutation = useMutation({
    mutationFn: () => {
      if (!userToDelete) throw new Error("No user to delete");
      return UserService.delete(userToDelete);
    },
    onSuccess: async () => {
      toast.success("User deleted");
      setShowDelete(false);
      setUserToDelete(undefined);
      await queryClient.invalidateQueries({ queryKey: ["users", "list"] });
    },
    onError: (error) => toast.error(error.message),
  });

  const openEdit = async (id: string) => {
    try {
      const details = await UserService.get(id);
      setEditingUser(details);
      setProjectsModified(false);
      editForm.reset({
        name: details.name,
        email: details.email,
        password: "",
        projects: details.projects.map((p) => ({
          project_id: p.project_id,
          roles: p.roles,
        })),
      });
    } catch (e) {
      toast.error((e as Error).message);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-4 w-16" />
          <div className="flex gap-2">
            <Skeleton className="h-9 w-9" />
            <Skeleton className="h-9 w-24" />
          </div>
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card
              key={i}
              className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border border-border/50"
            >
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <Skeleton className="h-6 w-32" />
                  <div className="flex gap-2">
                    <Skeleton className="h-8 w-8" />
                    <Skeleton className="h-8 w-8" />
                  </div>
                </div>
                <Skeleton className="h-6 w-full mt-2" />
              </CardHeader>
              <CardContent className="space-y-3 pt-0">
                <div className="flex items-center gap-2">
                  <Skeleton className="h-4 w-4" />
                  <Skeleton className="h-4 w-40" />
                </div>
                <div className="flex items-center gap-2">
                  <Skeleton className="h-4 w-4" />
                  <Skeleton className="h-4 w-32" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <ErrorCard
        title="Failed to Load Users"
        message={error?.message || "Unable to load users"}
        onRetry={() => refetch()}
        isRetrying={isFetching}
      />
    );
  }

  const list = users ?? [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          {list.length} user{list.length !== 1 ? "s" : ""}
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            disabled={isFetching}
            className="cursor-pointer"
          >
            {isFetching ? (
              <RefreshCw className="h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4" />
            )}
          </Button>
          <Button
            size="sm"
            onClick={() => setShowCreate(true)}
            className="cursor-pointer"
          >
            <Plus className="h-4 w-4 mr-2" /> New User
          </Button>
        </div>
      </div>

      {list.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="p-8 text-center">
            <User className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">
              No users found. Create your first user.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {list.map((u) => (
            <Card
              key={u.id}
              className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border border-border/50"
            >
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg font-semibold truncate flex-1 mr-2">
                    {u.name}
                  </CardTitle>
                  <div className="flex gap-2">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-8 w-8 p-0 cursor-pointer"
                          onClick={() => openEdit(u.id)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Edit user</TooltipContent>
                    </Tooltip>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-8 w-8 p-0 cursor-pointer"
                          onClick={() => {
                            setUserToDelete(u.id);
                            setShowDelete(true);
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Delete user</TooltipContent>
                    </Tooltip>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground font-mono break-all mt-2 bg-muted/20 px-2 py-1 rounded">
                  ID: {u.id}
                </p>
              </CardHeader>
              <CardContent className="space-y-3 pt-0">
                <div className="flex items-center gap-2 text-sm">
                  <User className="h-4 w-4 text-muted-foreground" />{" "}
                  {u.email || "(no email)"}
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Shield className="h-4 w-4 text-muted-foreground" /> Default
                  Project: {u.project || "-"}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border border-border/50">
          <DialogHeader>
            <DialogTitle>Create User</DialogTitle>
            <DialogDescription>
              Create a new user and assign them to a project with specific
              roles.
            </DialogDescription>
          </DialogHeader>
          <Form {...createForm}>
            <form
              onSubmit={createForm.handleSubmit(() => createMutation.mutate())}
              className="space-y-4"
            >
              <FormField
                control={createForm.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Username</FormLabel>
                    <FormControl>
                      <Input placeholder="jdoe" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={createForm.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="user@example.com"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={createForm.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="Enter password"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={createForm.control}
                name="project_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Project</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a project (optional)" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="">No project</SelectItem>
                        {availableProjects?.projects?.map((p) => (
                          <SelectItem key={p.project_id} value={p.project_id}>
                            {p.project_name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={createForm.control}
                name="roles"
                render={({ field }) => {
                  const current = field.value || [];
                  const toggle = (roleName: string) => {
                    const next = current.includes(roleName)
                      ? current.filter((r: string) => r !== roleName)
                      : [...current, roleName];
                    field.onChange(next);
                  };
                  return (
                    <FormItem>
                      <FormLabel>Roles</FormLabel>
                      <div className="flex flex-wrap gap-2">
                        {roles && roles.length > 0 ? (
                          roles.map((r) => {
                            const selected = current.includes(r.name);
                            return (
                              <Badge
                                key={r.id}
                                variant={selected ? "default" : "outline"}
                                onClick={() => toggle(r.name)}
                                className="cursor-pointer select-none"
                              >
                                {r.name}
                              </Badge>
                            );
                          })
                        ) : (
                          <Badge variant="outline">No roles available</Badge>
                        )}
                      </div>
                      <FormMessage />
                    </FormItem>
                  );
                }}
              />
              <DialogFooter className="gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowCreate(false)}
                  className="cursor-pointer"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={createMutation.isPending}
                  className="cursor-pointer"
                >
                  {createMutation.isPending ? "Creating..." : "Create"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <Dialog
        open={!!editingUser}
        onOpenChange={(o) => {
          if (!o) {
            setEditingUser(undefined);
            setProjectsModified(false);
          }
        }}
      >
        <DialogContent className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border border-border/50">
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
            <DialogDescription>
              Update user information and manage project assignments with roles.
            </DialogDescription>
          </DialogHeader>
          <Form {...editForm}>
            <form
              onSubmit={editForm.handleSubmit(() => updateMutation.mutate())}
              className="space-y-4"
            >
              <FormField
                control={editForm.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Username</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={editForm.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input type="email" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={editForm.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>New Password</FormLabel>
                    <FormControl>
                      <Input type="password" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                    Project Assignments
                  </label>
                  <p className="text-xs text-muted-foreground">
                    Assign projects and roles. Click role badges to toggle, use
                    X button to remove project assignments.
                  </p>
                </div>
                <div className="space-y-3">
                  {projectFields.map((field, index) => (
                    <div
                      key={field.id}
                      className="p-3 border rounded-md space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">
                          Project #{index + 1}
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
                              className="h-6 w-6 p-0 text-destructive hover:text-destructive"
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            Remove project assignment
                          </TooltipContent>
                        </Tooltip>
                      </div>

                      <div>
                        <label className="text-xs text-muted-foreground">
                          Project
                        </label>
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
                          <SelectTrigger className="w-full mt-1 text-sm">
                            <SelectValue placeholder="Select a project" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="">No project</SelectItem>
                            {availableProjects?.projects?.map((p) => (
                              <SelectItem
                                key={p.project_id}
                                value={p.project_id}
                              >
                                {p.project_name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <label className="text-xs text-muted-foreground">
                          Roles (click to toggle)
                        </label>
                        <div className="flex flex-wrap gap-1 mt-1">
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
                            No roles assigned. Click role badges above to
                            assign.
                          </p>
                        )}
                      </div>
                    </div>
                  ))}

                  {projectFields.length === 0 && (
                    <div className="text-center py-4 text-muted-foreground text-sm border-2 border-dashed border-muted-foreground/20 rounded-md">
                      No project assignments yet. Use the button below to add
                      project assignments.
                    </div>
                  )}

                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      if (projectFields.some((p) => !p.project_id)) {
                        toast.message(
                          "Finish selecting a project before adding another assignment",
                        );
                        return;
                      }
                      appendProject({ project_id: "", roles: [] });
                      setProjectsModified(true);
                    }}
                    className="cursor-pointer"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Project Assignment
                  </Button>
                </div>
              </div>
              <DialogFooter className="gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setEditingUser(undefined);
                    setProjectsModified(false);
                  }}
                  className="cursor-pointer"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={updateMutation.isPending}
                  className="cursor-pointer"
                >
                  {updateMutation.isPending ? "Saving..." : "Save"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <Dialog open={showDelete} onOpenChange={setShowDelete}>
        <DialogContent className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border border-border/50">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Trash2 className="h-5 w-5" /> Delete User
            </DialogTitle>
            <DialogDescription>This action cannot be undone.</DialogDescription>
          </DialogHeader>
          <Separator />
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => setShowDelete(false)}
              className="cursor-pointer"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => deleteMutation.mutate()}
              disabled={deleteMutation.isPending}
              className="cursor-pointer"
            >
              {deleteMutation.isPending ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
