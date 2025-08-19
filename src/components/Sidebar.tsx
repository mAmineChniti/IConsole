"use client";

import { cn } from "@/lib/utils";
import { useMutation, useQuery } from "@tanstack/react-query";
import { deleteCookie, setCookie } from "cookies-next";
import {
  ArrowRight,
  Boxes,
  ChevronDown,
  Globe,
  Image as ImageIcon,
  LayoutDashboard,
  LogOut,
  Moon,
  Plus,
  Server,
  Shield,
  Sun,
  Users as UsersIcon,
  Zap,
} from "lucide-react";

import { useTheme } from "next-themes";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
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
  Sidebar as ShadcnSidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
} from "@/components/ui/sidebar";
import { AuthService } from "@/lib/requests";
import Link from "next/link";

const sidebarItems = [
  {
    title: "Overview",
    icon: LayoutDashboard,
    href: "/dashboard/overview",
  },
  {
    title: "Projects",
    icon: Boxes,
    href: "/dashboard/projects",
  },
  {
    title: "Images",
    icon: ImageIcon,
    href: "/dashboard/images",
  },
  {
    title: "Users",
    icon: UsersIcon,
    href: "/dashboard/users",
  },
] as const;

const networkingItems = [
  {
    title: "Networks",
    icon: Globe,
    href: "/dashboard/networks",
  },
] as const;

const computeSubItems = [
  {
    title: "Instances",
    icon: Server,
    href: "/dashboard/instances",
  },
  {
    title: "Create Instance",
    icon: Plus,
    href: "/dashboard/create-instance",
  },
  {
    title: "Migrate VM",
    icon: ArrowRight,
    href: "/dashboard/migrate-vm",
  },
  {
    title: "Scaling",
    icon: Zap,
    href: "/dashboard/scale",
  },
] as const;

export function Sidebar() {
  const { theme, setTheme } = useTheme();
  const router = useRouter();
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);

  const initialComputeOpen = computeSubItems.some(
    (item) => pathname === item.href,
  );
  const [computeOpen, setComputeOpen] = useState(initialComputeOpen);

  const [selectedProject, setSelectedProject] = useState<string>("");

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const savedProject = localStorage.getItem("selectedProject");
    if (savedProject) setSelectedProject(savedProject);
  }, []);

  const { data: projects, isLoading: projectsLoading } = useQuery({
    queryKey: ["auth", "projects"],
    queryFn: () => AuthService.getProjects(),
  });

  useEffect(() => {
    if (
      selectedProject === "" &&
      projects?.projects &&
      projects.projects.length > 0
    ) {
      const first = projects.projects[0]!.project_id;
      setSelectedProject(first);
      if (!localStorage.getItem("selectedProject")) {
        localStorage.setItem("selectedProject", first);
      }
    }
  }, [selectedProject, projects]);

  const switchProjectMutation = useMutation({
    mutationFn: (projectId: string) =>
      AuthService.switchProject({ project_id: projectId }),
    onSuccess: async (response, projectId) => {
      await setCookie("token", response.token, {
        maxAge: 60 * 60 * 24 * 7,
        httpOnly: false,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
      });

      const userData = {
        projects: response.projects,
        loginTime: new Date().toISOString(),
      };

      await setCookie("user", JSON.stringify(userData), {
        maxAge: 60 * 60 * 24 * 7,
        httpOnly: false,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
      });
      setSelectedProject(projectId);
      localStorage.setItem("selectedProject", projectId);

      toast.success("Project switched successfully!");
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

  const handleProjectChange = (projectId: string) => {
    setSelectedProject(projectId);
    localStorage.setItem("selectedProject", projectId);
    switchProjectMutation.mutate(projectId);
  };
  const logoutMutation = useMutation({
    mutationFn: () => AuthService.logout(),
    onSuccess: async () => {
      await deleteCookie("user");
      await deleteCookie("token");
      setSelectedProject("");
      localStorage.removeItem("selectedProject");
      router.push("/login");
    },
    onError: async (err: unknown) => {
      await deleteCookie("user");
      await deleteCookie("token");
      setSelectedProject("");
      localStorage.removeItem("selectedProject");
      const message =
        err instanceof Error
          ? err.message
          : typeof err === "string"
            ? err
            : "An unexpected error occurred";
      toast.error(message);
      router.push("/login");
    },
  });

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  return (
    <ShadcnSidebar className="w-64 overflow-hidden bg-sidebar text-sidebar-foreground border-r border-sidebar-border h-full flex flex-col">
      <SidebarHeader className="border-b border-sidebar-border p-3 sm:p-4 bg-sidebar">
        <div className="flex items-center gap-2 min-w-0 justify-center">
          <div className="relative">
            <div className="w-7 h-7 rounded-full flex items-center justify-center shadow-lg bg-gradient-to-br from-[#1DA1F2] via-[#0a8ddb] to-[#005fa3]">
              <Shield
                className="w-4 h-4 text-white"
                aria-hidden="true"
                focusable="false"
              />
            </div>
          </div>
          <span className="text-xl font-bold font-sans tracking-tight select-none truncate bg-gradient-to-br from-[#1DA1F2] via-[#0a8ddb] to-[#005fa3] bg-clip-text text-transparent">
            IConsole
          </span>
        </div>
      </SidebarHeader>

      <SidebarContent className="p-2 overflow-y-auto bg-sidebar">
        <SidebarGroup>
          <SidebarMenu className="space-y-2">
            <SidebarMenuItem>
              <Combobox
                data={
                  projects?.projects?.map((project) => ({
                    label: project.project_name,
                    value: project.project_id,
                  })) ?? []
                }
                type="project"
                value={selectedProject}
                onValueChange={handleProjectChange}
              >
                <SidebarMenuButton
                  asChild
                  className={cn(
                    "w-full h-10 px-3 hover:bg-accent hover:text-accent-foreground rounded-md group hover:rounded-full focus:rounded-full active:rounded-full transition-all",
                    selectedProject && "rounded-full",
                  )}
                >
                  <ComboboxTrigger
                    className={cn(
                      "w-full flex items-center justify-start cursor-pointer rounded-full text-sidebar-foreground border-0 bg-transparent shadow-none text-sm font-medium min-w-0 hover:rounded-full focus:rounded-full active:rounded-full transition-all",
                      switchProjectMutation.isPending &&
                        "opacity-50 cursor-not-allowed",
                      selectedProject && "rounded-full",
                    )}
                  />
                </SidebarMenuButton>
                <ComboboxContent
                  popoverOptions={{
                    className:
                      "w-[--radix-popover-trigger-width] p-0 border-sidebar-border shadow-lg max-h-[300px] bg-card text-card-foreground rounded-md",
                  }}
                >
                  <ComboboxInput
                    placeholder="Search projects..."
                    className="border-0 rounded-none px-3 py-2 text-sm focus:ring-0 focus:ring-offset-0 focus:outline-none"
                  />
                  <ComboboxList className="max-h-[200px] overflow-y-auto p-1">
                    {projectsLoading ? (
                      <div className="px-3 py-2 text-sm text-muted-foreground">
                        Loading projects...
                      </div>
                    ) : projects?.projects && projects.projects.length > 0 ? (
                      projects.projects.map((project) => (
                        <ComboboxItem
                          key={project.project_id}
                          value={project.project_id}
                          keywords={[project.project_name]}
                          className="px-3 py-2 text-sm cursor-pointer hover:bg-accent hover:text-accent-foreground text-card-foreground rounded-md mx-1 transition-colors truncate"
                        >
                          <span className="truncate">
                            {project.project_name}
                          </span>
                        </ComboboxItem>
                      ))
                    ) : (
                      <ComboboxEmpty />
                    )}
                  </ComboboxList>
                </ComboboxContent>
              </Combobox>
            </SidebarMenuItem>

            {sidebarItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton
                    asChild
                    className={cn(
                      "w-full h-10 px-3 hover:bg-accent hover:text-accent-foreground rounded-md hover:rounded-full focus:rounded-full active:rounded-full transition-all",
                      isActive && "rounded-full",
                    )}
                  >
                    <Link
                      href={item.href}
                      className={cn(
                        "w-full flex items-center justify-start cursor-pointer min-w-0 rounded-md hover:rounded-full focus:rounded-full active:rounded-full transition-all",
                        isActive
                          ? "bg-accent text-accent-foreground font-bold rounded-full"
                          : "text-sidebar-foreground",
                      )}
                    >
                      <item.icon className="h-4 w-4 mr-3 flex-shrink-0" />
                      <span className="text-sm font-medium truncate">
                        {item.title}
                      </span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              );
            })}

            <SidebarMenuItem>
              <SidebarMenuButton
                asChild
                className={cn(
                  "w-full h-10 px-3 hover:bg-accent hover:text-accent-foreground rounded-md group hover:rounded-full focus:rounded-full active:rounded-full transition-all",
                  computeOpen && "rounded-full",
                )}
              >
                <Button
                  variant="ghost"
                  onClick={() => setComputeOpen(!computeOpen)}
                  className={cn(
                    "w-full flex items-center justify-start cursor-pointer text-sidebar-foreground min-w-0 rounded-md hover:rounded-full focus:rounded-full active:rounded-full transition-all",
                    computeOpen && "rounded-full",
                  )}
                >
                  <Server className="h-4 w-4 mr-3 flex-shrink-0" />
                  <span className="text-sm font-medium flex-1 truncate text-left">
                    Compute
                  </span>
                  <ChevronDown
                    className={cn(
                      "h-4 w-4 transition-transform flex-shrink-0",
                      computeOpen && "rotate-180",
                    )}
                  />
                </Button>
              </SidebarMenuButton>

              {computeOpen && (
                <SidebarMenuSub className="ml-4 mt-1 space-y-1 border-l-0 pl-0">
                  {computeSubItems.map((subItem) => {
                    const isSubActive = pathname === subItem.href;
                    return (
                      <SidebarMenuItem key={subItem.href}>
                        <SidebarMenuButton
                          asChild
                          className={cn(
                            "w-full h-10 px-3 hover:bg-accent hover:text-accent-foreground rounded-md group hover:rounded-full focus:rounded-full active:rounded-full transition-all",
                            isSubActive && "rounded-full",
                          )}
                        >
                          <Link
                            href={subItem.href}
                            className={cn(
                              "w-full flex items-center justify-start cursor-pointer min-w-0 rounded-md hover:rounded-full focus:rounded-full active:rounded-full transition-all",
                              isSubActive
                                ? "bg-accent text-accent-foreground font-bold rounded-full"
                                : "text-sidebar-foreground",
                            )}
                          >
                            <subItem.icon className="h-4 w-4 mr-3 flex-shrink-0" />
                            <span className="text-sm font-medium truncate">
                              {subItem.title}
                            </span>
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    );
                  })}
                </SidebarMenuSub>
              )}
            </SidebarMenuItem>

            {networkingItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton
                    asChild
                    className={cn(
                      "w-full h-10 px-3 hover:bg-accent hover:text-accent-foreground rounded-md group hover:rounded-full focus:rounded-full active:rounded-full transition-all",
                      isActive && "rounded-full",
                    )}
                  >
                    <Link
                      href={item.href}
                      className={cn(
                        "w-full flex items-center justify-start cursor-pointer min-w-0 rounded-md hover:rounded-full focus:rounded-full active:rounded-full transition-all",
                        isActive
                          ? "bg-accent text-accent-foreground font-bold rounded-full"
                          : "text-sidebar-foreground",
                      )}
                    >
                      <item.icon className="h-4 w-4 mr-3 flex-shrink-0" />
                      <span className="text-sm font-medium truncate">
                        {item.title}
                      </span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              );
            })}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-3 sm:p-4 space-y-2 bg-sidebar border-t border-sidebar-border">
        <SidebarMenuButton
          asChild
          className="w-full h-10 px-3 hover:bg-accent hover:text-accent-foreground rounded-md cursor-pointer hover:rounded-full focus:rounded-full active:rounded-full transition-all"
        >
          <Button
            variant="ghost"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="w-full flex items-center justify-start text-sidebar-foreground min-w-0 rounded-md hover:rounded-full focus:rounded-full active:rounded-full transition-all"
          >
            {!mounted ? (
              <span className="h-4 w-4 mr-3 flex-shrink-0"></span>
            ) : theme === "dark" ? (
              <Sun className="h-4 w-4 mr-3 flex-shrink-0" />
            ) : (
              <Moon className="h-4 w-4 mr-3 flex-shrink-0" />
            )}
            <span className="text-sm font-medium truncate">
              {!mounted ? "" : theme === "dark" ? "Light Mode" : "Dark Mode"}
            </span>
          </Button>
        </SidebarMenuButton>

        <SidebarMenuButton
          asChild
          className="w-full h-10 px-3 cursor-pointer rounded-full transition-all text-destructive"
        >
          <Button
            variant="ghost"
            onClick={handleLogout}
            className="w-full flex items-center justify-start !text-destructive min-w-0 rounded-full transition-all"
            style={{ color: "var(--color-destructive)" }}
          >
            <LogOut className="h-4 w-4 mr-3 flex-shrink-0" />
            <span className="text-sm font-medium truncate">Sign Out</span>
          </Button>
        </SidebarMenuButton>
      </SidebarFooter>
    </ShadcnSidebar>
  );
}
