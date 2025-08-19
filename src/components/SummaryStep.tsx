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
        <Card className="bg-card text-card-foreground shadow-lg rounded-xl border border-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Cpu className="h-5 w-5 text-primary" />
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
              <span className="text-xs font-mono text-muted-foreground">
                {data.flavor_id}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card text-card-foreground shadow-lg rounded-xl border border-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <HardDrive className="h-5 w-5 text-primary" />
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
              <span className="text-xs font-mono text-muted-foreground">
                {selectedImage?.id.slice(0, 8) ?? "N/A"}...
              </span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card text-card-foreground shadow-lg rounded-xl border border-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Network className="h-5 w-5 text-primary" />
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

        <Card className="bg-card text-card-foreground shadow-lg rounded-xl border border-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5 text-primary" />
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

      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <p className="text-muted-foreground text-center sm:text-left">
          Ready to create your virtual machine?
        </p>
        <div className="flex flex-col sm:flex-row gap-3">
          <Button
            onClick={onCancel}
            disabled={isCreating}
            variant="outline"
            className="rounded-full cursor-pointer w-full sm:w-auto order-2 sm:order-1 bg-muted text-foreground border border-border transition-all duration-200"
          >
            <ArrowLeft className="h-4 w-4 mr-2 flex-shrink-0" />
            <span className="truncate">Back to Details</span>
          </Button>
          <Button
            onClick={onCreateVM}
            disabled={isCreating}
            className="rounded-full min-w-[180px] bg-primary text-primary-foreground transition-all duration-200 cursor-pointer w-full sm:w-auto order-1 sm:order-2"
          >
            {isCreating ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin flex-shrink-0" />
                <span className="truncate">Creating VM...</span>
              </>
            ) : (
              <>
                <Zap className="h-4 w-4 mr-2 flex-shrink-0" />
                <span className="truncate">Create Virtual Machine</span>
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
