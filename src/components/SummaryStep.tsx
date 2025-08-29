"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import type { CombinedVMData } from "@/types/RequestInterfaces";
import type { ResourcesResponse } from "@/types/ResponseInterfaces";
import {
  ArrowLeft,
  Cpu,
  HardDrive,
  Loader2,
  Network,
  Settings,
  Zap,
} from "lucide-react";

export function SummaryStep({
  data,
  resources,
  onCreateVM,
  onCancel,
  isCreating,
}: {
  data: Partial<CombinedVMData>;
  resources: ResourcesResponse | undefined;
  onCreateVM: () => void;
  onCancel: () => void;
  isCreating: boolean;
}) {
  const selectedFlavor = resources?.flavors.find(
    (f) => f.id === data.flavor_id,
  );
  const selectedImage = resources?.images.find((i) => i.id === data.image_id);
  const selectedNetwork = resources?.networks.find(
    (n) => n.id === data.network_id,
  );

  return (
    <div className="space-y-6">
      <div className="grid gap-6 md:grid-cols-2">
        <Card className="rounded-xl border shadow-lg bg-card text-card-foreground border-border">
          <CardHeader>
            <CardTitle className="flex gap-2 items-center">
              <Cpu className="w-5 h-5 text-primary" />
              Compute Resources
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Flavor:</span>
              <span className="font-medium text-foreground">
                {selectedFlavor?.name ?? "N/A"}
              </span>
            </div>
            {selectedFlavor && (
              <>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">vCPUs:</span>
                  <span className="font-medium text-foreground">
                    {selectedFlavor.vcpus}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">RAM:</span>
                  <span className="font-medium text-foreground">
                    {selectedFlavor.ram >= 1024
                      ? `${(selectedFlavor.ram / 1024).toFixed(1)} GB`
                      : `${selectedFlavor.ram} MB`}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Storage:</span>
                  <span className="font-medium text-foreground">
                    {selectedFlavor.disk} GB
                  </span>
                </div>
                {selectedFlavor.ephemeral > 0 && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Ephemeral:</span>
                    <span className="font-medium text-foreground">
                      {selectedFlavor.ephemeral} GB
                    </span>
                  </div>
                )}
                {selectedFlavor.swap > 0 && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Swap:</span>
                    <span className="font-medium text-foreground">
                      {selectedFlavor.swap} MB
                    </span>
                  </div>
                )}
              </>
            )}
            <div className="flex justify-between">
              <span className="text-muted-foreground">Flavor ID:</span>
              <span className="font-mono text-xs text-muted-foreground">
                {data.flavor_id}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-xl border shadow-lg bg-card text-card-foreground border-border">
          <CardHeader>
            <CardTitle className="flex gap-2 items-center">
              <HardDrive className="w-5 h-5 text-primary" />
              Operating System
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Image:</span>
              <span className="font-medium text-foreground">
                {selectedImage?.name}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Image ID:</span>
              <span className="font-mono text-xs text-muted-foreground">
                {selectedImage?.id?.slice(0, 8) ?? "N/A"}...{" "}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-xl border shadow-lg bg-card text-card-foreground border-border">
          <CardHeader>
            <CardTitle className="flex gap-2 items-center">
              <Network className="w-5 h-5 text-primary" />
              Network Configuration
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Network:</span>
              <span className="font-medium text-foreground">
                {selectedNetwork?.name}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Key Pair:</span>
              <span className="text-foreground">{data.key_name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Security Group:</span>
              <span className="text-foreground">{data.security_group}</span>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-xl border shadow-lg bg-card text-card-foreground border-border">
          <CardHeader>
            <CardTitle className="flex gap-2 items-center">
              <Settings className="w-5 h-5 text-primary" />
              VM Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Name:</span>
              <span className="font-medium text-foreground">{data.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Admin Username:</span>
              <span className="text-foreground">{data.admin_username}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Admin Password:</span>
              <span className="text-foreground">{"*".repeat(8)}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <Separator />

      <div className="flex flex-col gap-4 sm:flex-row sm:justify-between sm:items-center">
        <p className="text-center sm:text-left text-muted-foreground">
          Ready to create your virtual machine?
        </p>
        <div className="flex flex-col gap-3 sm:flex-row">
          <Button
            onClick={onCancel}
            disabled={isCreating}
            variant="outline"
            className="order-2 w-full rounded-full border transition-all duration-200 cursor-pointer sm:order-1 sm:w-auto bg-muted text-foreground border-border"
          >
            <ArrowLeft className="flex-shrink-0 mr-2 w-4 h-4" />
            <span className="truncate">Back to Details</span>
          </Button>
          <Button
            onClick={onCreateVM}
            disabled={isCreating}
            className="order-1 w-full rounded-full transition-all duration-200 cursor-pointer sm:order-2 sm:w-auto bg-primary text-primary-foreground min-w-[180px]"
          >
            {isCreating ? (
              <>
                <Loader2 className="flex-shrink-0 mr-2 w-4 h-4 animate-spin" />
                <span className="truncate">Creating VM...</span>
              </>
            ) : (
              <>
                <Zap className="flex-shrink-0 mr-2 w-4 h-4" />
                <span className="truncate">Create Virtual Machine</span>
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
