import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

// Define the auth API using RTK Query
export const authApi = createApi({
  reducerPath: 'authApi',
  baseQuery: fetchBaseQuery({
    baseUrl: 'http://localhost:8080/api',
    prepareHeaders: (headers, { getState }) => {
      // Get token from state
      const token = getState().auth.token;
      if (token) {
        headers.set('authorization', `Bearer ${token}`);
      }
      return headers;
    },
  }),
  endpoints: (builder) => ({
    // Login endpoint
    login: builder.mutation({
      query: (credentials) => ({
        url: '/auth/signin',
        method: 'POST',
        body: credentials,
      }),
    }),
    
    // Signup endpoint
    signup: builder.mutation({
      query: (userData) => ({
        url: '/auth/signup',
        method: 'POST',
        body: userData,
      }),
    }),
    
    // Google auth endpoint
    googleAuth: builder.mutation({
      query: (googleData) => ({
        url: '/auth/google',
        method: 'POST',
        body: googleData,
      }),
    }),
    
    // Get all users
    getUsers: builder.query({
      query: () => '/users',
    }),
    
    // Get user by ID
    getUserById: builder.query({
      query: (id) => `/users/${id}`,
    }),
    
    // Admin endpoints for staff management
    createStaff: builder.mutation({
      query: (staffData) => ({
        url: '/admin/create-staff',
        method: 'POST',
        body: staffData,
      }),
    }),
    
    getAllStaff: builder.query({
      query: () => '/admin/get-all-staff',
    }),
    
    updateStaff: builder.mutation({
      query: ({ id, ...staffData }) => ({
        url: `/admin/update-staff/${id}`,
        method: 'PUT',
        body: staffData,
      }),
    }),
    
    deactivateStaff: builder.mutation({
      query: (id) => ({
        url: `/admin/deactivate-staff/${id}`,
        method: 'DELETE',
      }),
    }),
    
    reactivateStaff: builder.mutation({
      query: (id) => ({
        url: `/admin/reactivate-staff/${id}`,
        method: 'PUT',
      }),
    }),
    
    // Client Assignment Endpoints
    assignClient: builder.mutation({
      query: (data) => ({
        url: `/admin/assign-client`,
        method: 'POST',
        body: data,
      }),
    }),
    
    unassignClient: builder.mutation({
      query: (data) => ({
        url: `/admin/unassign-client`,
        method: 'DELETE',
        body: data,
      }),
    }),
    
    getAllAssignments: builder.query({
      query: () => `/admin/get-assignments`,
    }),
    
    getStaffClients: builder.query({
      query: (staffId) => `/admin/staff-clients/${staffId}`,
    }),
    
    getClientsWithAssignments: builder.query({
      query: () => `/admin/clients-with-assignments`,
    }),
    
    // Staff Endpoints
    getMyClients: builder.query({
      query: () => `/staff/my-clients`,
    }),
    
    getStaffDashboard: builder.query({
      query: () => `/staff/dashboard`,
    }),
  }),
});

// Export hooks for usage in functional components
export const {
  useLoginMutation,
  useSignupMutation,
  useGoogleAuthMutation,
  useGetUsersQuery,
  useGetUserByIdQuery,
  useCreateStaffMutation,
  useGetAllStaffQuery,
  useUpdateStaffMutation,
  useDeactivateStaffMutation,
  useReactivateStaffMutation,
  useAssignClientMutation,
  useUnassignClientMutation,
  useGetAllAssignmentsQuery,
  useGetStaffClientsQuery,
  useGetClientsWithAssignmentsQuery,
  useGetMyClientsQuery,
  useGetStaffDashboardQuery,
} = authApi;