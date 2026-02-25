import jwt from 'jsonwebtoken';

// Функция принимает ID пользователя и генерирует токен,
// который будет действителен 30 дней.
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });
};

export default generateToken;