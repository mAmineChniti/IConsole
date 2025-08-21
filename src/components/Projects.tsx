"use client";

import { ErrorCard } from "@/components/ErrorCard";
import { ProjectFormDialog } from "@/components/ProjectFormDialog";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
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
import { UserManagementDialog } from "@/components/UserManagementDialog";
import { ProjectService } from "@/lib/requests";
import { cn } from "@/lib/utils";
import type {
  ProjectDetailsResponse,
  UserAssignment,
  UserRole,
} from "@/types/ResponseInterfaces";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Building,
  ChevronDown,
  ChevronUp,
  Edit,
  Plus,
  RefreshCw,
  Trash2,
  UserPlus,
  Users,
} from "lucide-react";
import { useState } from "react";
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
            className="h-8 w-8 p-0 rounded-full flex-shrink-0 bg-card text-card-foreground border border-border/50 cursor-pointer hover:bg-card hover:text-card-foreground focus:bg-card focus:text-card-foreground"
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
            className="h-8 w-8 p-0 rounded-full flex-shrink-0 bg-destructive text-white dark:text-white dark:bg-destructive cursor-pointer hover:bg-destructive hover:text-white dark:hover:bg-destructive focus:bg-destructive focus:text-white"
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
    data: projects,
    isLoading,
    isFetching,
    error,
    refetch,
  } = useQuery<ProjectDetailsResponse[]>({
    queryKey: ["projects", "details"],
    queryFn: () => ProjectService.listDetails(),
    staleTime: 30000,
    refetchInterval: 60000,
  });

  const projectData = Array.isArray(projects) ? projects : [];
  const isLoadingInitial = isLoading;
  const isRefetching = isFetching;
  const isError = !!error;
  const isEmpty = !isLoadingInitial && !isError && projectData.length === 0;

  const deleteMutation = useMutation({
    mutationFn: (projectId: string) => ProjectService.delete(projectId),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["projects", "details"],
      });
      await queryClient.invalidateQueries({
        queryKey: ["auth", "projects"],
      });
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

  const confirmDelete = () => {
    if (projectToDelete) {
      deleteMutation.mutate(projectToDelete.id);
    }
  };

  const cancelDelete = () => {
    setShowDeleteDialog(false);
    setProjectToDelete(undefined);
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

  const totalItems = projectData.length;
  const visibleData = projectData.slice(0, visibleCount);

  const hasMore = visibleCount < totalItems;
  const remaining = Math.max(0, totalItems - visibleCount);

  const handleShowMore = () => {
    setVisibleCount((prev) => prev + 6);
  };

  if (isLoadingInitial) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 sm:gap-0">
          <div className="text-sm text-muted-foreground flex items-center gap-2">
            <Skeleton className="h-4 w-40" />
          </div>
          <div className="flex gap-3">
            <Skeleton className="h-9 w-9 rounded-full" />
            <Skeleton className="h-9 w-32 rounded-full" />
          </div>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 items-start">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card
              key={i}
              className={cn(
                "bg-card text-card-foreground border border-border/50 shadow-lg rounded-xl flex flex-col overflow-hidden",
              )}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <Skeleton className="h-6 w-32 mb-2" />
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <Skeleton className="h-6 w-20 rounded-full" />
                  </div>
                </div>
                <Skeleton className="h-4 w-40 mt-2" />
              </CardHeader>

              <CardContent className="pt-0 flex-grow flex flex-col">
                <div className="space-y-3 flex-grow">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <span className="inline-flex items-center justify-center h-7 w-7 rounded-full bg-white text-black dark:bg-black dark:text-white shadow-sm">
                        <Skeleton className="h-4 w-4" />
                      </span>
                      <Skeleton className="h-4 w-20" />
                    </div>
                    <Skeleton className="h-8 w-8 rounded-full" />
                  </div>
                  <div className="space-y-2 max-h-32 overflow-y-auto">
                    {Array.from({ length: 2 }).map((_, j) => (
                      <div
                        key={j}
                        className="flex items-center justify-between gap-2 p-2 bg-muted/20 rounded-full"
                      >
                        <div className="flex items-center gap-2 flex-1 min-w-0">
                          <Skeleton className="h-6 w-6 rounded-full" />
                          <Skeleton className="h-4 w-24" />
                        </div>
                        <div className="flex flex-wrap gap-1 max-w-[40%]">
                          <Skeleton className="h-5 w-12 rounded-full" />
                          <Skeleton className="h-5 w-12 rounded-full" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="mt-auto pt-3">
                  <Separator />
                  <div className="mt-4 flex flex-col sm:flex-row sm:items-center gap-2">
                    <Skeleton className="h-10 w-32 rounded-full" />
                    <div className="flex justify-center sm:justify-end gap-2">
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
        onRetry={() => refetch()}
        isRetrying={isRefetching}
      />
    );
  }

  if (isEmpty) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 sm:gap-0">
          <p className="text-sm text-muted-foreground">No projects found</p>
          <Button
            variant="default"
            onClick={() => {
              setDialogProject(undefined);
              setDialogOpen(true);
            }}
            className="rounded-full w-full sm:w-auto px-6 py-2 bg-primary text-primary-foreground cursor-pointer"
          >
            <Plus className="mr-2 h-4 w-4" />
            Create Project
          </Button>
        </div>

        <Card
          className={cn(
            "bg-card text-card-foreground border border-border/50 shadow-lg rounded-xl",
          )}
        >
          <CardContent className="p-8 text-center">
            <div className="flex flex-col items-center space-y-4">
              <div className="p-3 bg-muted rounded-full">
                <Building className="h-8 w-8 text-muted-foreground" />
              </div>
              <div className="space-y-2">
                <h3 className="text-lg font-semibold text-foreground">
                  No Projects Found
                </h3>
                <p className="text-sm text-muted-foreground max-w-md">
                  You don&apos;t have any projects yet. Create your first
                  project to get started.
                </p>
              </div>
              <Button
                variant="default"
                onClick={() => {
                  setDialogProject(undefined);
                  setDialogOpen(true);
                }}
                className="mt-4 rounded-full px-6 py-2 bg-primary text-primary-foreground cursor-pointer"
              >
                <Plus className="mr-2 h-4 w-4" />
                Create Your First Project
              </Button>
            </div>
          </CardContent>
        </Card>
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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 sm:gap-0">
        <div className="text-sm text-muted-foreground flex items-center gap-2">
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
        <div className="flex gap-2">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                onClick={() => refetch()}
                disabled={isRefetching}
                className={cn(
                  "cursor-pointer w-10 h-9 p-0 sm:w-auto sm:px-3 rounded-full",
                  isRefetching && "opacity-70",
                )}
                aria-label="Refresh projects"
              >
                {isRefetching ? (
                  <RefreshCw className="h-4 w-4 animate-spin flex-shrink-0" />
                ) : (
                  <RefreshCw className="h-4 w-4 flex-shrink-0" />
                )}
              </Button>
            </TooltipTrigger>
            <TooltipContent>Refresh</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                size="sm"
                onClick={() => {
                  setDialogProject(undefined);
                  setDialogOpen(true);
                }}
                className={cn(
                  "cursor-pointer flex-1 sm:flex-none min-w-[120px] rounded-full",
                )}
              >
                <Plus className="h-4 w-4 mr-2 flex-shrink-0" />
                <span className="truncate">Create Project</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>Create Project</TooltipContent>
          </Tooltip>
        </div>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 items-start">
        {visibleData.map((project) => (
          <Card
            key={project.id}
            className={cn(
              "bg-card text-card-foreground border border-border/50 shadow-lg rounded-xl flex flex-col overflow-hidden",
            )}
          >
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <CardTitle className="text-lg font-semibold text-foreground truncate">
                    {project.name}
                  </CardTitle>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
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
                <p className="text-sm text-muted-foreground line-clamp-2 mt-2">
                  {project.description}
                </p>
              )}
            </CardHeader>

            <CardContent className="pt-0 flex-grow flex flex-col">
              <div className="space-y-3 flex-grow">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="inline-flex items-center justify-center h-7 w-7 rounded-full bg-white text-black dark:bg-black dark:text-white shadow-sm">
                      <Users className="h-4 w-4 text-card-foreground" />
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
                    className="rounded-full px-2 py-1 bg-muted cursor-pointer"
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
                    <div className="space-y-2 max-h-32 overflow-y-auto">
                      {project.assignments && project.assignments.length > 0 ? (
                        project.assignments.map(
                          (assignment: UserAssignment) => (
                            <div
                              key={assignment.user_id}
                              className="flex items-center justify-between gap-2 p-2 bg-muted/20 rounded-full"
                            >
                              <div className="flex items-center gap-2 flex-1 min-w-0">
                                <Avatar className="h-6 w-6 flex-shrink-0">
                                  <AvatarFallback className="bg-white text-black dark:bg-black dark:text-white text-xs font-medium">
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
                                {assignment.roles
                                  .slice(0, 2)
                                  .map((role: UserRole) => (
                                    <Badge
                                      key={role.role_id}
                                      variant="outline"
                                      className="text-xs max-w-full truncate rounded-full"
                                    >
                                      {role.role_name}
                                    </Badge>
                                  ))}
                                {assignment.roles.length > 2 && (
                                  <Badge
                                    variant="outline"
                                    className="text-xs rounded-full"
                                  >
                                    +{assignment.roles.length - 2}
                                  </Badge>
                                )}
                              </div>
                            </div>
                          ),
                        )
                      ) : (
                        <p className="text-sm text-muted-foreground text-center">
                          No users assigned
                        </p>
                      )}
                    </div>
                  </>
                )}
              </div>

              <div className="mt-auto pt-3">
                <Separator />
                <div className="mt-4 flex flex-col sm:flex-row sm:items-center gap-2">
                  <Button
                    variant="default"
                    size="sm"
                    onClick={() => handleManageUsers(project)}
                    className="flex-1 rounded-full px-6 py-2 bg-primary text-primary-foreground cursor-pointer"
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

      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent
          className={cn(
            "bg-card text-card-foreground border border-border/50 shadow-lg rounded-xl max-w-lg mx-4 sm:mx-auto max-h-[90vh] overflow-y-auto",
          )}
        >
          <DialogHeader className="space-y-3">
            <DialogTitle className="flex items-center gap-2 text-lg text-foreground">
              <Trash2 className="h-5 w-5 text-foreground flex-shrink-0" />
              <span className="truncate">Delete Project</span>
            </DialogTitle>
            <DialogDescription className="text-muted-foreground text-sm leading-relaxed">
              Are you sure you want to delete this project? This action cannot
              be undone.
            </DialogDescription>
          </DialogHeader>

          {projectToDelete && (
            <div className="py-4">
              <div className="bg-destructive/10 border border-destructive rounded-xl p-3 sm:p-4">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-destructive/20 rounded-full flex-shrink-0">
                    <Building className="h-4 w-4 text-destructive" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-destructive truncate">
                      {projectToDelete.name}
                    </h4>
                    {projectToDelete.description && (
                      <p className="text-sm text-destructive mt-1 line-clamp-2">
                        {projectToDelete.description}
                      </p>
                    )}
                    <p className="text-xs text-destructive w-fit mt-2 font-mono truncate bg-destructive/10 px-2 py-1 rounded">
                      ID: {projectToDelete.id}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          <DialogFooter className="gap-3 flex-col sm:flex-row pt-4">
            <Button
              variant="outline"
              onClick={cancelDelete}
              className="rounded-full px-6 py-2 w-full sm:w-auto order-2 sm:order-1 bg-muted text-foreground cursor-pointer"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={confirmDelete}
              disabled={deleteMutation.isPending}
              className="rounded-full px-6 py-2 w-full sm:w-auto order-1 sm:order-2 bg-destructive text-white cursor-pointer"
            >
              {deleteMutation.isPending ? (
                <>
                  <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-destructive-foreground border-t-transparent" />
                  <span className="truncate">Deleting...</span>
                </>
              ) : (
                <>
                  <Trash2 className="mr-2 h-4 w-4" />
                  <span className="truncate">Delete Project</span>
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
