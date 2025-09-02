import { Sidebar } from "@/components/Sidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { VolumeTypes } from "@/components/VolumeTypes";
import { type Metadata } from "next";

export const metadata: Metadata = {
  title: "IConsole | Volume Types",
  description:
    "Manage block storage types, create, edit, and delete operations",
};

export default function VolumeTypesPage() {
  return (
    <SidebarProvider>
      <Sidebar />
      <SidebarInset>
        <div className="w-full space-y-6 p-4 sm:p-6">
          <div className="space-y-1">
            <h1 className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-3xl font-bold tracking-tight text-transparent select-none dark:from-blue-400 dark:to-indigo-400">
              Volume Types
            </h1>
            <p className="text-muted-foreground">
              Manage your block storage types. Create, edit, or delete volume
              types to control storage options for your cloud infrastructure.
            </p>
          </div>
          <VolumeTypes />
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
