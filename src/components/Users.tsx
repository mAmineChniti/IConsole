"use client";

import { ConfirmDeleteDialog } from "@/components/reusable/ConfirmDeleteDialog";
import { EmptyState } from "@/components/reusable/EmptyState";
import { ErrorCard } from "@/components/reusable/ErrorCard";
import { HeaderActions } from "@/components/reusable/HeaderActions";
import { InfoCard } from "@/components/reusable/InfoCard";
import { XSearch } from "@/components/reusable/XSearch";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
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
  UserDetailsResponse,
  UserListResponse,
} from "@/types/ResponseInterfaces";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  AtSign,
  Check,
  Edit,
  Mail,
  Plus,
  RefreshCw,
  Trash2,
  User,
  UserCheck,
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
  useEffect(() => {
    if (!deleteDialogOpen) {
      setUserToDelete(undefined);
    }
  }, [deleteDialogOpen]);
  const [visibleCount, setVisibleCount] = useState(6);

  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<
    UserDetailsResponse | undefined
  >(undefined);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [detailsError, setDetailsError] = useState<string | undefined>(
    undefined,
  );
  const [search, setSearch] = useState("");
  useEffect(() => setVisibleCount(6), [search]);

  const handleCardClick = async (userId: string) => {
    setDetailsDialogOpen(true);
    setDetailsLoading(true);
    setDetailsError(undefined);
    try {
      const user = await UserService.get(userId);
      setSelectedUser(user);
    } catch (err) {
      setDetailsError(
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
          <div className="flex flex-col gap-2 sm:flex-row sm:gap-0 sm:justify-between sm:items-center">
            <div className="text-sm leading-relaxed text-muted-foreground">
              <Skeleton className="inline-block w-40 h-4 align-middle" />
            </div>
            <div className="flex gap-3">
              <Skeleton className="p-0 w-9 h-9 rounded-full" />
              <Skeleton className="w-32 h-9 rounded-full" />
            </div>
          </div>
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="p-6 rounded-xl border shadow-lg bg-card text-card-foreground border-border/50"
            >
              <div className="flex gap-4 items-center">
                <Skeleton className="w-12 h-12 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="w-32 h-6" />
                  <Skeleton className="w-24 h-4" />
                </div>
                <div className="flex gap-2">
                  <Skeleton className="w-8 h-8 rounded-full" />
                  <Skeleton className="w-8 h-8 rounded-full" />
                </div>
              </div>
              <div className="mt-4 space-y-3">
                <Skeleton className="w-full h-4" />
                <Skeleton className="w-3/4 h-4" />
              </div>
            </div>
          ))}
        </div>
        <div className="flex justify-center px-4 sm:px-0">
          <Skeleton className="w-40 h-9 rounded-full" />
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
        icon={<User className="w-7 h-7 text-muted-foreground" />}
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
        <div className="flex flex-col gap-2 sm:flex-row sm:gap-0 sm:justify-between sm:items-center">
          <div className="text-sm leading-relaxed text-muted-foreground">
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
        <div className="flex-1 max-w-full sm:max-w-md">
          <XSearch
            value={search}
            onChange={setSearch}
            placeholder="Search users..."
            aria-label="Search users"
          />
        </div>
      </div>

      {totalItems === 0 ? (
        <div className="flex justify-center items-center p-8 text-center rounded-2xl border text-muted-foreground min-h-32">
          No users match your search.
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {visibleData.map((user) => (
            <InfoCard
              key={user.id}
              title={user.name}
              onClick={() => handleCardClick(user.id)}
              className="rounded-xl border shadow-lg bg-card text-card-foreground border-border/50"
              badges={
                <div className="flex gap-2 items-center">
                  <div className="flex justify-center items-center w-8 h-8 rounded-full bg-muted">
                    <UserCheck className="w-4 h-4 text-muted-foreground" />
                  </div>
                </div>
              }
              infoItems={[
                [
                  {
                    label: "Email",
                    value: user.email,
                    icon: Mail,
                    variant: "sky",
                  },
                ],
                [
                  {
                    label: "Enabled",
                    value: user.enabled ? "Yes" : "No",
                    icon: Check,
                    variant: "amber",
                  },
                  {
                    label: "Domain",
                    value: user.domain,
                    icon: AtSign,
                    variant: "rose",
                  },
                ],
              ]}
              actionButtons={
                <>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        size="sm"
                        variant="outline"
                        className="rounded-full cursor-pointer"
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditingUserId(user.id);
                          setViewMode("edit");
                        }}
                        aria-label={`Edit user ${user.name}`}
                      >
                        <Edit className="w-4 h-4" />
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
                        className="rounded-full cursor-pointer"
                        onClick={(e) => {
                          e.stopPropagation();
                          setUserToDelete({ id: user.id, name: user.name });
                          setDeleteDialogOpen(true);
                        }}
                        aria-label={`Delete user ${user.name}`}
                      >
                        <Trash2 className="w-4 h-4" />
                        Delete User
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Delete user</TooltipContent>
                  </Tooltip>
                </>
              }
            />
          ))}

          <Dialog
            open={detailsDialogOpen}
            onOpenChange={(open) => {
              setDetailsDialogOpen(open);
              if (!open) {
                setSelectedUser(undefined);
                setDetailsError(undefined);
              }
            }}
          >
            <DialogContent className="overflow-hidden p-0 max-w-lg">
              <div className="flex flex-col gap-3 items-center p-6 rounded-t-lg border-b bg-card border-border">
                <div className="flex justify-center items-center mb-2 w-16 h-16 rounded-full ring-2 bg-muted ring-primary/30">
                  <UserCheck className="w-8 h-8 text-primary" />
                </div>
                <div className="flex gap-2 items-center text-2xl font-bold text-center text-foreground">
                  {selectedUser?.name ?? (
                    <span className="text-muted-foreground">User</span>
                  )}
                </div>
                <div className="py-1 px-3 font-mono text-xs rounded-full text-muted-foreground bg-muted/60 w-fit">
                  {selectedUser?.id}
                </div>
              </div>
              <div className="p-6">
                {detailsLoading ? (
                  <div className="py-8 text-center text-muted-foreground">
                    <RefreshCw className="mx-auto mb-2 w-6 h-6 animate-spin text-primary" />
                    Loading user details...
                  </div>
                ) : detailsError ? (
                  <div className="py-8 text-center text-destructive">
                    <Trash2 className="mx-auto mb-2 w-6 h-6 text-destructive" />
                    {detailsError}
                  </div>
                ) : selectedUser ? (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                      <div className="flex gap-3 items-center">
                        <User className="w-5 h-5 text-muted-foreground" />
                        <div>
                          <div className="mb-1 text-xs font-medium text-muted-foreground">
                            Email
                          </div>
                          <div className="text-sm font-medium break-all">
                            {selectedUser.email || (
                              <span className="italic text-muted-foreground">
                                No email provided
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-3 items-center">
                        <Edit className="w-5 h-5 text-muted-foreground" />
                        <div>
                          <div className="mb-1 text-xs font-medium text-muted-foreground">
                            Enabled
                          </div>
                          <div className="text-sm font-medium">
                            {selectedUser.enabled ? (
                              <span className="font-semibold text-green-600">
                                Yes
                              </span>
                            ) : (
                              <span className="font-semibold text-destructive">
                                No
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-3 items-center">
                        <UserCheck className="w-5 h-5 text-muted-foreground" />
                        <div>
                          <div className="mb-1 text-xs font-medium text-muted-foreground">
                            Default Project
                          </div>
                          <div className="text-sm font-medium break-all">
                            {selectedUser.default_project_id || (
                              <span className="italic text-muted-foreground">
                                -
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-3 items-center">
                        <Plus className="w-5 h-5 text-muted-foreground" />
                        <div>
                          <div className="mb-1 text-xs font-medium text-muted-foreground">
                            Projects
                          </div>
                          <div className="text-sm font-medium break-all">
                            {selectedUser.projects &&
                            selectedUser.projects.length > 0 ? (
                              selectedUser.projects
                                .map((p) => p.project_name)
                                .join(", ")
                            ) : (
                              <span className="italic text-muted-foreground">
                                None assigned
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : undefined}
              </div>
            </DialogContent>
          </Dialog>
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
            <span className="font-semibold text-foreground">
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
