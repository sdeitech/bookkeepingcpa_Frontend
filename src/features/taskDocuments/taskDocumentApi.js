import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import config from '../../config';

export const taskDocumentApi = createApi({
  reducerPath: 'taskDocumentApi',
  baseQuery: fetchBaseQuery({
    baseUrl: config.api.baseUrl,
    prepareHeaders: (headers) => {
      const token = localStorage.getItem('token');
      if (token) {
        headers.set('Authorization', `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ['TaskDocument', 'Task'],
  endpoints: (builder) => ({
    // Get documents for a task
    getTaskDocuments: builder.query({
      query: (taskId) => `/task-documents/task/${taskId}`,
      providesTags: (result, error, taskId) => [
        { type: 'TaskDocument', id: taskId }
      ]
    }),

    getTaskDocumentUrl: builder.query({
      query: (documentId) => ({
        url: `/documents/${documentId}/url`,
        method: "GET",
      }),
    }),
    // Approve document or undo approval
    approveDocument: builder.mutation({
      query: ({ documentId, reviewNotes, undo = false }) => ({
        url: `/task-documents/${documentId}/approve`,
        method: 'PATCH',
        body: { reviewNotes, undo }
      }),
      invalidatesTags: (result, error, { documentId }) => [
        { type: 'TaskDocument', id: result?.data?.taskId },
        { type: 'Task', id: result?.data?.taskId }
      ]
    }),

    // Reject document or undo rejection
    rejectDocument: builder.mutation({
      query: ({ documentId, rejectionReason, undo = false }) => ({
        url: `/task-documents/${documentId}/reject`,
        method: 'PATCH',
        body: { rejectionReason, undo }
      }),
      invalidatesTags: (result, error, { documentId }) => [
        { type: 'TaskDocument', id: result?.data?.taskId },
        { type: 'Task', id: result?.data?.taskId }
      ]
    }),

    // Delete document
    deleteDocument: builder.mutation({
      query: (documentId) => ({
        url: `/task-documents/${documentId}`,
        method: 'DELETE'
      }),
      invalidatesTags: (result, error, documentId) => [
        { type: 'TaskDocument' }
      ]
    }),
  })
});

export const {
  useGetTaskDocumentsQuery,
  useApproveDocumentMutation,
  useRejectDocumentMutation,
  useDeleteDocumentMutation,
  useGetTaskDocumentUrlQuery,
  useLazyGetTaskDocumentUrlQuery,
} = taskDocumentApi;
