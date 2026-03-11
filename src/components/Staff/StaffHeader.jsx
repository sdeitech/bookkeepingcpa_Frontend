import { User, Settings, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useNavigate } from "react-router-dom";
import NotificationBell from "../notifications/NotificationBell";
import { useDispatch } from "react-redux";
import config from "@/config";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { useState } from "react";
import { toast } from "sonner";

const resolveHeaderProfileImage = (user) => {
  const candidate = user?.profilePictureSignedUrl || user?.profileSignedUrl || user?.profile || "";
  if (!candidate) return undefined;
  if (candidate.startsWith("http://") || candidate.startsWith("https://") || candidate.startsWith("blob:")) {
    return candidate;
  }
  return `${config.api.baseUrl}${candidate}`;
};

export function StaffHeader({ title, user, logout }) {
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
    <header className="h-16 bg-card border-b border-border px-6 flex items-center justify-between shadow-sm">
      <h1 className="text-lg font-semibold text-foreground">{title}</h1>

      <div className="flex items-center gap-4">

        <NotificationBell />

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="flex items-center gap-2">
              <Avatar className="h-8 w-8">
                <AvatarImage src={resolveHeaderProfileImage(user)} />
                <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                  {user?.first_name?.[0]}{user?.last_name?.[0]}
                </AvatarFallback>
              </Avatar>
              <span className="hidden sm:inline font-medium">{user?.first_name} {user?.last_name}</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem onClick={() => navigate("/staff/profile")}>
              <User className="mr-2 h-4 w-4" /> Profile
            </DropdownMenuItem>
            {/* <DropdownMenuItem>
              <Settings className="mr-2 h-4 w-4" /> Settings
            </DropdownMenuItem> */}
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => setLogoutConfirmOpen(true)}>
              <LogOut className="mr-2 h-4 w-4" /> Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <ConfirmDialog
        open={logoutConfirmOpen}
        onOpenChange={setLogoutConfirmOpen}
        title="Sign out?"
        description="You will be logged out of the staff portal."
        confirmLabel="Sign Out"
        variant="destructive"
        onConfirm={handleLogout}
      />
    </header>
  );
}
