import { Link } from "react-router-dom";
import { useTasks } from "@/hooks/useTasks";
import { Building2, ArrowRight, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useGetAllClientsQuery } from "@/features/user/userApi";
import { useGetTasksQuery } from "@/features/tasks/tasksApi";

export default function AdminClients() {
  // Fetch real clients from backend
  const { data: clientsData, isLoading: clientsLoading, error: clientsError } = useGetAllClientsQuery();

  console.log('client data ->', clientsData)
  
  // Fetch real tasks from backend
  const { tasks, isLoading: tasksLoading } = useTasks();

  // Extract clients from response
  const clients = clientsData?.data || [];

  // Loading state
  if (clientsLoading || tasksLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Loading clients...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (clientsError) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-lg font-semibold text-destructive">Error Loading Clients</p>
          <p className="text-sm text-muted-foreground mt-2">
            {clientsError?.data?.message || clientsError?.message || 'Failed to fetch clients'}
          </p>
        </div>
      </div>
    );
  }

  // Empty state
  if (clients.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Building2 className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
          <p className="text-lg font-semibold text-foreground">No Clients Yet</p>
          <p className="text-sm text-muted-foreground mt-2">
            Clients will appear here once they sign up
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Clients</h1>
        <p className="text-sm text-muted-foreground">{clients.length} clients</p>
      </div>

      <div className="grid gap-4">
        {clients.map(client => {
          const clientTasks = tasks.filter(t => t.clientId === client.id);
          const completed = clientTasks.filter(t => t.status === "COMPLETED").length;
          
          // Construct full name from backend fields
          const fullName = `${client.first_name || ''} ${client.last_name || ''}`.trim() || 'Unnamed Client';
          
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
                  <p className="font-semibold text-foreground">{fullName}</p>
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
