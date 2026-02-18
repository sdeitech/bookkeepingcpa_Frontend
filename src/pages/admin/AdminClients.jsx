import { Link } from "react-router-dom";
import { Building2, ArrowRight } from "lucide-react";
import { Badge } from "../../components/ui/badge";
import { useGetAllClientsQuery } from "@/features/user/userApi";
import { useGetTasksQuery } from "@/features/tasks/tasksApi";

export default function AdminClients() {
  /* ================= FETCH REAL DATA ================= */

  const { data: clientsData, isLoading: clientsLoading } =
    useGetAllClientsQuery();

  const { data: tasksData, isLoading: tasksLoading } =
    useGetTasksQuery({});

  const clients = clientsData?.data || [];
  const tasks = tasksData?.data?.tasks || [];

  /* ================= UI ================= */

  if (clientsLoading || tasksLoading) {
    return (
      <div className="p-6 text-muted-foreground">
        Loading clients...
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-foreground">
          Clients
        </h1>
        <p className="text-sm text-muted-foreground">
          {clients.length} clients
        </p>
      </div>

      <div className="grid gap-4">
        {clients.map((client) => {
          // Filter tasks belonging to this client
          const clientTasks = tasks.filter(
            (t) =>
              t.clientId?.id === client.id
          );

          const completed = clientTasks.filter(
            (t) => t.status === "COMPLETED"
          ).length;

          return (
            <Link
              key={client.id}
              to={`/adminDashboard/clients/${client.id}`}
              className="bg-card border border-border rounded-xl p-5 flex items-center justify-between hover:border-primary/40 transition-colors group no-underline"
            >
              <div className="flex items-center gap-4">
                <div className="w-11 h-11 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Building2 className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="font-semibold text-foreground -mb-1 mt-3">
                    {client.name}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    {client.email}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <Badge
                  variant="outline"
                  className="capitalize"
                >
                  {client.plan || "standard"}
                </Badge>

                <span className="text-sm text-muted-foreground">
                  {completed}/{clientTasks.length} tasks done
                </span>

                <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
