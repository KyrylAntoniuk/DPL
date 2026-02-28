import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Form, Button, Card } from 'react-bootstrap';
import { saveShippingAddress } from '../redux/slices/cartSlice';
import FormContainer from '../components/FormContainer';
import CheckoutSteps from '../components/CheckoutSteps';
import { useCalculateDeliveryMutation } from '../redux/api/ordersApiSlice';
import useTitle from '../hooks/useTitle';

const ShippingPage = () => {
  useTitle('Адрес доставки');
  const cart = useSelector((state) => state.cart);
  const { shippingAddress } = cart;

  const [address, setAddress] = useState(shippingAddress?.address || '');
  const [city, setCity] = useState(shippingAddress?.city || '');
  const [postalCode, setPostalCode] = useState(shippingAddress?.postalCode || '');
  const [country, setCountry] = useState(shippingAddress?.country || '');
  
  const [deliveryService, setDeliveryService] = useState(shippingAddress?.deliveryService || 'Standard');
  const [deliveryCost, setDeliveryCost] = useState(null);
  const [deliveryDate, setDeliveryDate] = useState(null);

  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  const [calculateDelivery, { isLoading: loadingCalc }] = useCalculateDeliveryMutation();

  const calculateHandler = async () => {
    if (!city) {
      alert('Введите город для расчета');
      return;
    }
    try {
      const res = await calculateDelivery({ city, service: deliveryService }).unwrap();
      setDeliveryCost(res.price);
      setDeliveryDate(res.estimatedDate);
    } catch (err) {
      console.error(err);
    }
  };

  const submitHandler = (e) => {
    e.preventDefault();
    dispatch(saveShippingAddress({ address, city, postalCode, country, deliveryService }));
    navigate('/checkout/payment');
  };

  return (
    <FormContainer>
      <CheckoutSteps step1 step2 />
      <h1>Адрес доставки</h1>
      <Form onSubmit={submitHandler}>
        <Form.Group controlId="address" className="my-2">
          <Form.Label>Адрес</Form.Label>
          <Form.Control
            type="text"
            placeholder="Введите адрес"
            value={address}
            required
            onChange={(e) => setAddress(e.target.value)}
          ></Form.Control>
        </Form.Group>

        <Form.Group controlId="city" className="my-2">
          <Form.Label>Город</Form.Label>
          <Form.Control
            type="text"
            placeholder="Введите город"
            value={city}
            required
            onChange={(e) => setCity(e.target.value)}
          ></Form.Control>
        </Form.Group>

        <Form.Group controlId="postalCode" className="my-2">
          <Form.Label>Почтовый индекс</Form.Label>
          <Form.Control
            type="text"
            placeholder="Введите почтовый индекс"
            value={postalCode}
            required
            onChange={(e) => setPostalCode(e.target.value)}
          ></Form.Control>
        </Form.Group>

        <Form.Group controlId="country" className="my-2">
          <Form.Label>Страна</Form.Label>
          <Form.Control
            type="text"
            placeholder="Введите страну"
            value={country}
            required
            onChange={(e) => setCountry(e.target.value)}
          ></Form.Control>
        </Form.Group>

        <h4 className="mt-4">Способ доставки</h4>
        <Form.Group controlId="deliveryService" className="my-2">
          <Form.Label>Служба</Form.Label>
          <Form.Select 
            value={deliveryService} 
            onChange={(e) => {
              setDeliveryService(e.target.value);
              setDeliveryCost(null);
            }}
          >
            <option value="Standard">Standard Delivery (3-5 дней)</option>
            <option value="Express">Express Delivery (1-2 дня)</option>
          </Form.Select>
        </Form.Group>

        <Button 
          type="button" 
          variant="outline-info" 
          className="mb-3"
          onClick={calculateHandler}
          disabled={loadingCalc}
        >
          {loadingCalc ? 'Считаем...' : 'Рассчитать стоимость и сроки'}
        </Button>

        {deliveryCost !== null && (
          <Card className="mb-3 bg-light">
            <Card.Body>
              <Card.Text><strong>Стоимость:</strong> {deliveryCost} руб.</Card.Text>
              <Card.Text><strong>Ожидаемая дата:</strong> {deliveryDate}</Card.Text>
            </Card.Body>
          </Card>
        )}

        <Button type="submit" variant="primary" className="mt-2 w-100">
          Продолжить
        </Button>
      </Form>
    </FormContainer>
  );
};

export default ShippingPage;
