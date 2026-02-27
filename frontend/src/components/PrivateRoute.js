import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useSelector } from 'react-redux';

const PrivateRoute = () => {
  const { userInfo } = useSelector((state) => state.auth);

  // Если пользователь авторизован, показываем дочерний компонент (страницу)
  // Иначе, перенаправляем на страницу логина, сохраняя исходный путь для редиректа после входа
  return userInfo ? <Outlet /> : <Navigate to="/login" replace />;
};

export default PrivateRoute;
