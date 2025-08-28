import { Clusters } from "@/components/Clusters";
import { Sidebar } from "@/components/Sidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { type Metadata } from "next";

export const metadata: Metadata = {
  title: "IConsole | Clusters",
  description: "Manage clusters",
};

export default function ClustersPage() {
  return (
    <SidebarProvider>
      <Sidebar />
      <SidebarInset>
        <div className="p-4 space-y-6 w-full sm:p-6">
          <div className="space-y-1">
            <h1 className="text-3xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 select-none dark:from-blue-400 dark:to-indigo-400">
              Clusters
            </h1>
            <p className="text-muted-foreground">Manage clusters</p>
          </div>
          <Clusters />
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
