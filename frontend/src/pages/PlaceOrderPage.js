import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { Button, Row, Col, ListGroup, Image, Card } from 'react-bootstrap';
import { toast } from 'react-toastify';
import Message from '../components/Message';
import CheckoutSteps from '../components/CheckoutSteps';
import Loader from '../components/Loader';
import { useCreateOrderMutation } from '../redux/api/ordersApiSlice';
import { clearCartItems } from '../redux/slices/cartSlice';
import useTitle from '../hooks/useTitle';

const PlaceOrderPage = () => {
  useTitle('Подтверждение заказа');
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
          price: item.basePrice,
          image: item.generalImages[0],
          // variantId: item.variantId || null, // Если у вас есть варианты
        })),
        shippingAddress: {
          ...cart.shippingAddress,
          street: cart.shippingAddress.address, // Маппим street на address
          deliveryService: 'Default' // Добавляем заглушку
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
              <h2>Доставка</h2>
              <p>
                <strong>Адрес: </strong>
                {cart.shippingAddress.address}, {cart.shippingAddress.city}{' '}
                {cart.shippingAddress.postalCode}, {cart.shippingAddress.country}
              </p>
            </ListGroup.Item>

            <ListGroup.Item>
              <h2>Способ оплаты</h2>
              <strong>Метод: </strong>
              {cart.paymentMethod}
            </ListGroup.Item>

            <ListGroup.Item>
              <h2>Товары в заказе</h2>
              {cart.cartItems.length === 0 ? (
                <Message>Ваша корзина пуста</Message>
              ) : (
                <ListGroup variant="flush">
                  {cart.cartItems.map((item, index) => (
                    <ListGroup.Item key={index}>
                      <Row>
                        <Col md={1}>
                          <Image
                            src={item.generalImages[0]}
                            alt={item.name}
                            fluid
                            rounded
                          />
                        </Col>
                        <Col>
                          <Link to={`/product/${item._id}`}>{item.name}</Link>
                        </Col>
                        <Col md={4}>
                          {item.qty} x ${item.basePrice} = ${item.qty * item.basePrice}
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
                  <Col>${cart.itemsPrice}</Col>
                </Row>
              </ListGroup.Item>
              <ListGroup.Item>
                <Row>
                  <Col>Доставка:</Col>
                  <Col>${cart.shippingPrice}</Col>
                </Row>
              </ListGroup.Item>
              <ListGroup.Item>
                <Row>
                  <Col>Налог:</Col>
                  <Col>${cart.taxPrice}</Col>
                </Row>
              </ListGroup.Item>
              <ListGroup.Item>
                <Row>
                  <Col>Итого:</Col>
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
                  Оформить заказ
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
