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
        <div className="p-4 space-y-6 w-full sm:p-6">
          <div className="space-y-1">
            <h1 className="text-3xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 select-none dark:from-blue-400 dark:to-indigo-400">
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
