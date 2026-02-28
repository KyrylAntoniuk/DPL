import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Row, Col, Image, ListGroup, Card, Button, Form } from 'react-bootstrap';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { useGetProductDetailsQuery, useCreateReviewMutation } from '../redux/api/productsApiSlice';
import { addToCart } from '../redux/slices/cartSlice';
import Rating from '../components/Rating';
import Loader from '../components/Loader';
import Message from '../components/Message';
import FavoriteIcon from '../components/FavoriteIcon';
import RatingSelect from '../components/RatingSelect'; // Импортируем новый компонент
import useTitle from '../hooks/useTitle';

const ProductPage = () => {
  const { id: productId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [qty, setQty] = useState(1);
  const [selectedOptions, setSelectedOptions] = useState({});
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');

  const { data: product, isLoading, error, refetch } = useGetProductDetailsQuery(productId);
  const [createReview, { isLoading: loadingReview }] = useCreateReviewMutation();
  const { userInfo } = useSelector((state) => state.auth);

  useTitle(product ? product.name : 'Товар');

  const { colorOptions, otherOptions } = useMemo(() => {
    if (!product?.variants) return { colorOptions: [], otherOptions: {} };
    const colors = new Set();
    const others = {};
    product.variants.forEach(variant => {
      for (const key in variant.options) {
        if (key.toLowerCase() === 'цвет' || key.toLowerCase() === 'color') {
          colors.add(variant.options[key]);
        } else {
          if (!others[key]) others[key] = new Set();
          others[key].add(variant.options[key]);
        }
      }
    });
    for (const key in others) {
      others[key] = Array.from(others[key]);
    }
    return { colorOptions: Array.from(colors), otherOptions: others };
  }, [product]);

  useEffect(() => {
    if (product?.variants?.length > 0) {
      const defaultColor = colorOptions[0];
      const newSelectedOptions = { color: defaultColor };
      const firstVariantOfColor = product.variants.find(v => v.options.color === defaultColor);
      if (firstVariantOfColor) {
        for (const key in otherOptions) {
          newSelectedOptions[key] = firstVariantOfColor.options[key];
        }
      }
      setSelectedOptions(newSelectedOptions);
    }
  }, [product, colorOptions, otherOptions]);

  const handleOptionSelect = (key, value) => {
    const newOptions = { ...selectedOptions, [key]: value };
    if (key.toLowerCase() === 'цвет' || key.toLowerCase() === 'color') {
      for (const otherKey in otherOptions) {
        const isCurrentOptionValid = product.variants.some(v => v.options.color === value && v.options[otherKey] === newOptions[otherKey]);
        if (!isCurrentOptionValid) {
          const firstValidVariant = product.variants.find(v => v.options.color === value);
          if (firstValidVariant) {
            newOptions[otherKey] = firstValidVariant.options[otherKey];
          }
        }
      }
    }
    setSelectedOptions(newOptions);
    setQty(1);
  };

  const currentVariant = useMemo(() => {
    if (!product?.variants || Object.keys(selectedOptions).length === 0) return product;
    return product.variants.find(variant => Object.entries(selectedOptions).every(([key, value]) => variant.options[key] === value)) || product;
  }, [product, selectedOptions]);

  const isOptionAvailable = (key, value) => {
    if (!selectedOptions.color) return false;
    return product.variants.some(v => v.options.color === selectedOptions.color && v.options[key] === value);
  };

  const addToCartHandler = () => {
    const itemToAdd = {
      ...product,
      qty,
      price: currentVariant.price || product.basePrice,
      image: currentVariant.image || product.generalImages[0],
      variantId: currentVariant._id,
      options: currentVariant.options,
      countInStock: currentVariant.countInStock,
    };
    dispatch(addToCart(itemToAdd));
    navigate('/cart');
    toast.success('Товар добавлен в корзину');
  };

  const submitReviewHandler = async (e) => {
    e.preventDefault();
    try {
      await createReview({ productId, rating, comment }).unwrap();
      refetch();
      toast.success('Отзыв успешно добавлен!');
      setRating(0);
      setComment('');
    } catch (err) {
      toast.error(err?.data?.message || err.error);
    }
  };

  const currentPrice = currentVariant?.price || product?.basePrice;
  const currentImage = currentVariant?.image || product?.generalImages[0];
  const countInStock = currentVariant?.countInStock || 0;

  return (
    <>
      <Link className="btn btn-light my-3" to="/">Назад</Link>
      {isLoading ? <Loader /> : error ? <Message variant="danger">{error?.data?.message || error.error}</Message> : (
        <>
          <Row>
            <Col md={5} className="position-relative">
              <FavoriteIcon productId={product._id} />
              <Image src={currentImage} alt={product.name} fluid />
            </Col>
            <Col md={4}>
              <ListGroup variant="flush">
                <ListGroup.Item><h3>{product.name}</h3></ListGroup.Item>
                <ListGroup.Item><Rating value={product.rating} text={`${product.numReviews} отзывов`} /></ListGroup.Item>
                <ListGroup.Item>Цена: ${currentPrice}</ListGroup.Item>
                {colorOptions.length > 0 && (
                  <ListGroup.Item>
                    <h5>Цвет:</h5>
                    {colorOptions.map(color => <Button key={color} variant={selectedOptions.color === color ? 'primary' : 'outline-secondary'} onClick={() => handleOptionSelect('color', color)} className="me-2 mb-2">{color}</Button>)}
                  </ListGroup.Item>
                )}
                {Object.entries(otherOptions).map(([key, values]) => (
                  <ListGroup.Item key={key}>
                    <h5>{key}:</h5>
                    {values.map(value => <Button key={value} variant={selectedOptions[key] === value ? 'primary' : 'outline-secondary'} onClick={() => handleOptionSelect(key, value)} className="me-2 mb-2" disabled={!isOptionAvailable(key, value)}>{value}</Button>)}
                  </ListGroup.Item>
                ))}
                <ListGroup.Item>Описание: {product.description}</ListGroup.Item>
              </ListGroup>
            </Col>
            <Col md={3}>
              <Card>
                <ListGroup variant="flush">
                  <ListGroup.Item><Row><Col>Цена:</Col><Col><strong>${currentPrice}</strong></Col></Row></ListGroup.Item>
                  <ListGroup.Item><Row><Col>Статус:</Col><Col>{countInStock > 0 ? 'В наличии' : 'Нет в наличии'}</Col></Row></ListGroup.Item>
                  {countInStock > 0 && (
                    <ListGroup.Item>
                      <Row>
                        <Col>Кол-во</Col>
                        <Col>
                          <Form.Control as="select" value={qty} onChange={(e) => setQty(Number(e.target.value))}>
                            {[...Array(countInStock).keys()].map((x) => (<option key={x + 1} value={x + 1}>{x + 1}</option>))}
                          </Form.Control>
                        </Col>
                      </Row>
                    </ListGroup.Item>
                  )}
                  <ListGroup.Item>
                    <Button className="btn-block" type="button" disabled={countInStock === 0} onClick={addToCartHandler}>Добавить в корзину</Button>
                  </ListGroup.Item>
                </ListGroup>
              </Card>
            </Col>
          </Row>
          <Row className="review mt-4">
            <Col md={6}>
              <h2>Отзывы</h2>
              {product.reviews && product.reviews.length === 0 && <Message>Отзывов пока нет</Message>}
              <ListGroup variant="flush">
                {product.reviews && product.reviews.map((review) => (
                  <ListGroup.Item key={review._id}>
                    <strong>{review.name}</strong>
                    <Rating value={review.rating} />
                    <p>{new Date(review.createdAt).toLocaleDateString()}</p>
                    <p>{review.comment}</p>
                  </ListGroup.Item>
                ))}
                <ListGroup.Item>
                  <h2>Оставьте свой отзыв</h2>
                  {loadingReview && <Loader />}
                  {userInfo ? (
                    <Form onSubmit={submitReviewHandler}>
                      <Form.Group controlId="rating" className="my-2">
                        <Form.Label>Оценка</Form.Label>
                        {/* Заменяем Form.Control на RatingSelect */}
                        <RatingSelect value={rating} onChange={setRating} />
                      </Form.Group>
                      <Form.Group controlId="comment" className="my-2">
                        <Form.Label>Комментарий</Form.Label>
                        <Form.Control as="textarea" rows={3} required value={comment} onChange={(e) => setComment(e.target.value)}></Form.Control>
                      </Form.Group>
                      <Button disabled={loadingReview} type="submit" variant="primary">Отправить</Button>
                    </Form>
                  ) : (
                    <Message>Пожалуйста, <Link to="/login">войдите</Link>, чтобы оставить отзыв</Message>
                  )}
                </ListGroup.Item>
              </ListGroup>
            </Col>
          </Row>
        </>
      )}
    </>
  );
};

export default ProductPage;
