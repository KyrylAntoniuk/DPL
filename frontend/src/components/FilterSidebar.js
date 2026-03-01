import React, { useState, useEffect } from 'react';
import { Form, Button } from 'react-bootstrap';
import { useTranslation } from 'react-i18next'; // Импорт
import { useGetProductCategoriesQuery, useGetDynamicFiltersQuery } from '../redux/api/productsApiSlice';
import useDebounce from '../hooks/useDebounce';
import Loader from './Loader';
import Message from './Message';

const FilterSidebar = ({ filters, setFilters }) => {
  const { t, i18n } = useTranslation(); // Хук
  const { data: categories, isLoading: isLoadingCategories, error: errorCategories } = useGetProductCategoriesQuery();
  
  const { data: dynamicFilters, isLoading: isLoadingFilters } = useGetDynamicFiltersQuery(filters);

  const [keyword, setKeyword] = useState(filters.keyword || '');
  const debouncedKeyword = useDebounce(keyword, 500);

  useEffect(() => {
    handleFilterChange({ target: { name: 'keyword', value: debouncedKeyword } });
  }, [debouncedKeyword]);

  const handleFilterChange = (e) => {
    const { name, value, type, checked } = e.target;
    let newFilters = { ...filters };

    if (type === 'checkbox') {
      let currentValues = newFilters[name];
      
      if (!currentValues) {
        currentValues = [];
      } else if (!Array.isArray(currentValues)) {
        currentValues = [currentValues];
      }

      if (checked) {
        newFilters[name] = [...currentValues, value];
      } else {
        newFilters[name] = currentValues.filter(v => v !== value);
      }
    } else {
      newFilters[name] = value;
    }
    
    setFilters(newFilters);
  };

  const handleResetFilters = () => {
    setKeyword('');
    setFilters({});
  };

  const isChecked = (key, val) => {
    const filterValue = filters[key];
    if (!filterValue) return false;
    if (Array.isArray(filterValue)) return filterValue.includes(val);
    return filterValue === val;
  };

  return (
    <div className="filter-sidebar">
      <h4>{t('header.filters')}</h4>
      <hr />

      <h5>{t('common.search')}</h5>
      <Form.Group>
        <Form.Control
          type="text"
          placeholder={t('common.search')}
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
        />
      </Form.Group>
      <hr />

      <h5>{t('home.category')}</h5>
      {isLoadingCategories ? <Loader /> : errorCategories ? <Message variant="danger">{t('common.error')}</Message> : (
        <Form.Group>
          {categories?.map(category => (
            <Form.Check
              key={category}
              type="radio"
              name="category"
              id={`category-${category}`}
              // Переводим категорию. Если перевода нет, выводим оригинал.
              label={t(`categories.${category}`, category)}
              value={category}
              checked={filters.category === category}
              onClick={() => {
                if (filters.category === category) {
                  const newFilters = { ...filters };
                  delete newFilters.category;
                  setFilters(newFilters);
                }
              }}
              onChange={handleFilterChange}
            />
          ))}
        </Form.Group>
      )}
      <hr />

      {/* Динамические фильтры */}
      {isLoadingFilters ? <Loader /> : dynamicFilters && Object.entries(dynamicFilters).map(([key, filterData]) => (
        <div key={key}>
          <h5>{filterData.label[i18n.language] || filterData.label.en || filterData.label}</h5>
          <Form.Group>
            {filterData.values.map(val => (
              <Form.Check
                key={val}
                type="checkbox"
                name={key}
                id={`${key}-${val}`}
                label={val}
                value={val}
                checked={isChecked(key, val)}
                onChange={handleFilterChange}
              />
            ))}
          </Form.Group>
          <hr />
        </div>
      ))}

      <Button variant="outline-secondary" onClick={handleResetFilters} className="w-100">
        {t('common.resetFilters')}
      </Button>
    </div>
  );
};

export default FilterSidebar;
