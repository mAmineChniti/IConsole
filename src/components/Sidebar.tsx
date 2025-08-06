"use client";

import { deleteCookie, getCookie } from "cookies-next";
import {
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

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
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

const collapsibleRoutes: Record<string, string[]> = {
  compute: ["/dashboard/instances", "/dashboard/create-instance"],
};

export function Sidebar() {
  const { theme, setTheme } = useTheme();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  const getDefaultState = () =>
    Object.keys(collapsibleRoutes).reduce(
      (acc, key) => {
        acc[key] = false;
        return acc;
      },
      {} as Record<string, boolean>,
    );

  const [collapsibleOpen, setCollapsibleOpen] =
    useState<Record<string, boolean>>(getDefaultState);

  useEffect(() => {
    const stored = localStorage.getItem("sidebar-collapsibles");
    if (stored) {
      try {
        const parsed = JSON.parse(stored) as Record<string, boolean>;
        setCollapsibleOpen({ ...getDefaultState(), ...parsed });
      } catch (error) {
        console.warn(
          "Failed to parse sidebar-collapsibles from localStorage",
          error,
        );
        // Invalid JSON, keep defaults
      }
    }
  }, []);

  let user:
    | { username: string; region: string; loginTime: string }
    | undefined = undefined;
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

  useEffect(() => {
    setMounted(true);
  }, []);

  const pathname = usePathname();
  useEffect(() => {
    setCollapsibleOpen((prev) => {
      const newState = { ...getDefaultState() };
      let anyMatched = false;
      for (const key of Object.keys(collapsibleRoutes)) {
        const routes = collapsibleRoutes[key];
        if (routes?.includes(pathname)) {
          newState[key] = true;
          anyMatched = true;
        }
      }
      if (!anyMatched) {
        Object.keys(prev).forEach((k) => {
          if (prev[k]) {
            newState[k] = false;
          }
        });
      } else {
        Object.keys(prev).forEach((k) => {
          if (prev[k] && !newState[k]) {
            newState[k] = true;
          }
        });
      }
      return newState;
    });
  }, [pathname]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem(
        "sidebar-collapsibles",
        JSON.stringify(collapsibleOpen),
      );
    }
  }, [collapsibleOpen]);

  const handleLogout = async () => {
    await deleteCookie("user");
    router.push("/login");
  };

  const handleCollapsibleChange = (key: string, open: boolean) => {
    setCollapsibleOpen((prev) => {
      const updated = Object.keys(prev).reduce(
        (acc, k) => {
          acc[k] = k === key ? open : false;
          return acc;
        },
        {} as Record<string, boolean>,
      );
      return updated;
    });
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
            {sidebarItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton
                    asChild
                    className={`w-full justify-start h-10 px-3 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white
                      ${isActive ? "bg-slate-100 dark:bg-slate-800 font-bold text-slate-900 dark:text-white" : "text-slate-700 dark:text-slate-300"}`}
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
              <Collapsible
                open={collapsibleOpen.compute}
                onOpenChange={(open) =>
                  handleCollapsibleChange("compute", open)
                }
              >
                <SidebarMenuButton>
                  <CollapsibleTrigger className="w-full justify-start h-10 px-3 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white cursor-pointer inline-flex items-center">
                    <Server className="h-4 w-4 mr-3" />
                    <span className="text-sm font-medium">Compute</span>
                  </CollapsibleTrigger>
                </SidebarMenuButton>
                <CollapsibleContent>
                  <SidebarMenuSub className="ml-4 mt-1 space-y-1 border-l-0 pl-0">
                    <SidebarMenuSubItem>
                      <SidebarMenuSubButton
                        asChild
                        className={`w-full justify-start h-10 px-3 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white
                          ${pathname === "/dashboard/instances" ? "bg-slate-100 dark:bg-slate-800 font-bold text-slate-900 dark:text-white" : "text-slate-700 dark:text-slate-300"}`}
                      >
                        <Button
                          variant="ghost"
                          onClick={() => router.push("/dashboard/instances")}
                        >
                          <Server className="h-4 w-4 mr-3" />
                          <span className="text-sm font-medium">Instances</span>
                        </Button>
                      </SidebarMenuSubButton>
                    </SidebarMenuSubItem>
                    <SidebarMenuSubItem>
                      <SidebarMenuSubButton
                        asChild
                        className={`w-full justify-start h-10 px-3 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white
                          ${pathname === "/dashboard/create-instance" ? "bg-slate-100 dark:bg-slate-800 font-bold text-slate-900 dark:text-white" : "text-slate-700 dark:text-slate-300"}`}
                      >
                        <Button
                          variant="ghost"
                          onClick={() =>
                            router.push("/dashboard/create-instance")
                          }
                        >
                          <MonitorStop className="h-4 w-4 mr-3" />
                          <span className="text-sm font-medium">
                            Create Instance
                          </span>
                        </Button>
                      </SidebarMenuSubButton>
                    </SidebarMenuSubItem>
                  </SidebarMenuSub>
                </CollapsibleContent>
              </Collapsible>
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
