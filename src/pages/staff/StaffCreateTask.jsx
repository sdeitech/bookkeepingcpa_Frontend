import { useEffect, useMemo, useState } from "react";
import { useNavigate, useOutletContext } from "react-router-dom";
import { useTasks } from "@/hooks/useTasks";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { TaskPriorityBadge, TaskStatusBadge } from "@/components/new_Admin/TaskStatusBadge";
import { CreateTaskWizard } from "@/components/new_Admin/CreateTaskWizard";
import { DataTable } from "@/components/common/DataTable";
import { PaginationControls } from "@/components/ui/pagination-controls";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Plus, AlertTriangle, Check, ChevronDown, X } from "lucide-react";
import { format, isBefore, isToday, startOfDay, startOfWeek, endOfWeek } from "date-fns";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const DEFAULT_PAGE_SIZE = 10;
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

export default function StaffCreateTask() {
  const navigate = useNavigate();
  const { myClients = [] } = useOutletContext();

  const [createOpen, setCreateOpen] = useState(false);
  const [viewFilter, setViewFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [sortKey, setSortKey] = useState("createdAt");
  const [sortDir, setSortDir] = useState("desc");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
  const [columnFilters, setColumnFilters] = useState({});
  const [clearAllOpen, setClearAllOpen] = useState(false);
  const apiFilters = useMemo(() => {
    const filters = {
      page,
      limit: pageSize,
      sortBy: sortKey || "createdAt",
      sortOrder: sortDir || "desc",
    };

    if (debouncedSearch) filters.search = debouncedSearch;
    if (viewFilter && viewFilter !== "all") filters.viewFilter = viewFilter;
    if (categoryFilter) filters.category = categoryFilter;
    if (columnFilters.status) filters.status = String(columnFilters.status).toUpperCase();
    if (columnFilters.priority) filters.priority = String(columnFilters.priority).toUpperCase();
    if (columnFilters.dueDate) filters.dueDateFilter = columnFilters.dueDate;

    return filters;
  }, [page, pageSize, sortKey, sortDir, debouncedSearch, viewFilter, categoryFilter, columnFilters]);

  const { tasks, pagination, isLoading, createTask, deleteTask } = useTasks(apiFilters);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchQuery), 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const today = startOfDay(new Date());
  const weekStart = startOfWeek(today, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(today, { weekStartsOn: 1 });
  const myClientIds = useMemo(() => new Set(myClients.map((client) => getId(client)).filter(Boolean)), [myClients]);

  const normalizedTasks = useMemo(() => {
    return tasks
      .filter((task) => {
        const taskClientId = getId(task.clientId || task.client);
        return taskClientId && myClientIds.has(taskClientId);
      })
      .map((task) => ({
        ...task,
        id: getId(task),
        title: task.title || "Untitled Task",
        description: task.description || "",
        clientName: getName(task.clientName || task.clientId) || "Internal",
        status: toLowerStatus(task.status),
        priority: toLowerPriority(task.priority),
        dueDate: task.dueDate,
        taskType: String(task.taskType || "").toLowerCase(),
        assignedToName: getName(task.assignedTo) || "-",
      }));
  }, [tasks, myClientIds]);
  const isServerPaginated =
    Number.isFinite(pagination?.totalPages) &&
    Number.isFinite(pagination?.totalItems);

  const filtered = useMemo(() => {
    if (isServerPaginated) {
      return normalizedTasks;
    }

    let result = [...normalizedTasks];

    if (debouncedSearch) {
      const q = debouncedSearch.toLowerCase();
      result = result.filter(
        (task) =>
          String(task.title || "").toLowerCase().includes(q) ||
          String(task.description || "").toLowerCase().includes(q) ||
          String(task.clientName || "").toLowerCase().includes(q),
      );
    }

    if (viewFilter === "client_tasks") {
      result = result.filter((task) => task.clientName && task.clientName !== "Internal");
    }
    if (viewFilter === "staff_tasks") {
      result = result.filter((task) => !task.clientName || task.clientName === "Internal");
    }

    if (categoryFilter) {
      if (categoryFilter === "doc_upload") result = result.filter((task) => task.taskType === "document_upload");
      if (categoryFilter === "integration") result = result.filter((task) => task.taskType === "integration");
      if (categoryFilter === "action") result = result.filter((task) => task.taskType === "action");
      if (categoryFilter === "review") result = result.filter((task) => task.taskType === "review");
    }

    if (columnFilters.status) {
      result = result.filter((task) => task.status === columnFilters.status);
    }
    if (columnFilters.priority) {
      result = result.filter((task) => task.priority === columnFilters.priority);
    }
    if (columnFilters.dueDate) {
      const dueDateFilter = columnFilters.dueDate;
      if (dueDateFilter === "overdue") {
        result = result.filter((task) => task.status !== "completed" && task.dueDate && isBefore(new Date(task.dueDate), today));
      } else if (dueDateFilter === "today") {
        result = result.filter((task) => task.dueDate && isToday(new Date(task.dueDate)));
      } else if (dueDateFilter === "this_week") {
        result = result.filter((task) => {
          if (!task.dueDate) return false;
          const d = new Date(task.dueDate);
          return d >= weekStart && d <= weekEnd;
        });
      }
    }

    if (sortKey) {
      result = [...result].sort((a, b) => {
        const aVal = String(a[sortKey] ?? "");
        const bVal = String(b[sortKey] ?? "");
        return sortDir === "asc" ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
      });
    }

    return result;
  }, [isServerPaginated, normalizedTasks, debouncedSearch, viewFilter, categoryFilter, columnFilters, sortKey, sortDir, today, weekStart, weekEnd]);

  const totalPages = isServerPaginated
    ? Math.max(1, pagination.totalPages || 1)
    : Math.max(1, Math.ceil(filtered.length / pageSize));
  const paginated = useMemo(
    () => (isServerPaginated ? filtered : filtered.slice((page - 1) * pageSize, page * pageSize)),
    [filtered, isServerPaginated, page, pageSize],
  );

  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [page, totalPages]);
  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, viewFilter, categoryFilter, columnFilters, sortKey, sortDir, pageSize]);

  const overdueTasks = useMemo(
    () => filtered.filter((task) => task.status !== "completed" && task.dueDate && isBefore(new Date(task.dueDate), today)),
    [filtered, today],
  );

  const handleSort = (key, dir) => {
    setSortKey(key);
    setSortDir(dir);
  };

  const handleColumnFilterChange = (columnKey, value) => {
    setColumnFilters((prev) => {
      const next = { ...prev };
      if (!value) delete next[columnKey];
      else next[columnKey] = value;
      return next;
    });
    setPage(1);
  };

  const handleCreateTask = async (taskData) => {
    try {
      await createTask(taskData);
      toast.success("Task created successfully");
    } catch {
      toast.error("Failed to create task");
    }
  };
  const handleRowAction = async (action, row) => {
    if (action === "view") {
      navigate(`/staff/tasks/${row.id}`);
      return;
    }

    if (action === "edit") {
      navigate(`/staff/tasks/${row.id}?mode=edit`);
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
    setClearAllOpen(false);
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
      render: (row) => <span className="italic text-muted-foreground">{row.clientName}</span>,
    },
    {
      key: "assignedToName",
      label: "Assigned To",
      sortable: true,
      render: (row) => <span>{row.assignedToName}</span>,
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
      render: (row) => (
        <div className="flex justify-center">
          <TaskStatusBadge status={row.status} />
        </div>
      ),
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
      render: (row) => (
        <div className="flex justify-center">
          <TaskPriorityBadge priority={row.priority} />
        </div>
      ),
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
          <p className="text-sm text-muted-foreground">{isLoading ? "Loading..." : `${filtered.length} tasks`} · {overdueTasks.length} overdue</p>
        </div>
        <Button onClick={() => setCreateOpen(true)} className="gap-2">
          <Plus className="h-4 w-4" /> Create Task
        </Button>
      </div>

      {overdueTasks.length > 0 && (
        <div className="flex items-start gap-3 rounded-xl border border-destructive/30 bg-destructive/10 p-4">
          <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-destructive" />
          <div>
            <p className="font-semibold text-destructive">{overdueTasks.length} Overdue Task{overdueTasks.length > 1 ? "s" : ""}</p>
            <ul className="mt-1 space-y-0.5 text-sm text-destructive/80">
              {overdueTasks.slice(0, 3).map((task) => (
                <li key={task.id}>• {task.title} - {task.clientName} (due {task.dueDate ? format(new Date(task.dueDate), "MMM d") : "-"})</li>
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

      <DataTable
        data={paginated}
        columns={columns}
        onSort={handleSort}
        onRowAction={handleRowAction}
        rowActions={ROW_ACTIONS}
        columnFilters={columnFilters}
        onColumnFilterChange={handleColumnFilterChange}
        loading={isLoading}
      />

      <PaginationControls
        page={page}
        totalPages={totalPages}
        onPageChange={setPage}
        totalItems={isServerPaginated ? pagination.totalItems || filtered.length : filtered.length}
        pageSize={pageSize}
        onPageSizeChange={setPageSize}
      />

      <CreateTaskWizard
        open={createOpen}
        onOpenChange={setCreateOpen}
        onCreate={handleCreateTask}
        defaultTarget="client"
        clientList={myClients}
      />

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
