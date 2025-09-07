"use client";

import { ProjectFormDialog } from "@/components/Projects/ProjectFormDialog";
import { UserManagementDialog } from "@/components/Projects/UserManagementDialog";
import { ConfirmDeleteDialog } from "@/components/reusable/ConfirmDeleteDialog";
import { EmptyState } from "@/components/reusable/EmptyState";
import { ErrorCard } from "@/components/reusable/ErrorCard";
import { HeaderActions } from "@/components/reusable/HeaderActions";
import { StatusBadge } from "@/components/reusable/StatusBadge";
import { XSearch } from "@/components/reusable/XSearch";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { ProjectService } from "@/lib/requests";
import { cn } from "@/lib/utils";
import type {
  Project,
  ProjectDetailsResponse,
  ProjectListResponse,
  UserAssignment,
  UserRole,
} from "@/types/ResponseInterfaces";
import {
  useMutation,
  useQueries,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import {
  ChevronDown,
  ChevronUp,
  Edit,
  FolderPlus,
  Trash2,
  UserPlus,
  Users,
} from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

function ProjectActions({
  project,
  onEdit,
  onDelete,
}: {
  project: ProjectDetailsResponse;
  onEdit: (project: ProjectDetailsResponse) => void;
  onDelete: (projectId: string) => void;
}) {
  return (
    <div className="flex items-center gap-1 sm:gap-2">
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onEdit(project)}
            className="bg-card text-card-foreground border-border/50 hover:bg-card hover:text-card-foreground focus:bg-card focus:text-card-foreground h-8 w-8 flex-shrink-0 cursor-pointer rounded-full border p-0"
          >
            <Edit className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>Edit project</TooltipContent>
      </Tooltip>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onDelete(project.id)}
            className="bg-destructive dark:bg-destructive dark:hover:bg-destructive hover:bg-destructive focus:bg-destructive h-8 w-8 flex-shrink-0 cursor-pointer rounded-full p-0 text-white hover:text-white focus:text-white dark:text-white"
          >
            <Trash2 className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>Delete project</TooltipContent>
      </Tooltip>
    </div>
  );
}

export function Projects() {
  const [selectedProject, setSelectedProject] = useState<
    ProjectDetailsResponse | undefined
  >();
  const [visibleCount, setVisibleCount] = useState(6);
  const [search, setSearch] = useState("");
  useEffect(() => setVisibleCount(6), [search]);
  const [dialogProject, setDialogProject] = useState<
    ProjectDetailsResponse | undefined
  >(undefined);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [showUserManagement, setShowUserManagement] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState<
    ProjectDetailsResponse | undefined
  >();
  const [expandedProjects, setExpandedProjects] = useState<Set<string>>(
    new Set(),
  );

  const queryClient = useQueryClient();
  const {
    data: projectList,
    isLoading: isListLoading,
    isFetching: isListFetching,
    error: listError,
    isSuccess: isListSuccess,
  } = useQuery<ProjectListResponse>({
    queryKey: ["projects", "list"],
    queryFn: () => ProjectService.list(),
    staleTime: 30000,
    refetchInterval: 60000,
  });

  const detailsQueries = useQueries({
    queries: (projectList ?? []).map((p: Project) => ({
      queryKey: ["projects", "get", p.id],
      queryFn: () => ProjectService.get(p.id),
      staleTime: 30000,
      refetchInterval: 60000,
      enabled: !!projectList,
    })),
  });

  const projectData = detailsQueries
    .map((q) => q.data)
    .filter(Boolean) as ProjectDetailsResponse[];

  const anyDetailsLoading = detailsQueries.some((q) => q.isLoading && !q.data);
  const anyDetailsFetching = detailsQueries.some((q) => q.isFetching);
  const anyDetailsError = detailsQueries.some((q) => q.isError);

  const isLoadingInitial =
    isListLoading || (isListSuccess && anyDetailsLoading);
  const isRefetching = isListFetching || anyDetailsFetching;
  const isError = !!listError || anyDetailsError;
  const isEmpty =
    !isLoadingInitial && !isError && (projectList?.length ?? 0) === 0;

  const refetchAll = async () => {
    await queryClient.cancelQueries({ queryKey: ["projects"] });
    await queryClient.invalidateQueries({ queryKey: ["projects"] });
  };

  const deleteMutation = useMutation({
    mutationFn: (projectId: string) => ProjectService.delete(projectId),
    onSuccess: async (_data, projectId) => {
      queryClient.removeQueries({
        queryKey: ["projects", "get", projectId],
      });
      await queryClient.invalidateQueries({ queryKey: ["projects"] });
      await queryClient.invalidateQueries({ queryKey: ["auth", "projects"] });
      toast.success("Project deleted successfully");
      setShowDeleteDialog(false);
      setProjectToDelete(undefined);
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

  const handleEdit = (project: ProjectDetailsResponse) => {
    setDialogProject(project);
    setDialogOpen(true);
  };

  const handleDelete = (projectId: string) => {
    const project = projectData.find((p) => p.id === projectId);
    if (project) {
      setProjectToDelete(project);
      setShowDeleteDialog(true);
    }
  };

  const handleManageUsers = (project: ProjectDetailsResponse) => {
    setSelectedProject(project);
    setShowUserManagement(true);
  };

  const toggleProjectExpansion = (projectId: string) => {
    setExpandedProjects((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(projectId)) {
        newSet.delete(projectId);
      } else {
        newSet.add(projectId);
      }
      return newSet;
    });
  };

  const q = search.trim().toLowerCase();
  const filteredProjects = q
    ? projectData.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          (p.description ? p.description.toLowerCase().includes(q) : false),
      )
    : projectData;
  const totalItems = filteredProjects.length;
  const visibleData = filteredProjects.slice(0, visibleCount);

  const hasMore = visibleCount < totalItems;
  const remaining = Math.max(0, totalItems - visibleCount);

  const handleShowMore = () => {
    setVisibleCount((prev) => prev + 6);
  };

  if (isLoadingInitial) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between sm:gap-0">
          <div className="text-muted-foreground flex items-center gap-2 text-sm">
            <Skeleton className="h-4 w-40" />
          </div>
          <div className="flex gap-3">
            <Skeleton className="h-9 w-9 rounded-full" />
            <Skeleton className="h-9 w-32 rounded-full" />
          </div>
        </div>

        <div className="grid items-start gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card
              key={i}
              className={cn(
                "bg-card text-card-foreground border-border/50 flex flex-col overflow-hidden rounded-xl border shadow-lg",
              )}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <Skeleton className="mb-2 h-6 w-32" />
                  </div>
                  <div className="flex flex-shrink-0 items-center gap-2">
                    <Skeleton className="h-6 w-20 rounded-full" />
                  </div>
                </div>
                <Skeleton className="mt-2 h-4 w-40" />
              </CardHeader>

              <CardContent className="flex flex-grow flex-col pt-0">
                <div className="flex-grow space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-white text-black shadow-sm dark:bg-black dark:text-white">
                        <Skeleton className="h-4 w-4" />
                      </span>
                      <Skeleton className="h-4 w-20" />
                    </div>
                    <Skeleton className="h-8 w-8 rounded-full" />
                  </div>
                  <div className="max-h-32 space-y-2 overflow-y-auto">
                    {Array.from({ length: 2 }).map((_, j) => (
                      <div
                        key={j}
                        className="bg-muted/20 flex items-center justify-between gap-2 rounded-full p-2"
                      >
                        <div className="flex min-w-0 flex-1 items-center gap-2">
                          <Skeleton className="h-6 w-6 rounded-full" />
                          <Skeleton className="h-4 w-24" />
                        </div>
                        <div className="flex max-w-[40%] flex-wrap gap-1">
                          <Skeleton className="h-5 w-12 rounded-full" />
                          <Skeleton className="h-5 w-12 rounded-full" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="mt-auto pt-3">
                  <Separator />
                  <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-center">
                    <Skeleton className="h-10 w-32 rounded-full" />
                    <div className="flex justify-center gap-2 sm:justify-end">
                      <Skeleton className="h-8 w-8 rounded-full" />
                      <Skeleton className="h-8 w-8 rounded-full" />
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

  if (isError) {
    return (
      <ErrorCard
        title="Failed to Load Projects"
        message="There was an error loading projects. Please check your connection and try again."
        onRetry={() => refetchAll()}
        isRetrying={isRefetching}
      />
    );
  }

  if (isEmpty) {
    return (
      <div className="space-y-6">
        <EmptyState
          title="No projects found."
          icon={<FolderPlus />}
          text="Create your first project to get started."
          onRefresh={refetchAll}
          refreshing={isRefetching}
          primaryLabel="Create Project"
          primaryDisabled={isRefetching}
          onPrimary={() => {
            setDialogProject(undefined);
            setDialogOpen(true);
          }}
          variant="dashed"
          compact={false}
        />
        <ProjectFormDialog
          project={dialogProject}
          open={dialogOpen}
          onOpenChange={(open) => {
            setDialogOpen(open);
            if (!open) setDialogProject(undefined);
          }}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between sm:gap-0">
        <div className="text-muted-foreground flex items-center gap-2 text-sm">
          <span>
            {totalItems} project{totalItems !== 1 ? "s" : ""} total
            {totalItems > 0 && (
              <>
                {" • "}
                Showing {Math.min(visibleCount, totalItems)} of {totalItems}
              </>
            )}
          </span>
        </div>
        <HeaderActions
          onRefresh={() => refetchAll()}
          isRefreshing={isRefetching}
          refreshTooltip="Refresh"
          refreshAriaLabel="Refresh projects"
          mainButton={{
            onClick: () => {
              setDialogProject(undefined);
              setDialogOpen(true);
            },
            label: "Create Project",
            shortLabel: "Create",
            tooltip: "Create Project",
          }}
        />
      </div>
      <div className="max-w-full flex-1 sm:max-w-md">
        <XSearch
          value={search}
          onChange={setSearch}
          placeholder="Search projects..."
          aria-label="Search projects"
        />
      </div>

      {totalItems === 0 ? (
        <div className="text-muted-foreground flex min-h-32 items-center justify-center rounded-2xl border p-8 text-center">
          No projects match your search.
        </div>
      ) : (
        <div className="grid items-start gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {visibleData.map((project) => (
            <Card
              key={project.id}
              className={cn(
                "bg-card text-card-foreground border-border/50 flex flex-col overflow-hidden rounded-xl border shadow-lg",
              )}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <CardTitle className="text-foreground truncate text-lg font-semibold">
                      {project.name}
                    </CardTitle>
                  </div>
                  <div className="flex flex-shrink-0 items-center gap-2">
                    <StatusBadge
                      status={project.enabled ? "Enabled" : "Disabled"}
                      statusTextMap={{
                        Enabled: "ACTIVE",
                        Disabled: "SHUTOFF",
                      }}
                    />
                  </div>
                </div>
                {project.description && (
                  <p className="text-muted-foreground mt-2 line-clamp-2 text-sm">
                    {project.description}
                  </p>
                )}
              </CardHeader>

              <CardContent className="flex flex-grow flex-col pt-0">
                <div className="flex-grow space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-white text-black shadow-sm dark:bg-black dark:text-white">
                        <Users className="text-card-foreground h-4 w-4" />
                      </span>
                      <span className="text-sm font-medium">
                        {project.assignments?.length ?? 0} user
                        {project.assignments?.length !== 1 ? "s" : ""}
                      </span>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleProjectExpansion(project.id)}
                      className="bg-muted cursor-pointer rounded-full px-2 py-1"
                    >
                      {expandedProjects.has(project.id) ? (
                        <ChevronUp className="h-4 w-4" />
                      ) : (
                        <ChevronDown className="h-4 w-4" />
                      )}
                    </Button>
                  </div>

                  {expandedProjects.has(project.id) && (
                    <>
                      <Separator />
                      <div className="max-h-32 space-y-2 overflow-y-auto">
                        {project.assignments &&
                        project.assignments.length > 0 ? (
                          project.assignments.map(
                            (assignment: UserAssignment) => (
                              <div
                                key={assignment.user_id}
                                className="bg-muted/20 flex items-center justify-between gap-2 rounded-full p-2"
                              >
                                <div className="flex min-w-0 flex-1 items-center gap-2">
                                  <Avatar className="h-6 w-6 flex-shrink-0">
                                    <AvatarFallback className="bg-white text-xs font-medium text-black dark:bg-black dark:text-white">
                                      {(
                                        assignment.user_name?.charAt(0) ?? "?"
                                      ).toUpperCase()}
                                    </AvatarFallback>
                                  </Avatar>
                                  <span className="truncate text-sm font-medium">
                                    {assignment.user_name ?? "Unknown"}
                                  </span>
                                </div>
                                <div className="flex max-w-[40%] flex-wrap gap-1">
                                  {(assignment.roles ?? [])
                                    .slice(0, 2)
                                    .map((role: UserRole) => (
                                      <Badge
                                        key={role.role_id}
                                        variant="outline"
                                        className="max-w-full truncate rounded-full text-xs"
                                      >
                                        {role.role_name}
                                      </Badge>
                                    ))}
                                  {(assignment.roles ?? []).length > 2 && (
                                    <Badge
                                      variant="outline"
                                      className="rounded-full text-xs"
                                    >
                                      +{(assignment.roles ?? []).length - 2}
                                    </Badge>
                                  )}
                                </div>
                              </div>
                            ),
                          )
                        ) : (
                          <p className="text-muted-foreground text-center text-sm">
                            No users assigned
                          </p>
                        )}
                      </div>
                    </>
                  )}
                </div>

                <div className="mt-auto pt-3">
                  <Separator />
                  <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-center">
                    <Button
                      variant="default"
                      size="sm"
                      onClick={() => handleManageUsers(project)}
                      className="bg-primary text-primary-foreground flex-1 cursor-pointer rounded-full px-6 py-2"
                    >
                      <UserPlus className="mr-2 h-4 w-4" />
                      <span className="truncate">Manage Users</span>
                    </Button>
                    <div className="flex justify-center sm:justify-end">
                      <ProjectActions
                        project={project}
                        onEdit={handleEdit}
                        onDelete={handleDelete}
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <div className="flex justify-center px-4">
        <Button
          variant="outline"
          onClick={handleShowMore}
          disabled={!hasMore || isRefetching}
          className={cn(
            "w-full max-w-sm cursor-pointer rounded-full px-6 py-2 sm:w-auto",
            hasMore ? "" : "cursor-not-allowed opacity-50",
          )}
        >
          <span className="truncate">
            {hasMore
              ? `Show More (${Math.min(6, remaining)} more)`
              : "All projects loaded"}
          </span>
        </Button>
      </div>

      {dialogOpen && (
        <ProjectFormDialog
          project={dialogProject}
          open={dialogOpen}
          onOpenChange={(open) => {
            setDialogOpen(open);
            if (!open) setDialogProject(undefined);
          }}
        />
      )}

      {selectedProject && (
        <UserManagementDialog
          project={selectedProject}
          open={showUserManagement}
          onOpenChange={(open) => {
            setShowUserManagement(open);
            if (!open) setSelectedProject(undefined);
          }}
        />
      )}

      <ConfirmDeleteDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        title="Delete Project"
        description={
          <>
            Are you sure you want to delete this project{" "}
            <span className="text-foreground font-semibold">
              {projectToDelete?.name}
            </span>
            ? This action cannot be undone.
          </>
        }
        confirmLabel="Delete"
        cancelLabel="Cancel"
        confirming={deleteMutation.isPending}
        onConfirm={() =>
          projectToDelete && deleteMutation.mutate(projectToDelete.id)
        }
      />
    </div>
  );
}
