import { SecurityGroups } from "@/components/SecurityGroups";
import { Sidebar } from "@/components/Sidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { type Metadata } from "next";

export const metadata: Metadata = {
  title: "IConsole | Security Groups",
  description: "Manage network security groups and their rules",
};

export default function SecurityGroupsPage() {
  return (
    <SidebarProvider>
      <Sidebar />
      <SidebarInset>
        <div className="w-full space-y-6 p-4 sm:p-6">
          <div className="space-y-1">
            <h1 className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-3xl font-bold tracking-tight text-transparent select-none dark:from-blue-400 dark:to-indigo-400">
              Security Groups
            </h1>
            <p className="text-muted-foreground">
              Manage network security groups and their rules
            </p>
          </div>
          <SecurityGroups />
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
