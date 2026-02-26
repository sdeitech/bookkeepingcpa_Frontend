import { Link, useLocation } from "react-router-dom";
import { Home, FileText, CreditCard, HelpCircle, LogOut, Shield, BookOpen, CheckSquare } from "lucide-react";
import { PlutifyLogo } from "../../components/PlutifyLogo";
import { cn } from "../../lib/utils";

const navItems = [
  { icon: Home, label: "Home", href: "/new-dashboard" },
  { icon: CheckSquare, label: "My Tasks", href: "/new-dashboard/tasks" },
  { icon: FileText, label: "Documents", href: "/dashboard/documents" },
  { icon: CreditCard, label: "Billing", href: "/dashboard/billing" },
  { icon: HelpCircle, label: "Support", href: "/dashboard/support" },
  { icon: BookOpen, label: "QuickBooks Data", href: "/new-dashboard/quickbooks" },
];

export function DashboardSidebar() {
  const location = useLocation();

  return (
    <aside className="w-64 bg-sidebar text-sidebar-foreground flex flex-col min-h-screen">
      {/* Logo */}
      <div className="p-6 border-b border-sidebar-border">
        <PlutifyLogo variant="light" />
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-1">
        {navItems.map((item) => {
          const isActive = location.pathname === item.href ||
            (item.href === "/new-dashboard" && location.pathname.startsWith("/new-dashboard") && location.pathname.split("/").length === 2);

          return (
            <Link
              key={item.href}
              to={item.href}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors no-underline",
                isActive
                  ? "bg-sidebar-primary text-sidebar-primary-foreground"
                  : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              )}
            >
              <item.icon className="w-5 h-5" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Sign Out */}
      <div className="p-4 border-t border-sidebar-border">
        <Link
          to="/"
          className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors no-underline"
        >
          <LogOut className="w-5 h-5" />
          Sign Out
        </Link>
      </div>
    </aside>
  );
}
