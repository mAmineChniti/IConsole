import { Routers } from "@/components/Routers/Routers";
import { type Metadata } from "next";

export const metadata: Metadata = {
  title: "IConsole | Routers",
  description: "Manage your network routers",
};

export default function RoutersPage() {
  return (
    <div className="w-full space-y-6 p-4 sm:p-6">
      <div className="space-y-1">
        <h1 className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-3xl font-bold tracking-tight text-transparent select-none dark:from-blue-400 dark:to-indigo-400">
          Routers
        </h1>
        <p className="text-muted-foreground">
          Manage your network routers and their configurations.
        </p>
      </div>
      <Routers />
    </div>
  );
}
