import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const userApi = createApi({
  reducerPath: 'userApi',
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
  tagTypes: ['Profile'],
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
  }),
});

export const {
  useGetUserProfileQuery,
  useUpdateUserProfileMutation,
  useUploadProfilePictureMutation,
  useLazyGetUserProfileQuery,
} = userApi;