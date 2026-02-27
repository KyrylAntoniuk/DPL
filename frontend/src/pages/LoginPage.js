import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Form, Button, Row, Col } from 'react-bootstrap';
import { toast } from 'react-toastify';
import { useLoginMutation } from '../redux/api/usersApiSlice';
import { setCredentials } from '../redux/slices/authSlice';
import Loader from '../components/Loader';
import FormContainer from '../components/FormContainer'; // Создадим этот компонент для стилизации
import useTitle from '../hooks/useTitle';

const LoginPage = () => {
  useTitle('Вход в аккаунт'); // Устанавливаем заголовок страницы
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [login, { isLoading }] = useLoginMutation();

  const { userInfo } = useSelector((state) => state.auth);

  // Если пользователь уже залогинен, перенаправляем его
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
      <h1>Вход</h1>
      <Form onSubmit={submitHandler}>
        <Form.Group className="my-2" controlId="email">
          <Form.Label>Email адрес</Form.Label>
          <Form.Control
            type="email"
            placeholder="Введите email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          ></Form.Control>
        </Form.Group>

        <Form.Group className="my-2" controlId="password">
          <Form.Label>Пароль</Form.Label>
          <Form.Control
            type="password"
            placeholder="Введите пароль"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          ></Form.Control>
        </Form.Group>

        <Button type="submit" variant="primary" className="mt-2" disabled={isLoading}>
          Войти
        </Button>

        {isLoading && <Loader />}
      </Form>

      <Row className="py-3">
        <Col>
          Новый пользователь? <Link to="/register">Зарегистрироваться</Link>
        </Col>
      </Row>
    </FormContainer>
  );
};

export default LoginPage;
