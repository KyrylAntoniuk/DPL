import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

const sendEmail = async ({ to, subject, text, html }) => {
  try {
    // Создаем транспорт (настройки SMTP)
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST || 'smtp.gmail.com',
      port: process.env.EMAIL_PORT || 587,
      secure: false, // true для 465, false для других портов
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    // Опции письма
    const mailOptions = {
      from: `"DPL Shop" <${process.env.EMAIL_USER}>`, // Отправитель
      to: to, // Получатель
      subject: subject, // Тема
      text: text, // Текстовая версия
      html: html, // HTML версия
    };

    // Отправляем письмо
    const info = await transporter.sendMail(mailOptions);

    console.log('Email sent: %s', info.messageId);
    return info;
  } catch (error) {
    console.error('Error sending email:', error);
    // Не выбрасываем ошибку, чтобы не ломать основной процесс (создание заказа и т.д.)
  }
};

export default sendEmail;
