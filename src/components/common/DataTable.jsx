import { isValidElement, useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import { MoreHorizontal, ArrowUp, ArrowDown, ArrowUpDown, Inbox, Filter, Check, Search, X } from "lucide-react";
import { cn } from "@/lib/utils";

const SEARCH_THRESHOLD = 15;

function SearchableFilterDropdown({ column, activeFilter, onFilterChange }) {
  const [searchTerm, setSearchTerm] = useState("");
  
  const allOptions = column.filterOptions || [];
  const showSearch = allOptions.length > SEARCH_THRESHOLD;
  
  // Filter options based on search term
  const filteredOptions = searchTerm
    ? allOptions.filter(opt => 
        opt.label.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : allOptions;

  return (
    <DropdownMenuContent align="start" className="bg-popover z-50 min-w-[200px]">
      {showSearch && (
        <div className="p-2 border-b border-border">
          <div className="relative">
            <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <Input
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="h-8 pl-8 pr-8 text-sm"
              onClick={(e) => e.stopPropagation()}
            />
            {searchTerm && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setSearchTerm("");
                }}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        </div>
      )}
      
      <div className="max-h-[300px] overflow-y-auto">
        {filteredOptions.length === 0 ? (
          <div className="p-4 text-center text-sm text-muted-foreground">
            No results found
          </div>
        ) : (
          filteredOptions.map((opt) => (
            <DropdownMenuItem
              key={opt.value}
              onClick={() => {
                onFilterChange(opt.value === activeFilter ? "" : opt.value);
                setSearchTerm("");
              }}
              className="flex items-center justify-between"
            >
              <span>{opt.label}</span>
              {activeFilter === opt.value && <Check className="h-3.5 w-3.5 text-primary" />}
            </DropdownMenuItem>
          ))
        )}
      </div>
      
      {column.filterGroups && column.filterGroups.map((group, gi) => (
        <div key={gi}>
          <DropdownMenuSeparator />
          {group.options.map((opt) => (
            <DropdownMenuItem
              key={opt.value}
              onClick={() => {
                onFilterChange(opt.value === activeFilter ? "" : opt.value);
                setSearchTerm("");
              }}
              className="flex items-center justify-between"
            >
              <span>{opt.label}</span>
              {activeFilter === opt.value && <Check className="h-3.5 w-3.5 text-primary" />}
            </DropdownMenuItem>
          ))}
        </div>
      ))}
    </DropdownMenuContent>
  );
}






export function DataTable({
  data,
  columns,
  onSort,
  onRowClick,
  onRowAction,
  rowActions,
  selectedRows = [],
  onSelectRow,
  onSelectAll,
  getRowId = (row) => row.id,
  loading = false,
  emptyMessage = "No data found",
  emptyDescription = "Try adjusting your filters.",
  columnFilters = {},
  onColumnFilterChange,
}) {
  const [sortKey, setSortKey] = useState(null);
  const [sortDir, setSortDir] = useState("asc");

  const handleSort = (key) => {
    const newDir = sortKey === key && sortDir === "asc" ? "desc" : "asc";
    setSortKey(key);
    setSortDir(newDir);
    onSort?.(key, newDir);
  };

  const SortIcon = ({ colKey }) => {
    if (sortKey !== colKey) return <ArrowUpDown className="h-3.5 w-3.5 text-muted-foreground/50" />;
    return sortDir === "asc"
      ? <ArrowUp className="h-3.5 w-3.5 text-primary" />
      : <ArrowDown className="h-3.5 w-3.5 text-primary" />;
  };

  const hasSelection = !!onSelectRow;
  const hasActions = typeof rowActions === "function" ? true : !!(rowActions && rowActions.length > 0);
  const totalCols = columns.length + (hasSelection ? 1 : 0) + (hasActions ? 1 : 0);

  const formatCellValue = (value) => {
    if (value === null || value === undefined) return "";
    if (isValidElement(value)) return value;
    if (typeof value === "string" || typeof value === "number") return value;
    if (typeof value === "boolean") return value ? "Yes" : "No";
    if (value instanceof Date) return value.toLocaleDateString();

    if (Array.isArray(value)) {
      return value.map((item) => formatCellValue(item)).join(", ");
    }

    if (typeof value === "object") {
      const first = value.first_name || value.firstName;
      const last = value.last_name || value.lastName;
      const fullName = [first, last].filter(Boolean).join(" ").trim();
      if (fullName) return fullName;
      if (value.name) return value.name;
      if (value.title) return value.title;
      if (value.email) return value.email;
      if (value.label) return value.label;
      if (value.id || value._id) return String(value.id || value._id);
      return JSON.stringify(value);
    }

    return String(value);
  };

  const getCellContent = (row, col) => {
    if (col.render) {
      const rendered = col.render(row);
      if (
        rendered === null ||
        rendered === undefined ||
        isValidElement(rendered) ||
        typeof rendered === "string" ||
        typeof rendered === "number" ||
        typeof rendered === "boolean"
      ) {
        return rendered;
      }
      return formatCellValue(rendered);
    }
    return formatCellValue(row[col.key]);
  };

  const hasColumnFilter = (col) => {
    return col.filterable && ((col.filterOptions && col.filterOptions.length > 0) || (col.filterGroups && col.filterGroups.length > 0));
  };

  if (loading) {
    return (
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              {hasSelection && <TableHead className="w-10"><Skeleton className="h-4 w-4" /></TableHead>}
              {columns.map((col) => (
                <TableHead key={String(col.key)}>
                  <Skeleton className="h-4 w-20" />
                </TableHead>
              ))}
              {hasActions && <TableHead className="w-12"><Skeleton className="h-4 w-4" /></TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {[...Array(5)].map((_, i) => (
              <TableRow key={i}>
                {hasSelection && <TableCell><Skeleton className="h-4 w-4" /></TableCell>}
                {columns.map((col) => (
                  <TableCell key={String(col.key)}><Skeleton className="h-4 w-24" /></TableCell>
                ))}
                {hasActions && <TableCell><Skeleton className="h-6 w-6" /></TableCell>}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    );
  }

  return (
    <div className="bg-card border border-border rounded-xl overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/50">
            {hasSelection && (
              <TableHead className="w-10">
                <Checkbox
                  checked={data.length > 0 && selectedRows.length === data.length}
                  onCheckedChange={onSelectAll}
                />
              </TableHead>
            )}
            {columns.map((col, colIndex) => {
              const colKey = String(col.key);
              const activeFilter = columnFilters[colKey];
              return (
                <TableHead key={colKey} className={colIndex % 2 === 1 ? "bg-muted/30" : ""}>
                  <div className="flex items-center gap-1">
                    {col.sortable ? (
                      <button
                        onClick={() => handleSort(colKey)}
                        className="flex items-center font-semibold text-sm hover:text-foreground transition-colors"
                      >
                        {col.label}
                        <span className="ml-1"><SortIcon colKey={colKey} /></span>
                      </button>
                    ) : (
                      <span className="font-semibold text-sm">{col.label}</span>
                    )}
                    {hasColumnFilter(col) && (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <button className={cn(
                            "relative ml-1 p-0.5 rounded hover:bg-accent transition-colors",
                            activeFilter ? "text-primary" : "text-muted-foreground/60 hover:text-muted-foreground"
                          )}>
                            <Filter className="h-3.5 w-3.5" />
                            {activeFilter && (
                              <span className="absolute -top-1 -right-1 flex h-3 w-3 items-center justify-center rounded-full bg-primary">
                                <Check className="h-2 w-2 text-primary-foreground" />
                              </span>
                            )}
                          </button>
                        </DropdownMenuTrigger>
                        <SearchableFilterDropdown
                          column={col}
                          activeFilter={activeFilter}
                          onFilterChange={(value) => onColumnFilterChange?.(colKey, value)}
                        />
                      </DropdownMenu>
                    )}
                  </div>
                </TableHead>
              );
            })}
            {hasActions && <TableHead className="w-12" />}
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.length === 0 ? (
            <TableRow>
              <TableCell colSpan={totalCols} className="text-center py-16">
                <div className="flex flex-col items-center gap-2">
                  <Inbox className="h-10 w-10 text-muted-foreground/50" />
                  <p className="text-base font-medium text-foreground">{emptyMessage}</p>
                  <p className="text-sm text-muted-foreground">{emptyDescription}</p>
                </div>
              </TableCell>
            </TableRow>
          ) : (
            data.map((row) => {
              const rowId = getRowId(row);
              return (
                <TableRow
                  key={rowId}
                  className={cn(
                    "transition-colors",
                    onRowClick && "cursor-pointer",
                    selectedRows.includes(rowId) && "bg-accent/30"
                  )}
                  onClick={() => onRowClick?.(row)}
                >
                  {hasSelection && (
                    <TableCell onClick={(e) => e.stopPropagation()}>
                      <Checkbox
                        checked={selectedRows.includes(rowId)}
                        onCheckedChange={() => onSelectRow?.(rowId)}
                      />
                    </TableCell>
                  )}
                  {columns.map((col) => (
                    <TableCell key={String(col.key)} className="text-sm">
                      {getCellContent(row, col)}
                    </TableCell>
                  ))}
                  {hasActions && (
                    <TableCell onClick={(e) => e.stopPropagation()}>
                      {(() => {
                        const actionsForRow = typeof rowActions === "function" ? rowActions(row) : rowActions;
                        if (!actionsForRow || actionsForRow.length === 0) return null;
                        return (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="bg-popover z-50">
                          {actionsForRow.map((action) => (
                            <DropdownMenuItem
                              key={action.value}
                              onClick={() => onRowAction?.(action.value, row)}
                              className={action.variant === "destructive" ? "text-destructive" : ""}
                            >
                              {action.label}
                            </DropdownMenuItem>
                          ))}
                        </DropdownMenuContent>
                      </DropdownMenu>
                        );
                      })()}
                    </TableCell>
                  )}
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>
    </div>
  );
}
