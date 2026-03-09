import express from 'express';
import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import dotenv from 'dotenv';

dotenv.config();

const router = express.Router();

// Настройка Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Настройка хранилища Multer для Cloudinary
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'dpl-shop', // Папка в вашем облаке
    allowed_formats: ['jpg', 'png', 'jpeg', 'webp'],
  },
});

const upload = multer({ storage });

// Маршрут загрузки
router.post('/', upload.single('image'), (req, res) => {
  // Cloudinary возвращает путь к файлу в поле path
  res.send({
    message: 'Image uploaded',
    image: req.file.path, // Это будет URL вида https://res.cloudinary.com/...
  });
});

export default router;
