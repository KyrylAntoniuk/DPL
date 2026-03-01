import React, { useEffect } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom'; // Добавил useNavigate
import { Row, Col } from 'react-bootstrap';
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
  const navigate = useNavigate(); // Хук для навигации

  const queryParams = {
    pageNumber: pageNumber || 1,
    keyword: keyword || '',
  };

  for (const [key, value] of searchParams.entries()) {
    const values = searchParams.getAll(key);
    if (values.length > 1) {
      queryParams[key] = values;
    } else {
      queryParams[key] = value;
    }
  }

  if (category) {
    queryParams.category = category;
  }

  useEffect(() => {
    console.log('Query Params sent to backend:', queryParams);
  }, [queryParams]);

  const { data, isLoading, error } = useGetProductsQuery(queryParams);
  
  useTitle(category ? `Категория: ${category}` : 'Главная');

  const handleSetFilters = (newFilters) => {
    const params = {};
    Object.entries(newFilters).forEach(([key, value]) => {
      if (value && value.length > 0) {
        params[key] = value;
      }
    });
    
    setSearchParams(params);

    // ИСПРАВЛЕНО: Если мы не на первой странице, сбрасываем на первую
    if (pageNumber && pageNumber !== '1') {
      // Формируем новый URL. 
      // Если есть категория, сохраняем её. Если есть поиск, сохраняем его.
      // Но убираем /page/X
      let newPath = '/';
      if (category) {
        newPath = `/catalog/${category}`;
      } else if (keyword) {
        newPath = `/search/${keyword}`;
      }
      
      // Переходим на новый путь с сохранением query-параметров
      // createSearchParams превращает объект params в строку запроса
      navigate({
        pathname: newPath,
        search: new URLSearchParams(params).toString()
      });
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
      <Col md={3}>
        <FilterSidebar 
          filters={filters} 
          setFilters={handleSetFilters} 
        />
      </Col>

      <Col md={9}>
        <h1>Каталог товаров</h1>
        {isLoading ? (
          <Loader />
        ) : error ? (
          <Message variant="danger">
            {error?.data?.message || error.error}
          </Message>
        ) : (
          <>
            {data.products.length === 0 ? (
              <Message>Товары не найдены</Message>
            ) : (
              <Row>
                {data.products.map((product) => (
                  <Col key={product._id} sm={12} md={6} lg={4} xl={3}>
                    <ProductCard product={product} />
                  </Col>
                ))}
              </Row>
            )}
            <div className="d-flex justify-content-center mt-4">
              <Paginate
                pages={data.pages}
                page={data.page}
                keyword={keyword ? keyword : ''}
                category={category ? category : ''}
              />
            </div>
          </>
        )}
      </Col>
    </Row>
  );
};

export default HomePage;
