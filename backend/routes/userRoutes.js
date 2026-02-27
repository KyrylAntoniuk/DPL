import express from 'express';
import {
  authUser,
  registerUser,
  getUserProfile,
  updateUserProfile,
  getUsers,
  getUserById,
  updateUser,
  deleteUser,
  addFavorite, // <-- Импортируем новый контроллер
  removeFavorite, // <-- Импортируем новый контроллер
} from '../controllers/userController.js';
import { protect, admin, manager } from '../middleware/authMiddleware.js';

const router = express.Router();

// Публичные маршруты
router.post('/register', registerUser);
router.post('/login', authUser);

// Глобальный список пользователей (для Админа и Менеджера)
router.route('/').get(protect, manager, getUsers);

// Работа с собственным профилем
router.route('/profile').get(protect, getUserProfile).put(protect, updateUserProfile);

// --- МАРШРУТЫ ДЛЯ ИЗБРАННОГО ---
// Добавить товар в избранное
router.route('/favorites').post(protect, addFavorite);
// Удалить товар из избранного
router.route('/favorites/:productId').delete(protect, removeFavorite);
// --- КОНЕЦ МАРШРУТОВ ДЛЯ ИЗБРАННОГО ---

// Маршруты для управления конкретным пользователем администратором
// Важно: эти маршруты с параметром /:id должны идти ВНИЗУ
router
  .route('/:id')
  .get(protect, manager, getUserById) // Менеджер может просматривать
  .put(protect, admin, updateUser) // Админ обновляет данные и РОЛЬ
  .delete(protect, admin, deleteUser); // Админ удаляет пользователя

export default router;