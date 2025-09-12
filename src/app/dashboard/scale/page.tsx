import { Scaling } from "@/components/Scale/Scaling";
import { type Metadata } from "next";

export const metadata: Metadata = {
  title: "IConsole | Scale",
  description: "Operational tooling to add nodes and send test alerts",
};

export default function ScalingPage() {
  return (
    <div className="w-full p-4 sm:p-6">
      <Scaling />
    </div>
  );
}
