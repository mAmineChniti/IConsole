import { Sidebar } from "@/components/Sidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { UsersManager } from "@/components/Users";
import { type Metadata } from "next";

export const metadata: Metadata = {
  title: "IConsole | Users",
  description: "Manage users, roles and project memberships",
};

export default function UsersPage() {
  return (
    <SidebarProvider>
      <Sidebar />
      <SidebarInset>
        <div className="w-full space-y-6 p-4 sm:p-6">
          <div className="space-y-1">
            <h1 className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-3xl font-bold tracking-tight text-transparent select-none dark:from-blue-400 dark:to-indigo-400">
              Users
            </h1>
            <p className="text-muted-foreground">
              Create, inspect, update and remove users and their role
              assignments
            </p>
          </div>
          <UsersManager />
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
