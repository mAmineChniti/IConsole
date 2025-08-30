import { InstanceStatusBadge } from "@/components/InstanceStatusBadge";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { InstanceListItem } from "@/types/ResponseInterfaces";
import {
  Bolt,
  ClipboardList,
  HardDrive,
  Key,
  MapPin,
  MemoryStick,
  Network,
  Timer,
} from "lucide-react";

export function InstanceDialog({
  open,
  onOpenChange,
  instance,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  instance: InstanceListItem | undefined;
}) {
  if (!instance) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>No Instance Information</DialogTitle>
          </DialogHeader>
          <div className="py-4 text-center">
            <p className="text-muted-foreground">
              No instance information available to display.
            </p>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="overflow-y-auto max-w-2xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex gap-3 items-center">
            <span className="text-xl font-semibold">
              {instance.instance_name}
            </span>
            <InstanceStatusBadge status={instance.status} />
          </DialogTitle>
        </DialogHeader>

        <div className="mt-6 space-y-6">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div className="space-y-1">
              <div className="flex gap-2 items-center text-sm text-muted-foreground">
                <HardDrive className="w-4 h-4" />
                <span>Image</span>
              </div>
              <div className="text-sm font-medium">
                {instance.image_name || "Unknown"}
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex gap-2 items-center text-sm text-muted-foreground">
                <MemoryStick className="w-4 h-4" />
                <span>Flavor</span>
              </div>
              <div className="text-sm font-medium">
                {instance.flavor || "Unknown"}
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex gap-2 items-center text-sm text-muted-foreground">
                <Network className="w-4 h-4" />
                <span>IP Address</span>
              </div>
              <div className="text-sm font-medium">
                {instance.ip_address || "-"}
                {instance.floating_ip && ` (${instance.floating_ip})`}
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex gap-2 items-center text-sm text-muted-foreground">
                <MapPin className="w-4 h-4" />
                <span>Availability Zone</span>
              </div>
              <div className="text-sm font-medium">
                {instance.availability_zone || "N/A"}
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex gap-2 items-center text-sm text-muted-foreground">
                <Key className="w-4 h-4" />
                <span>Key Pair</span>
              </div>
              <div className="text-sm font-medium">
                {instance.key_pair || "None"}
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex gap-2 items-center text-sm text-muted-foreground">
                <Timer className="w-4 h-4" />
                <span>Age</span>
              </div>
              <div className="text-sm font-medium">
                {instance.age || "Unknown"}
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex gap-2 items-center text-sm text-muted-foreground">
                <Bolt className="w-4 h-4" />
                <span>Power State</span>
              </div>
              <div className="text-sm font-medium">
                <Badge variant="outline" className="text-xs">
                  {instance.power_state || "N/A"}
                </Badge>
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex gap-2 items-center text-sm text-muted-foreground">
                <ClipboardList className="w-4 h-4" />
                <span>Task</span>
              </div>
              <div className="text-sm font-medium">
                <Badge variant="outline" className="text-xs">
                  {instance.task || "No task"}
                </Badge>
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex gap-2 items-center text-sm text-muted-foreground">
                <HardDrive className="w-4 h-4" />
                <span>Has Volume</span>
              </div>
              <div className="text-sm font-medium">
                <Badge
                  variant={instance.has_volume ? "default" : "outline"}
                  className="text-xs"
                >
                  {instance.has_volume ? "Yes" : "No"}
                </Badge>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
