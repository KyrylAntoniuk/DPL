import React, { useState, useEffect } from 'react';
import { Form, Button, Collapse } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import { FaChevronDown, FaChevronUp } from 'react-icons/fa'; // Импорт иконок
import { useGetProductCategoriesQuery, useGetDynamicFiltersQuery } from '../redux/api/productsApiSlice';
import useDebounce from '../hooks/useDebounce';
import Loader from './Loader';
import Message from './Message';

const FilterSidebar = ({ filters, setFilters }) => {
  const { t, i18n } = useTranslation();
  const { data: categories, isLoading: isLoadingCategories, error: errorCategories } = useGetProductCategoriesQuery();
  const { data: dynamicFilters, isLoading: isLoadingFilters } = useGetDynamicFiltersQuery(filters);

  const [keyword, setKeyword] = useState(filters.keyword || '');
  const debouncedKeyword = useDebounce(keyword, 500);

  // Состояние для свернутых секций. По умолчанию все открыты (true).
  // Храним ключи открытых секций.
  const [openSections, setOpenSections] = useState({
    search: true,
    category: true,
    // Динамические будут добавляться по мере загрузки
  });

  const toggleSection = (key) => {
    setOpenSections(prev => ({ ...prev, [key]: !prev[key] }));
  };

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

  // Стили для заголовка секции
  const sectionHeaderStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    cursor: 'pointer',
    marginBottom: '1rem',
    marginTop: '1.5rem',
  };

  return (
    <div className="filter-sidebar">
      <h4>{t('header.filters')}</h4>
      <hr />

      {/* Поиск */}
      <div>
        <div style={sectionHeaderStyle} onClick={() => toggleSection('search')}>
          <h5 className="m-0">{t('common.search')}</h5>
          {openSections.search ? <FaChevronUp size={12} /> : <FaChevronDown size={12} />}
        </div>
        <Collapse in={openSections.search}>
          <div>
            <Form.Group>
              <Form.Control
                type="text"
                placeholder={t('common.search')}
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
              />
            </Form.Group>
          </div>
        </Collapse>
        <hr />
      </div>

      {/* Категории */}
      <div>
        <div style={sectionHeaderStyle} onClick={() => toggleSection('category')}>
          <h5 className="m-0">{t('home.category')}</h5>
          {openSections.category ? <FaChevronUp size={12} /> : <FaChevronDown size={12} />}
        </div>
        <Collapse in={openSections.category}>
          <div>
            {isLoadingCategories ? <Loader /> : errorCategories ? <Message variant="danger">{t('common.error')}</Message> : (
              <Form.Group>
                {categories?.map(category => (
                  <Form.Check
                    key={category}
                    type="radio"
                    name="category"
                    id={`category-${category}`}
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
          </div>
        </Collapse>
        <hr />
      </div>

      {/* Динамические фильтры */}
      {isLoadingFilters ? <Loader /> : dynamicFilters && Object.entries(dynamicFilters).map(([key, filterData]) => {
        // Если секция еще не в стейте, считаем её открытой (или можно закрытой)
        const isOpen = openSections[key] !== false; 

        return (
          <div key={key}>
            <div 
              style={sectionHeaderStyle} 
              onClick={() => toggleSection(key)}
            >
              <h5 className="m-0">{filterData.label[i18n.language] || filterData.label.en || filterData.label}</h5>
              {isOpen ? <FaChevronUp size={12} /> : <FaChevronDown size={12} />}
            </div>
            <Collapse in={isOpen}>
              <div>
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
              </div>
            </Collapse>
            <hr />
          </div>
        );
      })}

      <Button variant="outline-secondary" onClick={handleResetFilters} className="w-100 mt-3">
        {t('common.resetFilters')}
      </Button>
    </div>
  );
};

export default FilterSidebar;
