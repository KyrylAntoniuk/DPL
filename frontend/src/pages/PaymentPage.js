import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Form, Button, Col } from 'react-bootstrap';
import { savePaymentMethod } from '../redux/slices/cartSlice';
import FormContainer from '../components/FormContainer';
import CheckoutSteps from '../components/CheckoutSteps';
import useTitle from '../hooks/useTitle';

const PaymentPage = () => {
  useTitle('Способ оплаты');
  const navigate = useNavigate();
  const cart = useSelector((state) => state.cart);
  const { shippingAddress } = cart;

  // Если адрес доставки не указан, перенаправляем на страницу доставки
  useEffect(() => {
    if (!shippingAddress.address) {
      navigate('/checkout/shipping');
    }
  }, [shippingAddress, navigate]);

  const [paymentMethod, setPaymentMethod] = useState('PayPal');

  const dispatch = useDispatch();

  const submitHandler = (e) => {
    e.preventDefault();
    dispatch(savePaymentMethod(paymentMethod));
    navigate('/checkout/placeorder');
  };

  return (
    <FormContainer>
      <CheckoutSteps step1 step2 step3 />
      <h1>Способ оплаты</h1>
      <Form onSubmit={submitHandler}>
        <Form.Group>
          <Form.Label as="legend">Выберите способ</Form.Label>
          <Col>
            <Form.Check
              type="radio"
              className="my-2"
              label="PayPal или Кредитная карта"
              id="PayPal"
              name="paymentMethod"
              value="PayPal"
              checked
              onChange={(e) => setPaymentMethod(e.target.value)}
            ></Form.Check>
            {/* Здесь можно добавить другие способы оплаты */}
          </Col>
        </Form.Group>

        <Button type="submit" variant="primary" className="mt-2">
          Продолжить
        </Button>
      </Form>
    </FormContainer>
  );
};

export default PaymentPage;
