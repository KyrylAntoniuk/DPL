import mongoose from 'mongoose';

const filterSchema = new mongoose.Schema(
  {
    category: {
      type: String,
      required: true,
      unique: true, // Одна категория - один набор фильтров
    },
    filterGroups: [
      {
        name: { type: String, required: true }, // "Производитель"
        key: { type: String, required: true }, // "brand"
        uiType: {
          type: String,
          required: true,
          enum: ['checkbox', 'radio', 'range_slider'],
        },
        options: [{ type: String }], // ["Apple", "Samsung"]
        isActive: { type: Boolean, default: true },
      },
    ],
  },
  {
    timestamps: true,
  }
);

const Filter = mongoose.model('Filter', filterSchema);

export default Filter;