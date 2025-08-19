"use client";

import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "next-themes";
import { Toaster } from "sonner";

const queryClient = new QueryClient();

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider
        attribute="class"
        defaultTheme="system"
        enableSystem={true}
        disableTransitionOnChange
      >
        <TooltipProvider delayDuration={0}>{children}</TooltipProvider>
        <Toaster
          position="top-right"
          closeButton
          expand={true}
          duration={3000}
          richColors
          theme="system"
          className="toaster group"
          toastOptions={{
            classNames: {
              toast:
                "group toast group-[.toaster]:bg-white/80 group-[.toaster]:dark:bg-slate-800/80 group-[.toaster]:backdrop-blur-sm group-[.toaster]:border-border/50 group-[.toaster]:text-foreground group-[.toaster]:shadow-lg group-[.toaster]:rounded-xl",
              description: "group-[.toast]:text-muted-foreground",
              actionButton:
                "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground group-[.toast]:rounded-lg",
              cancelButton:
                "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground group-[.toast]:rounded-lg",
              success:
                "group-[.toaster]:bg-green-50/80 group-[.toaster]:dark:bg-green-900/20 group-[.toaster]:backdrop-blur-sm group-[.toaster]:border-green-200/50 group-[.toaster]:dark:border-green-800/50 group-[.toaster]:text-green-800 group-[.toaster]:dark:text-green-200",
              error:
                "group-[.toaster]:bg-red-50/80 group-[.toaster]:dark:bg-red-900/20 group-[.toaster]:backdrop-blur-sm group-[.toaster]:border-red-200/50 group-[.toaster]:dark:border-red-800/50 group-[.toaster]:text-red-800 group-[.toaster]:dark:text-red-200",
              warning:
                "group-[.toaster]:bg-yellow-50/80 group-[.toaster]:dark:bg-yellow-900/20 group-[.toaster]:backdrop-blur-sm group-[.toaster]:border-yellow-200/50 group-[.toaster]:dark:border-yellow-800/50 group-[.toaster]:text-yellow-800 group-[.toaster]:dark:text-yellow-200",
              info: "group-[.toaster]:bg-blue-50/80 group-[.toaster]:dark:bg-blue-900/20 group-[.toaster]:backdrop-blur-sm group-[.toaster]:border-blue-200/50 group-[.toaster]:dark:border-blue-800/50 group-[.toaster]:text-blue-800 group-[.toaster]:dark:text-blue-200",
            },
          }}
        />
      </ThemeProvider>
    </QueryClientProvider>
  );
}
