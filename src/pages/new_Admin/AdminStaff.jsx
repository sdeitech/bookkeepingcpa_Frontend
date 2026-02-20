import { useGetAllStaffQuery, useGetAllClientsQuery } from "@/features/user/userApi";
import { useTasks } from "@/hooks/useTasks";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Plus, Search, MoreHorizontal, Eye, Pencil, Trash2, Loader2, UserX } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export default function AdminStaff() {
  const { data: staffData, isLoading, refetch, error } = useGetAllStaffQuery();
  const Staff = staffData?.data || [];
  const { tasks } = useTasks();
  const [search, setSearch] = useState("");

  const staffMembers = staffData?.data || [];

  const filtered = staffMembers.filter(s => {
    if (!search) return true;
    const fullName = `${s.first_name} ${s.last_name}`.toLowerCase();
    const searchLower = search.toLowerCase();
    return fullName.includes(searchLower) || s.email.toLowerCase().includes(searchLower);
  });

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Loading staff members...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-lg font-semibold text-destructive">Error Loading Staff</p>
          <p className="text-sm text-muted-foreground mt-2">
            {error?.data?.message || error?.message || 'Failed to fetch staff members'}
          </p>
        </div>
      </div>
    );
  }

  // Empty state
  if (staffMembers.length === 0) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Staff Members</h1>
            <p className="text-sm text-muted-foreground">0 staff members</p>
          </div>
          <Button className="gap-2" onClick={() => toast.info("Add staff coming soon")}>
            <Plus className="h-4 w-4" /> Add New Staff
          </Button>
        </div>
        <div className="flex flex-col items-center justify-center h-64 bg-card border border-border rounded-xl">
          <UserX className="h-12 w-12 text-muted-foreground mb-3" />
          <p className="text-lg font-semibold text-foreground">No Staff Members Yet</p>
          <p className="text-sm text-muted-foreground mt-2">
            Add your first staff member to get started
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Staff Members</h1>
          <p className="text-sm text-muted-foreground">{staffMembers.length} staff members</p>
        </div>
        <Button className="gap-2" onClick={() => toast.info("Add staff coming soon")}>
          <Plus className="h-4 w-4" /> Add New Staff
        </Button>
      </div>

      <div className="relative max-w-xs">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Search staff..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
      </div>

      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Assigned Clients</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-12" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-12 text-muted-foreground">
                  No staff members found.
                </TableCell>
              </TableRow>
            ) : (
              filtered.map(staff => {
                const fullName = `${staff.first_name || ''} ${staff.last_name || ''}`.trim() || 'Unnamed Staff';
                // Count unique clients assigned to this staff member
                const assignedCount = new Set(
                  tasks.filter(t => t.staffId === staff._id).map(t => t.clientId)
                ).size;
                
                return (
                  <TableRow key={staff._id}>
                    <TableCell className="font-medium text-foreground">{fullName}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{staff.email}</TableCell>
                    <TableCell>{assignedCount}</TableCell>
                    <TableCell>
                      {staff.active ? (
                        <Badge variant="outline" className="bg-success/15 text-success border-success/30 text-xs">
                          Active
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="bg-muted text-muted-foreground border-muted text-xs">
                          Inactive
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="bg-popover">
                          <DropdownMenuItem onClick={() => toast.info("View staff details coming soon")}>
                            <Eye className="mr-2 h-3.5 w-3.5" /> View
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => toast.info("Edit staff coming soon")}>
                            <Pencil className="mr-2 h-3.5 w-3.5" /> Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            className="text-destructive" 
                            onClick={() => toast.info("Delete staff coming soon")}
                          >
                            <Trash2 className="mr-2 h-3.5 w-3.5" /> Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
