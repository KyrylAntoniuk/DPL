import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Row, Col, Image, ListGroup, Card, Button, Form, Table } from 'react-bootstrap';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { useTranslation, Trans } from 'react-i18next';
import { useGetProductDetailsQuery, useCreateReviewMutation } from '../redux/api/productsApiSlice';
import { addToCart } from '../redux/slices/cartSlice';
import Rating from '../components/Rating';
import Loader from '../components/Loader';
import Message from '../components/Message';
import FavoriteIcon from '../components/FavoriteIcon';
import RatingSelect from '../components/RatingSelect';
import useTitle from '../hooks/useTitle';

const ProductPage = () => {
  const { id: productId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { t } = useTranslation();

  const [qty, setQty] = useState(1);
  const [selectedOptions, setSelectedOptions] = useState({});
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');

  const { data: product, isLoading, error, refetch } = useGetProductDetailsQuery(productId);
  const [createReview, { isLoading: loadingReview }] = useCreateReviewMutation();
  const { userInfo } = useSelector((state) => state.auth);

  useTitle(product ? product.name : t('home.title'));

  // --- Variant Logic ---

  const { colorOptions, otherOptions } = useMemo(() => {
    if (!product?.variants) return { colorOptions: [], otherOptions: {} };

    const colors = new Set();
    const others = {};

    product.variants.forEach(variant => {
      if (variant.options) {
        const colorKey = Object.keys(variant.options).find(k => k.toLowerCase() === 'color' || k.toLowerCase() === 'цвет');
        if (colorKey) colors.add(variant.options[colorKey]);

        for (const key in variant.options) {
          if (key.toLowerCase() !== 'color' && key.toLowerCase() !== 'цвет') {
            if (!others[key]) others[key] = new Set();
            others[key].add(variant.options[key]);
          }
        }
      }
    });

    for (const key in others) others[key] = Array.from(others[key]);

    return { colorOptions: Array.from(colors), otherOptions: others };
  }, [product]);

  useEffect(() => {
    if (product?.variants?.length > 0) {
      const defaultOptions = {};
      
      if (colorOptions.length > 0) {
        const defaultColor = colorOptions[0];
        const firstVariant = product.variants[0];
        const colorKey = Object.keys(firstVariant.options).find(k => k.toLowerCase() === 'color' || k.toLowerCase() === 'цвет');
        if (colorKey) defaultOptions[colorKey] = defaultColor;
      }

      const baseVariant = product.variants.find(v => {
          if (colorOptions.length === 0) return true;
          const cKey = Object.keys(v.options).find(k => k.toLowerCase() === 'color' || k.toLowerCase() === 'цвет');
          return v.options[cKey] === colorOptions[0];
      }) || product.variants[0];

      if (baseVariant && baseVariant.options) {
        for (const key in baseVariant.options) {
            const isColor = key.toLowerCase() === 'color' || key.toLowerCase() === 'цвет';
            if (!isColor) defaultOptions[key] = baseVariant.options[key];
        }
      }
      
      setSelectedOptions(defaultOptions);
    }
  }, [product, colorOptions]);

  const handleOptionSelect = (key, value) => {
    const newOptions = { ...selectedOptions, [key]: value };
    setSelectedOptions(newOptions);
    setQty(1);
  };

  const currentVariant = useMemo(() => {
    if (!product?.variants || Object.keys(selectedOptions).length === 0) return product?.variants?.[0] || null;
    return product.variants.find(variant => 
      Object.entries(selectedOptions).every(([key, value]) => variant.options[key] === value)
    );
  }, [product, selectedOptions]);

  const isOptionAvailable = (key, value) => {
    if (key.toLowerCase() === 'color' || key.toLowerCase() === 'цвет') return true;

    const colorKey = Object.keys(selectedOptions).find(k => k.toLowerCase() === 'color' || k.toLowerCase() === 'цвет');
    const currentColor = selectedOptions[colorKey];

    if (!currentColor) return true;

    return product.variants.some(v => {
        const cKey = Object.keys(v.options).find(k => k.toLowerCase() === 'color' || k.toLowerCase() === 'цвет');
        return v.options[cKey] === currentColor && v.options[key] === value;
    });
  };

  // --- End Variant Logic ---

  const addToCartHandler = () => {
    const variantToAdd = currentVariant || product.variants?.[0];
    if (!variantToAdd) return;

    const itemToAdd = {
      ...product,
      qty,
      price: variantToAdd.price || product.basePrice,
      image: variantToAdd.image || product.generalImages[0],
      variantId: variantToAdd._id,
      options: variantToAdd.options,
      countInStock: variantToAdd.countInStock,
    };
    dispatch(addToCart(itemToAdd));
    navigate('/cart');
    toast.success(t('product.addToCart') + '!');
  };

  const submitReviewHandler = async (e) => {
    e.preventDefault();
    try {
      await createReview({ productId, rating, comment }).unwrap();
      refetch();
      toast.success(t('product.reviewSuccess'));
      setRating(0);
      setComment('');
    } catch (err) {
      toast.error(err?.data?.message || err.error);
    }
  };

  const currentPrice = currentVariant?.price || product?.basePrice;
  const currentImage = currentVariant?.image || product?.generalImages?.[0];
  const countInStock = currentVariant?.countInStock || (product?.countInStock || 0);

  return (
    <>
      <Link className="btn btn-light my-3" to="/">{t('common.back')}</Link>
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
                <ListGroup.Item>
                  <Rating value={product.rating} text={t('product.reviewsCount', { count: product.numReviews })} />
                </ListGroup.Item>
                <ListGroup.Item>{t('product.price')}: ${currentPrice}</ListGroup.Item>
                
                {colorOptions.length > 0 && (
                  <ListGroup.Item>
                    <h5>{t('product.color')}:</h5>
                    {colorOptions.map(color => {
                        const colorKey = Object.keys(selectedOptions).find(k => k.toLowerCase() === 'color' || k.toLowerCase() === 'цвет') || 'Цвет';
                        return (
                            <Button 
                                key={color} 
                                variant={selectedOptions[colorKey] === color ? 'primary' : 'outline-secondary'} 
                                onClick={() => handleOptionSelect(colorKey, color)} 
                                className="me-2 mb-2"
                            >
                                {color}
                            </Button>
                        );
                    })}
                  </ListGroup.Item>
                )}

                {Object.entries(otherOptions).map(([key, values]) => (
                  <ListGroup.Item key={key}>
                    <h5>{key}:</h5>
                    {values.map(value => (
                      <Button 
                        key={value} 
                        variant={selectedOptions[key] === value ? 'primary' : 'outline-secondary'} 
                        onClick={() => handleOptionSelect(key, value)} 
                        className="me-2 mb-2" 
                        disabled={!isOptionAvailable(key, value)}
                      >
                        {value}
                      </Button>
                    ))}
                  </ListGroup.Item>
                ))}

                <ListGroup.Item>{t('product.description')}: {product.description}</ListGroup.Item>
                
                {product.specifications && product.specifications.length > 0 && (
                  <ListGroup.Item>
                    <h5>{t('product.specifications')}:</h5>
                    <Table striped bordered hover size="sm">
                      <tbody>
                        {product.specifications.map(spec => (
                          <tr key={spec._id}>
                            <td>{spec.name}</td>
                            <td>{spec.value}</td>
                          </tr>
                        ))}
                      </tbody>
                    </Table>
                  </ListGroup.Item>
                )}
              </ListGroup>
            </Col>
            <Col md={3}>
              <Card>
                <ListGroup variant="flush">
                  <ListGroup.Item><Row><Col>{t('product.price')}:</Col><Col><strong>${currentPrice}</strong></Col></Row></ListGroup.Item>
                  <ListGroup.Item><Row><Col>{t('product.status')}:</Col><Col>{countInStock > 0 ? t('product.inStock') : t('product.outOfStock')}</Col></Row></ListGroup.Item>
                  {countInStock > 0 && (
                    <ListGroup.Item>
                      <Row>
                        <Col>{t('product.qty')}</Col>
                        <Col>
                          <Form.Control as="select" value={qty} onChange={(e) => setQty(Number(e.target.value))}>
                            {[...Array(countInStock).keys()].map((x) => (<option key={x + 1} value={x + 1}>{x + 1}</option>))}
                          </Form.Control>
                        </Col>
                      </Row>
                    </ListGroup.Item>
                  )}
                  <ListGroup.Item>
                    <Button className="btn-block" type="button" disabled={countInStock === 0} onClick={addToCartHandler}>{t('product.addToCart')}</Button>
                  </ListGroup.Item>
                </ListGroup>
              </Card>
            </Col>
          </Row>
          <Row className="review mt-4">
            <Col md={6}>
              <h2>{t('product.reviews')}</h2>
              {product.reviews && product.reviews.length === 0 && <Message>{t('product.noReviews')}</Message>}
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
                  <h2>{t('product.writeReview')}</h2>
                  {loadingReview && <Loader />}
                  {userInfo ? (
                    <Form onSubmit={submitReviewHandler}>
                      <Form.Group controlId="rating" className="my-2">
                        <Form.Label>{t('product.rating')}</Form.Label>
                        <RatingSelect value={rating} onChange={setRating} />
                      </Form.Group>
                      <Form.Group controlId="comment" className="my-2">
                        <Form.Label>{t('product.comment')}</Form.Label>
                        <Form.Control as="textarea" rows={3} required value={comment} onChange={(e) => setComment(e.target.value)}></Form.Control>
                      </Form.Group>
                      <Button disabled={loadingReview} type="submit" variant="primary">{t('product.submit')}</Button>
                    </Form>
                  ) : (
                    <Message>
                      <Trans i18nKey="product.loginToReview">
                        Please <Link to="/login">sign in</Link> to write a review
                      </Trans>
                    </Message>
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
