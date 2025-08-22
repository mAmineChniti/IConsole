"use client";

import { ConfirmDeleteDialog } from "@/components/ConfirmDeleteDialog";
import { EmptyState } from "@/components/EmptyState";
import { ErrorCard } from "@/components/ErrorCard";
import { HeaderActions } from "@/components/HeaderActions";
import { SecurityGroupCreateDialog } from "@/components/SecurityGroupCreateDialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { XSearch } from "@/components/XSearch";
import { SecurityGroupService } from "@/lib/requests";
import type {
  SecurityGroupDeleteRequest,
  SecurityGroupRuleCreateRequest,
  SecurityGroupRuleDeleteRequest,
  SecurityGroupUpdateRequest,
} from "@/types/RequestInterfaces";
import {
  SecurityGroupRuleCreateRequestSchema,
  SecurityGroupUpdateRequestSchema,
} from "@/types/RequestSchemas";
import type {
  SecurityGroup,
  SecurityGroupListResponse,
  SecurityGroupRule,
  SecurityGroupRuleListResponse,
} from "@/types/ResponseInterfaces";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Edit2,
  Loader2,
  Plus,
  Save,
  ShieldCheck,
  Trash2,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

export function SecurityGroups() {
  const queryClient = useQueryClient();

  const [visibleCount, setVisibleCount] = useState(6);
  const [search, setSearch] = useState("");

  const [createOpen, setCreateOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [rulesOpen, setRulesOpen] = useState(false);
  const [addRuleOpen, setAddRuleOpen] = useState(false);

  const [selectedGroup, setSelectedGroup] = useState<SecurityGroup | undefined>(
    undefined,
  );
  const [groupToDelete, setGroupToDelete] = useState<SecurityGroup | undefined>(
    undefined,
  );
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const [ruleDeleteOpen, setRuleDeleteOpen] = useState(false);
  const [ruleToDelete, setRuleToDelete] = useState<string | undefined>(
    undefined,
  );
  useEffect(() => {
    if (!deleteDialogOpen) setGroupToDelete(undefined);
  }, [deleteDialogOpen]);
  useEffect(() => {
    if (!ruleDeleteOpen) setRuleToDelete(undefined);
  }, [ruleDeleteOpen]);
  // Reset pagination on search change
  useEffect(() => {
    setVisibleCount(6);
  }, [search]);

  const { data, isLoading, error, isFetching, refetch } =
    useQuery<SecurityGroupListResponse>({
      queryKey: ["security-groups"],
      queryFn: () => SecurityGroupService.list(),
      staleTime: 60_000,
    });
  const groups = data ?? [];

  // Client-side filtering by name/description
  const q = search.trim().toLowerCase();
  const filtered = q
    ? groups.filter((g) =>
        [g.Name, g.Description].some((v) =>
          (v ?? "").toString().toLowerCase().includes(q),
        ),
      )
    : groups;
  const totalItems = filtered.length;
  const visible = filtered.slice(0, visibleCount);
  const hasMore = visibleCount < totalItems;

  // create dialog handled by SecurityGroupCreateDialog

  const editForm = useForm<SecurityGroupUpdateRequest>({
    resolver: zodResolver(SecurityGroupUpdateRequestSchema),
    defaultValues: { name: "", description: "" },
  });
  const updateMutation = useMutation({
    mutationFn: (vars: { id: string; data: SecurityGroupUpdateRequest }) =>
      SecurityGroupService.update(vars.data, vars.id),
    onSuccess: async () => {
      toast.success("Security group updated");
      setEditOpen(false);
      setSelectedGroup(undefined);
      await queryClient.invalidateQueries({ queryKey: ["security-groups"] });
    },
    onError: (err: unknown) => {
      const msg =
        err instanceof Error
          ? err.message
          : typeof err === "string"
            ? err
            : "An unexpected error occurred";
      toast.error(msg);
    },
  });
  const openEdit = (g: SecurityGroup) => {
    setSelectedGroup(g);
    editForm.reset({ name: g.Name, description: g.Description ?? "" });
    setEditOpen(true);
  };
  const handleEdit = editForm.handleSubmit((vals) => {
    if (!selectedGroup) return;
    updateMutation.mutate({
      id: selectedGroup["Security Group ID"],
      data: vals,
    });
  });

  const deleteMutation = useMutation({
    mutationFn: (payload: SecurityGroupDeleteRequest) =>
      SecurityGroupService.delete(payload),
    onSuccess: async () => {
      toast.success("Security group deleted");
      setDeleteDialogOpen(false);
      await queryClient.invalidateQueries({ queryKey: ["security-groups"] });
    },
    onError: (err: unknown) => {
      const msg =
        err instanceof Error
          ? err.message
          : typeof err === "string"
            ? err
            : "An unexpected error occurred";
      toast.error(msg);
    },
  });

  const { data: rules, isLoading: rulesLoading } =
    useQuery<SecurityGroupRuleListResponse>({
      queryKey: [
        "security-group",
        selectedGroup?.["Security Group ID"],
        "rules",
      ],
      queryFn: ({ queryKey: [, groupId] }) =>
        SecurityGroupService.listRules(groupId as string),
      enabled: rulesOpen && !!selectedGroup?.["Security Group ID"],
      staleTime: 30_000,
    });

  const RuleCountBadge = ({ groupId }: { groupId: string }) => {
    const { data: count, isLoading: loading } = useQuery<
      SecurityGroupRuleListResponse,
      Error,
      number
    >({
      queryKey: ["security-group", groupId, "rules-count"],
      queryFn: () => SecurityGroupService.listRules(groupId),
      select: (res) => res?.Rules?.length ?? 0,
      staleTime: 30_000,
    });
    return <Badge variant="secondary">{loading ? "…" : count}</Badge>;
  };

  const ruleForm = useForm<SecurityGroupRuleCreateRequest>({
    resolver: zodResolver(SecurityGroupRuleCreateRequestSchema),
    defaultValues: {
      security_group_id: "",
      direction: "ingress",
      ethertype: "IPv4",
      protocol: "SSH",
      port_range_min: 22,
      port_range_max: 22,
      remote_ip_prefix: "0.0.0.0/0",
    },
  });
  const addRuleMutation = useMutation({
    mutationFn: (
      payload: SecurityGroupRuleCreateRequest & { security_group_id: string },
    ) => SecurityGroupService.addRule(payload, payload.security_group_id),
    onSuccess: async () => {
      toast.success("Rule added");
      if (selectedGroup) {
        await queryClient.invalidateQueries({
          queryKey: [
            "security-group",
            selectedGroup["Security Group ID"],
            "rules",
          ],
        });
        await queryClient.invalidateQueries({
          queryKey: [
            "security-group",
            selectedGroup["Security Group ID"],
            "rules-count",
          ],
        });
      }
      setAddRuleOpen(false);
    },
    onError: (err: unknown) => {
      const msg =
        err instanceof Error
          ? err.message
          : typeof err === "string"
            ? err
            : "An unexpected error occurred";
      toast.error(msg);
    },
  });
  const handleAddRule = ruleForm.handleSubmit((vals) => {
    if (!selectedGroup) return;
    addRuleMutation.mutate({
      ...vals,
      security_group_id: selectedGroup["Security Group ID"],
    });
  });

  const deleteRuleMutation = useMutation({
    mutationFn: (payload: SecurityGroupRuleDeleteRequest) =>
      SecurityGroupService.deleteRule(payload),
    onSuccess: async () => {
      toast.success("Rule deleted");
      if (selectedGroup) {
        await queryClient.invalidateQueries({
          queryKey: [
            "security-group",
            selectedGroup["Security Group ID"],
            "rules",
          ],
        });
        await queryClient.invalidateQueries({
          queryKey: [
            "security-group",
            selectedGroup["Security Group ID"],
            "rules-count",
          ],
        });
      }
      setRuleDeleteOpen(false);
      setRuleToDelete(undefined);
    },
    onError: (err: unknown) => {
      const msg =
        err instanceof Error
          ? err.message
          : typeof err === "string"
            ? err
            : "An unexpected error occurred";
      toast.error(msg);
    },
  });

  if (isLoading) {
    return (
      <div className="px-2 space-y-6 sm:px-0">
        <div className="flex justify-between items-center">
          <Skeleton className="w-40 h-4" />
          <Skeleton className="w-40 h-9 rounded-full" />
        </div>
        <div className="overflow-x-auto w-full">
          <Table className="w-full table-fixed">
            <TableHeader>
              <TableRow>
                <TableHead className="py-3">Name</TableHead>
                <TableHead className="py-3">Description</TableHead>
                <TableHead className="py-3 w-32">Rules</TableHead>
                <TableHead className="py-3 w-40">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {Array.from({ length: 6 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell className="py-3">
                    <Skeleton className="w-24 h-4" />
                  </TableCell>
                  <TableCell className="py-3">
                    <Skeleton className="w-48 h-4" />
                  </TableCell>
                  <TableCell className="py-3">
                    <Skeleton className="w-10 h-4" />
                  </TableCell>
                  <TableCell className="py-3">
                    <Skeleton className="w-24 h-8" />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    );
  }

  if (!groups || groups.length === 0) {
    return (
      <>
        <EmptyState
          title="No security groups"
          text="Create a new security group to define inbound/outbound rules."
          onRefresh={() => refetch()}
          refreshing={isFetching}
          icon={<ShieldCheck className="w-7 h-7 text-muted-foreground" />}
          variant="dashed"
          primaryActions={[
            {
              label: "New Group",
              onClick: () => setCreateOpen(true),
              icon: <Plus />,
            },
          ]}
        />
        <SecurityGroupCreateDialog
          open={createOpen}
          onOpenChange={setCreateOpen}
        />
      </>
    );
  }

  if (error) {
    return (
      <ErrorCard
        title="Failed to Load Security Groups"
        message={error?.message || "Unable to fetch security groups."}
        onRetry={() => refetch()}
        isRetrying={isFetching}
      />
    );
  }

  return (
    <div className="px-2 space-y-6 sm:px-0">
      <div className="flex flex-col gap-2 sm:flex-row sm:gap-0 sm:justify-between sm:items-center">
        <div className="text-sm leading-relaxed text-muted-foreground">
          {totalItems} group{totalItems !== 1 ? "s" : ""} total
          {totalItems > 0 && (
            <>
              {" • "}
              Showing {Math.min(visibleCount, totalItems)} of {totalItems}
            </>
          )}
        </div>
        <div className="flex gap-2">
          <HeaderActions
            onRefresh={() => refetch()}
            isRefreshing={isFetching}
            refreshTooltip="Refresh groups"
            mainButtons={[
              {
                label: "New Group",
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
            placeholder="Search security groups..."
            aria-label="Search security groups"
          />
        </div>
      </div>
      <SecurityGroupCreateDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
      />

      {totalItems === 0 ? (
        <div className="p-8 text-center rounded-2xl border text-muted-foreground">
          No security groups match your search.
        </div>
      ) : (
        <div className="overflow-x-auto w-full">
          <Table className="w-full table-fixed">
            <TableHeader>
              <TableRow>
                <TableHead className="py-3 w-1/5">Name</TableHead>
                <TableHead className="py-3">Description</TableHead>
                <TableHead className="py-3 w-24">Rules</TableHead>
                <TableHead className="py-3 w-1/4">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {visible.map((g) => (
                <TableRow key={g["Security Group ID"]}>
                  <TableCell className="py-3 font-medium">{g.Name}</TableCell>
                  <TableCell className="py-3 text-muted-foreground">
                    {g.Description || "—"}
                  </TableCell>
                  <TableCell className="py-3">
                    <RuleCountBadge groupId={g["Security Group ID"]} />
                  </TableCell>
                  <TableCell className="py-3">
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="rounded-full cursor-pointer"
                        onClick={() => {
                          setSelectedGroup(g);
                          setRulesOpen(true);
                        }}
                      >
                        View Rules
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="rounded-full cursor-pointer"
                        onClick={() => {
                          setSelectedGroup(g);

                          ruleForm.reset({
                            security_group_id: g["Security Group ID"],
                            direction: "ingress",
                            ethertype: "IPv4",
                            protocol: "SSH",
                            port_range_min: 22,
                            port_range_max: 22,
                            remote_ip_prefix: "0.0.0.0/0",
                          });
                          setAddRuleOpen(true);
                        }}
                      >
                        Add Rule
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        className="rounded-full cursor-pointer"
                        onClick={() => openEdit(g)}
                      >
                        <Edit2 className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="destructive"
                        size="icon"
                        className="text-white rounded-full cursor-pointer"
                        onClick={() => {
                          setGroupToDelete(g);
                          setDeleteDialogOpen(true);
                        }}
                        disabled={deleteMutation.isPending}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {groups.length > 0 && (
        <div className="flex justify-center px-4 sm:px-0">
          <Button
            variant="outline"
            className="rounded-full cursor-pointer"
            disabled={!hasMore}
            onClick={() => setVisibleCount((p) => p + 6)}
          >
            {hasMore
              ? `Show More (${Math.min(6, totalItems - visibleCount)} more)`
              : "All loaded"}
          </Button>
        </div>
      )}

      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="mx-4 sm:mx-0 max-w-[calc(100vw-2rem)] sm:max-w-md bg-card text-card-foreground border border-border/50 shadow-lg left-1/2 translate-x-[-50%] rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold truncate">
              Edit Security Group
            </DialogTitle>
          </DialogHeader>
          <Form {...editForm}>
            <form onSubmit={handleEdit} className="space-y-4">
              <FormField
                control={editForm.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="web-sg"
                        className="w-full h-10 rounded-full"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={editForm.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Optional description"
                        className="w-full h-10 rounded-full"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
                <Button
                  type="button"
                  variant="outline"
                  className="gap-2 rounded-full cursor-pointer"
                  onClick={() => setEditOpen(false)}
                  disabled={updateMutation.isPending}
                >
                  <X className="w-4 h-4" />
                  <span>Cancel</span>
                </Button>
                <Button
                  type="submit"
                  variant="default"
                  className="gap-2 rounded-full cursor-pointer min-w-[120px]"
                  disabled={updateMutation.isPending}
                >
                  {updateMutation.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      <span>Save</span>
                    </>
                  )}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <Dialog
        open={addRuleOpen}
        onOpenChange={(open) => {
          setAddRuleOpen(open);
          if (!open) return;
          if (selectedGroup) {
            ruleForm.reset({
              security_group_id: selectedGroup["Security Group ID"],
              direction: "ingress",
              ethertype: "IPv4",
              protocol: "SSH",
              port_range_min: 22,
              port_range_max: 22,
              remote_ip_prefix: "0.0.0.0/0",
            });
          }
        }}
      >
        <DialogContent className="mx-4 sm:mx-0 max-w-[calc(100vw-2rem)] sm:max-w-md bg-card text-card-foreground border border-border/50 shadow-lg left-1/2 translate-x-[-50%] rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold truncate">
              {selectedGroup ? `Add Rule • ${selectedGroup.Name}` : "Add Rule"}
            </DialogTitle>
          </DialogHeader>
          <Card className="border-border/50">
            <CardContent className="pt-6 space-y-4">
              <Form {...ruleForm}>
                <form
                  onSubmit={handleAddRule}
                  className="grid grid-cols-1 gap-3 items-end sm:grid-cols-2"
                >
                  <FormField
                    control={ruleForm.control}
                    name="direction"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Direction</FormLabel>
                        <FormControl>
                          <Select
                            value={field.value}
                            onValueChange={field.onChange}
                          >
                            <SelectTrigger className="w-full h-10 rounded-full cursor-pointer">
                              <SelectValue placeholder="Direction" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="ingress">Ingress</SelectItem>
                              <SelectItem value="egress">Egress</SelectItem>
                            </SelectContent>
                          </Select>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={ruleForm.control}
                    name="ethertype"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Ethertype</FormLabel>
                        <FormControl>
                          <Select
                            value={field.value}
                            onValueChange={field.onChange}
                          >
                            <SelectTrigger className="w-full h-10 rounded-full cursor-pointer">
                              <SelectValue placeholder="IP Version" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="IPv4">IPv4</SelectItem>
                              <SelectItem value="IPv6">IPv6</SelectItem>
                            </SelectContent>
                          </Select>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={ruleForm.control}
                    name="protocol"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Protocol</FormLabel>
                        <FormControl>
                          <Select
                            value={field.value}
                            onValueChange={field.onChange}
                          >
                            <SelectTrigger className="w-full h-10 rounded-full cursor-pointer">
                              <SelectValue placeholder="Select protocol" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="TCP personnalisé">
                                TCP personnalisé
                              </SelectItem>
                              <SelectItem value="UDP personnalisé">
                                UDP personnalisé
                              </SelectItem>
                              <SelectItem value="ICMP personnalisé">
                                ICMP personnalisé
                              </SelectItem>
                              <SelectItem value="Autre protocole">
                                Autre protocole
                              </SelectItem>
                              <SelectItem value="Tout ICMP">
                                Tout ICMP
                              </SelectItem>
                              <SelectItem value="Tout TCP">Tout TCP</SelectItem>
                              <SelectItem value="Tout UDP">Tout UDP</SelectItem>
                              <SelectItem value="DNS">DNS</SelectItem>
                              <SelectItem value="HTTPS">HTTPS</SelectItem>
                              <SelectItem value="IMAP">IMAP</SelectItem>
                              <SelectItem value="IMAPS">IMAPS</SelectItem>
                              <SelectItem value="LDAP">LDAP</SelectItem>
                              <SelectItem value="MS SQL">MS SQL</SelectItem>
                              <SelectItem value="MySQL">MySQL</SelectItem>
                              <SelectItem value="POP3">POP3</SelectItem>
                              <SelectItem value="POP3S">POP3S</SelectItem>
                              <SelectItem value="RDP">RDP</SelectItem>
                              <SelectItem value="SMTP">SMTP</SelectItem>
                              <SelectItem value="SMTPS">SMTPS</SelectItem>
                              <SelectItem value="SSH">SSH</SelectItem>
                            </SelectContent>
                          </Select>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={ruleForm.control}
                    name="port_range_min"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Port Min</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            className="w-full h-10 rounded-full"
                            value={field.value ?? ""}
                            onChange={(e) => {
                              const v = e.target.value;
                              field.onChange(v === "" ? undefined : Number(v));
                            }}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={ruleForm.control}
                    name="port_range_max"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Port Max</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            className="w-full h-10 rounded-full"
                            value={field.value ?? ""}
                            onChange={(e) => {
                              const v = e.target.value;
                              field.onChange(v === "" ? undefined : Number(v));
                            }}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={ruleForm.control}
                    name="remote_ip_prefix"
                    render={({ field }) => (
                      <FormItem className="sm:col-span-2">
                        <FormLabel>Remote CIDR</FormLabel>
                        <FormControl>
                          <Input
                            className="w-full h-10 rounded-full"
                            placeholder="0.0.0.0/0"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="flex justify-end sm:col-span-2">
                    <Button
                      type="submit"
                      variant="default"
                      className="gap-2 rounded-full cursor-pointer min-w-[120px]"
                      disabled={addRuleMutation.isPending}
                    >
                      {addRuleMutation.isPending ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>Adding...</span>
                        </>
                      ) : (
                        <>
                          <Plus className="w-4 h-4" />
                          <span>Add Rule</span>
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        </DialogContent>
      </Dialog>

      <Dialog
        open={rulesOpen}
        onOpenChange={(open) => {
          setRulesOpen(open);
          if (!open) {
            setSelectedGroup(undefined);
          }
        }}
      >
        <DialogContent className="mx-4 sm:mx-0 max-w-[calc(100vw-2rem)] sm:max-w-2xl bg-card text-card-foreground border border-border/50 shadow-lg left-1/2 translate-x-[-50%] rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold truncate">
              {selectedGroup ? `Rules • ${selectedGroup.Name}` : "Rules"}
            </DialogTitle>
          </DialogHeader>

          <div className="overflow-x-auto w-full">
            <Table className="mt-4 w-full table-fixed">
              <TableHeader>
                <TableRow>
                  <TableHead className="py-3">Direction</TableHead>
                  <TableHead className="py-3">Ether</TableHead>
                  <TableHead className="py-3">Protocol</TableHead>
                  <TableHead className="py-3">Port Range</TableHead>
                  <TableHead className="py-3">CIDR</TableHead>
                  <TableHead className="py-3 w-24">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(rules?.Rules ?? []).map((r: SecurityGroupRule) => (
                  <TableRow key={r.ID}>
                    <TableCell className="py-3">{r.Direction}</TableCell>
                    <TableCell className="py-3">{r["Ether Type"]}</TableCell>
                    <TableCell className="py-3">{r["IP Protocol"]}</TableCell>
                    <TableCell className="py-3">{r["Port Range"]}</TableCell>
                    <TableCell className="py-3">
                      {r["Remote IP Prefix"]}
                    </TableCell>
                    <TableCell className="py-3">
                      <Button
                        variant="destructive"
                        size="icon"
                        className="text-white rounded-full cursor-pointer"
                        onClick={() => {
                          setRuleToDelete(r.ID);
                          setRuleDeleteOpen(true);
                        }}
                        disabled={deleteRuleMutation.isPending}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                {rulesLoading && (
                  <TableRow>
                    <TableCell colSpan={6}>
                      <div className="flex gap-2 items-center text-sm text-muted-foreground">
                        <Loader2 className="w-4 h-4 animate-spin" /> Loading
                        rules...
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </DialogContent>
      </Dialog>

      <ConfirmDeleteDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Delete Security Group"
        description={
          <>
            Are you sure you want to delete this security group{" "}
            <span className="font-semibold text-foreground">
              {groupToDelete?.Name}
            </span>
            ? This action cannot be undone.
          </>
        }
        confirmLabel="Delete"
        cancelLabel="Cancel"
        confirming={deleteMutation.isPending}
        onConfirm={() =>
          groupToDelete &&
          deleteMutation.mutate({
            security_group_id: groupToDelete["Security Group ID"],
          })
        }
      />

      <ConfirmDeleteDialog
        open={ruleDeleteOpen}
        onOpenChange={setRuleDeleteOpen}
        title="Delete Rule"
        description="Are you sure you want to delete this security group rule? This action cannot be undone."
        confirmLabel="Delete"
        cancelLabel="Cancel"
        confirming={deleteRuleMutation.isPending}
        onConfirm={() =>
          ruleToDelete && deleteRuleMutation.mutate({ rule_id: ruleToDelete })
        }
      />
    </div>
  );
}
