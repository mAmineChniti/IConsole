import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { VolumeService } from "@/lib/requests";
import type {
  VolumeDetails,
  VolumeGetDetails,
} from "@/types/ResponseInterfaces";
import { useQuery } from "@tanstack/react-query";
import { Info } from "lucide-react";

export function VolumeDetailsDialog({
  open,
  onOpenChange,
  volumeId,
  volumeItem,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  volumeId: string | undefined;
  volumeItem?: VolumeDetails;
}) {
  const { data, isLoading, error } = useQuery<VolumeGetDetails | undefined>({
    queryKey: ["volume-details", volumeId],
    queryFn: () =>
      volumeId
        ? VolumeService.get(volumeId)
        : Promise.resolve({} as VolumeGetDetails),
    enabled: !!volumeId,
    staleTime: 10000,
    gcTime: 5 * 60 * 1000,
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="overflow-y-auto p-0 max-w-2xl rounded-2xl border shadow-xl max-h-[90vh] bg-card text-card-foreground border-border/50">
        <DialogTitle asChild>
          <div className="flex gap-3 items-center px-8 pt-8 pb-2">
            <span className="inline-flex justify-center items-center w-10 h-10 rounded-full bg-primary/10">
              <Info className="w-6 h-6 text-primary" />
            </span>
            <span className="text-2xl font-bold tracking-tight text-foreground">
              {data?.Nom ?? volumeItem?.Name ?? "Volume Details"}
            </span>
          </div>
        </DialogTitle>
        {isLoading && (
          <div className="py-16 text-lg font-medium text-center text-muted-foreground">
            Loading...
          </div>
        )}
        {error && (
          <div className="py-16 text-lg font-medium text-center text-destructive">
            Failed to load volume details.
          </div>
        )}
        {!isLoading && !error && !(data ?? volumeItem) && (
          <div className="py-16 text-lg font-medium text-center text-muted-foreground">
            No data found.
          </div>
        )}
        {(data ?? volumeItem) && !isLoading && !error && (
          <div className="px-8 pt-6 pb-2">
            <div className="flex flex-col gap-2 mb-6 sm:flex-row sm:gap-0 sm:justify-between sm:items-center">
              <div className="text-lg font-semibold text-foreground truncate">
                {data?.Nom ?? volumeItem?.Name}
              </div>
              <div className="flex gap-2 items-center">
                <span className="py-1 px-2 text-xs rounded-full border bg-muted text-muted-foreground border-border/50">
                  {data?.Statut ?? volumeItem?.Status}
                </span>
                <span className="py-1 px-2 text-xs text-purple-700 bg-purple-100 rounded-full border dark:text-purple-400 border-border/50 dark:bg-purple-900/30">
                  {data?.Spécifications?.Type ?? volumeItem?.Type ?? "-"}
                </span>
                <span className="py-1 px-2 text-xs text-blue-700 bg-blue-100 rounded-full border dark:text-blue-400 border-border/50 dark:bg-blue-900/30">
                  {data?.Spécifications?.Taille ?? volumeItem?.Size ?? "-"}
                </span>
              </div>
            </div>
            <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
              <div className="space-y-5">
                <div>
                  <div className="mb-1 font-semibold text-muted-foreground">
                    Description
                  </div>
                  <div className="text-base text-card-foreground">
                    {data?.Description ?? volumeItem?.Description ?? "-"}
                  </div>
                </div>
                <div>
                  <div className="mb-1 font-semibold text-muted-foreground">
                    Project
                  </div>
                  <div className="text-base text-card-foreground">
                    {data?.Projet ?? "-"}
                  </div>
                </div>
                <div>
                  <div className="mb-1 font-semibold text-muted-foreground">
                    Group
                  </div>
                  <div className="text-base text-card-foreground">
                    {data?.Groupe ?? volumeItem?.Group ?? "-"}
                  </div>
                </div>
                <div className="flex gap-6">
                  <div>
                    <div className="mb-1 font-semibold text-muted-foreground">
                      Bootable
                    </div>
                    <div className="text-base text-card-foreground">
                      {data?.Spécifications?.Amorçable ??
                        volumeItem?.Bootable ??
                        "-"}
                    </div>
                  </div>
                  <div>
                    <div className="mb-1 font-semibold text-muted-foreground">
                      Encrypted
                    </div>
                    <div className="text-base text-card-foreground">
                      {data?.Spécifications?.Chiffré ??
                        volumeItem?.Encrypted ??
                        "-"}
                    </div>
                  </div>
                </div>
                <div>
                  <div className="mb-1 font-semibold text-muted-foreground">
                    Created
                  </div>
                  <div className="text-base text-card-foreground">
                    {data?.Spécifications?.Créé ?? "-"}
                  </div>
                </div>
              </div>
              <div className="space-y-5">
                <div>
                  <div className="mb-1 font-semibold text-muted-foreground">
                    ID
                  </div>
                  <div className="py-1 px-2 font-mono text-xs break-all rounded-lg text-card-foreground bg-muted/40 w-fit">
                    {data?.ID ?? volumeItem?.ID}
                  </div>
                </div>
                <div>
                  <div className="mb-1 font-semibold text-muted-foreground">
                    Attached To
                  </div>
                  <div className="text-base text-card-foreground">
                    {data?.Attachements?.["Attaché à"] ??
                      volumeItem?.["Attached To"] ??
                      "-"}
                  </div>
                </div>
                <div>
                  <div className="mb-1 font-semibold text-muted-foreground">
                    Metadata
                  </div>
                  <div className="overflow-y-auto py-1 px-2 max-h-32 text-xs break-all rounded-lg text-card-foreground bg-muted/40">
                    {data?.Métadonnées == undefined
                      ? "-"
                      : typeof data.Métadonnées === "string"
                        ? data.Métadonnées
                        : JSON.stringify(data.Métadonnées, undefined, 2)}
                  </div>
                </div>
                <div>
                  <div className="mb-1 font-semibold text-muted-foreground">
                    Availability Zone
                  </div>
                  <div className="text-base text-card-foreground">
                    {volumeItem?.["Availability Zone"] ?? "-"}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
        <div className="flex gap-3 justify-end px-8 pt-6 pb-8 mt-8">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="py-2 px-6 w-full text-base font-semibold rounded-full cursor-pointer sm:w-auto bg-muted text-foreground"
          >
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
