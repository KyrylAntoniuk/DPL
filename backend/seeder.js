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
    // Clear old data
    await Product.deleteMany();
    await User.deleteMany();

    // Create admin user
    const createdUsers = await User.create([
      {
        name: 'Admin User',
        email: 'admin@example.com',
        password: 'password123',
        role: 'admin',
      }
    ]);

    const adminUserId = createdUsers[0]._id;

    // Add admin ID to products
    const sampleProducts = products.map((product) => {
      return { ...product, user: adminUserId };
    });

    // Insert products
    await Product.insertMany(sampleProducts);

    console.log('Data Imported!');
    process.exit();
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

const destroyData = async () => {
  try {
    await Product.deleteMany();
    await User.deleteMany();

    console.log('Data Destroyed!');
    process.exit();
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

if (process.argv[2] === '-d') {
  destroyData();
} else {
  importData();
}
