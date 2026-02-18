import { useState } from "react";
import { useTasks } from "@/hooks/useTasks";
import { MOCK_CLIENTS, TASK_PRIORITIES } from "@/lib/task-types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { CheckCircle2 } from "lucide-react";

const CURRENT_STAFF = "Sarah Mitchell";

export default function StaffCreateTask() {
  const { createTask } = useTasks();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [clientId, setClientId] = useState("");
  const [priority, setPriority] = useState("medium");
  const [dueDate, setDueDate] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const selectedClient = MOCK_CLIENTS.find((c) => c.id === clientId);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title || !clientId || !dueDate) return;

    createTask({
      title,
      description,
      clientId,
      clientName: selectedClient?.name || "",
      assignedTo: CURRENT_STAFF,
      status: "not_started",
      priority,
      dueDate,
    });

    setSubmitted(true);
    toast({ title: "Task created", description: title });
    setTimeout(() => navigate("/staff/tasks"), 1500);
  };

  if (submitted) {
    return (
      <div className="flex flex-col items-center justify-center py-20 animate-fade-in">
        <div className="w-16 h-16 rounded-full bg-success/10 flex items-center justify-center mb-4">
          <CheckCircle2 className="w-8 h-8 text-success" />
        </div>
        <h2 className="text-xl font-semibold text-foreground">Task Created!</h2>
        <p className="text-sm text-muted-foreground mt-1">Redirecting to your tasks...</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto animate-fade-in">
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-foreground">Create Client Task</h2>
        <p className="text-sm text-muted-foreground mt-1">Create a new task for a client</p>
      </div>

      <form onSubmit={handleSubmit} className="bg-card border border-border rounded-xl p-6 space-y-5">
        <div className="space-y-2">
          <Label htmlFor="title">Task Title *</Label>
          <Input
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Reconcile Q1 statements"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Optional details..."
            rows={3}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Client *</Label>
            <Select value={clientId} onValueChange={setClientId} required>
              <SelectTrigger>
                <SelectValue placeholder="Select client" />
              </SelectTrigger>
              <SelectContent>
                {MOCK_CLIENTS.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Priority</Label>
            <Select value={priority} onValueChange={setPriority}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {TASK_PRIORITIES.map((p) => (
                  <SelectItem key={p.value} value={p.value}>
                    {p.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="due">Due Date *</Label>
          <Input id="due" type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} required />
        </div>

        <div className="flex gap-3 pt-2">
          <Button
            type="submit"
            className="bg-primary text-primary-foreground hover:opacity-90 gap-2 shadow-md"
            disabled={!title || !clientId || !dueDate}
          >
            Create Task
          </Button>
          <Button type="button" variant="outline" onClick={() => navigate("/staff")}>
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
}
