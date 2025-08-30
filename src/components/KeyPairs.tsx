"use client";

import { ConfirmDeleteDialog } from "@/components/reusable/ConfirmDeleteDialog";
import { KeyPairCreateDialog } from "@/components/KeyPairCreateDialog";
import { KeyPairImportDialog } from "@/components/KeyPairImportDialog";
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
      <div className="px-2 space-y-6 sm:px-0">
        <div className="flex flex-col gap-2 sm:flex-row sm:gap-0 sm:justify-between sm:items-center">
          <div className="text-sm leading-relaxed text-muted-foreground">
            <Skeleton className="inline-block w-40 h-4 align-middle" />
          </div>
        </div>

        <div className="flex flex-col gap-4 items-stretch sm:flex-row sm:justify-between sm:items-center">
          <div className="relative flex-1 max-w-full sm:max-w-md">
            <Skeleton className="w-full h-10 rounded-full" />
          </div>
          <div className="flex gap-2 self-end ml-auto sm:self-auto">
            <Skeleton className="w-10 h-10 rounded-full" />
            <Skeleton className="w-36 h-10 rounded-full" />
            <Skeleton className="w-36 h-10 rounded-full" />
          </div>
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
            {Array.from({ length: 12 }).map((_, i) => (
              <div
                key={i}
                className="flex flex-col gap-2 p-2 text-sm text-center rounded-md border"
              >
                <div className="min-w-0">
                  <Skeleton className="mx-auto w-24 h-4 rounded-full" />
                </div>
                <div>
                  <Skeleton className="mx-auto w-20 h-5 rounded-full" />
                </div>
                <div className="flex gap-2 justify-center items-center mt-auto">
                  <Skeleton className="w-20 h-8 rounded-full" />
                  <Skeleton className="w-8 h-8 rounded-full" />
                </div>
              </div>
            ))}
          </div>
          <div className="flex justify-center pt-2">
            <Skeleton className="w-48 h-10 rounded-full" />
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
          icon={<KeyIcon className="w-7 h-7 text-muted-foreground" />}
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
    <div className="px-2 space-y-6 sm:px-0">
      <div className="flex flex-col gap-2 sm:flex-row sm:gap-0 sm:justify-between sm:items-center">
        <div className="text-sm leading-relaxed text-muted-foreground">
          {totalItems} key pair{totalItems !== 1 ? "s" : ""} total
          {totalItems > 0 && (
            <>
              {" • "}
              Showing {Math.min(limit, totalItems)} of {totalItems}
            </>
          )}
        </div>
        <div className="flex gap-2 self-end ml-auto sm:self-auto">
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

      <div className="flex flex-col gap-4 items-stretch sm:flex-row sm:items-center">
        <div className="flex-1 max-w-full sm:max-w-md">
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
            <div className="p-8 text-center rounded-2xl border text-muted-foreground">
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
                      className="inline-flex gap-1 items-center py-0.5 px-2 text-xs"
                    >
                      {k.type === "ssh" ? (
                        <KeyIcon className="w-3.5 h-3.5" />
                      ) : k.type === "x509" ? (
                        <ShieldCheck className="w-3.5 h-3.5" />
                      ) : (
                        <KeyRound className="w-3.5 h-3.5" />
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
                          className="text-white rounded-full cursor-pointer"
                          onClick={(e) => {
                            e.stopPropagation();
                            setKeyToDelete({ name: k.name });
                            setDeleteDialogOpen(true);
                          }}
                          disabled={deleteMutation.isPending}
                          aria-label={`Delete ${k.name}`}
                        >
                          <Trash2 className="w-4 h-4" />
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
                <div className="mb-1 text-xs text-muted-foreground">
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
                  <div className="text-xs text-muted-foreground">Name</div>
                  <div className="mt-1 font-medium break-words">
                    {isLoadingDetails ? (
                      <Skeleton className="w-32 h-5" />
                    ) : (
                      selected?.name
                    )}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground">Type</div>
                  <div className="mt-1 font-medium break-words">
                    {isLoadingDetails ? (
                      <Skeleton className="w-24 h-5" />
                    ) : (
                      selected?.type
                    )}
                  </div>
                </div>
                <div className="sm:col-span-2">
                  <div className="text-xs text-muted-foreground">
                    Fingerprint
                  </div>
                  <div className="mt-1 font-mono text-xs break-all">
                    {isLoadingDetails ? (
                      <Skeleton className="w-48 h-4" />
                    ) : (
                      selected?.fingerprint
                    )}
                  </div>
                </div>
              </div>
              <div>
                <div className="mb-1 text-xs text-muted-foreground">
                  Public Key
                </div>
                {isLoadingDetails ? (
                  <div className="p-4 space-y-2 rounded-md bg-muted">
                    <Skeleton className="w-full h-4" />
                    <Skeleton className="w-5/6 h-4" />
                    <Skeleton className="w-4/5 h-4" />
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
                className="gap-1.5 rounded-full cursor-pointer"
              >
                <Link
                  href={`data:text/plain;charset=utf-8,${encodeURIComponent((generatedPrivateKey ?? "").trim() + "\n")}`}
                  download={`${selected?.name ?? "key"}`}
                  aria-label="Download private key"
                >
                  <Download className="w-4 h-4" />
                  <span>Download</span>
                </Link>
              </Button>
            ) : selected?.public_key ? (
              <Button
                asChild
                variant="default"
                size="sm"
                className="gap-1.5 rounded-full cursor-pointer"
              >
                <Link
                  href={`data:text/plain;charset=utf-8,${encodeURIComponent(selected?.public_key?.trim() + "\n")}`}
                  download={`${selected?.name || "key"}.pub`}
                  aria-label="Download public key"
                >
                  <Download className="w-4 h-4" />
                  <span>Download</span>
                </Link>
              </Button>
            ) : undefined}
            <Button
              variant="outline"
              size="sm"
              className="rounded-full cursor-pointer"
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
              <span className="font-semibold text-foreground">
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
