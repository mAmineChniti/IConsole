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
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Cpu className="h-5 w-5" />
              Compute Resources
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Flavor:</span>
              <span className="font-medium">
                {selectedFlavor?.name ?? "N/A"}
              </span>
            </div>
            {selectedFlavor && (
              <>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">vCPUs:</span>
                  <span className="font-medium">{selectedFlavor.vcpus}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">RAM:</span>
                  <span className="font-medium">
                    {selectedFlavor.ram >= 1024
                      ? `${(selectedFlavor.ram / 1024).toFixed(1)} GB`
                      : `${selectedFlavor.ram} MB`}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Storage:</span>
                  <span className="font-medium">{selectedFlavor.disk} GB</span>
                </div>
                {selectedFlavor.ephemeral > 0 && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Ephemeral:</span>
                    <span className="font-medium">
                      {selectedFlavor.ephemeral} GB
                    </span>
                  </div>
                )}
                {selectedFlavor.swap > 0 && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Swap:</span>
                    <span className="font-medium">
                      {selectedFlavor.swap} MB
                    </span>
                  </div>
                )}
              </>
            )}
            <div className="flex justify-between">
              <span className="text-muted-foreground">Flavor ID:</span>
              <span className="text-xs font-mono">{data.flavor_id}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <HardDrive className="h-5 w-5" />
              Operating System
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Image:</span>
              <span className="font-medium">{selectedImage?.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Image ID:</span>
              <span className="text-xs font-mono">
                {selectedImage?.id.slice(0, 8) ?? "N/A"}...
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Network className="h-5 w-5" />
              Network Configuration
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Network:</span>
              <span className="font-medium">{selectedNetwork?.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Key Pair:</span>
              <span>{data.key_name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Security Group:</span>
              <span>{data.security_group}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              VM Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Name:</span>
              <span className="font-medium">{data.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Admin Username:</span>
              <span>{data.admin_username}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Admin Password:</span>
              <span>{"*".repeat(8)}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <Separator />

      <div className="flex justify-between items-center">
        <p className="text-muted-foreground">
          Ready to create your virtual machine?
        </p>
        <div className="flex gap-3">
          <Button
            onClick={onCancel}
            disabled={isCreating}
            variant="outline"
            className="cursor-pointer"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Details
          </Button>
          <Button
            onClick={onCreateVM}
            disabled={isCreating}
            className="bg-green-600 hover:bg-green-700 text-white cursor-pointer"
          >
            {isCreating ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Creating VM...
              </>
            ) : (
              <>
                <Zap className="h-4 w-4 mr-2" />
                Create Virtual Machine
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
