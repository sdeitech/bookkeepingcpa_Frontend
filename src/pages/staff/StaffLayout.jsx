import { Outlet, useLocation } from "react-router-dom";
import { StaffSidebar } from "@/components/Staff/StaffSidebar";
import { StaffHeader } from "@/components/Staff/StaffHeader";
import StaffDashboard from "./StaffDashboard";
import { useSelector } from "react-redux";
import { logout, selectCurrentUser } from "@/features/auth/authSlice";

const routeTitles = {
  "/staff": "Dashboard",
  "/staff/clients": "My Clients",
  "/staff/tasks": "My Tasks",
  "/staff/reports": "Reports",
  "/staff/create-task": "Create Client Task",
  "/staff/profile": "Profile",
};

function StaffDashboardLazy() {
  return <StaffDashboard />;
}

export default function StaffLayout() {
  const location = useLocation();
  const title = routeTitles[location.pathname] || "Dashboard";
  const isRoot = location.pathname === "/staff";
  const user = useSelector(selectCurrentUser);
  

  return (
    <div className="flex min-h-screen bg-background">
      <StaffSidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <StaffHeader title={title} user={user} logout={logout} />
        <main className="flex-1 p-6 overflow-auto">{isRoot ? <StaffDashboardLazy /> : <Outlet />}</main>
      </div>
    </div>
  );
}
