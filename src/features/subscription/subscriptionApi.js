import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { logout } from '../auth/authSlice';

// Custom base query that handles 401 errors
const baseQueryWithReauth = async (args, api, extraOptions) => {
  // Get token from auth state
  const authState = api.getState().auth;
  const token = authState?.token;
  
  // Prepare the request with token
  const baseQuery = fetchBaseQuery({
    baseUrl: 'http://localhost:8080/api',
    prepareHeaders: (headers) => {
      if (token) {
        // Ensure token doesn't have quotes or extra characters
        const cleanToken = token.replace(/^["']|["']$/g, '');
        headers.set('authorization', `Bearer ${cleanToken}`);
      }
      headers.set('Content-Type', 'application/json');
      return headers;
    },
  });
  
  // Make the request
  let result = await baseQuery(args, api, extraOptions);
  
  // Handle 401 errors - token expired or invalid
  if (result.error && result.error.status === 401) {
    console.log('[Auth] Token expired or invalid, logging out...');
    
    // Dispatch logout action to clear Redux state and localStorage
    api.dispatch(logout());
    
    // Redirect to login page with expiration message
    window.location.href = '/login?message=Session expired. Please login again.';
  }
  
  return result;
};

// Define the subscription API using RTK Query
export const subscriptionApi = createApi({
  reducerPath: 'subscriptionApi',
  baseQuery: baseQueryWithReauth,
  tagTypes: ['SubscriptionPlan', 'UserSubscription', 'Transaction', 'BillingInfo'],
  endpoints: (builder) => ({
    // Subscription Plans Endpoints
    getSubscriptionPlans: builder.query({
      query: () => '/stripe/subscription-plans',
      providesTags: ['SubscriptionPlan'],
    }),

    getSubscriptionPlanById: builder.query({
      query: (id) => `/stripe/subscription-plans/${id}`,
      providesTags: (result, error, id) => [{ type: 'SubscriptionPlan', id }],
    }),

    createSubscriptionPlan: builder.mutation({
      query: (planData) => ({
        url: '/stripe/subscription-plans',
        method: 'POST',
        body: planData,
      }),
      invalidatesTags: ['SubscriptionPlan'],
    }),

    updateSubscriptionPlan: builder.mutation({
      query: ({ id, ...planData }) => ({
        url: `/stripe/subscription-plans/${id}`,
        method: 'PUT',
        body: planData,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'SubscriptionPlan', id },
        'SubscriptionPlan',
      ],
    }),

    deleteSubscriptionPlan: builder.mutation({
      query: (id) => ({
        url: `/stripe/subscription-plans/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['SubscriptionPlan'],
    }),

    // User Subscription Endpoints
    getUserSubscription: builder.query({
      query: () => '/stripe/subscription',
      providesTags: ['UserSubscription'],
    }),

    createSubscription: builder.mutation({
      query: (subscriptionData) => ({
        url: '/stripe/create-subscription',
        method: 'POST',
        body: subscriptionData,
      }),
      invalidatesTags: ['UserSubscription', 'Transaction'],
    }),

    cancelSubscription: builder.mutation({
      query: (subscriptionId) => ({
        url: '/stripe/cancel-subscription',
        method: 'POST',
        body: { subscriptionId },
      }),
      invalidatesTags: ['UserSubscription'],
    }),

    resumeSubscription: builder.mutation({
      query: (subscriptionId) => ({
        url: '/stripe/resume-subscription',
        method: 'POST',
        body: { subscriptionId },
      }),
      invalidatesTags: ['UserSubscription'],
    }),

    updateSubscription: builder.mutation({
      query: (updateData) => ({
        url: '/stripe/update-subscription',
        method: 'PUT',
        body: updateData,
      }),
      invalidatesTags: ['UserSubscription'],
    }),

    // Payment Endpoints
    createPaymentIntent: builder.mutation({
      query: (paymentData) => ({
        url: '/stripe/create-payment-intent',
        method: 'POST',
        body: paymentData,
      }),
    }),

    processPayment: builder.mutation({
      query: (paymentData) => ({
        url: '/stripe/process-payment',
        method: 'POST',
        body: paymentData,
      }),
      invalidatesTags: ['UserSubscription', 'Transaction'],
    }),

    confirmPayment: builder.mutation({
      query: (confirmData) => ({
        url: '/stripe/confirm-payment',
        method: 'POST',
        body: confirmData,
      }),
      invalidatesTags: ['UserSubscription', 'Transaction'],
    }),

    // Transaction History
    getPaymentHistory: builder.query({
      query: (params) => ({
        url: '/stripe/payment-history',
        params,
      }),
      providesTags: ['Transaction'],
    }),

    getTransactionById: builder.query({
      query: (id) => `/stripe/transactions/${id}`,
      providesTags: (result, error, id) => [{ type: 'Transaction', id }],
    }),

    // Billing Information
    getBillingInfo: builder.query({
      query: () => '/stripe/billing-info',
      providesTags: ['BillingInfo'],
    }),

    updateBillingInfo: builder.mutation({
      query: (billingData) => ({
        url: '/stripe/billing-info',
        method: 'PUT',
        body: billingData,
      }),
      invalidatesTags: ['BillingInfo'],
    }),

    // Payment Methods
    getPaymentMethods: builder.query({
      query: () => '/stripe/payment-methods',
    }),

    addPaymentMethod: builder.mutation({
      query: (paymentMethodData) => ({
        url: '/stripe/payment-methods',
        method: 'POST',
        body: paymentMethodData,
      }),
    }),

    updatePaymentMethod: builder.mutation({
      query: (paymentMethodData) => ({
        url: '/stripe/update-payment-method',
        method: 'POST',
        body: paymentMethodData,
      }),
      invalidatesTags: ['BillingInfo'],
    }),

    deletePaymentMethod: builder.mutation({
      query: (paymentMethodId) => ({
        url: `/stripe/payment-methods/${paymentMethodId}`,
        method: 'DELETE',
      }),
    }),

    // Coupon and Discount Endpoints
    applyCoupon: builder.mutation({
      query: (couponCode) => ({
        url: '/stripe/apply-coupon',
        method: 'POST',
        body: { couponCode },
      }),
    }),

    validateCoupon: builder.query({
      query: (couponCode) => `/stripe/validate-coupon/${couponCode}`,
    }),

    // Invoice Endpoints
    getInvoices: builder.query({
      query: () => '/stripe/invoices',
    }),

    getUpcomingInvoice: builder.query({
      query: () => '/stripe/upcoming-invoice',
    }),

    downloadInvoice: builder.mutation({
      query: (invoiceId) => ({
        url: `/stripe/invoices/${invoiceId}/download`,
        method: 'GET',
        responseHandler: (response) => response.blob(),
      }),
    }),

    // Usage and Metering (for usage-based billing)
    reportUsage: builder.mutation({
      query: (usageData) => ({
        url: '/stripe/report-usage',
        method: 'POST',
        body: usageData,
      }),
    }),

    getUsageRecords: builder.query({
      query: (params) => ({
        url: '/stripe/usage-records',
        params,
      }),
    }),

    // Subscription Preview
    previewSubscriptionChange: builder.mutation({
      query: (changeData) => ({
        url: '/stripe/preview-subscription-change',
        method: 'POST',
        body: changeData,
      }),
    }),

    // Customer Portal
    createCustomerPortalSession: builder.mutation({
      query: () => ({
        url: '/stripe/create-portal-session',
        method: 'POST',
      }),
    }),

    // Webhook Test (for development)
    testWebhook: builder.mutation({
      query: (eventType) => ({
        url: '/stripe/test-webhook',
        method: 'POST',
        body: { eventType },
      }),
    }),
  }),
});

// Export hooks for usage in functional components
export const {
  // Subscription Plans
  useGetSubscriptionPlansQuery,
  useGetSubscriptionPlanByIdQuery,
  useCreateSubscriptionPlanMutation,
  useUpdateSubscriptionPlanMutation,
  useDeleteSubscriptionPlanMutation,
  
  // User Subscriptions
  useGetUserSubscriptionQuery,
  useCreateSubscriptionMutation,
  useCancelSubscriptionMutation,
  useResumeSubscriptionMutation,
  useUpdateSubscriptionMutation,
  
  // Payments
  useCreatePaymentIntentMutation,
  useProcessPaymentMutation,
  useConfirmPaymentMutation,
  
  // Transaction History
  useGetPaymentHistoryQuery,
  useGetTransactionByIdQuery,
  
  // Billing Info
  useGetBillingInfoQuery,
  useUpdateBillingInfoMutation,
  
  // Payment Methods
  useGetPaymentMethodsQuery,
  useAddPaymentMethodMutation,
  useUpdatePaymentMethodMutation,
  useDeletePaymentMethodMutation,
  
  // Coupons
  useApplyCouponMutation,
  useValidateCouponQuery,
  
  // Invoices
  useGetInvoicesQuery,
  useGetUpcomingInvoiceQuery,
  useDownloadInvoiceMutation,
  
  // Usage
  useReportUsageMutation,
  useGetUsageRecordsQuery,
  
  // Preview & Portal
  usePreviewSubscriptionChangeMutation,
  useCreateCustomerPortalSessionMutation,
  
  // Testing
  useTestWebhookMutation,
} = subscriptionApi;

// Export the api for store configuration
export default subscriptionApi;