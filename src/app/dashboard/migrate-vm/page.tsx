import { MigrateVM } from "@/components/MigrateVM/MigrateVM";
import { type Metadata } from "next";

export const metadata: Metadata = {
  title: "IConsole | Migrate VM",
  description:
    "Migrate a VMware virtual machine image and deploy as a new instance",
};

export default function MigrateVMPage() {
  return (
    <div className="w-full space-y-6 p-4 sm:p-6">
      <div className="space-y-1">
        <h1 className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-3xl font-bold tracking-tight text-transparent select-none dark:from-blue-400 dark:to-indigo-400">
          Migrate VM
        </h1>
        <p className="text-muted-foreground">
          Migrate a VMware VMDK image and deploy as a new virtual machine
          instance
        </p>
      </div>
      <MigrateVM />
    </div>
  );
}
