import React, { useState, useEffect } from 'react';
import { Table, Form, Button, Row, Col, Tab, Nav, Badge } from 'react-bootstrap';
import { LinkContainer } from 'react-router-bootstrap';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { useTranslation } from 'react-i18next'; // Импорт
import Message from '../components/Message';
import Loader from '../components/Loader';
import ProductCard from '../components/ProductCard';
import { useUpdateProfileMutation } from '../redux/api/usersApiSlice';
import { useGetMyOrdersQuery } from '../redux/api/ordersApiSlice';
import { setCredentials } from '../redux/slices/authSlice';
import useTitle from '../hooks/useTitle';

const ProfilePage = () => {
  const { t } = useTranslation(); // Хук
  useTitle(t('profile.title'));
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const dispatch = useDispatch();
  const { userInfo } = useSelector((state) => state.auth);

  const [updateProfile, { isLoading: loadingUpdateProfile }] = useUpdateProfileMutation();
  const { data: orders, isLoading: loadingOrders, error: errorOrders } = useGetMyOrdersQuery();

  useEffect(() => {
    if (userInfo) {
      setName(userInfo.name);
      setEmail(userInfo.email);
    }
  }, [userInfo]);

  const submitHandler = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      toast.error('Пароли не совпадают'); // Можно тоже перевести
    } else {
      try {
        const res = await updateProfile({ _id: userInfo._id, name, email, password }).unwrap();
        dispatch(setCredentials(res));
        toast.success('Профиль успешно обновлен');
      } catch (err) {
        toast.error(err?.data?.message || err.error);
      }
    }
  };

  const getStatusVariant = (status) => {
    switch (status) {
      case 'Новый': return 'primary';
      case 'В обработке': return 'info';
      case 'Отправлен': return 'warning';
      case 'Доставлен': return 'success';
      case 'Отменен': return 'danger';
      default: return 'secondary';
    }
  };

  return (
    <Row>
      <Col md={3}>
        <h2>{t('profile.title')}</h2>
        <Form onSubmit={submitHandler}>
          <Form.Group className="my-2" controlId="name">
            <Form.Label>{t('auth.name')}</Form.Label>
            <Form.Control type="text" placeholder={t('auth.name')} value={name} onChange={(e) => setName(e.target.value)}></Form.Control>
          </Form.Group>
          <Form.Group className="my-2" controlId="email">
            <Form.Label>{t('auth.email')}</Form.Label>
            <Form.Control type="email" placeholder={t('auth.email')} value={email} onChange={(e) => setEmail(e.target.value)}></Form.Control>
          </Form.Group>
          <Form.Group className="my-2" controlId="password">
            <Form.Label>{t('auth.password')}</Form.Label>
            <Form.Control type="password" placeholder={t('auth.password')} value={password} onChange={(e) => setPassword(e.target.value)}></Form.Control>
          </Form.Group>
          <Form.Group className="my-2" controlId="confirmPassword">
            <Form.Label>{t('auth.confirmPassword')}</Form.Label>
            <Form.Control type="password" placeholder={t('auth.confirmPassword')} value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)}></Form.Control>
          </Form.Group>
          <Button type="submit" variant="primary">{t('auth.update')}</Button>
          {loadingUpdateProfile && <Loader />}
        </Form>
      </Col>
      <Col md={9}>
        <Tab.Container id="profile-tabs" defaultActiveKey="orders">
          <Nav variant="pills" className="mb-3">
            <Nav.Item>
              <Nav.Link eventKey="orders">{t('profile.myOrders')}</Nav.Link>
            </Nav.Item>
            <Nav.Item>
              <Nav.Link eventKey="favorites">{t('profile.favorites')}</Nav.Link>
            </Nav.Item>
          </Nav>
          <Tab.Content>
            <Tab.Pane eventKey="orders">
              <h2>{t('profile.myOrders')}</h2>
              {loadingOrders ? <Loader /> : errorOrders ? <Message variant="danger">{errorOrders?.data?.message || errorOrders.error}</Message> : (
                <Table striped hover responsive className="table-sm">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>{t('order.date')}</th>
                      <th>{t('placeOrder.total')}</th>
                      <th>{t('order.paid')}</th>
                      <th>{t('order.status')}</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders && orders.map((order) => (
                      <tr key={order._id}>
                        <td>{order._id}</td>
                        <td>{order.createdAt.substring(0, 10)}</td>
                        <td>{order.totalPrice}</td>
                        <td>
                          {order.isPaid ? (
                            order.paidAt.substring(0, 10)
                          ) : (
                            <i className="fas fa-times" style={{ color: 'red' }}></i>
                          )}
                        </td>
                        <td>
                          <Badge bg={getStatusVariant(order.status)}>
                            {order.status}
                          </Badge>
                        </td>
                        <td>
                          <LinkContainer to={`/order/${order._id}`}>
                            <Button className="btn-sm" variant="light">
                              {t('profile.details')}
                            </Button>
                          </LinkContainer>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              )}
            </Tab.Pane>
            <Tab.Pane eventKey="favorites">
              <h2>{t('profile.favorites')}</h2>
              {!userInfo?.favorites || userInfo.favorites.length === 0 ? (
                <Message>{t('profile.noFavorites')}</Message>
              ) : (
                <Row>
                  {userInfo.favorites.map(product => (
                    <Col key={product._id} sm={12} md={6} lg={4}>
                      <ProductCard product={product} />
                    </Col>
                  ))}
                </Row>
              )}
            </Tab.Pane>
          </Tab.Content>
        </Tab.Container>
      </Col>
    </Row>
  );
};

export default ProfilePage;
