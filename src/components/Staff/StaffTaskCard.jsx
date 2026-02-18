import { Calendar, Edit2, CheckCircle2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { format, isPast, isToday } from "date-fns";

const priorityStyles = {
  low: "bg-muted text-muted-foreground",
  medium: "bg-warning/15 text-warning",
  high: "bg-destructive/15 text-destructive",
  urgent: "bg-destructive/20 text-destructive font-semibold",
};

const statusStyles = {
  not_started: "bg-muted text-muted-foreground",
  in_progress: "bg-primary/15 text-primary",
  completed: "bg-success/15 text-success",
  blocked: "bg-destructive/15 text-destructive",
};

const statusLabels = {
  not_started: "Not Started",
  in_progress: "In Progress",
  completed: "Completed",
  blocked: "Blocked",
};

export function StaffTaskCard({ task, onEdit, onComplete }) {
  const dueDate = new Date(task.dueDate);
  const overdue = isPast(dueDate) && !isToday(dueDate) && task.status !== "completed";

  return (
    <div
      className={cn(
        "bg-card border rounded-xl p-5 transition-all duration-200 hover:shadow-md",
        overdue ? "border-destructive/50 shadow-destructive/5" : "border-border",
      )}
    >
      <div className="flex items-start justify-between mb-3">
        <h4 className="font-semibold text-foreground text-sm leading-tight">{task.title}</h4>
        <Badge className={cn("text-[11px] ml-2 shrink-0", priorityStyles[task.priority])} variant="secondary">
          {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
        </Badge>
      </div>

      <p className="text-sm text-muted-foreground mb-3">{task.clientName}</p>

      <div className="flex items-center gap-2 mb-4">
        <Calendar className="w-3.5 h-3.5 text-muted-foreground" />
        <span className={cn("text-xs", overdue ? "text-destructive font-medium" : "text-muted-foreground")}>
          {overdue && "Overdue · "}
          {format(dueDate, "MMM d, yyyy")}
        </span>
      </div>

      <div className="flex items-center justify-between">
        <Badge className={cn("text-[11px]", statusStyles[task.status])} variant="secondary">
          {statusLabels[task.status]}
        </Badge>
        <div className="flex gap-1">
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => onEdit?.(task)}>
            <Edit2 className="h-3.5 w-3.5" />
          </Button>
          {task.status !== "completed" && (
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-success hover:text-success"
              onClick={() => onComplete?.(task)}
            >
              <CheckCircle2 className="h-3.5 w-3.5" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
