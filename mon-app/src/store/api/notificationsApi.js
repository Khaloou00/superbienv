import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQueryWithReauth } from './baseApi';

export const notificationsApi = createApi({
  reducerPath: 'notificationsApi',
  baseQuery: baseQueryWithReauth,
  tagTypes: ['Notifications'],
  endpoints: (builder) => ({
    getNotifications: builder.query({
      query: () => '/notifications',
      providesTags: ['Notifications'],
    }),
    getUnreadCount: builder.query({
      query: () => '/notifications/unread-count',
      providesTags: ['Notifications'],
    }),
    getRecipients: builder.query({
      query: () => '/notifications/recipients',
    }),
    sendNotification: builder.mutation({
      query: (body) => ({ url: '/notifications', method: 'POST', body }),
      invalidatesTags: ['Notifications'],
    }),
    createReport: builder.mutation({
      query: (body) => ({ url: '/notifications/report', method: 'POST', body }),
      invalidatesTags: ['Notifications'],
    }),
    markRead: builder.mutation({
      query: (id) => ({ url: `/notifications/${id}/read`, method: 'PATCH' }),
      invalidatesTags: ['Notifications'],
    }),
    markAllRead: builder.mutation({
      query: () => ({ url: '/notifications/read-all', method: 'PATCH' }),
      invalidatesTags: ['Notifications'],
    }),
  }),
});

export const {
  useGetNotificationsQuery, useGetUnreadCountQuery, useGetRecipientsQuery,
  useSendNotificationMutation, useCreateReportMutation,
  useMarkReadMutation, useMarkAllReadMutation,
} = notificationsApi;
