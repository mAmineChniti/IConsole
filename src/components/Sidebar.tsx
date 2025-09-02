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
    if (switchProjectMutation.isPending || projectId === selectedProject)
      return;
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
    <ShadcnSidebar className="bg-sidebar text-sidebar-foreground border-sidebar-border flex h-full w-64 flex-col overflow-hidden border-r">
      <SidebarHeader className="border-sidebar-border bg-sidebar border-b p-3 sm:p-4">
        <div className="flex min-w-0 items-center justify-center">
          <Link
            href="/dashboard/overview"
            aria-label="Go to Overview"
            className="flex min-w-0 items-center gap-2"
          >
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-[#1DA1F2] via-[#0a8ddb] to-[#005fa3] shadow-lg">
              <Shield
                className="h-4 w-4 text-white"
                aria-hidden="true"
                focusable="false"
              />
            </div>
            <span className="truncate bg-gradient-to-br from-[#1DA1F2] via-[#0a8ddb] to-[#005fa3] bg-clip-text font-sans text-xl font-bold tracking-tight text-transparent select-none">
              IConsole
            </span>
          </Link>
        </div>
      </SidebarHeader>

      <SidebarContent className="bg-sidebar overflow-y-auto p-2">
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
                    className="rounded-none border-0 px-3 py-2 text-sm focus:ring-0 focus:ring-offset-0 focus:outline-none"
                  />
                  <ComboboxList className="max-h-[200px] overflow-y-auto p-1">
                    {projectsLoading ? (
                      <div className="text-muted-foreground px-3 py-2 text-sm">
                        Loading projects...
                      </div>
                    ) : projects?.projects && projects.projects.length > 0 ? (
                      projects.projects.map((project) => (
                        <ComboboxItem
                          key={project.project_id}
                          value={project.project_id}
                          keywords={[project.project_name]}
                          className="text-card-foreground hover:bg-accent hover:text-accent-foreground mx-1 cursor-pointer truncate rounded-md px-3 py-2 text-sm transition-colors"
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
                      <item.icon className="mr-3 h-4 w-4 flex-shrink-0" />
                      <span className="truncate text-sm font-medium">
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
                  <Cpu className="mr-3 h-4 w-4 flex-shrink-0" />
                  <span className="flex-1 truncate text-left text-sm font-medium">
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
                <SidebarMenuSub className="mt-1 ml-4 space-y-1 border-l-0 pl-0">
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
                            <subItem.icon className="mr-3 h-4 w-4 flex-shrink-0" />
                            <span className="truncate text-sm font-medium">
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
                      <item.icon className="mr-3 h-4 w-4 flex-shrink-0" />
                      <span className="truncate text-sm font-medium">
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
                  <HardDrive className="mr-3 h-4 w-4 flex-shrink-0" />
                  <span className="flex-1 truncate text-left text-sm font-medium">
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
                <SidebarMenuSub className="mt-1 ml-4 space-y-1 border-l-0 pl-0">
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
                            <subItem.icon className="mr-3 h-4 w-4 flex-shrink-0" />
                            <span className="truncate text-sm font-medium">
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

      <SidebarFooter className="bg-sidebar border-sidebar-border space-y-2 border-t p-3 sm:p-4">
        {userName && (
          <div className="bg-accent text-accent-foreground mb-2 flex h-10 w-full items-center gap-3 rounded-full px-3 transition-all">
            <Avatar className="h-6 w-6 shadow-sm">
              <AvatarFallback className="bg-gradient-to-br from-[#1DA1F2] via-[#0a8ddb] to-[#005fa3] text-base font-bold tracking-wide text-white">
                {userName
                  .split(" ")
                  .map((n) => n[0])
                  .join("")
                  .toUpperCase()
                  .slice(0, 2)}
              </AvatarFallback>
            </Avatar>
            <span className="max-w-[140px] truncate text-sm font-semibold">
              {userName}
            </span>
          </div>
        )}
        <SidebarMenuButton
          asChild
          className="hover:bg-accent hover:text-accent-foreground h-10 w-full cursor-pointer rounded-md px-3 transition-all hover:rounded-full focus:rounded-full active:rounded-full"
        >
          <Button
            variant="ghost"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="text-sidebar-foreground flex w-full min-w-0 items-center justify-start rounded-md transition-all hover:rounded-full focus:rounded-full active:rounded-full"
          >
            {!mounted ? (
              <span className="mr-3 h-4 w-4 flex-shrink-0"></span>
            ) : theme === "dark" ? (
              <Sun className="mr-3 h-4 w-4 flex-shrink-0" />
            ) : (
              <Moon className="mr-3 h-4 w-4 flex-shrink-0" />
            )}
            <span className="truncate text-sm font-medium">
              {!mounted ? "" : theme === "dark" ? "Light Mode" : "Dark Mode"}
            </span>
          </Button>
        </SidebarMenuButton>

        <SidebarMenuButton
          asChild
          className="text-destructive h-10 w-full cursor-pointer rounded-full px-3 transition-all"
        >
          <Button
            variant="ghost"
            onClick={handleLogout}
            className="!text-destructive flex w-full min-w-0 items-center justify-start rounded-full transition-all"
            style={{ color: "var(--color-destructive)" }}
          >
            <LogOut className="mr-3 h-4 w-4 flex-shrink-0" />
            <span className="truncate text-sm font-medium">Sign Out</span>
          </Button>
        </SidebarMenuButton>
      </SidebarFooter>
    </ShadcnSidebar>
  );
}
