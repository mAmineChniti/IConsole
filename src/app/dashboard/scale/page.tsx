import { ScaleOperations } from "@/components/Scale";
import { Sidebar } from "@/components/Sidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { type Metadata } from "next";

export const metadata: Metadata = {
  title: "IConsole | Scale",
  description: "Operational tooling to add nodes and send test alerts",
};

export default function ScalePage() {
  return (
    <SidebarProvider>
      <Sidebar />
      <SidebarInset>
        <div className="w-full p-4 sm:p-6 space-y-6">
          <div className="space-y-1">
            <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400 bg-clip-text text-transparent select-none">
              Scaling & Operations
            </h1>
            <p className="text-muted-foreground">
              Add compute/control/storage nodes and verify alerting
            </p>
          </div>
          <ScaleOperations />
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
