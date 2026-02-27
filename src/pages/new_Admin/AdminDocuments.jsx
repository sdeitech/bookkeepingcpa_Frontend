import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { DocumentViewerModal } from "@/components/common/DocumentViewerModal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { PaginationControls } from "@/components/ui/pagination-controls";
import { FileClock, FileText, User } from "lucide-react";
import { useGetAllDocumentsQuery } from "@/features/tasks/tasksApi";

const DEFAULT_PAGE_SIZE = 12;

export default function AdminDocuments() {
  const navigate = useNavigate();

  const [page, setPage] = useState(1);
  const [viewingDocument, setViewingDocument] = useState(null);

  const [filters, setFilters] = useState({
    status: "all",
    search: "",
    fromDate: "",
    toDate: "",
  });

  // 🔥 Debounce search
  const [debouncedSearch, setDebouncedSearch] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(filters.search);
    }, 500);

    return () => clearTimeout(timer);
  }, [filters.search]);

  useEffect(() => {
    setPage(1);
  }, [filters.status, filters.fromDate, filters.toDate, debouncedSearch]);

  const { data, isLoading } = useGetAllDocumentsQuery({
    page,
    limit: DEFAULT_PAGE_SIZE,
    status: filters.status,
    search: debouncedSearch,
    fromDate: filters.fromDate,
    toDate: filters.toDate,
  });

  const documents = data?.documents || [];
  const pagination = data?.pagination || {};

  const statusTone = {
    pending_review:
      "bg-yellow-500/10 text-yellow-600 border-yellow-500/30",
    approved: "bg-green-500/10 text-green-600 border-green-500/30",
    rejected: "bg-red-500/10 text-red-600 border-red-500/30",
  };

  const handleView = (doc) => {
    setViewingDocument({
      _id: doc._id,
      fileName: doc.originalName || doc.fileName,
      fileUrl: doc.fileUrl,
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
        <h2 className="text-3xl font-bold">Documents Management</h2>
        <p className="text-muted-foreground mt-2">
          Filter and manage uploaded documents.
        </p>
      </div>

      {/* FILTERS */}
      <div className="rounded-2xl border bg-card p-6 space-y-6">

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">

          {/* Status */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">
              Status
            </label>
            <select
              className="w-full border rounded-md px-3 py-2"
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

        </div>

        {/* Reset Button */}
        <div className="flex justify-end">
          <Button
            variant="outline"
            onClick={() =>
              setFilters({
                status: "all",
                search: "",
                fromDate: "",
                toDate: "",
              })
            }
          >
            Reset Filters
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
                    <h3 className="font-semibold text-lg truncate">
                      {doc.originalName || doc.fileName}
                    </h3>
                  </div>
                </div>

                <div className="space-y-2 text-sm text-muted-foreground">
                  <p className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    {doc.uploadedBy?.first_name} {doc.uploadedBy?.last_name}
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
                    navigate(`/admin/tasks/${doc.taskId?._id}`)
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

      {/* PAGINATION */}
      <PaginationControls
        page={pagination.currentPage || 1}
        totalPages={pagination.totalPages || 0}
        totalItems={pagination.totalItems || 0}
        pageSize={pagination.perPage || DEFAULT_PAGE_SIZE}
        onPageChange={setPage}
      />

      {/* MODAL */}
      <DocumentViewerModal
        open={!!viewingDocument}
        onOpenChange={(open) =>
          !open && setViewingDocument(null)
        }
        document={viewingDocument}
        canDelete={false}
      />
    </div>
  );
}