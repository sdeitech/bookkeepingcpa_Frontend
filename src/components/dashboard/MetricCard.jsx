import { cn } from "../../lib/utils";
import {  TrendingUp, TrendingDown } from "lucide-react";


export function MetricCard({ title, value, change, icon: Icon, className }) {
  return (
    <div className={cn("bg-card border border-border rounded-xl p-6", className)}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-muted-foreground mb-1">{title}</p>
          <p className="text-2xl font-bold text-foreground">{value}</p>
          {change && (
            // <div className="flex items-center gap-1 mt-2">
            //   {change.type === 'increase' && <TrendingUp className="w-4 h-4 text-success" />}
            //   {change.type === 'decrease' && <TrendingDown className="w-4 h-4 text-destructive" />}
            //   <span
            //     className={cn(
            //       "text-sm font-medium",
            //       change.type === 'increase' && "text-success",
            //       change.type === 'decrease' && "text-destructive",
            //       change.type === 'neutral' && "text-muted-foreground"
            //     )}
            //   >
            //     {change.value}
            //   </span>
            // </div>
          <span className="text-sm text-muted-foreground">{change.value}</span>
          )}
        </div>
        {Icon && (
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <Icon className="w-5 h-5 text-primary" />
          </div>
        )}
      </div>
    </div>
  );
}
