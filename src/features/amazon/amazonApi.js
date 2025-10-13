import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import config from '../../config';

export const amazonApi = createApi({
  reducerPath: 'amazonApi',
  baseQuery: fetchBaseQuery({
    baseUrl: config.api.baseUrl,
    prepareHeaders: (headers, { getState }) => {
      const token = getState().auth.token || localStorage.getItem('token');
      if (token) {
        headers.set('authorization', `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ['AmazonConnection', 'AmazonOrders'],
  endpoints: (builder) => ({
    // Get authorization URL to start OAuth flow
    getAmazonAuthUrl: builder.query({
      query: () => '/amazon/auth/authorize',
    }),

    // Handle OAuth callback
    handleAmazonCallback: builder.mutation({
      query: ({ code, state }) => ({
        url: '/amazon/auth/callback',
        method: 'POST',
        body: { code, state },
      }),
      invalidatesTags: ['AmazonConnection'],
    }),

    // Check Amazon connection status (supports admin override)
    getAmazonConnectionStatus: builder.query({
      query: (clientId) => ({
        url: '/amazon/auth/status',
        params: clientId ? { clientId } : {},
      }),
      providesTags: (result, error, clientId) =>
        clientId ? [{ type: 'AmazonConnection', id: clientId }] : ['AmazonConnection'],
    }),

    // Disconnect Amazon account
    disconnectAmazon: builder.mutation({
      query: () => ({
        url: '/amazon/auth/disconnect',
        method: 'DELETE',
      }),
      invalidatesTags: ['AmazonConnection', 'AmazonOrders'],
    }),

    // Refresh Amazon token
    refreshAmazonToken: builder.mutation({
      query: () => ({
        url: '/amazon/auth/refresh',
        method: 'POST',
      }),
      invalidatesTags: ['AmazonConnection'],
    }),

    // Get Amazon orders (supports admin override)
    getAmazonOrders: builder.query({
      query: (params = {}) => ({
        url: '/amazon/orders',
        params: {
          createdAfter: params.createdAfter,
          createdBefore: params.createdBefore,
          orderStatuses: params.orderStatuses,
          maxResults: params.maxResults || 50,
          ...(params.clientId && { clientId: params.clientId }), // Add clientId for admin override
        },
      }),
      providesTags: (result, error, params) =>
        params?.clientId ? [{ type: 'AmazonOrders', id: params.clientId }] : ['AmazonOrders'],
    }),

    // Get Amazon inventory (supports admin override)
    getAmazonInventory: builder.query({
      query: (params = {}) => ({
        url: '/amazon/inventory',
        params: {
          marketplaceId: params.marketplaceId,
          skus: params.skus,
          ...(params.clientId && { clientId: params.clientId }), // Add clientId for admin override
        },
      }),
    }),

    // Get Amazon financial events (supports admin override)
    getAmazonFinancialEvents: builder.query({
      query: (params = {}) => ({
        url: '/amazon/finance',
        params: {
          postedAfter: params.postedAfter,
          postedBefore: params.postedBefore,
          maxResults: params.maxResults,
          ...(params.clientId && { clientId: params.clientId }), // Add clientId for admin override
        },
      }),
    }),

    // Create Amazon report
    createAmazonReport: builder.mutation({
      query: ({ reportType, dataStartTime, dataEndTime }) => ({
        url: '/amazon/reports',
        method: 'POST',
        body: {
          reportType,
          dataStartTime,
          dataEndTime,
        },
      }),
    }),

    // Get Amazon dashboard data (supports admin override)
    getAmazonDashboard: builder.query({
      query: (clientId) => ({
        url: '/amazon/dashboard',
        params: clientId ? { clientId } : {},
      }),
    }),
  }),
});

// Export hooks for usage in components
export const {
  useGetAmazonAuthUrlQuery,
  useHandleAmazonCallbackMutation,
  useGetAmazonConnectionStatusQuery,
  useDisconnectAmazonMutation,
  useRefreshAmazonTokenMutation,
  useGetAmazonOrdersQuery,
  useGetAmazonInventoryQuery,
  useGetAmazonFinancialEventsQuery,
  useCreateAmazonReportMutation,
  useGetAmazonDashboardQuery,
  useLazyGetAmazonAuthUrlQuery,
  useLazyGetAmazonOrdersQuery,
} = amazonApi;