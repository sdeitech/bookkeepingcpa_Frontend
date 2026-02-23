import { Users, CheckSquare, CheckCircle2, Activity, PlusCircle, BarChart3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StatCard } from "@/components/Staff/StatCard";
import { StaffTaskCard } from "@/components/Staff/StaffTaskCard";
import { Badge } from "@/components/ui/badge";
import { useTasks } from "@/hooks/useTasks";
import { MOCK_CLIENTS } from "@/lib/task-types";
import { Link } from "react-router-dom";
import { isToday, isPast } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { CreateTaskWizard } from "@/components/new_Admin/CreateTaskWizard";

const CURRENT_STAFF = "Sarah Mitchell";

export default function StaffDashboard({myClients}) {
  const { tasks, isLoading, updateTask } = useTasks();
  const { toast } = useToast();
  const [createOpen, setCreateOpen] = useState(false);


  const myTasks = tasks.filter((t) => t.assignedTo === CURRENT_STAFF);
  const myClientIds = [...new Set(myTasks.map((t) => t.clientId))];
  const myClient = MOCK_CLIENTS.filter((c) => myClientIds.includes(c.id));

  const pendingTasks = myTasks.filter((t) => t.status !== "completed").length;
  const completedToday = myTasks.filter((t) => t.status === "completed" && isToday(new Date(t.updatedAt))).length;
  const activeClients = myClient.length;

  const handleComplete = (task) => {
    updateTask(task.id, { status: "completed" });
    toast({ title: "Task completed", description: task.title });
  };

  const createTask = (taskData) => {
    // Here you would typically call an API to create the task and then refresh your task list
    console.log("Creating task with data:", taskData);
    setCreateOpen(false);
  }

  if (isLoading) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-[100px] rounded-xl" />
          ))}
        </div>
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-[200px] rounded-xl" />
        <Skeleton className="h-[300px] rounded-xl" />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Assigned Clients" value={myClient.length} icon={Users} tint="bg-primary/10" iconColor="text-primary" />
        <StatCard title="Pending Tasks" value={pendingTasks} icon={CheckSquare} tint="bg-warning/10" iconColor="text-warning" />
        <StatCard title="Completed Today" value={completedToday} icon={CheckCircle2} tint="bg-success/10" iconColor="text-success" />
        <StatCard title="Active Clients" value={activeClients} icon={Activity} tint="bg-chart-4/10" iconColor="text-chart-4" />
      </div>

      <div>
        <h2 className="text-base font-semibold text-foreground mb-3">Quick Actions</h2>
        <div className="flex flex-wrap gap-3">
          <Button  onClick={() => setCreateOpen(true)} className="bg-primary text-primary-foreground hover:opacity-90 gap-2 shadow-md">
            <PlusCircle className="w-4 h-4" /> Create Client Task
          </Button>
          <Link to="/staff/reports">
            <Button variant="outline" className="gap-2">
              <BarChart3 className="w-4 h-4" /> View Reports
            </Button>
          </Link>
        </div>
      </div>

      <div>
        <h2 className="text-base font-semibold text-foreground mb-3">My Assigned Clients</h2>
        {myClient.length === 0 ? (
          <div className="bg-card border border-border rounded-xl p-10 text-center">
            <Users className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground">No clients assigned yet.</p>
          </div>
        ) : (
          <div className="bg-card border border-border rounded-xl overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead>Client Name</TableHead>
                  <TableHead className="hidden sm:table-cell">Email</TableHead>
                  <TableHead className="text-center">Total Tasks</TableHead>
                  <TableHead className="text-center">Pending</TableHead>
                  <TableHead className="text-center">Status</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {myClient.map((client, idx) => {
                  const clientTasks = myTasks.filter((t) => t.clientId === client.id);
                  const clientPending = clientTasks.filter((t) => t.status !== "completed").length;
                  const hasOverdue = clientTasks.some(
                    (t) => isPast(new Date(t.dueDate)) && !isToday(new Date(t.dueDate)) && t.status !== "completed",
                  );

                  return (
                    <TableRow key={client.id} className={cn(idx % 2 === 1 && "bg-muted/20")}>
                      <TableCell className="font-medium">{client.name}</TableCell>
                      <TableCell className="hidden sm:table-cell text-muted-foreground">{client.email}</TableCell>
                      <TableCell className="text-center">{clientTasks.length}</TableCell>
                      <TableCell className="text-center">{clientPending}</TableCell>
                      <TableCell className="text-center">
                        <Badge
                          variant="secondary"
                          className={cn(
                            "text-[11px]",
                            hasOverdue
                              ? "bg-destructive/15 text-destructive"
                              : clientPending === 0
                                ? "bg-success/15 text-success"
                                : "bg-primary/15 text-primary",
                          )}
                        >
                          {hasOverdue ? "Overdue" : clientPending === 0 ? "Up to Date" : "Active"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Link to="/staff/clients">
                          <Button variant="ghost" size="sm" className="text-primary">
                            View
                          </Button>
                        </Link>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </div>

      <div>
        <h2 className="text-base font-semibold text-foreground mb-3">My Tasks</h2>
        {myTasks.length === 0 ? (
          <div className="bg-card border border-border rounded-xl p-10 text-center">
            <CheckSquare className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground">No tasks assigned yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {myTasks.map((task) => (
              <StaffTaskCard key={task.id} task={task} onComplete={handleComplete} />
            ))}
          </div>
        )}
      </div>
      <CreateTaskWizard
        open={createOpen} onOpenChange={setCreateOpen} onCreate={createTask}
        defaultTarget="client" clientList={myClients}
      />
    </div>
  );
}
