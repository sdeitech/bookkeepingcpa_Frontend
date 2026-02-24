import { useEffect, useMemo, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useTasks } from "@/hooks/useTasks";
import { TASK_STATUSES } from "@/lib/task-types";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Select, SelectContent, SelectItem, SelectTrigger } from "@/components/ui/select";
import { DataTable } from "@/components/common/DataTable";
import { PaginationControls } from "@/components/ui/pagination-controls";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { TaskStatusBadge, TaskPriorityBadge } from "@/components/Admin/TaskStatusBadge";
import { CreateTaskWizard } from "@/components/new_Admin/CreateTaskWizard";
import { ArrowLeft, Mail, Building2, Loader2, Plus, ChevronDown, Check, X } from "lucide-react";
import { format, isBefore, isToday, startOfDay, startOfWeek, endOfWeek } from "date-fns";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useGetStaffClientQuery } from "@/features/user/userApi";

const DEFAULT_PAGE_SIZE = 10;
const STATUS_FILTERS = [
  { label: "All Tasks", value: "all" },
  { label: "Not Started", value: "NOT_STARTED" },
  { label: "In Progress", value: "IN_PROGRESS" },
  { label: "Completed", value: "COMPLETED" },
  { label: "Pending Review", value: "PENDING_REVIEW" },
  { label: "Needs Revision", value: "NEEDS_REVISION" },
  { label: "Cancelled", value: "CANCELLED" },
];

const getTaskId = (task) => task?._id || task?.id;

const getName = (value) => {
  if (!value) return "";
  if (typeof value === "string") return value;
  const first = value.first_name || value.firstName || "";
  const last = value.last_name || value.lastName || "";
  const full = [first, last].filter(Boolean).join(" ").trim();
  return full || value.name || value.fullName || value.email || "";
};

export default function StaffClientDetail() {
  const { clientId } = useParams();
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortKey, setSortKey] = useState("createdAt");
  const [sortDir, setSortDir] = useState("desc");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
  const [columnFilters, setColumnFilters] = useState({});
  const [clearAllOpen, setClearAllOpen] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);

  const { data: clientData, isLoading: clientLoading, error: clientError } = useGetStaffClientQuery(clientId, {
    skip: !clientId,
  });

  const client = clientData?.data?.client || clientData?.data || null;
  const normalizedClientId = client?._id || client?.id || clientId;
  const apiFilters = useMemo(() => {
    const filters = {
      clientId: normalizedClientId,
      page,
      limit: pageSize,
      sortBy: sortKey || "createdAt",
      sortOrder: sortDir || "desc",
    };

    if (debouncedSearch) filters.search = debouncedSearch;

    const effectiveStatus = columnFilters.status || (statusFilter !== "all" ? statusFilter : "");
    if (effectiveStatus) filters.status = effectiveStatus;
    if (columnFilters.priority) filters.priority = columnFilters.priority;
    if (columnFilters.dueDate) filters.dueDateFilter = columnFilters.dueDate;

    return filters;
  }, [normalizedClientId, page, pageSize, sortKey, sortDir, debouncedSearch, statusFilter, columnFilters]);

  const { tasks, pagination, stats, isLoading: tasksLoading, updateTask, createTask } = useTasks(apiFilters);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchQuery), 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const today = startOfDay(new Date());
  const weekStart = startOfWeek(today, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(today, { weekStartsOn: 1 });

  const normalizedTasks = useMemo(
    () =>
      tasks
        .filter((task) => {
          const taskClientId = task.clientId || task.client?._id || task.client?.id;
          return String(taskClientId) === String(normalizedClientId);
        })
        .map((task) => ({
          ...task,
          id: getTaskId(task),
          assignedByName: getName(task.assignedBy) || "-",
        })),
    [tasks, normalizedClientId],
  );

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
          String(task.description || "").toLowerCase().includes(q),
      );
    }

    if (statusFilter !== "all") {
      result = result.filter((task) => task.status === statusFilter);
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
        result = result.filter((task) => task.status !== "COMPLETED" && task.dueDate && isBefore(new Date(task.dueDate), today));
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
  }, [isServerPaginated, normalizedTasks, debouncedSearch, statusFilter, columnFilters, sortKey, sortDir, today, weekStart, weekEnd]);

  const totalPages = isServerPaginated
    ? Math.max(1, pagination.totalPages || 1)
    : Math.max(1, Math.ceil(filtered.length / pageSize));
  const paginatedTasks = useMemo(
    () => (isServerPaginated ? filtered : filtered.slice((page - 1) * pageSize, page * pageSize)),
    [filtered, isServerPaginated, page, pageSize],
  );

  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [page, totalPages]);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, statusFilter, columnFilters, sortKey, sortDir, pageSize]);

  const completedCount = stats?.completedTasks ?? normalizedTasks.filter((t) => t.status === "COMPLETED").length;
  const totalCount = stats?.totalTasks ?? (isServerPaginated ? pagination.totalItems || normalizedTasks.length : normalizedTasks.length);
  const progressPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  const handleSort = (key, dir) => {
    setSortKey(key);
    setSortDir(dir);
  };

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

  const handleQuickStatusChange = async (taskId, newStatus) => {
    try {
      await updateTask(taskId, { status: newStatus });
      toast.success("Status updated");
    } catch {
      toast.error("Failed to update status");
    }
  };

  const handleCreateTask = async (taskData) => {
    try {
      await createTask({ ...taskData, clientId: normalizedClientId });
      setCreateOpen(false);
      toast.success("Task created");
    } catch {
      toast.error("Failed to create task");
    }
  };

  const activeStatusLabel = STATUS_FILTERS.find((item) => item.value === statusFilter)?.label || "All Tasks";
  const hasAnyFilter = statusFilter !== "all" || !!debouncedSearch || Object.keys(columnFilters).length > 0;

  const handleClearAll = () => {
    setSearchQuery("");
    setDebouncedSearch("");
    setStatusFilter("all");
    setColumnFilters({});
    setSortKey("createdAt");
    setSortDir("desc");
    setPage(1);
    setClearAllOpen(false);
    toast.success("All filters cleared");
  };

  const clientName =
    client?.name || [client?.first_name, client?.last_name].filter(Boolean).join(" ").trim() || "Unnamed Client";
  const clientEmail = client?.email || "-";
  const clientPlan = client?.plan || client?.subscription?.planName || "standard";
  const createTaskClientList = [
    {
      _id: normalizedClientId,
      first_name: client?.first_name || clientName,
      last_name: client?.last_name || "",
      email: clientEmail || "",
    },
  ];

  const columns = [
    {
      key: "title",
      label: "Title",
      sortable: true,
      render: (task) => (
        <div>
          <div className="font-medium text-foreground">{task.title || "Untitled Task"}</div>
          {task.description && <div className="text-xs text-muted-foreground mt-0.5">{task.description}</div>}
        </div>
      ),
    },
    {
      key: "status",
      label: "Status",
      sortable: true,
      filterable: true,
      filterOptions: [{ label: "All", value: "" }, ...TASK_STATUSES.map((s) => ({ label: s.label, value: s.value }))],
      render: (task) => (
        <Select value={task.status} onValueChange={(value) => handleQuickStatusChange(task.id, value)}>
          <SelectTrigger className="h-8 w-[140px] border-border text-xs">
            <TaskStatusBadge status={task.status} />
          </SelectTrigger>
          <SelectContent className="bg-popover z-50">
            {TASK_STATUSES.map((status) => (
              <SelectItem key={status.value} value={status.value}>
                {status.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      ),
    },
    {
      key: "priority",
      label: "Priority",
      sortable: true,
      filterable: true,
      filterOptions: [
        { label: "All", value: "" },
        { label: "Low", value: "LOW" },
        { label: "Medium", value: "MEDIUM" },
        { label: "High", value: "HIGH" },
      ],
      render: (task) => <TaskPriorityBadge priority={task.priority} />,
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
      render: (task) => <span className="text-sm">{task.dueDate ? format(new Date(task.dueDate), "MMM d, yyyy") : "-"}</span>,
    },
  ];

  if (!clientId) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
        <p className="text-lg mb-4">Invalid client ID</p>
        <Link to="/staff/clients">
          <Button variant="outline"><ArrowLeft className="mr-2 h-4 w-4" /> Back to Clients</Button>
        </Link>
      </div>
    );
  }

  if (clientLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Loading client...</p>
        </div>
      </div>
    );
  }

  if (clientError || !client) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
        <p className="text-lg mb-4">{clientError ? "Failed to load client." : "Client not found."}</p>
        <Link to="/staff/clients">
          <Button variant="outline">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Clients
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <Link
        to="/staff/clients"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="h-4 w-4" /> Back to Clients
      </Link>

      <div className="bg-card border border-border rounded-xl p-6">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center">
              <Building2 className="h-7 w-7 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">{clientName}</h1>
              <div className="flex items-center gap-3 mt-1 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Mail className="h-3.5 w-3.5" /> {clientEmail}
                </span>
                <span className="px-2 py-0.5 bg-primary/10 text-primary text-xs font-medium rounded-full capitalize">
                  {clientPlan}
                </span>
              </div>
            </div>
          </div>

          <Button onClick={() => setCreateOpen(true)} className="gap-2">
            <Plus className="h-4 w-4" /> Create Task
          </Button>
        </div>
      </div>

      <div className="bg-card border border-border rounded-xl p-6">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-foreground">Task Progress</h3>
          <span className="text-sm text-muted-foreground">
            {completedCount} of {totalCount} tasks completed ({progressPercent}%)
          </span>
        </div>
        <Progress value={progressPercent} className="h-3" />
      </div>

      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[220px] max-w-md">
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
              variant={statusFilter !== "all" ? "default" : "outline"}
              className={cn(
                "h-10 gap-2",
                statusFilter !== "all"
                  ? "border-primary bg-primary text-primary-foreground hover:bg-primary/90"
                  : "border-border text-foreground hover:bg-accent",
              )}
            >
              <span>{activeStatusLabel}</span>
              <ChevronDown className="h-3.5 w-3.5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="bg-popover z-50 min-w-[180px]">
            {STATUS_FILTERS.map((item) => (
              <DropdownMenuItem
                key={item.value}
                onClick={() => {
                  setStatusFilter(item.value);
                  setPage(1);
                }}
                className="flex items-center justify-between"
              >
                <span>{item.label}</span>
                {statusFilter === item.value && <Check className="h-3.5 w-3.5 text-primary" />}
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
        data={paginatedTasks}
        columns={columns}
        onSort={handleSort}
        loading={tasksLoading}
        getRowId={(row) => row.id}
        columnFilters={columnFilters}
        onColumnFilterChange={handleColumnFilterChange}
        emptyMessage="No tasks found"
        emptyDescription="Try adjusting your search or filters."
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
        clientList={createTaskClientList}
      />

      <ConfirmDialog
        open={clearAllOpen}
        onOpenChange={setClearAllOpen}
        title="Clear All Filters?"
        description="This will reset search, status, and table filters."
        confirmLabel="Clear All"
        variant="destructive"
        onConfirm={handleClearAll}
      />
    </div>
  );
}
