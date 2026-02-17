import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../../components/ui/dialog";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Textarea } from "../../components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import { Plus } from "lucide-react";
import { useGetAllClientsQuery } from "@/features/user/userApi";
import { useGetAllStaffQuery } from "@/features/auth/authApi";

export function CreateTaskDialog({
  open,
  onOpenChange,
  onCreate,
}) {
  /* ================= STATE ================= */

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [clientId, setClientId] = useState(undefined);
  const [assignedTo, setAssignedTo] = useState(undefined);
  const [taskType, setTaskType] = useState(undefined);
  const [status, setStatus] = useState("NOT_STARTED");
  const [priority, setPriority] = useState("MEDIUM");
  const [dueDate, setDueDate] = useState("");

  /* ================ API ================= */

  const { data: clientsData } = useGetAllClientsQuery();
  const { data: staffData } = useGetAllStaffQuery();

  const clients = clientsData?.data ?? [];
  const staff = staffData?.data ?? [];

  /* =============== CONSTANTS ============== */

  const TASK_TYPES = [
    { value: "DOCUMENT_UPLOAD", label: "Document Upload" },
    { value: "INTEGRATION", label: "Integration" },
    { value: "ACTION", label: "Action" },
    { value: "REVIEW", label: "Review" },
  ];

  const TASK_STATUSES = [
    { value: "NOT_STARTED", label: "Not Started" },
    { value: "IN_PROGRESS", label: "In Progress" },
    { value: "PENDING_REVIEW", label: "Pending Review" },
    { value: "NEEDS_REVISION", label: "Needs Revision" },
    { value: "COMPLETED", label: "Completed" },
    { value: "CANCELLED", label: "Cancelled" },
  ];

  const TASK_PRIORITIES = [
    { value: "LOW", label: "Low" },
    { value: "MEDIUM", label: "Medium" },
    { value: "HIGH", label: "High" },
  ];



  /* ============== RESET ============== */

  const reset = () => {
    setTitle("");
    setDescription("");
    setClientId(undefined);
    setAssignedTo(undefined);
    setTaskType(undefined);
    setStatus("NOT_STARTED");
    setPriority("MEDIUM");
    setDueDate("");
  };

  /* ============== SUBMIT ============== */

  const handleSubmit = (e) => {
    e.preventDefault();

    const client = clients.find(
      (c) => String(c.id) === String(clientId)
    );


    if (
      !client ||
      !title.trim() ||
      !assignedTo ||
      !taskType ||
      !dueDate
    )
      return;

    onCreate({
      title: title.trim(),
      description: description.trim(),
      clientId: String(client.id),
      clientName: client.name,
      assignedTo: String(assignedTo),
      taskType,
      status,
      priority,
      dueDate,
    });

    reset();
    onOpenChange(false);
  };

  const isValid =
    title.trim().length > 0 &&
    !!clientId &&
    !!assignedTo &&
    !!taskType &&
    dueDate !== "";

  /* ================= UI ================= */

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg bg-card">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5 text-primary" />
            Create New Task
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">

          {/* Title */}
          <div className="space-y-2">
            <Label>Title *</Label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Complete Q4 Tax Filing"
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label>Description</Label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Task details..."
              rows={2}
            />
          </div>

          {/* Client + Assign */}
          <div className="grid grid-cols-2 gap-4">

            {/* Client */}
            <div className="space-y-2">
              <Label>Client *</Label>
              <Select
                value={clientId}
                onValueChange={(value) =>
                  setClientId(String(value))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select client" />
                </SelectTrigger>

                <SelectContent className="bg-popover z-50">
                  {clients.map((c) => (
                    <SelectItem
                      key={c.id}
                      value={String(c.id)}
                    >
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Assign To */}
            <div className="space-y-2">
              <Label>Assign To *</Label>
              <Select
                value={assignedTo}
                onValueChange={(value) =>
                  setAssignedTo(String(value))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select staff" />
                </SelectTrigger>

                <SelectContent className="bg-popover z-50">
                  {staff.map((s) => (
                    <SelectItem
                      key={s._id}
                      value={String(s._id)}
                    >
                      {s.first_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Task Type */}
          <div className="space-y-2">
            <Label>Task Type *</Label>
            <Select
              value={taskType}
              onValueChange={(value) =>
                setTaskType(value)
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select task type" />
              </SelectTrigger>

              <SelectContent className="bg-popover z-50">
                {TASK_TYPES.map((type) => (
                  <SelectItem
                    key={type.value}
                    value={type.value}
                  >
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Status + Priority + Due */}
          <div className="grid grid-cols-3 gap-2">

            <div className="space-y-2">
              <Label>Status</Label>
              <Select
                value={status}
                onValueChange={(value) =>
                  setStatus(value)
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>

                <SelectContent className="bg-popover z-50">
                  {TASK_STATUSES.map((s) => (
                    <SelectItem
                      key={s.value}
                      value={s.value}
                    >
                      {s.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Priority</Label>
              <Select
                value={priority}
                onValueChange={(value) =>
                  setPriority(value)
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>

                <SelectContent className="bg-popover z-50">
                  {TASK_PRIORITIES.map((p) => (
                    <SelectItem
                      key={p.value}
                      value={p.value}
                    >
                      {p.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Due Date *</Label>
              <Input
                type="date"
                value={dueDate}
                onChange={(e) =>
                  setDueDate(e.target.value)
                }
              />
            </div>

          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>

            <Button type="submit" disabled={!isValid}>
              Create Task
            </Button>
          </div>

        </form>
      </DialogContent>
    </Dialog>
  );
}
