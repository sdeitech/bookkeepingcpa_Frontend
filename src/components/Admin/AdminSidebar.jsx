import { Link, useLocation } from "react-router-dom";
import { ClipboardList, Users, ArrowLeft } from "lucide-react";
import { PlutifyLogo } from "@/components/PlutifyLogo";
import { cn } from "../../lib/utils";

const navItems = [
  { icon: ClipboardList, label: "Tasks", href: "/admin/tasks" },
  { icon: Users, label: "Clients", href: "/admin/clients" },
];

export function AdminSidebar() {
  const location = useLocation();

  return (
    <aside className="w-64 bg-[#1B2232] text-[#ced6e5] flex flex-col min-h-screen">
      <div className="p-6 border-b border-[#1C232F]">
        <PlutifyLogo variant="light" />
        <span className="text-xs text-sidebar-foreground/50 mt-1 block">Admin Panel</span>
      </div>

      <nav className="flex-1 p-4 space-y-1">
        {navItems.map((item) => {
          const isActive = location.pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              to={item.href}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors no-underline",
                isActive
                ? "bg-[#0c3d8c] text-white"
                : "text-white hover:bg-[#263247] hover:text-[#F0F1F3]"
            )}
            >
              <item.icon className="w-5 h-5" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-sidebar-border">
        <Link
          to="/dashboard"
          className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-[#E2E4E8]/70 hover:bg-[#1A2231] hover:text-[#F0F1F3] transition-colors no-underline"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Dashboard
        </Link>
      </div>
    </aside>
  );
}
