import React, { useState, useEffect } from 'react';
import { Form, Button } from 'react-bootstrap';
import { useGetProductCategoriesQuery, useGetProductFiltersQuery } from '../redux/api/productsApiSlice';
import useDebounce from '../hooks/useDebounce'; // 1. Импорт
import Loader from './Loader';
import Message from './Message';

const FilterSidebar = ({ filters, setFilters }) => {
  const { data: categories, isLoading: isLoadingCategories, error: errorCategories } = useGetProductCategoriesQuery();
  const { data: dynamicFilters, isLoading: isLoadingFilters, error: errorFilters } = useGetProductFiltersQuery(
      { category: filters.category },
      { skip: !filters.category }
  );

  // 2. Локальное состояние для поля поиска
  const [keyword, setKeyword] = useState(filters.keyword || '');
  const debouncedKeyword = useDebounce(keyword, 500); // 3. Применяем debounce

  // 4. Эффект, который сработает только после паузы во вводе
  useEffect(() => {
    handleFilterChange({ target: { name: 'keyword', value: debouncedKeyword } });
  }, [debouncedKeyword]);

  const handleFilterChange = (e) => {
    const { name, value, type, checked } = e.target;
    let newFilters = { ...filters };

    if (type === 'checkbox') {
      const currentValues = newFilters[name] || [];
      if (checked) {
        newFilters[name] = [...currentValues, value];
      } else {
        newFilters[name] = currentValues.filter(v => v !== value);
      }
    } else {
      newFilters[name] = value;
    }

    if (name === 'category') {
      delete newFilters.brand;
    }

    setFilters(newFilters);
  };

  const handleResetFilters = () => {
    setKeyword('');
    setFilters({});
  };

  return (
      <div className="filter-sidebar">
        <h4>Фильтры</h4>
        <hr />

        {/* Поиск по названию */}
        <h5>Поиск</h5>
        <Form.Group>
          <Form.Control
              type="text"
              placeholder="Название товара..."
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
          />
        </Form.Group>
        <hr />

        {/* Фильтр по категориям */}
        <h5>Категория</h5>
        {isLoadingCategories ? <Loader /> : errorCategories ? <Message variant="danger">Ошибка</Message> : (
            <Form.Group>
              {categories?.map(category => (
                  <Form.Check
                      key={category}
                      type="radio"
                      name="category"
                      id={`category-${category}`}
                      label={category}
                      value={category}
                      checked={filters.category === category}
                      onChange={handleFilterChange}
                  />
              ))}
            </Form.Group>
        )}
        <hr />

        {/* Фильтр по брендам */}
        {filters.category && (
            <>
              <h5>Бренд</h5>
              {isLoadingFilters ? <Loader /> : errorFilters ? <Message variant="danger">Ошибка</Message> : (
                  <Form.Group>
                    {dynamicFilters?.brands?.map(brand => (
                        <Form.Check
                            key={brand}
                            type="checkbox"
                            name="brand"
                            id={`brand-${brand}`}
                            label={brand}
                            value={brand}
                            checked={(filters.brand || []).includes(brand)}
                            onChange={handleFilterChange}
                        />
                    ))}
                  </Form.Group>
              )}
              <hr />
            </>
        )}

        <Button variant="outline-secondary" onClick={handleResetFilters} className="w-100">
          Сбросить все фильтры
        </Button>
      </div>
  );
};

export default FilterSidebar;