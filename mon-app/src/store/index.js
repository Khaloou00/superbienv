import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import { filmsApi } from './api/filmsApi';
import { bookingsApi } from './api/bookingsApi';
import { eventsApi } from './api/eventsApi';
import { authApi } from './api/authApi';
import { notificationsApi } from './api/notificationsApi';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    [authApi.reducerPath]: authApi.reducer,
    [filmsApi.reducerPath]: filmsApi.reducer,
    [bookingsApi.reducerPath]: bookingsApi.reducer,
    [eventsApi.reducerPath]: eventsApi.reducer,
    [notificationsApi.reducerPath]: notificationsApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(
      authApi.middleware,
      filmsApi.middleware,
      bookingsApi.middleware,
      eventsApi.middleware,
      notificationsApi.middleware
    ),
});
