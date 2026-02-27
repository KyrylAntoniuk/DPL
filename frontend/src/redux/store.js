import { configureStore } from '@reduxjs/toolkit';
import { apiSlice } from './api/apiSlice';
import authReducer from './slices/authSlice';
import cartSliceReducer from './slices/cartSlice'; // Импортируем редьюсер корзины

export const store = configureStore({
  reducer: {
    // Подключаем редьюсеры от слайсов
    auth: authReducer,
    cart: cartSliceReducer,
    // Подключаем корневой API-слайс
    [apiSlice.reducerPath]: apiSlice.reducer,
  },
  // Добавляем middleware от RTK Query для работы с кешированием, инвалидацией и т.д.
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(apiSlice.middleware),
  devTools: true, // Включаем Redux DevTools
});
