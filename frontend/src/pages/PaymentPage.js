import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Form, Button, Col, Row } from 'react-bootstrap';
import { savePaymentMethod } from '../redux/slices/cartSlice';
import FormContainer from '../components/FormContainer';
import CheckoutSteps from '../components/CheckoutSteps';
import Loader from '../components/Loader';
import useTitle from '../hooks/useTitle';

const PaymentPage = () => {
  useTitle('Способ оплаты');
  const navigate = useNavigate();
  const cart = useSelector((state) => state.cart);
  const { shippingAddress, paymentMethod: currentPaymentMethod } = cart;

  useEffect(() => {
    if (!shippingAddress.address) {
      navigate('/checkout/shipping');
    }
  }, [shippingAddress, navigate]);

  const [paymentMethod, setPaymentMethod] = useState(currentPaymentMethod || 'Card');
  
  // Состояние для данных карты
  const [cardNumber, setCardNumber] = useState('');
  const [cardHolder, setCardHolder] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [cvv, setCvv] = useState('');
  
  const [isProcessing, setIsProcessing] = useState(false);

  const dispatch = useDispatch();

  const submitHandler = (e) => {
    e.preventDefault();
    
    if (paymentMethod === 'Card') {
      // Простая валидация
      if (!cardNumber || !cardHolder || !expiryDate || !cvv) {
        alert('Пожалуйста, заполните все поля карты');
        return;
      }

      setIsProcessing(true);
      // Имитация задержки обработки
      setTimeout(() => {
        setIsProcessing(false);
        dispatch(savePaymentMethod(paymentMethod));
        navigate('/checkout/placeorder');
      }, 1500);
    } else {
      dispatch(savePaymentMethod(paymentMethod));
      navigate('/checkout/placeorder');
    }
  };

  return (
    <FormContainer>
      <CheckoutSteps step1 step2 step3 />
      <h1>Способ оплаты</h1>
      {isProcessing ? (
        <div className="text-center">
          <Loader />
          <p>Проверка карты...</p>
        </div>
      ) : (
        <Form onSubmit={submitHandler}>
          <Form.Group>
            <Form.Label as="legend">Выберите способ</Form.Label>
            <Col>
              <Form.Check
                type="radio"
                className="my-2"
                label="Кредитная карта"
                id="Card"
                name="paymentMethod"
                value="Card"
                checked={paymentMethod === 'Card'}
                onChange={(e) => setPaymentMethod(e.target.value)}
              ></Form.Check>

              {/* Форма ввода карты (появляется только если выбрана карта) */}
              {paymentMethod === 'Card' && (
                <div className="p-3 border rounded mb-3 bg-light">
                  <Form.Group className="mb-2" controlId="cardNumber">
                    <Form.Label>Номер карты</Form.Label>
                    <Form.Control 
                      type="text" 
                      placeholder="0000 0000 0000 0000" 
                      value={cardNumber}
                      onChange={(e) => setCardNumber(e.target.value)}
                      maxLength="19"
                    />
                  </Form.Group>
                  <Form.Group className="mb-2" controlId="cardHolder">
                    <Form.Label>Владелец карты</Form.Label>
                    <Form.Control 
                      type="text" 
                      placeholder="IVAN IVANOV" 
                      value={cardHolder}
                      onChange={(e) => setCardHolder(e.target.value.toUpperCase())}
                    />
                  </Form.Group>
                  <Row>
                    <Col>
                      <Form.Group className="mb-2" controlId="expiryDate">
                        <Form.Label>Срок действия</Form.Label>
                        <Form.Control 
                          type="text" 
                          placeholder="MM/YY" 
                          value={expiryDate}
                          onChange={(e) => setExpiryDate(e.target.value)}
                          maxLength="5"
                        />
                      </Form.Group>
                    </Col>
                    <Col>
                      <Form.Group className="mb-2" controlId="cvv">
                        <Form.Label>CVV</Form.Label>
                        <Form.Control 
                          type="password" 
                          placeholder="123" 
                          value={cvv}
                          onChange={(e) => setCvv(e.target.value)}
                          maxLength="3"
                        />
                      </Form.Group>
                    </Col>
                  </Row>
                </div>
              )}
              
              <Form.Check
                type="radio"
                className="my-2"
                label="Наличными при получении"
                id="Cash"
                name="paymentMethod"
                value="Cash"
                checked={paymentMethod === 'Cash'}
                onChange={(e) => setPaymentMethod(e.target.value)}
              ></Form.Check>
            </Col>
          </Form.Group>

          <Button type="submit" variant="primary" className="mt-2">
            Продолжить
          </Button>
        </Form>
      )}
    </FormContainer>
  );
};

export default PaymentPage;
