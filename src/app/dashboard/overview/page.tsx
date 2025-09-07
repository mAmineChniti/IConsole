import { Overview } from "@/components/Overview/Overview";
import { type Metadata } from "next";

export const metadata: Metadata = {
  title: "IConsole | Overview",
  description: "Infrastructure overview and system monitoring dashboard",
};

export default function OverviewPage() {
  return (
    <div className="w-full space-y-6 p-4 sm:p-6">
      <div className="space-y-1">
        <h1 className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-3xl font-bold tracking-tight text-transparent select-none dark:from-blue-400 dark:to-indigo-400">
          Infrastructure Overview
        </h1>
        <p className="text-muted-foreground">
          Monitor your infrastructure health, resources, and services in
          real-time
        </p>
      </div>
      <Overview />
    </div>
  );
}
