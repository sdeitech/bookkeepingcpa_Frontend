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
  tagTypes: ["Tasks", "Profile", "ClientList", "ClientProfile"],
  endpoints: (builder) => ({
    
    createTask: builder.mutation({
      query: (taskData) => ({
        url: '/tasks',
        method: 'POST',
        body: taskData,
      }),
    //   invalidatesTags: ['Profile'],
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
      invalidatesTags: ["Tasks"],
    }),
    updateTask: builder.mutation({
      query: ({ id, body }) => ({
        url: `/tasks/${id}`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: ["Tasks"],
    }),
    
    
    updateTaskStatus: builder.mutation({
      query: ({ id, status, notes }) => ({
        url: `/tasks/${id}/status`,
        method: "PATCH",
        body: { status, notes },
      }),
      invalidatesTags: ["Tasks"],
    }),

    getTaskById: builder.query({
      query: (taskId) => `/tasks/${taskId}`,
      providesTags: (result, error, id) => [{ type: "Task", id }],
    }),
    


  }),
});

export const {
  useCreateTaskMutation,
  useGetTasksQuery,
  useDeleteTaskMutation,
  useUpdateTaskMutation,
  useUpdateTaskStatusMutation,
} = tasksApi;