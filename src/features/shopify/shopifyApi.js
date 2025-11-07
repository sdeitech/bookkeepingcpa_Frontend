import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import config from '../../config';

export const shopifyApi = createApi({
  reducerPath: 'shopifyApi',
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
  tagTypes: ['ShopifyConnection', 'ShopifyOrders', 'ShopifyHealth'],
  endpoints: (builder) => ({
    // Get authorization URL to start OAuth flow
    getShopifyAuthUrl: builder.query({
      query: (shop) => ({
        url: '/shopify/auth/authorize',
        params: { shop },
      }),
    }),

    // Check Shopify connection status (supports admin override)
    getShopifyConnectionStatus: builder.query({
      query: (clientId) => ({
        url: '/shopify/auth/status',
        params: clientId ? { clientId } : {},
      }),
      providesTags: (result, error, clientId) =>
        clientId ? [{ type: 'ShopifyConnection', id: clientId }] : ['ShopifyConnection'],
    }),

    // Disconnect Shopify store
    disconnectShopify: builder.mutation({
      query: () => ({
        url: '/shopify/auth/disconnect',
        method: 'DELETE',
      }),
      invalidatesTags: ['ShopifyConnection', 'ShopifyOrders'],
    }),

    // Get Shopify orders (supports admin override)
    getShopifyOrders: builder.query({
      query: (params = {}) => ({
        url: '/shopify/orders',
        params: {
          status: params.status || 'any',
          limit: params.limit || 50,
          createdAfter: params.createdAfter,
          createdBefore: params.createdBefore,
          fields: params.fields,
          page_info: params.page_info,
          ...(params.clientId && { clientId: params.clientId }), // Add clientId for admin override
        },
      }),
      providesTags: (result, error, params) =>
        params?.clientId ? [{ type: 'ShopifyOrders', id: params.clientId }] : ['ShopifyOrders'],
      // Transform response to handle errors gracefully
      transformResponse: (response) => {
        if (response.success === false) {
          throw new Error(response.message || 'Failed to fetch orders');
        }
        return response;
      },
    }),

    // Health check endpoint
    getShopifyHealth: builder.query({
      query: () => '/shopify/health',
      providesTags: ['ShopifyHealth'],
    }),
  }),
});

// Export hooks for usage in components
export const {
  useGetShopifyAuthUrlQuery,
  useGetShopifyConnectionStatusQuery,
  useDisconnectShopifyMutation,
  useGetShopifyOrdersQuery,
  useGetShopifyHealthQuery,
  useLazyGetShopifyAuthUrlQuery,
  useLazyGetShopifyOrdersQuery,
} = shopifyApi;