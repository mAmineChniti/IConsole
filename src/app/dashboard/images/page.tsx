import { Images } from "@/components/Images";
import { Sidebar } from "@/components/Sidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { type Metadata } from "next";

export const metadata: Metadata = {
  title: "IConsole | Images",
  description: "Manage your system images and templates",
};

export default function ImagesPage() {
  return (
    <SidebarProvider>
      <Sidebar />
      <SidebarInset>
        <div className="p-4 space-y-6 w-full sm:p-6">
          <div className="space-y-1">
            <h1 className="text-3xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 select-none dark:from-blue-400 dark:to-indigo-400">
              Images
            </h1>
            <p className="text-muted-foreground">
              Manage system images and virtual machine templates
            </p>
          </div>
          <Images />
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
