"use client";

import { cn } from "@/lib/utils";
import { useMutation, useQuery } from "@tanstack/react-query";
import { deleteCookie, getCookie, setCookie } from "cookies-next";
import {
  ChevronDown,
  HardDrive,
  LayoutGrid,
  LogOut,
  MonitorStop,
  Moon,
  Server,
  Shield,
  Sun,
} from "lucide-react";
import { useTheme } from "next-themes";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Combobox,
  ComboboxContent,
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
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarSeparator,
} from "@/components/ui/sidebar";
import { AuthService } from "@/lib/requests";

const sidebarItems = [
  {
    title: "Overview",
    icon: LayoutGrid,
    href: "/dashboard/overview",
  },
  {
    title: "Images",
    icon: HardDrive,
    href: "/dashboard/images",
  },
];

const computeSubItems = [
  {
    title: "Instances",
    icon: Server,
    href: "/dashboard/instances",
  },
  {
    title: "Create Instance",
    icon: MonitorStop,
    href: "/dashboard/create-instance",
  },
];

export function Sidebar() {
  const { theme, setTheme } = useTheme();
  const router = useRouter();
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  const [computeOpen, setComputeOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<string>("");

  const { data: projects, isLoading: projectsLoading } = useQuery({
    queryKey: ["projects"],
    queryFn: () => AuthService.getProjects(),
    enabled: mounted,
  });

  const switchProjectMutation = useMutation({
    mutationFn: (projectId: string) =>
      AuthService.switchProject({ project_id: projectId }),
    onSuccess: async (response) => {
      await setCookie("token", response.token, {
        maxAge: 60 * 60 * 24 * 7,
        httpOnly: false,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
      });

      await setCookie(
        "user",
        JSON.stringify({
          username: response.username,
          projects: response.projects,
          loginTime: new Date().toISOString(),
        }),
        {
          maxAge: 60 * 60 * 24 * 7,
          httpOnly: false,
          secure: process.env.NODE_ENV === "production",
          sameSite: "lax",
        },
      );

      toast.success("Project switched successfully!", {
        description: response.message,
      });
    },
    onError: (error: Error) => {
      toast.error("Failed to switch project", {
        description:
          error.message || "An error occurred while switching projects.",
      });
    },
  });

  const handleProjectChange = (projectId: string) => {
    setSelectedProject(projectId);
    switchProjectMutation.mutate(projectId);
  };

  const isComputeActive = computeSubItems.some(
    (item) => pathname === item.href,
  );

  useEffect(() => {
    if (isComputeActive) {
      setComputeOpen(true);
    }
    setMounted(true);
  }, [isComputeActive]);

  let user = undefined;
  if (typeof window !== "undefined") {
    try {
      const userCookie = getCookie("user");
      if (userCookie) {
        user = JSON.parse(userCookie as string) as {
          username: string;
          region: string;
          loginTime: string;
        };
      }
    } catch {
      user = undefined;
    }
  }

  const logoutMutation = useMutation({
    mutationFn: () => AuthService.logout(),
    onSuccess: async () => {
      await deleteCookie("user");
      await deleteCookie("token");
      toast.success("Logged out successfully");
      router.push("/login");
    },
    onError: async (error: Error) => {
      await deleteCookie("user");
      await deleteCookie("token");
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
    <ShadcnSidebar className="w-64">
      <SidebarHeader className="border-b p-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-500 dark:to-indigo-500 rounded-full flex items-center justify-center">
            <Shield className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400 bg-clip-text text-transparent select-none">
            IConsole
          </span>
        </div>
      </SidebarHeader>

      <SidebarContent className="p-2">
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
                defaultValue={selectedProject}
                onValueChange={handleProjectChange}
              >
                <ComboboxTrigger
                  className={cn(
                    "w-full justify-start h-10 px-3 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white text-slate-700 dark:text-slate-300 border-0 bg-transparent shadow-none text-sm font-medium",
                    switchProjectMutation.isPending &&
                      "opacity-50 cursor-not-allowed",
                  )}
                />
                <ComboboxContent
                  popoverOptions={{
                    className:
                      "w-[--radix-popover-trigger-width] p-0 border-slate-200 dark:border-slate-700 shadow-lg",
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
                    ) : (
                      projects?.projects?.map((project) => (
                        <ComboboxItem
                          key={project.project_id}
                          value={project.project_id}
                          className="px-3 py-2 text-sm cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white text-slate-700 dark:text-slate-300 rounded-sm mx-1 transition-colors"
                        >
                          {project.project_name}
                        </ComboboxItem>
                      ))
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
                      "w-full justify-start h-10 px-3 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white",
                      isActive
                        ? "bg-slate-100 dark:bg-slate-800 font-bold text-slate-900 dark:text-white"
                        : "text-slate-700 dark:text-slate-300",
                    )}
                  >
                    <Button
                      variant="ghost"
                      onClick={() => router.push(item.href)}
                    >
                      <item.icon className="h-4 w-4 mr-3" />
                      <span className="text-sm font-medium">{item.title}</span>
                    </Button>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              );
            })}

            <SidebarMenuItem>
              <SidebarMenuButton
                asChild
                className="w-full justify-start h-10 px-3 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white"
              >
                <Button
                  variant="ghost"
                  onClick={() => setComputeOpen(!computeOpen)}
                >
                  <Server className="h-4 w-4 mr-3" />
                  <span className="text-sm font-medium">Compute</span>
                  <ChevronDown
                    className={cn(
                      "ml-auto h-4 w-4 transition-transform",
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
                      <SidebarMenuSubItem key={subItem.href}>
                        <SidebarMenuSubButton
                          asChild
                          className={cn(
                            "w-full justify-start h-10 px-3 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white",
                            isSubActive
                              ? "bg-slate-100 dark:bg-slate-800 font-bold text-slate-900 dark:text-white"
                              : "text-slate-700 dark:text-slate-300",
                          )}
                        >
                          <Button
                            variant="ghost"
                            onClick={() => router.push(subItem.href)}
                          >
                            <subItem.icon className="h-4 w-4 mr-3" />
                            <span className="text-sm font-medium">
                              {subItem.title}
                            </span>
                          </Button>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                    );
                  })}
                </SidebarMenuSub>
              )}
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-4 space-y-2">
        {mounted && user && (
          <>
            <div className="flex items-center gap-3 p-2 rounded-lg bg-slate-50 dark:bg-slate-800">
              <Avatar className="h-8 w-8">
                <AvatarFallback className="bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-500 dark:to-indigo-500 text-white text-sm font-medium">
                  {user.username.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-900 dark:text-white truncate">
                  {user.username}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                  {user.region}
                </p>
              </div>
            </div>
            <SidebarSeparator />
          </>
        )}

        <SidebarMenuButton
          asChild
          className="w-full h-10 justify-start px-3 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
        >
          <Button
            variant="ghost"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          >
            {mounted && theme === "dark" ? (
              <Sun className="h-4 w-4 mr-3" />
            ) : (
              <Moon className="h-4 w-4 mr-3" />
            )}
            <span className="text-sm font-medium">
              {mounted && theme === "dark" ? "Light Mode" : "Dark Mode"}
            </span>
          </Button>
        </SidebarMenuButton>

        <SidebarMenuButton
          asChild
          className="w-full h-10 justify-start px-3 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-700 dark:hover:text-red-300 cursor-pointer"
        >
          <Button variant="ghost" onClick={handleLogout}>
            <LogOut className="h-4 w-4 mr-3" />
            <span className="text-sm font-medium">Sign Out</span>
          </Button>
        </SidebarMenuButton>
      </SidebarFooter>
    </ShadcnSidebar>
  );
}
