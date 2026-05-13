import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQueryWithReauth } from './baseApi';

export const authApi = createApi({
  reducerPath: 'authApi',
  baseQuery: baseQueryWithReauth,
  endpoints: (builder) => ({
    register: builder.mutation({
      query: (body) => ({ url: '/auth/register', method: 'POST', body }),
    }),
    login: builder.mutation({
      query: (body) => ({ url: '/auth/login', method: 'POST', body }),
    }),
    logout: builder.mutation({
      query: () => ({ url: '/auth/logout', method: 'POST' }),
    }),
    getMe: builder.query({
      query: () => '/auth/me',
      providesTags: ['Me'],
    }),
    updateMe: builder.mutation({
      query: (body) => ({ url: '/auth/me', method: 'PUT', body }),
      invalidatesTags: ['Me'],
    }),
    forgotPassword: builder.mutation({
      query: (body) => ({ url: '/auth/forgot-password', method: 'POST', body }),
    }),
    resetPassword: builder.mutation({
      query: ({ token, ...body }) => ({ url: `/auth/reset-password/${token}`, method: 'PUT', body }),
    }),
  }),
});

export const {
  useRegisterMutation, useLoginMutation, useLogoutMutation,
  useGetMeQuery, useUpdateMeMutation,
  useForgotPasswordMutation, useResetPasswordMutation,
} = authApi;
