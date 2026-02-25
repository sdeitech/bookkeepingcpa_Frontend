import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import config from '../../config';

export const tasksApi = createApi({
  reducerPath: 'tasksApi',
  baseQuery: fetchBaseQuery({
    baseUrl: config.api.baseUrl,
    prepareHeaders: (headers, { getState }) => {
      const token = getState().auth?.token || localStorage.getItem('token');
      if (token) {
        headers.set('authorization', `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ["Tasks", "Task", "Profile", "ClientList", "ClientProfile"],
  endpoints: (builder) => ({
    
    createTask: builder.mutation({
      query: (taskData) => ({
        url: '/tasks',
        method: 'POST',
        body: taskData,
      }),
      invalidatesTags: ["Tasks"],
    }),

    getTasks: builder.query({
      query: (params = {}) => {
        const queryString = new URLSearchParams(params).toString();
        return `/tasks?${queryString}`;
      },
      providesTags: ["Tasks"],
    }),

    deleteTask: builder.mutation({
      query: (taskId) => ({
        url: `/tasks/${taskId}`,
        method: "DELETE",
      }),
      invalidatesTags: (result, error, taskId) => ["Tasks", { type: "Task", id: taskId }],
    }),
    updateTask: builder.mutation({
      query: ({ id, body }) => ({
        url: `/tasks/${id}`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: (result, error, { id }) => ["Tasks", { type: "Task", id }],
    }),
    
    
    updateTaskStatus: builder.mutation({
      query: ({ id, status, notes }) => ({
        url: `/tasks/${id}/status`,
        method: "PATCH",
        body: { status, notes },
      }),
      invalidatesTags: (result, error, { id }) => ["Tasks", { type: "Task", id }],
    }),

    getTaskById: builder.query({
      query: (taskId) => `/tasks/${taskId}`,
      providesTags: (result, error, id) => [{ type: "Task", id }],
    }),

    // Upload document to task
    uploadDocument: builder.mutation({
      query: ({ taskId, formData }) => ({
        url: `/tasks/${taskId}/upload`,
        method: 'POST',
        body: formData,
      }),
      invalidatesTags: (result, error, { taskId }) => ['Tasks', { type: "Task", id: taskId }],
    }),

    // Approve task (staff/admin)
    approveTask: builder.mutation({
      query: ({ taskId, reviewNotes }) => ({
        url: `/tasks/${taskId}/approve`,
        method: 'POST',
        body: { reviewNotes },
      }),
      invalidatesTags: (result, error, { taskId }) => ['Tasks', { type: "Task", id: taskId }],
    }),

    // Reject task (staff/admin)
    rejectTask: builder.mutation({
      query: ({ taskId, rejectionReason }) => ({
        url: `/tasks/${taskId}/reject`,
        method: 'POST',
        body: { rejectionReason },
      }),
      invalidatesTags: (result, error, { taskId }) => ['Tasks', { type: "Task", id: taskId }],
    }),

    // Request help (client)
    requestHelp: builder.mutation({
      query: ({ taskId, message }) => ({
        url: `/tasks/${taskId}/help`,
        method: 'POST',
        body: { message },
      }),
      invalidatesTags: (result, error, { taskId }) => ['Tasks', { type: "Task", id: taskId }],
    }),
    


  }),
});

export const {
  useCreateTaskMutation,
  useGetTasksQuery,
  useDeleteTaskMutation,
  useUpdateTaskMutation,
  useUpdateTaskStatusMutation,
  useGetTaskByIdQuery,
  useUploadDocumentMutation,
  useApproveTaskMutation,
  useRejectTaskMutation,
  useRequestHelpMutation,
} = tasksApi;
