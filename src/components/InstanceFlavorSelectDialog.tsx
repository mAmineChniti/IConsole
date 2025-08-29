import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FlavorService } from "@/lib/requests";
import { useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";

export function InstanceFlavorSelectDialog({
  open,
  onOpenChange,
  currentFlavorName,
  onSelect,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentFlavorName: string;
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
    if (flavors && currentFlavorName) {
      const currentFlavor = flavors.find((f) => f.name === currentFlavorName);
      if (currentFlavor) {
        setSelectedFlavor(currentFlavor.id);
      }
    }
  }, [flavors, currentFlavorName]);

  if (error) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Error Loading Flavors</DialogTitle>
          </DialogHeader>
          <div className="py-4 text-destructive">
            Failed to load flavors. Please try again later.
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="rounded-full cursor-pointer"
            >
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  const flavorOptions = Array.isArray(flavors) ? flavors : [];
  const selectedFlavorName =
    flavors?.find((f) => f.id === selectedFlavor)?.name ?? "";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Select New Flavor</DialogTitle>
        </DialogHeader>
        <div className="py-4 space-y-4">
          {isLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="w-8 h-8 animate-spin" />
            </div>
          ) : (
            <>
              <Select value={selectedFlavor} onValueChange={setSelectedFlavor}>
                <SelectTrigger className="w-full rounded-full cursor-pointer">
                  <SelectValue placeholder="Select a flavor...">
                    {selectedFlavorName || "Select a flavor..."}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {flavorOptions.map((flavor) => (
                    <SelectItem key={flavor.id} value={flavor.id}>
                      {flavor.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <div className="flex justify-end pt-4 space-x-2">
                <Button
                  variant="outline"
                  onClick={() => onOpenChange(false)}
                  className="rounded-full cursor-pointer"
                >
                  Cancel
                </Button>
                <Button
                  onClick={() => {
                    onSelect(selectedFlavor);
                    onOpenChange(false);
                  }}
                  disabled={!selectedFlavor}
                  className="rounded-full cursor-pointer"
                >
                  Resize Instance
                </Button>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
