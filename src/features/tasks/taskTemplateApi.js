import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import config from '../../config';

export const taskTemplateApi = createApi({
  reducerPath: 'taskTemplateApi',
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
  tagTypes: ['TaskTemplates'],
  endpoints: (builder) => ({
    // Get all templates
    getTemplates: builder.query({
      query: (params = {}) => {
        const queryString = new URLSearchParams(params).toString();
        return `/task-templates${queryString ? `?${queryString}` : ''}`;
      },
      providesTags: ['TaskTemplates'],
    }),

    // Get single template
    getTemplate: builder.query({
      query: (id) => `/task-templates/${id}`,
      providesTags: (result, error, id) => [{ type: 'TaskTemplates', id }],
    }),

    // Create template
    createTemplate: builder.mutation({
      query: (data) => ({
        url: '/task-templates',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['TaskTemplates'],
    }),

    // Update template
    updateTemplate: builder.mutation({
      query: ({ id, data }) => ({
        url: `/task-templates/${id}`,
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: ['TaskTemplates'],
    }),
   
    toggleTemplate: builder.mutation({
      query: ({ id }) => ({
        url: `/task-templates/${id}/toggle`,
        method: 'PATCH',
      }),
      invalidatesTags: ['TaskTemplates'],
    }),

    // Delete template
    deleteTemplate: builder.mutation({
      query: (id) => ({
        url: `/task-templates/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['TaskTemplates'],
    }),

    // Get template stats
    getTemplateStats: builder.query({
      query: () => '/task-templates/stats',
      providesTags: ['TaskTemplates'],
    }),
  }),
});

export const {
  useGetTemplatesQuery,
  useGetTemplateQuery,
  useCreateTemplateMutation,
  useUpdateTemplateMutation,
  useDeleteTemplateMutation,
  useGetTemplateStatsQuery,
  useLazyGetTemplatesQuery,
  useToggleTemplateMutation,
} = taskTemplateApi;
