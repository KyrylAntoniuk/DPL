import React, { useEffect, useState } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { Row, Col, Button, Offcanvas } from 'react-bootstrap';
import { FaFilter } from 'react-icons/fa';
import { useTranslation } from 'react-i18next';
import { useGetProductsQuery } from '../redux/api/productsApiSlice';
import ProductCard from '../components/ProductCard';
import Loader from '../components/Loader';
import Message from '../components/Message';
import Paginate from '../components/Paginate';
import FilterSidebar from '../components/FilterSidebar';
import useTitle from '../hooks/useTitle';

const HomePage = () => {
  const { pageNumber, keyword, category } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const [showFilters, setShowFilters] = useState(false);

  const queryParams = {
    pageNumber: pageNumber || 1,
    keyword: keyword || '',
  };

  for (const [key, value] of searchParams.entries()) {
    const values = searchParams.getAll(key);
    queryParams[key] = values.length > 1 ? values : value;
  }

  if (category) queryParams.category = category;

  useEffect(() => {
    console.log('Query Params sent to backend:', queryParams);
  }, [queryParams]);

  const { data, isLoading, error } = useGetProductsQuery(queryParams);
  
  useTitle(category ? `${t('home.title')}: ${t(`categories.${category}`, category)}` : t('home.title'));

  const handleSetFilters = (newFilters) => {
    const params = {};
    Object.entries(newFilters).forEach(([key, value]) => {
      if (value && value.length > 0) params[key] = value;
    });
    
    setSearchParams(params);

    if (pageNumber && pageNumber !== '1') {
      let newPath = '/catalog'; // Базовый путь каталога
      if (category) newPath = `/catalog/${category}`;
      else if (keyword) newPath = `/search/${keyword}`;
      
      navigate({ pathname: newPath, search: new URLSearchParams(params).toString() });
    }
  };

  const filters = {};
  for (const [key] of searchParams.entries()) {
    const values = searchParams.getAll(key);
    filters[key] = values.length > 1 ? values : values[0];
  }
  if (category) filters.category = category;

  return (
    <Row>
      <Col md={3} className="d-none d-md-block">
        <FilterSidebar filters={filters} setFilters={handleSetFilters} />
      </Col>

      <Col md={9}>
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h1>{t('home.title')}</h1>
          
          <Button variant="outline-dark" className="d-md-none" onClick={() => setShowFilters(true)}>
            <FaFilter /> {t('header.filters')}
          </Button>
        </div>

        <Offcanvas show={showFilters} onHide={() => setShowFilters(false)} placement="start">
          <Offcanvas.Header closeButton>
            <Offcanvas.Title>{t('header.filters')}</Offcanvas.Title>
          </Offcanvas.Header>
          <Offcanvas.Body>
            <FilterSidebar filters={filters} setFilters={handleSetFilters} />
          </Offcanvas.Body>
        </Offcanvas>

        {isLoading ? <Loader /> : error ? (
          <Message variant="danger">{error?.data?.message || error.error}</Message>
        ) : (
          <>
            {data.products.length === 0 ? <Message>{t('home.noProducts')}</Message> : (
              <Row>
                {data.products.map((product) => (
                  <Col key={product._id} sm={12} md={6} lg={4} xl={3}>
                    <ProductCard product={product} />
                  </Col>
                ))}
              </Row>
            )}
            <div className="d-flex justify-content-center mt-4">
              <Paginate pages={data.pages} page={data.page} keyword={keyword} category={category} />
            </div>
          </>
        )}
      </Col>
    </Row>
  );
};

export default HomePage;
