"use client";

import { ErrorCard } from "@/components/ErrorCard";
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
import { Skeleton } from "@/components/ui/skeleton";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { UserCreateForm } from "@/components/UserCreateForm";
import { UserEditForm } from "@/components/UserEditForm";
import { UserService } from "@/lib/requests";
import { cn } from "@/lib/utils";
import type {
  UserDeleteResponse,
  UserListResponse,
} from "@/types/ResponseInterfaces";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  AtSign,
  Building,
  Edit,
  Plus,
  RefreshCw,
  Trash2,
  User,
  UserCheck,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

type ViewMode = "list" | "create" | "edit";

export function UsersManager() {
  const queryClient = useQueryClient();
  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [editingUserId, setEditingUserId] = useState<string | undefined>();
  const [showDelete, setShowDelete] = useState(false);
  const [userToDelete, setUserToDelete] = useState<string | undefined>();
  const [visibleCount, setVisibleCount] = useState(6);

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
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0">
            <div className="text-sm text-muted-foreground leading-relaxed">
              <Skeleton className="h-4 w-40 inline-block align-middle" />
            </div>
            <div className="flex gap-3">
              <Skeleton className="h-9 w-9 p-0 rounded-full" />
              <Skeleton className="h-9 w-32 rounded-full" />
            </div>
          </div>
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card
              key={i}
              className="bg-card text-card-foreground border border-border/50 shadow-lg rounded-xl flex flex-col overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-primary/[0.02] to-transparent opacity-0 transition-opacity duration-300 pointer-events-none" />
              <CardHeader className="pb-4 relative">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-4 flex-1 min-w-0">
                    <div className="relative">
                      <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center ring-1 ring-border/50 transition-all duration-300">
                        <Skeleton className="h-6 w-6 rounded-md" />
                      </div>
                      <span className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-green-500 animate-pulse border-2 border-card" />
                    </div>
                    <div className="space-y-1 flex-1 min-w-0">
                      <Skeleton className="h-6 w-32" />
                      <Skeleton className="h-4 w-24 rounded-full" />
                    </div>
                  </div>
                  <div className="flex gap-1 ml-3 z-10">
                    <Skeleton className="h-8 w-8 p-0 rounded-full" />
                    <Skeleton className="h-8 w-8 p-0 rounded-full" />
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4 pt-0 relative">
                <div className="space-y-3">
                  <div className="flex items-center gap-3 p-2 rounded-lg bg-muted/30">
                    <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                      <Skeleton className="h-4 w-4 rounded" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <Skeleton className="h-3 w-10 mb-1" />
                      <Skeleton className="h-4 w-32" />
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-2 rounded-lg bg-muted/30">
                    <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                      <Skeleton className="h-4 w-4 rounded" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <Skeleton className="h-3 w-10 mb-1" />
                      <Skeleton className="h-4 w-24" />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="flex justify-center px-4 sm:px-0">
          <Skeleton className="h-9 w-40 rounded-full" />
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

  const filteredUsers = users ?? [];
  const totalItems = filteredUsers.length;
  const visibleData = filteredUsers.slice(0, visibleCount);
  const hasMore = visibleCount < totalItems;

  const handleShowMore = () => {
    setVisibleCount((prev) => prev + 6);
  };

  return (
    <div className="space-y-8">
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0">
          <div className="text-sm text-muted-foreground leading-relaxed">
            {totalItems} user{totalItems !== 1 ? "s" : ""} total
            {totalItems > 0 && (
              <>
                {" • "}
                Showing {Math.min(visibleCount, totalItems)} of {totalItems}
              </>
            )}
          </div>
          <div className="flex gap-3">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => refetch()}
                  disabled={isFetching}
                  className="h-9 w-9 p-0 rounded-full bg-card text-card-foreground border border-border/50 transition-all duration-200 cursor-pointer"
                >
                  <RefreshCw
                    className={cn(
                      "h-4 w-4 transition-transform duration-200",
                      isFetching && "animate-spin",
                    )}
                  />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Refresh users list</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  size="sm"
                  onClick={() => setViewMode("create")}
                  className="gap-2 px-4 rounded-full font-semibold shadow-md bg-primary text-primary-foreground transition-all duration-300 cursor-pointer"
                >
                  <Plus className="h-4 w-4" />
                  <span className="hidden sm:inline">New User</span>
                  <span className="sm:hidden">New</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>Add a new user</TooltipContent>
            </Tooltip>
          </div>
        </div>
      </div>

      {filteredUsers.length === 0 ? (
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
              className="gap-2 px-6 py-2.5 rounded-full font-semibold shadow-lg bg-primary text-primary-foreground transition-all duration-300 cursor-pointer"
            >
              <Plus className="h-4 w-4" />
              Create First User
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {visibleData.map((user) => (
            <Card
              key={user.id}
              className="relative bg-card text-card-foreground border border-border/50 shadow-lg rounded-xl flex flex-col overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-primary/[0.02] to-transparent opacity-0 transition-opacity duration-300 pointer-events-none" />

              <CardHeader className="pb-4 relative">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-4 flex-1 min-w-0">
                    <div className="relative">
                      <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center ring-1 ring-border/50 transition-all duration-300">
                        <UserCheck className="h-6 w-6 text-muted-foreground" />
                      </div>
                      <span className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-green-500 animate-pulse border-2 border-card" />
                    </div>
                    <div className="space-y-1 flex-1 min-w-0">
                      <CardTitle className="text-lg font-bold truncate transition-colors duration-200">
                        {user.name}
                      </CardTitle>
                      <div className="text-xs text-muted-foreground/80 w-fit font-mono bg-muted/40 px-2 py-0.5 rounded-full wrap-break-word">
                        {user.id}
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-1 ml-3 z-10">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-8 w-8 p-0 rounded-full bg-card text-card-foreground border border-border/50 transition-all duration-200 cursor-pointer"
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
                          className="h-8 w-8 p-0 rounded-full bg-destructive text-white dark:text-white dark:bg-destructive cursor-pointer hover:bg-destructive hover:text-white dark:hover:bg-destructive focus:bg-destructive focus:text-white"
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
                    <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                      <AtSign className="h-4 w-4 text-muted-foreground" />
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
                    <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                      <Building className="h-4 w-4 text-muted-foreground" />
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
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <div className="flex justify-center px-4 sm:px-0">
        <Button
          onClick={handleShowMore}
          variant="outline"
          disabled={!hasMore}
          className={cn(
            "rounded-full transition-all duration-200 px-4 sm:px-6 py-2 w-full sm:w-auto max-w-xs bg-background text-foreground border border-border/50",
            hasMore
              ? "hover:bg-accent hover:text-accent-foreground hover:scale-105"
              : "opacity-50 cursor-not-allowed",
          )}
        >
          <span className="truncate">
            {hasMore
              ? `Show More (${Math.min(6, totalItems - visibleCount)} more)`
              : "All users loaded"}
          </span>
        </Button>
      </div>

      <Dialog open={showDelete} onOpenChange={setShowDelete}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-foreground">
              <Trash2 className="h-5 w-5" />
              Delete User
            </DialogTitle>
            <DialogDescription>
              This action cannot be undone. This will permanently delete the
              user account and remove all associated data.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-3 flex-col sm:flex-row pt-4">
            <Button
              variant="outline"
              onClick={() => setShowDelete(false)}
              disabled={deleteMutation.isPending}
              className="rounded-full px-6 py-2 w-full sm:w-auto order-2 sm:order-1 bg-muted text-foreground transition-all duration-200 cursor-pointer"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() =>
                userToDelete && deleteMutation.mutate(userToDelete)
              }
              disabled={deleteMutation.isPending || !userToDelete}
              className="rounded-full px-6 py-2 w-full sm:w-auto order-1 sm:order-2 bg-destructive text-white transition-all duration-200 cursor-pointer flex items-center justify-center"
            >
              {deleteMutation.isPending ? (
                <>
                  <Trash2 className="mr-2 h-4 w-4" />
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete User
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
