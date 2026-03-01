import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Row, Col, ListGroup, Image, Form, Button, Card } from 'react-bootstrap';
import { FaTrash } from 'react-icons/fa';
import { useTranslation } from 'react-i18next'; // Импорт
import Message from '../components/Message';
import { addToCart, removeFromCart } from '../redux/slices/cartSlice';
import useTitle from '../hooks/useTitle';

const CartPage = () => {
  const { t } = useTranslation(); // Хук
  useTitle(t('cart.title'));
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const cart = useSelector((state) => state.cart);
  const { cartItems } = cart;

  const { userInfo } = useSelector((state) => state.auth);

  const addToCartHandler = (product, qty) => {
    dispatch(addToCart({ ...product, qty }));
  };

  const removeFromCartHandler = (productId, variantId) => {
    dispatch(removeFromCart({ productId, variantId }));
  };

  const checkoutHandler = () => {
    if (userInfo) {
      navigate('/checkout/shipping');
    } else {
      navigate('/login?redirect=/checkout/shipping');
    }
  };

  return (
    <Row>
      <Col md={8}>
        <h1 style={{ marginBottom: '20px' }}>{t('cart.title')}</h1>
        {cartItems.length === 0 ? (
          <Message>
            {t('cart.empty')} <Link to="/">{t('cart.back')}</Link>
          </Message>
        ) : (
          <ListGroup variant="flush">
            {cartItems.map((item) => (
              <ListGroup.Item key={`${item._id}-${item.variantId}`}>
                <Row>
                  <Col md={2}>
                    <Image src={item.image} alt={item.name} fluid rounded />
                  </Col>
                  <Col md={3}>
                    <Link to={`/product/${item._id}`}>{item.name}</Link>
                    {item.variantId && (
                      <div className="text-muted small">
                        {Object.entries(item.options).map(([key, value]) => `${key}: ${value}`).join(', ')}
                      </div>
                    )}
                  </Col>
                  <Col md={2}>${item.price}</Col>
                  <Col md={2}>
                    <Form.Control
                      as="select"
                      value={item.qty}
                      onChange={(e) => addToCartHandler(item, Number(e.target.value))}
                    >
                      {[...Array(item.countInStock).keys()].map((x) => (
                        <option key={x + 1} value={x + 1}>
                          {x + 1}
                        </option>
                      ))}
                    </Form.Control>
                  </Col>
                  <Col md={2}>
                    <Button
                      type="button"
                      variant="light"
                      onClick={() => removeFromCartHandler(item._id, item.variantId)}
                    >
                      <FaTrash />
                    </Button>
                  </Col>
                </Row>
              </ListGroup.Item>
            ))}
          </ListGroup>
        )}
      </Col>
      <Col md={4}>
        <Card>
          <ListGroup variant="flush">
            <ListGroup.Item>
              <h2>
                {t('cart.subtotal')} ({cartItems.reduce((acc, item) => acc + item.qty, 0)}) {t('cart.items')}
              </h2>
              ${cart.totalPrice}
            </ListGroup.Item>
            <ListGroup.Item>
              <Button
                type="button"
                className="btn-block"
                disabled={cartItems.length === 0}
                onClick={checkoutHandler}
              >
                {t('cart.checkout')}
              </Button>
            </ListGroup.Item>
          </ListGroup>
        </Card>
      </Col>
    </Row>
  );
};

export default CartPage;
