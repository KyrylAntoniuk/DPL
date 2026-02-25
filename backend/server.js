import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import connectDB from './config/db.js';

import userRoutes from './routes/userRoutes.js';
import productRoutes from './routes/productRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
// Загрузка переменных окружения (включая MONGO_URI)
dotenv.config();

// Подключение к базе данных
connectDB();

const app = express();

// Middleware для обработки JSON и CORS
app.use(cors());
app.use(express.json());

// Базовый тестовый маршрут
app.get('/', (req, res) => {
  res.send('API интернет-магазина работает...');
});

// Здесь в будущем будут подключены роуты
app.use('/api/users', userRoutes);

app.use('/api/products', productRoutes);

app.use('/api/orders', orderRoutes);
// app.use('/api/products', productRoutes);
// app.use('/api/orders', orderRoutes);

// Глобальный обработчик ошибок (Middleware)
app.use((err, req, res, next) => {
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  res.status(statusCode).json({
    message: err.message,
    stack: process.env.NODE_ENV === 'production' ? null : err.stack,
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Сервер запущен в режиме ${process.env.NODE_ENV} на порту ${PORT}`);
});