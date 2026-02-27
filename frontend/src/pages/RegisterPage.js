import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Form, Button, Row, Col } from 'react-bootstrap';
import { toast } from 'react-toastify';
import { useRegisterMutation } from '../redux/api/usersApiSlice';
import { setCredentials } from '../redux/slices/authSlice';
import Loader from '../components/Loader';
import FormContainer from '../components/FormContainer';
import useTitle from '../hooks/useTitle';

const RegisterPage = () => {
  useTitle('Регистрация');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [register, { isLoading }] = useRegisterMutation();
  const { userInfo } = useSelector((state) => state.auth);

  useEffect(() => {
    if (userInfo) {
      navigate('/');
    }
  }, [navigate, userInfo]);

  const submitHandler = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      toast.error('Пароли не совпадают');
      return;
    }
    try {
      const res = await register({ name, email, password }).unwrap();
      dispatch(setCredentials({ ...res }));
      navigate('/');
      toast.success('Вы успешно зарегистрировались и вошли в систему!');
    } catch (err) {
      toast.error(err?.data?.message || err.error);
    }
  };

  return (
    <FormContainer>
      <h1>Регистрация</h1>
      <Form onSubmit={submitHandler}>
        <Form.Group className="my-2" controlId="name">
          <Form.Label>Имя</Form.Label>
          <Form.Control
            type="text"
            placeholder="Введите имя"
            value={name}
            onChange={(e) => setName(e.target.value)}
          ></Form.Control>
        </Form.Group>

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

        <Form.Group className="my-2" controlId="confirmPassword">
          <Form.Label>Подтвердите пароль</Form.Label>
          <Form.Control
            type="password"
            placeholder="Подтвердите пароль"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          ></Form.Control>
        </Form.Group>

        <Button type="submit" variant="primary" className="mt-2" disabled={isLoading}>
          Зарегистрироваться
        </Button>

        {isLoading && <Loader />}
      </Form>

      <Row className="py-3">
        <Col>
          Уже есть аккаунт? <Link to="/login">Войти</Link>
        </Col>
      </Row>
    </FormContainer>
  );
};

export default RegisterPage;
