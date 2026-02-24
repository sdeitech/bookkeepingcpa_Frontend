import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { PaginationControls } from "@/components/ui/pagination-controls";
import { DataTable } from "@/components/common/DataTable";
import { useTasks } from "@/hooks/useTasks";
import { useGetMyClientsQuery } from "@/features/auth/authApi";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import {
  Users,
  UserCheck,
  UserX,
  ListChecks,
  Check,
  ChevronDown,
  X,
  Eye,
} from "lucide-react";

const DEFAULT_PAGE_SIZE = 10;
const CLIENT_FILTERS = [
  { label: "All Clients", value: "all" },
  { label: "Active", value: "active" },
  { label: "Inactive", value: "inactive" },
];

const getClientId = (client) => client?._id || client?.id;
const getTaskClientId = (task) => task?.clientId || task?.client?._id || task?.client?.id;
const getClientName = (client) => {
  if (client?.first_name || client?.last_name) {
    return [client?.first_name, client?.last_name].filter(Boolean).join(" ");
  }
  return client?.name || "Unnamed Client";
};

export default function StaffClients() {
  const navigate = useNavigate();
  const { tasks = [], isLoading: tasksLoading } = useTasks();

  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [sortField, setSortField] = useState("name");
  const [sortAsc, setSortAsc] = useState(true);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
  const [clearFiltersOpen, setClearFiltersOpen] = useState(false);
  const apiFilters = useMemo(() => {
    const filters = {
      page,
      limit: pageSize,
      sortBy: sortField,
      sortOrder: sortAsc ? "asc" : "desc",
    };
    if (debouncedSearch) filters.search = debouncedSearch;
    if (filter !== "all") filters.status = filter;
    return filters;
  }, [page, pageSize, sortField, sortAsc, debouncedSearch, filter]);
  const { data: myClientsData, isLoading: clientsLoading, isFetching: clientsFetching } = useGetMyClientsQuery(apiFilters);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(timer);
  }, [search]);

  const clientsPayload = myClientsData?.data;
  const clientPagination = clientsPayload?.pagination || {};
  const isServerPaginated =
    Number.isFinite(clientPagination?.totalPages) &&
    Number.isFinite(clientPagination?.totalItems);
  const myClients = Array.isArray(clientsPayload)
    ? clientsPayload
    : Array.isArray(clientsPayload?.clients)
      ? clientsPayload.clients
      : Array.isArray(clientsPayload?.items)
        ? clientsPayload.items
        : Array.isArray(clientsPayload?.data)
          ? clientsPayload.data
          : [];

  const clients = useMemo(() => {
    return myClients.map((client) => {
      const id = getClientId(client);
      const clientTasks = tasks.filter((t) => getTaskClientId(t) === id);
      const completedTasks = clientTasks.filter((t) => String(t.status || "").toUpperCase() === "COMPLETED").length;
      return {
        id,
        name: getClientName(client),
        email: client?.email || "-",
        status: client?.active ? "active" : "inactive",
        totalTasks: clientTasks.length,
        completedTasks,
      };
    });
  }, [myClients, tasks]);

  const filtered = useMemo(() => {
    let result = [...clients];

    if (!isServerPaginated && debouncedSearch) {
      const q = debouncedSearch.toLowerCase();
      result = result.filter((client) => client.name.toLowerCase().includes(q) || client.email.toLowerCase().includes(q));
    }

    if (!isServerPaginated && filter === "active") result = result.filter((client) => client.status === "active");
    if (!isServerPaginated && filter === "inactive") result = result.filter((client) => client.status === "inactive");

    result.sort((a, b) => {
      const valA = String(a[sortField] || "").toLowerCase();
      const valB = String(b[sortField] || "").toLowerCase();
      return sortAsc ? valA.localeCompare(valB) : valB.localeCompare(valA);
    });

    return result;
  }, [clients, isServerPaginated, debouncedSearch, filter, sortField, sortAsc]);

  const totalPages = isServerPaginated
    ? Math.max(1, clientPagination.totalPages || 1)
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
  }, [debouncedSearch, filter, pageSize, sortField, sortAsc]);

  const serverStats = clientsPayload?.stats || myClientsData?.stats || {};
  const totalClients = serverStats.totalClients ?? (isServerPaginated ? clientPagination.totalItems || clients.length : clients.length);
  const activeCount = serverStats.activeClients ?? clients.filter((c) => c.status === "active").length;
  const inactiveCount = serverStats.inactiveClients ?? Math.max(0, totalClients - activeCount);
  const totalTasks = clients.reduce((sum, c) => sum + c.totalTasks, 0);
  const activeFilterLabel = CLIENT_FILTERS.find((item) => item.value === filter)?.label || "All Clients";
  const hasAnyFilter = filter !== "all" || !!debouncedSearch;

  const handleSort = (field, dir) => {
    setSortField(field);
    setSortAsc(dir === "asc");
  };

  const handleClearAllFilters = () => {
    setSearch("");
    setDebouncedSearch("");
    setFilter("all");
    setPage(1);
    setClearFiltersOpen(false);
    toast.success("All filters cleared");
  };

  const stats = [
    { label: "Total Clients", value: totalClients, icon: Users, color: "text-primary" },
    { label: "Active", value: activeCount, icon: UserCheck, color: "text-success" },
    { label: "Inactive", value: inactiveCount, icon: UserX, color: "text-warning" },
    { label: "Total Tasks", value: totalTasks, icon: ListChecks, color: "text-accent-foreground" },
  ];

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
      key: "totalTasks",
      label: "Tasks",
      sortable: true,
      render: (client) => (
        <span className="text-sm text-muted-foreground">
          <span className="font-semibold text-foreground">{client.completedTasks}</span>/{client.totalTasks}
        </span>
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
        <div className="ml-2 flex w-8 items-center justify-end">
          <Button
            size="icon"
            variant="ghost"
            className="h-8 w-8"
            onClick={() => navigate(`/staff/clients/${client.id}`)}
            title="View Client"
            aria-label="View Client"
          >
            <Eye className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];

  if (tasksLoading || clientsLoading || clientsFetching) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, idx) => (
            <Skeleton key={idx} className="h-20 rounded-xl" />
          ))}
        </div>
        <Skeleton className="h-[380px] rounded-xl" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-foreground">My Clients</h1>
        <p className="text-sm text-muted-foreground">View and track your assigned clients.</p>
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

      <div className="space-y-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[220px] max-w-xs">
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
                <span>{activeFilterLabel}</span>
                <ChevronDown className="h-3.5 w-3.5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="bg-popover z-50 min-w-[160px]">
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
          loading={false}
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

      <ConfirmDialog
        open={clearFiltersOpen}
        onOpenChange={setClearFiltersOpen}
        title="Clear all filters?"
        description="This will reset search and status filters."
        confirmLabel="Clear"
        onConfirm={handleClearAllFilters}
      />
    </div>
  );
}
