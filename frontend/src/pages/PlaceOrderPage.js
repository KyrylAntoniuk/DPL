import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { Button, Row, Col, ListGroup, Image, Card } from 'react-bootstrap';
import { toast } from 'react-toastify';
import { useTranslation } from 'react-i18next'; // Импорт
import Message from '../components/Message';
import CheckoutSteps from '../components/CheckoutSteps';
import Loader from '../components/Loader';
import { useCreateOrderMutation } from '../redux/api/ordersApiSlice';
import { clearCartItems } from '../redux/slices/cartSlice';
import useTitle from '../hooks/useTitle';

const PlaceOrderPage = () => {
  const { t } = useTranslation(); // Хук
  useTitle(t('placeOrder.title'));
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const cart = useSelector((state) => state.cart);

  const [createOrder, { isLoading, error }] = useCreateOrderMutation();

  useEffect(() => {
    if (!cart.shippingAddress.address) {
      navigate('/checkout/shipping');
    } else if (!cart.paymentMethod) {
      navigate('/checkout/payment');
    }
  }, [cart.paymentMethod, cart.shippingAddress.address, navigate]);

  const placeOrderHandler = async () => {
    try {
      const res = await createOrder({
        orderItems: cart.cartItems.map(item => ({
          ...item,
          product: item._id,
          price: item.price, // Используем актуальную цену (с учетом варианта)
          image: item.image,
          options: item.options, // Передаем выбранные опции
        })),
        shippingAddress: {
          ...cart.shippingAddress,
          street: cart.shippingAddress.address,
        },
        paymentMethod: cart.paymentMethod,
        itemsPrice: cart.itemsPrice,
        shippingPrice: cart.shippingPrice,
        taxPrice: cart.taxPrice,
        totalPrice: cart.totalPrice,
      }).unwrap();
      dispatch(clearCartItems());
      navigate(`/order/${res._id}`);
    } catch (err) {
      toast.error(err?.data?.message || err.error);
    }
  };

  return (
    <>
      <CheckoutSteps step1 step2 step3 step4 />
      <Row>
        <Col md={8}>
          <ListGroup variant="flush">
            <ListGroup.Item>
              <h2>{t('placeOrder.shipping')}</h2>
              <p>
                <strong>{t('shipping.address')}: </strong>
                {cart.shippingAddress.address}, {cart.shippingAddress.city}{' '}
                {cart.shippingAddress.postalCode}, {cart.shippingAddress.country}
              </p>
            </ListGroup.Item>

            <ListGroup.Item>
              <h2>{t('placeOrder.payment')}</h2>
              <strong>{t('payment.title')}: </strong>
              {cart.paymentMethod === 'Card' ? t('payment.card') : t('payment.cash')}
            </ListGroup.Item>

            <ListGroup.Item>
              <h2>{t('placeOrder.orderItems')}</h2>
              {cart.cartItems.length === 0 ? (
                <Message>{t('cart.empty')}</Message>
              ) : (
                <ListGroup variant="flush">
                  {cart.cartItems.map((item, index) => (
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
                          <Link to={`/product/${item._id}`}>{item.name}</Link>
                          {item.options && (
                            <div className="text-muted small">
                              {Object.entries(item.options).map(([key, value]) => `${key}: ${value}`).join(', ')}
                            </div>
                          )}
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
                <h2>{t('placeOrder.summary')}</h2>
              </ListGroup.Item>
              <ListGroup.Item>
                <Row>
                  <Col>{t('placeOrder.items')}:</Col>
                  <Col>${cart.itemsPrice}</Col>
                </Row>
              </ListGroup.Item>
              <ListGroup.Item>
                <Row>
                  <Col>{t('shipping.cost')}:</Col>
                  <Col>${cart.shippingPrice}</Col>
                </Row>
              </ListGroup.Item>
              <ListGroup.Item>
                <Row>
                  <Col>{t('placeOrder.tax')}:</Col>
                  <Col>${cart.taxPrice}</Col>
                </Row>
              </ListGroup.Item>
              <ListGroup.Item>
                <Row>
                  <Col>{t('placeOrder.total')}:</Col>
                  <Col>${cart.totalPrice}</Col>
                </Row>
              </ListGroup.Item>
              <ListGroup.Item>
                {error && (
                  <Message variant="danger">{error?.data?.message || error.error}</Message>
                )}
              </ListGroup.Item>
              <ListGroup.Item>
                <Button
                  type="button"
                  className="btn-block"
                  disabled={cart.cartItems.length === 0}
                  onClick={placeOrderHandler}
                >
                  {t('placeOrder.place')}
                </Button>
                {isLoading && <Loader />}
              </ListGroup.Item>
            </ListGroup>
          </Card>
        </Col>
      </Row>
    </>
  );
};

export default PlaceOrderPage;
