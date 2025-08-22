import { Scaling } from "@/components/Scaling";
import { Sidebar } from "@/components/Sidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { type Metadata } from "next";

export const metadata: Metadata = {
  title: "IConsole | Scale",
  description: "Operational tooling to add nodes and send test alerts",
};

export default function ScalingPage() {
  return (
    <SidebarProvider>
      <Sidebar />
      <SidebarInset>
        <div className="p-4 space-y-6 w-full sm:p-6">
          <div className="space-y-1">
            <h1 className="text-3xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 select-none dark:from-blue-400 dark:to-indigo-400">
              Scaling & Operations
            </h1>
            <p className="text-muted-foreground">
              Add compute/control/storage nodes
            </p>
          </div>
          <Scaling />
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
