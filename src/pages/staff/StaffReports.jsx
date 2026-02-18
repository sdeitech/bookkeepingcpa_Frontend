import { useTasks } from "@/hooks/useTasks";
import { BarChart3, CheckCircle2, Clock, AlertTriangle } from "lucide-react";
import { StatCard } from "@/components/Staff/StatCard";
import { isPast, isToday } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

const CURRENT_STAFF = "Sarah Mitchell";

export default function StaffReports() {
  const { tasks, isLoading } = useTasks();
  const myTasks = tasks.filter((t) => t.assignedTo === CURRENT_STAFF);

  const completed = myTasks.filter((t) => t.status === "completed").length;
  const inProgress = myTasks.filter((t) => t.status === "in_progress").length;
  const overdue = myTasks.filter(
    (t) => isPast(new Date(t.dueDate)) && !isToday(new Date(t.dueDate)) && t.status !== "completed",
  ).length;
  const blocked = myTasks.filter((t) => t.status === "blocked").length;
  const total = myTasks.length;
  const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;
  const clientIds = [...new Set(myTasks.map((t) => t.clientId))];

  if (isLoading) {
    return (
      <div className="space-y-6 animate-fade-in">
        <Skeleton className="h-8 w-40" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-[100px] rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h2 className="text-xl font-semibold text-foreground">Reports</h2>
        <p className="text-sm text-muted-foreground mt-1">Your performance overview</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Tasks" value={total} icon={BarChart3} tint="bg-primary/10" iconColor="text-primary" />
        <StatCard title="Completed" value={completed} icon={CheckCircle2} tint="bg-success/10" iconColor="text-success" />
        <StatCard title="In Progress" value={inProgress} icon={Clock} tint="bg-warning/10" iconColor="text-warning" />
        <StatCard title="Overdue" value={overdue} icon={AlertTriangle} tint="bg-destructive/10" iconColor="text-destructive" />
      </div>

      <div className="bg-card border border-border rounded-xl p-6">
        <h3 className="font-semibold text-foreground mb-4">Completion Rate</h3>
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <div className="w-full bg-muted rounded-full h-3">
              <div
                className="bg-gradient-to-r from-primary to-success h-3 rounded-full transition-all duration-500"
                style={{ width: `${completionRate}%` }}
              />
            </div>
          </div>
          <span className="text-2xl font-bold text-foreground">{completionRate}%</span>
        </div>
        <p className="text-sm text-muted-foreground mt-2">
          {completed} of {total} tasks completed across {clientIds.length} clients
        </p>
      </div>

      <div className="bg-card border border-border rounded-xl p-6">
        <h3 className="font-semibold text-foreground mb-4">Tasks by Priority</h3>
        <div className="space-y-3">
          {["urgent", "high", "medium", "low"].map((priority) => {
            const count = myTasks.filter((t) => t.priority === priority).length;
            const pct = total > 0 ? Math.round((count / total) * 100) : 0;
            const colors = {
              urgent: "bg-destructive",
              high: "bg-warning",
              medium: "bg-primary",
              low: "bg-muted-foreground/40",
            };

            return (
              <div key={priority} className="flex items-center gap-3">
                <span className="text-sm font-medium capitalize w-16">{priority}</span>
                <div className="flex-1 bg-muted rounded-full h-2">
                  <div className={cn("h-2 rounded-full transition-all", colors[priority])} style={{ width: `${pct}%` }} />
                </div>
                <span className="text-sm text-muted-foreground w-12 text-right">{count}</span>
              </div>
            );
          })}
        </div>
      </div>

      {blocked > 0 && (
        <div className="bg-destructive/5 border border-destructive/20 rounded-xl p-6">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="w-5 h-5 text-destructive" />
            <h3 className="font-semibold text-destructive">
              {blocked} Blocked Task{blocked > 1 ? "s" : ""}
            </h3>
          </div>
          <p className="text-sm text-muted-foreground">Some tasks are blocked and need attention.</p>
        </div>
      )}
    </div>
  );
}
