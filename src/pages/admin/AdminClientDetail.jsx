import { useState, useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import { Button } from "../../components/ui/button";
import { Progress } from "../../components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "../../components/ui/dropdown-menu";
import { TaskStatusBadge, TaskPriorityBadge } from "../../components/Admin/TaskStatusBadge";
import { CreateTaskDialog } from "../../components/Admin/CreateTaskDialog";
import { ArrowLeft, Plus, MoreHorizontal, Pencil, Trash2, Mail, Building2 } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";

export default function AdminClientDetail() {
  const { clientId } = useParams();
  const [tasks, setTasks] = useState([]);
  const MOCK_CLIENTS = [
    { id: "c1", name: "Acme Corp", email: "admin@acme.com", plan: "enterprise" },
    { id: "c2", name: "Bloom Studio", email: "hello@bloom.io", plan: "essential" },
    { id: "c3", name: "Nova Labs", email: "team@novalabs.com", plan: "startup" },
    { id: "c4", name: "Greenfield Inc", email: "info@greenfield.com", plan: "essential" },
    { id: "c5", name: "Pixel Works", email: "contact@pixelworks.co", plan: "startup" },
  ];

  const TASK_STATUSES = [
    { value: "not_started", label: "Not Started" },
    { value: "in_progress", label: "In Progress" },
    { value: "completed", label: "Completed" },
    { value: "blocked", label: "Blocked" },
  ];
  

  // Create Task (void)
  const createTask = (title) => {
    const newTask = {
      id: Date.now().toString(),
      title,
      status: "Not Started",
    };

    setTasks((prev) => [...prev, newTask]);
  };

  // Update Task (void)
  const updateTask = (id, status) => {
    setTasks((prev) =>
      prev.map((task) =>
        task.id === id ? { ...task, status } : task
      )
    );
  };

  // Delete Task (void)
  const deleteTask = (id) => {
    setTasks((prev) => prev.filter((task) => task.id !== id));
  };
  const [createOpen, setCreateOpen] = useState(false);
  const [filterStatus, setFilterStatus] = useState("all");

  const client = MOCK_CLIENTS.find(c => c.id === clientId);

  const clientTasks = useMemo(() => {
    let filtered = tasks.filter(t => t.clientId === clientId);
    if (filterStatus !== "all") filtered = filtered.filter(t => t.status === filterStatus);
    return filtered;
  }, [tasks, clientId, filterStatus]);

  const allClientTasks = tasks.filter(t => t.clientId === clientId);
  const completedCount = allClientTasks.filter(t => t.status === "completed").length;
  const totalCount = allClientTasks.length;
  const progressPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  if (!client) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
        <p className="text-lg mb-4">Client not found.</p>
        <Link to="/admin/tasks">
          <Button variant="outline"><ArrowLeft className="mr-2 h-4 w-4" /> Back to Tasks</Button>
        </Link>
      </div>
    );
  }

  const handleQuickStatusChange = (taskId, newStatus) => {
    updateTask(taskId, { status: newStatus });
    toast.success("Status updated");
  };
  

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Back nav */}
      <Link to="/admin/tasks" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
        <ArrowLeft className="h-4 w-4" /> Back to Tasks
      </Link>

      {/* Client header */}
      <div className="bg-card border border-border rounded-xl p-6">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center">
              <Building2 className="h-7 w-7 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">{client.name}</h1>
              <div className="flex items-center gap-3 mt-1 text-sm text-muted-foreground">
                <span className="flex items-center gap-1"><Mail className="h-3.5 w-3.5" /> {client.email}</span>
                <span className="px-2 py-0.5 bg-primary/10 text-primary text-xs font-medium rounded-full capitalize">{client.plan}</span>
              </div>
            </div>
          </div>
          <Button onClick={() => setCreateOpen(true)} className="gap-2">
            <Plus className="h-4 w-4" /> Create Task
          </Button>
        </div>
      </div>

      {/* Progress */}
      <div className="bg-card border border-border rounded-xl p-6">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-foreground">Task Progress</h3>
          <span className="text-sm text-muted-foreground">
            {completedCount} of {totalCount} tasks completed ({progressPercent}%)
          </span>
        </div>
        <Progress value={progressPercent} className="h-3" />
      </div>

      {/* Filter */}
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-foreground">Tasks ({clientTasks.length})</h3>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-[150px]"><SelectValue placeholder="Filter status" /></SelectTrigger>
          <SelectContent className="bg-popover z-50">
            <SelectItem value="all">All Status</SelectItem>
            {TASK_STATUSES.map(s => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      {/* Tasks table */}
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead>Title</TableHead>
              <TableHead>Assigned To</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Priority</TableHead>
              <TableHead>Due Date</TableHead>
              <TableHead className="w-12" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {clientTasks.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-12 text-muted-foreground">
                  No tasks for this client yet.
                </TableCell>
              </TableRow>
            ) : (
              clientTasks.map(task => (
                <TableRow key={task.id}>
                  <TableCell>
                    <div className="font-medium text-foreground">{task.title}</div>
                    {task.description && <div className="text-xs text-muted-foreground mt-0.5">{task.description}</div>}
                  </TableCell>
                  <TableCell className="text-sm">{task.assignedTo}</TableCell>
                  <TableCell><TaskStatusBadge status={task.status} /></TableCell>
                  <TableCell><TaskPriorityBadge priority={task.priority} /></TableCell>
                  <TableCell className="text-sm">{format(new Date(task.dueDate), "MMM d, yyyy")}</TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="bg-popover z-50">
                        {TASK_STATUSES.map(s => (
                          <DropdownMenuItem key={s.value} onClick={() => handleQuickStatusChange(task.id, s.value)}>
                            Mark as {s.label}
                          </DropdownMenuItem>
                        ))}
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-destructive" onClick={() => { deleteTask(task.id); toast.success("Task deleted"); }}>
                          <Trash2 className="mr-2 h-3.5 w-3.5" /> Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <CreateTaskDialog open={createOpen} onOpenChange={setCreateOpen} onCreate={createTask} prefillClientId={clientId} />
    </div>
  );
}
