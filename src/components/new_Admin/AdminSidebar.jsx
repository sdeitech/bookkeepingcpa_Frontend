import { Link, useLocation } from "react-router-dom";
import { Home, Users, UserCheck, CheckSquare, FileText, Mail, Settings, ArrowLeft, UserPlus } from "lucide-react";
import { PlutifyLogo } from "@/components/PlutifyLogo";
import { cn } from "@/lib/utils";

const navItems = [
  { icon: Home, label: "Dashboard", href: "/admin" },
  { icon: Users, label: "Clients", href: "/admin/clients" },
  { icon: UserCheck, label: "Staff", href: "/admin/staff" },
  // { icon: UserPlus, label: "Assign Clients", href: "/admin/assign-clients" },
  { icon: CheckSquare, label: "Tasks", href: "/admin/tasks" },
  { icon: FileText, label: "Documents", href: "/admin/documents" },
  { icon: Mail, label: "Messages", href: "/admin/messages" },
  { icon: Settings, label: "Settings", href: "/admin/settings" },
];

export function AdminSidebar() {
  const location = useLocation();

  const isActive = (href) => {
    if (href === "/admin") return location.pathname === "/admin";
    return location.pathname.startsWith(href);
  };

  return (
    <aside className="bg-sidebar text-sidebar-foreground flex flex-col min-h-screen w-64">
      <div className="p-4 border-b border-sidebar-border flex items-center justify-between">
        <div>
          <PlutifyLogo variant="light" />
          <span className="text-xs text-sidebar-foreground/50 mt-1 block">Admin Panel</span>
        </div>
      </div>

      <nav className="flex-1 p-3 space-y-1">
        {navItems.map((item) => {
          const active = isActive(item.href);
          return (
            <Link
              key={item.href}
              to={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors no-underline",
                active
                  ? "bg-sidebar-primary text-sidebar-primary-foreground"
                  : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              )}
            >
              <item.icon className="w-5 h-5 shrink-0" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* <div className="p-3 border-t border-sidebar-border">
        <Link
          to="/dashboard"
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors"
        >
          <ArrowLeft className="w-5 h-5 shrink-0" />
          Back to Dashboard
        </Link>
      </div> */}
    </aside>
  );
}
