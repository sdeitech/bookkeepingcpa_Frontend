import { Link } from "react-router-dom";
import { MOCK_CLIENTS } from "@/lib/task-types";
import { useTasks } from "@/hooks/useTasks";
import { Building2, ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useGetAllClientsQuery } from "@/features/user/userApi";
import { useGetTasksQuery } from "@/features/tasks/tasksApi";

export default function AdminClients() {

  const { data: clientsData, isLoading: clientsLoading } =
    useGetAllClientsQuery();

  const { data: tasksData, isLoading: tasksLoading } =
    useGetTasksQuery({});

  const clients = clientsData?.data || [];
  const tasks = tasksData?.data?.tasks || [];

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Clients</h1>
        <p className="text-sm text-muted-foreground">{clients.length} clients</p>
      </div>

      <div className="grid gap-4">
        {clients.map(client => {
          const clientTasks = tasks.filter(t => t.clientId === client.id);
          const completed = clientTasks.filter(t => t.status === "completed").length;
          return (
            <Link
              key={client.id}
              to={`/admin/clients/${client.id}`}
              className="bg-card border border-border rounded-xl p-5 flex items-center justify-between hover:border-primary/40 transition-colors group no-underline"
            >
              <div className="flex items-center gap-4">
                <div className="w-11 h-11 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Building2 className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="font-semibold text-foreground">{client.name}</p>
                  <p className="text-sm text-muted-foreground">{client.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <Badge variant="outline" className="capitalize">{client.plan || "Standard"}</Badge>
                <span className="text-sm text-muted-foreground">{completed}/{clientTasks.length} tasks done</span>
                <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
