import express from 'express';
import dotenv from 'dotenv';
// Загрузка переменных окружения ДОЛЖНА быть самым первым действием
dotenv.config();

import cors from 'cors';
import connectDB from './config/db.js';

// Импортируем маршруты
import userRoutes from './routes/userRoutes.js';
import productRoutes from './routes/productRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import reviewRoutes from './routes/reviewRoutes.js';
import filterRoutes from './routes/filterRoutes.js';
import paymentRoutes from './routes/paymentRoutes.js';

// Импортируем наши новые middleware для обработки ошибок
import { notFound, errorHandler } from './middleware/errorMiddleware.js';

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

// Подключаем все маршруты
app.use('/api/users', userRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/filters', filterRoutes);
app.use('/api', paymentRoutes);

// --- ПОДКЛЮЧЕНИЕ ОБРАБОТЧИКОВ ОШИБОК ---
// Middleware для обработки 404 (несуществующий маршрут)
// Должен быть после всех успешных маршрутов
app.use(notFound);

// Глобальный обработчик всех ошибок
// Должен быть самым последним middleware в цепочке
app.use(errorHandler);
// --- КОНЕЦ ПОДКЛЮЧЕНИЯ ---

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Сервер запущен в режиме ${process.env.NODE_ENV} на порту ${PORT}`);
});