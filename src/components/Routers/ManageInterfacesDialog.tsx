"use client";

import { ConfirmDeleteDialog } from "@/components/reusable/ConfirmDeleteDialog";
import { StatusBadge } from "@/components/reusable/StatusBadge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { NetworkService } from "@/lib/requests";
import type {
  RouterInterfacesResponse,
  RouterListItem,
} from "@/types/ResponseInterfaces";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Globe, Loader2, Network, Trash2, Wifi } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export function ManageInterfacesDialog({
  open,
  onOpenChange,
  router,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  router: RouterListItem;
}) {
  const queryClient = useQueryClient();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedInterface, setSelectedInterface] = useState<
    | {
        networkName: string;
        displayName: string;
      }
    | undefined
  >(undefined);

  const {
    data: interfaces,
    isLoading,
    error,
  } = useQuery<RouterInterfacesResponse>({
    queryKey: ["router-interfaces", router.id],
    queryFn: () => NetworkService.getRouterInterfaces({ router_id: router.id }),
    enabled: open,
  });

  const removeMutation = useMutation<unknown, unknown, string>({
    mutationFn: (networkName: string) =>
      NetworkService.removeRouterInterface({
        router_id: router.id,
        network_name: networkName,
      }),
    onSuccess: async () => {
      toast.success("Interface removed successfully");
      await queryClient.invalidateQueries({
        queryKey: ["router-interfaces", router.id],
      });
      setDeleteDialogOpen(false);
      setSelectedInterface(undefined);
    },
    onError: (err: unknown) => {
      const message =
        err instanceof Error ? err.message : "Failed to remove interface";
      toast.error(message);
      setDeleteDialogOpen(false);
      setSelectedInterface(undefined);
    },
  });

  const handleDeleteClick = (networkName: string, displayName: string) => {
    setSelectedInterface({ networkName, displayName });
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    if (selectedInterface) {
      removeMutation.mutate(selectedInterface.networkName);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Manage Interfaces for {router.name}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          {isLoading && (
            <div className="flex items-center justify-center p-8">
              <Loader2 className="text-muted-foreground h-8 w-8 animate-spin" />
            </div>
          )}
          {error && (
            <p className="text-center text-red-500">
              Failed to load interfaces.
            </p>
          )}
          {interfaces && interfaces.length > 0 ? (
            <ul className="space-y-3">
              {interfaces.map((iface) => (
                <li
                  key={iface.port_id}
                  className="bg-card rounded-lg border p-4 shadow-sm"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Network className="h-4 w-4 text-blue-500" />
                          <span className="text-card-foreground font-semibold">
                            {iface.network_name}
                          </span>
                        </div>
                        <StatusBadge status={iface.status} />
                      </div>

                      <div className="grid grid-cols-1 gap-2 text-sm">
                        <div className="text-muted-foreground flex items-center gap-2">
                          <Globe className="h-3.5 w-3.5" />
                          <span className="font-medium">IP Address:</span>
                          <span>{iface.ip_address}</span>
                        </div>
                        <div className="text-muted-foreground flex items-center gap-2">
                          <Wifi className="h-3.5 w-3.5" />
                          <span className="font-medium">Type:</span>
                          <span className="capitalize">{iface.type}</span>
                        </div>
                      </div>
                    </div>

                    <div className="ml-4">
                      <Button
                        variant="destructive"
                        size="icon"
                        className="h-8 w-8 cursor-pointer rounded-full text-white"
                        onClick={() =>
                          handleDeleteClick(
                            iface.network_name,
                            iface.network_name,
                          )
                        }
                        disabled={removeMutation.isPending}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            !isLoading && (
              <p className="text-muted-foreground py-4 text-center">
                No interfaces found.
              </p>
            )
          )}
        </div>
      </DialogContent>
      <ConfirmDeleteDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Remove Interface"
        description={
          selectedInterface ? (
            <>
              Are you sure you want to remove the interface for{" "}
              <strong>{selectedInterface.displayName}</strong>? This action
              cannot be undone.
            </>
          ) : (
            "Are you sure you want to remove this interface?"
          )
        }
        confirmLabel="Remove Interface"
        confirming={removeMutation.isPending}
        onConfirm={handleConfirmDelete}
      />
    </Dialog>
  );
}
