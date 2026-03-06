import React from 'react';
import { Row, Col, Container } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import { useGetTopProductsQuery, useGetNewProductsQuery } from '../redux/api/productsApiSlice';
import ProductCard from '../components/ProductCard';
import Loader from '../components/Loader';
import Hero from '../components/Hero';
import useTitle from '../hooks/useTitle';

const LandingPage = () => {
  const { t } = useTranslation();
  useTitle(t('home.welcome') || 'Welcome to DPL Shop');

  const { data: topProducts, isLoading: loadingTop } = useGetTopProductsQuery();
  const { data: newProducts, isLoading: loadingNew } = useGetNewProductsQuery();

  return (
    <>
      <Hero />

      <Container className="my-5">
        <h2 className="mb-4 text-center">{t('home.newArrivals') || 'New Arrivals'}</h2>
        {loadingNew ? <Loader /> : (
          <Row>
            {newProducts?.products?.map((product) => (
              <Col key={product._id} sm={12} md={6} lg={3}>
                <ProductCard product={product} />
              </Col>
            ))}
          </Row>
        )}
        
        <h2 className="mb-4 mt-5 text-center">{t('home.topRated') || 'Top Rated'}</h2>
        {loadingTop ? <Loader /> : (
          <Row>
            {topProducts?.products?.map((product) => (
              <Col key={product._id} sm={12} md={6} lg={3}>
                <ProductCard product={product} />
              </Col>
            ))}
          </Row>
        )}
      </Container>
    </>
  );
};

export default LandingPage;
