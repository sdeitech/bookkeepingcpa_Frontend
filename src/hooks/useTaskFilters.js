import { useCallback, useMemo, useState } from "react";
import { endOfDay, format, startOfDay } from "date-fns";
import { TASK_PRIORITIES, TASK_STATUSES, Task, TaskPriority, TaskStatus } from "@/lib/task-types";



const DEFAULT_FILTERS = {
  status: "",
  priority: "",
  assignedTo: "",
  client: "",
  dueFrom: "",
  dueTo: "",
};

const formatShortDate = (value) => {
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;
  return format(parsed, "MMM d");
};

export function useTaskFilters(tasks) {
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState(DEFAULT_FILTERS);

  const options = useMemo(() => {
    const assignedTo = [...new Set(tasks.map((task) => task.assignedTo).filter(Boolean))].sort((a, b) =>
      a.localeCompare(b)
    );

    const clients = [...new Set(tasks.map((task) => task.clientName).filter(Boolean))].sort((a, b) =>
      a.localeCompare(b)
    );

    return {
      statuses: TASK_STATUSES,
      priorities: TASK_PRIORITIES,
      assignedTo,
      clients,
    };
  }, [tasks]);

  const setFilter = useCallback((key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  }, []);

  const clearFilter = useCallback((key) => {
    setFilters((prev) => ({ ...prev, [key]: "" }));
  }, []);

  const clearAll = useCallback(() => {
    setFilters(DEFAULT_FILTERS);
  }, []);

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filters.status) count += 1;
    if (filters.priority) count += 1;
    if (filters.assignedTo) count += 1;
    if (filters.client) count += 1;
    if (filters.dueFrom || filters.dueTo) count += 1;
    return count;
  }, [filters]);

  const hasActiveFilters = activeFilterCount > 0;

  const activeChips = useMemo(() => {
    const chips= [];

    if (filters.status) {
      const label = TASK_STATUSES.find((status) => status.value === filters.status)?.label ?? filters.status;
      chips.push({ key: "status", label: `Status: ${label}` });
    }

    if (filters.priority) {
      const label = TASK_PRIORITIES.find((priority) => priority.value === filters.priority)?.label ?? filters.priority;
      chips.push({ key: "priority", label: `Priority: ${label}` });
    }

    if (filters.assignedTo) {
      chips.push({ key: "assignedTo", label: `Assigned To: ${filters.assignedTo}` });
    }

    if (filters.client) {
      chips.push({ key: "client", label: `Client: ${filters.client}` });
    }

    if (filters.dueFrom || filters.dueTo) {
      const from = filters.dueFrom ? formatShortDate(filters.dueFrom) : "Any";
      const to = filters.dueTo ? formatShortDate(filters.dueTo) : "Any";
      chips.push({ key: "dueFrom", label: `Due: ${from} → ${to}` });
    }

    return chips;
  }, [filters]);

  const filterTasks = useCallback(
    (taskList) => {
      const searchQuery = search.trim().toLowerCase();

      return taskList.filter((task) => {
        if (searchQuery) {
          const matchesSearch =
            task.title.toLowerCase().includes(searchQuery) ||
            task.clientName.toLowerCase().includes(searchQuery) ||
            task.assignedTo.toLowerCase().includes(searchQuery);

          if (!matchesSearch) return false;
        }

        if (filters.status && task.status !== filters.status) {
          return false;
        }

        if (filters.priority && task.priority !== filters.priority) {
          return false;
        }

        if (filters.assignedTo && !task.assignedTo.toLowerCase().includes(filters.assignedTo.toLowerCase())) {
          return false;
        }

        if (filters.client && task.clientName.toLowerCase() !== filters.client.toLowerCase()) {
          return false;
        }

        const dueTime = new Date(task.dueDate).getTime();

        if (filters.dueFrom) {
          const fromTime = startOfDay(new Date(filters.dueFrom)).getTime();
          if (!Number.isNaN(fromTime) && dueTime < fromTime) {
            return false;
          }
        }

        if (filters.dueTo) {
          const toTime = endOfDay(new Date(filters.dueTo)).getTime();
          if (!Number.isNaN(toTime) && dueTime > toTime) {
            return false;
          }
        }

        return true;
      });
    },
    [filters, search]
  );

  return {
    search,
    setSearch,
    filters,
    options,
    setFilter,
    clearFilter,
    clearAll,
    activeFilterCount,
    hasActiveFilters,
    activeChips,
    filterTasks,
  };
}
