import { Button } from "../../components/ui/button";
import { 
  Users, 
  LayoutDashboard, 
  UserCheck, 
  ClipboardList, 
  Eye, 
  Settings, 
  FileBarChart 
} from "lucide-react";
import { Link } from "react-router-dom";



const adminActions = [
  { label: "Manage Staff", icon: Users, href: "/admin/staff", variant: "default" },
  { label: "Overview", icon: LayoutDashboard, href: "/admin", variant: "secondary" },
  { label: "All Users", icon: UserCheck, href: "/admin/users", variant: "default" },
  { label: "Client Assignments", icon: ClipboardList, href: "/admin/assignments", variant: "default" },
  { label: "Client Viewer", icon: Eye, href: "/admin/clients", variant: "default" },
  { label: "System Settings", icon: Settings, href: "/admin/settings", variant: "default" },
  { label: "Reports", icon: FileBarChart, href: "/admin/reports", variant: "default" },
];

export function AdminActionsCard() {
  return (
    <div className="bg-card border border-border rounded-xl p-6">
      <h2 className="text-lg font-semibold text-foreground mb-4">Administration</h2>
      <div className="flex flex-wrap gap-3">
        {adminActions.map((action) => (
          <Link key={action.label} to={action.href}>
            <Button 
              variant={action.variant || "default"} 
              className="gap-2"
            >
              <action.icon className="w-4 h-4" />
              {action.label}
            </Button>
          </Link>
        ))}
      </div>
    </div>
  );
}
