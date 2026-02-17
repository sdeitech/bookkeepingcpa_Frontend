import { cn } from "../../lib/utils";


function MetricItem({ value, label, variant = "default" }) {
  return (
    <div 
      className={cn(
        "flex flex-col items-center justify-center p-6 rounded-lg border",
        variant === "primary" && "bg-primary/5 border-primary/20",
        variant === "accent" && "bg-accent border-accent-foreground/10",
        variant === "default" && "bg-muted/50 border-border"
      )}
    >
      <span className={cn(
        "text-3xl font-bold",
        variant === "primary" ? "text-primary" : "text-foreground"
      )}>
        {value}
      </span>
      <span className="text-sm text-muted-foreground uppercase tracking-wide mt-1">
        {label}
      </span>
    </div>
  );
}



export function SystemOverviewCard({ 
  totalStaff, 
  activeStaff, 
  totalClients, 
  activeUsers 
}) {
  return (
    <div className="bg-card border border-border rounded-xl p-6">
      <h2 className="text-lg font-semibold text-foreground mb-4">System Overview</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <MetricItem value={totalStaff} label="Total Staff" />
        <MetricItem value={activeStaff} label="Active Staff" />
        <MetricItem value={totalClients} label="Total Clients" variant="primary" />
        <MetricItem value={activeUsers} label="Active Users" variant="primary" />
      </div>
    </div>
  );
}
