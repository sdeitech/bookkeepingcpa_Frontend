import { useState, useMemo, useEffect } from "react";
import { useTasks } from "@/hooks/useTasks";
import { useGetAllClientsQuery, useGetAllStaffQuery } from "@/features/user/userApi";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { TaskStatusBadge, TaskPriorityBadge } from "@/components/new_Admin/TaskStatusBadge";
import { CreateTaskWizard } from "@/components/new_Admin/CreateTaskWizard";
import { TASK_STATUSES, TASK_PRIORITIES } from "@/lib/task-types";
import { Plus, MoreHorizontal, Search, AlertTriangle, Pencil, Trash2, UserCheck, Filter, ChevronDown, X } from "lucide-react";
import { format, isBefore, startOfDay, isWithinInterval, addDays } from "date-fns";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const TASK_TYPES = [
  { value: "all", label: "All Types" },
  { value: "DOCUMENT_UPLOAD", label: "📄 Document Upload" },
  { value: "INTEGRATION", label: "🔗 Integration" },
  { value: "ACTION", label: "✓ Action" },
  { value: "REVIEW", label: "👁 Review" },
];

const QUICK_FILTERS = [
  { id: "all", label: "All Tasks" },
  { id: "my_tasks", label: "My Tasks" },
  { id: "client_tasks", label: "Client Tasks" },
  { id: "staff_tasks", label: "Staff Tasks" },
  { id: "overdue", label: "Overdue" },
  { id: "due_this_week", label: "Due This Week" },
];

export default function AdminTasks() {
  const { tasks, createTask, updateTask, deleteTask, deleteTasks, reassignTasks } = useTasks();
  const { data: clientsData } = useGetAllClientsQuery();
  const { data: staffData } = useGetAllStaffQuery();
  
  const clients = clientsData?.data || [];
  const staffMembers = staffData?.data || [];
  
  // State
  const [createOpen, setCreateOpen] = useState(false);
  const [selected, setSelected] = useState([]);
  const [search, setSearch] = useState("");
  
  // Quick Filters
  const [quickFilter, setQuickFilter] = useState("all");
  const [taskTypeFilter, setTaskTypeFilter] = useState("all");
  
  // Column Filters
  const [filterClient, setFilterClient] = useState("all");
  const [filterAssignedTo, setFilterAssignedTo] = useState("all");
  const [filterAssignedBy, setFilterAssignedBy] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterPriority, setFilterPriority] = useState("all");
  const [filterDueDate, setFilterDueDate] = useState("all");

  // Editing inline
  const [editingId, setEditingId] = useState(null);
  const [editStatus, setEditStatus] = useState("NOT_STARTED");
  const [editAssignedTo, setEditAssignedTo] = useState("");

  const today = startOfDay(new Date());
  const currentUserId = "CURRENT_USER_ID"; // TODO: Get from auth context

  // Console log filter changes
  useEffect(() => {
    const activeFilters = {
      quickFilter: quickFilter !== "all" ? quickFilter : null,
      taskType: taskTypeFilter !== "all" ? taskTypeFilter : null,
      clientId: filterClient !== "all" ? filterClient : null,
      assignedTo: filterAssignedTo !== "all" ? filterAssignedTo : null,
      assignedBy: filterAssignedBy !== "all" ? filterAssignedBy : null,
      status: filterStatus !== "all" ? filterStatus : null,
      priority: filterPriority !== "all" ? filterPriority : null,
      dueDate: filterDueDate !== "all" ? filterDueDate : null,
    };

    // Remove null values
    const cleanFilters = Object.fromEntries(
      Object.entries(activeFilters).filter(([_, v]) => v !== null)
    );

    if (Object.keys(cleanFilters).length > 0) {
      console.log("=== FILTER APPLIED ===");
      console.log("Active Filters:", cleanFilters);
      console.log("Backend Query Params:", cleanFilters);
      console.log("Query String:", new URLSearchParams(cleanFilters).toString());
      console.log("======================");
    }
  }, [quickFilter, taskTypeFilter, filterClient, filterAssignedTo, filterAssignedBy, filterStatus, filterPriority, filterDueDate]);

  // Get all unique users for filters
  const allUsers = useMemo(() => {
    const userMap = new Map();
    
    tasks.forEach(task => {
      if (task.assignedTo) {
        const id = task.assignedTo._id || task.assignedTo;
        if (!userMap.has(id)) {
          userMap.set(id, task.assignedTo);
        }
      }
      if (task.assignedBy) {
        const id = task.assignedBy._id || task.assignedBy;
        if (!userMap.has(id)) {
          userMap.set(id, task.assignedBy);
        }
      }
    });
    
    return Array.from(userMap.values());
  }, [tasks]);

  const overdueTasks = useMemo(() =>
    tasks.filter(t => t.status !== "COMPLETED" && isBefore(new Date(t.dueDate), today)),
    [tasks, today]
  );

  const filtered = useMemo(() => {
    return tasks.filter(t => {
      // Search
      if (search) {
        const clientName = t.clientId?.first_name && t.clientId?.last_name 
          ? `${t.clientId.first_name} ${t.clientId.last_name}` 
          : '';
        const searchLower = search.toLowerCase();
        if (!t.title.toLowerCase().includes(searchLower) && 
            !clientName.toLowerCase().includes(searchLower)) {
          return false;
        }
      }

      // Quick Filters
      if (quickFilter === "my_tasks" && t.assignedTo?._id !== currentUserId) return false;
      if (quickFilter === "client_tasks" && t.assignedToRole !== "CLIENT") return false;
      if (quickFilter === "staff_tasks" && t.assignedToRole !== "STAFF") return false;
      if (quickFilter === "overdue" && (t.status === "COMPLETED" || !isBefore(new Date(t.dueDate), today))) return false;
      if (quickFilter === "due_this_week") {
        const weekEnd = addDays(today, 7);
        if (!isWithinInterval(new Date(t.dueDate), { start: today, end: weekEnd })) return false;
      }

      // Task Type Filter
      if (taskTypeFilter !== "all" && t.taskType !== taskTypeFilter) return false;

      // Column Filters
      if (filterClient !== "all") {
        if (filterClient === "internal" && t.clientId) return false;
        if (filterClient !== "internal" && t.clientId?._id !== filterClient) return false;
      }
      if (filterAssignedTo !== "all" && t.assignedTo?._id !== filterAssignedTo) return false;
      if (filterAssignedBy !== "all" && t.assignedBy?._id !== filterAssignedBy) return false;
      if (filterStatus !== "all" && t.status !== filterStatus) return false;
      if (filterPriority !== "all" && t.priority !== filterPriority) return false;
      
      // Due Date Filter
      if (filterDueDate === "overdue" && (t.status === "COMPLETED" || !isBefore(new Date(t.dueDate), today))) return false;
      if (filterDueDate === "today" && format(new Date(t.dueDate), "yyyy-MM-dd") !== format(today, "yyyy-MM-dd")) return false;
      if (filterDueDate === "this_week") {
        const weekEnd = addDays(today, 7);
        if (!isWithinInterval(new Date(t.dueDate), { start: today, end: weekEnd })) return false;
      }

      return true;
    });
  }, [tasks, search, quickFilter, taskTypeFilter, filterClient, filterAssignedTo, filterAssignedBy, filterStatus, filterPriority, filterDueDate, today, currentUserId]);

  // Active filters for badges
  const activeFilters = useMemo(() => {
    const filters = [];
    
    if (quickFilter !== "all") {
      filters.push({ type: "quick", value: quickFilter, label: QUICK_FILTERS.find(f => f.id === quickFilter)?.label });
    }
    if (taskTypeFilter !== "all") {
      filters.push({ type: "taskType", value: taskTypeFilter, label: TASK_TYPES.find(t => t.value === taskTypeFilter)?.label });
    }
    if (filterClient !== "all") {
      const clientLabel = filterClient === "internal" ? "Internal" : 
        clients.find(c => c.id === filterClient)?.first_name + " " + clients.find(c => c.id === filterClient)?.last_name;
      filters.push({ type: "client", value: filterClient, label: `Client: ${clientLabel}` });
    }
    if (filterAssignedTo !== "all") {
      const user = allUsers.find(u => u._id === filterAssignedTo);
      const label = user?.first_name && user?.last_name ? `${user.first_name} ${user.last_name}` : filterAssignedTo;
      filters.push({ type: "assignedTo", value: filterAssignedTo, label: `Assigned To: ${label}` });
    }
    if (filterAssignedBy !== "all") {
      const user = allUsers.find(u => u._id === filterAssignedBy);
      const label = user?.first_name && user?.last_name ? `${user.first_name} ${user.last_name}` : filterAssignedBy;
      filters.push({ type: "assignedBy", value: filterAssignedBy, label: `Created By: ${label}` });
    }
    if (filterStatus !== "all") {
      filters.push({ type: "status", value: filterStatus, label: `Status: ${TASK_STATUSES.find(s => s.value === filterStatus)?.label}` });
    }
    if (filterPriority !== "all") {
      filters.push({ type: "priority", value: filterPriority, label: `Priority: ${TASK_PRIORITIES.find(p => p.value === filterPriority)?.label}` });
    }
    if (filterDueDate !== "all") {
      const labels = { overdue: "Overdue", today: "Today", this_week: "This Week", this_month: "This Month" };
      filters.push({ type: "dueDate", value: filterDueDate, label: `Due: ${labels[filterDueDate]}` });
    }
    
    return filters;
  }, [quickFilter, taskTypeFilter, filterClient, filterAssignedTo, filterAssignedBy, filterStatus, filterPriority, filterDueDate, clients, allUsers]);

  const removeFilter = (filter) => {
    if (filter.type === "quick") setQuickFilter("all");
    if (filter.type === "taskType") setTaskTypeFilter("all");
    if (filter.type === "client") setFilterClient("all");
    if (filter.type === "assignedTo") setFilterAssignedTo("all");
    if (filter.type === "assignedBy") setFilterAssignedBy("all");
    if (filter.type === "status") setFilterStatus("all");
    if (filter.type === "priority") setFilterPriority("all");
    if (filter.type === "dueDate") setFilterDueDate("all");
  };

  const clearAllFilters = () => {
    setQuickFilter("all");
    setTaskTypeFilter("all");
    setFilterClient("all");
    setFilterAssignedTo("all");
    setFilterAssignedBy("all");
    setFilterStatus("all");
    setFilterPriority("all");
    setFilterDueDate("all");
    setSearch("");
  };

  const toggleSelect = (id) =>
    setSelected(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);

  const toggleAll = () => {
    const allIds = filtered.map(t => t._id || t.id);
    setSelected(prev => prev.length === filtered.length ? [] : allIds);
  };

  const handleBulkDelete = () => {
    deleteTasks(selected);
    setSelected([]);
    toast.success(`${selected.length} tasks deleted`);
  };

  const handleBulkReassign = (staffId) => {
    reassignTasks(selected, staffId);
    setSelected([]);
    toast.success(`Tasks reassigned`);
  };

  const startEdit = (taskId) => {
    const task = tasks.find(t => (t._id || t.id) === taskId);
    if (!task) return;
    setEditingId(taskId);
    setEditStatus(task.status);
    setEditAssignedTo(task.assignedTo?._id || task.assignedTo);
  };

  const saveEdit = () => {
    if (!editingId) return;
    updateTask(editingId, { status: editStatus, assignedTo: editAssignedTo });
    setEditingId(null);
    toast.success("Task updated");
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Task Management</h1>
          <p className="text-sm text-muted-foreground">{tasks.length} total tasks · {overdueTasks.length} overdue</p>
        </div>
        <Button onClick={() => setCreateOpen(true)} className="gap-2">
          <Plus className="h-4 w-4" /> Create Task
        </Button>
      </div>

      {/* Overdue banner */}
      {overdueTasks.length > 0 && (
        <div className="bg-destructive/10 border border-destructive/30 rounded-xl p-4 flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-destructive">
              {overdueTasks.length} Overdue Task{overdueTasks.length > 1 ? "s" : ""}
            </p>
            <ul className="text-sm text-destructive/80 mt-1 space-y-0.5">
              {overdueTasks.slice(0, 3).map(t => {
                const taskId = t._id || t.id;
                const clientName = t.clientId?.first_name && t.clientId?.last_name 
                  ? `${t.clientId.first_name} ${t.clientId.last_name}` 
                  : 'No client';
                return (
                  <li key={taskId}>• {t.title} — {clientName} (due {format(new Date(t.dueDate), "MMM d")})</li>
                );
              })}
              {overdueTasks.length > 3 && <li>...and {overdueTasks.length - 3} more</li>}
            </ul>
          </div>
        </div>
      )}

      {/* Filters Section */}
      <div className="space-y-4">
        {/* Search */}
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search tasks..." 
            value={search} 
            onChange={e => setSearch(e.target.value)} 
            className="pl-9" 
          />
        </div>

        {/* Quick Filters */}
        <div className="flex flex-wrap items-center gap-2">
          {QUICK_FILTERS.map(filter => (
            <Button
              key={filter.id}
              variant={quickFilter === filter.id ? "default" : "outline"}
              size="sm"
              onClick={() => setQuickFilter(filter.id)}
              className="h-8"
            >
              {filter.label}
            </Button>
          ))}
        </div>

        {/* Task Type Filter */}
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-foreground">Task Type:</span>
          <Select value={taskTypeFilter} onValueChange={setTaskTypeFilter}>
            <SelectTrigger className="w-[200px] h-8">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-popover z-50">
              {TASK_TYPES.map(type => (
                <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Active Filters */}
        {activeFilters.length > 0 && (
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm font-medium text-muted-foreground">Active Filters:</span>
            {activeFilters.map((filter, idx) => (
              <div
                key={idx}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-primary/10 text-primary text-sm"
              >
                <span>{filter.label}</span>
                <button
                  onClick={() => removeFilter(filter)}
                  className="hover:bg-primary/20 rounded-sm p-0.5"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ))}
            <Button variant="ghost" size="sm" onClick={clearAllFilters} className="h-7 text-xs">
              Clear All
            </Button>
          </div>
        )}
      </div>

      {/* Bulk actions */}
      {selected.length > 0 && (
        <div className="flex items-center gap-3 bg-accent/50 border border-accent rounded-lg p-3">
          <span className="text-sm font-medium">{selected.length} selected</span>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="gap-1.5">
                <UserCheck className="h-3.5 w-3.5" /> Reassign
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="bg-popover z-50">
              {staffMembers.map(s => {
                const fullName = `${s.first_name} ${s.last_name}`.trim();
                return (
                  <DropdownMenuItem key={s._id} onClick={() => handleBulkReassign(s._id)}>{fullName}</DropdownMenuItem>
                );
              })}
            </DropdownMenuContent>
          </DropdownMenu>
          <Button variant="destructive" size="sm" className="gap-1.5" onClick={handleBulkDelete}>
            <Trash2 className="h-3.5 w-3.5" /> Delete
          </Button>
        </div>
      )}

      {/* Table */}
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead className="w-10">
                <Checkbox checked={selected.length === filtered.length && filtered.length > 0} onCheckedChange={toggleAll} />
              </TableHead>
              <TableHead>Title</TableHead>
              <TableHead>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-8 px-2 hover:bg-muted">
                      Client <ChevronDown className="ml-1 h-3 w-3" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" className="bg-popover z-50 w-48">
                    <DropdownMenuItem onClick={() => setFilterClient("all")}>All Clients</DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => setFilterClient("internal")}>Internal</DropdownMenuItem>
                    <DropdownMenuSeparator />
                    {clients.map(c => {
                      const fullName = `${c.first_name} ${c.last_name}`.trim();
                      return <DropdownMenuItem key={c.id} onClick={() => setFilterClient(c.id)}>{fullName}</DropdownMenuItem>;
                    })}
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableHead>
              <TableHead>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-8 px-2 hover:bg-muted">
                      Assigned To <ChevronDown className="ml-1 h-3 w-3" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" className="bg-popover z-50 w-48">
                    <DropdownMenuItem onClick={() => setFilterAssignedTo("all")}>All Users</DropdownMenuItem>
                    <DropdownMenuSeparator />
                    {allUsers.map(u => {
                      const fullName = u.first_name && u.last_name ? `${u.first_name} ${u.last_name}` : u._id;
                      return <DropdownMenuItem key={u._id} onClick={() => setFilterAssignedTo(u._id)}>{fullName}</DropdownMenuItem>;
                    })}
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableHead>
              <TableHead>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-8 px-2 hover:bg-muted">
                      Assigned By <ChevronDown className="ml-1 h-3 w-3" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" className="bg-popover z-50 w-48">
                    <DropdownMenuItem onClick={() => setFilterAssignedBy("all")}>All Users</DropdownMenuItem>
                    <DropdownMenuSeparator />
                    {allUsers.map(u => {
                      const fullName = u.first_name && u.last_name ? `${u.first_name} ${u.last_name}` : u._id;
                      return <DropdownMenuItem key={u._id} onClick={() => setFilterAssignedBy(u._id)}>{fullName}</DropdownMenuItem>;
                    })}
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableHead>
              <TableHead>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-8 px-2 hover:bg-muted">
                      Status <ChevronDown className="ml-1 h-3 w-3" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" className="bg-popover z-50 w-48">
                    <DropdownMenuItem onClick={() => setFilterStatus("all")}>All Status</DropdownMenuItem>
                    <DropdownMenuSeparator />
                    {TASK_STATUSES.map(s => (
                      <DropdownMenuItem key={s.value} onClick={() => setFilterStatus(s.value)}>{s.label}</DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableHead>
              <TableHead>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-8 px-2 hover:bg-muted">
                      Priority <ChevronDown className="ml-1 h-3 w-3" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" className="bg-popover z-50 w-48">
                    <DropdownMenuItem onClick={() => setFilterPriority("all")}>All Priority</DropdownMenuItem>
                    <DropdownMenuSeparator />
                    {TASK_PRIORITIES.map(p => (
                      <DropdownMenuItem key={p.value} onClick={() => setFilterPriority(p.value)}>{p.label}</DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableHead>
              <TableHead>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-8 px-2 hover:bg-muted">
                      Due Date <ChevronDown className="ml-1 h-3 w-3" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" className="bg-popover z-50 w-48">
                    <DropdownMenuItem onClick={() => setFilterDueDate("all")}>All</DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => setFilterDueDate("overdue")}>Overdue</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setFilterDueDate("today")}>Today</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setFilterDueDate("this_week")}>This Week</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableHead>
              <TableHead className="w-12" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} className="text-center py-12 text-muted-foreground">
                  No tasks found.
                </TableCell>
              </TableRow>
            ) : (
              filtered.map(task => {
                const taskId = task._id || task.id;
                const isOverdue = task.status !== "COMPLETED" && isBefore(new Date(task.dueDate), today);
                const isEditing = editingId === taskId;
                return (
                  <TableRow key={taskId} className={isOverdue ? "bg-destructive/5" : ""}>
                    <TableCell>
                      <Checkbox checked={selected.includes(taskId)} onCheckedChange={() => toggleSelect(taskId)} />
                    </TableCell>
                    <TableCell>
                      <div className="font-medium text-foreground">{task.title}</div>
                      {task.description && <div className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{task.description}</div>}
                    </TableCell>
                    <TableCell className="text-sm">
                      {task.clientId?.first_name && task.clientId?.last_name
                        ? `${task.clientId.first_name} ${task.clientId.last_name}`
                        : <span className="text-muted-foreground italic">Internal</span>}
                    </TableCell>
                    <TableCell className="text-sm">
                      {isEditing ? (
                        <Select value={editAssignedTo} onValueChange={setEditAssignedTo}>
                          <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                          <SelectContent className="bg-popover z-50">
                            {staffMembers.map(s => {
                              const fullName = `${s.first_name} ${s.last_name}`.trim();
                              return <SelectItem key={s._id} value={s._id}>{fullName}</SelectItem>;
                            })}
                          </SelectContent>
                        </Select>
                      ) : (
                        <div>
                          {task.assignedTo?.first_name && task.assignedTo?.last_name
                            ? `${task.assignedTo.first_name} ${task.assignedTo.last_name}`
                            : "-"}
                          {task.assignedToRole && (
                            <span className="ml-2 text-xs text-muted-foreground">({task.assignedToRole})</span>
                          )}
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="text-sm">
                      {task.assignedBy?.first_name && task.assignedBy?.last_name
                        ? `${task.assignedBy.first_name} ${task.assignedBy.last_name}`
                        : "-"}
                    </TableCell>
                    <TableCell>
                      {isEditing ? (
                        <Select value={editStatus} onValueChange={setEditStatus}>
                          <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                          <SelectContent className="bg-popover z-50">
                            {TASK_STATUSES.map(s => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}
                          </SelectContent>
                        </Select>
                      ) : <TaskStatusBadge status={task.status} />}
                    </TableCell>
                    <TableCell><TaskPriorityBadge priority={task.priority} /></TableCell>
                    <TableCell className="text-sm">
                      <span className={isOverdue ? "text-destructive font-medium" : ""}>
                        {format(new Date(task.dueDate), "MMM d, yyyy")}
                      </span>
                    </TableCell>
                    <TableCell>
                      {isEditing ? (
                        <div className="flex gap-1">
                          <Button size="sm" variant="ghost" onClick={saveEdit} className="h-7 text-xs">Save</Button>
                          <Button size="sm" variant="ghost" onClick={() => setEditingId(null)} className="h-7 text-xs">✕</Button>
                        </div>
                      ) : (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="bg-popover z-50">
                            <DropdownMenuItem onClick={() => startEdit(taskId)}>
                              <Pencil className="mr-2 h-3.5 w-3.5" /> Edit
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-destructive" onClick={() => { deleteTask(taskId); toast.success("Task deleted"); }}>
                              <Trash2 className="mr-2 h-3.5 w-3.5" /> Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      <CreateTaskWizard open={createOpen} onOpenChange={setCreateOpen} onCreate={createTask} />
    </div>
  );
}
