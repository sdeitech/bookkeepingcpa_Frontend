import { Badge } from "../ui/badge";
import { cn } from "../../lib/utils";

const statusStyles = {
  NOT_STARTED: "bg-muted text-muted-foreground",
  IN_PROGRESS: "bg-primary/15 text-primary border-primary/30",
  COMPLETED: "bg-success/15 text-success border-success/30",
  CANCELLED: "bg-destructive/15 text-destructive border-destructive/30",
  PENDING_REVIEW: "bg-warning/15 text-warning border-warning/30",
  NEEDS_REVISION: "bg-warning/20 text-warning border-warning/40",
};

const statusLabels = {
  NOT_STARTED: "Not Started",
  IN_PROGRESS: "In Progress",
  COMPLETED: "Completed",
  CANCELLED: "Cancelled",
  PENDING_REVIEW: "Pending Review",
  NEEDS_REVISION: "Needs Revision",
};


const priorityStyles = {
  LOW: "bg-muted text-muted-foreground",
  MEDIUM: "bg-warning/15 text-warning border-warning/30",
  HIGH: "bg-destructive/15 text-destructive border-destructive/30",
};

const priorityLabels = {
  LOW: "Low",
  MEDIUM: "Medium",
  HIGH: "High",
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
