/**
 * Notification API - RTK Query for MongoDB + Polling
 * Handles all notification-related API calls
 */

import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import config from '../../config';

export const notificationApi = createApi({
    reducerPath: 'notificationApi',
    baseQuery: fetchBaseQuery({
        baseUrl: config.api.baseUrl,
        timeout: config.api.timeout,
        credentials: 'include',
        prepareHeaders: (headers, { getState }) => {
            const token = getState().auth.token || localStorage.getItem('token');
            if (token) {
                headers.set('authorization', `Bearer ${token}`);
            }
            return headers;
        },
    }),
    tagTypes: ['Notification', 'UnreadCount', 'Preferences'],
    endpoints: (builder) => ({
        // Get single notification by ID with unread count
        getNotificationById: builder.query({
            query: (notificationId) => `/notifications/${notificationId}`,
            providesTags: (result, error, id) => [{ type: 'Notification', id }, 'UnreadCount'],
            transformResponse: (response) => {
                // Handle combined response with notification and unreadCount
                if (response.data && response.data.notification) {
                    return {
                        notification: response.data.notification,
                        unreadCount: response.data.unreadCount
                    };
                }
                // Fallback for old format
                return { notification: response.data, unreadCount: null };
            }
        }),

        // Get all notifications with pagination
        getNotifications: builder.query({
            query: ({ page = 1, limit = 20, unreadOnly = false, type, priority, category, lastCheck }) => ({
                url: '/notifications',
                params: {
                    page,
                    limit,
                    unreadOnly,
                    type,
                    priority,
                    category,
                    lastCheck
                }
            }),
            providesTags: (result) =>
                result
                    ? [
                        ...result.data.notifications.map(({ _id }) => ({ type: 'Notification', id: _id })),
                        { type: 'Notification', id: 'LIST' },
                        'UnreadCount'
                    ]
                    : [{ type: 'Notification', id: 'LIST' }, 'UnreadCount']
        }),

        // Poll for notification updates (efficient polling)
        pollNotifications: builder.query({
            query: (lastCheck) => ({
                url: '/notifications/poll',
                params: { lastCheck }
            }),
            providesTags: ['UnreadCount']
        }),

        // Get unread notification count
        getUnreadCount: builder.query({
            query: () => '/notifications/unread-count',
            providesTags: ['UnreadCount'],
            transformResponse: (response) => response.data.count
        }),

        // Create a new notification
        createNotification: builder.mutation({
            query: (notificationData) => ({
                url: '/notifications',
                method: 'POST',
                body: notificationData
            }),
            invalidatesTags: [{ type: 'Notification', id: 'LIST' }, 'UnreadCount']
        }),

        // Mark notification as read
        markAsRead: builder.mutation({
            query: (notificationId) => ({
                url: `/notifications/${notificationId}/read`,
                method: 'PUT'
            }),
            invalidatesTags: (result, error, id) => [
                { type: 'Notification', id },
                'UnreadCount'
            ]
            // Removed optimistic update - handled by Redux slice instead
            // This prevents double updates and state synchronization issues
        }),

        // Mark all notifications as read
        markAllAsRead: builder.mutation({
            query: () => ({
                url: '/notifications/read-all',
                method: 'PUT'
            }),
            invalidatesTags: [{ type: 'Notification', id: 'LIST' }, 'UnreadCount'],
            // Optimistic update
            async onQueryStarted(arg, { dispatch, queryFulfilled }) {
                const patchResult = dispatch(
                    notificationApi.util.updateQueryData('getNotifications', undefined, (draft) => {
                        draft.data.notifications.forEach(notification => {
                            if (!notification.isRead) {
                                notification.isRead = true;
                                notification.readAt = new Date().toISOString();
                            }
                        });
                        draft.data.unreadCount = 0;
                    })
                );
                try {
                    await queryFulfilled;
                } catch {
                    patchResult.undo();
                }
            }
        }),

        // Delete a notification
        deleteNotification: builder.mutation({
            query: (notificationId) => ({
                url: `/notifications/${notificationId}`,
                method: 'DELETE'
            }),
            invalidatesTags: (result, error, id) => [
                { type: 'Notification', id },
                { type: 'Notification', id: 'LIST' },
                'UnreadCount'
            ]
        }),

        // Broadcast notification (admin only)
        broadcastNotification: builder.mutation({
            query: (broadcastData) => ({
                url: '/notifications/broadcast',
                method: 'POST',
                body: broadcastData
            }),
            invalidatesTags: [{ type: 'Notification', id: 'LIST' }]
        }),

        // Get notification preferences
        getNotificationPreferences: builder.query({
            query: () => '/notifications/preferences',
            providesTags: ['Preferences'],
            transformResponse: (response) => response.data
        }),

        // Update notification preferences
        updateNotificationPreferences: builder.mutation({
            query: (preferences) => ({
                url: '/notifications/preferences',
                method: 'PUT',
                body: preferences
            }),
            invalidatesTags: ['Preferences']
        }),

        // Send test notification
        sendTestNotification: builder.mutation({
            query: (channels = ['inApp']) => ({
                url: '/notifications/test',
                method: 'POST',
                body: { channels }
            }),
            invalidatesTags: [{ type: 'Notification', id: 'LIST' }, 'UnreadCount']
        }),

        // Get notification statistics (admin only)
        getNotificationStats: builder.query({
            query: () => '/notifications/stats',
            transformResponse: (response) => response.data
        })
    })
});

// Export hooks for usage in functional components
export const {
    useGetNotificationByIdQuery,
    useLazyGetNotificationByIdQuery,
    useGetNotificationsQuery,
    usePollNotificationsQuery,
    useGetUnreadCountQuery,
    useCreateNotificationMutation,
    useMarkAsReadMutation,
    useMarkAllAsReadMutation,
    useDeleteNotificationMutation,
    useBroadcastNotificationMutation,
    useGetNotificationPreferencesQuery,
    useUpdateNotificationPreferencesMutation,
    useSendTestNotificationMutation,
    useGetNotificationStatsQuery
} = notificationApi;

// Polling hook for notifications
export const useNotificationPolling = (enabled = true, pollingInterval = 10000) => {
    const [lastCheck, setLastCheck] = React.useState(new Date().toISOString());

    const { data, error, isLoading } = usePollNotificationsQuery(lastCheck, {
        pollingInterval: enabled ? pollingInterval : 0,
        skip: !enabled
    });

    React.useEffect(() => {
        if (data?.timestamp) {
            setLastCheck(data.timestamp);
        }
    }, [data]);

    return { data, error, isLoading };
};