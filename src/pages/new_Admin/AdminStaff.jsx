import { STAFF_MEMBERS, MOCK_CLIENTS } from "@/lib/task-types";
import { useTasks } from "@/hooks/useTasks";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Plus, Search, MoreHorizontal, Eye, Pencil, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useGetAllStaffQuery } from "@/features/auth/authApi";


export default function AdminStaff() {
  const { data: staffData, isLoading, refetch } = useGetAllStaffQuery();
  const Staff = staffData?.data || [];
  const { tasks } = useTasks();
  const [search, setSearch] = useState("");

  const filtered = Staff.filter(s =>
    !search || s.first_name.toLowerCase().includes(search.toLowerCase()) || s.last_name.toLowerCase().includes(search.toLowerCase())  || s.email.toLowerCase().includes(search.toLowerCase())
  );
  
 

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Staff Members</h1>
          <p className="text-sm text-muted-foreground">{Staff.length} staff members</p>
        </div>
        <Button className="gap-2" onClick={() => toast.info("Add staff coming soon")}>
          <Plus className="h-4 w-4" /> Add New Staff
        </Button>
      </div>

      <div className="relative max-w-xs">
        {/* <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" /> */}
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
            {filtered.map(staff => {
              return (
                <TableRow key={staff.id}>
                  <TableCell className="font-medium text-foreground">{staff.first_name} {staff.last_name}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{staff.email}</TableCell>
                  <TableCell>{staff.clientCount}</TableCell>
                  <TableCell>
                    {
                      staff.active ? (
                        <Badge variant="outline" className="bg-success/15 text-success border-success/30 text-xs">Active</Badge>
                      ) : (
                        <Badge variant="outline" className="bg-destructive/15 text-destructive border-destructive/30 text-xs">Inactive</Badge>
                      )
                    }
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="bg-popover">
                        <DropdownMenuItem><Eye className="mr-2 h-3.5 w-3.5" /> View</DropdownMenuItem>
                        <DropdownMenuItem><Pencil className="mr-2 h-3.5 w-3.5" /> Edit</DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive"><Trash2 className="mr-2 h-3.5 w-3.5" /> Delete</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
