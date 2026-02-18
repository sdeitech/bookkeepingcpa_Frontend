import { Outlet, useLocation } from "react-router-dom";
import { AdminSidebar } from "@/components/new_Admin/AdminSidebar";
import { NotificationPanel } from "@/components/Notifications/Notification";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Search, User, Settings, LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";

const pageTitles = {
  "/admin": "Dashboard",
  "/admin/clients": "Clients",
  "/admin/staff": "Staff Members",
  "/admin/tasks": "Task Management",
  "/admin/documents": "Documents",
  "/admin/messages": "Messages",
  "/admin/settings": "Settings",
};

export default function AdminLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const baseRoute = "/" + location.pathname.split("/").slice(1, 3).join("/");
  const title = pageTitles[baseRoute] || "Admin Panel";

  return (
    <div className="flex min-h-screen bg-background">
      <AdminSidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 bg-card border-b border-border px-6 flex items-center justify-between gap-4 shrink-0">
          <h1 className="text-lg font-semibold text-foreground whitespace-nowrap">{title}</h1>
          {/* <div className="flex-1 max-w-md mx-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search clients, tasks, documents..." className="pl-9 bg-muted/50 border-transparent focus:border-border" />
            </div>
          </div> */}
          <div className="flex items-center gap-2 shrink-0">
            <NotificationPanel />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-2 rounded-full border border-border bg-background px-2 py-1 pr-3 hover:bg-accent/50 transition-colors whitespace-nowrap">
                  <Avatar className="h-7 w-7">
                    <AvatarFallback className="bg-primary text-primary-foreground text-xs">AD</AvatarFallback>
                  </Avatar>
                  <span className="text-sm font-medium text-foreground hidden md:block">Admin</span>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="bg-popover w-48">
                <DropdownMenuItem><User className="mr-2 h-4 w-4" /> Profile</DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate("/admin/settings")}><Settings className="mr-2 h-4 w-4" /> Settings</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => navigate("/")}><LogOut className="mr-2 h-4 w-4" /> Logout</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>
        <main className="flex-1 p-6 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
