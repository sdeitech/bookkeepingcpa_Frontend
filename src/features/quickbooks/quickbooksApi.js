import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

const getBaseUrl = () => {
  if (process.env.NODE_ENV === 'production') {
    return process.env.REACT_APP_API_URL || 'https://api.yourdomain.com';
  }
  return 'http://localhost:8080';
};

export const quickbooksApi = createApi({
  reducerPath: 'quickbooksApi',
  baseQuery: fetchBaseQuery({
    baseUrl: getBaseUrl(),
    prepareHeaders: (headers) => {
      const token = localStorage.getItem('token');
      if (token) {
        headers.set('authorization', `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ['QuickBooksStatus', 'Invoices', 'Customers', 'Expenses', 'Dashboard'],
  endpoints: (builder) => ({
    // Auth & Connection Management
    getQuickBooksAuthUrl: builder.mutation({
      query: () => ({
        url: '/api/quickbooks/auth/authorize',
        method: 'GET',
      }),
    }),
    
    getQuickBooksConnectionStatus: builder.query({
      query: (clientId) => ({
        url: '/api/quickbooks/auth/status',
        params: clientId ? { clientId } : {},
      }),
      providesTags: (result, error, clientId) =>
        clientId ? [{ type: 'QuickBooksStatus', id: clientId }] : ['QuickBooksStatus'],
    }),
    
    refreshQuickBooksToken: builder.mutation({
      query: () => ({
        url: '/api/quickbooks/auth/refresh',
        method: 'POST',
      }),
      invalidatesTags: ['QuickBooksStatus'],
    }),
    
    disconnectQuickBooks: builder.mutation({
      query: () => ({
        url: '/api/quickbooks/auth/disconnect',
        method: 'DELETE',
      }),
      invalidatesTags: ['QuickBooksStatus', 'Invoices', 'Customers', 'Expenses', 'Dashboard'],
    }),
    
    // OAuth Callback Handler
    handleQuickBooksCallback: builder.mutation({
      query: (data) => ({
        url: '/api/quickbooks/auth/callback',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['QuickBooksStatus'],
    }),
    
    // Sync Data
    syncQuickBooksData: builder.mutation({
      query: () => ({
        url: '/api/quickbooks/sync',
        method: 'POST',
      }),
      invalidatesTags: ['Invoices', 'Customers', 'Expenses', 'Dashboard'],
    }),
    
    // Data Endpoints (supports admin override)
    getQuickBooksInvoices: builder.query({
      query: (params = {}) => ({
        url: '/api/quickbooks/invoices',
        params: {
          ...params,
          ...(params.clientId && { clientId: params.clientId }), // Add clientId for admin override
        },
      }),
      providesTags: (result, error, params) =>
        params?.clientId ? [{ type: 'Invoices', id: params.clientId }] : ['Invoices'],
    }),
    
    getQuickBooksCustomers: builder.query({
      query: (params = {}) => ({
        url: '/api/quickbooks/customers',
        params: {
          ...params,
          ...(params.clientId && { clientId: params.clientId }), // Add clientId for admin override
        },
      }),
      providesTags: (result, error, params) =>
        params?.clientId ? [{ type: 'Customers', id: params.clientId }] : ['Customers'],
    }),
    
    getQuickBooksExpenses: builder.query({
      query: (params = {}) => ({
        url: '/api/quickbooks/expenses',
        params: {
          ...params,
          ...(params.clientId && { clientId: params.clientId }), // Add clientId for admin override
        },
      }),
      providesTags: (result, error, params) =>
        params?.clientId ? [{ type: 'Expenses', id: params.clientId }] : ['Expenses'],
    }),
    
    getQuickBooksVendors: builder.query({
      query: (params = {}) => ({
        url: '/api/quickbooks/vendors',
        params,
      }),
    }),
    
    getQuickBooksBills: builder.query({
      query: (params = {}) => ({
        url: '/api/quickbooks/bills',
        params,
      }),
    }),
    
    // Reports (supports admin override)
    getQuickBooksProfitLoss: builder.query({
      query: (params = {}) => ({
        url: '/api/quickbooks/reports/profit-loss',
        params: {
          ...params,
          ...(params.clientId && { clientId: params.clientId }), // Add clientId for admin override
        },
      }),
    }),
    
    getQuickBooksBalanceSheet: builder.query({
      query: (params = {}) => ({
        url: '/api/quickbooks/reports/balance-sheet',
        params: {
          ...params,
          ...(params.clientId && { clientId: params.clientId }), // Add clientId for admin override
        },
      }),
    }),
    
    // Dashboard (supports admin override)
    getQuickBooksDashboard: builder.query({
      query: (clientId) => ({
        url: '/api/quickbooks/dashboard',
        params: clientId ? { clientId } : {},
      }),
      providesTags: (result, error, clientId) =>
        clientId ? [{ type: 'Dashboard', id: clientId }] : ['Dashboard'],
    }),
    
    // Health Check
    getQuickBooksHealth: builder.query({
      query: () => '/api/quickbooks/health',
    }),
  }),
});

export const {
  // Auth & Connection
  useGetQuickBooksAuthUrlMutation,
  useLazyGetQuickBooksAuthUrlQuery,
  useGetQuickBooksConnectionStatusQuery,
  useRefreshQuickBooksTokenMutation,
  useDisconnectQuickBooksMutation,
  useHandleQuickBooksCallbackMutation,
  useSyncQuickBooksDataMutation,
  
  // Data
  useGetQuickBooksInvoicesQuery,
  useLazyGetQuickBooksInvoicesQuery,
  useGetQuickBooksCustomersQuery,
  useLazyGetQuickBooksCustomersQuery,
  useGetQuickBooksExpensesQuery,
  useLazyGetQuickBooksExpensesQuery,
  useGetQuickBooksVendorsQuery,
  useGetQuickBooksBillsQuery,
  
  // Reports
  useGetQuickBooksProfitLossQuery,
  useLazyGetQuickBooksProfitLossQuery,
  useGetQuickBooksBalanceSheetQuery,
  useLazyGetQuickBooksBalanceSheetQuery,
  
  // Dashboard
  useGetQuickBooksDashboardQuery,
  
  // Health
  useGetQuickBooksHealthQuery,
} = quickbooksApi;