import { useTasks } from "@/hooks/useTasks";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Users, Mail, ExternalLink } from "lucide-react";
import { isPast, isToday } from "date-fns";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import { useOutletContext } from "react-router-dom";

const CURRENT_STAFF = "Sarah Mitchell";

export default function StaffClients() {
  const { myClients } = useOutletContext();
  const { tasks, isLoading } = useTasks();
  const myTasks = tasks.filter((t) => t.assignedTo === CURRENT_STAFF);

  const getClientId = (client) => client?._id || client?.id;
  const getTaskClientId = (task) => task?.clientId || task?.client?._id || task?.client?.id;

  const getClientName = (client) => {
    if (client?.first_name || client?.last_name) {
      return [client?.first_name, client?.last_name].filter(Boolean).join(" ");
    }
    return client?.name || "Unnamed Client";
  };

  const getSubscription = (client) => client?.progress?.subscription || {};
  const getIntegrationsSummary = (client) => {
    const integrations = client?.progress?.integrations || {};
    const connectedCount = Object.values(integrations).filter(Boolean).length;
    const totalCount = Object.keys(integrations).length;
    if (totalCount === 0) return "No integrations";
    return `${connectedCount}/${totalCount} integrations`;
  };

  if (isLoading) {
    return (
      <div className="space-y-4 animate-fade-in">
        <Skeleton className="h-8 w-40" />
        <Skeleton className="h-[300px] rounded-xl" />
      </div>
    );
  }


  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          {/* <h2 className="text-xl font-semibold text-foreground">My Clients</h2> */}
          <p className="text-sm text-muted-foreground mt-1">{myClients.length} clients assigned to you</p>
        </div>
      </div>

      {myClients.length === 0 ? (
        <div className="bg-card border border-border rounded-xl p-12 text-center">
          <Users className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
          <p className="text-lg font-medium text-foreground mb-1">No clients yet</p>
          <p className="text-sm text-muted-foreground">Clients will appear here once tasks are assigned to you.</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {myClients.map((client) => {
            const clientId = getClientId(client);
            const subscription = getSubscription(client);
            const clientTasks = myTasks.filter((t) => getTaskClientId(t) === clientId);
            const completed = clientTasks.filter((t) => t.status === "completed").length;
            const pending = clientTasks.length - completed;
            const hasOverdue = clientTasks.some(
              (t) => t?.dueDate && isPast(new Date(t.dueDate)) && !isToday(new Date(t.dueDate)) && t.status !== "completed",
            );

            return (
              <div
                key={clientId}
                className={cn(
                  "bg-card border rounded-xl p-5 transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5",
                  hasOverdue ? "border-destructive/40" : "border-border",
                )}
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-semibold text-foreground">{getClientName(client)}</h3>
                    <p className="text-sm text-muted-foreground flex items-center gap-1 mt-0.5">
                      <Mail className="w-3.5 h-3.5" /> {client?.email}
                    </p>
                    {client?.phoneNumber && <p className="text-xs text-muted-foreground mt-1">{client.phoneNumber}</p>}
                  </div>
                  <Badge variant="secondary" className="text-[11px] capitalize">
                    {subscription?.status || (client?.active ? "active" : "inactive")}
                  </Badge>
                </div>

                <div className="text-xs text-muted-foreground mb-3 space-y-1">
                  <p>Plan: {subscription?.planName || "No plan"}</p>
                  <p>Onboarding: {client?.progress?.onboarding?.completed ? "Completed" : `Step ${client?.progress?.onboarding?.step || 1}`}</p>
                  <p>{getIntegrationsSummary(client)}</p>
                </div>

                <div className="flex items-center gap-4 text-sm mb-4">
                  <span className="text-muted-foreground">
                    <span className="font-semibold text-foreground">{clientTasks.length}</span> tasks
                  </span>
                  <span className="text-muted-foreground">
                    <span className="font-semibold text-success">{completed}</span> done
                  </span>
                  {pending > 0 && (
                    <span className="text-muted-foreground">
                      <span className="font-semibold text-warning">{pending}</span> pending
                    </span>
                  )}
                </div>

                <div className="w-full bg-muted rounded-full h-1.5 mb-4">
                  <div
                    className="bg-success h-1.5 rounded-full transition-all"
                    style={{ width: `${clientTasks.length > 0 ? (completed / clientTasks.length) * 100 : 0}%` }}
                  />
                </div>

                <Link to={`/staff/clients/${clientId}`}>
                  <Button variant="outline" size="sm" className="w-full gap-2">
                    <ExternalLink className="w-3.5 h-3.5" /> View Details
                  </Button>
                </Link>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
