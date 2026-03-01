import React from 'react';
import { Nav } from 'react-bootstrap';
import { LinkContainer } from 'react-router-bootstrap';
import { useTranslation } from 'react-i18next';

const CheckoutSteps = ({ step1, step2, step3, step4 }) => {
  const { t } = useTranslation();

  return (
    <Nav className="justify-content-center mb-4">
      <Nav.Item>
        {step1 ? (
          <LinkContainer to="/login">
            <Nav.Link>{t('auth.signIn')}</Nav.Link>
          </LinkContainer>
        ) : (
          <Nav.Link disabled>{t('auth.signIn')}</Nav.Link>
        )}
      </Nav.Item>

      <Nav.Item>
        {step2 ? (
          <LinkContainer to="/checkout/shipping">
            <Nav.Link>{t('shipping.title')}</Nav.Link>
          </LinkContainer>
        ) : (
          <Nav.Link disabled>{t('shipping.title')}</Nav.Link>
        )}
      </Nav.Item>

      <Nav.Item>
        {step3 ? (
          <LinkContainer to="/checkout/payment">
            <Nav.Link>{t('payment.title')}</Nav.Link>
          </LinkContainer>
        ) : (
          <Nav.Link disabled>{t('payment.title')}</Nav.Link>
        )}
      </Nav.Item>

      <Nav.Item>
        {step4 ? (
          <LinkContainer to="/checkout/placeorder">
            <Nav.Link>{t('placeOrder.title')}</Nav.Link>
          </LinkContainer>
        ) : (
          <Nav.Link disabled>{t('placeOrder.title')}</Nav.Link>
        )}
      </Nav.Item>
    </Nav>
  );
};

export default CheckoutSteps;
