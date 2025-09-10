"use client";

import { AssociateIpDialog } from "@/components/FloatingIps/AssociateIpDialog";
import { ConfirmDeleteDialog } from "@/components/reusable/ConfirmDeleteDialog";
import { Button } from "@/components/ui/button";
import { NetworkService } from "@/lib/requests";
import type { FloatingIpsListItem } from "@/types/ResponseInterfaces";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Link, Trash2, Unplug } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export function FloatingIpActions({ ip }: { ip: FloatingIpsListItem }) {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [associateDialogOpen, setAssociateDialogOpen] = useState(false);
  const queryClient = useQueryClient();

  const deleteMutation = useMutation({
    mutationFn: () =>
      NetworkService.deleteFloatingIP({ floating_ip_id: ip.id }),
    onSuccess: async () => {
      toast.success("Floating IP deleted successfully");
      setDeleteDialogOpen(false);
      await queryClient.invalidateQueries({ queryKey: ["floating-ips"] });
    },
    onError: (err: unknown) => {
      const message =
        err instanceof Error ? err.message : "Failed to delete floating IP";
      toast.error(message);
    },
  });

  const dissociateMutation = useMutation({
    mutationFn: () =>
      NetworkService.dissociateFloatingIP({ floating_ip_id: ip.id }),
    onSuccess: async () => {
      toast.success("Floating IP dissociated successfully");
      await queryClient.invalidateQueries({ queryKey: ["floating-ips"] });
    },
    onError: (err: unknown) => {
      const message =
        err instanceof Error ? err.message : "Failed to dissociate floating IP";
      toast.error(message);
    },
  });

  return (
    <div className="flex items-center gap-2">
      <ConfirmDeleteDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={() => deleteMutation.mutate()}
        confirming={deleteMutation.isPending}
        title={`Delete Floating IP ${ip.ip_address}`}
        description="Are you sure you want to delete this floating IP? This action cannot be undone."
      />
      <AssociateIpDialog
        open={associateDialogOpen}
        onOpenChange={setAssociateDialogOpen}
        floatingIp={ip}
      />
      {ip.associated ? (
        <Button
          variant="outline"
          size="sm"
          onClick={() => dissociateMutation.mutate()}
          className="cursor-pointer gap-2 rounded-full"
        >
          <Unplug className="h-4 w-4" />
          <span>Dissociate</span>
        </Button>
      ) : (
        <Button
          variant="outline"
          size="sm"
          onClick={() => setAssociateDialogOpen(true)}
          className="cursor-pointer gap-2 rounded-full"
        >
          <Link className="h-4 w-4" />
          <span>Associate</span>
        </Button>
      )}
      <Button
        variant="destructive"
        size="sm"
        onClick={() => setDeleteDialogOpen(true)}
        className="cursor-pointer gap-2 rounded-full"
      >
        <Trash2 className="h-4 w-4" />
        <span>Delete</span>
      </Button>
    </div>
  );
}
