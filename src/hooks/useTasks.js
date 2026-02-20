/**
 * TEMPORARY WRAPPER HOOK
 * This is a thin wrapper around RTK Query to prevent breaking existing components.
 * Components should be migrated to use RTK Query directly.
 * 
 * TODO: Migrate all components to use RTK Query hooks directly and delete this file.
 */

import { useGetTasksQuery, useCreateTaskMutation, useUpdateTaskMutation, useDeleteTaskMutation, useUpdateTaskStatusMutation } from '@/features/tasks/tasksApi';
import { useCallback } from 'react';

export function useTasks() {
  // Fetch tasks from API
  const { data, isLoading, error } = useGetTasksQuery();
  
  // Mutations
  const [createTaskMutation] = useCreateTaskMutation();
  const [updateTaskMutation] = useUpdateTaskMutation();
  const [deleteTaskMutation] = useDeleteTaskMutation();
  const [updateStatusMutation] = useUpdateTaskStatusMutation();

  // Extract tasks from response
  const tasks = data?.data?.tasks || [];

  // Wrapper functions to match old API
  const createTask = useCallback(async (taskData) => {
    try {
      const result = await createTaskMutation(taskData).unwrap();
      return result.data;
    } catch (error) {
      console.error('Failed to create task:', error);
      throw error;
    }
  }, [createTaskMutation]);

  const updateTask = useCallback(async (id, updates) => {
    try {
      const result = await updateTaskMutation({ id, body: updates }).unwrap();
      return result.data;
    } catch (error) {
      console.error('Failed to update task:', error);
      throw error;
    }
  }, [updateTaskMutation]);

  const deleteTask = useCallback(async (id) => {
    try {
      await deleteTaskMutation(id).unwrap();
    } catch (error) {
      console.error('Failed to delete task:', error);
      throw error;
    }
  }, [deleteTaskMutation]);

  const deleteTasks = useCallback(async (ids) => {
    try {
      // Delete multiple tasks sequentially
      await Promise.all(ids.map(id => deleteTaskMutation(id).unwrap()));
    } catch (error) {
      console.error('Failed to delete tasks:', error);
      throw error;
    }
  }, [deleteTaskMutation]);

  const reassignTasks = useCallback(async (ids, assignedTo) => {
    try {
      // Update multiple tasks sequentially
      await Promise.all(
        ids.map(id => updateTaskMutation({ 
          id, 
          body: { assignedTo } 
        }).unwrap())
      );
    } catch (error) {
      console.error('Failed to reassign tasks:', error);
      throw error;
    }
  }, [updateTaskMutation]);

  return {
    tasks,
    isLoading,
    error,
    createTask,
    updateTask,
    deleteTask,
    deleteTasks,
    reassignTasks,
  };
}
