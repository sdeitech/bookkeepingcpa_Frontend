import { Outlet, useLocation } from "react-router-dom";
import { AdminSidebar } from "@/components/new_Admin/AdminSidebar";
import { DashboardFooter } from "@/components/common/DashboardFooter";
import { DashboardHeader } from "@/components/common/DashboardHeader";

const pageTitles = {
  "/admin": "Dashboard",
  "/admin/clients": "Clients",
  "/admin/staff": "Staff Members",
  "/admin/tasks": "Task Management",
  "/admin/documents": "Documents",
  "/admin/messages": "Messages",
  "/admin/settings": "Settings",
  "/admin/assign-clients": "Assign Clients",
};

export default function AdminLayout() {
  const location = useLocation();
  const baseRoute = "/" + location.pathname.split("/").slice(1, 3).join("/");
  const title = pageTitles[baseRoute] || "Admin Panel";

  return (
    <div className="min-h-screen bg-background">
      <AdminSidebar />
      <div className="pl-64 min-h-screen flex flex-col">
        <DashboardHeader
          title={title}
          profilePath="/admin/profile"
          settingsPath="/admin/settings"
          showSettings
          logoutDescription="You will be logged out of the admin panel."
        />
        <main className="flex-1 p-6 overflow-auto min-w-0">
          <Outlet />
        </main>
        <DashboardFooter />
      </div>
    </div>
  );
}
