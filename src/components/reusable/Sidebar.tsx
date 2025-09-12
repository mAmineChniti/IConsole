"use client";

import { XCombobox } from "@/components/reusable/XCombobox";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
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
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { AuthService } from "@/lib/requests";
import { cn } from "@/lib/utils";
import type { SwitchProjectRequest } from "@/types/RequestInterfaces";
import { useMutation, useQuery } from "@tanstack/react-query";
import { deleteCookie, getCookie, setCookie } from "cookies-next";
import {
  Camera,
  ChevronDown,
  Component,
  Cpu,
  Database,
  Disc3,
  Folder,
  Globe,
  HardDrive,
  Home,
  KeyRound,
  Link as LinkIcon,
  LogOut,
  Moon,
  MoveRight,
  Network,
  Router,
  Scaling,
  Server,
  Shield,
  Sun,
  Users,
} from "lucide-react";
import { useTheme } from "next-themes";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";

const identitySubItems = [
  {
    title: "Projects",
    icon: Folder,
    href: "/dashboard/projects",
  },
  {
    title: "Users",
    icon: Users,
    href: "/dashboard/users",
  },
] as const;

const computeSubItems = [
  {
    title: "Instances",
    icon: Server,
    href: "/dashboard/instances",
  },
  {
    title: "Flavors",
    icon: Cpu,
    href: "/dashboard/flavors",
  },
  {
    title: "Images",
    icon: Disc3,
    href: "/dashboard/images",
  },
  {
    title: "Key Pairs",
    icon: KeyRound,
    href: "/dashboard/keypairs",
  },
  {
    title: "Migrate VM",
    icon: MoveRight,
    href: "/dashboard/migrate-vm",
  },
] as const;

const storageSubItems = [
  {
    title: "Volumes",
    icon: Database,
    href: "/dashboard/volumes",
  },
  {
    title: "Snapshots",
    icon: Camera,
    href: "/dashboard/snapshots",
  },
  {
    title: "Volume Types",
    icon: Component,
    href: "/dashboard/volume-types",
  },
] as const;

const networksSubItems = [
  {
    title: "Networks",
    icon: Network,
    href: "/dashboard/networks",
  },
  {
    title: "Routers",
    icon: Router,
    href: "/dashboard/routers",
  },
  {
    title: "Floating IPs",
    icon: LinkIcon,
    href: "/dashboard/floating-ips",
  },
  {
    title: "Security Groups",
    icon: Shield,
    href: "/dashboard/security-groups",
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

  const initialStorageOpen = storageSubItems.some(
    (item) => pathname === item.href,
  );
  const [storageOpen, setStorageOpen] = useState(initialStorageOpen);

  const initialNetworksOpen = networksSubItems.some(
    (item) => pathname === item.href,
  );
  const [networksOpen, setNetworksOpen] = useState(initialNetworksOpen);

  const [computeTooltipOpen, setComputeTooltipOpen] = useState(false);
  const [storageTooltipOpen, setStorageTooltipOpen] = useState(false);
  const [networksTooltipOpen, setNetworksTooltipOpen] = useState(false);

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

  const { data: projects } = useQuery({
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
    mutationFn: (request: SwitchProjectRequest) =>
      AuthService.switchProject(request),
    onSuccess: async (response, variables) => {
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
      setSelectedProject(variables.project_id);
      localStorage.setItem("selectedProject", variables.project_id);

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

  const handleProjectChange = (projectId: string | undefined) => {
    if (
      switchProjectMutation.isPending ||
      !projectId ||
      projectId === selectedProject
    )
      return;
    switchProjectMutation.mutate({ project_id: projectId });
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
              <XCombobox
                data={
                  projects?.projects?.map((project) => ({
                    label: project.project_name,
                    value: project.project_id,
                  })) ?? []
                }
                type="project"
                value={selectedProject}
                onChange={handleProjectChange}
                placeholder="Select project"
                searchPlaceholder="Search projects..."
                clearable={false}
                disabled={switchProjectMutation.isPending}
                className={cn(
                  "text-sidebar-foreground flex w-full min-w-0 cursor-pointer items-center justify-start rounded-full border-0 bg-transparent text-sm font-medium shadow-none transition-all hover:rounded-full focus:rounded-full active:rounded-full",
                  switchProjectMutation.isPending &&
                    "cursor-not-allowed opacity-50",
                  selectedProject && "rounded-full",
                )}
              />
            </SidebarMenuItem>

            <SidebarMenuItem>
              <SidebarMenuButton
                asChild
                className={cn(
                  "hover:bg-accent hover:text-accent-foreground h-10 w-full rounded-md px-3 transition-all hover:rounded-full focus:rounded-full active:rounded-full",
                  pathname === "/dashboard/overview" && "rounded-full",
                )}
              >
                <Link
                  href="/dashboard/overview"
                  className={cn(
                    "flex w-full min-w-0 cursor-pointer items-center justify-start rounded-md transition-all hover:rounded-full focus:rounded-full active:rounded-full",
                    pathname === "/dashboard/overview"
                      ? "bg-accent text-accent-foreground rounded-full font-bold"
                      : "text-sidebar-foreground",
                  )}
                >
                  <Home className="mr-3 h-4 w-4 flex-shrink-0" />
                  <span className="truncate text-sm font-medium">Overview</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>

            {identitySubItems.map((subItem) => {
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

            <SidebarMenuItem>
              <Tooltip
                open={computeTooltipOpen && !computeOpen}
                onOpenChange={setComputeTooltipOpen}
              >
                <TooltipTrigger asChild>
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
                </TooltipTrigger>
                <TooltipContent
                  side="top"
                  className="text-xs"
                  avoidCollisions={true}
                  onMouseEnter={() => setComputeTooltipOpen(false)}
                >
                  <p>Instances, Flavors, Images, Key Pairs, VM Migration</p>
                </TooltipContent>
              </Tooltip>

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

            <SidebarMenuItem>
              <Tooltip
                open={storageTooltipOpen && !storageOpen}
                onOpenChange={setStorageTooltipOpen}
              >
                <TooltipTrigger asChild>
                  <SidebarMenuButton
                    asChild
                    className={cn(
                      "hover:bg-accent hover:text-accent-foreground group h-10 w-full rounded-md px-3 transition-all hover:rounded-full focus:rounded-full active:rounded-full",
                      storageOpen && "rounded-full",
                    )}
                  >
                    <Button
                      variant="ghost"
                      onClick={() => setStorageOpen(!storageOpen)}
                      className={cn(
                        "text-sidebar-foreground flex w-full min-w-0 cursor-pointer items-center justify-start rounded-md transition-all hover:rounded-full focus:rounded-full active:rounded-full",
                        storageOpen && "rounded-full",
                      )}
                    >
                      <HardDrive className="mr-3 h-4 w-4 flex-shrink-0" />
                      <span className="flex-1 truncate text-left text-sm font-medium">
                        Storage
                      </span>
                      <ChevronDown
                        className={cn(
                          "h-4 w-4 flex-shrink-0 transition-transform",
                          storageOpen && "rotate-180",
                        )}
                      />
                    </Button>
                  </SidebarMenuButton>
                </TooltipTrigger>
                <TooltipContent
                  side="top"
                  className="text-xs"
                  avoidCollisions={true}
                  onMouseEnter={() => setStorageTooltipOpen(false)}
                >
                  <p>Volumes, Snapshots, Volume Types</p>
                </TooltipContent>
              </Tooltip>

              {storageOpen && (
                <SidebarMenuSub className="mt-1 ml-4 space-y-1 border-l-0 pl-0">
                  {storageSubItems.map((subItem) => {
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

            <SidebarMenuItem>
              <Tooltip
                open={networksTooltipOpen && !networksOpen}
                onOpenChange={setNetworksTooltipOpen}
              >
                <TooltipTrigger asChild>
                  <SidebarMenuButton
                    asChild
                    className={cn(
                      "hover:bg-accent hover:text-accent-foreground group h-10 w-full rounded-md px-3 transition-all hover:rounded-full focus:rounded-full active:rounded-full",
                      networksOpen && "rounded-full",
                    )}
                  >
                    <Button
                      variant="ghost"
                      onClick={() => setNetworksOpen(!networksOpen)}
                      className={cn(
                        "text-sidebar-foreground flex w-full min-w-0 cursor-pointer items-center justify-start rounded-md transition-all hover:rounded-full focus:rounded-full active:rounded-full",
                        networksOpen && "rounded-full",
                      )}
                    >
                      <Globe className="mr-3 h-4 w-4 flex-shrink-0" />
                      <span className="flex-1 truncate text-left text-sm font-medium">
                        Networks
                      </span>
                      <ChevronDown
                        className={cn(
                          "h-4 w-4 flex-shrink-0 transition-transform",
                          networksOpen && "rotate-180",
                        )}
                      />
                    </Button>
                  </SidebarMenuButton>
                </TooltipTrigger>
                <TooltipContent
                  side="top"
                  className="text-xs"
                  avoidCollisions={true}
                  onMouseEnter={() => setNetworksTooltipOpen(false)}
                >
                  <p>Networks, Routers, Floating IPs, Security Groups</p>
                </TooltipContent>
              </Tooltip>

              {networksOpen && (
                <SidebarMenuSub className="mt-1 ml-4 space-y-1 border-l-0 pl-0">
                  {networksSubItems.map((subItem) => {
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

            <SidebarMenuItem>
              <SidebarMenuButton
                asChild
                className={cn(
                  "hover:bg-accent hover:text-accent-foreground h-10 w-full rounded-md px-3 transition-all hover:rounded-full focus:rounded-full active:rounded-full",
                  pathname === "/dashboard/clusters" && "rounded-full",
                )}
              >
                <Link
                  href="/dashboard/clusters"
                  className={cn(
                    "flex w-full min-w-0 cursor-pointer items-center justify-start rounded-md transition-all hover:rounded-full focus:rounded-full active:rounded-full",
                    pathname === "/dashboard/clusters"
                      ? "bg-accent text-accent-foreground rounded-full font-bold"
                      : "text-sidebar-foreground",
                  )}
                >
                  <Server className="mr-3 h-4 w-4 flex-shrink-0" />
                  <span className="truncate text-sm font-medium">Clusters</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>

            <SidebarMenuItem>
              <SidebarMenuButton
                asChild
                className={cn(
                  "hover:bg-accent hover:text-accent-foreground h-10 w-full rounded-md px-3 transition-all hover:rounded-full focus:rounded-full active:rounded-full",
                  pathname === "/dashboard/scale" && "rounded-full",
                )}
              >
                <Link
                  href="/dashboard/scale"
                  className={cn(
                    "flex w-full min-w-0 cursor-pointer items-center justify-start rounded-md transition-all hover:rounded-full focus:rounded-full active:rounded-full",
                    pathname === "/dashboard/scale"
                      ? "bg-accent text-accent-foreground rounded-full font-bold"
                      : "text-sidebar-foreground",
                  )}
                >
                  <Scaling className="mr-3 h-4 w-4 flex-shrink-0" />
                  <span className="truncate text-sm font-medium">Scaling</span>
                </Link>
              </SidebarMenuButton>
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
