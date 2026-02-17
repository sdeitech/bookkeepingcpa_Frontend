import { UserPlus, UserCheck, Database, Settings, FileText } from "lucide-react";
import { cn } from "../../lib/utils";


const activityIcons = {
  user_registered: UserPlus,
  staff_added: UserCheck,
  backup: Database,
  settings: Settings,
  report: FileText,
};

const activityColors = {
  user_registered: "text-primary bg-primary/10",
  staff_added: "text-blue-500 bg-blue-500/10",
  backup: "text-success bg-success/10",
  settings: "text-orange-500 bg-orange-500/10",
  report: "text-purple-500 bg-purple-500/10",
};


export function RecentActivityCard({ activities }) {
  return (
    <div className="bg-card border border-border rounded-xl p-6">
      <h2 className="text-lg font-semibold text-foreground mb-4">Recent Activity</h2>
      <div className="space-y-4">
        {activities.map((activity) => {
          const Icon = activityIcons[activity.type];
          const colorClass = activityColors[activity.type];
          
          return (
            <div key={activity.id} className="flex items-start gap-3">
              <div className={cn("w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0", colorClass)}>
                <Icon className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-foreground">{activity.message}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{activity.timestamp}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}


