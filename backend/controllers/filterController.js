import asyncHandler from 'express-async-handler';
import FilterConfig from '../models/filterConfigModel.js';
import Product from '../models/productModel.js';

// @desc    Получить конфигурацию фильтров
// @route   GET /api/filters/config
// @access  Public
const getFilterConfig = asyncHandler(async (req, res) => {
  // Ищем конфиг
  let config = await FilterConfig.findOne();
  
  // Если конфига нет в БД, создаем его и СОХРАНЯЕМ
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
  delete queryParams.pageNumber;
  delete queryParams.keyword;

  let config = await FilterConfig.findOne();
  if (!config) {
    // Если конфига нет, используем дефолтный в памяти, но не сохраняем (чтобы не мусорить при каждом запросе)
    config = { filterableFields: [{ key: 'brand', label: 'Бренд' }] };
  }

  const filters = {};

  for (const field of config.filterableFields) {
    let values = [];

    if (field.key === 'brand') {
      values = await Product.find(queryParams).distinct('brand');
    } else if (field.key.startsWith('specifications.')) {
      const specName = field.key.split('.')[1];
      
      const result = await Product.aggregate([
        { $match: queryParams },
        { $unwind: '$specifications' },
        { $match: { 'specifications.name': specName } },
        { $group: { _id: '$specifications.value' } },
        { $sort: { _id: 1 } }
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
