import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query";
import config from '../../config';

export const walmartApi = createApi({
    reducerPath: "walmartApi",
    baseQuery: fetchBaseQuery({
        baseUrl: config.api.baseUrl,
        prepareHeaders: (headers, { getState }) => {
          const token = getState().auth.token || localStorage.getItem('token');
          if (token) {
            headers.set('authorization', `Bearer ${token}`);
          }
          return headers;
        },
      }),

});
    