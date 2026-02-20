import { useState, useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import { Button } from "../../components/ui/button";
import { Progress } from "../../components/ui/progress";
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
  ArrowLeft,
  Plus,
  MoreHorizontal,
  Trash2,
  Mail,
  Building2,
} from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";

import {
  useGetTasksQuery,
  useUpdateTaskStatusMutation,
  useDeleteTaskMutation,
  useCreateTaskMutation,
} from "@/features/tasks/tasksApi";

export default function AdminClientDetail() {
  const { clientId } = useParams();

  const [createOpen, setCreateOpen] = useState(false);
  const [filterStatus, setFilterStatus] = useState("all");

  /* ================= FETCH TASKS ================= */

  const {
    data: tasksData,
    isLoading,
    refetch,
  } = useGetTasksQuery({ clientId });

  const tasks = tasksData?.data?.tasks || [];

  const [updateTaskStatusMutation] = useUpdateTaskStatusMutation();
  const [deleteTaskMutation] = useDeleteTaskMutation();
  const [createTaskMutation] = useCreateTaskMutation();

  /* ================= FILTER ================= */

  const filteredTasks = useMemo(() => {
    if (filterStatus === "all") return tasks;
    return tasks.filter((t) => t.status === filterStatus);
  }, [tasks, filterStatus]);

  /* ================= PROGRESS ================= */

  const completedCount = tasks.filter(
    (t) => t.status === "COMPLETED"
  ).length;

  const totalCount = tasks.length;

  const progressPercent =
    totalCount > 0
      ? Math.round((completedCount / totalCount) * 100)
      : 0;

  /* ================= ACTIONS ================= */

  const handleQuickStatusChange = async (taskId, status) => {
    try {
      await updateTaskStatusMutation({
        id: taskId,
        status,
      }).unwrap();

      toast.success("Status updated");
    } catch (err) {
      toast.error("Failed to update status");
    }
  };

  const deleteTask = async (taskId) => {
    try {
      await deleteTaskMutation(taskId).unwrap();
      toast.success("Task deleted");
    } catch (err) {
      toast.error("Delete failed");
    }
  };

  const createTask = async (task) => {
    try {
      await createTaskMutation({
        ...task,
        clientId,
      }).unwrap();

      toast.success("Task created");
      setCreateOpen(false);
    } catch (err) {
      toast.error("Create failed");
    }
  };


  console.log("Tasks:", tasksData);
  /* ================= UI ================= */

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Back */}
      <Link
        to="/admin/clients"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors no-underline"
      >
        <ArrowLeft className="h-4 w-4" /> Back to Clients
      </Link>

      {/* Header */}
      <div className="bg-card border border-border rounded-xl p-6">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center">
              <Building2 className="h-7 w-7 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">
              {tasks[0]?.clientId?.first_name + " " + tasks[0]?.clientId?.last_name || "-"}
              </h1>
              <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
                <Mail className="h-3.5 w-3.5" />
               {tasks[0]?.clientId?.email || "Unknown Client"}
              </div>
            </div>
          </div>

          <Button
            onClick={() => setCreateOpen(true)}
            className="gap-2"
          >
            <Plus className="h-4 w-4" /> Create Task
          </Button>
        </div>
      </div>

      {/* Progress */}
      <div className="bg-card border border-border rounded-xl p-6">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-foreground">Task Progress</h3>
          <span className="text-sm text-muted-foreground">
            {completedCount} of {totalCount} completed (
            {progressPercent}%)
          </span>
        </div>
        <Progress value={progressPercent} className="h-3" />
      </div>

      {/* Filter */}
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-foreground">
          Tasks ({filteredTasks.length})
        </h3>

        <Select
          value={filterStatus}
          onValueChange={setFilterStatus}
        >
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Filter status" />
          </SelectTrigger>
          <SelectContent className="bg-popover z-50">
            <SelectItem value="all">
              All Status
            </SelectItem>
            <SelectItem value="NOT_STARTED">
              Not Started
            </SelectItem>
            <SelectItem value="IN_PROGRESS">
              In Progress
            </SelectItem>
            <SelectItem value="COMPLETED">
              Completed
            </SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
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
            {isLoading ? (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="text-center py-12"
                >
                  Loading...
                </TableCell>
              </TableRow>
            ) : filteredTasks.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="text-center py-12 text-muted-foreground"
                >
                  No tasks found.
                </TableCell>
              </TableRow>
            ) : (
              filteredTasks.map((task) => (
                <TableRow key={task._id}>
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
                    {task.assignedTo?.email || "-"}
                  </TableCell>

                  <TableCell>
                    <TaskStatusBadge
                      status={task.status}
                    />
                  </TableCell>

                  <TableCell>
                    <TaskPriorityBadge
                      priority={task.priority}
                    />
                  </TableCell>

                  <TableCell className="text-sm">
                    {task.dueDate
                      ? format(
                          new Date(task.dueDate),
                          "MMM d, yyyy"
                        )
                      : "-"}
                  </TableCell>

                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-8 w-8"
                        >
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>

                      <DropdownMenuContent align="end" className="bg-popover z-50">
                        <DropdownMenuItem
                          onClick={() =>
                            handleQuickStatusChange(
                              task._id,
                              "IN_PROGRESS"
                            )
                          }
                        >
                          Mark In Progress
                        </DropdownMenuItem>

                        <DropdownMenuItem
                          onClick={() =>
                            handleQuickStatusChange(
                              task._id,
                              "COMPLETED"
                            )
                          }
                        >
                          Mark Completed
                        </DropdownMenuItem>

                        <DropdownMenuSeparator />

                        <DropdownMenuItem
                          className="text-destructive"
                          onClick={() =>
                            deleteTask(task._id)
                          }
                        >
                          <Trash2 className="mr-2 h-3.5 w-3.5" />
                          Delete
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

      {/* Create Dialog */}
      <CreateTaskDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        onCreate={createTask}
        prefillClientId={clientId}
      />
    </div>
  );
}
