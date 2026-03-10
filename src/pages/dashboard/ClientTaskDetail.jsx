import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useGetTaskByIdQuery, useUpdateTaskStatusMutation } from "@/features/tasks/tasksApi";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TaskStatusBadge, TaskPriorityBadge } from "@/components/new_Admin/TaskStatusBadge";
import { ArrowLeft, Calendar, User, FileText, Clock } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export default function ClientTaskDetail() {
  const { taskId } = useParams();
  const navigate = useNavigate();
  const [selectedStatus, setSelectedStatus] = useState("");

  const { data: taskData, isLoading, error, refetch } = useGetTaskByIdQuery(taskId);
  const [updateStatus, { isLoading: isUpdating }] = useUpdateTaskStatusMutation();

  const task = taskData?.data;

  useEffect(() => {
    if (task) {
      setSelectedStatus(task.status);
    }
  }, [task]);

  // Client status options (only IN_PROGRESS and PENDING_REVIEW)
  const statusOptions = [
    { value: "IN_PROGRESS", label: "In Progress" },
    { value: "PENDING_REVIEW", label: "Pending Review" },
  ];

  // Get valid next statuses for clients
  const getValidNextStatuses = (currentStatus) => {
    const transitions = {
      'NOT_STARTED': ['IN_PROGRESS'],
      'IN_PROGRESS': ['PENDING_REVIEW'],
      'PENDING_REVIEW': [], // Client cannot change from pending review
      'NEEDS_REVISION': ['IN_PROGRESS'],
      'ON_HOLD': [], // Client cannot change from on hold
      'COMPLETED': []
    };
    return transitions[currentStatus] || [];
  };

  const handleStatusUpdate = async () => {
    if (!task || selectedStatus === task.status) return;

    try {
      await updateStatus({
        id: taskId,
        status: selectedStatus,
        notes: `Status changed from ${task.status} to ${selectedStatus} by client`
      }).unwrap();

      toast.success("Task status updated successfully");
      refetch();
    } catch (error) {
      console.error("Status update error:", error);
      toast.error(error?.data?.message || "Failed to update task status");
      setSelectedStatus(task.status); // Reset to original status
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading task details...</p>
        </div>
      </div>
    );
  }

  if (error || !task) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <p className="text-destructive mb-4">Failed to load task details</p>
          <Button onClick={() => navigate("/new-dashboard/tasks")} variant="outline">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Tasks
          </Button>
        </div>
      </div>
    );
  }

  const validStatuses = getValidNextStatuses(task.status);
  const canUpdateStatus = validStatuses.length > 0;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          onClick={() => navigate("/new-dashboard/tasks")}
          variant="ghost"
          size="sm"
          className="gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Tasks
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-foreground">{task.title}</h1>
          <p className="text-sm text-muted-foreground">Task Details</p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Main Content */}
        <div className="md:col-span-2 space-y-6">
          {/* Task Info */}
          <Card>
            <CardHeader>
              <CardTitle>Task Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Description</label>
                <p className="mt-1 text-sm">
                  {task.description || "No description provided"}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Type</label>
                  <p className="mt-1 text-sm font-medium">
                    {task.taskType?.replace('_', ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase())}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Priority</label>
                  <div className="mt-1">
                    <TaskPriorityBadge priority={task.priority?.toLowerCase()} />
                  </div>
                </div>
              </div>

              {/* Required Documents */}
              {task.requiredDocuments && task.requiredDocuments.length > 0 && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Required Documents</label>
                  <div className="mt-2 space-y-2">
                    {task.requiredDocuments.map((doc, index) => (
                      <div key={index} className="flex items-center justify-between p-2 bg-muted/50 rounded">
                        <span className="text-sm">{doc.type}</span>
                        <span className={cn(
                          "text-xs px-2 py-1 rounded",
                          doc.uploaded 
                            ? "bg-green-100 text-green-700" 
                            : "bg-yellow-100 text-yellow-700"
                        )}>
                          {doc.uploaded ? "Uploaded" : "Pending"}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Status History */}
          {task.statusHistory && task.statusHistory.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Status History</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {task.statusHistory.slice().reverse().map((history, index) => (
                    <div key={index} className="flex items-center gap-3 p-3 bg-muted/30 rounded">
                      <TaskStatusBadge status={history.status?.toLowerCase()} />
                      <div className="flex-1">
                        <p className="text-sm">{history.notes}</p>
                        <p className="text-xs text-muted-foreground">
                          {format(new Date(history.changedAt), "MMM d, yyyy 'at' h:mm a")}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Status Update */}
          <Card>
            <CardHeader>
              <CardTitle>Update Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Current Status</label>
                <div className="mt-1">
                  <TaskStatusBadge status={task.status?.toLowerCase()} />
                </div>
              </div>

              {canUpdateStatus && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Change Status</label>
                  <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {statusOptions.map((option) => {
                        const isDisabled = !validStatuses.includes(option.value) && option.value !== task.status;
                        return (
                          <SelectItem 
                            key={option.value} 
                            value={option.value}
                            disabled={isDisabled}
                          >
                            {option.label}
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>

                  <Button
                    onClick={handleStatusUpdate}
                    disabled={isUpdating || selectedStatus === task.status}
                    className="w-full mt-3"
                  >
                    {isUpdating ? "Updating..." : "Update Status"}
                  </Button>
                </div>
              )}

              {!canUpdateStatus && (
                <div className="text-sm text-muted-foreground">
                  Status cannot be changed from current state.
                </div>
              )}
            </CardContent>
          </Card>

          {/* Task Details */}
          <Card>
            <CardHeader>
              <CardTitle>Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <User className="w-4 h-4 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Assigned By</p>
                  <p className="text-sm font-medium">
                    {task.assignedBy?.first_name} {task.assignedBy?.last_name}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Calendar className="w-4 h-4 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Due Date</p>
                  <p className="text-sm font-medium">
                    {task.dueDate ? format(new Date(task.dueDate), "MMM d, yyyy") : "No due date"}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Clock className="w-4 h-4 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Created</p>
                  <p className="text-sm font-medium">
                    {format(new Date(task.createdAt), "MMM d, yyyy")}
                  </p>
                </div>
              </div>

              {task.completedAt && (
                <div className="flex items-center gap-3">
                  <FileText className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground">Completed</p>
                    <p className="text-sm font-medium">
                      {format(new Date(task.completedAt), "MMM d, yyyy")}
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}