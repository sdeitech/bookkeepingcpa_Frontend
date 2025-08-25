import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

/**
 * Amazon Sandbox API Slice
 * Separate RTK Query slice for sandbox testing
 * Keeps production API untouched
 */
export const amazonSandboxApi = createApi({
  reducerPath: 'amazonSandboxApi',
  baseQuery: fetchBaseQuery({
    baseUrl: 'http://localhost:8080/api',
    prepareHeaders: (headers, { getState }) => {
      const token = getState().auth?.token || localStorage.getItem('token');
      if (token) {
        headers.set('authorization', `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ['SandboxStatus', 'SandboxOrders', 'SandboxInventory'],
  endpoints: (builder) => ({
    // Initialize sandbox mode
    initializeSandbox: builder.mutation({
      query: (data = {}) => ({
        url: '/amazon/sandbox/initialize',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['SandboxStatus'],
    }),

    // Get sandbox status
    getSandboxStatus: builder.query({
      query: () => '/amazon/sandbox/status',
      providesTags: ['SandboxStatus'],
    }),

    // Test sandbox connection
    testSandboxConnection: builder.query({
      query: () => '/amazon/sandbox/test',
    }),

    // Reset sandbox
    resetSandbox: builder.mutation({
      query: () => ({
        url: '/amazon/sandbox/reset',
        method: 'DELETE',
      }),
      invalidatesTags: ['SandboxStatus', 'SandboxOrders', 'SandboxInventory'],
    }),

    // Get sandbox orders
    getSandboxOrders: builder.query({
      query: (params = {}) => ({
        url: '/amazon/sandbox/orders',
        params: {
          marketplaceId: params.marketplaceId,
          createdAfter: params.createdAfter || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
          createdBefore: params.createdBefore,
          orderStatuses: params.orderStatuses,
          maxResults: params.maxResults || 20,
        },
      }),
      providesTags: ['SandboxOrders'],
    }),

    // Get sandbox inventory
    getSandboxInventory: builder.query({
      query: (params = {}) => ({
        url: '/amazon/sandbox/inventory',
        params: {
          marketplaceId: params.marketplaceId,
          skus: params.skus,
        },
      }),
      providesTags: ['SandboxInventory'],
    }),
  }),
});

// Export hooks for usage in functional components
export const {
  useInitializeSandboxMutation,
  useGetSandboxStatusQuery,
  useTestSandboxConnectionQuery,
  useResetSandboxMutation,
  useGetSandboxOrdersQuery,
  useGetSandboxInventoryQuery,
  useLazyGetSandboxOrdersQuery,
  useLazyGetSandboxInventoryQuery,
  useLazyTestSandboxConnectionQuery,
} = amazonSandboxApi;

// Export endpoints for use in async thunks
export const { endpoints: sandboxEndpoints } = amazonSandboxApi;