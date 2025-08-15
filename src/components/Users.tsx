"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Activity,
  AtSign,
  Building,
  Clock,
  Crown,
  Edit,
  Plus,
  RefreshCw,
  Trash2,
  User,
  UserCheck,
  Users as UsersIcon,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { UserService } from "@/lib/requests";
import type {
  UserDeleteResponse,
  UserListResponse,
} from "@/types/ResponseInterfaces";

import { ErrorCard } from "@/components/ErrorCard";
import { UserCreateForm } from "@/components/UserCreateForm";
import { UserEditForm } from "@/components/UserEditForm";
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
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

type ViewMode = "list" | "create" | "edit";

export function UsersManager() {
  const queryClient = useQueryClient();
  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [editingUserId, setEditingUserId] = useState<string | undefined>();
  const [showDelete, setShowDelete] = useState(false);
  const [userToDelete, setUserToDelete] = useState<string | undefined>();

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

  const deleteMutation = useMutation<UserDeleteResponse, Error, string>({
    mutationFn: (id: string) => UserService.delete(id),
    onSuccess: async () => {
      toast.success("User deleted successfully");
      setShowDelete(false);
      setUserToDelete(undefined);
      await queryClient.invalidateQueries({ queryKey: ["users", "list"] });
    },
    onError: (err) => toast.error(err.message),
  });

  const handleEdit = (userId: string) => {
    setEditingUserId(userId);
    setViewMode("edit");
  };

  const handleBackToList = () => {
    setViewMode("list");
    setEditingUserId(undefined);
  };

  const handleSuccessAction = () => {
    setViewMode("list");
    setEditingUserId(undefined);
  };

  if (viewMode === "create") {
    return (
      <UserCreateForm
        onBack={handleBackToList}
        onSuccess={handleSuccessAction}
      />
    );
  }

  if (viewMode === "edit" && editingUserId) {
    return (
      <UserEditForm
        userId={editingUserId}
        onBack={handleBackToList}
        onSuccess={handleSuccessAction}
      />
    );
  }

  if (isLoading) {
    return (
      <div className="space-y-8">
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 ring-1 ring-primary/10 flex items-center justify-center">
                <UsersIcon className="h-8 w-8 text-primary opacity-60" />
              </div>
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500/60 rounded-full border-2 border-background flex items-center justify-center">
                <div className="w-2 h-2 bg-white/80 rounded-full" />
              </div>
            </div>
            <div className="space-y-3 flex-1 min-w-0">
              <Skeleton className="h-9 w-64" />
              <Skeleton className="h-5 w-80 max-w-full" />
            </div>
          </div>
          <Separator />
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-primary/5 border border-primary/10">
                <Skeleton className="h-4 w-20" />
              </div>
            </div>
            <div className="flex gap-3">
              <Skeleton className="h-9 w-9 rounded-lg" />
              <Skeleton className="h-9 w-32 rounded-lg" />
            </div>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card
              key={i}
              className="group relative overflow-hidden border-0 bg-gradient-to-br from-card to-card/50 backdrop-blur-sm ring-1 ring-border/50"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-primary/[0.02] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <CardHeader className="pb-4 relative">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-4 flex-1 min-w-0">
                    <div className="relative">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center ring-1 ring-primary/10">
                        <Skeleton className="h-6 w-6 rounded-md" />
                      </div>
                      <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500/40 rounded-full border-2 border-card" />
                    </div>
                    <div className="space-y-2 flex-1 min-w-0">
                      <Skeleton className="h-6 w-40" />
                      <div className="flex items-center gap-2">
                        <Skeleton className="h-5 w-16" />
                        <Skeleton className="h-5 w-14" />
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-1 ml-3 opacity-100">
                    <Skeleton className="h-8 w-8 rounded-lg" />
                    <Skeleton className="h-8 w-8 rounded-lg" />
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4 pt-0 relative">
                <div className="space-y-3">
                  <div className="flex items-center gap-3 p-2 rounded-lg bg-muted/30">
                    <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center">
                      <Skeleton className="h-4 w-4 rounded" />
                    </div>
                    <div className="flex-1 min-w-0 space-y-2">
                      <Skeleton className="h-3 w-14" />
                      <Skeleton className="h-4 w-40" />
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-2 rounded-lg bg-muted/30">
                    <div className="w-8 h-8 rounded-lg bg-purple-100 dark:bg-purple-900/50 flex items-center justify-center">
                      <Skeleton className="h-4 w-4 rounded" />
                    </div>
                    <div className="flex-1 min-w-0 space-y-2">
                      <Skeleton className="h-3 w-16" />
                      <Skeleton className="h-4 w-32" />
                    </div>
                  </div>
                </div>
                <div className="pt-2">
                  <Separator className="mb-4" />
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-amber-100 dark:bg-amber-900/50 flex items-center justify-center">
                        <Skeleton className="h-3 w-3 rounded-full" />
                      </div>
                      <Skeleton className="h-4 w-16" />
                    </div>
                    <div className="flex items-center gap-2 bg-muted/40 px-2 py-1 rounded-md">
                      <Skeleton className="h-3 w-3 rounded-full" />
                      <Skeleton className="h-3 w-10" />
                    </div>
                  </div>
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
      <div className="space-y-8">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <UsersIcon className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">
                User Management
              </h1>
              <p className="text-muted-foreground">
                Manage user accounts, permissions, and project assignments
              </p>
            </div>
          </div>
          <Separator />
        </div>
        <ErrorCard
          title="Failed to Load Users"
          message={error?.message || "Unable to load users"}
          onRetry={() => refetch()}
          isRetrying={isFetching}
        />
      </div>
    );
  }

  const list = users ?? [];

  return (
    <div className="space-y-8">
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-primary/5 border border-primary/10">
              <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
              <span className="font-semibold text-primary">
                {list.length} user{list.length !== 1 ? "s" : ""} total
              </span>
            </div>
          </div>
          <div className="flex gap-3">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => refetch()}
                  disabled={isFetching}
                  className="h-9 w-9 p-0 rounded-lg hover:bg-muted transition-all duration-200 hover:scale-105 cursor-pointer"
                >
                  <RefreshCw
                    className={`h-4 w-4 transition-transform duration-200 ${
                      isFetching ? "animate-spin" : ""
                    }`}
                  />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Refresh users list</TooltipContent>
            </Tooltip>
            <Button
              size="sm"
              onClick={() => setViewMode("create")}
              className="gap-2 px-4 rounded-lg font-semibold shadow-md shadow-primary/20 hover:shadow-lg hover:shadow-primary/25 transition-all duration-300 hover:scale-105 cursor-pointer"
            >
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline">New User</span>
              <span className="sm:hidden">New</span>
            </Button>
          </div>
        </div>
      </div>

      {list.length === 0 ? (
        <Card className="border-dashed border-2 border-muted-foreground/20 bg-gradient-to-br from-muted/30 to-muted/10">
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <div className="relative mb-6">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center ring-1 ring-primary/10">
                <User className="h-8 w-8 text-primary" />
              </div>
              <div className="absolute -top-2 -right-2 w-6 h-6 bg-muted rounded-full border-2 border-card flex items-center justify-center">
                <Plus className="h-3 w-3 text-muted-foreground" />
              </div>
            </div>
            <h3 className="text-xl font-bold mb-2 text-foreground">
              No users found
            </h3>
            <p className="text-muted-foreground mb-8 max-w-md leading-relaxed">
              Get started by creating your first user account. You can assign
              them to projects and define their roles to manage access and
              permissions.
            </p>
            <Button
              onClick={() => setViewMode("create")}
              className="gap-2 px-6 py-2.5 rounded-xl font-semibold shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/25 transition-all duration-300"
            >
              <Plus className="h-4 w-4" />
              Create First User
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {list.map((user) => (
            <Card
              key={user.id}
              className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border border-border/50 flex flex-col overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-primary/[0.02] to-transparent opacity-0 transition-opacity duration-300 pointer-events-none" />

              <CardHeader className="pb-4 relative">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-4 flex-1 min-w-0">
                    <div className="relative">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center ring-1 ring-primary/10 transition-all duration-300">
                        <UserCheck className="h-6 w-6 text-primary" />
                      </div>
                      <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-card flex items-center justify-center">
                        <Activity className="h-2 w-2 text-white" />
                      </div>
                    </div>
                    <div className="space-y-1 flex-1 min-w-0">
                      <CardTitle className="text-lg font-bold truncate transition-colors duration-200">
                        {user.name}
                      </CardTitle>
                      <div className="flex items-center gap-2">
                        <div className="text-xs text-muted-foreground/80 font-mono bg-muted/40 px-2 py-0.5 rounded-md truncate">
                          {user.id.slice(0, 8)}...
                        </div>
                        <Badge
                          variant="outline"
                          className="text-xs px-2 py-0 h-5 bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-300 border-green-200 dark:border-green-700"
                        >
                          <div className="w-1.5 h-1.5 bg-green-500 rounded-full mr-1" />
                          Active
                        </Badge>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-1 ml-3 z-10">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-8 w-8 p-0 hover:bg-primary/10 hover:text-primary rounded-lg transition-all duration-200 hover:scale-105"
                          onClick={() => handleEdit(user.id)}
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
                          variant="ghost"
                          className="h-8 w-8 p-0 hover:bg-destructive/10 hover:text-destructive rounded-lg transition-all duration-200 hover:scale-105"
                          onClick={() => {
                            setUserToDelete(user.id);
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
              </CardHeader>

              <CardContent className="space-y-4 pt-0 relative">
                <div className="space-y-3">
                  <div className="flex items-center gap-3 p-2 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors duration-200">
                    <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                      <AtSign className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-muted-foreground font-medium mb-0.5">
                        Email
                      </p>
                      <p className="text-sm font-medium truncate">
                        {user.email || "No email provided"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-2 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors duration-200">
                    <div className="w-8 h-8 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                      <Building className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-muted-foreground font-medium mb-0.5">
                        Project
                      </p>
                      <p className="text-sm font-medium truncate">
                        {user.project || "None assigned"}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="pt-2">
                  <Separator className="mb-4" />
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                        <Crown className="h-3 w-3 text-amber-600 dark:text-amber-400" />
                      </div>
                      <span className="text-sm font-medium text-muted-foreground">
                        Member
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground bg-muted/40 px-2 py-1 rounded-md">
                      <Clock className="h-3 w-3" />
                      <span>Active</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={showDelete} onOpenChange={setShowDelete}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive">
              <Trash2 className="h-5 w-5" />
              Delete User
            </DialogTitle>
            <DialogDescription>
              This action cannot be undone. This will permanently delete the
              user account and remove all associated data.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => setShowDelete(false)}
              disabled={deleteMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() =>
                userToDelete && deleteMutation.mutate(userToDelete)
              }
              disabled={deleteMutation.isPending || !userToDelete}
            >
              {deleteMutation.isPending ? "Deleting..." : "Delete User"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
