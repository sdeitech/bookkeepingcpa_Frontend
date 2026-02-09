import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import config from '../../config';

/**
 * Questionnaire API
 * Public endpoints (no authentication required)
 */
export const questionnaireApi = createApi({
  reducerPath: 'questionnaireApi',
  baseQuery: fetchBaseQuery({
    baseUrl: config.api.baseUrl,
    timeout: config.api.timeout,
    prepareHeaders: (headers) => {
      headers.set('Content-Type', 'application/json');
      return headers;
    },
  }),
  tagTypes: ['QuestionnaireResponse'],
  endpoints: (builder) => ({
    // Submit questionnaire response
    submitQuestionnaire: builder.mutation({
      query: (questionnaireData) => ({
        url: '/questionnaire/submit',
        method: 'POST',
        body: questionnaireData,
      }),
      invalidatesTags: ['QuestionnaireResponse'],
    }),

    // Get questionnaire response by email
    getQuestionnaireByEmail: builder.query({
      query: (email) => `/questionnaire/${encodeURIComponent(email)}`,
      providesTags: (result, error, email) => [{ type: 'QuestionnaireResponse', id: email }],
    }),

    // Create client in Ignition via Zapier webhook
    createClientInIgnition: builder.mutation({
      query: (data) => ({
        url: '/integrations/zapier/lead',
        method: 'POST',
        body: data,
      }),
    }),
    sendPandaDoc: builder.mutation({
      query: (payload) => ({
        url: "/integrations/zapier/pandadoc",
        method: "POST",
        body: payload,
      }),
    }),
    
  }),
});

// Export hooks for usage in functional components
export const {
  useSubmitQuestionnaireMutation,
  useGetQuestionnaireByEmailQuery,
  useCreateClientInIgnitionMutation,
  useSendPandaDocMutation
} = questionnaireApi;

// Export the api for store configuration
export default questionnaireApi;

