import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { BASE_URL } from '../../utils/constants';
import { logout } from '../slices/authSlice'; // Импортируем logout для авто-выхода

// Базовый запрос с подготовкой заголовков
const baseQuery = fetchBaseQuery({
  baseUrl: BASE_URL,
  prepareHeaders: (headers, { getState }) => {
    const {
      auth: { userInfo },
    } = getState();
    if (userInfo && userInfo.token) {
      headers.set('authorization', `Bearer ${userInfo.token}`);
    }
    return headers;
  },
});

// Глобальный перехватчик запросов для обработки ошибок
const baseQueryWithReauth = async (args, api, extraOptions) => {
  let result = await baseQuery(args, api, extraOptions);

  // Если получаем ошибку 401 (Unauthorized), разлогиниваем пользователя
  if (result.error && result.error.status === 401) {
    console.error('Unauthorized access - logging out');
    api.dispatch(logout());
  }
  
  return result;
};


// Создаем корневой API Slice, в который будем инжектить эндпоинты
export const apiSlice = createApi({
  baseQuery: baseQueryWithReauth, // Используем наш кастомный baseQuery с перехватчиком
  tagTypes: ['Product', 'Order', 'User'], // Определяем теги для кеширования
  endpoints: (builder) => ({}), // Эндпоинты будут добавляться в других файлах
});
