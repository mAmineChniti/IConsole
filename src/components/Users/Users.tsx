"use client";

import { ConfirmDeleteDialog } from "@/components/reusable/ConfirmDeleteDialog";
import { EmptyState } from "@/components/reusable/EmptyState";
import { ErrorCard } from "@/components/reusable/ErrorCard";
import { HeaderActions } from "@/components/reusable/HeaderActions";
import { InfoCard } from "@/components/reusable/InfoCard";
import { InfoDialog } from "@/components/reusable/InfoDialog";
import { XSearch } from "@/components/reusable/XSearch";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { UserCreateForm } from "@/components/Users/UserCreateForm";
import { UserEditForm } from "@/components/Users/UserEditForm";
import { UserService } from "@/lib/requests";
import { cn } from "@/lib/utils";
import type {
  UserDeleteResponse,
  UserDetailsResponse,
  UserListResponse,
} from "@/types/ResponseInterfaces";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  CheckCircle,
  Edit,
  Folder,
  List,
  Mail,
  Trash2,
  User,
  XCircle,
} from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export function UsersManager() {
  const queryClient = useQueryClient();
  const [viewMode, setViewMode] = useState<"list" | "edit" | "create">("list");
  const [editingUserId, setEditingUserId] = useState<string | undefined>();
  const [userToDelete, setUserToDelete] = useState<
    { id: string; name?: string } | undefined
  >(undefined);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [visibleCount, setVisibleCount] = useState(6);

  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<
    UserDetailsResponse | undefined
  >(undefined);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [search, setSearch] = useState("");
  useEffect(() => setVisibleCount(6), [search]);

  const handleCardClick = async (userId: string) => {
    setDetailsDialogOpen(true);
    setDetailsLoading(true);
    try {
      const user = await UserService.get(userId);
      setSelectedUser(user);
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to load user details",
      );
      setSelectedUser(undefined);
    } finally {
      setDetailsLoading(false);
    }
  };

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
      setDeleteDialogOpen(false);
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
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between sm:gap-0">
            <div className="text-muted-foreground text-sm leading-relaxed">
              <Skeleton className="inline-block h-4 w-40 align-middle" />
            </div>
            <div className="flex gap-3">
              <Skeleton className="h-9 w-9 rounded-full p-0" />
              <Skeleton className="h-9 w-32 rounded-full" />
            </div>
          </div>
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="text-card-foreground border-border/50 rounded-xl border bg-neutral-50 p-6 shadow-lg dark:bg-neutral-900"
            >
              <div className="flex flex-col items-center gap-2">
                <Skeleton className="h-16 w-16 rounded-full" />
                <Skeleton className="h-6 w-32" />
              </div>
              <div className="mt-4 flex items-center justify-center gap-2">
                <Skeleton className="h-9 w-24 rounded-full" />
                <Skeleton className="h-9 w-32 rounded-full" />
              </div>
            </div>
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
        message={
          error instanceof Error ? error.message : "Unable to load users"
        }
        onRetry={() => refetch()}
        isRetrying={isFetching}
      />
    );
  }

  const list = users ?? [];
  if (!list || list.length === 0) {
    return (
      <EmptyState
        title="No users found"
        text="Get started by creating your first user account. You can assign them to projects and define their roles to manage access and permissions."
        onRefresh={() => refetch()}
        refreshing={isFetching}
        primaryLabel="Create First User"
        onPrimary={() => setViewMode("create")}
        icon={<User className="text-muted-foreground h-7 w-7" />}
        variant="dashed"
      />
    );
  }

  const q = search.trim().toLowerCase();
  const filteredUsers = q
    ? list.filter(
        (u) =>
          u.name.toLowerCase().includes(q) ||
          (u.email ? u.email.toLowerCase().includes(q) : false),
      )
    : list;
  const totalItems = filteredUsers.length;
  const visibleData = filteredUsers.slice(0, visibleCount);
  const hasMore = visibleCount < totalItems;

  const handleShowMore = () => {
    setVisibleCount((prev) => prev + 6);
  };
  return (
    <div className="space-y-8">
      <div className="space-y-4">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between sm:gap-0">
          <div className="text-muted-foreground text-sm leading-relaxed">
            {totalItems} user{totalItems !== 1 ? "s" : ""} total
            {totalItems > 0 && (
              <>
                {" • "}
                Showing {Math.min(visibleCount, totalItems)} of {totalItems}
              </>
            )}
          </div>
          <HeaderActions
            onRefresh={() => refetch()}
            isRefreshing={isFetching}
            refreshTooltip="Refresh users list"
            refreshAriaLabel="Refresh users list"
            mainButton={{
              onClick: () => setViewMode("create"),
              label: "New User",
              shortLabel: "New",
              tooltip: "Add a new user",
            }}
          />
        </div>
        <div className="max-w-full flex-1 sm:max-w-md">
          <XSearch
            value={search}
            onChange={setSearch}
            placeholder="Search users..."
            aria-label="Search users"
          />
        </div>
      </div>

      {totalItems === 0 ? (
        <div className="text-muted-foreground flex min-h-32 items-center justify-center rounded-2xl border p-8 text-center">
          No users match your search.
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {visibleData.map((user) => (
            <InfoCard
              key={user.id}
              title={
                <div className="flex flex-col items-center gap-2">
                  <Avatar className="h-16 w-16">
                    <AvatarFallback className="bg-gradient-to-r from-blue-600 to-blue-400 text-2xl font-bold text-white dark:from-blue-600 dark:to-blue-400">
                      {user.name.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-xl font-semibold">{user.name}</span>
                </div>
              }
              centerTitle={true}
              onClick={() => handleCardClick(user.id)}
              className="text-card-foreground border-border/50 rounded-xl border bg-neutral-50 shadow-lg dark:bg-neutral-900"
              actionButtons={
                <>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        size="sm"
                        variant="outline"
                        className="cursor-pointer rounded-full"
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditingUserId(user.id);
                          setViewMode("edit");
                        }}
                        aria-label={`Edit user ${user.name}`}
                      >
                        <Edit className="h-4 w-4" />
                        Edit User
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Edit user</TooltipContent>
                  </Tooltip>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        size="sm"
                        variant="destructive"
                        className="cursor-pointer rounded-full"
                        onClick={(e) => {
                          e.stopPropagation();
                          setUserToDelete({ id: user.id, name: user.name });
                          setDeleteDialogOpen(true);
                        }}
                        aria-label={`Delete user ${user.name}`}
                      >
                        <Trash2 className="h-4 w-4" />
                        Delete User
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Delete user</TooltipContent>
                  </Tooltip>
                </>
              }
            />
          ))}

          <InfoDialog
            open={detailsDialogOpen}
            isLoading={detailsLoading}
            onOpenChange={setDetailsDialogOpen}
            title={selectedUser?.name ?? "User Details"}
            infoItems={
              selectedUser
                ? [
                    [
                      {
                        label: "Email",
                        value: selectedUser.email || "No email provided",
                        icon: Mail,
                        variant: "blue",
                      },
                      {
                        label: "Status",
                        value: selectedUser.enabled ? "Enabled" : "Disabled",
                        icon: selectedUser.enabled ? CheckCircle : XCircle,
                        variant: selectedUser.enabled ? "green" : "red",
                      },
                    ],
                    [
                      {
                        label: "Default Project",
                        value: selectedUser.default_project_id,
                        icon: Folder,
                        variant: "indigo",
                      },
                      {
                        label: "Projects",
                        value:
                          selectedUser.projects?.length > 0
                            ? selectedUser.projects
                                .map((p) => p.project_name)
                                .join(", ")
                            : "None assigned",
                        icon: List,
                        variant: "purple",
                      },
                    ],
                  ]
                : []
            }
            className="max-w-2xl"
            actionButtons={
              <Button
                variant="outline"
                className="cursor-pointer rounded-full"
                onClick={() => setDetailsDialogOpen(false)}
              >
                Close
              </Button>
            }
          ></InfoDialog>
        </div>
      )}

      <div className="flex justify-center px-4 sm:px-0">
        <Button
          onClick={handleShowMore}
          variant="outline"
          disabled={!hasMore}
          className={cn(
            "bg-background text-foreground border-border/50 w-full max-w-xs cursor-pointer rounded-full border px-4 py-2 transition-all duration-200 sm:w-auto sm:px-6",
            hasMore ? "" : "cursor-not-allowed opacity-50",
          )}
        >
          <span className="truncate">
            {hasMore
              ? `Show More (${Math.min(6, totalItems - visibleCount)} more)`
              : "All users loaded"}
          </span>
        </Button>
      </div>

      <ConfirmDeleteDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Delete User"
        description={
          <>
            Are you sure you want to delete this user{" "}
            <span className="text-foreground font-semibold">
              {userToDelete?.name}
            </span>
            ? This action cannot be undone.
          </>
        }
        confirmLabel="Delete User"
        cancelLabel="Cancel"
        confirming={deleteMutation.isPending}
        onConfirm={() => userToDelete && deleteMutation.mutate(userToDelete.id)}
      />
    </div>
  );
}
