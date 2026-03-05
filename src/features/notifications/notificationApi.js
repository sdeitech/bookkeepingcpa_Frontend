import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import config from '../../config';

export const notificationApi = createApi({
  reducerPath: 'notificationApi',
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
  tagTypes: ['Notification'],
  endpoints: (builder) => ({
    // Get notifications
    getNotifications: builder.query({
      query: ({ page = 1, limit = 20, unreadOnly = false }) => 
        `/notifications?page=${page}&limit=${limit}&unreadOnly=${unreadOnly}`,
      providesTags: ['Notification']
    }),

    // Get notification by id (used by realtime listener)
    getNotificationById: builder.query({
      query: (notificationId) => `/notifications/${notificationId}`,
      providesTags: ['Notification']
    }),

    // Get unread count
    getUnreadCount: builder.query({
      query: () => '/notifications/unread-count',
      providesTags: ['Notification']
    }),

    // Get notification by ID
    getNotificationById: builder.query({
      query: (notificationId) => `/notifications/${notificationId}`,
      providesTags: (result, error, id) => [{ type: 'Notification', id }]
    }),

    // Mark as read
    markAsRead: builder.mutation({
      query: (notificationId) => ({
        url: `/notifications/${notificationId}/read`,
        method: 'PATCH'
      }),
      invalidatesTags: ['Notification']
    }),

    // Mark all as read
    markAllAsRead: builder.mutation({
      query: () => ({
        url: '/notifications/mark-all-read',
        method: 'PATCH'
      }),
      invalidatesTags: ['Notification']
    }),

    // Delete notification
    deleteNotification: builder.mutation({
      query: (notificationId) => ({
        url: `/notifications/${notificationId}`,
        method: 'DELETE'
      }),
      invalidatesTags: ['Notification']
    })
  })
});

export const {
  useGetNotificationsQuery,
  useGetNotificationByIdQuery,
  useGetUnreadCountQuery,
  useGetNotificationByIdQuery,
  useMarkAsReadMutation,
  useMarkAllAsReadMutation,
  useDeleteNotificationMutation
} = notificationApi;

export default notificationApi;
