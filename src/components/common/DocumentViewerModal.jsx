import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Download,
  ZoomIn,
  ZoomOut,
  RotateCw,
  Trash2,
  FileText,
  Image as ImageIcon,
  File,
  AlertTriangle,
  Maximize2,
  Minimize2,
} from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import { Slider } from "@/components/ui/slider";
import {
  useGetTaskDocumentUrlQuery,
  useDeleteDocumentMutation,
} from "@/features/taskDocuments/taskDocumentApi";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { useSelector } from "react-redux";
import config from "@/config";

export function DocumentViewerModal({
  open,
  onOpenChange,
  document,
}) {
  const [zoom, setZoom] = useState(100);
  const [rotation, setRotation] = useState(0);
  const [expanded, setExpanded] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const user = useSelector((state) => state.auth.user);

  const {
    data,
    isLoading,
    isError,
  } = useGetTaskDocumentUrlQuery(document?._id, {
    skip: !open || !document?._id,
  });

  const [deleteDocument, { isLoading: isDeleting }] =
    useDeleteDocumentMutation();

  useEffect(() => {
    if (open) {
      setZoom(100);
      setRotation(0);
      setExpanded(false);
    }
  }, [open]);

  if (!document) return null;

  const fileUrl = data?.signedUrl || "";

  const ext =
    document.fileName?.split(".").pop()?.toLowerCase() ||
    document.originalName?.split(".").pop()?.toLowerCase() ||
    "";

  const isPDF = ext === "pdf" || document.mimeType?.includes("pdf");
  const isImage =
    ["jpg", "jpeg", "png", "gif", "webp", "svg"].includes(ext) ||
    document.mimeType?.startsWith("image/");

  // ✅ Only CLIENT can delete
  const canDelete = user?.role_id === "3";

  // 🔥 Download via backend streaming
  const handleDownload = async () => {
    try {
      const response = await fetch(
        `${config.api.baseUrl}/task-documents/${document._id}/download`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (!response.ok) throw new Error("Download failed");

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);

      const link = window.document.createElement("a");
      link.href = url;
      link.download = document.originalName || "file";
      link.click();

      window.URL.revokeObjectURL(url);

      toast.success("Download started");
    } catch (error) {
      console.error(error);
      toast.error("Download failed");
    }
  };

  // 🔥 Delete handler
  const handleDelete = async () => {
    try {
      await deleteDocument(document._id).unwrap();

      toast.success("Document deleted successfully");

      setConfirmOpen(false);
      onOpenChange(false);
    } catch (error) {
      console.error(error);
      toast.error("Failed to delete document");
    }
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return "Unknown size";
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024)
      return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent
          className={`p-0 overflow-hidden rounded-xl transition-all duration-300 ${
            expanded
              ? "max-w-[95vw] h-[95vh]"
              : "max-w-5xl h-[85vh]"
          } flex flex-col`}
        >
          {/* HEADER */}
          <DialogHeader className="p-0">
            <div className="flex items-center justify-between px-6 py-4 border-b bg-muted/30">
              <div className="flex items-center gap-3">
                {isPDF ? (
                  <FileText className="h-5 w-5 text-red-500" />
                ) : isImage ? (
                  <ImageIcon className="h-5 w-5 text-blue-500" />
                ) : (
                  <File className="h-5 w-5 text-gray-500" />
                )}

                <div>
                  <DialogTitle>
                    {document.originalName || document.fileName}
                  </DialogTitle>
                  <p className="text-xs text-muted-foreground">
                    {formatFileSize(document.fileSize)} • Uploaded{" "}
                    {format(
                      new Date(
                        document.uploadedAt || document.createdAt
                      ),
                      "MMM dd, yyyy"
                    )}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setExpanded((e) => !e)}
                >
                  {expanded ? (
                    <Minimize2 className="w-4 h-4" />
                  ) : (
                    <Maximize2 className="w-4 h-4" />
                  )}
                </Button>

                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleDownload}
                >
                  <Download className="h-4 w-4" />
                </Button>

                {canDelete && (
                  <Button
                    variant="destructive"
                    size="icon"
                    onClick={() => setConfirmOpen(true)}
                    disabled={isDeleting}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
          </DialogHeader>

          {/* TOOLBAR */}
          {(isPDF || isImage) && (
            <div className="flex items-center justify-between px-6 py-2 border-b bg-card">
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setZoom((z) => Math.max(25, z - 25))}
                >
                  <ZoomOut className="w-4 h-4" />
                </Button>

                <div className="w-32">
                  <Slider
                    value={[zoom]}
                    onValueChange={(v) => setZoom(v[0])}
                    min={25}
                    max={200}
                    step={5}
                  />
                </div>

                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setZoom((z) => Math.min(200, z + 25))}
                >
                  <ZoomIn className="w-4 h-4" />
                </Button>

                {isImage && (
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() =>
                      setRotation((r) => (r + 90) % 360)
                    }
                  >
                    <RotateCw className="w-4 h-4" />
                  </Button>
                )}

                <span className="text-xs w-10 text-center">
                  {zoom}%
                </span>
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setZoom(100);
                  setRotation(0);
                }}
              >
                Reset
              </Button>
            </div>
          )}

          {/* PREVIEW */}
          <div className="flex-1 bg-muted/20 overflow-auto flex items-center justify-center p-4">
            {isLoading && <p>Loading document...</p>}
            {isError && (
              <p className="text-destructive">
                Failed to load document
              </p>
            )}

            {!isLoading && fileUrl && (
              <div
                style={{
                  transform: `scale(${zoom / 100}) rotate(${rotation}deg)`,
                  transition: "transform 0.2s ease",
                }}
                className="max-w-full max-h-full"
              >
                {isPDF ? (
                  <iframe
                    src={`${fileUrl}#toolbar=0&navpanes=0`}
                    className="w-[900px] h-[1000px] bg-white rounded shadow"
                    title="PDF Viewer"
                  />
                ) : isImage ? (
                  <img
                    src={fileUrl}
                    alt="Preview"
                    className="max-w-full max-h-full object-contain rounded shadow"
                  />
                ) : (
                  <div className="text-center">
                    <AlertTriangle className="h-10 w-10 mx-auto text-muted-foreground" />
                    <p className="mt-2">Preview not available</p>
                    <Button onClick={handleDownload} className="mt-3">
                      Download File
                    </Button>
                  </div>
                )}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title="Delete Document"
        description="This action cannot be undone."
        confirmLabel={isDeleting ? "Deleting..." : "Delete"}
        variant="destructive"
        onConfirm={handleDelete}
      />
    </>
  );
}