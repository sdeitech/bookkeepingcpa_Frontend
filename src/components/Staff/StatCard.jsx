import { cn } from "@/lib/utils";

export function StatCard({ title, value, icon: Icon, tint, iconColor }) {
  return (
    <div className="group bg-card border border-border rounded-xl p-5 transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-muted-foreground mb-1">{title}</p>
          <p className="text-3xl font-bold text-foreground">{value}</p>
        </div>
        <div
          className={cn(
            "w-11 h-11 rounded-xl flex items-center justify-center transition-transform duration-200 group-hover:scale-110",
            tint,
          )}
        >
          <Icon className={cn("w-5 h-5", iconColor)} />
        </div>
      </div>
    </div>
  );
}
