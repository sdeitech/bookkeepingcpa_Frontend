import { useTasks } from "@/hooks/useTasks";
import { MOCK_CLIENTS, STAFF_MEMBERS } from "@/lib/task-types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, UserCheck, CheckSquare, AlertTriangle, Plus, ClipboardList, BarChart3, FileText, Clock, UserPlus, CheckCircle, Upload } from "lucide-react";
import { isBefore, startOfDay, format } from "date-fns";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useSelector } from "react-redux";
import { selectCurrentUser } from "@/features/auth/authSlice";
import { CreateTaskWizard } from "@/components/new_Admin/CreateTaskWizard";
import { useState } from "react";

const RECENT_ACTIVITY = [
  { icon: UserPlus, text: "New client 'Acme Corp' registered", time: "2 hours ago", color: "text-primary" },
  { icon: CheckCircle, text: "Task 'Setup Payroll Integration' completed", time: "4 hours ago", color: "text-success" },
  { icon: Upload, text: "Document 'Q4 Report' uploaded by Bloom Studio", time: "5 hours ago", color: "text-primary" },
  { icon: ClipboardList, text: "New task assigned to Sarah Mitchell", time: "Yesterday", color: "text-warning" },
  { icon: AlertTriangle, text: "Overdue: 'QuickBooks Migration' for Bloom Studio", time: "Yesterday", color: "text-destructive" },
  { icon: UserCheck, text: "Staff member Emily Chen completed review", time: "2 days ago", color: "text-success" },
];

export default function AdminDashboardHome() {
  const { tasks } = useTasks();
  const navigate = useNavigate();
  const today = startOfDay(new Date());
  const user = useSelector(selectCurrentUser);
  const [createOpen, setCreateOpen] = useState(false);

  const overdueTasks = tasks.filter(t => t.status !== "completed" && isBefore(new Date(t.dueDate), today));
  const pendingTasks = tasks.filter(t => t.status !== "completed");

  const stats = [
    { label: "Total Clients", value: MOCK_CLIENTS.length, icon: Users, color: "bg-primary/10 text-primary" },
    { label: "Active Staff", value: STAFF_MEMBERS.length, icon: UserCheck, color: "bg-success/10 text-success" },
    { label: "Pending Tasks", value: pendingTasks.length, icon: CheckSquare, color: "bg-warning/10 text-warning" },
    { label: "Overdue Tasks", value: overdueTasks.length, icon: AlertTriangle, color: overdueTasks.length > 0 ? "bg-destructive/10 text-destructive" : "bg-muted text-muted-foreground" },
  ];

  const createTask = (taskData) => {
    // Here you would typically call an API to create the task and then refresh your task list
    console.log("Creating task with data:", taskData);
    setCreateOpen(false);
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Welcome */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Welcome back,{user?.first_name} {user?.last_name}</h1>
        <p className="text-sm text-muted-foreground">{format(new Date(), "EEEE, MMMM d, yyyy · h:mm a")}</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <Card key={stat.label} className="hover:shadow-md transition-shadow">
            <CardContent className="p-5 flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
                <p className={cn("text-3xl font-bold mt-1", stat.color.includes("destructive") && stat.value > 0 ? "text-destructive" : "text-foreground")}>{stat.value}</p>
              </div>
              <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center", stat.color)}>
                <stat.icon className="w-6 h-6" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activity */}
        <Card className="lg:col-span-2">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Clock className="w-4 h-4 text-muted-foreground" /> Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {RECENT_ACTIVITY.map((activity, i) => (
              <div key={i} className="flex items-start gap-3 py-2 border-b border-border last:border-0">
                <activity.icon className={cn("w-4 h-4 mt-0.5 shrink-0", activity.color)} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-foreground">{activity.text}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{activity.time}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 gap-3">
            <Button onClick={() => setCreateOpen(true)} className="justify-start gap-2 h-11 bg-primary hover:bg-primary/90">
              <Plus className="w-4 h-4" /> Create Task
            </Button>
            <Button variant="outline" onClick={() => navigate("/admin/staff")} className="justify-start gap-2 h-11">
              <UserPlus className="w-4 h-4" /> Add Staff
            </Button>
            <Button variant="outline" onClick={() => navigate("/admin/assign-clients")} className="justify-start gap-2 h-11">
              <UserCheck className="w-4 h-4" /> Assign Staff
            </Button>
            <Button variant="outline" onClick={() => navigate("/admin/settings")} className="justify-start gap-2 h-11">
              <BarChart3 className="w-4 h-4" /> View Reports
            </Button>
          </CardContent>
        </Card>
      </div>

      <CreateTaskWizard open={createOpen} onOpenChange={setCreateOpen} onCreate={createTask} />
    </div>
  );
}
