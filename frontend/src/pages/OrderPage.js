import React from 'react';
import { Link, useParams } from 'react-router-dom';
import { Row, Col, ListGroup, Image, Card, Badge } from 'react-bootstrap'; // Добавил Badge
import Message from '../components/Message';
import Loader from '../components/Loader';
import { useGetOrderByIdQuery } from '../redux/api/ordersApiSlice';
import useTitle from '../hooks/useTitle';

const OrderPage = () => {
  const { id: orderId } = useParams();
  useTitle(`Заказ ${orderId}`);

  const { data: order, isLoading, error } = useGetOrderByIdQuery(orderId);

  // Функция для выбора цвета бейджа в зависимости от статуса
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

  return isLoading ? (
    <Loader />
  ) : error ? (
    <Message variant="danger">{error?.data?.message || error.error}</Message>
  ) : (
    <>
      <h1>Заказ {order._id}</h1>
      <Row>
        <Col md={8}>
          <ListGroup variant="flush">
            <ListGroup.Item>
              <h2>Доставка</h2>
              <p>
                <strong>Имя: </strong> {order.user.name}
              </p>
              <p>
                <strong>Email: </strong>{' '}
                <a href={`mailto:${order.user.email}`}>{order.user.email}</a>
              </p>
              <p>
                <strong>Адрес: </strong>
                {order.shippingAddress.address}, {order.shippingAddress.city}{' '}
                {order.shippingAddress.postalCode}, {order.shippingAddress.country}
              </p>
              
              {/* Отображаем статус заказа */}
              <div className="mt-3">
                <strong>Статус: </strong>
                <Badge bg={getStatusVariant(order.status)} className="ms-2" style={{ fontSize: '1em' }}>
                  {order.status}
                </Badge>
                {order.status === 'Доставлен' && order.deliveredAt && (
                   <span className="ms-2 text-muted">({new Date(order.deliveredAt).toLocaleDateString()})</span>
                )}
              </div>
            </ListGroup.Item>

            <ListGroup.Item>
              <h2>Способ оплаты</h2>
              <p>
                <strong>Метод: </strong>
                {order.paymentMethod}
              </p>
              {order.isPaid ? (
                <Message variant="success">Оплачено {new Date(order.paidAt).toLocaleDateString()}</Message>
              ) : (
                <Message variant="danger">Не оплачено</Message>
              )}
            </ListGroup.Item>

            <ListGroup.Item>
              <h2>Товары в заказе</h2>
              {order.orderItems.length === 0 ? (
                <Message>Заказ пуст</Message>
              ) : (
                <ListGroup variant="flush">
                  {order.orderItems.map((item, index) => (
                    <ListGroup.Item key={index}>
                      <Row>
                        <Col md={1}>
                          <Image
                            src={item.image}
                            alt={item.name}
                            fluid
                            rounded
                          />
                        </Col>
                        <Col>
                          <Link to={`/product/${item.product}`}>{item.name}</Link>
                        </Col>
                        <Col md={4}>
                          {item.qty} x ${item.price} = ${(item.qty * item.price).toFixed(2)}
                        </Col>
                      </Row>
                    </ListGroup.Item>
                  ))}
                </ListGroup>
              )}
            </ListGroup.Item>
          </ListGroup>
        </Col>
        <Col md={4}>
          <Card>
            <ListGroup variant="flush">
              <ListGroup.Item>
                <h2>Сводка по заказу</h2>
              </ListGroup.Item>
              <ListGroup.Item>
                <Row>
                  <Col>Товары:</Col>
                  <Col>${order.itemsPrice}</Col>
                </Row>
              </ListGroup.Item>
              <ListGroup.Item>
                <Row>
                  <Col>Доставка:</Col>
                  <Col>${order.shippingPrice}</Col>
                </Row>
              </ListGroup.Item>
              <ListGroup.Item>
                <Row>
                  <Col>Налог:</Col>
                  <Col>${order.taxPrice}</Col>
                </Row>
              </ListGroup.Item>
              <ListGroup.Item>
                <Row>
                  <Col>Итого:</Col>
                  <Col>${order.totalPrice}</Col>
                </Row>
              </ListGroup.Item>
            </ListGroup>
          </Card>
        </Col>
      </Row>
    </>
  );
};

export default OrderPage;
