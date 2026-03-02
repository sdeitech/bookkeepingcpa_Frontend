import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import config from '../../config';

export const messageApi = createApi({
  reducerPath: 'messageApi',
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
  tagTypes: ['Message'],
  endpoints: (builder) => ({
    // Get messages for a task
    getTaskMessages: builder.query({
      query: ({ taskId, page = 1, limit = 10 }) =>
        `/tasks/${taskId}/messages?page=${page}&limit=${limit}`,
      providesTags: (result, error, { taskId }) => [{ type: 'Message', id: taskId }]
    }),

    // Send a message
    sendMessage: builder.mutation({
      query: ({ taskId, message }) => ({
        url: `/tasks/${taskId}/messages`,
        method: 'POST',
        body: { message }
      }),
      invalidatesTags: (result, error, { taskId }) => [{ type: 'Message', id: taskId }]
    }),

    // Get unread message count
    getUnreadMessageCount: builder.query({
      query: () => '/messages/unread-count',
      providesTags: ['Message']
    }),

    // Mark task messages as read
    markTaskMessagesAsRead: builder.mutation({
      query: (taskId) => ({
        url: `/tasks/${taskId}/messages/mark-read`,
        method: 'PATCH'
      }),
      invalidatesTags: ['Message']
    })
  })
});

export const {
  useGetTaskMessagesQuery,
  useSendMessageMutation,
  useGetUnreadMessageCountQuery,
  useMarkTaskMessagesAsReadMutation
} = messageApi;
