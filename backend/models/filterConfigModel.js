import mongoose from 'mongoose';

const filterConfigSchema = new mongoose.Schema({
  filterableFields: [
    {
      key: { type: String, required: true },
      label: {
        en: { type: String, required: true },
        uk: { type: String, required: true },
      },
    }
  ],
});

const FilterConfig = mongoose.model('FilterConfig', filterConfigSchema);

export default FilterConfig;
