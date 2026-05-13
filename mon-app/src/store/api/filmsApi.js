import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQueryWithReauth } from './baseApi';

export const filmsApi = createApi({
  reducerPath: 'filmsApi',
  baseQuery: baseQueryWithReauth,
  tagTypes: ['Films'],
  endpoints: (builder) => ({
    getFilms: builder.query({
      query: (params) => ({ url: '/films', params }),
      providesTags: ['Films'],
    }),
    getFilm: builder.query({
      query: (id) => `/films/${id}`,
      providesTags: (result, error, id) => [{ type: 'Films', id }],
    }),
    createFilm: builder.mutation({
      query: (formData) => ({ url: '/films', method: 'POST', body: formData }),
      invalidatesTags: ['Films'],
    }),
    updateFilm: builder.mutation({
      query: ({ id, fd }) => ({ url: `/films/${id}`, method: 'PUT', body: fd }),
      invalidatesTags: ['Films'],
    }),
    deleteFilm: builder.mutation({
      query: (id) => ({ url: `/films/${id}`, method: 'DELETE' }),
      invalidatesTags: ['Films'],
    }),
    toggleFavori: builder.mutation({
      query: (id) => ({ url: `/films/${id}/favoris`, method: 'POST' }),
      invalidatesTags: ['Me'],
    }),
    addComment: builder.mutation({
      query: ({ id, ...body }) => ({ url: `/films/${id}/commentaires`, method: 'POST', body }),
      invalidatesTags: (result, error, { id }) => [{ type: 'Films', id }, 'Films'],
    }),
  }),
});

export const {
  useGetFilmsQuery, useGetFilmQuery, useCreateFilmMutation,
  useUpdateFilmMutation, useDeleteFilmMutation, useToggleFavoriMutation,
  useAddCommentMutation,
} = filmsApi;
