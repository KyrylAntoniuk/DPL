import React from 'react';
import { Link } from 'react-router-dom';
import { Card } from 'react-bootstrap';
import Rating from './Rating';
import FavoriteIcon from './FavoriteIcon';

const ProductCard = ({ product }) => {
  // Проверяем наличие продукта, чтобы избежать ошибок
  if (!product) {
    return null;
  }

  // Адаптивно выбираем источник изображения
  const imageUrl = product.generalImages?.[0] || product.image || '/images/sample.jpg';
  
  // Адаптивно выбираем цену
  const price = product.basePrice !== undefined ? product.basePrice : product.price;

  return (
    <Card className="my-3 p-3 rounded product-card position-relative">
      <FavoriteIcon productId={product._id} />
      <Link to={`/product/${product._id}`}>
        <Card.Img src={imageUrl} variant="top" />
      </Link>

      <Card.Body>
        <Link to={`/product/${product._id}`}>
          <Card.Title as="div" className="product-title">
            <strong>{product.name}</strong>
          </Card.Title>
        </Link>

        {/* Отображаем рейтинг только если он есть */}
        {product.rating !== undefined && (
          <Card.Text as="div">
            <Rating value={product.rating} text={`${product.numReviews} отзывов`} />
          </Card.Text>
        )}

        {/* Отображаем цену только если она есть */}
        {price !== undefined && (
          <Card.Text as="h3">${price}</Card.Text>
        )}
      </Card.Body>
    </Card>
  );
};

export default ProductCard;
