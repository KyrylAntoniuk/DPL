import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Row, Col, ListGroup, Image, Card, Badge } from 'react-bootstrap';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import { useTranslation } from 'react-i18next';
import Message from '../components/Message';
import Loader from '../components/Loader';
import CheckoutForm from '../components/CheckoutForm';
import { 
  useGetOrderByIdQuery, useGetStripePublishableKeyQuery, useCreatePaymentIntentMutation 
} from '../redux/api/ordersApiSlice';
import useTitle from '../hooks/useTitle';

const OrderPage = () => {
  const { id: orderId } = useParams();
  const { t } = useTranslation();
  useTitle(`${t('order.title')} ${orderId}`);

  const { data: order, isLoading, error } = useGetOrderByIdQuery(orderId);
  const { data: stripeConfig, isLoading: loadingConfig, error: configError } = useGetStripePublishableKeyQuery();
  const [createPaymentIntent] = useCreatePaymentIntentMutation();

  const [clientSecret, setClientSecret] = useState('');
  const [stripePromise, setStripePromise] = useState(null);

  useEffect(() => {
    if (stripeConfig?.publishableKey) setStripePromise(loadStripe(stripeConfig.publishableKey));
  }, [stripeConfig]);

  useEffect(() => {
    if (order && !order.isPaid && order.paymentMethod === 'Card' && !clientSecret) {
      createPaymentIntent({ orderId: order._id })
        .unwrap()
        .then((res) => setClientSecret(res.clientSecret))
        .catch((err) => console.error('Error creating payment intent:', err));
    }
  }, [order, createPaymentIntent, clientSecret]);

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

  const getImageSrc = (src) => {
    if (!src) return 'https://via.placeholder.com/150?text=No+Image';
    if (src.includes('cdn-apple.com')) return 'https://via.placeholder.com/150?text=Apple+Image';
    return src;
  };

  return isLoading ? <Loader /> : error ? (
    <Message variant="danger">{error?.data?.message || error.error}</Message>
  ) : (
    <>
      <h1>{t('order.title')} {order._id}</h1>
      <Row>
        <Col md={8}>
          <ListGroup variant="flush">
            <ListGroup.Item>
              <h2>{t('placeOrder.shipping')}</h2>
              <p><strong>{t('auth.name')}: </strong> {order.user.name}</p>
              <p><strong>{t('auth.email')}: </strong> <a href={`mailto:${order.user.email}`}>{order.user.email}</a></p>
              <p>
                <strong>{t('shipping.address')}: </strong>
                {order.shippingAddress.address}, {order.shippingAddress.city}{' '}
                {order.shippingAddress.postalCode}, {order.shippingAddress.country}
              </p>
              <div className="mt-3">
                <strong>{t('order.status')}: </strong>
                <Badge bg={getStatusVariant(order.status)} className="ms-2" style={{ fontSize: '1em' }}>
                  {order.status}
                </Badge>
                {order.status === 'Доставлен' && order.deliveredAt && (
                   <span className="ms-2 text-muted">({new Date(order.deliveredAt).toLocaleDateString()})</span>
                )}
              </div>
            </ListGroup.Item>

            <ListGroup.Item>
              <h2>{t('placeOrder.payment')}</h2>
              <p><strong>{t('shipping.method')}: </strong> {order.paymentMethod === 'Card' ? t('payment.card') : t('payment.cash')}</p>
              {order.isPaid ? (
                <Message variant="success">{t('order.paid')} {new Date(order.paidAt).toLocaleDateString()}</Message>
              ) : (
                <Message variant="danger">{t('order.notPaid')}</Message>
              )}
            </ListGroup.Item>

            <ListGroup.Item>
              <h2>{t('placeOrder.orderItems')}</h2>
              {order.orderItems.length === 0 ? <Message>{t('cart.empty')}</Message> : (
                <ListGroup variant="flush">
                  {order.orderItems.map((item, index) => (
                    <ListGroup.Item key={index}>
                      <Row>
                        <Col md={1}>
                          <Image src={getImageSrc(item.image)} alt={item.name} fluid rounded />
                        </Col>
                        <Col><Link to={`/product/${item.product}`}>{item.name}</Link></Col>
                        <Col md={4}>{item.qty} x ${item.price} = ${(item.qty * item.price).toFixed(2)}</Col>
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
              <ListGroup.Item><h2>{t('placeOrder.summary')}</h2></ListGroup.Item>
              <ListGroup.Item><Row><Col>{t('placeOrder.items')}:</Col><Col>${order.itemsPrice}</Col></Row></ListGroup.Item>
              <ListGroup.Item><Row><Col>{t('shipping.cost')}:</Col><Col>${order.shippingPrice}</Col></Row></ListGroup.Item>
              <ListGroup.Item><Row><Col>{t('placeOrder.tax')}:</Col><Col>${order.taxPrice}</Col></Row></ListGroup.Item>
              <ListGroup.Item><Row><Col>{t('placeOrder.total')}:</Col><Col>${order.totalPrice}</Col></Row></ListGroup.Item>
              
              {!order.isPaid && order.paymentMethod === 'Card' && (
                <ListGroup.Item>
                  {configError && <Message variant="danger">Error loading Stripe: {JSON.stringify(configError)}</Message>}
                  {loadingConfig ? <Loader /> : clientSecret && stripePromise ? (
                    <Elements stripe={stripePromise} options={{ clientSecret }}>
                      <CheckoutForm orderId={order._id} clientSecret={clientSecret} />
                    </Elements>
                  ) : <Loader />}
                </ListGroup.Item>
              )}
            </ListGroup>
          </Card>
        </Col>
      </Row>
    </>
  );
};

export default OrderPage;
