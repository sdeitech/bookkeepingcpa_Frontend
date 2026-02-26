import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { selectCurrentUser } from "@/features/auth/authSlice";
import { useTasks } from "@/hooks/useTasks";
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
import { DataTable } from "@/components/common/DataTable";
import { PaginationControls } from "@/components/ui/pagination-controls";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { AlertTriangle, Check, ChevronDown, X, CheckCircle2 } from "lucide-react";
import { format, isBefore, startOfDay } from "date-fns";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const PAGE_SIZE = 8;

const CATEGORY_FILTERS = [
  { label: "Doc Upload", value: "doc_upload" },
  { label: "Integration", value: "integration" },
  { label: "Action", value: "action" },
  { label: "Review", value: "review" },
];

const ROW_ACTIONS = [
  { label: "View", value: "view" },
  { label: "Need Help", value: "help" },
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
  if (status === "pending_review") return "pending_review";
  if (status === "needs_revision") return "needs_revision";
  if (status === "cancelled") return "cancelled";
  return "blocked";
};

const toLowerPriority = (value) => {
  const priority = String(value || "").toLowerCase();
  if (priority === "low") return "low";
  if (priority === "medium") return "medium";
  if (priority === "high") return "high";
  return "urgent";
};

export default function ClientTasks() {
  const navigate = useNavigate();
  const user = useSelector(selectCurrentUser);
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

    // Backend automatically filters by assignedTo = currentUser._id for clients
    // No need to pass it explicitly

    // Add search
    if (debouncedSearch) {
      filters.search = debouncedSearch;
    }

    // Add category filter
    if (categoryFilter) {
      filters.category = categoryFilter;
    }

    // Add column filters
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
  }, [page, sortKey, sortDir, debouncedSearch, categoryFilter, columnFilters]);

  // Fetch tasks with filters
  const { tasks: apiTasks, filterOptions, pagination, isLoading, refetch } = useTasks(apiFilters);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchQuery), 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const today = startOfDay(new Date());

  const normalizedTasks = useMemo(() => {
    return apiTasks.map((task) => {
      const id = getId(task);
      return {
        ...task,
        id,
        assignedById: getId(task.assignedBy),
        assignedByName: getName(task.assignedBy) || "-",
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
  const assignedByOptions = useMemo(() => {
    const options = filterOptions?.assignedBy || [];
    return options;
  }, [filterOptions]);

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

  // All filtering is done by backend
  const filtered = normalizedTasks;
  const paginated = filtered;

  const handleRowAction = async (action, row) => {
    if (action === "view") {
      navigate(`/new-dashboard/tasks/${row.id}`);
      return;
    }
    if (action === "help") {
      // TODO: Implement help request functionality
      toast.info("Help request feature coming soon!");
    }
  };

  const handleSort = (key, dir) => {
    setSortKey(key);
    setSortDir(dir);
  };

  const activeCatLabel = CATEGORY_FILTERS.find((f) => f.value === categoryFilter)?.label;
  const hasAnyFilter = !!categoryFilter || !!debouncedSearch || Object.keys(columnFilters).length > 0;

  const handleClearAll = () => {
    setCategoryFilter("");
    setSearchQuery("");
    setDebouncedSearch("");
    setColumnFilters({});
    setSortKey("createdAt");
    setSortDir("desc");
    setPage(1);
    setClearAllOpen(false);
    
    // Force refresh to get fresh data
    setTimeout(() => refetch(), 0);
    
    toast.success("All filters cleared");
  };

  // Calculate document upload progress
  const getDocumentProgress = (task) => {
    if (!task.requiredDocuments || task.requiredDocuments.length === 0) {
      return { uploaded: 0, total: 0, percentage: 0 };
    }

    const required = task.requiredDocuments.filter(d => d.isRequired);
    const uploaded = required.filter(d => d.uploaded).length;
    const total = required.length;
    const percentage = total > 0 ? Math.round((uploaded / total) * 100) : 0;

    return { uploaded, total, percentage };
  };

  const columns = [
    {
      key: "title",
      label: "Task",
      sortable: true,
      render: (row) => (
        <div>
          <div className="font-medium text-foreground">{row.title}</div>
          {row.description && <div className="mt-0.5 text-xs text-muted-foreground line-clamp-1">{row.description}</div>}
        </div>
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
        { label: "Pending Review", value: "pending_review" },
        { label: "Needs Revision", value: "needs_revision" },
        { label: "Completed", value: "completed" },
        { label: "Cancelled", value: "cancelled" },
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
    {
      key: "progress",
      label: "Progress",
      sortable: false,
      render: (row) => {
        const { uploaded, total, percentage } = getDocumentProgress(row);
        
        if (total === 0) {
          return <span className="text-xs text-muted-foreground">No docs required</span>;
        }

        const isComplete = uploaded === total;
        
        return (
          <div className="flex items-center gap-2">
            <div className="w-20 h-2 bg-muted rounded-full overflow-hidden">
              <div 
                className={cn(
                  "h-full transition-all duration-300 rounded-full",
                  isComplete ? "bg-green-500" : "bg-primary"
                )}
                style={{ width: `${percentage}%` }}
              />
            </div>
            <div className="flex items-center gap-1">
              <span className="text-xs font-medium">{uploaded}/{total}</span>
              {isComplete && <CheckCircle2 className="h-3.5 w-3.5 text-green-500" />}
            </div>
          </div>
        );
      },
    },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">My Tasks</h1>
          <p className="text-sm text-muted-foreground">
            {isLoading ? "Loading..." : `${filtered.length} tasks`}
            {overdueTasks.length > 0 && ` · ${overdueTasks.length} overdue`}
          </p>
        </div>
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
                  • {task.title} (due {format(new Date(task.dueDate), "MMM d")})
                </li>
              ))}
              {overdueTasks.length > 3 && <li>...and {overdueTasks.length - 3} more</li>}
            </ul>
          </div>
        </div>
      )}

      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px] max-w-md">
          <Input
            placeholder="Search tasks..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setPage(1);
            }}
            className="h-10"
          />
        </div>

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

      <DataTable
        data={paginated}
        columns={columns}
        onSort={handleSort}
        onRowAction={handleRowAction}
        rowActions={ROW_ACTIONS}
        columnFilters={columnFilters}
        onColumnFilterChange={handleColumnFilterChange}
        isLoading={isLoading}
        emptyMessage="No tasks found"
        emptyDescription="You don't have any tasks assigned yet."
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

      <ConfirmDialog
        open={clearAllOpen}
        onOpenChange={setClearAllOpen}
        title="Clear All Filters?"
        description="This will reset the search bar, category dropdown, and all column filters."
        confirmLabel="Clear All"
        variant="destructive"
        onConfirm={handleClearAll}
      />
    </div>
  );
}
