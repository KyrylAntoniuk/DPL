import React from 'react';
import { Nav } from 'react-bootstrap';
import { LinkContainer } from 'react-router-bootstrap';

const CheckoutSteps = ({ step1, step2, step3, step4 }) => {
  return (
    <Nav className="justify-content-center mb-4">
      <Nav.Item>
        {step1 ? (
          <LinkContainer to="/login">
            <Nav.Link>Вход</Nav.Link>
          </LinkContainer>
        ) : (
          <Nav.Link disabled>Вход</Nav.Link>
        )}
      </Nav.Item>

      <Nav.Item>
        {step2 ? (
          <LinkContainer to="/checkout/shipping">
            <Nav.Link>Доставка</Nav.Link>
          </LinkContainer>
        ) : (
          <Nav.Link disabled>Доставка</Nav.Link>
        )}
      </Nav.Item>

      <Nav.Item>
        {step3 ? (
          <LinkContainer to="/checkout/payment">
            <Nav.Link>Оплата</Nav.Link>
          </LinkContainer>
        ) : (
          <Nav.Link disabled>Оплата</Nav.Link>
        )}
      </Nav.Item>

      <Nav.Item>
        {step4 ? (
          <LinkContainer to="/checkout/placeorder">
            <Nav.Link>Подтверждение</Nav.Link>
          </LinkContainer>
        ) : (
          <Nav.Link disabled>Подтверждение</Nav.Link>
        )}
      </Nav.Item>
    </Nav>
  );
};

export default CheckoutSteps;
