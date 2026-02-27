import React from 'react';
import { Form, Button } from 'react-bootstrap';
import { useGetProductCategoriesQuery, useGetProductFiltersQuery } from '../redux/api/productsApiSlice';
import Loader from './Loader';
import Message from './Message';

const FilterSidebar = ({ filters, setFilters }) => {
  // Загружаем категории (это не меняется)
  const { data: categories, isLoading: isLoadingCategories, error: errorCategories } = useGetProductCategoriesQuery();

  // Загружаем динамические фильтры (бренды и т.д.), передавая текущую категорию
  const { data: dynamicFilters, isLoading: isLoadingFilters, error: errorFilters } = useGetProductFiltersQuery(
    { category: filters.category },
    { skip: !filters.category } // Пропускаем запрос, если категория не выбрана
  );

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
    
    // Если меняем категорию, сбрасываем бренд, т.к. он зависит от категории
    if (name === 'category') {
      delete newFilters.brand;
    }

    setFilters(newFilters);
  };

  const handleResetFilters = () => {
    setFilters({});
  };

  return (
    <div className="filter-sidebar">
      <h4>Фильтры</h4>
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

      {/* Фильтр по брендам (появляется после выбора категории) */}
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
