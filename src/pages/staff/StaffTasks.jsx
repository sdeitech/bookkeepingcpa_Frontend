import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTasks } from "@/hooks/useTasks";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { TaskStatusBadge, TaskPriorityBadge } from "@/components/new_Admin/TaskStatusBadge";
import { DataTable } from "@/components/common/DataTable";
import { PaginationControls } from "@/components/ui/pagination-controls";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { AlertTriangle, Check, ChevronDown, X } from "lucide-react";
import { format, isBefore, startOfDay } from "date-fns";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const PAGE_SIZE = 10;

const CATEGORY_FILTERS = [
  { label: "Doc Upload", value: "doc_upload" },
  { label: "Integration", value: "integration" },
  { label: "Action", value: "action" },
  { label: "Review", value: "review" },
];

const ROW_ACTIONS = [
  { label: "View", value: "view" },
  { label: "Mark Complete", value: "complete" },
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

export default function StaffTasks() {
  const navigate = useNavigate();
  const [categoryFilter, setCategoryFilter] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [sortKey, setSortKey] = useState("createdAt");
  const [sortDir, setSortDir] = useState("desc");
  const [page, setPage] = useState(1);
  const [columnFilters, setColumnFilters] = useState({});
  const [clearAllOpen, setClearAllOpen] = useState(false);

  const apiFilters = useMemo(() => {
    const filters = {
      page,
      limit: PAGE_SIZE,
      sortBy: sortKey || "createdAt",
      sortOrder: sortDir || "desc",
      viewFilter: "staff_tasks",
    };

    if (debouncedSearch) filters.search = debouncedSearch;
    if (categoryFilter) filters.category = categoryFilter;
    if (columnFilters.clientId) filters.clientId = columnFilters.clientId;
    if (columnFilters.assignedById) filters.assignedBy = columnFilters.assignedById;
    if (columnFilters.status) filters.status = columnFilters.status.toUpperCase();
    if (columnFilters.priority) filters.priority = columnFilters.priority.toUpperCase();
    if (columnFilters.dueDate) filters.dueDateFilter = columnFilters.dueDate;

    return filters;
  }, [page, sortKey, sortDir, debouncedSearch, categoryFilter, columnFilters]);

  const { tasks: apiTasks, filterOptions, pagination, isLoading, refetch, updateTask } = useTasks(apiFilters);

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
        clientId: getId(task.clientId || task.client),
        clientName: getName(task.clientName || task.clientId) || "Internal",
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

  const clientOptions = useMemo(() => {
    const options = filterOptions?.clients || [];
    return options;
  }, [filterOptions]);

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

  const handleRowAction = async (action, row) => {
    if (action === "view") {
      navigate(`/staff/tasks/${row.id}`);
      return;
    }
    if (action === "complete") {
      try {
        await updateTask(row.id, { status: "COMPLETED" });
        toast.success("Task completed");
      } catch {
        toast.error("Failed to update task");
      }
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
    setTimeout(() => refetch(), 0);
    toast.success("All filters cleared");
  };

  const columns = [
    {
      key: "title",
      label: "Task",
      sortable: true,
      render: (row) => (
        <div>
          <div className="font-medium text-foreground">{row.title}</div>
          {row.description && (
            <div className="mt-0.5 text-xs text-muted-foreground line-clamp-1">{row.description}</div>
          )}
        </div>
      ),
    },
    {
      key: "clientId",
      label: "Client",
      sortable: true,
      filterable: true,
      filterOptions: [{ label: "All", value: "" }, ...clientOptions],
      render: (row) => <span className="text-muted-foreground">{row.clientName ?? "-"}</span>,
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
        return (
          <span className={isOverdue ? "font-medium text-destructive" : ""}>
            {row.dueDate ? format(new Date(row.dueDate), "MMM d, yyyy") : "-"}
          </span>
        );
      },
    },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Staff Tasks</h1>
          <p className="text-sm text-muted-foreground">
            {isLoading ? "Loading..." : `${normalizedTasks.length} tasks`}
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
                  {task.title} (due {format(new Date(task.dueDate), "MMM d")})
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
        data={normalizedTasks}
        columns={columns}
        onSort={handleSort}
        onRowAction={handleRowAction}
        rowActions={ROW_ACTIONS}
        columnFilters={columnFilters}
        onColumnFilterChange={handleColumnFilterChange}
        loading={isLoading}
        emptyMessage="No tasks found"
        emptyDescription="No staff tasks are assigned yet."
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
