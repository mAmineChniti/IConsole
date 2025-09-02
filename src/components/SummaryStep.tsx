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
        <Card className="bg-card text-card-foreground border-border rounded-xl border shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Cpu className="text-primary h-5 w-5" />
              Compute Resources
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Flavor:</span>
              <span className="text-foreground font-medium">
                {selectedFlavor?.name ?? "N/A"}
              </span>
            </div>
            {selectedFlavor && (
              <>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">vCPUs:</span>
                  <span className="text-foreground font-medium">
                    {selectedFlavor.vcpus}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">RAM:</span>
                  <span className="text-foreground font-medium">
                    {selectedFlavor.ram}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Storage:</span>
                  <span className="text-foreground font-medium">
                    {selectedFlavor.disk}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Ephemeral:</span>
                  <span className="text-foreground font-medium">
                    {selectedFlavor.ephemeral}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-muted-foreground">Swap:</span>
                  <span className="text-foreground font-medium">
                    {selectedFlavor.swap}
                  </span>
                </div>
              </>
            )}
            <div className="flex justify-between">
              <span className="text-muted-foreground">Flavor ID:</span>
              <span className="text-muted-foreground font-mono text-xs">
                {data.flavor_id}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card text-card-foreground border-border rounded-xl border shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <HardDrive className="text-primary h-5 w-5" />
              Operating System
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Image:</span>
              <span className="text-foreground font-medium">
                {selectedImage?.name}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card text-card-foreground border-border rounded-xl border shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Network className="text-primary h-5 w-5" />
              Network Configuration
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Network:</span>
              <span className="text-foreground font-medium">
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

        <Card className="bg-card text-card-foreground border-border rounded-xl border shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="text-primary h-5 w-5" />
              VM Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Name:</span>
              <span className="text-foreground font-medium">{data.name}</span>
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

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-muted-foreground text-center sm:text-left">
          Ready to create your virtual machine?
        </p>
        <div className="flex flex-col gap-3 sm:flex-row">
          <Button
            onClick={onCancel}
            disabled={isCreating}
            variant="outline"
            className="bg-muted text-foreground border-border order-2 w-full cursor-pointer rounded-full border transition-all duration-200 sm:order-1 sm:w-auto"
          >
            <ArrowLeft className="mr-2 h-4 w-4 flex-shrink-0" />
            <span className="truncate">Back to Details</span>
          </Button>
          <Button
            onClick={onCreateVM}
            disabled={isCreating}
            className="bg-primary text-primary-foreground order-1 w-full min-w-[180px] cursor-pointer rounded-full transition-all duration-200 sm:order-2 sm:w-auto"
          >
            {isCreating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 flex-shrink-0 animate-spin" />
                <span className="truncate">Creating VM...</span>
              </>
            ) : (
              <>
                <Zap className="mr-2 h-4 w-4 flex-shrink-0" />
                <span className="truncate">Create Virtual Machine</span>
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
