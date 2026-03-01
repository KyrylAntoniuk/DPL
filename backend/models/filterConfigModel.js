import mongoose from 'mongoose';

const filterConfigSchema = new mongoose.Schema({
  // Список ключей, по которым нужно строить фильтры
  // Например: ['brand', 'specifications.RAM', 'specifications.Color']
  filterableFields: [
    {
      key: { type: String, required: true }, // Ключ в базе данных (или путь)
      label: { type: String, required: true }, // Название для отображения (например, "Оперативная память")
    }
  ],
});

const FilterConfig = mongoose.model('FilterConfig', filterConfigSchema);

export default FilterConfig;
