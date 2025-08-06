import { type Metadata } from "next";

import { Instances } from "@/components/Instances";
import { Sidebar } from "@/components/Sidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";

export const metadata: Metadata = {
  title: "IConsole | Instances",
  description: "Manage and create your virtual machine instances",
};

export default function InstancesPage() {
  return (
    <SidebarProvider>
      <Sidebar />
      <SidebarInset>
        <div className="w-full p-4 sm:p-6 space-y-6">
          <div className="space-y-1">
            <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400 bg-clip-text text-transparent select-none">
              Instances
            </h1>
            <p className="text-muted-foreground">
              Manage, create, and monitor your virtual machine instances
            </p>
          </div>
          <Instances />
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
