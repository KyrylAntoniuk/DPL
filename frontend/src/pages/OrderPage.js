import React from 'react';
import { Link, useParams } from 'react-router-dom';
import { Row, Col, ListGroup, Image, Card } from 'react-bootstrap';
import Message from '../components/Message';
import Loader from '../components/Loader';
import { useGetOrderByIdQuery } from '../redux/api/ordersApiSlice';
import useTitle from '../hooks/useTitle';

const OrderPage = () => {
  const { id: orderId } = useParams();
  useTitle(`Заказ ${orderId}`);

  const { data: order, isLoading, error } = useGetOrderByIdQuery(orderId);

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
              {order.isDelivered ? (
                <Message variant="success">
                  Доставлено {order.deliveredAt}
                </Message>
              ) : (
                <Message variant="danger">Не доставлено</Message>
              )}
            </ListGroup.Item>

            <ListGroup.Item>
              <h2>Способ оплаты</h2>
              <p>
                <strong>Метод: </strong>
                {order.paymentMethod}
              </p>
              {order.isPaid ? (
                <Message variant="success">Оплачено {order.paidAt}</Message>
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
                            src={item.image} // ИСПРАВЛЕНО: используем item.image
                            alt={item.name}
                            fluid
                            rounded
                          />
                        </Col>
                        <Col>
                          {/* Ссылка на товар должна вести на ID продукта, а не на ID элемента заказа */}
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
              {/* Здесь будет логика для оплаты */}
            </ListGroup>
          </Card>
        </Col>
      </Row>
    </>
  );
};

export default OrderPage;
