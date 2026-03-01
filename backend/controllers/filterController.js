import asyncHandler from 'express-async-handler';
import FilterConfig from '../models/filterConfigModel.js';
import Product from '../models/productModel.js';

// @desc    Get filter configuration
// @route   GET /api/filters/config
// @access  Public
const getFilterConfig = asyncHandler(async (req, res) => {
  let config = await FilterConfig.findOne();
  
  if (!config) {
    config = await FilterConfig.create({
      filterableFields: [
        { key: 'brand', label: { en: 'Brand', ru: 'Бренд' } }
      ]
    });
  }
  res.json(config);
});

// @desc    Update filter configuration
// @route   PUT /api/filters/config
// @access  Private/Admin
const updateFilterConfig = asyncHandler(async (req, res) => {
  const { filterableFields } = req.body;
  
  let config = await FilterConfig.findOne();
  if (!config) config = new FilterConfig();

  config.filterableFields = filterableFields;
  await config.save();

  res.json(config);
});

const buildMongoFilter = (queryParams) => {
  const filter = {};

  for (const key in queryParams) {
    if (key.startsWith('specifications.')) {
      const specName = key.split('.')[1];
      const values = Array.isArray(queryParams[key]) ? queryParams[key] : [queryParams[key]];

      if (!filter.specifications) filter.specifications = { $all: [] };

      filter.specifications.$all.push({
        $elemMatch: { name: specName, value: { $in: values } }
      });
    } else if (key === 'brand') {
      const values = Array.isArray(queryParams[key]) ? queryParams[key] : [queryParams[key]];
      filter.brand = { $in: values };
    } else if (key === 'category') {
       filter.category = queryParams[key];
    } else {
      filter[key] = queryParams[key];
    }
  }
  return filter;
};

// @desc    Get dynamic filter values
// @route   GET /api/filters
// @access  Public
const getFilters = asyncHandler(async (req, res) => {
  const queryParams = { ...req.query };
  delete queryParams.pageNumber;
  delete queryParams.keyword;

  let config = await FilterConfig.findOne();
  if (!config) {
    config = { filterableFields: [{ key: 'brand', label: { en: 'Brand', ru: 'Бренд' } }] };
  }

  const filters = {};

  for (const field of config.filterableFields) {
    let values = [];

    // Exclude current field filter to show all options
    const currentFieldParams = { ...queryParams };
    delete currentFieldParams[field.key];
    
    const mongoFilter = buildMongoFilter(currentFieldParams);

    if (field.key === 'brand') {
      values = await Product.find(mongoFilter).distinct('brand');
    } else if (field.key.startsWith('specifications.')) {
      const specName = field.key.split('.')[1];
      
      const result = await Product.aggregate([
        { $match: mongoFilter },
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
