import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Form, Button, Col } from 'react-bootstrap';
import { useTranslation } from 'react-i18next'; // Импорт
import { savePaymentMethod } from '../redux/slices/cartSlice';
import FormContainer from '../components/FormContainer';
import CheckoutSteps from '../components/CheckoutSteps';
import useTitle from '../hooks/useTitle';

const PaymentPage = () => {
  const { t } = useTranslation(); // Хук
  useTitle(t('payment.title'));
  const navigate = useNavigate();
  const cart = useSelector((state) => state.cart);
  const { shippingAddress, paymentMethod: currentPaymentMethod } = cart;

  useEffect(() => {
    if (!shippingAddress.address) {
      navigate('/checkout/shipping');
    }
  }, [shippingAddress, navigate]);

  const [paymentMethod, setPaymentMethod] = useState(currentPaymentMethod || 'Card');

  const dispatch = useDispatch();

  const submitHandler = (e) => {
    e.preventDefault();
    dispatch(savePaymentMethod(paymentMethod));
    navigate('/checkout/placeorder');
  };

  return (
    <FormContainer>
      <CheckoutSteps step1 step2 step3 />
      <h1>{t('payment.title')}</h1>
      <Form onSubmit={submitHandler}>
        <Form.Group>
          <Form.Label as="legend">{t('payment.select')}</Form.Label>
          <Col>
            <Form.Check
              type="radio"
              className="my-2"
              label={t('payment.card')}
              id="Card"
              name="paymentMethod"
              value="Card"
              checked={paymentMethod === 'Card'}
              onChange={(e) => setPaymentMethod(e.target.value)}
            ></Form.Check>
            
            <Form.Check
              type="radio"
              className="my-2"
              label={t('payment.cash')}
              id="Cash"
              name="paymentMethod"
              value="Cash"
              checked={paymentMethod === 'Cash'}
              onChange={(e) => setPaymentMethod(e.target.value)}
            ></Form.Check>
          </Col>
        </Form.Group>

        <Button type="submit" variant="primary" className="mt-2">
          {t('payment.continue')}
        </Button>
      </Form>
    </FormContainer>
  );
};

export default PaymentPage;
