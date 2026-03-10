import { Link, useLocation, useNavigate } from "react-router-dom";
import { Home, FileText, CreditCard, HelpCircle, LogOut, BookOpen, CheckSquare } from "lucide-react";
import { cn } from "../../lib/utils";
import { useDispatch } from "react-redux";
import { logout } from "@/features/auth/authSlice";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { useState } from "react";
import { toast } from "sonner";
import { PlutifyLogo } from "@/components/PlutifyLogo";

const navItems = [
  { icon: Home, label: "Home", href: "/new-dashboard" },
  { icon: CheckSquare, label: "My Tasks", href: "/new-dashboard/tasks" },
  { icon: FileText, label: "Documents", href: "/new-dashboard/documents" },
  { icon: CreditCard, label: "Billing", href: "/new-dashboard/billing" },
  { icon: HelpCircle, label: "Support", href: "/new-dashboard/support" },
  { icon: BookOpen, label: "QuickBooks Data", href: "/new-dashboard/quickbooks" },
];

export function DashboardSidebar() {
  const location = useLocation();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [logoutConfirmOpen, setLogoutConfirmOpen] = useState(false);

  return (
    <aside className="w-64 bg-sidebar text-sidebar-foreground flex flex-col border-r border-sidebar-border fixed top-0 left-0 h-screen z-50 overflow-y-auto">
      <div className="p-4 border-b border-sidebar-border">
        <PlutifyLogo variant="light" />
        <span className="text-xs text-sidebar-foreground/70 uppercase tracking-wide font-semibold mt-2 block">Client Panel</span>
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
      <button
          type="button"
          onClick={() => {
            setLogoutConfirmOpen(true);
          }}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium bg-sidebar-accent text-sidebar-accent-foreground transition-colors"
        >
          <LogOut className="w-5 h-5" />
          Sign Out
        </button>
      </div>

      <ConfirmDialog
        open={logoutConfirmOpen}
        onOpenChange={setLogoutConfirmOpen}
        title="Sign out?"
        description="You will be logged out of your dashboard."
        confirmLabel="Sign Out"
        variant="destructive"
        onConfirm={() => {
          dispatch(logout());
          toast.success("Signed out successfully");
          navigate("/");
          setLogoutConfirmOpen(false);
        }}
      />
    </aside>
  );
}
