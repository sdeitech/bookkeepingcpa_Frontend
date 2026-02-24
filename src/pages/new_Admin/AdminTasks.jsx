import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTasks } from "@/hooks/useTasks";
import { useGetAllStaffQuery } from "@/features/user/userApi";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { TaskStatusBadge, TaskPriorityBadge } from "@/components/new_Admin/TaskStatusBadge";
import { CreateTaskWizard } from "@/components/new_Admin/CreateTaskWizard";
import { DataTable } from "@/components/common/DataTable";
import { PaginationControls } from "@/components/ui/pagination-controls";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Plus, AlertTriangle, UserCheck, Trash2, Search, Check, ChevronDown, X } from "lucide-react";
import { format, isBefore, startOfDay, endOfWeek, startOfWeek, isToday } from "date-fns";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const CURRENT_STAFF = "Sarah Mitchell";
const PAGE_SIZE = 8;

const VIEW_FILTERS = [
  { label: "All Tasks", value: "all" },
  { label: "Client Tasks", value: "client_tasks" },
  { label: "Staff Tasks", value: "staff_tasks" },
];

const CATEGORY_FILTERS = [
  { label: "Doc Upload", value: "doc_upload" },
  { label: "Integration", value: "integration" },
  { label: "Action", value: "action" },
  { label: "Review", value: "review" },
];

const ROW_ACTIONS = [
  { label: "View", value: "view" },
  { label: "Edit", value: "edit" },
  { label: "Delete", value: "delete", variant: "destructive" },
];

const getId = (value) => {
  if (!value) return "";
  if (typeof value === "string") return value;
  return value._id || value.id || "";
};

const getName = (value) => {
  if (!value) return "";
  if (typeof value === "string") return value;
  const first = value.first_name || value.firstName || "";
  const last = value.last_name || value.lastName || "";
  const full = [first, last].filter(Boolean).join(" ").trim();
  return full || value.name || value.fullName || value.email || "";
};

const toLowerStatus = (value) => {
  const status = String(value || "").toLowerCase();
  if (status === "not_started") return "not_started";
  if (status === "in_progress") return "in_progress";
  if (status === "completed") return "completed";
  return "blocked";
};

const toLowerPriority = (value) => {
  const priority = String(value || "").toLowerCase();
  if (priority === "low") return "low";
  if (priority === "medium") return "medium";
  if (priority === "high") return "high";
  return "urgent";
};

export default function AdminTasks() {
  const navigate = useNavigate();
  const [createOpen, setCreateOpen] = useState(false);
  const [selected, setSelected] = useState([]);
  const [viewFilter, setViewFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [sortKey, setSortKey] = useState("createdAt");
  const [sortDir, setSortDir] = useState("desc");
  const [page, setPage] = useState(1);
  const [columnFilters, setColumnFilters] = useState({});
  const [clearAllOpen, setClearAllOpen] = useState(false);

  // Build API filter parameters
  const apiFilters = useMemo(() => {
    const filters = {
      page,
      limit: PAGE_SIZE,
      sortBy: sortKey || 'createdAt',
      sortOrder: sortDir || 'desc',
    };

    // Add search
    if (debouncedSearch) {
      filters.search = debouncedSearch;
    }

    // Add view filter
    if (viewFilter && viewFilter !== 'all') {
      filters.viewFilter = viewFilter;
    }

    // Add category filter
    if (categoryFilter) {
      filters.category = categoryFilter;
    }

    // Add column filters
    if (columnFilters.clientName) {
      filters.clientId = columnFilters.clientName; // This is actually the client ID value from the dropdown
    }
    if (columnFilters.assignedToId) {
      filters.assignedTo = columnFilters.assignedToId;
    }
    if (columnFilters.assignedById) {
      filters.assignedBy = columnFilters.assignedById;
    }
    if (columnFilters.status) {
      filters.status = columnFilters.status.toUpperCase();
    }
    if (columnFilters.priority) {
      filters.priority = columnFilters.priority.toUpperCase();
    }
    if (columnFilters.dueDate) {
      filters.dueDateFilter = columnFilters.dueDate;
    }

    return filters;
  }, [page, sortKey, sortDir, debouncedSearch, viewFilter, categoryFilter, columnFilters]);

  // Fetch tasks with filters
  const { tasks: apiTasks, filterOptions, pagination, isLoading, refetch, createTask, deleteTask, deleteTasks, reassignTasks } = useTasks(apiFilters);
  const { data: staffData } = useGetAllStaffQuery();
  const staffMembers = staffData?.data || [];

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchQuery), 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const today = startOfDay(new Date());
  const weekStart = startOfWeek(today, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(today, { weekStartsOn: 1 });

  const normalizedTasks = useMemo(() => {
    return apiTasks.map((task) => {
      const id = getId(task);
      return {
        ...task,
        id,
        clientName: getName(task.clientName || task.clientId) || "Internal",
        assignedToId: getId(task.assignedTo),
        assignedToName: getName(task.assignedTo) || "-",
        assignedById: getId(task.assignedBy),
        assignedByName: getName(task.assignedBy) || "-",
        assignedToRole: task.assignedToRole ? String(task.assignedToRole).toLowerCase() : "",
        status: toLowerStatus(task.status),
        priority: toLowerPriority(task.priority),
      };
    });
  }, [apiTasks]);

  const overdueTasks = useMemo(
    () =>
      normalizedTasks.filter(
        (task) => task.status !== "completed" && task.dueDate && isBefore(new Date(task.dueDate), today),
      ),
    [normalizedTasks, today],
  );

  // Get filter options from API response
  const clientOptions = useMemo(() => {
    const options = filterOptions?.clients || [];
    return options;
  }, [filterOptions]);

  const assignedToOptions = useMemo(() => {
    const options = filterOptions?.assignedTo || [];
    return options;
  }, [filterOptions]);

  const assignedByOptions = useMemo(() => {
    const options = filterOptions?.assignedBy || [];
    return options;
  }, [filterOptions]);

  const reassignOptions = useMemo(() => {
    const fromStaffApi = staffMembers
      .map((staff) => ({ value: getId(staff), label: getName(staff) }))
      .filter((staff) => staff.value);
    return fromStaffApi.length > 0 ? fromStaffApi : [];
  }, [staffMembers]);

  const handleColumnFilterChange = (columnKey, value) => {
    setColumnFilters((prev) => {
      const next = { ...prev };
      if (!value) {
        delete next[columnKey];
      } else {
        next[columnKey] = value;
      }
      return next;
    });
    setPage(1);
  };

  // All filtering is done by backend, so we just use the tasks directly
  const filtered = normalizedTasks;
  const paginated = filtered; // Backend already handles pagination

  const toggleSelect = (id) => {
    setSelected((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  const toggleAll = () => {
    const pageIds = paginated.map((t) => t.id);
    const allSelected = pageIds.length > 0 && pageIds.every((id) => selected.includes(id));
    setSelected((prev) => (allSelected ? prev.filter((id) => !pageIds.includes(id)) : [...new Set([...prev, ...pageIds])]));
  };

  const handleBulkDelete = async () => {
    try {
      await deleteTasks(selected);
      setSelected([]);
      toast.success(`${selected.length} tasks deleted`);
    } catch {
      toast.error("Failed to delete tasks");
    }
  };

  const handleBulkReassign = async (staff) => {
    try {
      await reassignTasks(selected, staff);
      setSelected([]);
      const selectedStaff = reassignOptions.find((option) => option.value === staff);
      toast.success(`Tasks reassigned to ${selectedStaff?.label || staff}`);
    } catch {
      toast.error("Failed to reassign tasks");
    }
  };

  const handleRowAction = async (action, row) => {
    if (action === "view") {
      navigate(`/admin/tasks/${row.id}`);
      return;
    }
    if (action === "edit") {
      navigate(`/admin/tasks/${row.id}?mode=edit`);
      return;
    }
    if (action === "delete") {
      try {
        await deleteTask(row.id);
        toast.success("Task deleted");
      } catch {
        toast.error("Failed to delete task");
      }
    }
  };

  const handleSort = (key, dir) => {
    setSortKey(key);
    setSortDir(dir);
  };

  const activeViewLabel = VIEW_FILTERS.find((f) => f.value === viewFilter)?.label || "All Tasks";
  const activeCatLabel = CATEGORY_FILTERS.find((f) => f.value === categoryFilter)?.label;
  const hasAnyFilter = viewFilter !== "all" || !!categoryFilter || !!debouncedSearch || Object.keys(columnFilters).length > 0;

  const handleClearAll = () => {
    setViewFilter("all");
    setCategoryFilter("");
    setSearchQuery("");
    setDebouncedSearch("");
    setColumnFilters({});
    setSortKey("createdAt");
    setSortDir("desc");
    setPage(1);
    setSelected([]);
    setClearAllOpen(false);
    
    // Force refresh to get fresh data
    setTimeout(() => refetch(), 0);
    
    toast.success("All filters cleared");
  };

  const columns = [
    {
      key: "title",
      label: "Title",
      sortable: true,
      render: (row) => (
        <div>
          <div className="font-medium text-foreground">{row.title}</div>
          {row.description && <div className="mt-0.5 text-xs text-muted-foreground">{row.description}</div>}
        </div>
      ),
    },
    {
      key: "clientName",
      label: "Client",
      sortable: true,
      filterable: true,
      filterOptions: [{ label: "All", value: "" }, ...clientOptions],
      render: (row) => <span className="italic text-muted-foreground">{row.clientName}</span>,
    },
    {
      key: "assignedToId",
      label: "Assigned To",
      sortable: true,
      filterable: true,
      filterOptions: [{ label: "All", value: "" }, ...assignedToOptions],
      render: (row) => (
        <span>
          {row.assignedToName}
          {row.assignedToRole && <span className="ml-1 text-xs text-muted-foreground">({row.assignedToRole})</span>}
        </span>
      ),
    },
    {
      key: "assignedById",
      label: "Assigned By",
      sortable: true,
      filterable: true,
      filterOptions: [{ label: "All", value: "" }, ...assignedByOptions],
      render: (row) => <span className="text-muted-foreground">{row.assignedByName ?? "-"}</span>,
    },
    {
      key: "status",
      label: "Status",
      sortable: true,
      filterable: true,
      filterOptions: [
        { label: "All", value: "" },
        { label: "Not Started", value: "not_started" },
        { label: "In Progress", value: "in_progress" },
        { label: "Completed", value: "completed" },
        { label: "Blocked", value: "blocked" },
      ],
      render: (row) => <TaskStatusBadge status={row.status} />,
    },
    {
      key: "priority",
      label: "Priority",
      sortable: true,
      filterable: true,
      filterOptions: [
        { label: "All", value: "" },
        { label: "Low", value: "low" },
        { label: "Medium", value: "medium" },
        { label: "High", value: "high" },
        { label: "Urgent", value: "urgent" },
      ],
      render: (row) => <TaskPriorityBadge priority={row.priority} />,
    },
    {
      key: "dueDate",
      label: "Due Date",
      sortable: true,
      filterable: true,
      filterOptions: [{ label: "All", value: "" }],
      filterGroups: [
        {
          options: [
            { label: "Overdue", value: "overdue" },
            { label: "Today", value: "today" },
            { label: "This Week", value: "this_week" },
          ],
        },
      ],
      render: (row) => {
        const isOverdue = row.status !== "completed" && row.dueDate && isBefore(new Date(row.dueDate), today);
        return <span className={isOverdue ? "font-medium text-destructive" : ""}>{row.dueDate ? format(new Date(row.dueDate), "MMM d, yyyy") : "-"}</span>;
      },
    },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Task Management</h1>
          <p className="text-sm text-muted-foreground">
            {isLoading ? "Loading..." : `${filtered.length} tasks`} · {overdueTasks.length} overdue
          </p>
        </div>
        <Button onClick={() => setCreateOpen(true)} className="gap-2">
          <Plus className="h-4 w-4" /> Create Task
        </Button>
      </div>

      {overdueTasks.length > 0 && (
        <div className="flex items-start gap-3 rounded-xl border border-destructive/30 bg-destructive/10 p-4">
          <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-destructive" />
          <div>
            <p className="font-semibold text-destructive">
              {overdueTasks.length} Overdue Task{overdueTasks.length > 1 ? "s" : ""}
            </p>
            <ul className="mt-1 space-y-0.5 text-sm text-destructive/80">
              {overdueTasks.slice(0, 3).map((task) => (
                <li key={task.id}>
                  • {task.title} - {task.clientName} (due {format(new Date(task.dueDate), "MMM d")})
                </li>
              ))}
              {overdueTasks.length > 3 && <li>...and {overdueTasks.length - 3} more</li>}
            </ul>
          </div>
        </div>
      )}

      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px] max-w-md">
          {/* <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" /> */}
          <Input
            placeholder="Search tasks..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setPage(1);
            }}
            className="h-10 pl-9"
          />
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant={viewFilter !== "all" ? "default" : "outline"}
              className={cn(
                "h-10 gap-2",
                viewFilter !== "all"
                  ? "border-primary bg-primary text-primary-foreground hover:bg-primary/90"
                  : "border-border text-foreground hover:bg-accent",
              )}
            >
              <span>{activeViewLabel}</span>
              <ChevronDown className="h-3.5 w-3.5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="bg-popover z-50 min-w-[180px]">
            {VIEW_FILTERS.map((f) => (
              <DropdownMenuItem
                key={f.value}
                onClick={() => {
                  setViewFilter(f.value);
                  setPage(1);
                  setSelected([]);
                }}
                className="flex items-center justify-between"
              >
                <span>{f.label}</span>
                {viewFilter === f.value && <Check className="h-3.5 w-3.5 text-primary" />}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant={categoryFilter ? "default" : "outline"}
              className={cn(
                "h-10 gap-2",
                categoryFilter
                  ? "border-primary bg-primary text-primary-foreground hover:bg-primary/90"
                  : "border-border text-foreground hover:bg-accent",
              )}
            >
              <span>{activeCatLabel || "Category"}</span>
              <ChevronDown className="h-3.5 w-3.5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="bg-popover z-50 min-w-[180px]">
            {CATEGORY_FILTERS.map((f) => (
              <DropdownMenuItem
                key={f.value}
                onClick={() => {
                  setCategoryFilter((prev) => (prev === f.value ? "" : f.value));
                  setPage(1);
                }}
                className="flex items-center justify-between"
              >
                <span>{f.label}</span>
                {categoryFilter === f.value && <Check className="h-3.5 w-3.5 text-primary" />}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        {hasAnyFilter && (
          <Button
            variant="ghost"
            size="sm"
            className="h-10 gap-1.5 text-muted-foreground hover:text-destructive"
            onClick={() => setClearAllOpen(true)}
          >
            <X className="h-3.5 w-3.5" />
            Clear All
          </Button>
        )}
      </div>

      {selected.length > 0 && (
        <div className="flex items-center gap-3 rounded-lg border border-accent bg-accent/50 p-3">
          <span className="text-sm font-medium">{selected.length} selected</span>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="gap-1.5">
                <UserCheck className="h-3.5 w-3.5" /> Reassign
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="z-50 bg-popover">
              {reassignOptions.map((staff) => (
                <DropdownMenuItem key={staff.value} onClick={() => handleBulkReassign(staff.value)}>
                  {staff.label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
          <Button variant="destructive" size="sm" className="gap-1.5" onClick={handleBulkDelete}>
            <Trash2 className="h-3.5 w-3.5" /> Delete
          </Button>
        </div>
      )}

      <DataTable
        data={paginated}
        columns={columns}
        onSort={handleSort}
        onRowAction={handleRowAction}
        rowActions={ROW_ACTIONS}
        selectedRows={selected}
        onSelectRow={toggleSelect}
        onSelectAll={toggleAll}
        columnFilters={columnFilters}
        onColumnFilterChange={handleColumnFilterChange}
        isLoading={isLoading}
      />

      {pagination.totalPages > 1 && (
        <PaginationControls
          page={pagination.currentPage}
          totalPages={pagination.totalPages}
          onPageChange={setPage}
          totalItems={pagination.totalItems}
          pageSize={pagination.itemsPerPage}
        />
      )}

      <CreateTaskWizard open={createOpen} onOpenChange={setCreateOpen} onCreate={createTask} />

      <ConfirmDialog
        open={clearAllOpen}
        onOpenChange={setClearAllOpen}
        title="Clear All Filters?"
        description="This will reset the search bar, view/category dropdowns, and all column filters."
        confirmLabel="Clear All"
        variant="destructive"
        onConfirm={handleClearAll}
      />
    </div>
  );
}
