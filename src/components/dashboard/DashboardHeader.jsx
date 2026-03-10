import { Bell, User } from "lucide-react";
import { Button } from "../ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import NotificationBell from "../notifications/NotificationBell";
import { ConfirmDialog } from "../ui/confirm-dialog";
import { useState } from "react";
import { toast } from "sonner";



export function DashboardHeader({ user, logout }) {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [logoutConfirmOpen, setLogoutConfirmOpen] = useState(false);

  const handleLogout = () => {
    dispatch(logout());
    toast.success("Signed out successfully");
    navigate("/");
    setLogoutConfirmOpen(false);
  };

  return (
    <header className="h-16 bg-card border-b border-border px-6 flex items-center justify-between">
      <div className="flex items-center gap-4">
        <h1 className="text-lg font-semibold text-foreground">Dashboard</h1>
      </div>

      <div className="flex items-center gap-3">
        <NotificationBell />

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                <User className="h-4 w-4 text-primary-foreground" />
              </div>
              <span className="hidden sm:inline font-medium">{user?.first_name} {user?.last_name}</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48 bg-popover">
            <DropdownMenuItem onClick={() => navigate("/new-dashboard/profile")}>Profile</DropdownMenuItem>
            {/* <DropdownMenuItem>Account</DropdownMenuItem> */}
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => setLogoutConfirmOpen(true)}>
              Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <ConfirmDialog
        open={logoutConfirmOpen}
        onOpenChange={setLogoutConfirmOpen}
        title="Sign out?"
        description="You will be logged out of your dashboard."
        confirmLabel="Sign Out"
        variant="destructive"
        onConfirm={handleLogout}
      />
    </header>
  );
}
