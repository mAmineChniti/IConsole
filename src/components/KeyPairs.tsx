"use client";

import { KeyPairCreateDialog } from "@/components/KeyPairCreateDialog";
import { KeyPairImportDialog } from "@/components/KeyPairImportDialog";
import { ConfirmDeleteDialog } from "@/components/reusable/ConfirmDeleteDialog";
import { EmptyState } from "@/components/reusable/EmptyState";
import { ErrorCard } from "@/components/reusable/ErrorCard";
import { HeaderActions } from "@/components/reusable/HeaderActions";
import { InfoCard } from "@/components/reusable/InfoCard";
import { XSearch } from "@/components/reusable/XSearch";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { KeyPairService } from "@/lib/requests";
import type {
  KeyPairCreateResponse,
  KeyPairDetails,
} from "@/types/ResponseInterfaces";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Download,
  Key as KeyIcon,
  KeyRound,
  Plus,
  ShieldCheck,
  Trash2,
  Upload,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { atomDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import { toast } from "sonner";

export function KeyPairs() {
  const qc = useQueryClient();

  const [search, setSearch] = useState("");
  const [limit, setLimit] = useState(6);

  const [selectedKey, setSelectedKey] = useState<string | undefined>(undefined);
  const [generatedPrivateKey, setGeneratedPrivateKey] = useState<string>();
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [importOpen, setImportOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [keyToDelete, setKeyToDelete] = useState<{ name: string } | undefined>(
    undefined,
  );

  const {
    data: selected,
    error: detailsError,
    isLoading: isLoadingDetails,
  } = useQuery<KeyPairDetails, Error>({
    queryKey: ["keypair", selectedKey],
    queryFn: async () => {
      return await KeyPairService.get(selectedKey!);
    },
    enabled: !!selectedKey,
  });
  useEffect(() => {
    if (detailsError) {
      toast.error(detailsError.message);
    }
  }, [detailsError]);
  const openDetails = (name: string) => {
    setSelectedKey(name);
    setGeneratedPrivateKey(undefined);
    setDetailsOpen(true);
  };

  useEffect(() => {
    if (!deleteDialogOpen) setKeyToDelete(undefined);
  }, [deleteDialogOpen]);

  useEffect(() => {
    setLimit(6);
  }, [search]);

  const { data, isLoading, error, isFetching, refetch } = useQuery({
    queryKey: ["keypairs"],
    queryFn: () => KeyPairService.list(),
  });

  const list = data ?? [];
  const q = search.trim().toLowerCase();
  const filtered = q
    ? list.filter((k) =>
        [k.name, k.type].some((v) => (v ?? "").toLowerCase().includes(q)),
      )
    : list;
  const totalItems = filtered.length;
  const visible = filtered.slice(0, limit);
  const hasMore = limit < totalItems;

  const deleteMutation = useMutation({
    mutationFn: (payload: { name: string }) => KeyPairService.delete(payload),
    onSuccess: async (res) => {
      toast.success(res.message || "Key pair deleted");
      setDeleteDialogOpen(false);
      await qc.invalidateQueries({ queryKey: ["keypairs"] });
    },
    onError: (err: unknown) => {
      const message =
        err instanceof Error ? err.message : "Failed to delete key pair";
      toast.error(message);
    },
  });

  if (isLoading) {
    return (
      <div className="space-y-6 px-2 sm:px-0">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between sm:gap-0">
          <div className="text-muted-foreground text-sm leading-relaxed">
            <Skeleton className="inline-block h-4 w-40 align-middle" />
          </div>
        </div>

        <div className="flex flex-col items-stretch gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative max-w-full flex-1 sm:max-w-md">
            <Skeleton className="h-10 w-full rounded-full" />
          </div>
          <div className="ml-auto flex gap-2 self-end sm:self-auto">
            <Skeleton className="h-10 w-10 rounded-full" />
            <Skeleton className="h-10 w-36 rounded-full" />
            <Skeleton className="h-10 w-36 rounded-full" />
          </div>
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
            {Array.from({ length: 12 }).map((_, i) => (
              <div
                key={i}
                className="flex flex-col gap-2 rounded-md border p-2 text-center text-sm"
              >
                <div className="min-w-0">
                  <Skeleton className="mx-auto h-4 w-24 rounded-full" />
                </div>
                <div>
                  <Skeleton className="mx-auto h-5 w-20 rounded-full" />
                </div>
                <div className="mt-auto flex items-center justify-center gap-2">
                  <Skeleton className="h-8 w-20 rounded-full" />
                  <Skeleton className="h-8 w-8 rounded-full" />
                </div>
              </div>
            ))}
          </div>
          <div className="flex justify-center pt-2">
            <Skeleton className="h-10 w-48 rounded-full" />
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <ErrorCard
        title="Failed to Load Key Pairs"
        message={error instanceof Error ? error.message : String(error)}
        onRetry={() => refetch()}
        isRetrying={isFetching}
      />
    );
  }

  if (!list || list.length === 0) {
    return (
      <>
        <EmptyState
          title="No key pairs found"
          text="Create a new key pair or import a public key file to get started."
          onRefresh={() => refetch()}
          refreshing={isFetching}
          icon={<KeyIcon className="text-muted-foreground h-7 w-7" />}
          variant="dashed"
          primaryActions={[
            {
              label: "Import from file",
              onClick: () => setImportOpen(true),
              icon: <Upload />,
            },
            {
              label: "New Key Pair",
              onClick: () => setCreateOpen(true),
              icon: <Plus />,
            },
          ]}
        />
        <KeyPairCreateDialog
          open={createOpen}
          onOpenChange={setCreateOpen}
          onSuccess={async (res: KeyPairCreateResponse) => {
            setGeneratedPrivateKey(res.private_key);
            await qc.invalidateQueries({ queryKey: ["keypairs"] });
            if (res.private_key) setDetailsOpen(true);
          }}
        />
        <KeyPairImportDialog
          open={importOpen}
          onOpenChange={setImportOpen}
          onSuccess={async () => {
            await qc.invalidateQueries({ queryKey: ["keypairs"] });
          }}
        />
      </>
    );
  }

  return (
    <div className="space-y-6 px-2 sm:px-0">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between sm:gap-0">
        <div className="text-muted-foreground text-sm leading-relaxed">
          {totalItems} key pair{totalItems !== 1 ? "s" : ""} total
          {totalItems > 0 && (
            <>
              {" • "}
              Showing {Math.min(limit, totalItems)} of {totalItems}
            </>
          )}
        </div>
        <div className="ml-auto flex gap-2 self-end sm:self-auto">
          <HeaderActions
            onRefresh={() => refetch()}
            isRefreshing={isFetching}
            refreshTooltip="Refresh key pairs"
            mainButtons={[
              {
                label: "Import from file",
                onClick: () => setImportOpen(true),
                icon: <Upload />,
              },
              {
                label: "New Key Pair",
                onClick: () => setCreateOpen(true),
                icon: <Plus />,
              },
            ]}
          />
        </div>
      </div>

      <div className="flex flex-col items-stretch gap-4 sm:flex-row sm:items-center">
        <div className="max-w-full flex-1 sm:max-w-md">
          <XSearch
            value={search}
            onChange={setSearch}
            placeholder="Search key pairs..."
            aria-label="Search key pairs"
          />
        </div>
      </div>

      {
        <div className="space-y-4">
          {visible.length === 0 ? (
            <div className="text-muted-foreground rounded-2xl border p-8 text-center">
              No key pairs match your search.
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3">
              {visible.map((k) => (
                <InfoCard
                  key={k.name}
                  title={k.name}
                  onClick={() => openDetails(k.name)}
                  badges={
                    <Badge
                      variant="secondary"
                      className="inline-flex items-center gap-1 px-2 py-0.5 text-xs"
                    >
                      {k.type === "ssh" ? (
                        <KeyIcon className="h-3.5 w-3.5" />
                      ) : k.type === "x509" ? (
                        <ShieldCheck className="h-3.5 w-3.5" />
                      ) : (
                        <KeyRound className="h-3.5 w-3.5" />
                      )}
                      <span className="capitalize">{k.type}</span>
                    </Badge>
                  }
                  actionButtons={
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="destructive"
                          size="sm"
                          className="cursor-pointer rounded-full text-white"
                          onClick={(e) => {
                            e.stopPropagation();
                            setKeyToDelete({ name: k.name });
                            setDeleteDialogOpen(true);
                          }}
                          disabled={deleteMutation.isPending}
                          aria-label={`Delete ${k.name}`}
                        >
                          <Trash2 className="h-4 w-4" />
                          Delete Keypair
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Delete the key pair</TooltipContent>
                    </Tooltip>
                  }
                />
              ))}
            </div>
          )}
          <div className="flex justify-center pt-2">
            <Button
              onClick={() => setLimit((l) => l + 6)}
              variant="outline"
              disabled={!hasMore}
              className={`rounded-full ${hasMore ? "" : "cursor-not-allowed opacity-60"}`}
            >
              {hasMore
                ? `Show More (${Math.min(6, totalItems - visible.length)} more)`
                : "All key pairs loaded"}
            </Button>
          </div>
        </div>
      }

      <KeyPairCreateDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        onSuccess={async (res: KeyPairCreateResponse) => {
          setGeneratedPrivateKey(res.private_key);
          await qc.invalidateQueries({ queryKey: ["keypairs"] });
          if (res.private_key) setDetailsOpen(true);
        }}
      />

      <KeyPairImportDialog
        open={importOpen}
        onOpenChange={setImportOpen}
        onSuccess={async () => {
          await qc.invalidateQueries({ queryKey: ["keypairs"] });
        }}
      />

      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Key Pair Details</DialogTitle>
          </DialogHeader>
          {generatedPrivateKey ? (
            <div className="space-y-3 text-sm">
              <p className="text-amber-600 dark:text-amber-400">
                This is the only time the private key will be shown. Please copy
                and store it securely.
              </p>
              <div>
                <div className="text-muted-foreground mb-1 text-xs">
                  Private Key
                </div>
                <SyntaxHighlighter
                  language="bash"
                  style={atomDark}
                  wrapLongLines
                  customStyle={{
                    margin: 0,
                    borderRadius: "0.75rem",
                    background: "#0a0a0a",
                    padding: "0.75rem",
                    maxHeight: "12rem",
                    overflow: "auto",
                  }}
                  codeTagProps={{
                    style: {
                      whiteSpace: "pre-wrap",
                      wordBreak: "break-word",
                      overflowWrap: "anywhere",
                    },
                  }}
                >
                  {generatedPrivateKey}
                </SyntaxHighlighter>
              </div>
            </div>
          ) : selected || isLoadingDetails ? (
            <div className="space-y-4 text-sm">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <div className="text-muted-foreground text-xs">Name</div>
                  <div className="mt-1 font-medium break-words">
                    {isLoadingDetails ? (
                      <Skeleton className="h-5 w-32" />
                    ) : (
                      selected?.name
                    )}
                  </div>
                </div>
                <div>
                  <div className="text-muted-foreground text-xs">Type</div>
                  <div className="mt-1 font-medium break-words">
                    {isLoadingDetails ? (
                      <Skeleton className="h-5 w-24" />
                    ) : (
                      selected?.type
                    )}
                  </div>
                </div>
                <div className="sm:col-span-2">
                  <div className="text-muted-foreground text-xs">
                    Fingerprint
                  </div>
                  <div className="mt-1 font-mono text-xs break-all">
                    {isLoadingDetails ? (
                      <Skeleton className="h-4 w-48" />
                    ) : (
                      selected?.fingerprint
                    )}
                  </div>
                </div>
              </div>
              <div>
                <div className="text-muted-foreground mb-1 text-xs">
                  Public Key
                </div>
                {isLoadingDetails ? (
                  <div className="bg-muted space-y-2 rounded-md p-4">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-5/6" />
                    <Skeleton className="h-4 w-4/5" />
                  </div>
                ) : (
                  <SyntaxHighlighter
                    language="bash"
                    style={atomDark}
                    wrapLongLines
                    customStyle={{
                      margin: 0,
                      borderRadius: "0.75rem",
                      background: "#0a0a0a",
                      padding: "0.75rem",
                      maxHeight: "12rem",
                      overflow: "auto",
                    }}
                    codeTagProps={{
                      style: {
                        whiteSpace: "pre-wrap",
                        wordBreak: "break-word",
                        overflowWrap: "anywhere",
                      },
                    }}
                  >
                    {selected?.public_key ?? ""}
                  </SyntaxHighlighter>
                )}
              </div>
            </div>
          ) : undefined}
          <DialogFooter>
            {generatedPrivateKey ? (
              <Button
                asChild
                variant="default"
                size="sm"
                className="cursor-pointer gap-1.5 rounded-full"
              >
                <Link
                  href={`data:text/plain;charset=utf-8,${encodeURIComponent((generatedPrivateKey ?? "").trim() + "\n")}`}
                  download={`${selected?.name ?? "key"}`}
                  aria-label="Download private key"
                >
                  <Download className="h-4 w-4" />
                  <span>Download</span>
                </Link>
              </Button>
            ) : selected?.public_key ? (
              <Button
                asChild
                variant="default"
                size="sm"
                className="cursor-pointer gap-1.5 rounded-full"
              >
                <Link
                  href={`data:text/plain;charset=utf-8,${encodeURIComponent(selected?.public_key?.trim() + "\n")}`}
                  download={`${selected?.name || "key"}.pub`}
                  aria-label="Download public key"
                >
                  <Download className="h-4 w-4" />
                  <span>Download</span>
                </Link>
              </Button>
            ) : undefined}
            <Button
              variant="outline"
              size="sm"
              className="cursor-pointer rounded-full"
              onClick={() => setDetailsOpen(false)}
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmDeleteDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Delete key pair"
        description={
          keyToDelete ? (
            <>
              Are you sure you want to delete key pair{" "}
              <span className="text-foreground font-semibold">
                {keyToDelete.name}
              </span>
              ?
            </>
          ) : (
            ""
          )
        }
        confirmLabel="Delete"
        cancelLabel="Cancel"
        onConfirm={() =>
          keyToDelete && deleteMutation.mutate({ name: keyToDelete.name })
        }
        confirming={deleteMutation.isPending}
      />
    </div>
  );
}
