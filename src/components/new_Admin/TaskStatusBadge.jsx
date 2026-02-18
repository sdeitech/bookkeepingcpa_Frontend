import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const statusStyles = {
  not_started: "bg-muted text-muted-foreground",
  in_progress: "bg-primary/15 text-primary border-primary/30",
  completed: "bg-success/15 text-success border-success/30",
  blocked: "bg-destructive/15 text-destructive border-destructive/30",
};

const statusLabels = {
  not_started: "Not Started",
  in_progress: "In Progress",
  completed: "Completed",
  blocked: "Blocked",
};

const priorityStyles = {
  low: "bg-muted text-muted-foreground",
  medium: "bg-warning/15 text-warning border-warning/30",
  high: "bg-destructive/15 text-destructive border-destructive/30",
  urgent: "bg-destructive text-destructive-foreground",
};

const priorityLabels = {
  low: "Low",
  medium: "Medium",
  high: "High",
  urgent: "Urgent",
};

export function TaskStatusBadge({ status }) {
  return (
    <Badge variant="outline" className={cn("text-xs font-medium", statusStyles[status])}>
      {statusLabels[status]}
    </Badge>
  );
}

export function TaskPriorityBadge({ priority }) {
  return (
    <Badge variant="outline" className={cn("text-xs font-medium", priorityStyles[priority])}>
      {priorityLabels[priority]}
    </Badge>
  );
}
