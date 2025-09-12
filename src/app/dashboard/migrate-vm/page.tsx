import { MigrateVM } from "@/components/MigrateVM/MigrateVM";
import { type Metadata } from "next";

export const metadata: Metadata = {
  title: "IConsole | Migrate VM",
  description:
    "Migrate a VMware virtual machine image and deploy as a new instance",
};

export default function MigrateVMPage() {
  return (
    <div className="w-full p-4 sm:p-6">
      <MigrateVM />
    </div>
  );
}
