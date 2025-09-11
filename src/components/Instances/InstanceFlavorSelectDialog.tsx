import { XCombobox } from "@/components/reusable/XCombobox";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { FlavorService } from "@/lib/requests";
import { useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";

export function InstanceFlavorSelectDialog({
  open,
  onOpenChange,
  currentFlavorId,
  onSelect,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentFlavorId?: string;
  onSelect: (flavorId: string) => void;
}) {
  const [selectedFlavor, setSelectedFlavor] = useState("");

  const {
    data: flavors = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ["flavors"],
    queryFn: async () => {
      return await FlavorService.list();
    },
    enabled: open,
  });

  useEffect(() => {
    if (flavors && currentFlavorId) {
      setSelectedFlavor(currentFlavorId);
    }
  }, [flavors, currentFlavorId]);

  if (error) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Error Loading Flavors</DialogTitle>
          </DialogHeader>
          <div className="text-destructive py-4">
            Failed to load flavors. Please try again later.
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="cursor-pointer rounded-full"
            >
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  const flavorOptions = Array.isArray(flavors) ? flavors : [];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Select New Flavor</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          {isLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : (
            <>
              <XCombobox
                data={flavorOptions.map((flavor) => ({
                  label: flavor.name,
                  value: flavor.id,
                }))}
                value={selectedFlavor}
                onChange={(value) => setSelectedFlavor(value ?? "")}
                type="flavor"
                placeholder="Select a flavor..."
                className="w-full"
              />
              <div className="flex justify-end space-x-2 pt-4">
                <Button
                  variant="outline"
                  onClick={() => onOpenChange(false)}
                  className="cursor-pointer rounded-full"
                >
                  Cancel
                </Button>
                <Button
                  onClick={() => {
                    if (selectedFlavor && selectedFlavor !== currentFlavorId) {
                      onSelect(selectedFlavor);
                    }
                    onOpenChange(false);
                  }}
                  disabled={
                    !selectedFlavor || selectedFlavor === currentFlavorId
                  }
                  className="cursor-pointer rounded-full"
                >
                  {selectedFlavor === currentFlavorId
                    ? "Same Flavor Selected"
                    : "Resize Instance"}
                </Button>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
