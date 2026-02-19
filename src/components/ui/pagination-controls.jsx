import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

export function PaginationControls({ page, totalPages, totalItems, pageSize, onPageChange }) {
  if (totalPages <= 1) return null;

  return (
    <div className="flex flex-col gap-2 pt-2 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-xs text-muted-foreground">
        Showing {(page - 1) * pageSize + 1}–{Math.min(page * pageSize, totalItems)} of {totalItems}
      </p>
      <div className="flex items-center gap-1 overflow-x-auto pb-1">
        <Button variant="outline" size="icon" className="h-8 w-8" disabled={page <= 1} onClick={() => onPageChange(page - 1)}>
          <ChevronLeft className="h-4 w-4" />
        </Button>
        {Array.from({ length: totalPages }).map((_, i) => (
          <Button
            key={i}
            variant={page === i + 1 ? "default" : "outline"}
            size="icon"
            className="h-8 w-8"
            onClick={() => onPageChange(i + 1)}
          >
            {i + 1}
          </Button>
        ))}
        <Button variant="outline" size="icon" className="h-8 w-8" disabled={page >= totalPages} onClick={() => onPageChange(page + 1)}>
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
