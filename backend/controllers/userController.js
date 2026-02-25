import asyncHandler from 'express-async-handler';
import User from '../models/userModel.js';
import generateToken from '../utils/generateToken.js';

// @desc    Авторизация пользователя & получение токена
// @route   POST /api/users/login
// @access  Public
const authUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  // Ищем пользователя по email
  const user = await User.findOne({ email });

  // Если пользователь найден и пароль совпадает (используем метод из модели)
  if (user && (await user.matchPassword(password))) {
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      token: generateToken(user._id), // Отправляем токен клиенту
    });
  } else {
    res.status(401);
    throw new Error('Неверный email или пароль');
  }
});

// @desc    Регистрация нового пользователя
// @route   POST /api/users/register
// @access  Public
const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  // Проверяем, существует ли уже такой email
  const userExists = await User.findOne({ email });

  if (userExists) {
    res.status(400);
    throw new Error('Пользователь с таким email уже существует');
  }

  // Создаем нового пользователя
  const user = await User.create({
    name,
    email,
    password, // Пароль захешируется автоматически благодаря pre('save') в модели
  });

  if (user) {
    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      token: generateToken(user._id),
    });
  } else {
    res.status(400);
    throw new Error('Неверные данные пользователя');
  }
});

// @desc    Получить профиль пользователя
// @route   GET /api/users/profile
// @access  Private (только с токеном)
const getUserProfile = asyncHandler(async (req, res) => {
  // Подтягиваем полные данные товаров из коллекции Products
  const user = await User.findById(req.user._id).populate('favorites');

  if (user) {
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      favorites: user.favorites, // Теперь здесь будет лежать массив готовых объектов товаров
    });
  } else {
    res.status(404);
    throw new Error('Пользователь не найден');
  }
});

const addProductToFavorites = asyncHandler(async (req, res) => {
  const { productId } = req.body;
  const user = await User.findById(req.user._id);

  if (user) {
    // Проверяем, нет ли уже этого товара в избранном
    if (user.favorites.includes(productId)) {
      res.status(400);
      throw new Error('Товар уже находится в списке желаний');
    }

    user.favorites.push(productId);
    await user.save();
    
    res.status(200).json({ message: 'Товар добавлен в избранное', favorites: user.favorites });
  } else {
    res.status(404);
    throw new Error('Пользователь не найден');
  }
});

// @desc    Удалить товар из избранного
// @route   DELETE /api/users/favorites/:productId
// @access  Private (только авторизованные)
const removeProductFromFavorites = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  if (user) {
    // Фильтруем массив, оставляя только те ID, которые не совпадают с переданным
    user.favorites = user.favorites.filter(
      (id) => id.toString() !== req.params.productId.toString()
    );
    
    await user.save();
    res.status(200).json({ message: 'Товар удален из избранного', favorites: user.favorites });
  } else {
    res.status(404);
    throw new Error('Пользователь не найден');
  }
});

// @desc    Обновить профиль пользователя (свои данные)
// @route   PUT /api/users/profile
// @access  Private (только авторизованные)
const updateUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  if (user) {
    user.name = req.body.name || user.name;
    user.email = req.body.email || user.email;

    // Если пользователь передал новый пароль, обновляем его
    // (он автоматически захешируется благодаря pre-save хуку в модели)
    if (req.body.password) {
      user.password = req.body.password;
    }

    const updatedUser = await user.save();

    res.json({
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      role: updatedUser.role,
      token: generateToken(updatedUser._id), // Выдаем новый токен, так как данные изменились
    });
  } else {
    res.status(404);
    throw new Error('Пользователь не найден');
  }
});

// ==========================================
// АДМИНИСТРАТИВНЫЕ КОНТРОЛЛЕРЫ
// ==========================================

// @desc    Получить список всех пользователей
// @route   GET /api/users
// @access  Private/Admin
const getUsers = asyncHandler(async (req, res) => {
  const users = await User.find({});
  res.json(users);
});

// @desc    Получить пользователя по ID
// @route   GET /api/users/:id
// @access  Private/Admin
const getUserById = asyncHandler(async (req, res) => {
  // Ищем пользователя, но исключаем поле пароля из ответа (.select('-password'))
  const user = await User.findById(req.params.id).select('-password');

  if (user) {
    res.json(user);
  } else {
    res.status(404);
    throw new Error('Пользователь не найден');
  }
});

// @desc    Обновить данные пользователя (включая РОЛЬ)
// @route   PUT /api/users/:id
// @access  Private/Admin
const updateUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);

  if (user) {
    user.name = req.body.name || user.name;
    user.email = req.body.email || user.email;
    
    // Самое важное: админ может менять роль (например, назначить менеджером)
    user.role = req.body.role || user.role;

    const updatedUser = await user.save();

    res.json({
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      role: updatedUser.role,
    });
  } else {
    res.status(404);
    throw new Error('Пользователь не найден');
  }
});

// @desc    Удалить пользователя
// @route   DELETE /api/users/:id
// @access  Private/Admin
const deleteUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);

  if (user) {
    // Защита от случайного удаления самого себя (главного админа)
    if (user.role === 'admin' && req.user._id.toString() === user._id.toString()) {
      res.status(400);
      throw new Error('Вы не можете удалить собственного пользователя (администратора)');
    }

    await User.deleteOne({ _id: user._id });
    res.json({ message: 'Пользователь успешно удален' });
  } else {
    res.status(404);
    throw new Error('Пользователь не найден');
  }
});

export { 
  authUser, 
  registerUser, 
  getUserProfile, 
  addProductToFavorites, 
  removeProductFromFavorites,
  updateUserProfile, // Новая
  getUsers,          // Новая
  getUserById,       // Новая
  updateUser,        // Новая
  deleteUser         // Новая
};