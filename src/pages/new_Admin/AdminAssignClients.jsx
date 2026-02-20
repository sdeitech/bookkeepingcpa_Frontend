import { useEffect, useMemo, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { PaginationControls } from "@/components/ui/pagination-controls";
import {
  Users,
  UserCheck,
  UserX,
  Briefcase,
  Search,
  ArrowUpDown,
} from "lucide-react";
import { toast } from "sonner";
import {
  useAssignClientMutation,
  useGetAllStaffQuery,
  useGetClientsWithAssignmentsQuery,
  useUnassignClientMutation,
} from "@/features/auth/authApi";

const PAGE_SIZE = 6;

const getFullName = (firstName, lastName, fallback = "") => {
  const full = `${firstName || ""} ${lastName || ""}`.trim();
  return full || fallback;
};

export default function AdminAssignClients() {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [staffFilter, setStaffFilter] = useState("all");
  const [sortField, setSortField] = useState("name");
  const [sortAsc, setSortAsc] = useState(true);
  const [page, setPage] = useState(1);

  const [assignModal, setAssignModal] = useState(null);
  const [selectedStaff, setSelectedStaff] = useState("");
  const [assignNotes, setAssignNotes] = useState("");

  const [unassignClient, setUnassignClient] = useState(null);

  const {
    data: assignmentsData,
    isLoading: assignmentsLoading,
    isFetching: assignmentsFetching,
    refetch: refetchAssignments,
  } = useGetClientsWithAssignmentsQuery();

  const { data: staffData, isLoading: staffLoading } = useGetAllStaffQuery();

  const [assignClient, { isLoading: assignLoading }] = useAssignClientMutation();
  const [unassignClientMutation, { isLoading: unassignLoading }] = useUnassignClientMutation();

  const staffMembers = useMemo(() => {
    const list = Array.isArray(staffData?.data) ? staffData.data : [];
    return list
      .filter((member) => member.active)
      .map((member) => ({
        id: member._id,
        name: getFullName(member.first_name, member.last_name, member.email),
        email: member.email,
      }));
  }, [staffData]);

  const clients = useMemo(() => {
    const list = Array.isArray(assignmentsData?.data) ? assignmentsData.data : [];
    return list.map((client) => ({
      id: client._id,
      name: getFullName(client.first_name, client.last_name, client.email),
      email: client.email || "-",
      company: client.businessName || client.company || "-",
      assignedStaffId: client.assignedStaff?.staffId || null,
      assignedStaffName: client.assignedStaff?.staffName || null,
      status: client.active ? "active" : "inactive",
      raw: client,
    }));
  }, [assignmentsData]);

  const workload = useMemo(() => {
    return staffMembers.map((staff) => ({
      ...staff,
      count: clients.filter((client) => client.assignedStaffId === staff.id).length,
    }));
  }, [staffMembers, clients]);

  const maxWorkload = Math.max(...workload.map((w) => w.count), 1);

  const filtered = useMemo(() => {
    let result = [...clients];

    if (search) {
      const q = search.toLowerCase();
      result = result.filter((client) =>
        client.name.toLowerCase().includes(q) ||
        client.email.toLowerCase().includes(q) ||
        client.company.toLowerCase().includes(q)
      );
    }

    if (filter === "assigned") result = result.filter((client) => client.assignedStaffId);
    if (filter === "unassigned") result = result.filter((client) => !client.assignedStaffId);
    if (staffFilter !== "all") result = result.filter((client) => client.assignedStaffId === staffFilter);

    result.sort((a, b) => {
      const valA = String(a[sortField] || "").toLowerCase();
      const valB = String(b[sortField] || "").toLowerCase();
      return sortAsc ? valA.localeCompare(valB) : valB.localeCompare(valA);
    });

    return result;
  }, [clients, search, filter, staffFilter, sortField, sortAsc]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  useEffect(() => {
    if (page > totalPages && totalPages > 0) {
      setPage(totalPages);
    }
    if (totalPages === 0 && page !== 1) {
      setPage(1);
    }
  }, [page, totalPages]);

  const totalClients = clients.length;
  const assignedClients = clients.filter((client) => client.assignedStaffId).length;
  const unassignedClients = totalClients - assignedClients;

  const handleSort = (field) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(true);
    }
  };

  const handleAssign = async () => {
    if (!assignModal || !selectedStaff) return;

    try {
      const result = await assignClient({
        clientId: assignModal.id,
        staffId: selectedStaff,
        notes: assignNotes || undefined,
      }).unwrap();

      if (result?.success !== false) {
        toast.success(`${assignModal.name} assigned successfully`);
        setAssignModal(null);
        setSelectedStaff("");
        setAssignNotes("");
        await refetchAssignments();
      } else {
        toast.error(result?.message || "Failed to assign client");
      }
    } catch (error) {
      toast.error(error?.data?.message || "Failed to assign client");
    }
  };

  const handleUnassign = async () => {
    if (!unassignClient?.id || !unassignClient?.assignedStaffId) return;

    try {
      const result = await unassignClientMutation({
        clientId: unassignClient.id,
        staffId: unassignClient.assignedStaffId,
      }).unwrap();

      if (result?.success !== false) {
        toast.success(`${unassignClient.name} has been unassigned`);
        setUnassignClient(null);
        await refetchAssignments();
      } else {
        toast.error(result?.message || "Failed to unassign client");
      }
    } catch (error) {
      toast.error(error?.data?.message || "Failed to unassign client");
    }
  };

  const openAssignModal = (client) => {
    setAssignModal(client);
    setSelectedStaff(client.assignedStaffId || "");
    setAssignNotes("");
  };

  const stats = [
    { label: "Total Clients", value: totalClients, icon: Users, color: "text-primary" },
    { label: "Assigned", value: assignedClients, icon: UserCheck, color: "text-success" },
    { label: "Unassigned", value: unassignedClients, icon: UserX, color: "text-warning" },
    { label: "Total Staff", value: staffMembers.length, icon: Briefcase, color: "text-accent-foreground" },
  ];

  const loading = assignmentsLoading || assignmentsFetching || staffLoading;

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Assign Clients to Staff</h1>
        <p className="text-sm text-muted-foreground">Manage client assignments and control staff workload.</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <Card key={stat.label} className="bg-card border-border">
            <CardContent className="p-5 flex items-center gap-4">
              <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center shrink-0">
                <stat.icon className={`h-5 w-5 ${stat.color}`} />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                <p className="text-xs text-muted-foreground">{stat.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="flex flex-col xl:flex-row gap-6">
        <div className="flex-1 min-w-0 space-y-4">
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative flex-1 min-w-[200px] max-w-xs">
              {/* <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" /> */}
              <Input
                placeholder="Search name, email, company..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                className="pl-9"
              />
            </div>
            <Select
              value={filter}
              onValueChange={(value) => {
                setFilter(value);
                setPage(1);
              }}
            >
              <SelectTrigger className="w-[140px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-popover z-50">
                <SelectItem value="all">All Clients</SelectItem>
                <SelectItem value="assigned">Assigned</SelectItem>
                <SelectItem value="unassigned">Unassigned</SelectItem>
              </SelectContent>
            </Select>
            <Select
              value={staffFilter}
              onValueChange={(value) => {
                setStaffFilter(value);
                setPage(1);
              }}
            >
              <SelectTrigger className="w-[170px]">
                <SelectValue placeholder="Filter by Staff" />
              </SelectTrigger>
              <SelectContent className="bg-popover z-50">
                <SelectItem value="all">All Staff</SelectItem>
                {staffMembers.map((staff) => (
                  <SelectItem key={staff.id} value={staff.id}>
                    {staff.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="bg-card border border-border rounded-xl overflow-hidden">
            {loading ? (
              <div className="p-6 space-y-4">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            ) : filtered.length === 0 ? (
              <div className="p-12 text-center">
                <UserX className="h-10 w-10 mx-auto text-muted-foreground/50 mb-3" />
                <p className="text-sm font-medium text-muted-foreground">No clients found</p>
                <p className="text-xs text-muted-foreground/70 mt-1">Try adjusting your search or filters.</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead>
                      <button onClick={() => handleSort("name")} className="flex items-center gap-1 hover:text-foreground transition-colors">
                        Client <ArrowUpDown className="h-3 w-3" />
                      </button>
                    </TableHead>
                    <TableHead className="hidden md:table-cell">Email</TableHead>
                    <TableHead>
                      <button onClick={() => handleSort("company")} className="flex items-center gap-1 hover:text-foreground transition-colors">
                        Company <ArrowUpDown className="h-3 w-3" />
                      </button>
                    </TableHead>
                    <TableHead>Assigned Staff</TableHead>
                    <TableHead>
                      <button onClick={() => handleSort("status")} className="flex items-center gap-1 hover:text-foreground transition-colors">
                        Status <ArrowUpDown className="h-3 w-3" />
                      </button>
                    </TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginated.map((client) => (
                    <TableRow key={client._id} className="group">
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8">
                            <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
                              {client.name
                                .split(" ")
                                .filter(Boolean)
                                .slice(0, 2)
                                .map((n) => n[0])
                                .join("") || "U"}
                            </AvatarFallback>
                          </Avatar>
                          <span className="font-medium text-foreground">{client.name}</span>
                        </div>
                      </TableCell>
                      <TableCell className="hidden md:table-cell text-sm text-muted-foreground">{client.email}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">{client.company}</TableCell>
                      <TableCell>
                        {client.assignedStaffName ? (
                          <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20 text-xs">
                            {client.assignedStaffName}
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="bg-muted text-muted-foreground border-border text-xs">
                            Unassigned
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={
                            client.status === "active"
                              ? "bg-success/15 text-success border-success/30 text-xs"
                              : "bg-muted text-muted-foreground border-border text-xs"
                          }
                        >
                          {client.status === "active" ? "Active" : "Inactive"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          {!client.assignedStaffId ? (
                            <Button size="sm" onClick={() => openAssignModal(client)}>
                              Assign
                            </Button>
                          ) : (
                            <>
                              <Button size="sm" variant="outline" onClick={() => openAssignModal(client)}>
                                Reassign
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => setUnassignClient(client)}
                                disabled={unassignLoading}
                              >
                                Unassign
                              </Button>
                            </>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>

          <PaginationControls
            page={page}
            totalPages={totalPages}
            totalItems={filtered.length}
            pageSize={PAGE_SIZE}
            onPageChange={setPage}
          />
        </div>

        <div className="w-full xl:w-72 shrink-0 space-y-4">
          <Card className="bg-card border-border">
            <CardContent className="p-5 space-y-4">
              <h3 className="text-sm font-semibold text-foreground">Staff Workload</h3>
              {workload.map((staff) => (
                <button
                  key={staff.id}
                  onClick={() => {
                    setStaffFilter((prev) => (prev === staff.id ? "all" : staff.id));
                    setPage(1);
                  }}
                  className={`w-full text-left p-3 rounded-lg transition-colors ${
                    staffFilter === staff.id
                      ? "bg-primary/10 border border-primary/20"
                      : "hover:bg-muted/50"
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-foreground">{staff.name}</span>
                    <span className="text-xs text-muted-foreground">{staff.count} clients</span>
                  </div>
                  <Progress value={(staff.count / maxWorkload) * 100} className="h-2" />
                </button>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>

      <Dialog open={!!assignModal} onOpenChange={(open) => !open && setAssignModal(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{assignModal?.assignedStaffName ? "Reassign Client" : "Assign Client"}</DialogTitle>
            <DialogDescription>
              {assignModal?.assignedStaffName
                ? `Reassign ${assignModal.name} to a different staff member.`
                : `Select a staff member to assign ${assignModal?.name} to.`}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <Label className="text-xs text-muted-foreground">Client</Label>
              <p className="text-sm font-medium text-foreground mt-1">
                {assignModal?.name} - {assignModal?.company}
              </p>
            </div>
            <div className="space-y-1.5">
              <Label>Assign to Staff</Label>
              <Select value={selectedStaff} onValueChange={setSelectedStaff}>
                <SelectTrigger>
                  <SelectValue placeholder="Select staff member" />
                </SelectTrigger>
                <SelectContent className="bg-popover z-50">
                  {workload.map((staff) => (
                    <SelectItem key={staff.id} value={staff.id}>
                      {staff.name} ({staff.count} clients)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>
                Notes <span className="text-muted-foreground">(optional)</span>
              </Label>
              <Textarea
                placeholder="Add any notes about this assignment..."
                value={assignNotes}
                onChange={(e) => setAssignNotes(e.target.value)}
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAssignModal(null)}>
              Cancel
            </Button>
            <Button onClick={handleAssign} disabled={!selectedStaff || assignLoading}>
              {assignLoading ? "Assigning..." : "Confirm Assignment"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={!!unassignClient}
        onOpenChange={(open) => !open && setUnassignClient(null)}
        title="Unassign Client"
        description={
          <>
            Are you sure you want to unassign <strong>{unassignClient?.name}</strong> from <strong>{unassignClient?.assignedStaffName}</strong>? The client will be marked as unassigned.
          </>
        }
        confirmLabel="Confirm Unassign"
        variant="destructive"
        onConfirm={handleUnassign}
      />
    </div>
  );
}
