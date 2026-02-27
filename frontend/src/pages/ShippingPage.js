import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Form, Button } from 'react-bootstrap';
import { saveShippingAddress } from '../redux/slices/cartSlice';
import FormContainer from '../components/FormContainer';
import CheckoutSteps from '../components/CheckoutSteps';
import useTitle from '../hooks/useTitle';

const ShippingPage = () => {
  useTitle('Адрес доставки');
  const cart = useSelector((state) => state.cart);
  const { shippingAddress } = cart;

  // Если адрес уже был введен, используем его. Иначе - пустые строки.
  const [address, setAddress] = useState(shippingAddress?.address || '');
  const [city, setCity] = useState(shippingAddress?.city || '');
  const [postalCode, setPostalCode] = useState(shippingAddress?.postalCode || '');
  const [country, setCountry] = useState(shippingAddress?.country || '');

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const submitHandler = (e) => {
    e.preventDefault();
    dispatch(saveShippingAddress({ address, city, postalCode, country }));
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

        <Button type="submit" variant="primary" className="mt-2">
          Продолжить
        </Button>
      </Form>
    </FormContainer>
  );
};

export default ShippingPage;
