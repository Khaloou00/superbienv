import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQueryWithReauth } from './baseApi';

export const bookingsApi = createApi({
  reducerPath: 'bookingsApi',
  baseQuery: baseQueryWithReauth,
  tagTypes: ['Bookings'],
  endpoints: (builder) => ({
    createBooking: builder.mutation({
      query: (body) => ({ url: '/bookings', method: 'POST', body }),
      invalidatesTags: ['Bookings'],
    }),
    getMesReservations: builder.query({
      query: () => '/bookings/mes-reservations',
      providesTags: ['Bookings'],
    }),
    getBooking: builder.query({
      query: (id) => `/bookings/${id}`,
    }),
    getAllBookings: builder.query({
      query: (params) => ({ url: '/bookings/all', params }),
      providesTags: ['Bookings'],
    }),
    getStats: builder.query({
      query: () => '/bookings/stats',
    }),
    annulerBooking: builder.mutation({
      query: (id) => ({ url: `/bookings/${id}/annuler`, method: 'PUT' }),
      invalidatesTags: ['Bookings'],
    }),
    scanQR: builder.mutation({
      query: (body) => ({ url: '/bookings/scan', method: 'POST', body }),
      invalidatesTags: ['Bookings'],
    }),
  }),
});

export const {
  useCreateBookingMutation, useGetMesReservationsQuery, useGetBookingQuery,
  useGetAllBookingsQuery, useGetStatsQuery, useAnnulerBookingMutation, useScanQRMutation,
} = bookingsApi;
