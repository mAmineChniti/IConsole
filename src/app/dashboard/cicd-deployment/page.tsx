import CICDDeployment from "@/components/CICDDeployment/CICDDeployment";
import { type Metadata } from "next";

export const metadata: Metadata = {
  title: "IConsole | CI/CD Deployment",
  description: "Configure CI/CD pipeline for your application",
};

export default function CICDDeploymentPage() {
  return (
    <div className="w-full space-y-6 p-4 sm:p-6">
      <div className="space-y-1">
        <h1 className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-3xl font-bold tracking-tight text-transparent select-none dark:from-blue-400 dark:to-indigo-400">
          CI/CD Deployment
        </h1>
        <p className="text-muted-foreground">
          Configure CI/CD pipeline for your application
        </p>
      </div>
      <CICDDeployment />
    </div>
  );
}
