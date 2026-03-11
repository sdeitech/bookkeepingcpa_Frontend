import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { DocumentViewerModal } from "@/components/common/DocumentViewerModal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { PaginationControls } from "@/components/ui/pagination-controls";
import { FileClock, FileText, User, X, ChevronDown, Upload, Loader2, Plus } from "lucide-react";
import { useGetAllDocumentsQuery } from "@/features/tasks/tasksApi";
import { useUploadStandaloneDocumentMutation } from "@/features/taskDocuments/taskDocumentApi";
import { useGetAllClientsQuery } from "@/features/user/userApi";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { toast } from "sonner";


const DEFAULT_PAGE_SIZE = 12;

export default function DocumentsPage({ role = "admin" }) {
  const navigate = useNavigate();
  const isAdmin = role === "admin";
  const isStaff = role === "staff";

  const [page, setPage] = useState(1);
  const [viewingDocument, setViewingDocument] = useState(null);
  const [clientSearch, setClientSearch] = useState("");
  const [showClientDropdown, setShowClientDropdown] = useState(false);

  // Standalone upload state
  const [uploadingStandalone, setUploadingStandalone] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [showUploadArea, setShowUploadArea] = useState(false);

  const [filters, setFilters] = useState({
    status: "all",
    search: "",
    fromDate: "",
    toDate: "",
    clientId: null,
    clientLabel: "",
    type: "all", // all, task-related, standalone
    includeDeleted: false, // New filter for deleted tasks
  });
  const [appliedFilters, setAppliedFilters] = useState({
    status: "all",
    search: "",
    fromDate: "",
    toDate: "",
    clientId: null,
    clientLabel: "",
    type: "all",
    includeDeleted: false,
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
    appliedFilters.type,
    appliedFilters.includeDeleted,
    debouncedSearch,
    appliedFilters.clientId,
  ]);

  // Auto-apply includeDeleted filter when it changes
  useEffect(() => {
    if (filters.includeDeleted !== appliedFilters.includeDeleted) {
      setAppliedFilters(prev => ({ ...prev, includeDeleted: filters.includeDeleted }));
    }
  }, [filters.includeDeleted, appliedFilters.includeDeleted]);

  // 🔥 Common API
  const { data, isLoading, refetch } = useGetAllDocumentsQuery({
    page,
    limit: DEFAULT_PAGE_SIZE,
    status: appliedFilters.status,
    search: debouncedSearch,
    fromDate: appliedFilters.fromDate,
    toDate: appliedFilters.toDate,
    type: appliedFilters.type,
    includeDeleted: appliedFilters.includeDeleted, // New filter parameter
    clientId: isAdmin ? appliedFilters.clientId || undefined : undefined,
  });

  // Standalone upload mutation
  const [uploadStandaloneDocument] = useUploadStandaloneDocumentMutation();

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

  const handleStandaloneUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'text/csv',
      'text/plain',
      'image/jpeg',
      'image/jpg',
      'image/png',
      'image/gif',
      'image/webp',
      'application/zip',
      'application/x-rar-compressed'
    ];

    const allowedExtensions = ['.pdf', '.doc', '.docx', '.xls', '.xlsx', '.csv', '.txt', '.jpg', '.jpeg', '.png', '.gif', '.webp', '.zip', '.rar'];
    const fileExtension = '.' + file.name.split('.').pop().toLowerCase();

    if (!allowedTypes.includes(file.type) && !allowedExtensions.includes(fileExtension)) {
      toast.error("Invalid file type. Please upload PDF, Word, Excel, images, or compressed files only.");
      event.target.value = '';
      return;
    }

    // Validate file size (max 10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      toast.error("File size must be less than 10MB");
      event.target.value = '';
      return;
    }

    setUploadingStandalone(true);
    setUploadProgress(0);

    // Simulate upload progress
    const progressInterval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 90) {
          clearInterval(progressInterval);
          return 90;
        }
        return prev + 10;
      });
    }, 200);

    const formData = new FormData();
    formData.append("file", file);

    try {
      await uploadStandaloneDocument(formData).unwrap();
      
      // Complete progress
      clearInterval(progressInterval);
      setUploadProgress(100);
      
      // Show success message after brief delay
      setTimeout(() => {
        toast.success("Standalone document uploaded successfully");
        refetch(); // Refresh the documents list
        setShowUploadArea(false); // Hide upload area
      }, 300);
    } catch (error) {
      clearInterval(progressInterval);
      toast.error("Failed to upload document");
      console.error("Upload error:", error);
    } finally {
      setTimeout(() => {
        setUploadingStandalone(false);
        setUploadProgress(0);
        // Reset file input
        event.target.value = '';
      }, 500);
    }
  };

  return (
    <div className="space-y-8">
      {/* HEADER */}
      <div className="rounded-3xl bg-gradient-to-r from-primary/10 to-muted/40 border p-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-3xl font-bold">
              {isAdmin ? "Documents Management" : "My Documents"}
            </h2>
            <p className="text-muted-foreground mt-2">
              {isAdmin
                ? "Filter and manage uploaded documents."
                : "View and manage your uploaded documents."}
            </p>
          </div>
          
          {/* Upload Standalone Document Button */}
          <div className="flex gap-2">
            <Button
              onClick={() => setShowUploadArea(!showUploadArea)}
              className="gap-2"
              variant={showUploadArea ? "secondary" : "default"}
            >
              <Plus className="h-4 w-4" />
              Upload Document
            </Button>
          </div>
        </div>

        {/* Standalone Upload Area */}
        {showUploadArea && (
          <div className="mt-6 p-6 bg-white/50 rounded-2xl border border-white/20">
            <div className={cn(
              "border-2 border-dashed rounded-lg p-6 transition-all",
              uploadingStandalone 
                ? "border-primary bg-primary/5" 
                : "border-gray-300 hover:border-primary/50"
            )}>
              <div className="text-center">
                <input
                  type="file"
                  id="upload-standalone-main"
                  className="hidden"
                  accept=".pdf,.doc,.docx,.xls,.xlsx,.csv,.txt,.jpg,.jpeg,.png,.gif,.webp,.zip,.rar"
                  onChange={handleStandaloneUpload}
                  disabled={uploadingStandalone}
                />
                
                {uploadingStandalone ? (
                  <div className="space-y-3">
                    <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
                    <div>
                      <p className="text-sm font-medium text-foreground">Uploading document...</p>
                      <p className="text-xs text-muted-foreground">{uploadProgress}% complete</p>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden max-w-xs mx-auto">
                      <div
                        className="bg-primary h-full transition-all duration-300 ease-out"
                        style={{ width: `${uploadProgress}%` }}
                      />
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <Upload className="h-8 w-8 mx-auto text-gray-400" />
                    <div>
                      <Button
                        variant="outline"
                        onClick={() => document.getElementById('upload-standalone-main').click()}
                        className="gap-2"
                      >
                        <Upload className="h-4 w-4" />
                        Choose File
                      </Button>
                      <p className="text-xs text-muted-foreground mt-2">
                        Upload documents not related to any specific task
                      </p>
                      <p className="text-xs text-muted-foreground">
                        PDF, Word, Excel, Images, or ZIP files (max 10MB)
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* DOCUMENT TYPE TABS */}
      <div className="flex flex-wrap gap-2 p-1 bg-muted rounded-lg">
        {[
          { value: "all", label: "All Documents" },
          { value: "task-related", label: "Task Documents" },
          { value: "standalone", label: "Standalone Documents" }
        ].map((tab) => (
          <button
            key={tab.value}
            onClick={() => {
              const newFilters = { ...filters, type: tab.value };
              setFilters(newFilters);
              setAppliedFilters(newFilters); // Sync ALL filters, not just type
            }}
            className={cn(
              "px-4 py-2 rounded-md text-sm font-medium transition-all",
              appliedFilters.type === tab.value
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            {tab.label}
          </button>
        ))}
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

        {/* Include Deleted Tasks Toggle */}
        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            id="includeDeleted"
            checked={filters.includeDeleted}
            onChange={(e) =>
              setFilters((prev) => ({
                ...prev,
                includeDeleted: e.target.checked,
              }))
            }
            className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
          />
          <label htmlFor="includeDeleted" className="text-sm font-medium text-foreground">
            Include Deleted Tasks
          </label>
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
                type: "all",
                includeDeleted: false,
              });
              setClientSearch("");
              setAppliedFilters({
                status: "all",
                search: "",
                fromDate: "",
                toDate: "",
                clientId: null,
                clientLabel: "",
                type: "all",
                includeDeleted: false,
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
              className={cn(
                "rounded-2xl border bg-card shadow-sm hover:shadow-xl transition-all hover:-translate-y-1 flex flex-col justify-between",
                // Gray out deleted task documents
                doc.taskId?.deleted && "opacity-60 bg-gray-50"
              )}
            >
              <div className="p-6 space-y-4">
                <div className="flex items-start gap-4">
                  <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
                    <FileText className="h-6 w-6 text-primary" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="font-medium text-lg mt-2 truncate">
                      {doc.originalName || doc.fileName}
                    </h3>
                    {/* Document Type Badge */}
                    <div className="mt-2">
                      {doc.taskId ? (
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-xs">
                            {doc.documentType ? (
                              doc.documentType.replace(/_/g, ' ')
                            ) : (
                              'Additional Document'
                            )}
                          </Badge>
                          {/* Task Status Badge */}
                          {doc.taskId?.deleted && (
                            <Badge variant="outline" className="text-xs bg-red-50 text-red-700 border-red-200">
                              Task Removed
                            </Badge>
                          )}
                          {doc.taskId?.status === 'ON_HOLD' && !doc.taskId?.deleted && (
                            <Badge variant="outline" className="text-xs bg-yellow-50 text-yellow-700 border-yellow-200">
                              Task On Hold
                            </Badge>
                          )}
                        </div>
                      ) : (
                        <Badge variant="outline" className="text-xs bg-purple-50 text-purple-700 border-purple-200">
                          Standalone Document
                        </Badge>
                      )}
                    </div>
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
                {/* Conditional Go to Task button */}
                {doc.taskId && !doc.taskId.deleted ? (
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
                ) : doc.taskId?.deleted ? (
                  <Badge variant="secondary" className="text-xs">
                    Task Removed
                  </Badge>
                ) : (
                  <Badge variant="secondary" className="text-xs">
                    No Task
                  </Badge>
                )}
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
