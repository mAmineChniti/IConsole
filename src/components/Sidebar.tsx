"use client";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
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
import { cn } from "@/lib/utils";
import { useMutation, useQuery } from "@tanstack/react-query";
import { deleteCookie, getCookie, setCookie } from "cookies-next";
import {
  ArrowRight,
  ChevronDown,
  Cpu,
  Expand,
  Folder,
  Globe,
  HardDrive,
  Home,
  Key,
  LogOut,
  Monitor,
  Moon,
  Shield,
  Sun,
  UserCircle2,
} from "lucide-react";
import { useTheme } from "next-themes";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";

const firstSidebarItems = [
  {
    title: "Overview",
    icon: Home,
    href: "/dashboard/overview",
  },
  {
    title: "Users",
    icon: UserCircle2,
    href: "/dashboard/users",
  },
  {
    title: "Projects",
    icon: Folder,
    href: "/dashboard/projects",
  },
] as const;

const secondSidebarItems = [
  {
    title: "Images",
    icon: HardDrive,
    href: "/dashboard/images",
  },
  {
    title: "Key Pairs",
    icon: Key,
    href: "/dashboard/keypairs",
  },
  {
    title: "Security Groups",
    icon: Shield,
    href: "/dashboard/security-groups",
  },
  {
    title: "Networks",
    icon: Globe,
    href: "/dashboard/networks",
  },
  {
    title: "Scaling",
    icon: Expand,
    href: "/dashboard/scale",
  },
  {
    title: "Clusters",
    icon: Monitor,
    href: "/dashboard/clusters",
  },
] as const;

const computeSubItems = [
  {
    title: "Instances",
    icon: Monitor,
    href: "/dashboard/instances",
  },
  {
    title: "Migrate VM",
    icon: ArrowRight,
    href: "/dashboard/migrate-vm",
  },
  {
    title: "Flavors",
    icon: Cpu,
    href: "/dashboard/flavors",
  },
] as const;

const volumesSubItems = [
  {
    title: "Volumes",
    icon: HardDrive,
    href: "/dashboard/volumes",
  },
  {
    title: "Snapshots",
    icon: Monitor,
    href: "/dashboard/snapshots",
  },
  {
    title: "Volume Types",
    icon: HardDrive,
    href: "/dashboard/volume-types",
  },
] as const;

export function Sidebar() {
  const { theme, setTheme } = useTheme();
  const router = useRouter();
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);

  const [userName, setUserName] = useState<string>("");

  const initialComputeOpen = computeSubItems.some(
    (item) => pathname === item.href,
  );
  const [computeOpen, setComputeOpen] = useState(initialComputeOpen);

  const initialVolumeOpen = volumesSubItems.some(
    (item) => pathname === item.href,
  );
  const [volumeOpen, setVolumeOpen] = useState(initialVolumeOpen);
  const [selectedProject, setSelectedProject] = useState<string>("");

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    try {
      const userCookie = getCookie("user");
      if (userCookie) {
        const userObj = JSON.parse(userCookie as string) as {
          username?: string;
        };
        if (typeof userObj.username === "string") setUserName(userObj.username);
      }
    } catch {}
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
      const now = Date.now();
      const expiresAtMs =
        response.expires_at_ts > 1e12
          ? response.expires_at_ts
          : response.expires_at_ts * 1000;
      const maxAge = Math.max(Math.floor((expiresAtMs - now) / 1000), 0);

      await setCookie(
        "token",
        JSON.stringify({
          token: response.token,
          expires_at: response.expires_at,
          expires_at_ts: response.expires_at_ts,
        }),
        {
          path: "/",
          maxAge,
          httpOnly: false,
          secure: process.env.NODE_ENV === "production",
          sameSite: "lax",
        },
      );

      let prevUser: Record<string, unknown> = {};
      try {
        const prevUserRaw = getCookie("user");
        if (prevUserRaw)
          prevUser = JSON.parse(prevUserRaw as string) as Record<
            string,
            unknown
          >;
      } catch {}
      const userData = {
        ...prevUser,
        projects: response.projects,
        loginTime: new Date().toISOString(),
      };
      await setCookie("user", JSON.stringify(userData), {
        path: "/",
        maxAge,
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
    switchProjectMutation.mutate(projectId);
  };
  const logoutMutation = useMutation({
    mutationFn: () => AuthService.logout(),
    onSuccess: async () => {
      await deleteCookie("user", {
        path: "/",
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
      });
      await deleteCookie("token", {
        path: "/",
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
      });
      setSelectedProject("");
      localStorage.removeItem("selectedProject");
      router.push("/login");
    },
    onError: async (err: unknown) => {
      await deleteCookie("user", {
        path: "/",
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
      });
      await deleteCookie("token", {
        path: "/",
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
      });
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
    <ShadcnSidebar className="flex overflow-hidden flex-col w-64 h-full border-r bg-sidebar text-sidebar-foreground border-sidebar-border">
      <SidebarHeader className="p-3 border-b sm:p-4 border-sidebar-border bg-sidebar">
        <div className="flex justify-center items-center min-w-0">
          <Link
            href="/dashboard/overview"
            aria-label="Go to Overview"
            className="flex gap-2 items-center min-w-0"
          >
            <div className="flex justify-center items-center w-7 h-7 bg-gradient-to-br rounded-full shadow-lg from-[#1DA1F2] via-[#0a8ddb] to-[#005fa3]">
              <Shield
                className="w-4 h-4 text-white"
                aria-hidden="true"
                focusable="false"
              />
            </div>
            <span className="font-sans text-xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-br select-none truncate from-[#1DA1F2] via-[#0a8ddb] to-[#005fa3]">
              IConsole
            </span>
          </Link>
        </div>
      </SidebarHeader>

      <SidebarContent className="overflow-y-auto p-2 bg-sidebar">
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
                    "hover:bg-accent hover:text-accent-foreground group h-10 w-full rounded-md px-3 transition-all hover:rounded-full focus:rounded-full active:rounded-full",
                    selectedProject && "rounded-full",
                  )}
                >
                  <ComboboxTrigger
                    className={cn(
                      "text-sidebar-foreground flex w-full min-w-0 cursor-pointer items-center justify-start rounded-full border-0 bg-transparent text-sm font-medium shadow-none transition-all hover:rounded-full focus:rounded-full active:rounded-full",
                      switchProjectMutation.isPending &&
                        "cursor-not-allowed opacity-50",
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
                    className="py-2 px-3 text-sm rounded-none border-0 focus:ring-0 focus:ring-offset-0 focus:outline-none"
                  />
                  <ComboboxList className="overflow-y-auto p-1 max-h-[200px]">
                    {projectsLoading ? (
                      <div className="py-2 px-3 text-sm text-muted-foreground">
                        Loading projects...
                      </div>
                    ) : projects?.projects && projects.projects.length > 0 ? (
                      projects.projects.map((project) => (
                        <ComboboxItem
                          key={project.project_id}
                          value={project.project_id}
                          keywords={[project.project_name]}
                          className="py-2 px-3 mx-1 text-sm rounded-md transition-colors cursor-pointer text-card-foreground truncate hover:bg-accent hover:text-accent-foreground"
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

            {firstSidebarItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton
                    asChild
                    className={cn(
                      "hover:bg-accent hover:text-accent-foreground h-10 w-full rounded-md px-3 transition-all hover:rounded-full focus:rounded-full active:rounded-full",
                      isActive && "rounded-full",
                    )}
                  >
                    <Link
                      href={item.href}
                      className={cn(
                        "flex w-full min-w-0 cursor-pointer items-center justify-start rounded-md transition-all hover:rounded-full focus:rounded-full active:rounded-full",
                        isActive
                          ? "bg-accent text-accent-foreground rounded-full font-bold"
                          : "text-sidebar-foreground",
                      )}
                    >
                      <item.icon className="flex-shrink-0 mr-3 w-4 h-4" />
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
                  "hover:bg-accent hover:text-accent-foreground group h-10 w-full rounded-md px-3 transition-all hover:rounded-full focus:rounded-full active:rounded-full",
                  computeOpen && "rounded-full",
                )}
              >
                <Button
                  variant="ghost"
                  onClick={() => setComputeOpen(!computeOpen)}
                  className={cn(
                    "text-sidebar-foreground flex w-full min-w-0 cursor-pointer items-center justify-start rounded-md transition-all hover:rounded-full focus:rounded-full active:rounded-full",
                    computeOpen && "rounded-full",
                  )}
                >
                  <Cpu className="flex-shrink-0 mr-3 w-4 h-4" />
                  <span className="flex-1 text-sm font-medium text-left truncate">
                    Compute
                  </span>
                  <ChevronDown
                    className={cn(
                      "h-4 w-4 flex-shrink-0 transition-transform",
                      computeOpen && "rotate-180",
                    )}
                  />
                </Button>
              </SidebarMenuButton>

              {computeOpen && (
                <SidebarMenuSub className="pl-0 mt-1 ml-4 space-y-1 border-l-0">
                  {computeSubItems.map((subItem) => {
                    const isSubActive = pathname === subItem.href;
                    return (
                      <SidebarMenuItem key={subItem.href}>
                        <SidebarMenuButton
                          asChild
                          className={cn(
                            "hover:bg-accent hover:text-accent-foreground group h-10 w-full rounded-md px-3 transition-all hover:rounded-full focus:rounded-full active:rounded-full",
                            isSubActive && "rounded-full",
                          )}
                        >
                          <Link
                            href={subItem.href}
                            className={cn(
                              "flex w-full min-w-0 cursor-pointer items-center justify-start rounded-md transition-all hover:rounded-full focus:rounded-full active:rounded-full",
                              isSubActive
                                ? "bg-accent text-accent-foreground rounded-full font-bold"
                                : "text-sidebar-foreground",
                            )}
                          >
                            <subItem.icon className="flex-shrink-0 mr-3 w-4 h-4" />
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
            {secondSidebarItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton
                    asChild
                    className={cn(
                      "hover:bg-accent hover:text-accent-foreground h-10 w-full rounded-md px-3 transition-all hover:rounded-full focus:rounded-full active:rounded-full",
                      isActive && "rounded-full",
                    )}
                  >
                    <Link
                      href={item.href}
                      className={cn(
                        "flex w-full min-w-0 cursor-pointer items-center justify-start rounded-md transition-all hover:rounded-full focus:rounded-full active:rounded-full",
                        isActive
                          ? "bg-accent text-accent-foreground rounded-full font-bold"
                          : "text-sidebar-foreground",
                      )}
                    >
                      <item.icon className="flex-shrink-0 mr-3 w-4 h-4" />
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
                  "hover:bg-accent hover:text-accent-foreground group h-10 w-full rounded-md px-3 transition-all hover:rounded-full focus:rounded-full active:rounded-full",
                  volumeOpen && "rounded-full",
                )}
              >
                <Button
                  variant="ghost"
                  onClick={() => setVolumeOpen(!volumeOpen)}
                  className={cn(
                    "text-sidebar-foreground flex w-full min-w-0 cursor-pointer items-center justify-start rounded-md transition-all hover:rounded-full focus:rounded-full active:rounded-full",
                    volumeOpen && "rounded-full",
                  )}
                >
                  <HardDrive className="flex-shrink-0 mr-3 w-4 h-4" />
                  <span className="flex-1 text-sm font-medium text-left truncate">
                    Volumes
                  </span>
                  <ChevronDown
                    className={cn(
                      "h-4 w-4 flex-shrink-0 transition-transform",
                      volumeOpen && "rotate-180",
                    )}
                  />
                </Button>
              </SidebarMenuButton>

              {volumeOpen && (
                <SidebarMenuSub className="pl-0 mt-1 ml-4 space-y-1 border-l-0">
                  {volumesSubItems.map((subItem) => {
                    const isSubActive = pathname === subItem.href;
                    return (
                      <SidebarMenuItem key={subItem.href}>
                        <SidebarMenuButton
                          asChild
                          className={cn(
                            "hover:bg-accent hover:text-accent-foreground group h-10 w-full rounded-md px-3 transition-all hover:rounded-full focus:rounded-full active:rounded-full",
                            isSubActive && "rounded-full",
                          )}
                        >
                          <Link
                            href={subItem.href}
                            className={cn(
                              "flex w-full min-w-0 cursor-pointer items-center justify-start rounded-md transition-all hover:rounded-full focus:rounded-full active:rounded-full",
                              isSubActive
                                ? "bg-accent text-accent-foreground rounded-full font-bold"
                                : "text-sidebar-foreground",
                            )}
                          >
                            <subItem.icon className="flex-shrink-0 mr-3 w-4 h-4" />
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
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-3 space-y-2 border-t sm:p-4 bg-sidebar border-sidebar-border">
        {userName && (
          <div className="flex gap-3 items-center px-3 mb-2 w-full h-10 rounded-full transition-all bg-accent text-accent-foreground">
            <Avatar className="w-6 h-6 shadow-sm">
              <AvatarFallback className="text-base font-bold tracking-wide text-white bg-gradient-to-br from-[#1DA1F2] via-[#0a8ddb] to-[#005fa3]">
                {userName
                  .split(" ")
                  .map((n) => n[0])
                  .join("")
                  .toUpperCase()
                  .slice(0, 2)}
              </AvatarFallback>
            </Avatar>
            <span className="text-sm font-semibold max-w-[140px] truncate">
              {userName}
            </span>
          </div>
        )}
        <SidebarMenuButton
          asChild
          className="px-3 w-full h-10 rounded-md transition-all cursor-pointer hover:rounded-full focus:rounded-full active:rounded-full hover:bg-accent hover:text-accent-foreground"
        >
          <Button
            variant="ghost"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="flex justify-start items-center w-full min-w-0 rounded-md transition-all hover:rounded-full focus:rounded-full active:rounded-full text-sidebar-foreground"
          >
            {!mounted ? (
              <span className="flex-shrink-0 mr-3 w-4 h-4"></span>
            ) : theme === "dark" ? (
              <Sun className="flex-shrink-0 mr-3 w-4 h-4" />
            ) : (
              <Moon className="flex-shrink-0 mr-3 w-4 h-4" />
            )}
            <span className="text-sm font-medium truncate">
              {!mounted ? "" : theme === "dark" ? "Light Mode" : "Dark Mode"}
            </span>
          </Button>
        </SidebarMenuButton>

        <SidebarMenuButton
          asChild
          className="px-3 w-full h-10 rounded-full transition-all cursor-pointer text-destructive"
        >
          <Button
            variant="ghost"
            onClick={handleLogout}
            className="!text-destructive flex w-full min-w-0 items-center justify-start rounded-full transition-all"
            style={{ color: "var(--color-destructive)" }}
          >
            <LogOut className="flex-shrink-0 mr-3 w-4 h-4" />
            <span className="text-sm font-medium truncate">Sign Out</span>
          </Button>
        </SidebarMenuButton>
      </SidebarFooter>
    </ShadcnSidebar>
  );
}
