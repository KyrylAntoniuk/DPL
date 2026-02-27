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
  addProductToFavorites,
  removeProductFromFavorites,
} from '../controllers/userController.js';
import { protect, admin, manager } from '../middleware/authMiddleware.js';

const router = express.Router();

// Публичные маршруты
router.post('/register', registerUser);
router.post('/login', authUser);

// Глобальный список пользователей (для Админа и Менеджера)
router.route('/').get(protect, manager, getUsers);

// Работа с собственным профилем
router.route('/profile')
  .get(protect, getUserProfile)
  .put(protect, updateUserProfile); // Добавили PUT для обновления своих данных

// Список желаний
router.route('/favorites').post(protect, addProductToFavorites);
router.route('/favorites/:productId').delete(protect, removeProductFromFavorites);

// Маршруты для управления конкретным пользователем администратором
// Важно: эти маршруты с параметром /:id должны идти ВНИЗУ, после /profile и /favorites, 
// чтобы Express не перепутал слово 'profile' с ID пользователя.
router.route('/:id')
  .get(protect, manager, getUserById) // Менеджер может просматривать
  .put(protect, admin, updateUser)      // Админ обновляет данные и РОЛЬ
  .delete(protect, admin, deleteUser);  // Админ удаляет пользователя

export default router;