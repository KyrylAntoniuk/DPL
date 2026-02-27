import asyncHandler from 'express-async-handler';
import Filter from '../models/filterModel.js';

// @desc    Получить фильтры для категории
// @route   GET /api/filters/:category
// @access  Public
const getFiltersByCategory = asyncHandler(async (req, res) => {
  const filters = await Filter.findOne({ category: req.params.category });

  if (filters) {
    res.json(filters);
  } else {
    res.status(404);
    throw new Error('Фильтры для этой категории не найдены');
  }
});

// @desc    Создать конфигурацию фильтров
// @route   POST /api/filters
// @access  Private/Manager/Admin
const createFilter = asyncHandler(async (req, res) => {
  const { category, filterGroups } = req.body;

  const filterExists = await Filter.findOne({ category });

  if (filterExists) {
    res.status(400);
    throw new Error('Фильтры для этой категории уже существуют');
  }

  const filter = await Filter.create({
    category,
    filterGroups,
  });

  if (filter) {
    res.status(201).json(filter);
  } else {
    res.status(400);
    throw new Error('Неверные данные фильтра');
  }
});

// @desc    Обновить фильтры
// @route   PUT /api/filters/:id
// @access  Private/Manager/Admin
const updateFilter = asyncHandler(async (req, res) => {
  const filter = await Filter.findById(req.params.id);

  if (filter) {
    filter.category = req.body.category || filter.category;
    filter.filterGroups = req.body.filterGroups || filter.filterGroups;

    const updatedFilter = await filter.save();
    res.json(updatedFilter);
  } else {
    res.status(404);
    throw new Error('Фильтр не найден');
  }
});

// @desc    Получить все фильтры (для админки)
// @route   GET /api/filters
// @access  Private/Manager/Admin
const getFilters = asyncHandler(async (req, res) => {
  const filters = await Filter.find({});
  res.json(filters);
});

// @desc    Удалить фильтр
// @route   DELETE /api/filters/:id
// @access  Private/Admin
const deleteFilter = asyncHandler(async (req, res) => {
  const filter = await Filter.findById(req.params.id);

  if (filter) {
    await Filter.deleteOne({ _id: filter._id });
    res.json({ message: 'Фильтр удален' });
  } else {
    res.status(404);
    throw new Error('Фильтр не найден');
  }
});

export { 
  getFiltersByCategory, 
  createFilter, 
  updateFilter, 
  getFilters, 
  deleteFilter 
};