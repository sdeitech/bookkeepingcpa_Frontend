import { useState, useMemo, use } from "react";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Checkbox } from "../../components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../../components/ui/dropdown-menu";
import {
  TaskStatusBadge,
  TaskPriorityBadge,
} from "../../components/Admin/TaskStatusBadge";
import { CreateTaskDialog } from "../../components/Admin/CreateTaskDialog";
import {
  Plus,
  MoreHorizontal,
  Search,
  AlertTriangle,
  Pencil,
  Trash2,
  UserCheck,
  Filter,
} from "lucide-react";
import { format, isBefore, startOfDay } from "date-fns";
import { toast } from "sonner";
import {
  useGetTasksQuery,
  useCreateTaskMutation,
  useDeleteTaskMutation,
  useUpdateTaskMutation,
  useUpdateTaskStatusMutation,
} from "@/features/tasks/tasksApi";
import { useGetAllClientsQuery } from "@/features/user/userApi";
import { useGetAllStaffQuery } from "@/features/auth/authApi";



const TASK_STATUSES = [
  { value: "NOT_STARTED", label: "Not Started" },
  { value: "IN_PROGRESS", label: "In Progress" },
  { value: "COMPLETED", label: "Completed" },
  { value: "ON_HOLD", label: "On Hold" },
];

const TASK_PRIORITIES = [
  { value: "LOW", label: "Low" },
  { value: "MEDIUM", label: "Medium" },
  { value: "HIGH", label: "High" },
];

export default function AdminTasks() {
  /* ================= STATE ================= */
  const [createOpen, setCreateOpen] = useState(false);
  const [selected, setSelected] = useState([]);
  const [search, setSearch] = useState("");
  const [filterClient, setFilterClient] = useState("all");
  const [filterStaff, setFilterStaff] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterPriority, setFilterPriority] = useState("all");
  const [editingId, setEditingId] = useState(null);
  const [editStatus, setEditStatus] = useState("NOT_STARTED");
  const [editAssignedTo, setEditAssignedTo] = useState("");

  const today = startOfDay(new Date());

  /* ================= FETCH DATA ================= */
  const { data: clientsData } = useGetAllClientsQuery();
  const { data: staffData } = useGetAllStaffQuery();
  const clients = clientsData?.data || [];
  const staff = staffData?.data || [];

  const {
    data: tasksData,
    isLoading,
    refetch,
  } = useGetTasksQuery({});

  const tasks = tasksData?.data.tasks || [];
  console.log("Fetched tasks:", tasks);

  /* ================= CREATE TASK ================= */
  const [createTaskMutation] = useCreateTaskMutation();
  const createTask = async (task) => {
    try {
      await createTaskMutation(task).unwrap();
      toast.success("Task created successfully");
      setCreateOpen(false);
      refetch();
    } catch (err) {
      toast.error("Failed to create task");
    }
  };
  const [deleteTaskMutation] = useDeleteTaskMutation();
  const [updateTaskMutation] = useUpdateTaskMutation();
  const [updateTaskStatusMutation] = useUpdateTaskStatusMutation();

  /* ================= FILTER LOGIC ================= */
  const filtered = useMemo(() => {
    return tasks.filter((t) => {
      if (
        search &&
        !t.title?.toLowerCase().includes(search.toLowerCase()) &&
        !t.clientId?.name?.toLowerCase().includes(search.toLowerCase())
      )
        return false;
      if (filterClient !== "all" && t.clientId?._id !== filterClient)
        return false;
      if (filterStaff !== "all" && t.assignedTo?._id !== filterStaff)
        return false;
      if (filterStatus !== "all" && t.status !== filterStatus) return false;
      if (filterPriority !== "all" && t.priority !== filterPriority)
        return false;
      return true;
    });
  }, [tasks, search, filterClient, filterStaff, filterStatus, filterPriority]);

  const overdueTasks = useMemo(
    () =>
      tasks.filter(
        (t) =>
          t.status !== "COMPLETED" &&
          t.dueDate &&
          isBefore(new Date(t.dueDate), today)
      ),
    [tasks, today]
  );

  /* ================= TABLE HELPERS ================= */
  const toggleSelect = (id) =>
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );

  const toggleAll = () =>
    setSelected((prev) =>
      prev.length === filtered.length ? [] : filtered.map((t) => t._id)
    );

  const handleBulkDelete = () => {
    // deleteTasks(selected); — wire up when API is ready
    toast.info("Bulk delete API not implemented yet");
    setSelected([]);
  };

  const handleBulkReassign = (staffMember) => {
    // reassignTasks(selected, staffMember); — wire up when API is ready
    toast.info("Bulk reassign API not implemented yet");
    setSelected([]);
  };

  const startEdit = (taskId) => {
    const task = tasks.find((t) => t._id === taskId);
    if (!task) return;
    setEditingId(taskId);
    setEditStatus(task.status);
    setEditAssignedTo(task.assignedTo?._id);
  };

  const saveEdit = async () => {
    if (!editingId) return;
    const originalTask = tasks.find((t) => t._id === editingId);
    if (!originalTask) return;

    try {
      const promises = [];

      if (editAssignedTo !== originalTask.assignedTo?._id) {
        promises.push(
          updateTaskMutation({ id: editingId, body: { assignedTo: editAssignedTo } }).unwrap()
        );
      }

      if (editStatus !== originalTask.status) {
        promises.push(
          updateTaskStatusMutation({ id: editingId, status: editStatus }).unwrap()
        );
      }

      if (promises.length === 0) {
        toast.info("No changes to save");
        setEditingId(null);
        return;
      }

      await Promise.all(promises);
      toast.success("Task updated successfully");
      setEditingId(null);
    } catch (err) {
      toast.error("Failed to update task");
    }
  };

  const deleteTask = async (id) => {
    try {
      await deleteTaskMutation(id).unwrap();
      toast.success("Task deleted successfully");
    } catch (err) {
      toast.error("Failed to delete task");
    }
  };


  /* ================= UI ================= */
  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Task Management</h1>
          <p className="text-sm text-muted-foreground">
            {tasks.length} total tasks · {overdueTasks.length} overdue
          </p>
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
              {overdueTasks.slice(0, 3).map((t) => (
                <li key={t._id}>
                  • {t.title} — {t.clientId?.name} (due{" "}
                  {format(new Date(t.dueDate), "MMM d")})
                </li>
              ))}
              {overdueTasks.length > 3 && (
                <li>...and {overdueTasks.length - 3} more</li>
              )}
            </ul>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px] max-w-xs">
          {/* <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" /> */}
          <Input
            placeholder="Search tasks..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>

        <Select value={filterClient} onValueChange={setFilterClient}>
          <SelectTrigger className="w-[160px]">
            <Filter className="h-3.5 w-3.5 mr-1.5 text-muted-foreground" />
            <SelectValue placeholder="Client" />
          </SelectTrigger>
          <SelectContent className="bg-popover z-50">
            <SelectItem value="all">All Clients</SelectItem>
            {clients.map((c) => (
              <SelectItem key={c.id} value={c.id}>
                {c.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={filterStaff} onValueChange={setFilterStaff}>
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Staff" />
          </SelectTrigger>
          <SelectContent className="bg-popover z-50">
            <SelectItem value="all">All Staff</SelectItem>
            {staff.map((s) => (
              <SelectItem key={s._id} value={s._id}>
                {s.first_name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent className="bg-popover z-50">
            <SelectItem value="all">All Status</SelectItem>
            {TASK_STATUSES.map((s) => (
              <SelectItem key={s.value} value={s.value}>
                {s.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={filterPriority} onValueChange={setFilterPriority}>
          <SelectTrigger className="w-[130px]">
            <SelectValue placeholder="Priority" />
          </SelectTrigger>
          <SelectContent className="bg-popover z-50">
            <SelectItem value="all">All Priority</SelectItem>
            {TASK_PRIORITIES.map((p) => (
              <SelectItem key={p.value} value={p.value}>
                {p.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
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
              {staff.map((s) => (
                <DropdownMenuItem
                  key={s._id}
                  onClick={() => handleBulkReassign(s._id)}
                >
                  {s.first_name}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
          <Button
            variant="destructive"
            size="sm"
            className="gap-1.5"
            onClick={handleBulkDelete}
          >
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
                <Checkbox
                  checked={
                    selected.length === filtered.length && filtered.length > 0
                  }
                  onCheckedChange={toggleAll}
                />
              </TableHead>
              <TableHead>Title</TableHead>
              <TableHead>Client</TableHead>
              <TableHead>Assigned To</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Priority</TableHead>
              <TableHead>Due Date</TableHead>
              <TableHead className="w-12" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell
                  colSpan={8}
                  className="text-center py-12 text-muted-foreground"
                >
                  Loading tasks...
                </TableCell>
              </TableRow>
            ) : filtered.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={8}
                  className="text-center py-12 text-muted-foreground"
                >
                  No tasks found.
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((task) => {
                const isOverdue =
                  task.status !== "COMPLETED" &&
                  task.dueDate &&
                  isBefore(new Date(task.dueDate), today);
                const isEditing = editingId === task._id;

                return (
                  <TableRow
                    key={task._id}
                    className={isOverdue ? "bg-destructive/5" : ""}
                  >
                    <TableCell>
                      <Checkbox
                        checked={selected.includes(task._id)}
                        onCheckedChange={() => toggleSelect(task._id)}
                      />
                    </TableCell>

                    <TableCell>
                      <div className="font-medium text-foreground">
                        {task.title}
                      </div>
                      {task.description && (
                        <div className="text-xs text-muted-foreground mt-0.5">
                          {task.description}
                        </div>
                      )}
                    </TableCell>

                    <TableCell className="text-sm">
                      {task.clientId?.first_name + " " + task.clientId?.last_name || "-"}
                    </TableCell>

                    <TableCell className="text-sm">
                      {isEditing ? (
                        <Select
                          value={editAssignedTo}
                          onValueChange={setEditAssignedTo}
                        >
                          <SelectTrigger className="h-8 text-xs">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="bg-popover z-50">
                            {staff.map((s) => (
                              <SelectItem key={s._id} value={s._id}>
                                {s.first_name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      ) : (
                        task.assignedTo?.first_name + " " + task.assignedTo?.last_name || "-"
                      )}
                    </TableCell>

                    <TableCell>
                      {isEditing ? (
                        <Select
                          value={editStatus}
                          onValueChange={(v) => setEditStatus(v)}
                        >
                          <SelectTrigger className="h-8 text-xs">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="bg-popover z-50">
                            {TASK_STATUSES.map((s) => (
                              <SelectItem key={s.value} value={s.value}>
                                {s.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      ) : (
                        <TaskStatusBadge status={task.status} />
                      )}
                    </TableCell>

                    <TableCell>
                      <TaskPriorityBadge priority={task.priority} />
                    </TableCell>

                    <TableCell className="text-sm">
                      <span
                        className={
                          isOverdue ? "text-destructive font-medium" : ""
                        }
                      >
                        {task.dueDate
                          ? format(new Date(task.dueDate), "MMM d, yyyy")
                          : "-"}
                      </span>
                    </TableCell>

                    <TableCell>
                      {isEditing ? (
                        <div className="flex gap-1">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={saveEdit}
                            className="h-7 text-xs"
                          >
                            Save
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => setEditingId(null)}
                            className="h-7 text-xs"
                          >
                            ✕
                          </Button>
                        </div>
                      ) : (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                            >
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent
                            align="end"
                            className="bg-popover z-50"
                          >
                            <DropdownMenuItem
                              onClick={() => startEdit(task._id)}
                            >
                              <Pencil className="mr-2 h-3.5 w-3.5" /> Edit
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              className="text-destructive"
                              onClick={() => deleteTask(task._id)}
                            >
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

      <CreateTaskDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        onCreate={createTask}
      />
    </div>
  );
}