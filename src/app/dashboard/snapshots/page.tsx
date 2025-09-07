import { Snapshots } from "@/components/Snapshots/Snapshots";
import { type Metadata } from "next";

export const metadata: Metadata = {
  title: "IConsole | Snapshots",
  description: "Manage volume snapshots, restore, and delete operations",
};

export default function SnapshotsPage() {
  return (
    <div className="w-full space-y-6 p-4 sm:p-6">
      <div className="space-y-1">
        <h1 className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-3xl font-bold tracking-tight text-transparent select-none dark:from-blue-400 dark:to-indigo-400">
          Snapshots
        </h1>
        <p className="text-muted-foreground">
          Manage volume snapshots, restore volumes, and delete snapshots
        </p>
      </div>
      <Snapshots />
    </div>
  );
}
