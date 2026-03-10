import { Outlet, useLocation } from "react-router-dom";
import { StaffSidebar } from "@/components/Staff/StaffSidebar";
import StaffDashboard from "./StaffDashboard";
import { useGetMyClientsQuery } from "@/features/auth/authApi";
import { useEffect } from "react";
import { DashboardFooter } from "@/components/common/DashboardFooter";
import { DashboardHeader } from "@/components/common/DashboardHeader";
import { toast } from "sonner";

const routeTitles = {
  "/staff": "Dashboard",
  "/staff/clients": "My Clients",
  "/staff/tasks": "My Tasks",
  "/staff/reports": "Reports",
  "/staff/create-task": "Create Client Task",
  "/staff/profile": "Profile",
};


export default function StaffLayout() {
  const location = useLocation();
  const title = routeTitles[location.pathname] || "Dashboard";
  const isRoot = location.pathname === "/staff";
  const { data, error } = useGetMyClientsQuery();
  const myClients = data?.data || [];

  useEffect(() => {
    if (error) {
      toast.error(error?.data?.message || "Failed to load assigned clients");
    }
  }, [error]);


  return (
    <div className="min-h-screen bg-background">
      <StaffSidebar />
      <div className="pl-64 min-h-screen flex flex-col">
        <DashboardHeader
          title={title}
          profilePath="/staff/profile"
          showSettings={false}
          logoutDescription="You will be logged out of the staff portal."
        />
        <main className="flex-1 p-6 overflow-auto min-w-0">
          {isRoot ? <StaffDashboard myClients={myClients} /> : <Outlet context={{myClients}} />}
        </main>
        <DashboardFooter />
      </div>
    </div>
  );
}
