import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  CheckSquare,
  BarChart3,
  PlusCircle,
  LogOut,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { PlutifyLogo } from "@/components/PlutifyLogo";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

const navItems = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/staff" },
  { icon: Users, label: "My Clients", href: "/staff/clients" },
  { icon: CheckSquare, label: "My Tasks", href: "/staff/tasks" },
  { icon: BarChart3, label: "Reports", href: "/staff/reports" },
  { icon: PlusCircle, label: "Create Client Task", href: "/staff/create-task" },
];

export function StaffSidebar() {
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      className={cn(
        "relative flex flex-col min-h-screen bg-sidebar text-sidebar-foreground border-r border-sidebar-border shadow-lg transition-all duration-300",
        collapsed ? "w-[72px]" : "w-64",
      )}
    >
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setCollapsed(!collapsed)}
        className="absolute -right-3 top-20 z-10 h-6 w-6 rounded-full border border-border bg-card text-muted-foreground shadow-md hover:bg-accent"
      >
        {collapsed ? <ChevronRight className="h-3.5 w-3.5" /> : <ChevronLeft className="h-3.5 w-3.5" />}
      </Button>

      <div className={cn("p-5 border-b border-sidebar-border flex items-center", collapsed && "justify-center")}>
        {collapsed ? (
          <div className="w-10 h-10 rounded-lg bg-primary-foreground text-primary flex items-center justify-center font-bold text-xl">
            P
          </div>
        ) : (
          <PlutifyLogo variant="light" />
        )}
      </div>

      <nav className="flex-1 p-3 space-y-1">
        {navItems.map((item) => {
          const isActive = location.pathname === item.href || (item.href === "/staff" && location.pathname === "/staff");

          const linkContent = (
            <Link
              to={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200",
                collapsed && "justify-center px-0",
                isActive
                  ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-md"
                  : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
              )}
            >
              <item.icon className="w-5 h-5 shrink-0" />
              {!collapsed && <span>{item.label}</span>}
            </Link>
          );

          if (collapsed) {
            return (
              <Tooltip key={item.href} delayDuration={0}>
                <TooltipTrigger asChild>{linkContent}</TooltipTrigger>
                <TooltipContent side="right" className="font-medium">
                  {item.label}
                </TooltipContent>
              </Tooltip>
            );
          }

          return <div key={item.href}>{linkContent}</div>;
        })}
      </nav>

      <div className="p-3 border-t border-sidebar-border">
        <Link
          to="/"
          className={cn(
            "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-all duration-200",
            collapsed && "justify-center",
          )}
        >
          <LogOut className="w-5 h-5 shrink-0" />
          {!collapsed && <span>Sign Out</span>}
        </Link>
      </div>
    </aside>
  );
}
