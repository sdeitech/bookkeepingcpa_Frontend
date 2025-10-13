import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import config from '../../config';

export const documentApi = createApi({
  reducerPath: 'documentApi',
  baseQuery: fetchBaseQuery({
    baseUrl: config.api.baseUrl,
    prepareHeaders: (headers, { getState }) => {
      const token = getState()?.auth?.token || localStorage.getItem('token');
      if (token) {
        headers.set('authorization', `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ['Document', 'Category'],
  endpoints: (builder) => ({
    // Get document categories
    getCategories: builder.query({
      query: () => '/documents/categories',
      providesTags: ['Category'],
    }),

    // Upload single document
    uploadDocument: builder.mutation({
      query: (formData) => ({
        url: '/documents/upload',
        method: 'POST',
        body: formData,
      }),
      invalidatesTags: ['Document'],
    }),

    // Upload multiple documents
    uploadMultipleDocuments: builder.mutation({
      query: (formData) => ({
        url: '/documents/upload-multiple',
        method: 'POST',
        body: formData,
      }),
      invalidatesTags: ['Document'],
    }),

    // Get documents with filters
    getDocuments: builder.query({
      query: (params = {}) => ({
        url: '/documents',
        params,
      }),
      providesTags: ['Document'],
    }),

    // Get single document
    getDocument: builder.query({
      query: (documentId) => `/documents/${documentId}`,
      providesTags: (result, error, documentId) => [{ type: 'Document', id: documentId }],
    }),

    // Delete document
    deleteDocument: builder.mutation({
      query: (documentId) => ({
        url: `/documents/${documentId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Document'],
    }),

    // Download document (returns URL)
    getDownloadUrl: builder.query({
      query: (documentId) => ({
        url: `/documents/${documentId}/download`,
        responseHandler: async (response) => {
          // For download, we just return the URL
          return `${config.api.baseUrl}/documents/${documentId}/download`;
        },
      }),
    }),
  }),
});

export const {
  useGetCategoriesQuery,
  useUploadDocumentMutation,
  useUploadMultipleDocumentsMutation,
  useGetDocumentsQuery,
  useGetDocumentQuery,
  useDeleteDocumentMutation,
  useGetDownloadUrlQuery,
} = documentApi;