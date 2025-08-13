"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Building,
  ChevronDown,
  ChevronUp,
  Edit,
  Plus,
  Trash2,
  UserPlus,
  Users,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { ProjectService } from "@/lib/requests";
import type {
  ProjectDetailsResponse,
  UserAssignment,
  UserRole,
} from "@/types/ResponseInterfaces";

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
    <div className="flex items-center gap-2">
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onEdit(project)}
            className="h-8 w-8 p-0 cursor-pointer rounded-full group transition-all duration-200"
          >
            <Edit className="h-4 w-4 group-hover:scale-110 transition-transform duration-200" />
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
            className="h-8 w-8 p-0 cursor-pointer rounded-full group transition-all duration-200"
          >
            <Trash2 className="h-4 w-4 group-hover:scale-110 transition-transform duration-200" />
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
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [editingProject, setEditingProject] = useState<
    ProjectDetailsResponse | undefined
  >();
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
    onError: (error: unknown) => {
      const message = error instanceof Error ? error.message : String(error);
      toast.error(`Failed to delete project: ${message}`);
    },
  });

  const handleEdit = (project: ProjectDetailsResponse) =>
    setEditingProject(project);

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
        <div className="flex items-center justify-between">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-10 w-32" />
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card
              key={i}
              className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border border-border/50"
            >
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                <div className="space-y-2">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-24" />
                </div>
                <Skeleton className="h-6 w-16 rounded" />
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                </div>
                <Separator />
                <div className="flex justify-between items-center">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-8 w-24" />
                </div>
              </CardContent>
            </Card>
          ))}
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
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">No projects found</p>
          <Button
            variant="outline"
            onClick={() => setShowCreateDialog(true)}
            className="cursor-pointer rounded-full group transition-all duration-200"
          >
            <Plus className="mr-2 h-4 w-4 group-hover:scale-110 transition-transform duration-200" />
            Create Project
          </Button>
        </div>

        <Card className="border-muted bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm">
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
                variant="outline"
                onClick={() => setShowCreateDialog(true)}
                className="mt-4 cursor-pointer rounded-full group transition-all duration-200"
              >
                <Plus className="mr-2 h-4 w-4 group-hover:scale-110 transition-transform duration-200" />
                Create Your First Project
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
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
        <Button
          onClick={() => setShowCreateDialog(true)}
          className="cursor-pointer rounded-full group transition-all duration-200"
        >
          <Plus className="mr-2 h-4 w-4 group-hover:scale-110 transition-transform duration-200" />
          Create Project
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 items-start">
        {visibleData.map((project) => (
          <Card
            key={project.id}
            className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border border-border/50 flex flex-col"
          >
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-semibold text-foreground truncate">
                  {project.name}
                </CardTitle>
                <div className="flex items-center gap-2">
                  <Badge
                    variant={project.enabled ? "default" : "secondary"}
                    className={
                      project.enabled
                        ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 border-green-200 dark:border-green-700"
                        : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-700"
                    }
                  >
                    {project.enabled ? "Enabled" : "Disabled"}
                  </Badge>
                </div>
              </div>
              {project.description && (
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {project.description}
                </p>
              )}
              <p className="text-xs text-muted-foreground font-mono truncate mt-2 bg-muted/20 px-2 py-1 rounded-md">
                ID: {project.id}
              </p>
            </CardHeader>

            <CardContent className="pt-0 flex-grow flex flex-col">
              <div className="space-y-3 flex-grow">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">
                      {project.assignments?.length ?? 0} user
                      {project.assignments?.length !== 1 ? "s" : ""}
                    </span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleProjectExpansion(project.id)}
                    className="cursor-pointer rounded-full group transition-all duration-200"
                  >
                    {expandedProjects.has(project.id) ? (
                      <ChevronUp className="h-4 w-4 group-hover:scale-110 transition-transform duration-200" />
                    ) : (
                      <ChevronDown className="h-4 w-4 group-hover:scale-110 transition-transform duration-200" />
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
                              className="flex items-center justify-between p-2 bg-muted/20 rounded-md"
                            >
                              <div className="flex items-center gap-2">
                                <Avatar className="h-6 w-6">
                                  <AvatarFallback className="bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-500 dark:to-indigo-500 text-white text-xs font-medium">
                                    {(
                                      assignment.user_name?.charAt(0) ?? "?"
                                    ).toUpperCase()}
                                  </AvatarFallback>
                                </Avatar>
                                <span className="text-sm font-medium truncate">
                                  {assignment.user_name ?? "Unknown"}
                                </span>
                              </div>
                              <div className="flex flex-wrap gap-1">
                                {assignment.roles
                                  .slice(0, 2)
                                  .map((role: UserRole) => (
                                    <Badge
                                      key={role.role_id}
                                      variant="outline"
                                      className="text-xs"
                                    >
                                      {role.role_name}
                                    </Badge>
                                  ))}
                                {assignment.roles.length > 2 && (
                                  <Badge variant="outline" className="text-xs">
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

                <div className="flex justify-between items-center pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleManageUsers(project)}
                    className="flex-1 mr-2 cursor-pointer rounded-full group transition-all duration-200"
                  >
                    <UserPlus className="mr-2 h-4 w-4 group-hover:scale-110 transition-transform duration-200" />
                    Manage Users
                  </Button>
                  <ProjectActions
                    project={project}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="flex justify-center">
        <Button
          onClick={handleShowMore}
          variant="outline"
          disabled={!hasMore || isRefetching}
          className={`transition-all duration-200 px-6 py-2 ${
            hasMore
              ? "hover:bg-accent hover:text-accent-foreground hover:scale-105"
              : "opacity-50 cursor-not-allowed"
          }`}
        >
          {hasMore
            ? `Show More (${Math.min(6, remaining)} more)`
            : "All projects loaded"}
        </Button>
      </div>

      <ProjectFormDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
      />

      <ProjectFormDialog
        project={editingProject}
        open={!!editingProject}
        onOpenChange={(open) => {
          if (!open) setEditingProject(undefined);
        }}
      />

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
        <DialogContent className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border border-border/50">
          <DialogHeader>
            <DialogTitle className="text-slate-900 dark:text-white flex items-center gap-2">
              <Trash2 className="h-5 w-5 text-red-600 dark:text-red-400" />
              Delete Project
            </DialogTitle>
            <DialogDescription className="text-slate-600 dark:text-slate-400">
              Are you sure you want to delete this project? This action cannot
              be undone.
            </DialogDescription>
          </DialogHeader>

          {projectToDelete && (
            <div className="py-4">
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-red-100 dark:bg-red-900/40 rounded-full">
                    <Building className="h-4 w-4 text-red-600 dark:text-red-400" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-red-900 dark:text-red-100">
                      {projectToDelete.name}
                    </h4>
                    {projectToDelete.description && (
                      <p className="text-sm text-red-700 dark:text-red-300 mt-1">
                        {projectToDelete.description}
                      </p>
                    )}
                    <p className="text-xs text-red-600 dark:text-red-400 mt-2 font-mono">
                      ID: {projectToDelete.id}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={cancelDelete}
              className="cursor-pointer rounded-full group transition-all duration-200"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={confirmDelete}
              disabled={deleteMutation.isPending}
              className="cursor-pointer rounded-full group transition-all duration-200"
            >
              {deleteMutation.isPending ? (
                <>
                  <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 className="mr-2 h-4 w-4 group-hover:scale-110 transition-transform duration-200" />
                  Delete Project
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
