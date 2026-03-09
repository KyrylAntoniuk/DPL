import React from 'react';
import { Container, Button } from 'react-bootstrap';
import { LinkContainer } from 'react-router-bootstrap';
import { useTranslation } from 'react-i18next';

const Hero = () => {
  const { t } = useTranslation();

  return (
    <div className="hero-section text-center text-white d-flex align-items-center justify-content-center" style={{
      background: 'linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.5)), url("/images/hero-bg.jpg") no-repeat center center/cover',
      height: '60vh',
      marginBottom: '2rem',
      borderRadius: '12px',
      position: 'relative',
      overflow: 'hidden'
    }}>
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
        background: 'linear-gradient(45deg, #1a1a1a, #404040)',
        zIndex: -1
      }}></div>

      <Container>
        <h1 className="display-3 fw-bold mb-3">DPL Cyber Shop</h1>
        <p className="lead mb-4">
          {t('home.heroSubtitle') || 'Discover the latest technology at the best prices.'}
        </p>
        
        {/* Исправлено: передаем объект вместо строки с ? */}
        <LinkContainer to={{ pathname: '/catalog', search: '?category=Ноутбуки' }}>
          <Button variant="light" size="lg" className="me-3">
            {t('home.shopLaptops') || 'Shop Laptops'}
          </Button>
        </LinkContainer>
        
        <LinkContainer to={{ pathname: '/catalog', search: '?category=Смартфоны' }}>
          <Button variant="outline-light" size="lg">
            {t('home.shopPhones') || 'Shop Phones'}
          </Button>
        </LinkContainer>
      </Container>
    </div>
  );
};

export default Hero;
