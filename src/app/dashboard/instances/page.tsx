import { Instances } from "@/components/Instances";
import { Sidebar } from "@/components/Sidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { type Metadata } from "next";

export const metadata: Metadata = {
  title: "IConsole | Instances",
  description: "Manage and create your virtual machine instances",
};

export default function InstancesPage() {
  return (
    <SidebarProvider>
      <Sidebar />
      <SidebarInset>
        <div className="p-4 space-y-6 w-full sm:p-6">
          <div className="space-y-1">
            <h1 className="text-3xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 select-none dark:from-blue-400 dark:to-indigo-400">
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
