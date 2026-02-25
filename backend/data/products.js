const products = [
  {
    name: 'Apple iPhone 15 Pro',
    brand: 'Apple',
    category: 'Смартфоны',
    description: 'Новый iPhone 15 Pro с титановым корпусом и процессором A17 Pro.',
    basePrice: 999,
    generalImages: ['/images/iphone15pro-main.jpg'],
    specifications: [
      { name: 'Диагональ экрана', value: '6.1 дюйма' },
      { name: 'Процессор', value: 'Apple A17 Pro' },
    ],
    variants: [
      {
        options: { color: 'Natural Titanium', storage: '256GB' },
        price: 1099,
        countInStock: 10,
        images: ['/images/iphone15pro-natural.jpg'],
      },
      {
        options: { color: 'Blue Titanium', storage: '256GB' },
        price: 1099,
        countInStock: 5,
        images: ['/images/iphone15pro-blue.jpg'],
      }
    ],
  },
  {
    name: 'Apple MacBook Pro 14"',
    brand: 'Apple',
    category: 'Ноутбуки',
    description: 'Мощный ноутбук для профессионалов на базе чипа M3 Pro.',
    basePrice: 1999,
    generalImages: ['/images/macbookpro14-main.jpg'],
    specifications: [
      { name: 'Диагональ экрана', value: '14.2 дюйма' },
      { name: 'Оперативная память', value: '18 ГБ' },
    ],
    variants: [
      {
        options: { color: 'Space Black', storage: '512GB SSD' },
        price: 1999,
        countInStock: 7,
        images: ['/images/macbookpro14-black.jpg'],
      }
    ],
  }
];

export default products;