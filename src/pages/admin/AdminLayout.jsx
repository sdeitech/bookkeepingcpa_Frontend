import { Outlet } from "react-router-dom";
import { AdminSidebar } from "../../components/Admin/AdminSidebar";

export default function AdminLayout() {
  return (
    <div className="flex min-h-screen bg-background">
      <AdminSidebar />
      <div className="flex-1 flex flex-col">
        <header className="h-16 bg-card border-b border-border px-6 flex items-center">
          <h1 className="text-lg font-semibold text-foreground">Admin Panel</h1>
        </header>
        <main className="flex-1 p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
