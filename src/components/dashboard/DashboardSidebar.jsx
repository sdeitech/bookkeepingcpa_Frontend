import { Link, useLocation } from "react-router-dom";
import { Home, FileText, CreditCard, HelpCircle, LogOut, Shield, BookOpen } from "lucide-react";
import { PlutifyLogo } from "../../components/PlutifyLogo";
import { cn } from "../../lib/utils";

const navItems = [
  { icon: Home, label: "Home", href: "/new-dashboard" },
  { icon: FileText, label: "Documents", href: "/dashboard/documents" },
  { icon: CreditCard, label: "Billing", href: "/dashboard/billing" },
  { icon: HelpCircle, label: "Support", href: "/dashboard/support" },
  { icon: BookOpen, label: "QuickBooks Data", href: "/new-dashboard/quickbooks" },
];

export function DashboardSidebar() {
  const location = useLocation();

  return (
    <aside className="w-64 bg-[#1B2232] text-[#ced6e5] flex flex-col min-h-screen">
      {/* Logo */}
      <div className="p-6 border-b border-[#1C232F]">
        <PlutifyLogo variant="light" />
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1">
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

      {/* Sign Out */}
      <div className="p-4 border-t border-sidebar-border">
        <Link
          to="/"
          className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-[#E2E4E8]/70 hover:bg-[#1A2231] hover:text-[#F0F1F3] transition-colors no-underline"
        >
          <LogOut className="w-5 h-5" />
          Sign Out
        </Link>
      </div>
    </aside>
  );
}
