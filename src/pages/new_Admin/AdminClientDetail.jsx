import { useEffect, useMemo, useState } from "react";
import { useParams, Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { DataTable } from "@/components/common/DataTable";
import { PaginationControls } from "@/components/ui/pagination-controls";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { TaskStatusBadge, TaskPriorityBadge } from "@/components/Admin/TaskStatusBadge";
import { CreateTaskWizard } from "@/components/new_Admin/CreateTaskWizard";
import {
  ArrowLeft,
  Plus,
  Mail,
  Loader2,
  Search,
  ChevronDown,
  Check,
  X,
  Calendar,
  UserCheck,
  ListChecks,
  Clock3,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";
import { format, isBefore, isToday, startOfDay, startOfWeek, endOfWeek } from "date-fns";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useGetClientProfileQuery } from "@/features/user/userApi";
import { useGetTasksQuery, useDeleteTaskMutation } from "@/features/tasks/tasksApi";
import { useTasks } from "@/hooks/useTasks";
import QuickBooksData from "@/pages/dashboard/QuickBooksData";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useGetQuickBooksConnectionStatusQuery } from "@/features/quickbooks/quickbooksApi";

const DEFAULT_PAGE_SIZE = 10;


const VIEW_FILTERS = [
  { label: "All Tasks", value: "all" },
  { label: "Admin Tasks", value: "admin_tasks" },
  { label: "Staff Tasks", value: "staff_tasks" },
]

const getTaskId = (task) => task?._id || task?.id;
const getId = (value) => {
  if (!value) return "";
  if (typeof value === "string") return value;
  return value._id || value.id || "";
};
const getName = (value) => {
  if (!value) return "-";
  if (typeof value === "string") return value;
  const first = value.first_name || value.firstName || "";
  const last = value.last_name || value.lastName || "";
  const full = [first, last].filter(Boolean).join(" ").trim();
  return full || value.name || value.fullName || value.email || "-";
};

export default function AdminClientDetail() {
  const navigate = useNavigate();
  const location = useLocation();
  const { clientId } = useParams();
  const { createTask } = useTasks();

  const [createOpen, setCreateOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortKey, setSortKey] = useState(null);
  const [sortDir, setSortDir] = useState("asc");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
  const [columnFilters, setColumnFilters] = useState({});
  const [clearAllOpen, setClearAllOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState(null);
  const [activeTab, setActiveTab] = useState("overview");
  const [viewFilter, setViewFilter] = useState("all");
  const apiFilters = useMemo(() => {
    const filters = {
      clientId,
      page,
      limit: pageSize,
      sortBy: sortKey || "createdAt",
      sortOrder: sortKey ? sortDir : "desc",
    };

    if (viewFilter && viewFilter !== 'all') {
      filters.viewFilter = viewFilter;
    }

    if (debouncedSearch) filters.search = debouncedSearch;

    const effectiveStatus = columnFilters.status || (statusFilter !== "all" ? statusFilter : "");
    if (effectiveStatus) filters.status = effectiveStatus;
    if (columnFilters.priority) filters.priority = columnFilters.priority;
    if (columnFilters.dueDate) filters.dueDateFilter = columnFilters.dueDate;

    const assignedByFilter =
      columnFilters.assignedById || columnFilters.assignedBy || "";
    if (assignedByFilter) filters.assignedBy = assignedByFilter;

    return filters;
  }, [clientId, page, pageSize, sortKey, sortDir, debouncedSearch, statusFilter, columnFilters,viewFilter]);

  const { data: clientData, isLoading: clientLoading, error: clientError } = useGetClientProfileQuery(clientId, {
    skip: !clientId,
  });

  const { data: tasksData, isLoading: tasksLoading, error: tasksError } = useGetTasksQuery(apiFilters, { skip: !clientId });
  const [deleteTaskMutation] = useDeleteTaskMutation();

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchQuery), 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    if (clientError) {
      toast.error(clientError?.data?.message || "Failed to load client details");
    }
  }, [clientError]);

  useEffect(() => {
    if (tasksError) {
      toast.error(tasksError?.data?.message || "Failed to load tasks");
    }
  }, [tasksError]);

  const client = clientData?.data?.client;
  const normalizedClientId = client?._id || client?.id || clientId;
  const { data: qbStatusData } = useGetQuickBooksConnectionStatusQuery(normalizedClientId, {
    skip: !normalizedClientId,
  });
  const qbConnected = Boolean(qbStatusData?.data?.connected);
  const qbCompanyName = qbStatusData?.data?.companyName || "-";
  const qbLastSynced = qbStatusData?.data?.lastSyncedAt
    ? format(new Date(qbStatusData.data.lastSyncedAt), "MMM d, yyyy h:mm a")
    : "-";
  const subscriptionPlan = client?.subscription?.planName || client?.plan || "—";
  const subscriptionStatus = client?.subscription?.status || "—";
  const nextBillingDate = client?.subscription?.nextBillingDate
    ? format(new Date(client.subscription.nextBillingDate), "MMM d, yyyy")
    : "—";
  const paymentMethod = client?.subscription?.paymentMethod || client?.paymentMethod || "—";
  const assignedStaffName =
    client?.assignedStaffName ||
    client?.assignedStaff?.staffName ||
    getName(client?.assignedStaff);
  const assignedStaffEmail =
    client?.assignedStaffEmail ||
    client?.assignedStaff?.staffEmail ||
    client?.assignedStaff?.email ||
    "—";
  const resolvedAssignedStaffName = assignedStaffName && assignedStaffName !== "-" ? assignedStaffName : "Unassigned";
  const createTaskClientList = useMemo(() => {
    if (!client) return [];
    return [
      {
        _id: client._id || client.id || clientId,
        first_name: client.first_name || client.name || "",
        last_name: client.last_name || "",
        email: client.email || "",
      },
    ];
  }, [client, clientId]);
  const taskPayload = tasksData?.data;
  const taskPagination = taskPayload?.pagination || tasksData?.pagination || {};
  const isServerPaginated =
    Number.isFinite(taskPagination?.totalPages) &&
    Number.isFinite(taskPagination?.totalItems);
  const rawTasks = Array.isArray(taskPayload?.tasks)
    ? taskPayload.tasks
    : Array.isArray(taskPayload?.items)
      ? taskPayload.items
      : Array.isArray(taskPayload)
        ? taskPayload
        : [];
  const today = startOfDay(new Date());
  const weekStart = startOfWeek(today, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(today, { weekStartsOn: 1 });

  const normalizedTasks = useMemo(() => {
    const targetId = String(normalizedClientId || clientId || "");
    return rawTasks
      .filter((task) => {
        if (!targetId) return true;
        const taskClientId = String(task?.clientId?._id || task?.clientId?.id || task?.clientId || task?.client?._id || task?.client?.id || "");
        return taskClientId === targetId;
      })
      .map((task) => ({
        ...task,
        id: getTaskId(task),
        assignedByName: getName(task.assignedBy),
        assignedById: getId(task.assignedBy),
      }));
  }, [rawTasks, normalizedClientId, clientId]);

  const completedCount = normalizedTasks.filter((task) => task.status === "COMPLETED").length;
  const totalCount = normalizedTasks.length;
  const progressPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  const assignedByOptions = useMemo(() => {
    const map = new Map();
    normalizedTasks.forEach((task) => {
      if (task.assignedById && task.assignedByName && task.assignedByName !== "-") {
        map.set(task.assignedById, task.assignedByName);
      }
    });
    return Array.from(map.entries()).map(([value, label]) => ({ label, value }));
  }, [normalizedTasks]);

  const filtered = useMemo(() => {
    if (isServerPaginated) {
      return normalizedTasks;
    }

    let result = normalizedTasks;

    if (debouncedSearch) {
      const q = debouncedSearch.toLowerCase();
      result = result.filter(
        (task) =>
          String(task.title || "").toLowerCase().includes(q) ||
          String(task.description || "").toLowerCase().includes(q) ||
          String(task.assignedByName || "").toLowerCase().includes(q),
      );
    }

    if (statusFilter !== "all") {
      result = result.filter((task) => task.status === statusFilter);
    }

    const localAssignedBy =
      columnFilters.assignedById || columnFilters.assignedBy || "";
    if (localAssignedBy) {
      result = result.filter((task) => task.assignedById === localAssignedBy);
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
    ? Math.max(1, taskPagination.totalPages || 1)
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

  const handleTaskAction = async (action, task) => {
    const taskId = getTaskId(task);
    if (!taskId) return;
    const backTo = `${location.pathname}${location.search}`;

    if (action === "view") {
      navigate(`/admin/tasks/${taskId}`, { state: { backTo } });
      return;
    }
    if (action === "edit") {
      navigate(`/admin/tasks/${taskId}?mode=edit`, { state: { backTo } });
      return;
    }
    if (action === "delete") {
      setTaskToDelete(task);
      setDeleteConfirmOpen(true);
    }
  };

  const handleConfirmDeleteTask = async () => {
    const taskId = getTaskId(taskToDelete);
    if (!taskId) return;
    try {
      await deleteTaskMutation(taskId).unwrap();
      toast.success("Task deleted");
      setDeleteConfirmOpen(false);
      setTaskToDelete(null);
    } catch {
      toast.error("Failed to delete task");
    }
  };

  const handleCreateTask = async (taskData) => {
    try {
      await createTask({ ...taskData, clientId });
      setCreateOpen(false);
      toast.success("Task created");
    } catch {
      toast.error("Failed to create task");
    }
  };

  const activeStatusLabel = VIEW_FILTERS.find((item) => item.value === viewFilter )?.label || "All Tasks";
  const hasAnyFilter = statusFilter !== "all" || !!debouncedSearch || Object.keys(columnFilters).length > 0;

  const handleClearAll = () => {
    setSearchQuery("");
    setDebouncedSearch("");
    setStatusFilter("all");
    setColumnFilters({});
    setPage(1);
    setClearAllOpen(false);
    toast.success("All filters cleared");
  };

  const columns = [
    {
      key: "title",
      label: "Title",
      sortable: true,
      render: (task) => (
        <div>
          <div className="font-medium text-foreground">{task.title}</div>
          {task.description && <div className="text-xs text-muted-foreground mt-0.5">{task.description}</div>}
        </div>
      ),
    },
    {
      key: "assignedById",
      label: "Assigned By",
      sortable: true,
      filterable: true,
      filterSearchable: true,
      filterOptions: [{ label: "All", value: "" }, ...assignedByOptions],
      render: (task) => <span className="text-sm text-muted-foreground">{task.assignedByName}</span>,
    },
    {
      key: "status",
      label: "Status",
      sortable: true,
      filterable: true,
      filterSearchable: false,
      filterOptions: [
        { label: "All", value: "" },
        { label: "Not Started", value: "NOT_STARTED" },
        { label: "In Progress", value: "IN_PROGRESS" },
        { label: "Pending Review", value: "PENDING_REVIEW" },
        { label: "Needs Revision", value: "NEEDS_REVISION" },
        { label: "Completed", value: "COMPLETED" },
        { label: "Cancelled", value: "CANCELLED" },
      ],
      render: (task) => <TaskStatusBadge status={task.status} />,
    },
    {
      key: "priority",
      label: "Priority",
      sortable: true,
      filterable: true,
      filterSearchable: false,
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

  const rowActions = [
    { label: "View", value: "view" },
    { label: "Edit", value: "edit" },
    { label: "Delete", value: "delete", variant: "destructive" },
  ];

  if (!clientId) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
        <p className="text-lg mb-4">Invalid client ID</p>
        <Link to="/admin/clients">
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
          <p className="text-sm text-muted-foreground">Loading client details...</p>
        </div>
      </div>
    );
  }

  if (clientError || !client) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
        <p className="text-lg mb-4">{clientError?.data?.message || "Client not found"}</p>
        <Button variant="ghost" onClick={() => navigate("/admin/clients")} className="gap-2 self-start">
          <ArrowLeft className="h-4 w-4" /> Back
        </Button>
      </div>
    );
  }

  const fullName = getName(client) || "Unnamed Client";
  const initials = fullName
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
  const memberSince = client?.createdAt ? format(new Date(client.createdAt), "MMM d, yyyy") : "-";
  const pendingCount = normalizedTasks.filter((task) => !["COMPLETED", "CANCELLED"].includes(String(task.status || "").toUpperCase())).length;
  const overdueCount = normalizedTasks.filter(
    (task) =>
      !["COMPLETED", "CANCELLED"].includes(String(task.status || "").toUpperCase()) &&
      task.dueDate &&
      isBefore(new Date(task.dueDate), today),
  ).length;

  return (
    <div className="space-y-6 animate-fade-in">
      <Button variant="ghost" onClick={() => navigate("/admin/clients")} className="gap-2 self-start">
        <ArrowLeft className="h-4 w-4" /> Back
      </Button>

      <div className="rounded-xl border border-border bg-card p-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-start gap-4">
            <Avatar className="h-14 w-14">
              <AvatarFallback className="bg-primary/10 text-primary text-base font-semibold">
                {initials || "CL"}
              </AvatarFallback>
            </Avatar>
            <div className="space-y-1.5">
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl font-bold text-foreground">{fullName}</h1>
                  {client.status && (
                    <Badge
                      variant="outline"
                      className={cn(
                        "text-xs",
                        String(client.status).toLowerCase() === "active"
                          ? "bg-success/15 text-success border-success/30"
                          : "bg-muted text-muted-foreground border-border",
                      )}
                    >
                      {client.status}
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-muted-foreground">Client</p>
                <div className="flex flex-wrap items-center gap-3 mt-1 text-xs text-muted-foreground">
                  <span className="inline-flex items-center gap-1">
                    <Mail className="h-3.5 w-3.5" />
                    {client.email || "Unknown Client"}
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <Calendar className="h-3.5 w-3.5" />
                    Member since {memberSince}
                  </span>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-2 text-xs">
                <Badge variant="outline" className="bg-primary/10 text-primary border-primary/30">
                  Plan: {subscriptionPlan}
                </Badge>
                <Badge variant="outline" className="bg-emerald-100 text-emerald-700 border-emerald-200">
                  Subscription: {subscriptionStatus}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                Assigned Staff: <span className="text-foreground">{resolvedAssignedStaffName}</span> ({assignedStaffEmail || "—"})
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button onClick={() => setCreateOpen(true)} className="gap-2">
              <Plus className="h-4 w-4" /> Create Task
            </Button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-6 gap-3">
        <div className="rounded-xl border border-border bg-card p-4">
          <p className="text-xs text-muted-foreground">Total Tasks</p>
          <div className="mt-2 flex items-center justify-between">
            <p className="text-3xl font-bold">{totalCount}</p>
            <ListChecks className="h-5 w-5 text-blue-600" />
          </div>
        </div>
        <div className="rounded-xl border border-border bg-card p-4">
          <p className="text-xs text-muted-foreground">Pending Tasks</p>
          <div className="mt-2 flex items-center justify-between">
            <p className="text-3xl font-bold">{pendingCount}</p>
            <Clock3 className="h-5 w-5 text-orange-600" />
          </div>
        </div>
        <div className="rounded-xl border border-border bg-card p-4">
          <p className="text-xs text-muted-foreground">Completed Tasks</p>
          <div className="mt-2 flex items-center justify-between">
            <p className="text-3xl font-bold">{completedCount}</p>
            <CheckCircle2 className="h-5 w-5 text-green-600" />
          </div>
        </div>
        <div className="rounded-xl border border-border bg-card p-4">
          <p className="text-xs text-muted-foreground">Overdue Tasks</p>
          <div className="mt-2 flex items-center justify-between">
            <p className="text-3xl font-bold">{overdueCount}</p>
            <AlertTriangle className="h-5 w-5 text-destructive" />
          </div>
        </div>
        <div className="rounded-xl border border-border bg-card p-4">
          <p className="text-xs text-muted-foreground">Progress</p>
          <div className="mt-2 flex items-center justify-between">
            <p className="text-3xl font-bold">{progressPercent}%</p>
            <CheckCircle2 className="h-5 w-5 text-primary" />
          </div>
        </div>
        <div className="rounded-xl border border-border bg-card p-4">
          <p className="text-xs text-muted-foreground">Assigned Staff</p>
          <div className="mt-2 flex items-center justify-between">
            <p className="text-3xl font-bold">{resolvedAssignedStaffName === "Unassigned" ? 0 : 1}</p>
            <UserCheck className="h-5 w-5 text-primary" />
          </div>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="w-full justify-start">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="tasks">Tasks ({totalCount})</TabsTrigger>
          <TabsTrigger value="quickbooks">QuickBooks</TabsTrigger>
          <TabsTrigger value="billing">Billing</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="rounded-xl border border-border bg-card p-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center text-sm font-semibold">
                    QB
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">QuickBooks Online</p>
                    <p className="text-xs text-muted-foreground">Connection managed by client</p>
                  </div>
                </div>
                <span
                  className={cn(
                    "rounded-full px-2.5 py-1 text-xs font-medium",
                    qbConnected ? "bg-emerald-100 text-emerald-700" : "bg-muted text-muted-foreground"
                  )}
                >
                  {qbConnected ? "Connected" : "Not connected"}
                </span>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-xs text-muted-foreground">Company</p>
                  <p className="font-medium text-foreground">{qbCompanyName}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Last Synced</p>
                  <p className="font-medium text-foreground">{qbLastSynced}</p>
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-border bg-card p-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center text-sm font-semibold">
                    SUB
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">Subscription</p>
                    <p className="text-xs text-muted-foreground">Billing overview</p>
                  </div>
                </div>
                <span className="rounded-full bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary">
                  {subscriptionStatus}
                </span>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-xs text-muted-foreground">Plan</p>
                  <p className="font-medium text-foreground">{subscriptionPlan}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Next Billing</p>
                  <p className="font-medium text-foreground">{nextBillingDate}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Payment Method</p>
                  <p className="font-medium text-foreground">{paymentMethod}</p>
                </div>
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="tasks" className="space-y-4">
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div className="relative flex-1 min-w-[220px] max-w-md">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
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

            <div className="flex items-center gap-2">
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
                    <span>{activeStatusLabel}</span>
                    <ChevronDown className="h-3.5 w-3.5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="bg-popover z-50 min-w-[180px]">
                  {VIEW_FILTERS.map((item) => (
                    <DropdownMenuItem
                      key={item.value}
                      onClick={() => {
                        setViewFilter(item.value);
                        setPage(1);
                      }}
                      className="flex items-center justify-between"
                    >
                      <span>{item.label}</span>
                      {viewFilter === item.value && <Check className="h-3.5 w-3.5 text-primary" />}
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
          </div>

          <DataTable
            data={paginatedTasks}
            columns={columns}
            onSort={handleSort}
            onRowAction={handleTaskAction}
            rowActions={rowActions}
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
            totalItems={isServerPaginated ? taskPagination.totalItems || filtered.length : filtered.length}
            pageSize={pageSize}
            onPageSizeChange={setPageSize}
          />
        </TabsContent>

        <TabsContent value="quickbooks" className="space-y-4">
          <div>
            <h2 className="text-lg font-semibold text-foreground">QuickBooks</h2>
            <p className="text-sm text-muted-foreground">
              Connection status and synced financial data for this client.
            </p>
          </div>
          <QuickBooksData
            clientId={client?._id || client?.id || clientId}
            readOnly
            showTitle={false}
          />
        </TabsContent>

        <TabsContent value="billing" className="space-y-4">
          <div className="rounded-xl border border-border bg-card p-6">
            <h3 className="text-lg font-semibold text-foreground">Billing</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Billing details will appear here in a future update.
            </p>
          </div>
        </TabsContent>
      </Tabs>

      <CreateTaskWizard
        open={createOpen}
        onOpenChange={setCreateOpen}
        onCreate={handleCreateTask}
        defaultTarget="client"
        clientList={createTaskClientList}
        defaultClientId={client?._id || client?.id || clientId}
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

      <ConfirmDialog
        open={deleteConfirmOpen}
        onOpenChange={(open) => {
          setDeleteConfirmOpen(open);
          if (!open) setTaskToDelete(null);
        }}
        title="Delete this task?"
        description={`This action cannot be undone. ${taskToDelete?.title ? `Task: ${taskToDelete.title}` : ""}`}
        confirmLabel="Delete"
        variant="destructive"
        onConfirm={handleConfirmDeleteTask}
      />
    </div>
  );
}
