import { useState, useEffect, useCallback } from "react";
import { MOCK_TASKS } from "@/lib/task-types";
const STORAGE_KEY = "plutify_tasks";
function useTasks() {
  const [tasks, setTasks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        setTasks(JSON.parse(stored));
      } catch {
        setTasks(MOCK_TASKS);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(MOCK_TASKS));
      }
    } else {
      setTasks(MOCK_TASKS);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(MOCK_TASKS));
    }
    setIsLoading(false);
  }, []);
  const persist = useCallback((updated) => {
    setTasks(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  }, []);
  const createTask = useCallback((task) => {
    const now = (/* @__PURE__ */ new Date()).toISOString();
    const newTask = {
      ...task,
      id: `t_${Date.now()}`,
      createdAt: now,
      updatedAt: now
    };
    persist([newTask, ...tasks]);
    return newTask;
  }, [tasks, persist]);
  const updateTask = useCallback((id, updates) => {
    persist(tasks.map((t) => t.id === id ? { ...t, ...updates, updatedAt: (/* @__PURE__ */ new Date()).toISOString() } : t));
  }, [tasks, persist]);
  const deleteTask = useCallback((id) => {
    persist(tasks.filter((t) => t.id !== id));
  }, [tasks, persist]);
  const deleteTasks = useCallback((ids) => {
    persist(tasks.filter((t) => !ids.includes(t.id)));
  }, [tasks, persist]);
  const reassignTasks = useCallback((ids, assignedTo) => {
    persist(tasks.map((t) => ids.includes(t.id) ? { ...t, assignedTo, updatedAt: (/* @__PURE__ */ new Date()).toISOString() } : t));
  }, [tasks, persist]);
  return { tasks, isLoading, createTask, updateTask, deleteTask, deleteTasks, reassignTasks };
}
export {
  useTasks
};
