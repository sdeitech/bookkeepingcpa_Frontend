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
  tagTypes: ['Profile', 'ClientList', 'ClientProfile'],
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
  }),
});

export const {
  useGetUserProfileQuery,
  useUpdateUserProfileMutation,
  useUploadProfilePictureMutation,
  useLazyGetUserProfileQuery,
  // Admin hooks
  useGetAllClientsQuery,
  useGetClientProfileQuery,
} = userApi;