import { Outlet, useLocation } from "react-router-dom";
import { StaffSidebar } from "@/components/Staff/StaffSidebar";
import { StaffHeader } from "@/components/Staff/StaffHeader";
import StaffDashboard from "./StaffDashboard";

const routeTitles = {
  "/staff": "Dashboard",
  "/staff/clients": "My Clients",
  "/staff/tasks": "My Tasks",
  "/staff/reports": "Reports",
  "/staff/create-task": "Create Client Task",
};

function StaffDashboardLazy() {
  return <StaffDashboard />;
}

export default function StaffLayout() {
  const location = useLocation();
  const title = routeTitles[location.pathname] || "Dashboard";
  const isRoot = location.pathname === "/staff";

  return (
    <div className="flex min-h-screen bg-background">
      <StaffSidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <StaffHeader title={title} />
        <main className="flex-1 p-6 overflow-auto">{isRoot ? <StaffDashboardLazy /> : <Outlet />}</main>
      </div>
    </div>
  );
}
