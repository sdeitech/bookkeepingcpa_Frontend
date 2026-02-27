import { useGetAllStaffQuery } from "@/features/user/userApi";
import { useDeactivateStaffMutation, useReactivateStaffMutation } from "@/features/auth/authApi";
import { useTasks } from "@/hooks/useTasks";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Plus, Loader2, UserX, ChevronDown, Check, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { DataTable } from "@/components/common/DataTable";
import { PaginationControls } from "@/components/ui/pagination-controls";
import StaffInviteModal from "@/components/new_Admin/StaffInviteModal";
import { useNavigate } from "react-router-dom";


const STATUS_FILTERS = [
  { label: "All Status", value: "all" },
  { label: "Active", value: "active" },
  { label: "Invite Pending", value: "invite_pending" },
  { label: "Invite Expired", value: "invite_expired" },
  { label: "Deactivated", value: "deactivated" },
];

const ASSIGNMENT_FILTERS = [
  { label: "All Staff", value: "all" },
  { label: "Assigned", value: "assigned" },
  { label: "Unassigned", value: "unassigned" },
];

const statusMeta = {
  active: { label: "Active", color: "green" },
  invite_pending: { label: "Invite Pending", color: "orange" },
  invite_expired: { label: "Invite Expired", color: "red" },
  deactivated: { label: "Deactivated", color: "gray" },
};

const statusBadgeClass = {
  green: "bg-success/15 text-success border-success/30",
  orange: "bg-orange-100 text-orange-700 border-orange-200",
  red: "bg-destructive/15 text-destructive border-destructive/30",
  gray: "bg-muted text-muted-foreground border-muted",
};

const DEFAULT_PAGE_SIZE = 10;

export default function AdminStaff() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [assignmentFilter, setAssignmentFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
  const [sortField, setSortField] = useState("name");
  const [sortAsc, setSortAsc] = useState(true);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [inviteMode, setInviteMode] = useState("new");
  const [selectedStaffForInvite, setSelectedStaffForInvite] = useState(null);
  const apiFilters = useMemo(() => {
    const filters = {
      page,
      limit: pageSize,
      sortBy: sortField,
      sortOrder: sortAsc ? "asc" : "desc",
    };
    if (debouncedSearch) filters.search = debouncedSearch;
    if (statusFilter !== "all") filters.status = statusFilter;
    if (assignmentFilter !== "all") filters.assignment = assignmentFilter;
    return filters;
  }, [page, pageSize, sortField, sortAsc, debouncedSearch, statusFilter, assignmentFilter]);

  const { data: staffData, isLoading, error, refetch } = useGetAllStaffQuery(apiFilters);
  const [deactivateStaff] = useDeactivateStaffMutation();
  const [reactivateStaff] = useReactivateStaffMutation();
  const { tasks } = useTasks();

  const staffPayload = staffData?.data || {};
  const pagination = staffPayload?.pagination || {};
  const isServerPaginated = Number.isFinite(pagination?.totalPages) && Number.isFinite(pagination?.totalItems);
  const staffMembers = Array.isArray(staffPayload?.staffMembers) ? staffPayload.staffMembers : [];


  const getAccessStatus = (staff) => staff?.staffAccessStatus || "unknown";

  const getAssignedCount = (staffId) =>
    new Set(tasks.filter((t) => t.staffId === staffId).map((t) => t.clientId)).size;

  const tableData = useMemo(
    () =>
      staffMembers.map((staff) => ({
        ...staff,
        fullName: `${staff.first_name || ""} ${staff.last_name || ""}`.trim() || "Unnamed Staff",
        assignedCount: staff.assignedCount ?? getAssignedCount(staff._id),
        staffAccessStatus: getAccessStatus(staff),
        statusLabel: statusMeta[getAccessStatus(staff)]?.label || "Unknown",
        statusColor: statusMeta[getAccessStatus(staff)]?.color || "gray",
      })),
    [staffMembers, tasks],
  );
  const totalPages = isServerPaginated ? pagination.totalPages : Math.max(1, Math.ceil(tableData.length / pageSize));
  const paginatedData = useMemo(
    () => (isServerPaginated ? tableData : tableData.slice((page - 1) * pageSize, page * pageSize)),
    [tableData, page, pageSize, isServerPaginated],
  );

  const activeStatusLabel = STATUS_FILTERS.find((item) => item.value === statusFilter)?.label || "All Status";
  const activeAssignmentLabel =
    ASSIGNMENT_FILTERS.find((item) => item.value === assignmentFilter)?.label || "All Staff";
  const hasAnyFilter = !!search || statusFilter !== "all" || assignmentFilter !== "all";

  const clearAllFilters = () => {
    setSearch("");
    setDebouncedSearch("");
    setStatusFilter("all");
    setAssignmentFilter("all");
    setSortField("name");
    setSortAsc(true);
    setPage(1);
  };

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, statusFilter, assignmentFilter, pageSize, sortField, sortAsc]);

  useEffect(() => {
    if (page > totalPages) {
      setPage(totalPages);
    }
  }, [page, totalPages]);

  const openInviteModal = (staff = null, modeOverride = null) => {
    setInviteMode(modeOverride || (staff ? "resend" : "new"));
    setSelectedStaffForInvite(staff);
    setIsInviteModalOpen(true);
  };

  const getRowActions = (row) => {
    const actions = [
      { label: "View", value: "view" },
      { label: "Edit", value: "edit" },
    ];

    if (row.staffAccessStatus === "invite_pending" || row.staffAccessStatus === "invite_expired") {
      if (row.staffAccessStatus === "invite_expired") {
        actions.push({ label: "Send Invite", value: "send_invite" });
      }
    } else if (row.staffAccessStatus === "active") {
      actions.push({ label: "Deactivate", value: "deactivate", variant: "destructive" });
    } else if (row.staffAccessStatus === "deactivated") {
      actions.push({ label: "Reactivate", value: "reactivate" });
    }

    return actions;
  };

  const handleStaffAction = async (action, row) => {
    if (action === "view") {
      navigate(`/admin/staff/${row._id}`);
      return;
    }
    if (action === "edit") {
      toast.info("Edit staff coming soon");
      return;
    }

    if (action === "send_invite") {
      openInviteModal(row, "new");
      return;
    }

    if (action === "deactivate") {
      try {
        await deactivateStaff(row._id).unwrap();
        toast.success("Staff deactivated");
        await refetch();
      } catch (deactivateError) {
        toast.error(deactivateError?.data?.message || "Failed to deactivate staff");
      }
      return;
    }

    if (action === "reactivate") {
      try {
        await reactivateStaff(row._id).unwrap();
        toast.success("Staff reactivated");
        await refetch();
      } catch (reactivateError) {
        toast.error(reactivateError?.data?.message || "Failed to reactivate staff");
      }
    }
  };

  const handleSort = (key, dir) => {
    setSortField(key);
    setSortAsc(dir === "asc");
  };

  const columns = [
    {
      key: "fullName",
      label: "Name",
      sortable: true,
      render: (row) => <span className="font-medium text-foreground">{row.fullName}</span>,
    },
    {
      key: "email",
      label: "Email",
      sortable: true,
      render: (row) => <span className="text-sm text-muted-foreground">{row.email}</span>,
    },
    {
      key: "assignedCount",
      label: "Assigned Clients",
      sortable: true,
    },
    {
      key: "staffAccessStatus",
      label: "Status",
      sortable: true,
      render: (row) => (
        <Badge
          variant="outline"
          className={cn("text-xs", statusBadgeClass[row.statusColor] || statusBadgeClass.gray)}
        >
          {row.statusLabel}
        </Badge>
      ),
    },
  ];

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Loading staff members...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-lg font-semibold text-destructive">Error Loading Staff</p>
          <p className="text-sm text-muted-foreground mt-2">
            {error?.data?.message || error?.message || 'Failed to fetch staff members'}
          </p>
        </div>
      </div>
    );
  }

  // Empty state (only when there is truly no staff and no filters are applied)
  if (staffMembers.length === 0 && !hasAnyFilter) {
    return (
      <>
      <StaffInviteModal
        open={isInviteModalOpen}
        onOpenChange={setIsInviteModalOpen}
        mode={inviteMode}
        initialData={selectedStaffForInvite}
        onSuccess={refetch}
      />

      <div className="space-y-6 animate-fade-in">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Staff Members</h1>
            <p className="text-sm text-muted-foreground">0 staff members</p>
          </div>
          <Button className="gap-2" onClick={() => openInviteModal()}>
            <Plus className="h-4 w-4" /> Add New Staff
          </Button>
        </div>
        <div className="flex flex-col items-center justify-center h-64 bg-card border border-border rounded-xl">
          <UserX className="h-12 w-12 text-muted-foreground mb-3" />
          <p className="text-lg font-semibold text-foreground">No Staff Members Yet</p>
          <p className="text-sm text-muted-foreground mt-2">
            Add your first staff member to get started
          </p>
        </div>
      </div>
      </>
    );
  }

  return (
    <>
    <StaffInviteModal
      open={isInviteModalOpen}
      onOpenChange={setIsInviteModalOpen}
      mode={inviteMode}
      initialData={selectedStaffForInvite}
      onSuccess={refetch}
    />

    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Staff Members</h1>
          <p className="text-sm text-muted-foreground">
            {isServerPaginated ? pagination.totalItems || staffMembers.length : staffMembers.length} staff members
          </p>
        </div>
        <Button className="gap-2" onClick={() => openInviteModal()}>
          <Plus className="h-4 w-4" /> Add New Staff
        </Button>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="relative max-w-xs w-full">
          {/* <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" /> */}
          <Input placeholder="Search staff..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant={statusFilter !== "all" ? "default" : "outline"}
              className={cn(
                "h-10 gap-2",
                statusFilter !== "all"
                  ? "border-primary bg-primary text-primary-foreground hover:bg-primary/90"
                  : "border-border text-foreground hover:bg-accent"
              )}
            >
              <span>{activeStatusLabel}</span>
              <ChevronDown className="h-3.5 w-3.5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="bg-popover z-50 min-w-[160px]">
            {STATUS_FILTERS.map((item) => (
              <DropdownMenuItem
                key={item.value}
                onClick={() => setStatusFilter(item.value)}
                className="flex items-center justify-between"
              >
                <span>{item.label}</span>
                {statusFilter === item.value && <Check className="h-3.5 w-3.5 text-primary" />}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant={assignmentFilter !== "all" ? "default" : "outline"}
              className={cn(
                "h-10 gap-2",
                assignmentFilter !== "all"
                  ? "border-primary bg-primary text-primary-foreground hover:bg-primary/90"
                  : "border-border text-foreground hover:bg-accent"
              )}
            >
              <span>{activeAssignmentLabel}</span>
              <ChevronDown className="h-3.5 w-3.5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="bg-popover z-50 min-w-[160px]">
            {ASSIGNMENT_FILTERS.map((item) => (
              <DropdownMenuItem
                key={item.value}
                onClick={() => setAssignmentFilter(item.value)}
                className="flex items-center justify-between"
              >
                <span>{item.label}</span>
                {assignmentFilter === item.value && <Check className="h-3.5 w-3.5 text-primary" />}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        {hasAnyFilter && (
          <Button
            variant="ghost"
            size="sm"
            className="h-10 gap-1.5 text-muted-foreground hover:text-destructive"
            onClick={clearAllFilters}
          >
            <X className="h-3.5 w-3.5" />
            Clear All
          </Button>
        )}
      </div>

      <DataTable
        data={paginatedData}
        columns={columns}
        onSort={handleSort}
        rowActions={getRowActions}
        onRowAction={handleStaffAction}
        getRowId={(row) => row._id}
        emptyMessage="No staff members found."
        emptyDescription="Try adjusting your search or filters."
      />

      <PaginationControls
        page={isServerPaginated ? pagination.currentPage || page : page}
        totalPages={totalPages}
        totalItems={isServerPaginated ? pagination.totalItems || tableData.length : tableData.length}
        pageSize={isServerPaginated ? pagination.itemsPerPage || pageSize : pageSize}
        onPageChange={setPage}
        onPageSizeChange={setPageSize}
        showCount={false}
      />
    </div>
    </>
  );
}
