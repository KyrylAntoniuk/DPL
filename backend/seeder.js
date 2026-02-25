import mongoose from 'mongoose';
import dotenv from 'dotenv';
import connectDB from './config/db.js';
import User from './models/userModel.js';
import Product from './models/productModel.js';
import products from './data/products.js';

dotenv.config();
connectDB();

const importData = async () => {
  try {
    // 1. Очищаем коллекции от старых данных
    await Product.deleteMany();
    await User.deleteMany();

    // 2. Создаем тестового администратора (он нам нужен, так как в модели Product поле user обязательно)
    const createdUsers = await User.create([
      {
        name: 'Admin User',
        email: 'admin@example.com',
        password: 'password123', // Убедись, что pre-save хук в userModel его захеширует
        role: 'admin',
      }
    ]);

    const adminUserId = createdUsers[0]._id;

    // 3. Добавляем ID администратора к каждому товару из тестового массива
    const sampleProducts = products.map((product) => {
      return { ...product, user: adminUserId };
    });

    // 4. Загружаем товары в базу данных
    await Product.insertMany(sampleProducts);

    console.log('Данные успешно загружены!');
    process.exit();
  } catch (error) {
    console.error(`Ошибка при загрузке данных: ${error.message}`);
    process.exit(1);
  }
};

const destroyData = async () => {
  try {
    await Product.deleteMany();
    await User.deleteMany();

    console.log('Данные успешно удалены!');
    process.exit();
  } catch (error) {
    console.error(`Ошибка при удалении данных: ${error.message}`);
    process.exit(1);
  }
};

// Проверяем аргумент командной строки: если передано "-d", то удаляем данные, иначе - загружаем
if (process.argv[2] === '-d') {
  destroyData();
} else {
  importData();
}