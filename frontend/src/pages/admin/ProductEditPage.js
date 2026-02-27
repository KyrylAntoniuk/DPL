import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Form, Button } from 'react-bootstrap';
import { toast } from 'react-toastify';
import Message from '../../components/Message';
import Loader from '../../components/Loader';
import FormContainer from '../../components/FormContainer';
import {
  useGetProductByIdQuery,
  useUpdateProductMutation,
} from '../../redux/api/productsApiSlice';
import useTitle from '../../hooks/useTitle';

const ProductEditPage = () => {
  const { id: productId } = useParams();
  const [name, setName] = useState('');
  const [price, setPrice] = useState(0);
  const [image, setImage] = useState('');
  const [brand, setBrand] = useState('');
  const [category, setCategory] = useState('');
  const [countInStock, setCountInStock] = useState(0);
  const [description, setDescription] = useState('');

  const { data: product, isLoading, error } = useGetProductByIdQuery(productId);
  const [updateProduct, { isLoading: loadingUpdate }] = useUpdateProductMutation();

  const navigate = useNavigate();
  useTitle(product ? `Редактирование ${product.name}` : 'Редактирование');

  useEffect(() => {
    if (product) {
      setName(product.name);
      setPrice(product.basePrice);
      setImage(product.generalImages[0]);
      setBrand(product.brand);
      setCategory(product.category);
      setCountInStock(product.countInStock);
      setDescription(product.description);
    }
  }, [product]);

  const submitHandler = async (e) => {
    e.preventDefault();
    const updatedProduct = {
      productId,
      name,
      basePrice: price,
      generalImages: [image],
      brand,
      category,
      countInStock,
      description,
    };

    const result = await updateProduct(updatedProduct);
    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success('Товар успешно обновлен');
      navigate('/admin/products');
    }
  };

  return (
    <>
      <Link to="/admin/products" className="btn btn-light my-3">
        Назад
      </Link>
      <FormContainer>
        <h1>Редактировать товар</h1>
        {loadingUpdate && <Loader />}
        {isLoading ? (
          <Loader />
        ) : error ? (
          <Message variant="danger">{error?.data?.message || error.error}</Message>
        ) : (
          <Form onSubmit={submitHandler}>
            <Form.Group controlId="name">
              <Form.Label>Название</Form.Label>
              <Form.Control
                type="text"
                placeholder="Введите название"
                value={name}
                onChange={(e) => setName(e.target.value)}
              ></Form.Control>
            </Form.Group>

            <Form.Group controlId="price">
              <Form.Label>Цена</Form.Label>
              <Form.Control
                type="number"
                placeholder="Введите цену"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
              ></Form.Control>
            </Form.Group>

            <Form.Group controlId="image">
              <Form.Label>Изображение (URL)</Form.Label>
              <Form.Control
                type="text"
                placeholder="Введите URL изображения"
                value={image}
                onChange={(e) => setImage(e.target.value)}
              ></Form.Control>
            </Form.Group>

            <Form.Group controlId="brand">
              <Form.Label>Бренд</Form.Label>
              <Form.Control
                type="text"
                placeholder="Введите бренд"
                value={brand}
                onChange={(e) => setBrand(e.target.value)}
              ></Form.Control>
            </Form.Group>

            <Form.Group controlId="countInStock">
              <Form.Label>Количество на складе</Form.Label>
              <Form.Control
                type="number"
                placeholder="Введите количество"
                value={countInStock}
                onChange={(e) => setCountInStock(e.target.value)}
              ></Form.Control>
            </Form.Group>

            <Form.Group controlId="category">
              <Form.Label>Категория</Form.Label>
              <Form.Control
                type="text"
                placeholder="Введите категорию"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              ></Form.Control>
            </Form.Group>

            <Form.Group controlId="description">
              <Form.Label>Описание</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                placeholder="Введите описание"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              ></Form.Control>
            </Form.Group>

            <Button type="submit" variant="primary" style={{ marginTop: '1rem' }}>
              Обновить
            </Button>
          </Form>
        )}
      </FormContainer>
    </>
  );
};

export default ProductEditPage;
