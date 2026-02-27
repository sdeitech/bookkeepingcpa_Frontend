import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useGetStaffClientsQuery, useDeactivateStaffMutation, useReactivateStaffMutation } from "@/features/auth/authApi";
import { useGetTasksQuery } from "@/features/tasks/tasksApi";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DataTable } from "@/components/common/DataTable";
import { PaginationControls } from "@/components/ui/pagination-controls";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { TaskPriorityBadge, TaskStatusBadge } from "@/components/new_Admin/TaskStatusBadge";
import {
  ArrowLeft,
  Mail,
  Phone,
  Calendar,
  UserCheck,
  ListChecks,
  Clock3,
  CheckCircle2,
  AlertTriangle,
  UserPlus,
  Plus,
  Loader2,
  UserX,
  Building2,
  Eye,
  Check,
  ChevronDown,
  X,
} from "lucide-react";
import { format, isBefore, startOfDay } from "date-fns";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const DEFAULT_PAGE_SIZE = 10;
const CLIENT_FILTERS = [
  { label: "All Clients", value: "all" },
  { label: "Active", value: "active" },
  { label: "Inactive", value: "inactive" },
];
const TASK_ROW_ACTIONS = [
  { label: "View", value: "view" },
  { label: "Edit", value: "edit" },
];
const toNumber = (value) => {
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
};
const pickPagination = (source) => {
  const p =
    source?.data?.pagination ||
    source?.pagination ||
    source?.data?.pageInfo ||
    source?.pageInfo ||
    {};

  const totalItems = toNumber(p.totalItems ?? p.total ?? p.count);
  const itemsPerPage = toNumber(p.itemsPerPage ?? p.limit ?? p.pageSize);
  const explicitTotalPages = toNumber(p.totalPages ?? p.pages ?? p.pageCount);
  const totalPages =
    explicitTotalPages !== null
      ? explicitTotalPages
      : (totalItems !== null && itemsPerPage !== null && itemsPerPage > 0
          ? Math.max(1, Math.ceil(totalItems / itemsPerPage))
          : null);

  return {
    totalPages,
    totalItems,
    currentPage: toNumber(p.currentPage ?? p.page ?? p.pageNumber),
    itemsPerPage,
  };
};

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

const isTaskOpen = (status) => !["COMPLETED", "CANCELLED"].includes(String(status || "").toUpperCase());
const toClientStatus = (client) => {
  const rawActive = client?.active;
  if (typeof rawActive === "boolean") return rawActive ? "active" : "inactive";

  const activeText = String(rawActive || "").toLowerCase();
  if (activeText === "true" || activeText === "1") return "active";
  if (activeText === "false" || activeText === "0") return "inactive";

  const rawStatus = String(client?.status || "").toLowerCase();
  if (rawStatus === "active") return "active";
  if (rawStatus === "inactive") return "inactive";

  return "active";
};

export default function AdminStaffDetail() {
  const { staffId } = useParams();
  const navigate = useNavigate();
  const today = startOfDay(new Date());

  const [activeTab, setActiveTab] = useState("clients");
  const [clientSearch, setClientSearch] = useState("");
  const [taskSearch, setTaskSearch] = useState("");
  const [debouncedClientSearch, setDebouncedClientSearch] = useState("");
  const [debouncedTaskSearch, setDebouncedTaskSearch] = useState("");
  const [clientsPage, setClientsPage] = useState(1);
  const [tasksPage, setTasksPage] = useState(1);
  const [clientsPageSize, setClientsPageSize] = useState(DEFAULT_PAGE_SIZE);
  const [tasksPageSize, setTasksPageSize] = useState(DEFAULT_PAGE_SIZE);
  const [clientFilter, setClientFilter] = useState("all");
  const [clientSortField, setClientSortField] = useState("name");
  const [clientSortAsc, setClientSortAsc] = useState(true);
  const [taskSortKey, setTaskSortKey] = useState("dueDate");
  const [taskSortDir, setTaskSortDir] = useState("asc");
  const [taskColumnFilters, setTaskColumnFilters] = useState({});
  const [deactivateConfirmOpen, setDeactivateConfirmOpen] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedClientSearch(clientSearch), 300);
    return () => clearTimeout(timer);
  }, [clientSearch]);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedTaskSearch(taskSearch), 300);
    return () => clearTimeout(timer);
  }, [taskSearch]);

  const clientFilters = useMemo(() => {
    const filters = {
      page: clientsPage,
      limit: clientsPageSize,
      sortBy: clientSortField,
      sortOrder: clientSortAsc ? "asc" : "desc",
    };
    if (debouncedClientSearch) filters.search = debouncedClientSearch;
    if (clientFilter !== "all") filters.status = clientFilter;
    return filters;
  }, [clientsPage, clientsPageSize, debouncedClientSearch, clientFilter, clientSortField, clientSortAsc]);

  const { data: staffClientsData, isLoading: staffLoading, error: staffError, refetch } = useGetStaffClientsQuery(
    { staffId, ...clientFilters },
    { skip: !staffId },
  );
  const [deactivateStaff] = useDeactivateStaffMutation();
  const [reactivateStaff] = useReactivateStaffMutation();

  const taskFilters = useMemo(() => {
    const filters = {
      staffId,
      assignedTo: staffId,
      page: tasksPage,
      limit: tasksPageSize,
      sortBy: taskSortKey || "dueDate",
      sortOrder: taskSortDir || "asc",
    };
    if (debouncedTaskSearch) filters.search = debouncedTaskSearch;
    if (taskColumnFilters.clientName) filters.clientId = taskColumnFilters.clientName;
    if (taskColumnFilters.status) filters.status = String(taskColumnFilters.status).toUpperCase();
    if (taskColumnFilters.priority) filters.priority = String(taskColumnFilters.priority).toUpperCase();
    if (taskColumnFilters.dueDate) filters.dueDateFilter = taskColumnFilters.dueDate;
    return filters;
  }, [staffId, tasksPage, tasksPageSize, taskSortKey, taskSortDir, debouncedTaskSearch, taskColumnFilters]);
  const { data: tasksData, isLoading: tasksLoading } = useGetTasksQuery(taskFilters, { skip: !staffId });

  const payload = staffClientsData?.data || {};
  const staff = payload?.staff || null;
  const clientsPagination = pickPagination(staffClientsData);
  const clientsTotalPagesFromServer = clientsPagination.totalPages;
  const clientsTotalItemsFromServer = clientsPagination.totalItems;
  const clientsCurrentPageFromServer = clientsPagination.currentPage;
  const clientsItemsPerPageFromServer = clientsPagination.itemsPerPage;
  const clientsIsServerPaginated =
    clientsTotalPagesFromServer !== null && clientsTotalItemsFromServer !== null;
  const rawClients = Array.isArray(payload?.clients)
    ? payload.clients
    : Array.isArray(payload?.items)
      ? payload.items
      : Array.isArray(staffClientsData?.clients)
        ? staffClientsData.clients
        : Array.isArray(staffClientsData?.items)
          ? staffClientsData.items
      : [];

  const rawTasks = Array.isArray(tasksData?.data?.tasks)
    ? tasksData.data.tasks
    : Array.isArray(tasksData?.data?.items)
      ? tasksData.data.items
      : Array.isArray(tasksData?.tasks)
        ? tasksData.tasks
        : Array.isArray(tasksData?.items)
          ? tasksData.items
      : [];
  const tasksPagination = pickPagination(tasksData);
  const tasksTotalPagesFromServer = tasksPagination.totalPages;
  const tasksTotalItemsFromServer = tasksPagination.totalItems;
  const tasksCurrentPageFromServer = tasksPagination.currentPage;
  const tasksItemsPerPageFromServer = tasksPagination.itemsPerPage;
  const tasksIsServerPaginated =
    tasksTotalPagesFromServer !== null && tasksTotalItemsFromServer !== null;
  const taskFilterOptions = tasksData?.data?.filterOptions || { clients: [] };

  const normalizedTasks = useMemo(() => {
    const scopedTasks = tasksIsServerPaginated
      ? rawTasks
      : rawTasks.filter((task) => {
          const assignedToId = getId(task.assignedTo);
          const taskStaffId = getId(task.staffId);
          return String(assignedToId) === String(staffId) || String(taskStaffId) === String(staffId);
        });

    return scopedTasks
      .map((task) => ({
        ...task,
        id: getId(task),
        clientId: getId(task.clientId),
        clientName: getName(task.clientId) || "Internal",
        assignedToId: getId(task.assignedTo),
        assignedToName: getName(task.assignedTo) || "-",
        assignedByName: getName(task.assignedBy) || "-",
        assignedById: getId(task.assignedBy),
        assignedToRole: task.assignedToRole ? String(task.assignedToRole).toLowerCase() : "",
        status: toLowerStatus(task.status),
        priority: toLowerPriority(task.priority),
        rawStatus: String(task.status || ""),
      }));
  }, [rawTasks, staffId, tasksIsServerPaginated]);
  const taskClientFilterOptions = useMemo(() => {
    const fromApi = taskFilterOptions?.clients || [];
    if (fromApi.length > 0) return fromApi;

    const seen = new Map();
    normalizedTasks.forEach((task) => {
      if (!task.clientId) return;
      if (!seen.has(task.clientId)) {
        seen.set(task.clientId, { value: task.clientId, label: task.clientName || "Unknown Client" });
      }
    });
    return Array.from(seen.values());
  }, [taskFilterOptions, normalizedTasks]);

  const normalizedClients = useMemo(() => {
    return rawClients.map((item) => {
      const client = item?.clientId && typeof item.clientId === "object" ? item.clientId : item;
      const id = getId(client);
      const openTasks =
        Number(item?.openTasks ?? client?.openTasks) ||
        normalizedTasks.filter((task) => String(task.clientId) === String(id) && isTaskOpen(task.rawStatus)).length;

      const plan =
        client?.plan ||
        client?.subscription?.planName ||
        client?.subscriptionPlan?.name ||
        "Standard";

      const assignedDate = item?.assignedAt || item?.createdAt || client?.createdAt;
      const status = toClientStatus(client);

      return {
        ...client,
        id,
        fullName: getName(client) || "Unnamed Client",
        company: client?.company || client?.companyName || client?.businessName || "-",
        plan,
        status,
        assignedDate,
        openTasks,
        totalTasks: normalizedTasks.filter((task) => String(task.clientId) === String(id)).length,
        completedTasks: normalizedTasks.filter(
          (task) => String(task.clientId) === String(id) && String(task.rawStatus || "").toUpperCase() === "COMPLETED",
        ).length,
      };
    });
  }, [rawClients, normalizedTasks]);

  const filteredClients = useMemo(() => {
    let result = [...normalizedClients];
    const q = clientSearch.trim().toLowerCase();
    if (!clientsIsServerPaginated && q) {
      result = result.filter((client) =>
        [client.fullName, client.email, client.company].some((value) => String(value || "").toLowerCase().includes(q)),
      );
    }
    // Always enforce status filter on frontend as safety, even with server pagination.
    if (clientFilter === "active") result = result.filter((client) => client.status === "active");
    if (clientFilter === "inactive") result = result.filter((client) => client.status === "inactive");

    if (!clientsIsServerPaginated) {
      result.sort((a, b) => {
        const aVal = clientSortField === "name" ? a.fullName : String(a[clientSortField] ?? "");
        const bVal = clientSortField === "name" ? b.fullName : String(b[clientSortField] ?? "");
        const cmp = String(aVal).toLowerCase().localeCompare(String(bVal).toLowerCase());
        return clientSortAsc ? cmp : -cmp;
      });
    }

    return result;
  }, [clientsIsServerPaginated, normalizedClients, clientSearch, clientFilter, clientSortField, clientSortAsc]);

  const filteredTasks = useMemo(() => {
    if (tasksIsServerPaginated) return normalizedTasks;

    let result = [...normalizedTasks];
    const q = taskSearch.trim().toLowerCase();
    if (q) {
      result = result.filter((task) =>
        [task.title, task.clientName, task.assignedByName].some((value) => String(value || "").toLowerCase().includes(q)),
      );
    }

    if (taskColumnFilters.status) {
      result = result.filter((task) => task.status === taskColumnFilters.status);
    }
    if (taskColumnFilters.clientName) {
      result = result.filter((task) => task.clientId === taskColumnFilters.clientName);
    }
    if (taskColumnFilters.priority) {
      result = result.filter((task) => task.priority === taskColumnFilters.priority);
    }
    if (taskColumnFilters.dueDate) {
      const dueDateFilter = taskColumnFilters.dueDate;
      if (dueDateFilter === "overdue") {
        result = result.filter((task) => task.status !== "completed" && task.dueDate && isBefore(new Date(task.dueDate), today));
      } else if (dueDateFilter === "today") {
        const todayKey = format(today, "yyyy-MM-dd");
        result = result.filter((task) => task.dueDate && format(new Date(task.dueDate), "yyyy-MM-dd") === todayKey);
      }
    }

    if (taskSortKey) {
      result = [...result].sort((a, b) => {
        const aVal = String(a[taskSortKey] ?? "");
        const bVal = String(b[taskSortKey] ?? "");
        return taskSortDir === "asc" ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
      });
    }
    return result;
  }, [tasksIsServerPaginated, normalizedTasks, taskSearch, taskColumnFilters, today, taskSortKey, taskSortDir]);

  const clientsTotalPages = clientsIsServerPaginated
    ? Math.max(1, clientsTotalPagesFromServer || 1)
    : Math.max(1, Math.ceil(filteredClients.length / clientsPageSize));
  const tasksTotalPages = tasksIsServerPaginated
    ? Math.max(1, tasksTotalPagesFromServer || 1)
    : Math.max(1, Math.ceil(filteredTasks.length / tasksPageSize));

  useEffect(() => {
    if (clientsPage > clientsTotalPages) setClientsPage(clientsTotalPages);
  }, [clientsPage, clientsTotalPages]);

  useEffect(() => {
    if (tasksPage > tasksTotalPages) setTasksPage(tasksTotalPages);
  }, [tasksPage, tasksTotalPages]);

  useEffect(() => {
    setClientsPage(1);
  }, [debouncedClientSearch, clientsPageSize, clientFilter, clientSortField, clientSortAsc]);

  useEffect(() => {
    setTasksPage(1);
  }, [debouncedTaskSearch, tasksPageSize]);

  useEffect(() => {
    setTasksPage(1);
  }, [taskColumnFilters, taskSortKey, taskSortDir]);

  const paginatedClients = useMemo(
    () =>
      clientsIsServerPaginated
        ? filteredClients
        : filteredClients.slice((clientsPage - 1) * clientsPageSize, clientsPage * clientsPageSize),
    [clientsIsServerPaginated, filteredClients, clientsPage, clientsPageSize],
  );

  const paginatedTasks = useMemo(
    () =>
      tasksIsServerPaginated
        ? filteredTasks
        : filteredTasks.slice((tasksPage - 1) * tasksPageSize, tasksPage * tasksPageSize),
    [tasksIsServerPaginated, filteredTasks, tasksPage, tasksPageSize],
  );

  const stats = useMemo(() => {
    const clientStats = payload?.stats || {};
    const taskStats = tasksData?.data?.stats || {};
    const totalClients =
      clientStats.totalClients ??
      (clientsIsServerPaginated ? clientsTotalItemsFromServer || normalizedClients.length : normalizedClients.length);
    const activeClients =
      clientStats.activeClients ??
      normalizedClients.filter((client) => client.status === "active").length;
    const totalTasks = taskStats.totalTasks ?? (tasksIsServerPaginated ? tasksTotalItemsFromServer || normalizedTasks.length : normalizedTasks.length);
    const pendingTasks =
      taskStats.pendingTasks ??
      normalizedTasks.filter((task) => task.rawStatus === "NOT_STARTED" || task.rawStatus === "IN_PROGRESS").length;
    const completedTasks = taskStats.completedTasks ?? normalizedTasks.filter((task) => task.rawStatus === "COMPLETED").length;
    const overdueTasks =
      taskStats.overdueTasks ??
      normalizedTasks.filter((task) => task.rawStatus !== "COMPLETED" && task.dueDate && isBefore(new Date(task.dueDate), today)).length;

    return { totalClients, activeClients, totalTasks, pendingTasks, completedTasks, overdueTasks };
  }, [payload, tasksData, clientsIsServerPaginated, clientsTotalItemsFromServer, tasksIsServerPaginated, tasksTotalItemsFromServer, normalizedClients, normalizedTasks, today]);
  const activeClientFilterLabel = CLIENT_FILTERS.find((item) => item.value === clientFilter)?.label || "All Clients";
  const hasAnyClientFilter = clientFilter !== "all" || !!debouncedClientSearch;

  const handleStaffToggleStatus = async () => {
    if (!staff) return;
    try {
      if (staff.active) {
        await deactivateStaff(staff._id).unwrap();
        toast.success("Staff deactivated");
      } else {
        await reactivateStaff(staff._id).unwrap();
        toast.success("Staff activated");
      }
      await refetch();
    } catch (error) {
      toast.error(error?.data?.message || "Failed to update staff status");
    } finally {
      setDeactivateConfirmOpen(false);
    }
  };

  const handleTaskAction = (action, row) => {
    if (action === "view") {
      navigate(`/admin/tasks/${row.id}`);
      return;
    }
    if (action === "edit") {
      navigate(`/admin/tasks/${row.id}?mode=edit`);
    }
  };

  const handleTaskSort = (key, dir) => {
    setTaskSortKey(key);
    setTaskSortDir(dir);
  };
  const handleClientSort = (key, dir) => {
    setClientSortField(key);
    setClientSortAsc(dir === "asc");
  };

  const handleTaskColumnFilterChange = (columnKey, value) => {
    setTaskColumnFilters((prev) => {
      const next = { ...prev };
      if (!value) delete next[columnKey];
      else next[columnKey] = value;
      return next;
    });
  };

  const clientColumns = [
    {
      key: "name",
      label: "Client",
      sortable: true,
      render: (row) => (
        <div className="flex items-center gap-3">
          <Avatar className="h-8 w-8">
            <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
              {row.fullName
                .split(" ")
                .filter(Boolean)
                .slice(0, 2)
                .map((n) => n[0])
                .join("") || "U"}
            </AvatarFallback>
          </Avatar>
          <span className="font-medium text-foreground">{row.fullName}</span>
        </div>
      ),
    },
    {
      key: "email",
      label: "Email",
      sortable: true,
      render: (row) => <span className="text-sm text-muted-foreground">{row.email || "-"}</span>,
    },
    {
      key: "totalTasks",
      label: "Tasks",
      sortable: true,
      render: (row) => (
        <span className="text-sm text-muted-foreground">
          <span className="font-semibold text-foreground">{row.completedTasks}</span>/{row.totalTasks}
        </span>
      ),
    },
    {
      key: "status",
      label: "Status",
      sortable: true,
      render: (row) => (
        <Badge
          variant="outline"
          className={cn(
            "text-xs",
            row.status === "active"
              ? "bg-success/15 text-success border-success/30"
              : "bg-muted text-muted-foreground border-border",
          )}
        >
          {row.status === "active" ? "Active" : "Inactive"}
        </Badge>
      ),
    },
    {
      key: "actions",
      label: "Actions",
      render: (row) => (
        <div className="ml-2 flex w-8 items-center justify-end">
          <Button
            size="icon"
            variant="ghost"
            className="h-8 w-8"
            onClick={() => navigate(`/admin/clients/${row.id}`)}
            title="View Client"
            aria-label="View Client"
          >
            <Eye className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];

  const taskColumns = [
    {
      key: "title",
      label: "Task Title",
      sortable: true,
      render: (row) => <span className="font-medium text-foreground">{row.title || "Untitled Task"}</span>,
    },
    {
      key: "clientName",
      label: "Client",
      sortable: true,
      filterable: true,
      filterOptions: [{ label: "All", value: "" }, ...taskClientFilterOptions],
    },
    {
      key: "taskType",
      label: "Type",
      sortable: true,
      render: (row) => <span className="text-xs uppercase text-muted-foreground">{String(row.taskType || "-").replace(/_/g, " ")}</span>,
    },
    {
      key: "assignedToId",
      label: "Assigned To",
      sortable: true,
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
      render: (row) => <span className="text-muted-foreground">{row.assignedByName}</span>,
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
          ],
        },
      ],
      render: (row) => <span>{row.dueDate ? format(new Date(row.dueDate), "MMM d, yyyy") : "-"}</span>,
    },
  ];

  if (staffLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Loading staff details...</p>
        </div>
      </div>
    );
  }

  if (staffError || !staff) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
        <p className="text-lg mb-4">{staffError ? "Failed to load staff member." : "Staff member not found."}</p>
        <Link to="/admin/staff">
          <Button variant="outline">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Staff
          </Button>
        </Link>
      </div>
    );
  }

  const fullName = getName(staff) || "Unnamed Staff";
  const initials = fullName
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();

  return (
    <div className="space-y-6 animate-fade-in">
      <Link
        to="/admin/staff"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="h-4 w-4" /> Back to Staff
      </Link>

      <div className="rounded-xl border border-border bg-card p-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-start gap-4">
            <div className="h-14 w-14 rounded-full bg-primary/10 text-primary flex items-center justify-center font-semibold">
              {initials || "SM"}
            </div>
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold text-foreground">{fullName}</h1>
                <Badge
                  variant="outline"
                  className={staff.active ? "bg-success/15 text-success border-success/30" : "bg-muted text-muted-foreground border-muted"}
                >
                  {staff.active ? "Active" : "Inactive"}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">Staff Member</p>
              <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                <span className="inline-flex items-center gap-1"><Mail className="h-3.5 w-3.5" /> {staff.email || "-"}</span>
                <span className="inline-flex items-center gap-1"><Phone className="h-3.5 w-3.5" /> {staff.phoneNumber || "-"}</span>
                <span className="inline-flex items-center gap-1">
                  <Calendar className="h-3.5 w-3.5" />
                  Member since {staff.createdAt ? format(new Date(staff.createdAt), "MMM d, yyyy") : "-"}
                </span>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {/* <Button variant="outline" onClick={() => toast.info("Edit staff will be added next")}>Edit</Button> */}
            <Button
              variant={staff.active ? "outline" : "default"}
              onClick={() => {
                if (staff.active) setDeactivateConfirmOpen(true);
                else handleStaffToggleStatus();
              }}
              className="gap-2"
            >
              {staff.active ? <UserX className="h-4 w-4" /> : <UserCheck className="h-4 w-4" />}
              {staff.active ? "Deactivate" : "Activate"}
            </Button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-6 gap-3">
        <div className="rounded-xl border border-border bg-card p-4">
          <p className="text-xs text-muted-foreground">Total Clients</p>
          <div className="mt-2 flex items-center justify-between">
            <p className="text-3xl font-bold">{stats.totalClients}</p>
            <UserCheck className="h-5 w-5 text-primary" />
          </div>
        </div>
        <div className="rounded-xl border border-border bg-card p-4">
          <p className="text-xs text-muted-foreground">Active Clients</p>
          <div className="mt-2 flex items-center justify-between">
            <p className="text-3xl font-bold">{stats.activeClients}</p>
            <UserPlus className="h-5 w-5 text-green-600" />
          </div>
        </div>
        <div className="rounded-xl border border-border bg-card p-4">
          <p className="text-xs text-muted-foreground">Total Tasks</p>
          <div className="mt-2 flex items-center justify-between">
            <p className="text-3xl font-bold">{stats.totalTasks}</p>
            <ListChecks className="h-5 w-5 text-blue-600" />
          </div>
        </div>
        <div className="rounded-xl border border-border bg-card p-4">
          <p className="text-xs text-muted-foreground">Pending Tasks</p>
          <div className="mt-2 flex items-center justify-between">
            <p className="text-3xl font-bold">{stats.pendingTasks}</p>
            <Clock3 className="h-5 w-5 text-orange-600" />
          </div>
        </div>
        <div className="rounded-xl border border-border bg-card p-4">
          <p className="text-xs text-muted-foreground">Completed Tasks</p>
          <div className="mt-2 flex items-center justify-between">
            <p className="text-3xl font-bold">{stats.completedTasks}</p>
            <CheckCircle2 className="h-5 w-5 text-green-600" />
          </div>
        </div>
        <div className="rounded-xl border border-border bg-card p-4">
          <p className="text-xs text-muted-foreground">Overdue Tasks</p>
          <div className="mt-2 flex items-center justify-between">
            <p className="text-3xl font-bold">{stats.overdueTasks}</p>
            <AlertTriangle className="h-5 w-5 text-destructive" />
          </div>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="w-full justify-start">
          <TabsTrigger value="clients">Assigned Clients ({normalizedClients.length})</TabsTrigger>
          <TabsTrigger value="tasks">Assigned Tasks ({normalizedTasks.length})</TabsTrigger>
          <TabsTrigger value="activity">Activity Log</TabsTrigger>
        </TabsList>

        <TabsContent value="clients" className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="relative w-full max-w-sm min-w-[220px]">
              <Input
                placeholder="Search name or email..."
                value={clientSearch}
                onChange={(e) => {
                  setClientSearch(e.target.value);
                  setClientsPage(1);
                }}
              />
            </div>

            <div className="flex items-center gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant={clientFilter !== "all" ? "default" : "outline"}
                    className={cn(
                      "h-10 gap-2",
                      clientFilter !== "all"
                        ? "border-primary bg-primary text-primary-foreground hover:bg-primary/90"
                        : "border-border text-foreground hover:bg-accent",
                    )}
                  >
                    <span>{activeClientFilterLabel}</span>
                    <ChevronDown className="h-3.5 w-3.5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="bg-popover z-50 min-w-[160px]">
                  {CLIENT_FILTERS.map((item) => (
                    <DropdownMenuItem
                      key={item.value}
                      onClick={() => {
                        setClientFilter(item.value);
                        setClientsPage(1);
                      }}
                      className="flex items-center justify-between"
                    >
                      <span>{item.label}</span>
                      {clientFilter === item.value && <Check className="h-3.5 w-3.5 text-primary" />}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>

              {hasAnyClientFilter && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-10 gap-1.5 text-muted-foreground hover:text-destructive"
                  onClick={() => {
                    setClientSearch("");
                    setDebouncedClientSearch("");
                    setClientFilter("all");
                    setClientsPage(1);
                  }}
                >
                  <X className="h-3.5 w-3.5" />
                  Clear All
                </Button>
              )}
            </div>
          </div>

          <DataTable
            data={paginatedClients}
            columns={clientColumns}
            onSort={handleClientSort}
            getRowId={(row) => row.id}
            emptyMessage="No assigned clients found."
            emptyDescription="Assign a client to this staff member to get started."
          />

          <PaginationControls
            page={clientsIsServerPaginated ? clientsCurrentPageFromServer || clientsPage : clientsPage}
            totalPages={clientsTotalPages}
            totalItems={clientsIsServerPaginated ? clientsTotalItemsFromServer || filteredClients.length : filteredClients.length}
            pageSize={clientsIsServerPaginated ? clientsItemsPerPageFromServer || clientsPageSize : clientsPageSize}
            onPageChange={setClientsPage}
            onPageSizeChange={setClientsPageSize}
          />
        </TabsContent>

        <TabsContent value="tasks" className="space-y-4">
          <div className="flex items-center justify-between gap-3">
            <div className="relative w-full max-w-sm">
              <Input
                placeholder="Search by title, client..."
                value={taskSearch}
                onChange={(e) => {
                  setTaskSearch(e.target.value);
                  setTasksPage(1);
                }}
              />
            </div>
            <Button variant="outline" className="gap-2" onClick={() => navigate("/admin/tasks")}>
              <ListChecks className="h-4 w-4" /> Manage Tasks
            </Button>
          </div>

          <DataTable
            data={paginatedTasks}
            columns={taskColumns}
            onSort={handleTaskSort}
            rowActions={TASK_ROW_ACTIONS}
            onRowAction={handleTaskAction}
            loading={tasksLoading}
            columnFilters={taskColumnFilters}
            onColumnFilterChange={handleTaskColumnFilterChange}
            getRowId={(row) => row.id}
            emptyMessage="No assigned tasks found."
            emptyDescription="Tasks assigned to this staff will appear here."
          />

          <PaginationControls
            page={tasksIsServerPaginated ? tasksCurrentPageFromServer || tasksPage : tasksPage}
            totalPages={tasksTotalPages}
            totalItems={tasksIsServerPaginated ? tasksTotalItemsFromServer || filteredTasks.length : filteredTasks.length}
            pageSize={tasksIsServerPaginated ? tasksItemsPerPageFromServer || tasksPageSize : tasksPageSize}
            onPageChange={setTasksPage}
            onPageSizeChange={setTasksPageSize}
          />
        </TabsContent>

        <TabsContent value="activity">
          <div className="rounded-xl border border-border bg-card p-6 text-center text-muted-foreground">
            <Building2 className="h-8 w-8 mx-auto mb-3" />
            Activity log will be added once audit events are available in API.
          </div>
        </TabsContent>
      </Tabs>

      <ConfirmDialog
        open={deactivateConfirmOpen}
        onOpenChange={setDeactivateConfirmOpen}
        title="Deactivate Staff?"
        description="This will disable staff access until reactivated."
        confirmLabel="Deactivate"
        variant="destructive"
        onConfirm={handleStaffToggleStatus}
      />
    </div>
  );
}
