import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useSelector } from 'react-redux';

const ManagerRoute = () => {
  const { userInfo } = useSelector((state) => state.auth);

  return userInfo && (userInfo.role === 'manager' || userInfo.role === 'admin') ? (
    <Outlet />
  ) : (
    <Navigate to="/login" replace />
  );
};

export default ManagerRoute;
