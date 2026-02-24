import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import config from '../../config';

export const userApi = createApi({
  reducerPath: 'userApi',
  baseQuery: fetchBaseQuery({
    baseUrl: config.api.baseUrl,
    prepareHeaders: (headers, { getState }) => {
      const token = getState().auth?.token || localStorage.getItem('token');
      if (token) {
        headers.set('authorization', `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ['Profile', 'ClientList', 'ClientProfile', 'StaffList'],
  endpoints: (builder) => ({
    // Get current user profile
    getUserProfile: builder.query({
      query: () => '/user/profile',
      providesTags: ['Profile'],
    }),

    // Update user profile
    updateUserProfile: builder.mutation({
      query: (profileData) => ({
        url: '/user/profile',
        method: 'PUT',
        body: profileData,
      }),
      invalidatesTags: ['Profile'],
    }),

    // Upload profile picture
    uploadProfilePicture: builder.mutation({
      query: (formData) => ({
        url: '/user/profile/upload-picture',
        method: 'POST',
        body: formData,
      }),
      invalidatesTags: ['Profile'],
    }),

    // ADMIN ENDPOINTS
    // Get all clients (admin only)
    getAllClients: builder.query({
      query: () => '/admin/clients-list',
      providesTags: ['ClientList'],
    }),

    // Get specific client profile (admin only)
    getClientProfile: builder.query({
      query: (clientId) => `/admin/client/${clientId}/profile`,
      providesTags: (result, error, clientId) => [{ type: 'ClientProfile', id: clientId }],
    }),

    // Get all staff members (admin only)
    getAllStaff: builder.query({
      query: (params = {}) => {
        const queryString = new URLSearchParams(params).toString();
        return `/admin/get-all-staff${queryString ? `?${queryString}` : ''}`;
      },
      providesTags: ['StaffList'],
    }),
    changePassword: builder.mutation({
      query: (passwordData) => ({
        url: '/user/profile/update-password',
        method: 'PATCH',
        body: passwordData,
      }),
      invalidatesTags: ['Profile'],
    }),

    // STAFF ENDPOINTS
    getStaffClient: builder.query({
      query: (clientId) => `/staff/client/${clientId}/profile`,
      providesTags: (result, error, clientId) => [{ type: 'ClientProfile', id: clientId }],
    }),
  }),
});

export const {
  useGetUserProfileQuery,
  useUpdateUserProfileMutation,
  useUploadProfilePictureMutation,
  useLazyGetUserProfileQuery,
  useChangePasswordMutation,
  // Admin hooks
  useGetAllClientsQuery,
  useGetClientProfileQuery,
  useGetAllStaffQuery,
  // Staff hooks
  useGetStaffClientQuery,
} = userApi;
