import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import NotificationBell from "@/components/notifications/NotificationBell";
import { LogOut, Settings, User } from "lucide-react";
import { logout, selectCurrentUser } from "@/features/auth/authSlice";
import config from "@/config";
import { toast } from "sonner";

const resolveHeaderProfileImage = (user) => {
  const candidate = user?.profilePictureSignedUrl || user?.profileSignedUrl || user?.profile || "";
  if (!candidate) return undefined;
  if (candidate.startsWith("http://") || candidate.startsWith("https://") || candidate.startsWith("blob:")) {
    return candidate;
  }
  return `${config.api.baseUrl}${candidate}`;
};

export function DashboardHeader({
  profilePath,
  settingsPath = "",
  showSettings = true,
  logoutDescription = "You will be logged out.",
}) {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const user = useSelector(selectCurrentUser);
  const [logoutConfirmOpen, setLogoutConfirmOpen] = useState(false);

  const handleLogout = () => {
    dispatch(logout());
    toast.success("Signed out successfully");
    navigate("/");
    setLogoutConfirmOpen(false);
  };

  return (
    <>
      <header className="h-14 bg-muted border-b border-border px-3 md:px-4 flex items-center shrink-0 sticky top-0 z-40">
        <div className="ml-auto flex items-center gap-2 shrink-0">
          <NotificationBell />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-9 flex items-center gap-2 rounded-full px-2">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={resolveHeaderProfileImage(user)} />
                  <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                    {user?.first_name?.[0]}{user?.last_name?.[0]}
                  </AvatarFallback>
                </Avatar>
                <span className="text-sm font-medium text-foreground hidden md:block">
                  {user?.first_name} {user?.last_name}
                </span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-popover w-48">
              {profilePath ? (
                <DropdownMenuItem onClick={() => navigate(profilePath)}>
                  <User className="mr-2 h-4 w-4" /> Profile
                </DropdownMenuItem>
              ) : null}
              {showSettings && settingsPath ? (
                <DropdownMenuItem onClick={() => navigate(settingsPath)}>
                  <Settings className="mr-2 h-4 w-4" /> Settings
                </DropdownMenuItem>
              ) : null}
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => setLogoutConfirmOpen(true)}>
                <LogOut className="mr-2 h-4 w-4" /> Sign out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      <ConfirmDialog
        open={logoutConfirmOpen}
        onOpenChange={setLogoutConfirmOpen}
        title="Sign out?"
        description={logoutDescription}
        confirmLabel="Sign Out"
        variant="destructive"
        onConfirm={handleLogout}
      />
    </>
  );
}
