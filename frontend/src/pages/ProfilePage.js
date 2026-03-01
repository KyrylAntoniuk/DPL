import React, { useEffect } from 'react';
import { Table, Row, Col, Tab, Nav, Badge, Button } from 'react-bootstrap';
import { LinkContainer } from 'react-router-bootstrap';
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import Message from '../components/Message';
import Loader from '../components/Loader';
import ProductCard from '../components/ProductCard';
import { useGetMyOrdersQuery } from '../redux/api/ordersApiSlice';
import useTitle from '../hooks/useTitle';

const ProfilePage = () => {
  const { t } = useTranslation();
  useTitle(t('profile.title'));

  const { userInfo } = useSelector((state) => state.auth);
  const { data: orders, isLoading: loadingOrders, error: errorOrders } = useGetMyOrdersQuery();

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
      <Col md={12}>
        <h2 className="mb-4">{t('profile.title')}</h2>
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
              {!userInfo?.favorites || userInfo.favorites.length === 0 ? (
                <Message>{t('profile.noFavorites')}</Message>
              ) : (
                <Row>
                  {userInfo.favorites.map(product => (
                    <Col key={product._id} sm={12} md={6} lg={4} xl={3}>
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
