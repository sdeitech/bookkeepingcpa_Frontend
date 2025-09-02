import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query";

export const walmartApi = createApi({
    reducerPath: "walmartApi",
    baseQuery: fetchBaseQuery({
        baseUrl: import.meta.env.VITE_API_URL || 'http://localhost:8080/api',
        prepareHeaders: (headers, { getState }) => {
          const token = getState().auth.token || localStorage.getItem('token');
          if (token) {
            headers.set('authorization', `Bearer ${token}`);
          }
          return headers;
        },
      }),

});
    