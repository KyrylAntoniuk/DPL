import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';
import { Row, Col, Image, ListGroup, Card, Button, Form } from 'react-bootstrap';
import { useDispatch } from 'react-redux';
import { toast } from 'react-toastify';
import { useGetProductByIdQuery } from '../redux/api/productsApiSlice';
import { addToCart } from '../redux/slices/cartSlice';
import Rating from '../components/Rating';
import Loader from '../components/Loader';
import Message from '../components/Message';
import FavoriteIcon from '../components/FavoriteIcon'; // Импортируем иконку
import useTitle from '../hooks/useTitle';

const ProductPage = () => {
  const { id: productId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [qty, setQty] = useState(1);
  const [selectedOptions, setSelectedOptions] = useState({});

  const { data: product, isLoading, error } = useGetProductByIdQuery(productId);
  useTitle(product ? product.name : 'Товар');

  const optionGroups = useMemo(() => {
    if (!product?.variants) return {};
    const groups = {};
    product.variants.forEach(variant => {
      for (const key in variant.options) {
        if (!groups[key]) groups[key] = new Set();
        groups[key].add(variant.options[key]);
      }
    });
    for (const key in groups) {
      groups[key] = Array.from(groups[key]);
    }
    return groups;
  }, [product]);

  useEffect(() => {
    if (product?.variants?.length > 0) {
      const defaultOptions = {};
      for (const key in optionGroups) {
        defaultOptions[key] = optionGroups[key][0];
      }
      setSelectedOptions(defaultOptions);
    }
  }, [product, optionGroups]);

  const currentVariant = useMemo(() => {
    if (!product?.variants || Object.keys(selectedOptions).length === 0) return null;
    return product.variants.find(variant => 
      Object.entries(selectedOptions).every(([key, value]) => variant.options[key] === value)
    );
  }, [product, selectedOptions]);

  const handleOptionSelect = (key, value) => {
    setSelectedOptions(prev => ({ ...prev, [key]: value }));
    setQty(1);
  };

  const addToCartHandler = () => {
    const itemToAdd = {
      ...product,
      qty,
      price: currentVariant ? currentVariant.price : product.basePrice,
      image: currentVariant ? currentVariant.image : product.generalImages[0],
      variantId: currentVariant ? currentVariant._id : null,
      options: currentVariant ? currentVariant.options : {},
      countInStock: currentVariant ? currentVariant.countInStock : product.countInStock,
    };
    dispatch(addToCart(itemToAdd));
    navigate('/cart');
    toast.success('Товар добавлен в корзину');
  };

  const currentPrice = currentVariant ? currentVariant.price : product?.basePrice;
  const currentImage = currentVariant ? currentVariant.image : product?.generalImages[0];
  const countInStock = currentVariant ? currentVariant.countInStock : product?.countInStock;

  return (
    <>
      <Link className="btn btn-light my-3" to="/">
        Назад
      </Link>

      {isLoading ? (
        <Loader />
      ) : error ? (
        <Message variant="danger">{error?.data?.message || error.error}</Message>
      ) : (
        <Row>
          <Col md={5} className="position-relative">
            <FavoriteIcon productId={product._id} />
            <Image src={currentImage} alt={product.name} fluid />
          </Col>
          <Col md={4}>
            <ListGroup variant="flush">
              <ListGroup.Item>
                <h3>{product.name}</h3>
              </ListGroup.Item>
              <ListGroup.Item>
                <Rating value={product.rating} text={`${product.numReviews} отзывов`} />
              </ListGroup.Item>
              <ListGroup.Item>Цена: ${currentPrice}</ListGroup.Item>
              
              {Object.entries(optionGroups).map(([key, values]) => (
                <ListGroup.Item key={key}>
                  <h5>{key}:</h5>
                  {values.map(value => (
                    <Button
                      key={value}
                      variant={selectedOptions[key] === value ? 'primary' : 'outline-secondary'}
                      onClick={() => handleOptionSelect(key, value)}
                      className="me-2 mb-2"
                    >
                      {value}
                    </Button>
                  ))}
                </ListGroup.Item>
              ))}

              <ListGroup.Item>Описание: {product.description}</ListGroup.Item>
            </ListGroup>
          </Col>
          <Col md={3}>
            <Card>
              <ListGroup variant="flush">
                <ListGroup.Item>
                  <Row>
                    <Col>Цена:</Col>
                    <Col>
                      <strong>${currentPrice}</strong>
                    </Col>
                  </Row>
                </ListGroup.Item>
                <ListGroup.Item>
                  <Row>
                    <Col>Статус:</Col>
                    <Col>{countInStock > 0 ? 'В наличии' : 'Нет в наличии'}</Col>
                  </Row>
                </ListGroup.Item>

                {countInStock > 0 && (
                  <ListGroup.Item>
                    <Row>
                      <Col>Кол-во</Col>
                      <Col>
                        <Form.Control
                          as="select"
                          value={qty}
                          onChange={(e) => setQty(Number(e.target.value))}
                        >
                          {[...Array(countInStock).keys()].map((x) => (
                            <option key={x + 1} value={x + 1}>
                              {x + 1}
                            </option>
                          ))}
                        </Form.Control>
                      </Col>
                    </Row>
                  </ListGroup.Item>
                )}

                <ListGroup.Item>
                  <Button
                    className="btn-block"
                    type="button"
                    disabled={!currentVariant || countInStock === 0}
                    onClick={addToCartHandler}
                  >
                    Добавить в корзину
                  </Button>
                </ListGroup.Item>
              </ListGroup>
            </Card>
          </Col>
        </Row>
      )}
    </>
  );
};

export default ProductPage;
