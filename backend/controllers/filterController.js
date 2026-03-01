import asyncHandler from 'express-async-handler';
import FilterConfig from '../models/filterConfigModel.js';
import Product from '../models/productModel.js';

// @desc    Получить конфигурацию фильтров
// @route   GET /api/filters/config
// @access  Public
const getFilterConfig = asyncHandler(async (req, res) => {
  // Ищем конфиг или создаем дефолтный
  let config = await FilterConfig.findOne();
  if (!config) {
    config = await FilterConfig.create({
      filterableFields: [
        { key: 'brand', label: 'Бренд' }
      ]
    });
  }
  res.json(config);
});

// @desc    Обновить конфигурацию фильтров
// @route   PUT /api/filters/config
// @access  Private/Admin
const updateFilterConfig = asyncHandler(async (req, res) => {
  const { filterableFields } = req.body;
  
  let config = await FilterConfig.findOne();
  if (!config) {
    config = new FilterConfig();
  }

  config.filterableFields = filterableFields;
  await config.save();

  res.json(config);
});

// @desc    Получить значения для фильтров (динамически)
// @route   GET /api/filters
// @access  Public
const getFilters = asyncHandler(async (req, res) => {
  const queryParams = { ...req.query };
  // Удаляем служебные параметры, если они есть
  delete queryParams.pageNumber;
  delete queryParams.keyword;

  // Получаем конфиг
  let config = await FilterConfig.findOne();
  if (!config) {
    config = { filterableFields: [{ key: 'brand', label: 'Бренд' }] };
  }

  const filters = {};

  // Для каждого настроенного поля собираем уникальные значения
  for (const field of config.filterableFields) {
    let values = [];

    if (field.key === 'brand') {
      // Для бренда логика простая
      values = await Product.find(queryParams).distinct('brand');
    } else if (field.key.startsWith('specifications.')) {
      // Для характеристик сложнее: нужно искать внутри массива specifications
      // Ключ будет, например, "specifications.RAM" -> ищем спецификацию с name="RAM"
      const specName = field.key.split('.')[1];
      
      // Агрегация MongoDB для извлечения уникальных значений характеристик
      const result = await Product.aggregate([
        { $match: queryParams }, // Фильтруем товары (например, по категории)
        { $unwind: '$specifications' }, // Разворачиваем массив характеристик
        { $match: { 'specifications.name': specName } }, // Ищем нужную характеристику
        { $group: { _id: '$specifications.value' } }, // Группируем по значению
        { $sort: { _id: 1 } } // Сортируем
      ]);
      
      values = result.map(item => item._id);
    }

    if (values.length > 0) {
      filters[field.key] = {
        label: field.label,
        values: values
      };
    }
  }

  res.json(filters);
});

export { getFilterConfig, updateFilterConfig, getFilters };
