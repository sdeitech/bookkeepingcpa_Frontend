import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Download, ZoomIn, ZoomOut, RotateCw, Trash2, FileText, Image as ImageIcon, File, AlertTriangle } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import config from "@/config";

export function DocumentViewerModal({ 
  open, 
  onOpenChange, 
  document, 
  canDelete = false,
  onDelete 
}) {
  const [zoom, setZoom] = useState(100);
  const [rotation, setRotation] = useState(0);
  const [error, setError] = useState(null);

  // Helper function to get full file URL
  const getFullFileUrl = (fileUrl) => {
    if (!fileUrl) return '';
    
    // If it's already a full URL (starts with http:// or https://), return as is
    if (fileUrl.startsWith('http://') || fileUrl.startsWith('https://')) {
      return fileUrl;
    }
    
    // If it's a relative path, construct full URL
    // Remove /api from baseUrl if present, and remove leading slash from fileUrl
    const baseUrl = config.api.baseUrl.replace('/api', '');
    const cleanPath = fileUrl.startsWith('/') ? fileUrl : `/${fileUrl}`;
    console.log("Constructed file URL:", `${baseUrl}${cleanPath}`);
    
    return `${baseUrl}${cleanPath}`;
  };

  // Reset error when document changes
  useEffect(() => {
    setError(null);
    setZoom(100);
    setRotation(0);
  }, [document]);

  // Keyboard navigation
  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (e) => {
      // ESC to close
      if (e.key === 'Escape') {
        onOpenChange(false);
        return;
      }

      // Prevent default for arrow keys and +/- keys
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', '+', '-', '='].includes(e.key)) {
        e.preventDefault();
      }

      // Zoom controls
      if (e.key === '+' || e.key === '=') {
        handleZoomIn();
      } else if (e.key === '-') {
        handleZoomOut();
      }

      // Arrow keys for zoom (up/down) and rotation (left/right)
      if (e.key === 'ArrowUp') {
        handleZoomIn();
      } else if (e.key === 'ArrowDown') {
        handleZoomOut();
      } else if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
        if (isImage) {
          handleRotate();
        }
      }

      // D for download
      if (e.key === 'd' || e.key === 'D') {
        handleDownload();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open, zoom, rotation]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!document) return null;

  const fileUrl = getFullFileUrl(document.fileUrl);
  const fileExtension = document.fileName?.split('.').pop()?.toLowerCase() || '';
  const isPDF = fileExtension === 'pdf' || document.mimeType?.includes('pdf');
  const isImage = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(fileExtension) || 
                  document.mimeType?.startsWith('image/');

  const handleDownload = () => {
    window.open(fileUrl, '_blank');
    toast.success("Download started");
  };

  const handleDelete = async () => {
    if (onDelete) {
      await onDelete(document._id);
      onOpenChange(false);
    }
  };

  const handleZoomIn = () => setZoom(prev => Math.min(prev + 25, 200));
  const handleZoomOut = () => setZoom(prev => Math.max(prev - 25, 50));
  const handleRotate = () => setRotation(prev => (prev + 90) % 360);

  const formatFileSize = (bytes) => {
    if (!bytes) return 'Unknown size';
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl h-[90vh] sm:h-[85vh] flex flex-col p-0">
        {/* Header */}
        <DialogHeader className="px-4 sm:px-6 py-3 sm:py-4 border-b border-border">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2 sm:gap-3 min-w-0">
              {isPDF ? (
                <FileText className="h-5 w-5 text-red-500" />
              ) : isImage ? (
                <ImageIcon className="h-5 w-5 text-blue-500" />
              ) : (
                <File className="h-5 w-5 text-gray-500" />
              )}
              <div>
                <DialogTitle className="text-base sm:text-lg truncate">{document.fileName || 'Document'}</DialogTitle>
                <p className="text-xs text-muted-foreground mt-1">
                  {formatFileSize(document.fileSize)}
                  {document.uploadedAt && (
                    <>
                      <span className="hidden sm:inline"> • </span>
                      <span className="hidden sm:inline">Uploaded {format(new Date(document.uploadedAt), 'MMM dd, yyyy')}</span>
                    </>
                  )}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
              {(isPDF || isImage) && (
                <>
                  <Button variant="ghost" size="sm" onClick={handleZoomOut} disabled={zoom <= 50} className="hidden sm:flex">
                    <ZoomOut className="h-4 w-4" />
                  </Button>
                  <span className="text-xs sm:text-sm text-muted-foreground min-w-[40px] sm:min-w-[50px] text-center">
                    {zoom}%
                  </span>
                  <Button variant="ghost" size="sm" onClick={handleZoomIn} disabled={zoom >= 200} className="hidden sm:flex">
                    <ZoomIn className="h-4 w-4" />
                  </Button>
                  {isImage && (
                    <Button variant="ghost" size="sm" onClick={handleRotate} className="hidden sm:flex">
                      <RotateCw className="h-4 w-4" />
                    </Button>
                  )}
                  <div className="w-px h-6 bg-border mx-1 hidden sm:block" />
                </>
              )}
              <Button variant="ghost" size="sm" onClick={handleDownload}>
                <Download className="h-4 w-4" />
              </Button>
              {canDelete && (
                <Button variant="ghost" size="sm" onClick={handleDelete} className="text-destructive hover:text-destructive">
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        </DialogHeader>

        {/* Viewer Area */}
        <div className="flex-1 overflow-auto bg-muted/30 p-2 sm:p-4">
          <div className="flex items-center justify-center min-h-full">
            {isPDF ? (
              <div className="w-full h-full bg-white rounded-lg shadow-lg overflow-hidden">
                <iframe
                  src={`${fileUrl}#view=FitH`}
                  className="w-full h-full"
                  style={{ 
                    minHeight: '400px',
                    transform: `scale(${zoom / 100})`,
                    transformOrigin: 'top center'
                  }}
                  title={document.fileName}
                  onError={() => setError('Failed to load PDF. Please try downloading the file.')}
                />
              </div>
            ) : isImage ? (
              <div className="flex items-center justify-center">
                <img
                  src={fileUrl}
                  alt={document.fileName}
                  className="max-w-full max-h-full object-contain rounded-lg shadow-lg"
                  style={{
                    transform: `scale(${zoom / 100}) rotate(${rotation}deg)`,
                    transition: 'transform 0.2s ease'
                  }}
                  onError={() => setError('Failed to load image. Please try downloading the file.')}
                />
              </div>
            ) : error ? (
              <div className="flex flex-col items-center justify-center gap-4 p-8 bg-card rounded-lg border border-destructive">
                <AlertTriangle className="h-16 w-16 text-destructive" />
                <div className="text-center">
                  <p className="font-medium text-foreground mb-1">Error loading document</p>
                  <p className="text-sm text-muted-foreground mb-4">{error}</p>
                  <Button onClick={handleDownload} className="gap-2">
                    <Download className="h-4 w-4" />
                    Download File
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center gap-4 p-8 bg-card rounded-lg border border-border">
                <File className="h-16 w-16 text-muted-foreground" />
                <div className="text-center">
                  <p className="font-medium text-foreground mb-1">Preview not available</p>
                  <p className="text-sm text-muted-foreground mb-4">
                    This file type cannot be previewed in the browser
                  </p>
                  <Button onClick={handleDownload} className="gap-2">
                    <Download className="h-4 w-4" />
                    Download File
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        {document.uploadedBy && (
          <div className="px-4 sm:px-6 py-2 sm:py-3 border-t border-border bg-muted/30">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <p className="text-xs text-muted-foreground truncate">
                Uploaded by {document.uploadedBy.first_name} {document.uploadedBy.last_name}
                {document.documentType && (
                  <>
                    <span className="hidden sm:inline"> • Document Type: {document.documentType.replace(/_/g, ' ')}</span>
                  </>
                )}
              </p>
              <p className="text-xs text-muted-foreground hidden lg:block">
                Shortcuts: ESC (close) • +/- (zoom) • ↑↓ (zoom) • ←→ (rotate) • D (download)
              </p>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
