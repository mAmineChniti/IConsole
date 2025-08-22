import { InstanceActions } from "@/components/InstanceActions";
import { InstanceStatusBadge } from "@/components/InstanceStatusBadge";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { calculateAge } from "@/lib/utils";
import type { InstanceDetailsResponse } from "@/types/ResponseInterfaces";
import {
  HardDrive,
  Key,
  MapPin,
  MemoryStick,
  Network,
  Server,
  Timer,
} from "lucide-react";

export function InstanceDialog({
  open,
  onOpenChange,
  instance,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  instance: InstanceDetailsResponse | undefined;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-card text-card-foreground border border-border shadow-lg rounded-xl left-[calc(50%+8rem)] translate-x-[-50%]">
        <DialogHeader>
          <DialogTitle className="flex justify-between items-center pr-8">
            <span className="text-xl font-semibold">{instance?.name}</span>
            {instance?.status && (
              <InstanceStatusBadge status={instance.status} />
            )}
          </DialogTitle>
        </DialogHeader>

        {instance && (
          <div className="mt-6 space-y-6">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div className="space-y-1">
                <div className="flex gap-1.5 items-center">
                  <span className="inline-flex justify-center items-center w-7 h-7 rounded-md bg-[color:var(--chart-2)]/20">
                    <HardDrive className="w-4 h-4 text-[color:var(--chart-2)]" />
                  </span>
                  <p className="text-sm font-medium text-muted-foreground">
                    Image
                  </p>
                </div>
                <div className="pl-6">
                  <p className="text-base font-medium break-words text-card-foreground">
                    {instance.image.name}
                  </p>
                </div>
              </div>
              <div className="space-y-1">
                <div className="flex gap-1.5 items-center">
                  <span className="inline-flex justify-center items-center w-7 h-7 bg-gray-200 rounded-md dark:bg-gray-800">
                    <Server className="w-4 h-4 text-gray-500 dark:text-gray-300" />
                  </span>
                  <p className="text-sm font-medium text-muted-foreground">
                    Project ID
                  </p>
                </div>
                <div className="pl-6">
                  <p className="font-mono text-sm break-all text-card-foreground">
                    {instance.project_id}
                  </p>
                </div>
              </div>
            </div>

            <Separator />

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div className="space-y-1">
                <div className="flex gap-1.5 items-center">
                  <span className="inline-flex justify-center items-center w-7 h-7 bg-green-100 rounded-md dark:bg-green-900/30">
                    <Network className="w-4 h-4 text-green-500 dark:text-green-400" />
                  </span>
                  <p className="text-sm font-medium text-muted-foreground">
                    Networks
                  </p>
                </div>
                <div className="pl-6 space-y-2">
                  {instance.networks.map((network, index) => (
                    <div key={index} className="text-sm">
                      <p className="font-mono break-all text-card-foreground">
                        {network.ip}
                      </p>
                      <p className="text-muted-foreground">
                        {network.network} ({network.type})
                      </p>
                    </div>
                  ))}
                </div>
              </div>
              <div className="space-y-1">
                <div className="flex gap-1.5 items-center">
                  <span className="inline-flex justify-center items-center w-7 h-7 rounded-md bg-[color:var(--chart-1)]/20">
                    <Timer className="w-4 h-4 text-[color:var(--chart-1)]" />
                  </span>
                  <p className="text-sm font-medium text-muted-foreground">
                    Created
                  </p>
                </div>
                <div className="pl-6">
                  <p className="text-base font-medium text-card-foreground">
                    {calculateAge(instance.created_at)}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {new Date(instance.created_at).toLocaleString()}
                  </p>
                </div>
              </div>
            </div>

            <Separator />

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div className="space-y-1">
                <div className="flex gap-1.5 items-center">
                  <span className="inline-flex justify-center items-center w-7 h-7 bg-pink-100 rounded-md dark:bg-pink-900/30">
                    <MapPin className="w-4 h-4 text-pink-500 dark:text-pink-400" />
                  </span>
                  <p className="text-sm font-medium text-muted-foreground">
                    Host
                  </p>
                </div>
                <div className="pl-6">
                  <p className="text-base font-medium break-words text-card-foreground">
                    {instance.host}
                  </p>
                </div>
              </div>
              <div className="space-y-1">
                <div className="flex gap-1.5 items-center">
                  <span className="inline-flex justify-center items-center w-7 h-7 bg-purple-100 rounded-md dark:bg-purple-900/30">
                    <Key className="w-4 h-4 text-purple-500 dark:text-purple-400" />
                  </span>
                  <p className="text-sm font-medium text-muted-foreground">
                    Security Groups
                  </p>
                </div>
                <div className="pl-6">
                  {instance.security_groups.length > 0 ? (
                    <div className="flex flex-wrap gap-1">
                      {instance.security_groups.map((group, index) => (
                        <Badge
                          key={index}
                          variant="secondary"
                          className="bg-muted text-muted-foreground border-border"
                        >
                          {group}
                        </Badge>
                      ))}
                    </div>
                  ) : (
                    <p className="text-base text-muted-foreground">
                      No security groups
                    </p>
                  )}
                </div>
              </div>
            </div>

            <div className="p-4 rounded-lg bg-muted">
              <div className="flex gap-1.5 items-center mb-3">
                <span className="inline-flex justify-center items-center w-7 h-7 bg-purple-100 rounded-md dark:bg-purple-900/30">
                  <MemoryStick className="w-4 h-4 text-purple-500 dark:text-purple-400" />
                </span>
                <p className="text-sm font-medium text-muted-foreground">
                  Flavor Details
                </p>
              </div>
              <div className="pl-6 space-y-3">
                <p className="text-lg font-medium text-foreground">
                  {instance.flavor.name}
                </p>
                <div className="grid grid-cols-3 gap-4 pt-2">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-foreground">
                      {instance.flavor.vcpus}
                    </p>
                    <p className="text-sm text-muted-foreground">vCPUs</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-foreground">
                      {instance.flavor.ram}
                    </p>
                    <p className="text-sm text-muted-foreground">RAM</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-foreground">
                      {instance.flavor.disk}
                    </p>
                    <p className="text-sm text-muted-foreground">Disk</p>
                  </div>
                </div>
              </div>
            </div>

            {instance.volumes && instance.volumes.length > 0 && (
              <div className="p-4 rounded-lg bg-muted">
                <div className="flex gap-1.5 items-center mb-3">
                  <span className="inline-flex justify-center items-center w-7 h-7 rounded-md bg-[color:var(--chart-2)]/20">
                    <HardDrive className="w-4 h-4 text-[color:var(--chart-2)]" />
                  </span>
                  <p className="text-sm font-medium text-muted-foreground">
                    Attached Volumes
                  </p>
                </div>
                <div className="pl-6 space-y-3">
                  {instance.volumes.map((volume, index) => (
                    <div key={index} className="text-sm">
                      <p className="font-medium text-card-foreground">
                        {volume.Name}
                      </p>
                      <p className="text-muted-foreground">
                        Size: {volume.Size}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {instance.floating_ips.length > 0 && (
              <div className="p-4 rounded-lg bg-muted">
                <div className="flex gap-1.5 items-center mb-3">
                  <span className="inline-flex justify-center items-center w-7 h-7 bg-green-100 rounded-md dark:bg-green-900/30">
                    <Network className="w-4 h-4 text-green-500 dark:text-green-400" />
                  </span>
                  <p className="text-sm font-medium text-muted-foreground">
                    Floating IPs
                  </p>
                </div>
                <div className="pl-6 space-y-1">
                  {instance.floating_ips.map((ip, index) => (
                    <p
                      key={index}
                      className="font-mono text-base font-medium break-all text-card-foreground"
                    >
                      {ip}
                    </p>
                  ))}
                </div>
              </div>
            )}

            <div className="pt-4">
              <InstanceActions
                instanceId={instance.id}
                status={instance.status}
                disabled={instance.status === "BUILD"}
              />
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
