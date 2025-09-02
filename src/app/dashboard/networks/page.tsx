import { Networks } from "@/components/Networks";
import { Sidebar } from "@/components/Sidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { type Metadata } from "next";

export const metadata: Metadata = {
  title: "IConsole | Networks",
  description: "List, create and manage tenant networks and routers",
};

export default function NetworksPage() {
  return (
    <SidebarProvider>
      <Sidebar />
      <SidebarInset>
        <div className="w-full space-y-6 p-4 sm:p-6">
          <div className="space-y-1">
            <h1 className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-3xl font-bold tracking-tight text-transparent select-none dark:from-blue-400 dark:to-indigo-400">
              Networks
            </h1>
            <p className="text-muted-foreground">
              Provision networks, subnets and routers for connectivity
            </p>
          </div>
          <Networks />
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
