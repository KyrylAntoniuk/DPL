import path from 'path'; // Импорт path
import express from 'express';
import dotenv from 'dotenv';
// Load env vars first
dotenv.config();

import cors from 'cors';
import connectDB from './config/db.js';

// Routes
import userRoutes from './routes/userRoutes.js';
import productRoutes from './routes/productRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import reviewRoutes from './routes/reviewRoutes.js';
import filterRoutes from './routes/filterRoutes.js';
import paymentRoutes from './routes/paymentRoutes.js';
import deliveryRoutes from './routes/deliveryRoutes.js';
import uploadRoutes from './routes/uploadRoutes.js'; // Импорт uploadRoutes

// Middleware
import { notFound, errorHandler } from './middleware/errorMiddleware.js';

// Connect to DB
connectDB();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Base route
app.get('/', (req, res) => {
  res.send('API is running...');
});

// Mount routes
app.use('/api/users', userRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/filters', filterRoutes);
app.use('/api', paymentRoutes);
app.use('/api/delivery', deliveryRoutes);
app.use('/api/upload', uploadRoutes); // Подключаем маршрут загрузки

// Делаем папку uploads статической
const __dirname = path.resolve();
app.use('/uploads', express.static(path.join(__dirname, '/uploads')));

// Error handling
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});
