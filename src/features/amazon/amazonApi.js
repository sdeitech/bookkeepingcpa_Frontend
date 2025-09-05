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

    // Check Amazon connection status
    getAmazonConnectionStatus: builder.query({
      query: () => '/amazon/auth/status',
      providesTags: ['AmazonConnection'],
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

    // Get Amazon orders
    getAmazonOrders: builder.query({
      query: (params = {}) => ({
        url: '/amazon/orders',
        params: {
          createdAfter: params.createdAfter,
          createdBefore: params.createdBefore,
          orderStatuses: params.orderStatuses,
          maxResults: params.maxResults || 50,
        },
      }),
      providesTags: ['AmazonOrders'],
    }),

    // Get Amazon inventory
    getAmazonInventory: builder.query({
      query: (params = {}) => ({
        url: '/amazon/inventory',
        params: {
          marketplaceId: params.marketplaceId,
          skus: params.skus,
        },
      }),
    }),

    // Get Amazon financial events
    getAmazonFinancialEvents: builder.query({
      query: (params = {}) => ({
        url: '/amazon/finance',
        params: {
          postedAfter: params.postedAfter,
          postedBefore: params.postedBefore,
          maxResults: params.maxResults,
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

    // Get Amazon dashboard data
    getAmazonDashboard: builder.query({
      query: () => '/amazon/dashboard',
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