import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TASK_STATUSES, TASK_PRIORITIES, STAFF_MEMBERS, MOCK_CLIENTS } from "@/lib/task-types";
import { Plus } from "lucide-react";

export function CreateTaskDialog({ open, onOpenChange, onCreate, prefillClientId }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [clientId, setClientId] = useState(prefillClientId || "");
  const [assignedTo, setAssignedTo] = useState("");
  const [status, setStatus] = useState("not_started");
  const [priority, setPriority] = useState("medium");
  const [dueDate, setDueDate] = useState("");

  const reset = () => {
    setTitle("");
    setDescription("");
    setClientId(prefillClientId || "");
    setAssignedTo("");
    setStatus("not_started");
    setPriority("medium");
    setDueDate("");
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const client = MOCK_CLIENTS.find(c => c.id === clientId);
    if (!client || !title || !assignedTo || !dueDate) return;

    onCreate({
      title,
      description,
      clientId: client.id,
      clientName: client.name,
      assignedTo,
      status,
      priority,
      dueDate,
    });
    reset();
    onOpenChange(false);
  };

  const isValid = title.trim() && clientId && assignedTo && dueDate;

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
          <div className="space-y-2">
            <Label htmlFor="task-title">Title *</Label>
            <Input id="task-title" value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. Complete Q4 Tax Filing" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="task-desc">Description</Label>
            <Textarea id="task-desc" value={description} onChange={e => setDescription(e.target.value)} placeholder="Task details..." rows={2} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Client *</Label>
              <Select value={clientId} onValueChange={setClientId}>
                <SelectTrigger><SelectValue placeholder="Select client" /></SelectTrigger>
                <SelectContent className="bg-popover z-50">
                  {MOCK_CLIENTS.map(c => (
                    <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Assign To *</Label>
              <Select value={assignedTo} onValueChange={setAssignedTo}>
                <SelectTrigger><SelectValue placeholder="Select staff" /></SelectTrigger>
                <SelectContent className="bg-popover z-50">
                  {STAFF_MEMBERS.map(s => (
                    <SelectItem key={s} value={s}>{s}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Status</Label>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent className="bg-popover z-50">
                  {TASK_STATUSES.map(s => (
                    <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Priority</Label>
              <Select value={priority} onValueChange={setPriority}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent className="bg-popover z-50">
                  {TASK_PRIORITIES.map(p => (
                    <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Due Date *</Label>
              <Input type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit" disabled={!isValid}>Create Task</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
