import { Link } from "react-router-dom";
import { Building2, ArrowRight } from "lucide-react";
import { Badge } from "../../components/ui/badge";

export default function AdminClients() {
  const tasks=[]
  const MOCK_CLIENTS = [
    { id: "c1", name: "Acme Corp", email: "admin@acme.com", plan: "enterprise" },
    { id: "c2", name: "Bloom Studio", email: "hello@bloom.io", plan: "essential" },
    { id: "c3", name: "Nova Labs", email: "team@novalabs.com", plan: "startup" },
    { id: "c4", name: "Greenfield Inc", email: "info@greenfield.com", plan: "essential" },
    { id: "c5", name: "Pixel Works", email: "contact@pixelworks.co", plan: "startup" },
  ];
  
 
  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Clients</h1>
        <p className="text-sm text-muted-foreground">{MOCK_CLIENTS.length} clients</p>
      </div>

      <div className="grid gap-4">
        {MOCK_CLIENTS.map(client => {
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
                <Badge variant="outline" className="capitalize">{client.plan}</Badge>
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
