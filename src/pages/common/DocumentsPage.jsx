import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { DocumentViewerModal } from "@/components/common/DocumentViewerModal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { PaginationControls } from "@/components/ui/pagination-controls";
import { FileClock, FileText, User, X, ChevronDown, Calendar as CalendarIcon } from "lucide-react";
import { useGetAllDocumentsQuery } from "@/features/tasks/tasksApi";
import { useGetAllClientsQuery } from "@/features/user/userApi";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { cn } from "@/lib/utils";


const DEFAULT_PAGE_SIZE = 12;

export default function DocumentsPage({ role = "admin" }) {
  const navigate = useNavigate();
  const isAdmin = role === "admin";
  const isStaff = role === "staff";

  const [page, setPage] = useState(1);
  const [viewingDocument, setViewingDocument] = useState(null);
  const [clientSearch, setClientSearch] = useState("");
  const [showClientDropdown, setShowClientDropdown] = useState(false);

  const [filters, setFilters] = useState({
    status: "all",
    search: "",
    fromDate: "",
    toDate: "",
    clientId: null,
    clientLabel: "",
  });
  const [appliedFilters, setAppliedFilters] = useState({
    status: "all",
    search: "",
    fromDate: "",
    toDate: "",
    clientId: null,
    clientLabel: "",
  });
  // Debounce search so it applies immediately without waiting on "Apply Filters"
  const [debouncedSearch, setDebouncedSearch] = useState("");
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(filters.search), 500);
    return () => clearTimeout(t);
  }, [filters.search]);
  const dateRange = useMemo(() => ({
    from: filters.fromDate ? new Date(filters.fromDate) : undefined,
    to: filters.toDate ? new Date(filters.toDate) : undefined,
  }), [filters.fromDate, filters.toDate]);

  // Reset page on filter change
  useEffect(() => {
    setPage(1);
  }, [
    appliedFilters.status,
    appliedFilters.fromDate,
    appliedFilters.toDate,
    debouncedSearch,
    appliedFilters.clientId,
  ]);

  // 🔥 Common API
  const { data, isLoading, refetch } = useGetAllDocumentsQuery({
    page,
    limit: DEFAULT_PAGE_SIZE,
    status: appliedFilters.status,
    search: debouncedSearch,
    fromDate: appliedFilters.fromDate,
    toDate: appliedFilters.toDate,
    clientId: isAdmin ? appliedFilters.clientId || undefined : undefined,
  });

  // Fetch clients only if admin
  const { data: clientsData } = useGetAllClientsQuery(undefined, {
    skip: !isAdmin,
  });

  const allClients = clientsData?.data || [];

  const clients = allClients.filter((client) => {
    const full = `${client.first_name} ${client.last_name}`.toLowerCase();
    return full.includes(clientSearch.toLowerCase());
  });

  const documents = data?.documents || [];
  const pagination = data?.pagination || {};

  const statusTone = {
    pending_review: "bg-yellow-500/10 text-yellow-600 border-yellow-500/30",
    approved: "bg-green-500/10 text-green-600 border-green-500/30",
    rejected: "bg-red-500/10 text-red-600 border-red-500/30",
  };

  const handleSelectClient = (client) => {
    setFilters((prev) => ({
      ...prev,
      clientId: client.id,
      clientLabel: `${client.first_name} ${client.last_name}`,
    }));
    setClientSearch("");
    setShowClientDropdown(false);
  };

  const handleClearClient = () => {
    setFilters((prev) => ({
      ...prev,
      clientId: null,
      clientLabel: "",
    }));
    setClientSearch("");
  };

  const handleView = (doc) => {
    setViewingDocument({
      _id: doc._id,
      fileName: doc.originalName || doc.fileName,
      mimeType: doc.mimeType,
      fileSize: doc.fileSize,
      uploadedAt: doc.createdAt,
      uploadedBy: doc.uploadedBy,
      documentType: doc.documentType,
    });
  };

  return (
    <div className="space-y-8">
      {/* HEADER */}
      <div className="rounded-3xl bg-gradient-to-r from-primary/10 to-muted/40 border p-8">
        <h2 className="text-3xl font-bold">
          {isAdmin ? "Documents Management" : "My Documents"}
        </h2>
        <p className="text-muted-foreground mt-2">
          {isAdmin
            ? "Filter and manage uploaded documents."
            : "View and manage your uploaded documents."}
        </p>
      </div>

      {/* FILTERS */}
      <div className="rounded-2xl border bg-card p-6 space-y-6">
        {/* Search */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">
            Search Document
          </label>
          <Input
            placeholder="Search by name..."
            value={filters.search}
            onChange={(e) =>
              setFilters((prev) => ({
                ...prev,
                search: e.target.value,
              }))
            }
          />
        </div>

        <div
          className={cn(
            "grid grid-cols-1 md:grid-cols-2 gap-6",
            isAdmin ? "lg:grid-cols-4" : "lg:grid-cols-3"
          )}
        >
          {/* Status */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">
              Status
            </label>
            <select
              className="w-full border rounded-md px-3 py-2 bg-background text-foreground"
              value={filters.status}
              onChange={(e) =>
                setFilters((prev) => ({
                  ...prev,
                  status: e.target.value,
                }))
              }
            >
              <option value="all">All Status</option>
              <option value="pending_review">Pending Review</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>

          {/* Client Filter - Admin Only */}
          {isAdmin && (
            <div className="space-y-2 relative">
              <label className="text-sm font-medium text-foreground">
                Client
              </label>

              <button
                className="w-full border rounded-md px-3 py-2 bg-background text-foreground text-sm flex items-center justify-between"
                onClick={() =>
                  setShowClientDropdown((prev) => !prev)
                }
              >
                <span
                  className={
                    filters.clientLabel
                      ? "text-foreground"
                      : "text-muted-foreground"
                  }
                >
                  {filters.clientLabel || "Select client..."}
                </span>
                <div className="flex items-center gap-1">
                  {filters.clientId && (
                    <X
                      className="h-3.5 w-3.5 text-muted-foreground hover:text-foreground"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleClearClient();
                      }}
                    />
                  )}
                  <ChevronDown className="h-4 w-4 text-muted-foreground" />
                </div>
              </button>

              {showClientDropdown && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() =>
                      setShowClientDropdown(false)
                    }
                  />
                  <div className="absolute z-50 w-full mt-1 bg-card border rounded-xl shadow-lg">
                    <div className="p-2 border-b">
                      <Input
                        autoFocus
                        placeholder="Search by name..."
                        value={clientSearch}
                        onChange={(e) =>
                          setClientSearch(e.target.value)
                        }
                        className="h-8 text-sm"
                      />
                    </div>
                    <div className="max-h-52 overflow-y-auto">
                      {clients.length > 0 ? (
                        clients.map((client) => (
                          <button
                            key={client.id}
                            className={`w-full text-left px-4 py-2.5 text-sm hover:bg-muted transition-colors ${
                              filters.clientId === client.id
                                ? "bg-primary/10 text-primary"
                                : ""
                            }`}
                            onClick={() =>
                              handleSelectClient(client)
                            }
                          >
                            {client.first_name}{" "}
                            {client.last_name}
                          </button>
                        ))
                      ) : (
                        <div className="p-3 text-sm text-muted-foreground text-center">
                          No clients found
                        </div>
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>
          )}

          {/* From Date */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">
              From Date
            </label>
            <Input
              type="date"
              value={filters.fromDate}
              onChange={(e) =>
                setFilters((prev) => ({
                  ...prev,
                  fromDate: e.target.value,
                }))
              }
            />
          </div>

          {/* To Date */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">
              To Date
            </label>
            <Input
              type="date"
              value={filters.toDate}
              onChange={(e) =>
                setFilters((prev) => ({
                  ...prev,
                  toDate: e.target.value,
                }))
              }
            />
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <Button
            variant="outline"
            onClick={() => {
              setFilters({
                status: "all",
                search: "",
                fromDate: "",
                toDate: "",
                clientId: null,
                clientLabel: "",
              });
              setClientSearch("");
              setAppliedFilters({
                status: "all",
                search: "",
                fromDate: "",
                toDate: "",
                clientId: null,
                clientLabel: "",
              });
            }}
          >
            Reset Filters
          </Button>
          <Button
            onClick={() => {
              setAppliedFilters(filters);
              setPage(1);
            }}
          >
            Apply Filters
          </Button>
        </div>
      </div>

      {/* GRID */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 12 }).map((_, i) => (
            <Skeleton key={i} className="h-72 rounded-2xl" />
          ))}
        </div>
      ) : documents.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {documents.map((doc) => (
            <div
              key={doc._id}
              className="rounded-2xl border bg-card shadow-sm hover:shadow-xl transition-all hover:-translate-y-1 flex flex-col justify-between"
            >
              <div className="p-6 space-y-4">
                <div className="flex items-start gap-4">
                  <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
                    <FileText className="h-6 w-6 text-primary" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-medium text-lg mt-2 truncate">
                      {doc.originalName || doc.fileName}
                    </h3>
                  </div>
                </div>

                <div className="space-y-2 text-sm text-muted-foreground">
                  <p className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    {doc.uploadedBy?.first_name}{" "}
                    {doc.uploadedBy?.last_name}
                  </p>
                  <p className="flex items-center gap-2">
                    <FileClock className="h-4 w-4" />
                    {new Date(doc.createdAt).toLocaleDateString()}
                  </p>
                </div>

                <Badge
                  variant="outline"
                  className={`${statusTone[doc.reviewStatus]} capitalize`}
                >
                  {doc.reviewStatus?.replace("_", " ")}
                </Badge>
              </div>

              <div className="border-t bg-muted/20 p-4 flex justify-between">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleView(doc)}
                >
                  View
                </Button>
                <Button
                  size="sm"
                  onClick={() =>
                    navigate(
                      isAdmin
                        ? `/admin/tasks/${doc.taskId?._id}`
                        : isStaff
                          ? `/staff/tasks/${doc.taskId?._id}`
                          : `/new-dashboard/tasks/${doc.taskId?._id}`
                    )
                  }
                >
                  Go to Task
                </Button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border p-16 text-center text-muted-foreground">
          No documents found.
        </div>
      )}

      <PaginationControls
        page={pagination.currentPage || 1}
        totalPages={pagination.totalPages || 0}
        totalItems={pagination.totalItems || 0}
        pageSize={pagination.perPage || DEFAULT_PAGE_SIZE}
        onPageChange={setPage}
      />

      <DocumentViewerModal
        open={!!viewingDocument}
        onOpenChange={(open) => !open && setViewingDocument(null)}
        document={viewingDocument}
        onDeleted={refetch}
        canDelete={false}
      />
    </div>
  );
}
