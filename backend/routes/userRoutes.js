import express from 'express';
import {
  authUser,
  registerUser,
  logoutUser,
  getUserProfile,
  updateUserProfile,
  getUsers,
  getUserById,
  updateUser,
  deleteUser,
  addFavorite,
  removeFavorite,
  forgotPassword, // <-- Импорт
  resetPassword, // <-- Импорт
} from '../controllers/userController.js';
import { protect, admin, manager } from '../middleware/authMiddleware.js';

const router = express.Router();

// Публичные маршруты
router.post('/register', registerUser);
router.post('/login', authUser);
router.post('/logout', logoutUser);
router.post('/forgotpassword', forgotPassword); // <-- Маршрут
router.put('/resetpassword/:resettoken', resetPassword); // <-- Маршрут

// Глобальный список пользователей (для Админа и Менеджера)
router.route('/').get(protect, manager, getUsers);

// Работа с собственным профилем
router.route('/profile').get(protect, getUserProfile).put(protect, updateUserProfile);

// --- МАРШРУТЫ ДЛЯ ИЗБРАННОГО ---
router.route('/favorites').post(protect, addFavorite);
router.route('/favorites/:productId').delete(protect, removeFavorite);
// --- КОНЕЦ МАРШРУТОВ ДЛЯ ИЗБРАННОГО ---

// Маршруты для управления конкретным пользователем администратором
router
  .route('/:id')
  .get(protect, manager, getUserById)
  .put(protect, admin, updateUser)
  .delete(protect, admin, deleteUser);

export default router;