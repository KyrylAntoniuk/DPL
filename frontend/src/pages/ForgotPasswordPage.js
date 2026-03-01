import React, { useState } from 'react';
import { Form, Button } from 'react-bootstrap';
import { toast } from 'react-toastify';
import { useTranslation } from 'react-i18next'; // Импорт
import FormContainer from '../components/FormContainer';
import Loader from '../components/Loader';
import { useForgotPasswordMutation } from '../redux/api/usersApiSlice';
import useTitle from '../hooks/useTitle';

const ForgotPasswordPage = () => {
  const { t } = useTranslation(); // Хук
  useTitle(t('auth.resetPassword'));
  const [email, setEmail] = useState('');

  const [forgotPassword, { isLoading }] = useForgotPasswordMutation();

  const submitHandler = async (e) => {
    e.preventDefault();
    try {
      await forgotPassword({ email }).unwrap();
      toast.success('Письмо с инструкциями отправлено на ваш email');
      setEmail('');
    } catch (err) {
      toast.error(err?.data?.message || err.error);
    }
  };

  return (
    <FormContainer>
      <h1>{t('auth.resetPassword')}</h1>
      <Form onSubmit={submitHandler}>
        <Form.Group className="my-2" controlId="email">
          <Form.Label>{t('auth.email')}</Form.Label>
          <Form.Control
            type="email"
            placeholder={t('auth.email')}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          ></Form.Control>
        </Form.Group>

        <Button type="submit" variant="primary" className="mt-2" disabled={isLoading}>
          {t('auth.send')}
        </Button>

        {isLoading && <Loader />}
      </Form>
    </FormContainer>
  );
};

export default ForgotPasswordPage;
