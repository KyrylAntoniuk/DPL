import jwt from 'jsonwebtoken';
import asyncHandler from 'express-async-handler';
import User from '../models/userModel.js';

// 1. Проверка авторизации (наличия валидного токена)
const protect = asyncHandler(async (req, res, next) => {
  let token;

  // Проверяем заголовки запроса на наличие Bearer токена
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // Извлекаем токен из строки "Bearer <token>"
      token = req.headers.authorization.split(' ')[1];

      // Расшифровываем токен и достаем id пользователя
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Находим пользователя в БД по id (исключая поле пароля) и записываем в req.user
      req.user = await User.findById(decoded.id).select('-password');

      next(); // Передаем управление следующему обработчику
    } catch (error) {
      console.error(error);
      res.status(401);
      throw new Error('Не авторизован, токен недействителен');
    }
  }

  if (!token) {
    res.status(401);
    throw new Error('Не авторизован, нет токена');
  }
});

// 2. Проверка прав Администратора
const admin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403);
    throw new Error('Доступ запрещен. Требуются права администратора');
  }
};

// 3. Проверка прав Менеджера (менеджер или админ)
const manager = (req, res, next) => {
  if (req.user && (req.user.role === 'manager' || req.user.role === 'admin')) {
    next();
  } else {
    res.status(403);
    throw new Error('Доступ запрещен. Требуются права менеджера');
  }
};

export { protect, admin, manager };