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

    </div>
  );
}
