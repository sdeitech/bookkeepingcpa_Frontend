import { DashboardSidebar } from "../../components/dashboard/DashboardSidebar";
import { DashboardHeader } from "../../components/dashboard/DashboardHeader";
import { AdminProfileCard } from "../../components/Admin/AdminProfileCard";
import { SystemOverviewCard } from "../../components/Admin/SystemOverviewCard";
import { AdminActionsCard } from "../../components/Admin/AdminActionsCard";
import { RecentActivityCard } from "../../components/Admin/RecentActivityCard";


// Mock data - in real app, this would come from an API
const mockActivities = [
  {
    id: "1",
    type: "user_registered",
    message: "New client registered",
    timestamp: "2 hours ago",
  },
  {
    id: "2",
    type: "staff_added",
    message: "Staff member added",
    timestamp: "5 hours ago",
  },
  {
    id: "3",
    type: "backup",
    message: "System backup completed",
    timestamp: "1 day ago",
  },
  {
    id: "4",
    type: "settings",
    message: "System settings updated",
    timestamp: "2 days ago",
  },
  {
    id: "5",
    type: "report",
    message: "Monthly report generated",
    timestamp: "3 days ago",
  },
];

export default function AdminDashboard() {
  const user = {
    name: "Test User",
    email: "test@mail.com"
  }


  return (
    <div className="flex min-h-screen bg-background">
      {/* <DashboardSidebar /> */}
      <div className="flex-1 flex flex-col">
        {/* <DashboardHeader /> */}
        <main className="flex-1 p-1">
          <div className="space-y-6 animate-fade-in">
            {/* Page Header */}
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-bold text-foreground">Admin Dashboard</h1>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Welcome, {user?.name || "Admin"}!</span>
                <span className="px-3 py-1 bg-primary text-primary-foreground text-sm font-medium rounded-full">
                  Super Admin
                </span>
              </div>
            </div>

            {/* Admin Profile */}
            <AdminProfileCard
              name={user?.name || "Test User"}
              email={user?.email || "admin@example.com"}
              role="Super Admin"
              status="active"
            />

            {/* System Overview */}
            <SystemOverviewCard
              totalStaff={0}
              activeStaff={0}
              totalClients={2}
              activeUsers={3}
            />

            {/* Administration Actions */}
            <AdminActionsCard />

            {/* Recent Activity */}
            <RecentActivityCard activities={mockActivities} />
          </div>
        </main>
      </div>
    </div>
  );
}
