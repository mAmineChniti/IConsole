"use client";

import { AddInterfaceDialog } from "@/components/Routers/AddInterfaceDialog";
import { ManageInterfacesDialog } from "@/components/Routers/ManageInterfacesDialog";
import { Button } from "@/components/ui/button";
import type { RouterListItem } from "@/types/ResponseInterfaces";
import { Network, Plus } from "lucide-react";
import { useState } from "react";

export function RouterActions({ router }: { router: RouterListItem }) {
  const [manageInterfacesOpen, setManageInterfacesOpen] = useState(false);
  const [addInterfaceOpen, setAddInterfaceOpen] = useState(false);

  return (
    <>
      <ManageInterfacesDialog
        open={manageInterfacesOpen}
        onOpenChange={setManageInterfacesOpen}
        router={router}
      />
      <AddInterfaceDialog
        open={addInterfaceOpen}
        onOpenChange={setAddInterfaceOpen}
        router={router}
      />
      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          className="cursor-pointer gap-2 rounded-full px-3"
          onClick={(e) => {
            e.stopPropagation();
            setManageInterfacesOpen(true);
          }}
        >
          <Network className="h-4 w-4" />
          Manage Interfaces
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="cursor-pointer gap-2 rounded-full px-3"
          onClick={(e) => {
            e.stopPropagation();
            setAddInterfaceOpen(true);
          }}
        >
          <Plus className="h-4 w-4" />
          Add Interface
        </Button>
      </div>
    </>
  );
}
