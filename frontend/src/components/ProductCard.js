import React from 'react';
import { Link } from 'react-router-dom';
import { Card } from 'react-bootstrap';
import Rating from './Rating';
import FavoriteIcon from './FavoriteIcon';

const ProductCard = ({ product }) => {
  if (!product) return null;

  const imageUrl = product.generalImages?.[0] || product.image || '/images/sample.jpg';
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

        {product.rating !== undefined && (
          <Card.Text as="div">
            <Rating value={product.rating} text={`${product.numReviews} reviews`} />
          </Card.Text>
        )}

        {price !== undefined && (
          <Card.Text as="h3">${price}</Card.Text>
        )}
      </Card.Body>
    </Card>
  );
};

export default ProductCard;
