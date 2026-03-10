import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  CheckSquare,
  BarChart3,
  LogOut,
  ClipboardList
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useDispatch } from "react-redux";
import { logout } from "@/features/auth/authSlice";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { useState } from "react";
import { toast } from "sonner";
import { PlutifyLogo } from "@/components/PlutifyLogo";

const navItems = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/staff" },
  { icon: Users, label: "My Clients", href: "/staff/clients" },
  { icon: CheckSquare, label: "My Tasks", href: "/staff/tasks" },
  { icon: BarChart3, label: "Reports", href: "/staff/reports" },
  { icon: ClipboardList, label: "Client Task", href: "/staff/create-task" },
];

export function StaffSidebar() {
  const location = useLocation();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [logoutConfirmOpen, setLogoutConfirmOpen] = useState(false);

  return (
    <aside className="flex flex-col w-64 bg-sidebar text-sidebar-foreground border-r border-sidebar-border fixed top-0 left-0 h-screen z-50 overflow-y-auto">
      <div className="p-4 border-b border-sidebar-border">
        <PlutifyLogo variant="light" />
        <span className="text-xs text-sidebar-foreground/70 uppercase tracking-wide font-semibold mt-2 block">Staff Panel</span>
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
        description="You will be logged out of the staff portal."
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
