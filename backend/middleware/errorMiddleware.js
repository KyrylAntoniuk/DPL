// Middleware для обработки несуществующих маршрутов (404)
const notFound = (req, res, next) => {
  const error = new Error(`Маршрут не найден - ${req.originalUrl}`);
  res.status(404);
  next(error); // Передаем ошибку дальше, в следующий middleware
};

// Глобальный Middleware для обработки всех ошибок
const errorHandler = (err, req, res, next) => {
  // Иногда ошибка может прийти с кодом 200, в этом случае устанавливаем 500
  let statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  let message = err.message;

  // --- СПЕЦИАЛЬНАЯ ОБРАБОТКА ОШИБОК MONGOOSE ---
  // 1. Ошибка CastError (неверный формат ObjectId)
  if (err.name === 'CastError' && err.kind === 'ObjectId') {
    statusCode = 404;
    message = 'Ресурс не найден (неверный ID)';
  }
  // (здесь можно добавить обработку других специфичных ошибок Mongoose)
  // --- КОНЕЦ ОБРАБОТКИ ОШИБОК MONGOOSE ---

  res.status(statusCode).json({
    message: message,
    // Показываем stack трейс только в режиме разработки
    stack: process.env.NODE_ENV === 'production' ? null : err.stack,
  });
};

export { notFound, errorHandler };