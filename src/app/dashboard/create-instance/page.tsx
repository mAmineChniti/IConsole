import { Sidebar } from "@/components/Sidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { VM } from "@/components/VM";
import { type Metadata } from "next";

export const metadata: Metadata = {
  title: "IConsole | Create Instance",
  description: "Create and deploy new virtual machine instances",
};

export default function CreateInstancePage() {
  return (
    <SidebarProvider>
      <Sidebar />
      <SidebarInset>
        <div className="w-full p-4 sm:p-6 space-y-6">
          <div className="space-y-1">
            <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400 bg-clip-text text-transparent select-none">
              Create Instance
            </h1>
            <p className="text-muted-foreground">
              Deploy new virtual machine instances with custom configurations
            </p>
          </div>
          <VM />
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
