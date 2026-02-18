import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  CheckSquare,
  BarChart3,
  PlusCircle,
  LogOut,
} from "lucide-react";
import { PlutifyLogo } from "@/components/PlutifyLogo";
import { cn } from "@/lib/utils";

const navItems = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/staff" },
  { icon: Users, label: "My Clients", href: "/staff/clients" },
  { icon: CheckSquare, label: "My Tasks", href: "/staff/tasks" },
  { icon: BarChart3, label: "Reports", href: "/staff/reports" },
  { icon: PlusCircle, label: "Create Client Task", href: "/staff/create-task" },
];

export function StaffSidebar() {
  const location = useLocation();

  return (
    <aside className="relative flex flex-col min-h-screen w-64 bg-sidebar text-sidebar-foreground border-r border-sidebar-border shadow-lg">
      <div className="p-4 border-b border-sidebar-border">
        <PlutifyLogo variant="light" />
      </div>

        <nav className="flex-1 p-3 space-y-1">
          {navItems.map((item) => {
            const isActive = location.pathname === item.href || (item.href === "/staff" && location.pathname === "/staff");

            return (
              <div key={item.href}>
                <Link
                  to={item.href}
                  className={cn(
                    "flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium transition-all duration-200 no-underline",
                    isActive
                    ? "bg-[#0c3d8c] text-white"
                    : "text-white hover:bg-[#263247] hover:text-[#F0F1F3]"
                  )}
                >
                  <item.icon className="w-5 h-5 shrink-0" />
                  <span>{item.label}</span>
                </Link>
              </div>
            );
          })}
        </nav>

      <div className="p-3 border-t border-sidebar-border">
        <Link
          to="/"
          className={cn(
            "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-all duration-200",
          )}
        >
          <LogOut className="w-5 h-5 shrink-0" />
          <span>Sign Out</span>
        </Link>
      </div>
    </aside>
  );
}
