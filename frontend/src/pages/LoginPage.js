import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Form, Button, Row, Col } from 'react-bootstrap';
import { toast } from 'react-toastify';
import { useTranslation } from 'react-i18next'; // Импорт
import { useLoginMutation } from '../redux/api/usersApiSlice';
import { setCredentials } from '../redux/slices/authSlice';
import Loader from '../components/Loader';
import FormContainer from '../components/FormContainer';
import useTitle from '../hooks/useTitle';

const LoginPage = () => {
  const { t } = useTranslation(); // Хук
  useTitle(t('auth.signIn'));
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [login, { isLoading }] = useLoginMutation();

  const { userInfo } = useSelector((state) => state.auth);

  useEffect(() => {
    if (userInfo) {
      navigate('/');
    }
  }, [navigate, userInfo]);

  const submitHandler = async (e) => {
    e.preventDefault();
    try {
      const res = await login({ email, password }).unwrap();
      dispatch(setCredentials({ ...res }));
      navigate('/');
      toast.success('Вы успешно вошли в систему!');
    } catch (err) {
      toast.error(err?.data?.message || err.error);
    }
  };

  return (
    <FormContainer>
      <h1>{t('auth.signIn')}</h1>
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

        <Form.Group className="my-2" controlId="password">
          <Form.Label>{t('auth.password')}</Form.Label>
          <Form.Control
            type="password"
            placeholder={t('auth.password')}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          ></Form.Control>
        </Form.Group>

        <Button type="submit" variant="primary" className="mt-2" disabled={isLoading}>
          {t('auth.login')}
        </Button>

        {isLoading && <Loader />}
      </Form>

      <Row className="py-3">
        <Col>
          {t('auth.newCustomer')} <Link to="/register">{t('auth.register')}</Link>
        </Col>
        <Col className="text-end">
          <Link to="/forgotpassword">{t('auth.forgotPassword')}</Link>
        </Col>
      </Row>
    </FormContainer>
  );
};

export default LoginPage;
