import { createSlice } from '@reduxjs/toolkit';

// Проверяем localStorage на наличие данных пользователя при первоначальной загрузке
const initialState = {
  userInfo: localStorage.getItem('userInfo')
    ? JSON.parse(localStorage.getItem('userInfo'))
    : null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    // Редьюсер для сохранения данных пользователя (при логине или регистрации)
    setCredentials(state, action) {
      state.userInfo = action.payload;
      localStorage.setItem('userInfo', JSON.stringify(action.payload));
    },
    // Редьюсер для выхода из системы
    logout(state) {
      state.userInfo = null;
      localStorage.removeItem('userInfo');
      // При выходе также можно очистить другие связанные данные, например, корзину
      localStorage.removeItem('cart'); 
    },
    // Редьюсер для обновления избранного
    updateFavorites(state, action) {
      if (state.userInfo) {
        state.userInfo.favorites = action.payload;
        localStorage.setItem('userInfo', JSON.stringify(state.userInfo));
      }
    }
  },
});

export const { setCredentials, logout, updateFavorites } = authSlice.actions;

export default authSlice.reducer;
