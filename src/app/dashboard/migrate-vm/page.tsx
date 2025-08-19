import { ImportVM } from "@/components/ImportVM";
import { Sidebar } from "@/components/Sidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { type Metadata } from "next";

export const metadata: Metadata = {
  title: "IConsole | Import VM",
  description:
    "Import a VMware virtual machine image and deploy as a new instance",
};

export default function ImportVMPage() {
  return (
    <SidebarProvider>
      <Sidebar />
      <SidebarInset>
        <div className="w-full p-4 sm:p-6 space-y-6">
          <div className="space-y-1">
            <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400 bg-clip-text text-transparent select-none">
              Import VM
            </h1>
            <p className="text-muted-foreground">
              Import a VMware VMDK image and deploy as a new virtual machine
              instance
            </p>
          </div>
          <ImportVM />
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
