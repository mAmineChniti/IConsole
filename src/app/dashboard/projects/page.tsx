import { Projects } from "@/components/Projects";
import { Sidebar } from "@/components/Sidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { type Metadata } from "next";

export const metadata: Metadata = {
  title: "IConsole | Projects",
  description: "Manage projects, assignments, and user roles",
};

export default function ProjectsPage() {
  return (
    <SidebarProvider>
      <Sidebar />
      <SidebarInset>
        <div className="w-full space-y-6 p-4 sm:p-6">
          <div className="space-y-1">
            <h1 className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-3xl font-bold tracking-tight text-transparent select-none dark:from-blue-400 dark:to-indigo-400">
              Projects
            </h1>
            <p className="text-muted-foreground">
              Manage projects, assign users, and configure access permissions
            </p>
          </div>
          <Projects />
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
