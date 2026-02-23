import { useGetAllStaffQuery } from "@/features/user/userApi";
import { useTasks } from "@/hooks/useTasks";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Plus, Search, Loader2, UserX, ChevronDown, Check, X } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { DataTable } from "@/components/common/DataTable";

const STATUS_FILTERS = [
  { label: "All Status", value: "all" },
  { label: "Active", value: "active" },
  { label: "Inactive", value: "inactive" },
];

const ASSIGNMENT_FILTERS = [
  { label: "All Staff", value: "all" },
  { label: "Assigned", value: "assigned" },
  { label: "Unassigned", value: "unassigned" },
];

const ROW_ACTIONS = [
  { label: "View", value: "view" },
  { label: "Edit", value: "edit" },
  { label: "Delete", value: "delete", variant: "destructive" },
];

export default function AdminStaff() {
  const { data: staffData, isLoading, error } = useGetAllStaffQuery();
  const { tasks } = useTasks();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [assignmentFilter, setAssignmentFilter] = useState("all");

  const staffMembers = staffData?.data || [];

  const getAssignedCount = (staffId) =>
    new Set(tasks.filter((t) => t.staffId === staffId).map((t) => t.clientId)).size;

  const filtered = useMemo(() => {
    return staffMembers.filter((s) => {
      const fullName = `${s.first_name || ""} ${s.last_name || ""}`.trim().toLowerCase();
      const email = (s.email || "").toLowerCase();
      const searchLower = search.toLowerCase();
      const assignedCount = getAssignedCount(s._id);

      if (search && !fullName.includes(searchLower) && !email.includes(searchLower)) return false;
      if (statusFilter === "active" && !s.active) return false;
      if (statusFilter === "inactive" && s.active) return false;
      if (assignmentFilter === "assigned" && assignedCount === 0) return false;
      if (assignmentFilter === "unassigned" && assignedCount > 0) return false;

      return true;
    });
  }, [staffMembers, search, statusFilter, assignmentFilter, tasks]);

  const tableData = useMemo(
    () =>
      filtered.map((staff) => ({
        ...staff,
        fullName: `${staff.first_name || ""} ${staff.last_name || ""}`.trim() || "Unnamed Staff",
        assignedCount: getAssignedCount(staff._id),
        uiStatus: staff.active ? "active" : "inactive",
      })),
    [filtered, tasks],
  );

  const activeStatusLabel = STATUS_FILTERS.find((item) => item.value === statusFilter)?.label || "All Status";
  const activeAssignmentLabel =
    ASSIGNMENT_FILTERS.find((item) => item.value === assignmentFilter)?.label || "All Staff";
  const hasAnyFilter = !!search || statusFilter !== "all" || assignmentFilter !== "all";

  const clearAllFilters = () => {
    setSearch("");
    setStatusFilter("all");
    setAssignmentFilter("all");
  };

  const handleStaffAction = (action, row) => {
    if (action === "view") {
      toast.info("View staff details coming soon");
      return;
    }
    if (action === "edit") {
      toast.info("Edit staff coming soon");
      return;
    }
    if (action === "delete") {
      toast.info("Delete staff coming soon");
    }
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
      key: "uiStatus",
      label: "Status",
      sortable: true,
      render: (row) =>
        row.active ? (
          <Badge variant="outline" className="bg-success/15 text-success border-success/30 text-xs">
            Active
          </Badge>
        ) : (
          <Badge variant="outline" className="bg-muted text-muted-foreground border-muted text-xs">
            Inactive
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

  // Empty state
  if (staffMembers.length === 0) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Staff Members</h1>
            <p className="text-sm text-muted-foreground">0 staff members</p>
          </div>
          <Button className="gap-2" onClick={() => toast.info("Add staff coming soon")}>
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
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Staff Members</h1>
          <p className="text-sm text-muted-foreground">{staffMembers.length} staff members</p>
        </div>
        <Button className="gap-2" onClick={() => toast.info("Add staff coming soon")}>
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
        data={tableData}
        columns={columns}
        rowActions={ROW_ACTIONS}
        onRowAction={handleStaffAction}
        getRowId={(row) => row._id}
        emptyMessage="No staff members found."
        emptyDescription="Try adjusting your search or filters."
      />
    </div>
  );
}
