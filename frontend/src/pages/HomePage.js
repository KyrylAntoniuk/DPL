import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Row, Col } from 'react-bootstrap';
import { useGetProductsQuery } from '../redux/api/productsApiSlice';
import ProductCard from '../components/ProductCard';
import Loader from '../components/Loader';
import Message from '../components/Message';
import Paginate from '../components/Paginate';
import FilterSidebar from '../components/FilterSidebar'; // Импортируем сайдбар
import useTitle from '../hooks/useTitle';

const HomePage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [filters, setFilters] = useState({});

  // При монтировании компонента читаем фильтры из URL
  useEffect(() => {
    const currentParams = Object.fromEntries([...searchParams]);
    setFilters(currentParams);
  }, [searchParams]);

  // При изменении фильтров обновляем URL
  const handleSetFilters = (newFilters) => {
    setFilters(newFilters);
    // Очищаем от пустых значений перед записью в URL
    const cleanedFilters = Object.fromEntries(
      Object.entries(newFilters).filter(([, value]) => value && value.length > 0)
    );
    setSearchParams(cleanedFilters);
  };

  const { data, isLoading, error } = useGetProductsQuery(filters);
  useTitle('Каталог товаров');

  return (
    <Row>
      {/* Сайдбар с фильтрами */}
      <Col md={3}>
        <FilterSidebar 
          filters={filters} 
          setFilters={handleSetFilters} 
          products={data?.products}
        />
      </Col>

      {/* Основной контент с товарами */}
      <Col md={9}>
        <h1>Каталог товаров</h1>
        {isLoading ? (
          <Loader />
        ) : error ? (
          <Message variant="danger">{error?.data?.message || error.error}</Message>
        ) : (
          <>
            <Row>
              {data.products.map((product) => (
                <Col key={product._id} sm={12} md={6} lg={4} xl={3}>
                  <ProductCard product={product} />
                </Col>
              ))}
            </Row>
            <div className="d-flex justify-content-center mt-4">
              <Paginate
                pages={data.pages}
                page={data.page}
                // Пагинация должна учитывать текущие фильтры
                // (Эта логика будет доработана в Paginate.js)
              />
            </div>
          </>
        )}
      </Col>
    </Row>
  );
};

export default HomePage;
