import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQueryWithReauth } from './baseApi';

export const eventsApi = createApi({
  reducerPath: 'eventsApi',
  baseQuery: baseQueryWithReauth,
  tagTypes: ['Events'],
  endpoints: (builder) => ({
    getEvents: builder.query({
      query: () => '/events',
      providesTags: ['Events'],
    }),
    getEvent: builder.query({
      query: (id) => `/events/${id}`,
    }),
    createEvent: builder.mutation({
      query: (formData) => ({ url: '/events', method: 'POST', body: formData }),
      invalidatesTags: ['Events'],
    }),
    updateEvent: builder.mutation({
      query: ({ id, fd }) => ({ url: `/events/${id}`, method: 'PUT', body: fd }),
      invalidatesTags: ['Events'],
    }),
    deleteEvent: builder.mutation({
      query: (id) => ({ url: `/events/${id}`, method: 'DELETE' }),
      invalidatesTags: ['Events'],
    }),
    demanderDevis: builder.mutation({
      query: ({ id, ...body }) => ({ url: `/events/${id}/devis`, method: 'POST', body }),
    }),
  }),
});

export const {
  useGetEventsQuery, useGetEventQuery, useCreateEventMutation,
  useUpdateEventMutation, useDeleteEventMutation, useDemanderDevisMutation,
} = eventsApi;
