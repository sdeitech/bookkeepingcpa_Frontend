import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react";

export function PaginationControls({ page, totalPages, totalItems, pageSize, onPageChange }) {
  if (totalPages <= 1) return null;

  // Generate page numbers with ellipsis
  const getPageNumbers = () => {
    const pages = [];
    const showEllipsis = totalPages > 7;

    if (!showEllipsis) {
      // Show all pages if 7 or fewer
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
      return pages;
    }

    // Always show first page
    pages.push(1);

    if (page <= 3) {
      // Near start: 1 2 3 4 5 ... 10
      for (let i = 2; i <= Math.min(5, totalPages - 1); i++) {
        pages.push(i);
      }
      if (totalPages > 6) pages.push('ellipsis-end');
      pages.push(totalPages);
    } else if (page >= totalPages - 2) {
      // Near end: 1 ... 6 7 8 9 10
      pages.push('ellipsis-start');
      for (let i = Math.max(totalPages - 4, 2); i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Middle: 1 ... 4 5 6 ... 10
      pages.push('ellipsis-start');
      for (let i = page - 1; i <= page + 1; i++) {
        pages.push(i);
      }
      pages.push('ellipsis-end');
      pages.push(totalPages);
    }

    return pages;
  };

  const pageNumbers = getPageNumbers();

  return (
    <div className="flex flex-col gap-2 pt-2 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-xs text-muted-foreground">
        Showing {(page - 1) * pageSize + 1}–{Math.min(page * pageSize, totalItems)} of {totalItems}
      </p>
      <div className="flex items-center gap-1 overflow-x-auto pb-1">
        <Button 
          variant="outline" 
          size="icon" 
          className="h-8 w-8" 
          disabled={page <= 1} 
          onClick={() => onPageChange(page - 1)}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        
        {pageNumbers.map((pageNum, index) => {
          if (pageNum === 'ellipsis-start' || pageNum === 'ellipsis-end') {
            return (
              <div key={`ellipsis-${index}`} className="flex h-8 w-8 items-center justify-center">
                <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
              </div>
            );
          }
          
          return (
            <Button
              key={pageNum}
              variant={page === pageNum ? "default" : "outline"}
              size="icon"
              className="h-8 w-8"
              onClick={() => onPageChange(pageNum)}
            >
              {pageNum}
            </Button>
          );
        })}
        
        <Button 
          variant="outline" 
          size="icon" 
          className="h-8 w-8" 
          disabled={page >= totalPages} 
          onClick={() => onPageChange(page + 1)}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xl font-semibold text-foreground">
          Results: {startItem} - {endItem} of {totalItems}
        </p>
        {onPageSizeChange && (
          <Select
            value={String(pageSize)}
            onValueChange={(value) => onPageSizeChange(Number(value))}
          >
            <SelectTrigger className="h-12 w-[140px] rounded-2xl bg-muted border-border text-lg">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-popover z-50">
              {pageSizeOptions.map((size) => (
                <SelectItem key={size} value={String(size)}>
                  {size}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>
    </div>
  );
}
