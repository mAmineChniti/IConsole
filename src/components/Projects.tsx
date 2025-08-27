"use client";

import { ConfirmDeleteDialog } from "@/components/ConfirmDeleteDialog";
import { EmptyState } from "@/components/EmptyState";
import { ErrorCard } from "@/components/ErrorCard";
import { HeaderActions } from "@/components/HeaderActions";
import { ProjectFormDialog } from "@/components/ProjectFormDialog";
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
import { UserManagementDialog } from "@/components/UserManagementDialog";
import { XSearch } from "@/components/XSearch";
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
    <div className="flex gap-1 items-center sm:gap-2">
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onEdit(project)}
            className="flex-shrink-0 p-0 w-8 h-8 rounded-full border cursor-pointer bg-card text-card-foreground border-border/50 hover:bg-card hover:text-card-foreground focus:bg-card focus:text-card-foreground"
          >
            <Edit className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
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
            className="flex-shrink-0 p-0 w-8 h-8 text-white rounded-full cursor-pointer dark:text-white hover:text-white focus:text-white bg-destructive dark:bg-destructive dark:hover:bg-destructive hover:bg-destructive focus:bg-destructive"
          >
            <Trash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
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

  // Apply search filtering to projectData (after details fetched)
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
  // pagination reset handled by useEffect above

  if (isLoadingInitial) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:gap-0 sm:justify-between sm:items-center">
          <div className="flex gap-2 items-center text-sm text-muted-foreground">
            <Skeleton className="w-40 h-4" />
          </div>
          <div className="flex gap-3">
            <Skeleton className="w-9 h-9 rounded-full" />
            <Skeleton className="w-32 h-9 rounded-full" />
          </div>
        </div>

        <div className="grid gap-6 items-start sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card
              key={i}
              className={cn(
                "bg-card text-card-foreground border border-border/50 shadow-lg rounded-xl flex flex-col overflow-hidden",
              )}
            >
              <CardHeader className="pb-3">
                <div className="flex gap-2 justify-between items-start">
                  <div className="flex-1 min-w-0">
                    <Skeleton className="mb-2 w-32 h-6" />
                  </div>
                  <div className="flex flex-shrink-0 gap-2 items-center">
                    <Skeleton className="w-20 h-6 rounded-full" />
                  </div>
                </div>
                <Skeleton className="mt-2 w-40 h-4" />
              </CardHeader>

              <CardContent className="flex flex-col flex-grow pt-0">
                <div className="flex-grow space-y-3">
                  <div className="flex justify-between items-center">
                    <div className="flex gap-1.5 items-center">
                      <span className="inline-flex justify-center items-center w-7 h-7 text-black bg-white rounded-full shadow-sm dark:text-white dark:bg-black">
                        <Skeleton className="w-4 h-4" />
                      </span>
                      <Skeleton className="w-20 h-4" />
                    </div>
                    <Skeleton className="w-8 h-8 rounded-full" />
                  </div>
                  <div className="overflow-y-auto space-y-2 max-h-32">
                    {Array.from({ length: 2 }).map((_, j) => (
                      <div
                        key={j}
                        className="flex gap-2 justify-between items-center p-2 rounded-full bg-muted/20"
                      >
                        <div className="flex flex-1 gap-2 items-center min-w-0">
                          <Skeleton className="w-6 h-6 rounded-full" />
                          <Skeleton className="w-24 h-4" />
                        </div>
                        <div className="flex flex-wrap gap-1 max-w-[40%]">
                          <Skeleton className="w-12 h-5 rounded-full" />
                          <Skeleton className="w-12 h-5 rounded-full" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="pt-3 mt-auto">
                  <Separator />
                  <div className="flex flex-col gap-2 mt-4 sm:flex-row sm:items-center">
                    <Skeleton className="w-32 h-10 rounded-full" />
                    <div className="flex gap-2 justify-center sm:justify-end">
                      <Skeleton className="w-8 h-8 rounded-full" />
                      <Skeleton className="w-8 h-8 rounded-full" />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="flex justify-center px-4 sm:px-0">
          <Skeleton className="w-40 h-9 rounded-full" />
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
      <div className="flex flex-col gap-4 sm:flex-row sm:gap-0 sm:justify-between sm:items-center">
        <div className="flex gap-2 items-center text-sm text-muted-foreground">
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
      <div className="flex-1 max-w-full sm:max-w-md">
        <XSearch
          value={search}
          onChange={setSearch}
          placeholder="Search projects..."
          aria-label="Search projects"
        />
      </div>

      {totalItems === 0 ? (
        <div className="flex justify-center items-center p-8 text-center rounded-2xl border text-muted-foreground min-h-32">
          No projects match your search.
        </div>
      ) : (
        <div className="grid gap-6 items-start sm:grid-cols-2 lg:grid-cols-3">
          {visibleData.map((project) => (
            <Card
              key={project.id}
              className={cn(
                "bg-card text-card-foreground border border-border/50 shadow-lg rounded-xl flex flex-col overflow-hidden",
              )}
            >
              <CardHeader className="pb-3">
                <div className="flex gap-2 justify-between items-start">
                  <div className="flex-1 min-w-0">
                    <CardTitle className="text-lg font-semibold text-foreground truncate">
                      {project.name}
                    </CardTitle>
                  </div>
                  <div className="flex flex-shrink-0 gap-2 items-center">
                    <Badge
                      variant={project.enabled ? "default" : "secondary"}
                      className={cn(
                        "text-xs px-2 py-0.5 gap-1.5 flex items-center",
                        project.enabled
                          ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400"
                          : "bg-muted text-muted-foreground",
                      )}
                    >
                      <span
                        className={cn(
                          "w-1.5 h-1.5 rounded-full animate-pulse inline-block",
                          project.enabled
                            ? "bg-green-500"
                            : "bg-muted-foreground/40",
                        )}
                      />
                      {project.enabled ? "Enabled" : "Disabled"}
                    </Badge>
                  </div>
                </div>
                {project.description && (
                  <p className="mt-2 text-sm text-muted-foreground line-clamp-2">
                    {project.description}
                  </p>
                )}
              </CardHeader>

              <CardContent className="flex flex-col flex-grow pt-0">
                <div className="flex-grow space-y-3">
                  <div className="flex justify-between items-center">
                    <div className="flex gap-1.5 items-center">
                      <span className="inline-flex justify-center items-center w-7 h-7 text-black bg-white rounded-full shadow-sm dark:text-white dark:bg-black">
                        <Users className="w-4 h-4 text-card-foreground" />
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
                      className="py-1 px-2 rounded-full cursor-pointer bg-muted"
                    >
                      {expandedProjects.has(project.id) ? (
                        <ChevronUp className="w-4 h-4" />
                      ) : (
                        <ChevronDown className="w-4 h-4" />
                      )}
                    </Button>
                  </div>

                  {expandedProjects.has(project.id) && (
                    <>
                      <Separator />
                      <div className="overflow-y-auto space-y-2 max-h-32">
                        {project.assignments &&
                        project.assignments.length > 0 ? (
                          project.assignments.map(
                            (assignment: UserAssignment) => (
                              <div
                                key={assignment.user_id}
                                className="flex gap-2 justify-between items-center p-2 rounded-full bg-muted/20"
                              >
                                <div className="flex flex-1 gap-2 items-center min-w-0">
                                  <Avatar className="flex-shrink-0 w-6 h-6">
                                    <AvatarFallback className="text-xs font-medium text-black bg-white dark:text-white dark:bg-black">
                                      {(
                                        assignment.user_name?.charAt(0) ?? "?"
                                      ).toUpperCase()}
                                    </AvatarFallback>
                                  </Avatar>
                                  <span className="text-sm font-medium truncate">
                                    {assignment.user_name ?? "Unknown"}
                                  </span>
                                </div>
                                <div className="flex flex-wrap gap-1 max-w-[40%]">
                                  {(assignment.roles ?? [])
                                    .slice(0, 2)
                                    .map((role: UserRole) => (
                                      <Badge
                                        key={role.role_id}
                                        variant="outline"
                                        className="max-w-full text-xs rounded-full truncate"
                                      >
                                        {role.role_name}
                                      </Badge>
                                    ))}
                                  {(assignment.roles ?? []).length > 2 && (
                                    <Badge
                                      variant="outline"
                                      className="text-xs rounded-full"
                                    >
                                      +{(assignment.roles ?? []).length - 2}
                                    </Badge>
                                  )}
                                </div>
                              </div>
                            ),
                          )
                        ) : (
                          <p className="text-sm text-center text-muted-foreground">
                            No users assigned
                          </p>
                        )}
                      </div>
                    </>
                  )}
                </div>

                <div className="pt-3 mt-auto">
                  <Separator />
                  <div className="flex flex-col gap-2 mt-4 sm:flex-row sm:items-center">
                    <Button
                      variant="default"
                      size="sm"
                      onClick={() => handleManageUsers(project)}
                      className="flex-1 py-2 px-6 rounded-full cursor-pointer bg-primary text-primary-foreground"
                    >
                      <UserPlus className="mr-2 w-4 h-4" />
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
            "rounded-full px-6 py-2 w-full sm:w-auto max-w-sm cursor-pointer",
            hasMore ? "" : "opacity-50 cursor-not-allowed",
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
            <span className="font-semibold text-foreground">
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
