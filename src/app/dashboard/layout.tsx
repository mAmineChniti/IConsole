import { Sidebar } from "@/components/reusable/Sidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import type { ReactNode } from "react";

export default function DashboardLayout({
  children,
}: Readonly<{ children: ReactNode }>) {
  return (
    <SidebarProvider>
      <Sidebar />
      <SidebarInset>{children}</SidebarInset>
    </SidebarProvider>
  );
}
