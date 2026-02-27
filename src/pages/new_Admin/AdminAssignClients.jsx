import { useEffect, useMemo, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { PaginationControls } from "@/components/ui/pagination-controls";
import { DataTable } from "@/components/common/DataTable";
import {
  Users,
  UserCheck,
  UserX,
  UserPlus,
  UserMinus,
  RefreshCcw,
  Briefcase,
  Search,
  Check,
  ChevronDown,
  X,
  Eye,
} from "lucide-react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import {
  useAssignClientMutation,
  useGetAllStaffQuery,
  useGetClientsWithAssignmentsQuery,
  useUnassignClientMutation,
} from "@/features/auth/authApi";

const DEFAULT_PAGE_SIZE = 10;
const CLIENT_FILTERS = [
  { label: "All Clients", value: "all" },
  { label: "Assigned", value: "assigned" },
  { label: "Unassigned", value: "unassigned" },
];

const getFullName = (firstName, lastName, fallback = "") => {
  const full = `${firstName || ""} ${lastName || ""}`.trim();
  return full || fallback;
};

export default function AdminAssignClients() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [staffFilter, setStaffFilter] = useState("all");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [sortField, setSortField] = useState("name");
  const [sortAsc, setSortAsc] = useState(true);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);

  const [assignModal, setAssignModal] = useState(null);
  const [selectedStaff, setSelectedStaff] = useState("");
  const [assignNotes, setAssignNotes] = useState("");

  const [unassignClient, setUnassignClient] = useState(null);
  const [clearFiltersOpen, setClearFiltersOpen] = useState(false);
  const apiFilters = useMemo(() => {
    const filters = {
      page,
      limit: pageSize,
      sortBy: sortField,
      sortOrder: sortAsc ? "asc" : "desc",
    };
    if (debouncedSearch) filters.search = debouncedSearch;
    if (filter !== "all") filters.assignment = filter;
    if (staffFilter !== "all") filters.staffId = staffFilter;
    return filters;
  }, [page, pageSize, sortField, sortAsc, debouncedSearch, filter, staffFilter]);

  const {
    data: assignmentsData,
    isLoading: assignmentsLoading,
    isFetching: assignmentsFetching,
    refetch: refetchAssignments,
  } = useGetClientsWithAssignmentsQuery(apiFilters);

  const { data: staffData, isLoading: staffLoading } = useGetAllStaffQuery();

  const [assignClient, { isLoading: assignLoading }] = useAssignClientMutation();
  const [unassignClientMutation, { isLoading: unassignLoading }] = useUnassignClientMutation();
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(timer);
  }, [search]);

  const staffMembers = useMemo(() => {
    const list = staffData?.data?.staffMembers || [];
    console.log("Staff Members:", list);
    return list
      .filter((member) => member.active)
      .map((member) => ({
        id: member._id,
        name: getFullName(member.first_name, member.last_name, member.email),
        email: member.email,
      }));
  }, [staffData]);

  const assignmentsPayload = assignmentsData?.data;
  const assignmentPagination = assignmentsPayload?.pagination || {};
  const isServerPaginated =
    Number.isFinite(assignmentPagination?.totalPages) &&
    Number.isFinite(assignmentPagination?.totalItems);

  const clients = useMemo(() => {
    const list = Array.isArray(assignmentsPayload)
      ? assignmentsPayload
      : Array.isArray(assignmentsPayload?.clients)
        ? assignmentsPayload.clients
        : Array.isArray(assignmentsPayload?.items)
          ? assignmentsPayload.items
          : Array.isArray(assignmentsPayload?.data)
            ? assignmentsPayload.data
            : [];
    return list.map((client) => ({
      id: client._id,
      name: getFullName(client.first_name, client.last_name, client.email),
      email: client.email || "-",
      assignedStaffId: client.assignedStaff?.staffId || null,
      assignedStaffName: client.assignedStaff?.staffName || null,
      status: client.active ? "active" : "inactive",
      raw: client,
    }));
  }, [assignmentsPayload]);

  const workload = useMemo(() => {
    return staffMembers.map((staff) => ({
      ...staff,
      count: clients.filter((client) => client.assignedStaffId === staff.id).length,
    }));
  }, [staffMembers, clients]);

  const maxWorkload = Math.max(...workload.map((w) => w.count), 1);

  const filtered = useMemo(() => {
    let result = [...clients];

    if (debouncedSearch) {
      const q = debouncedSearch.toLowerCase();
      result = result.filter((client) =>
        client.name.toLowerCase().includes(q) ||
        client.email.toLowerCase().includes(q)
      );
    }

    if (filter === "assigned") result = result.filter((client) => client.assignedStaffId);
    if (filter === "unassigned") result = result.filter((client) => !client.assignedStaffId);
    if (staffFilter !== "all") result = result.filter((client) => client.assignedStaffId === staffFilter);

    result.sort((a, b) => {
      const valA = String(a[sortField] || "").toLowerCase();
      const valB = String(b[sortField] || "").toLowerCase();
      return sortAsc ? valA.localeCompare(valB) : valB.localeCompare(valA);
    });

    return result;
  }, [clients, debouncedSearch, filter, staffFilter, sortField, sortAsc]);

  const totalPages = isServerPaginated
    ? Math.max(1, assignmentPagination.totalPages || 1)
    : Math.max(1, Math.ceil(filtered.length / pageSize));
  const paginated = useMemo(
    () => (isServerPaginated ? clients : filtered.slice((page - 1) * pageSize, page * pageSize)),
    [clients, filtered, isServerPaginated, page, pageSize],
  );

  useEffect(() => {
    if (page > totalPages) {
      setPage(totalPages);
    }
  }, [page, totalPages]);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, filter, staffFilter, pageSize, sortField, sortAsc]);

  const serverStats = assignmentsPayload?.stats || assignmentsData?.stats || {};
  const totalClients = serverStats.totalClients ?? (isServerPaginated ? assignmentPagination.totalItems || clients.length : clients.length);
  const assignedClients = serverStats.assignedClients ?? clients.filter((client) => client.assignedStaffId).length;
  const unassignedClients = serverStats.unassignedClients ?? Math.max(0, totalClients - assignedClients);
  const activeClientFilterLabel = CLIENT_FILTERS.find((item) => item.value === filter)?.label || "All Clients";
  const activeStaffFilterLabel = staffFilter === "all"
    ? "All Staff"
    : staffMembers.find((staff) => staff.id === staffFilter)?.name || "All Staff";
  const hasAnyFilter = filter !== "all" || staffFilter !== "all" || !!debouncedSearch;

  const handleSort = (field, dir) => {
    setSortField(field);
    setSortAsc(dir === "asc");
  };

  const handleAssign = async () => {
    if (!assignModal || !selectedStaff) return;

    try {
      const result = await assignClient({
        clientId: assignModal.id,
        staffId: selectedStaff,
        notes: assignNotes || undefined,
      }).unwrap();

      if (result?.success !== false) {
        toast.success(`${assignModal.name} assigned successfully`);
        setAssignModal(null);
        setSelectedStaff("");
        setAssignNotes("");
        await refetchAssignments();
      } else {
        toast.error(result?.message || "Failed to assign client");
      }
    } catch (error) {
      toast.error(error?.data?.message || "Failed to assign client");
    }
  };

  const handleUnassign = async () => {
    if (!unassignClient?.id || !unassignClient?.assignedStaffId) return;

    try {
      const result = await unassignClientMutation({
        clientId: unassignClient.id,
        staffId: unassignClient.assignedStaffId,
      }).unwrap();

      if (result?.success !== false) {
        toast.success(`${unassignClient.name} has been unassigned`);
        setUnassignClient(null);
        await refetchAssignments();
      } else {
        toast.error(result?.message || "Failed to unassign client");
      }
    } catch (error) {
      toast.error(error?.data?.message || "Failed to unassign client");
    }
  };

  const openAssignModal = (client) => {
    setAssignModal(client);
    setSelectedStaff(client.assignedStaffId || "");
    setAssignNotes("");
  };

  const handleClearAllFilters = () => {
    setSearch("");
    setDebouncedSearch("");
    setFilter("all");
    setStaffFilter("all");
    setPage(1);
    setClearFiltersOpen(false);
    toast.success("All filters cleared");
  };

  const stats = [
    { label: "Total Clients", value: totalClients, icon: Users, color: "text-primary" },
    { label: "Assigned", value: assignedClients, icon: UserCheck, color: "text-success" },
    { label: "Unassigned", value: unassignedClients, icon: UserX, color: "text-warning" },
    { label: "Total Staff", value: staffMembers.length, icon: Briefcase, color: "text-accent-foreground" },
  ];

  const loading = assignmentsLoading || assignmentsFetching || staffLoading;
  const columns = [
    {
      key: "name",
      label: "Client",
      sortable: true,
      render: (client) => (
        <div className="flex items-center gap-3">
          <Avatar className="h-8 w-8">
            <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
              {client.name
                .split(" ")
                .filter(Boolean)
                .slice(0, 2)
                .map((n) => n[0])
                .join("") || "U"}
            </AvatarFallback>
          </Avatar>
          <span className="font-medium text-foreground">{client.name}</span>
        </div>
      ),
    },
    {
      key: "email",
      label: "Email",
      sortable: true,
      render: (client) => <span className="text-sm text-muted-foreground">{client.email}</span>,
    },
    {
      key: "assignedStaffName",
      label: "Assigned Staff",
      sortable: true,
      render: (client) =>
        client.assignedStaffName ? (
          <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20 text-xs">
            {client.assignedStaffName}
          </Badge>
        ) : (
          <Badge variant="outline" className="bg-muted text-muted-foreground border-border text-xs">
            Unassigned
          </Badge>
        ),
    },
    {
      key: "status",
      label: "Status",
      sortable: true,
      render: (client) => (
        <Badge
          variant="outline"
          className={
            client.status === "active"
              ? "bg-success/15 text-success border-success/30 text-xs"
              : "bg-muted text-muted-foreground border-border text-xs"
          }
        >
          {client.status === "active" ? "Active" : "Inactive"}
        </Badge>
      ),
    },
    {
      key: "actions",
      label: "Actions",
      render: (client) => (
        <div className=" flex w-[40px] items-center justify-end gap-2">
          <div className="flex h-8 w-8 items-center justify-center">
            {client.assignedStaffId ? (
              <Button
                size="icon"
                variant="outline"
                className="h-8 w-8"
                onClick={() => openAssignModal(client)}
                title="Reassign"
                aria-label="Reassign"
              >
                <RefreshCcw className="h-3.5 w-3.5" />
              </Button>
            ) : (
              <span className="h-8 w-8" aria-hidden="true" />
            )}
          </div>
          <div className="flex h-8 w-8 items-center justify-center">
            {!client.assignedStaffId ? (
              <Button
                size="icon"
                className="h-8 w-8"
                onClick={() => openAssignModal(client)}
                title="Assign"
                aria-label="Assign"
              >
                <UserPlus className="h-3.5 w-3.5" />
              </Button>
            ) : (
              <Button
                size="icon"
                variant="destructive"
                className="h-8 w-8"
                onClick={() => setUnassignClient(client)}
                disabled={unassignLoading}
                title="Unassign"
                aria-label="Unassign"
              >
                <UserMinus className="h-3.5 w-3.5" />
              </Button>
            )}
          </div>
          <div className="flex h-8 w-8 items-center justify-center">
            <Button
              size="icon"
              variant="ghost"
              className="h-8 w-8"
              onClick={() => navigate(`/admin/clients/${client.id}`)}
              title="View Client"
            >
              <Eye className="h-4 w-4" />
            </Button>
          </div>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Clients</h1>
        <p className="text-sm text-muted-foreground">View and manage client.</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <Card key={stat.label} className="bg-card border-border">
            <CardContent className="p-5 flex items-center gap-4">
              <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center shrink-0">
                <stat.icon className={`h-5 w-5 ${stat.color}`} />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                <p className="text-xs text-muted-foreground">{stat.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="flex flex-col xl:flex-row gap-6">
        <div className="flex-1 min-w-0 space-y-4">
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative flex-1 min-w-[200px] max-w-xs">
              {/* <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" /> */}
              <Input
                placeholder="Search name or email..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                className="pl-9"
              />
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant={filter !== "all" ? "default" : "outline"}
                  className={cn(
                    "h-10 gap-2",
                    filter !== "all"
                      ? "border-primary bg-primary text-primary-foreground hover:bg-primary/90"
                      : "border-border text-foreground hover:bg-accent"
                  )}
                >
                  <span>{activeClientFilterLabel}</span>
                  <ChevronDown className="h-3.5 w-3.5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="bg-popover z-50 min-w-[180px]">
                {CLIENT_FILTERS.map((item) => (
                  <DropdownMenuItem
                    key={item.value}
                    onClick={() => {
                      setFilter(item.value);
                      setPage(1);
                    }}
                    className="flex items-center justify-between"
                  >
                    <span>{item.label}</span>
                    {filter === item.value && <Check className="h-3.5 w-3.5 text-primary" />}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant={staffFilter !== "all" ? "default" : "outline"}
                  className={cn(
                    "h-10 gap-2",
                    staffFilter !== "all"
                      ? "border-primary bg-primary text-primary-foreground hover:bg-primary/90"
                      : "border-border text-foreground hover:bg-accent"
                  )}
                >
                  <span>{activeStaffFilterLabel}</span>
                  <ChevronDown className="h-3.5 w-3.5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="bg-popover z-50 min-w-[180px]">
                <DropdownMenuItem
                  onClick={() => {
                    setStaffFilter("all");
                    setPage(1);
                  }}
                  className="flex items-center justify-between"
                >
                  <span>All Staff</span>
                  {staffFilter === "all" && <Check className="h-3.5 w-3.5 text-primary" />}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                {staffMembers.map((staff) => (
                  <DropdownMenuItem
                    key={staff.id}
                    onClick={() => {
                      setStaffFilter(staff.id);
                      setPage(1);
                    }}
                    className="flex items-center justify-between"
                  >
                    <span>{staff.name}</span>
                    {staffFilter === staff.id && <Check className="h-3.5 w-3.5 text-primary" />}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {hasAnyFilter && (
              <Button
                variant="ghost"
                size="sm"
                className="h-10 gap-1.5 text-muted-foreground hover:text-destructive"
                onClick={() => setClearFiltersOpen(true)}
              >
                <X className="h-3.5 w-3.5" />
                Clear All
              </Button>
            )}
          </div>

          <DataTable
            data={paginated}
            columns={columns}
            onSort={handleSort}
            loading={loading}
            emptyMessage="No clients found"
            emptyDescription="Try adjusting your search or filters."
            getRowId={(row) => row.id}
          />

          <PaginationControls
            page={page}
            totalPages={totalPages}
            totalItems={isServerPaginated ? totalClients : filtered.length}
            pageSize={pageSize}
            onPageChange={setPage}
            onPageSizeChange={setPageSize}
          />
        </div>

        <div className="w-full xl:w-72 shrink-0 space-y-4">
          <Card className="bg-card border-border">
            <CardContent className="p-5 space-y-4">
              <h3 className="text-sm font-semibold text-foreground">Staff Workload</h3>
              {workload.map((staff) => (
                <button
                  key={staff.id}
                  onClick={() => {
                    setStaffFilter((prev) => (prev === staff.id ? "all" : staff.id));
                    setPage(1);
                  }}
                  className={`w-full text-left p-3 rounded-lg transition-colors ${
                    staffFilter === staff.id
                      ? "bg-primary/10 border border-primary/20"
                      : "hover:bg-muted/50"
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-foreground">{staff.name}</span>
                    <span className="text-xs text-muted-foreground">{staff.count} clients</span>
                  </div>
                  <Progress value={(staff.count / maxWorkload) * 100} className="h-2" />
                </button>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>

      <Dialog open={!!assignModal} onOpenChange={(open) => !open && setAssignModal(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{assignModal?.assignedStaffName ? "Reassign Client" : "Assign Client"}</DialogTitle>
            <DialogDescription>
              {assignModal?.assignedStaffName
                ? `Reassign ${assignModal.name} to a different staff member.`
                : `Select a staff member to assign ${assignModal?.name} to.`}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <Label className="text-xs text-muted-foreground">Client</Label>
              <p className="text-sm font-medium text-foreground mt-1">
                {assignModal?.name}
              </p>
            </div>
            <div className="space-y-1.5">
              <Label>Assign to Staff</Label>
              <Select value={selectedStaff} onValueChange={setSelectedStaff}>
                <SelectTrigger>
                  <SelectValue placeholder="Select staff member" />
                </SelectTrigger>
                <SelectContent className="bg-popover z-50">
                  {workload.map((staff) => (
                    <SelectItem key={staff.id} value={staff.id}>
                      {staff.name} ({staff.count} clients)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>
                Notes <span className="text-muted-foreground">(optional)</span>
              </Label>
              <Textarea
                placeholder="Add any notes about this assignment..."
                value={assignNotes}
                onChange={(e) => setAssignNotes(e.target.value)}
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAssignModal(null)}>
              Cancel
            </Button>
            <Button onClick={handleAssign} disabled={!selectedStaff || assignLoading}>
              {assignLoading ? "Assigning..." : "Confirm Assignment"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={!!unassignClient}
        onOpenChange={(open) => !open && setUnassignClient(null)}
        title="Unassign Client"
        description={
          <>
            Are you sure you want to unassign <strong>{unassignClient?.name}</strong> from <strong>{unassignClient?.assignedStaffName}</strong>? The client will be marked as unassigned.
          </>
        }
        confirmLabel="Confirm Unassign"
        variant="destructive"
        onConfirm={handleUnassign}
      />

      <ConfirmDialog
        open={clearFiltersOpen}
        onOpenChange={setClearFiltersOpen}
        title="Clear All Filters?"
        description="This will reset the search and all client/staff filters."
        confirmLabel="Clear All"
        variant="destructive"
        onConfirm={handleClearAllFilters}
      />
    </div>
  );
}
