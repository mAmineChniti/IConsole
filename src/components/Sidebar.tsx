"use client";

import { cn } from "@/lib/utils";
import { useMutation, useQuery } from "@tanstack/react-query";
import { deleteCookie, setCookie } from "cookies-next";
import {
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
    onError: (error: Error) => {
      toast.error("Failed to switch project", {
        description: error.message,
      });
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
    onError: async (error: Error) => {
      await deleteCookie("user");
      await deleteCookie("token");
      setSelectedProject("");
      localStorage.removeItem("selectedProject");
      toast.error("Logout failed", {
        description: error.message,
      });
      router.push("/login");
    },
  });

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  return (
    <ShadcnSidebar className="w-64 overflow-hidden">
      <SidebarHeader className="border-b p-3 sm:p-4">
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-7 h-7 sm:w-8 sm:h-8 bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-500 dark:to-indigo-500 rounded-full flex items-center justify-center flex-shrink-0">
            <Shield className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
          </div>
          <span className="text-lg sm:text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400 bg-clip-text text-transparent select-none truncate">
            IConsole
          </span>
        </div>
      </SidebarHeader>

      <SidebarContent className="p-2 overflow-y-auto">
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
                  className="w-full h-10 px-3 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white"
                >
                  <ComboboxTrigger
                    className={cn(
                      "w-full flex items-center justify-start cursor-pointer rounded-md text-slate-700 dark:text-slate-300 border-0 bg-transparent shadow-none text-sm font-medium min-w-0",
                      switchProjectMutation.isPending &&
                        "opacity-50 cursor-not-allowed",
                    )}
                  />
                </SidebarMenuButton>
                <ComboboxContent
                  popoverOptions={{
                    className:
                      "w-[--radix-popover-trigger-width] p-0 border-slate-200 dark:border-slate-700 shadow-lg max-h-[300px]",
                  }}
                >
                  <ComboboxInput
                    placeholder="Search projects..."
                    className="border-0 rounded-none px-3 py-2 text-sm focus:ring-0 focus:ring-offset-0 focus:outline-none"
                  />
                  <ComboboxList className="max-h-[200px] overflow-y-auto p-1">
                    {projectsLoading ? (
                      <div className="px-3 py-2 text-sm text-slate-500 dark:text-slate-400">
                        Loading projects...
                      </div>
                    ) : projects?.projects && projects.projects.length > 0 ? (
                      projects.projects.map((project) => (
                        <ComboboxItem
                          key={project.project_id}
                          value={project.project_id}
                          keywords={[project.project_name]}
                          className="px-3 py-2 text-sm cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white text-slate-700 dark:text-slate-300 rounded-sm mx-1 transition-colors truncate"
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
                    className="w-full h-10 px-3 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white"
                  >
                    <Link
                      href={item.href}
                      className={cn(
                        "w-full flex items-center justify-start cursor-pointer rounded-md min-w-0",
                        isActive
                          ? "bg-slate-100 dark:bg-slate-800 font-bold text-slate-900 dark:text-white"
                          : "text-slate-700 dark:text-slate-300",
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
                className="w-full h-10 px-3 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white"
              >
                <Button
                  variant="ghost"
                  onClick={() => setComputeOpen(!computeOpen)}
                  className="w-full flex items-center justify-start cursor-pointer rounded-md text-slate-700 dark:text-slate-300 min-w-0"
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
                          className="w-full h-10 px-3 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white"
                        >
                          <Link
                            href={subItem.href}
                            className={cn(
                              "w-full flex items-center justify-start cursor-pointer rounded-md min-w-0",
                              isSubActive
                                ? "bg-slate-100 dark:bg-slate-800 font-bold text-slate-900 dark:text-white"
                                : "text-slate-700 dark:text-slate-300",
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
                    className="w-full h-10 px-3 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white"
                  >
                    <Link
                      href={item.href}
                      className={cn(
                        "w-full flex items-center justify-start cursor-pointer rounded-md min-w-0",
                        isActive
                          ? "bg-slate-100 dark:bg-slate-800 font-bold text-slate-900 dark:text-white"
                          : "text-slate-700 dark:text-slate-300",
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

      <SidebarFooter className="p-3 sm:p-4 space-y-2">
        <SidebarMenuButton
          asChild
          className="w-full h-10 px-3 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
        >
          <Button
            variant="ghost"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="w-full flex items-center justify-start text-slate-700 dark:text-slate-300 min-w-0 rounded-md"
          >
            {!mounted ? (
              <Sun className="h-4 w-4 mr-3 flex-shrink-0" />
            ) : theme === "dark" ? (
              <Sun className="h-4 w-4 mr-3 flex-shrink-0" />
            ) : (
              <Moon className="h-4 w-4 mr-3 flex-shrink-0" />
            )}
            <span className="text-sm font-medium truncate">
              {!mounted
                ? "Toggle Theme"
                : theme === "dark"
                  ? "Light Mode"
                  : "Dark Mode"}
            </span>
          </Button>
        </SidebarMenuButton>

        <SidebarMenuButton
          asChild
          className="w-full h-10 px-3 hover:bg-red-50 dark:hover:bg-red-900/20 cursor-pointer"
        >
          <Button
            variant="ghost"
            onClick={handleLogout}
            className="w-full flex items-center justify-start text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 min-w-0 rounded-md"
          >
            <LogOut className="h-4 w-4 mr-3 flex-shrink-0" />
            <span className="text-sm font-medium truncate">Sign Out</span>
          </Button>
        </SidebarMenuButton>
      </SidebarFooter>
    </ShadcnSidebar>
  );
}
