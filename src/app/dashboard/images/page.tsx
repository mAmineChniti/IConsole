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
        <div className="w-full space-y-6 p-4 sm:p-6">
          <div className="space-y-1">
            <h1 className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-3xl font-bold tracking-tight text-transparent select-none dark:from-blue-400 dark:to-indigo-400">
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
