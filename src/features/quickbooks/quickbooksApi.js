import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import config from '../../config';

export const quickbooksApi = createApi({
  reducerPath: 'quickbooksApi',
  baseQuery: fetchBaseQuery({
    baseUrl: config.api.baseUrl,
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
        url: '/quickbooks/auth/authorize',
        method: 'GET',
      }),
    }),
    
    getQuickBooksConnectionStatus: builder.query({
      query: (clientId) => ({
        url: '/quickbooks/auth/status',
        params: clientId ? { clientId } : {},
      }),
      providesTags: (result, error, clientId) =>
        clientId ? [{ type: 'QuickBooksStatus', id: clientId }] : ['QuickBooksStatus'],
    }),
    
    refreshQuickBooksToken: builder.mutation({
      query: () => ({
        url: '/quickbooks/auth/refresh',
        method: 'POST',
      }),
      invalidatesTags: ['QuickBooksStatus'],
    }),
    
    disconnectQuickBooks: builder.mutation({
      query: () => ({
        url: '/quickbooks/auth/disconnect',
        method: 'DELETE',
      }),
      invalidatesTags: ['QuickBooksStatus', 'Invoices', 'Customers', 'Expenses', 'Dashboard'],
    }),
    
    // OAuth Callback Handler
    handleQuickBooksCallback: builder.mutation({
      query: (data) => ({
        url: '/quickbooks/auth/callback',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['QuickBooksStatus'],
    }),
    
    // Sync Data
    syncQuickBooksData: builder.mutation({
      query: () => ({
        url: '/quickbooks/sync',
        method: 'POST',
      }),
      invalidatesTags: ['Invoices', 'Customers', 'Expenses', 'Dashboard'],
    }),
    
    // Data Endpoints (supports admin override)
    getQuickBooksInvoices: builder.query({
      query: (params = {}) => ({
        url: '/quickbooks/invoices',
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
        url: '/quickbooks/customers',
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
        url: '/quickbooks/expenses',
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
        url: '/quickbooks/vendors',
        params,
      }),
    }),
    
    getQuickBooksBills: builder.query({
      query: (params = {}) => ({
        url: '/quickbooks/bills',
        params,
      }),
    }),
    
    // Reports (supports admin override)
    getQuickBooksProfitLoss: builder.query({
      query: (params = {}) => ({
        url: '/quickbooks/reports/profit-loss',
        params: {
          ...params,
          ...(params.clientId && { clientId: params.clientId }), // Add clientId for admin override
        },
      }),
    }),
    
    getQuickBooksBalanceSheet: builder.query({
      query: (params = {}) => ({
        url: '/quickbooks/reports/balance-sheet',
        params: {
          ...params,
          ...(params.clientId && { clientId: params.clientId }), // Add clientId for admin override
        },
      }),
    }),
    
    // Dashboard (supports admin override)
    getQuickBooksDashboard: builder.query({
      query: (clientId) => ({
        url: '/quickbooks/dashboard',
        params: clientId ? { clientId } : {},
      }),
      providesTags: (result, error, clientId) =>
        clientId ? [{ type: 'Dashboard', id: clientId }] : ['Dashboard'],
    }),
    
    // Health Check
    getQuickBooksHealth: builder.query({
      query: () => '/quickbooks/health',
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