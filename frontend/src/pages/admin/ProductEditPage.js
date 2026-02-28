import React, { useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Form, Button, Row, Col, Card } from 'react-bootstrap';
import { useForm, useFieldArray } from 'react-hook-form';
import { toast } from 'react-toastify';
import Message from '../../components/Message';
import Loader from '../../components/Loader';
import FormContainer from '../../components/FormContainer';
import {
  useGetProductDetailsQuery,
  useUpdateProductMutation,
} from '../../redux/api/productsApiSlice';

// Вспомогательный компонент для управления опциями варианта
const VariantOptions = ({ variantIndex, control, register }) => {
  const { fields, append, remove } = useFieldArray({
    control,
    name: `variants.${variantIndex}.options`,
  });

  return (
      <>
        {fields.map((field, optionIndex) => (
            <Row key={field.id} className="mb-2 align-items-center">
              <Col md={5}>
                <Form.Control
                    type="text"
                    placeholder="Название опции (напр. Цвет)"
                    {...register(`variants.${variantIndex}.options.${optionIndex}.key`)}
                />
              </Col>
              <Col md={5}>
                <Form.Control
                    type="text"
                    placeholder="Значение (напр. Синий)"
                    {...register(`variants.${variantIndex}.options.${optionIndex}.value`)}
                />
              </Col>
              <Col md={2}>
                <Button variant="danger" size="sm" onClick={() => remove(optionIndex)}>
                  &times;
                </Button>
              </Col>
            </Row>
        ))}
        <Button
            type="button"
            variant="outline-secondary"
            size="sm"
            onClick={() => append({ key: '', value: '' })}
        >
          Добавить опцию
        </Button>
      </>
  );
};

const ProductEditPage = () => {
  const { id: productId } = useParams();
  const navigate = useNavigate();

  const { data: product, isLoading, error } = useGetProductDetailsQuery(productId);
  const [updateProduct, { isLoading: loadingUpdate }] = useUpdateProductMutation();

  const { register, handleSubmit, control, reset } = useForm();

  const { fields: specFields, append: appendSpec, remove: removeSpec } = useFieldArray({
    control,
    name: 'specifications',
  });

  const { fields: variantFields, append: appendVariant, remove: removeVariant } = useFieldArray({
    control,
    name: 'variants',
  });

  useEffect(() => {
    if (product) {
      // Трансформируем данные перед заполнением формы
      const transformedProduct = {
        ...product,
        variants: product.variants.map(variant => ({
          ...variant,
          options: Object.entries(variant.options).map(([key, value]) => ({ key, value })),
        })),
      };
      reset(transformedProduct);
    }
  }, [product, reset]);

  const onSubmit = async (data) => {
    // Трансформируем данные обратно перед отправкой
    const transformedData = {
      ...data,
      variants: data.variants.map(variant => ({
        ...variant,
        options: variant.options.reduce((acc, { key, value }) => {
          if (key) acc[key] = value;
          return acc;
        }, {}),
      })),
    };

    try {
      await updateProduct({ productId, ...transformedData }).unwrap();
      toast.success('Товар успешно обновлен');
      navigate('/admin/products');
    } catch (err) {
      toast.error(err?.data?.message || err.error);
    }
  };

  if (isLoading) return <Loader />;
  if (error) return <Message variant="danger">{error?.data?.message || error.error}</Message>;

  return (
      <>
        <Link to="/admin/products" className="btn btn-light my-3">
          Назад
        </Link>
        <FormContainer>
          <h1>Редактировать товар</h1>
          {loadingUpdate && <Loader />}
          <Form onSubmit={handleSubmit(onSubmit)}>
            {/* --- Основная информация --- */}
            <div className="form-section">
              <h4>Основная информация</h4>
              {/* ... базовые поля ... */}
              <Form.Group controlId="name" className="my-2">
                <Form.Label>Название</Form.Label>
                <Form.Control type="text" {...register('name', { required: 'Название обязательно' })} />
              </Form.Group>
              <Row>
                <Col><Form.Group controlId="basePrice" className="my-2"><Form.Label>Базовая цена</Form.Label><Form.Control type="number" step="0.01" {...register('basePrice', { valueAsNumber: true })} /></Form.Group></Col>
                <Col><Form.Group controlId="brand" className="my-2"><Form.Label>Бренд</Form.Label><Form.Control type="text" {...register('brand')} /></Form.Group></Col>
                <Col><Form.Group controlId="category" className="my-2"><Form.Label>Категория</Form.Label><Form.Control type="text" {...register('category')} /></Form.Group></Col>
              </Row>
              <Form.Group controlId="description" className="my-2"><Form.Label>Описание</Form.Label><Form.Control as="textarea" rows={3} {...register('description')} /></Form.Group>
            </div>

            {/* --- Характеристики --- */}
            <div className="form-section">
              <h4>Характеристики</h4>
              {specFields.map((field, index) => (
                  <Row key={field.id} className="dynamic-row align-items-center mb-2">
                    <Col md={5}><Form.Control type="text" placeholder="Название (напр. Диагональ)" {...register(`specifications.${index}.key`)} /></Col>
                    <Col md={5}><Form.Control type="text" placeholder="Значение (напр. 6.1`)" {...register(`specifications.${index}.value`)} /></Col>
                    <Col md={2}><Button variant="danger" onClick={() => removeSpec(index)}>Удалить</Button></Col>
                  </Row>
              ))}
              <Button type="button" onClick={() => appendSpec({ key: '', value: '' })}>Добавить характеристику</Button>
            </div>

            {/* --- Модификации товара (с динамическими опциями) --- */}
            <div className="form-section">
              <h4>Модификации товара</h4>
              {variantFields.map((field, index) => (
                  <Card key={field.id} className="variant-card">
                    <Card.Header>
                      <div className="d-flex justify-content-between">
                        Модификация #{index + 1}
                        <Button variant="danger" size="sm" onClick={() => removeVariant(index)}>Удалить модификацию</Button>
                      </div>
                    </Card.Header>
                    <Card.Body>
                      <Row>
                        <Col md={6}>
                          <h6>Опции</h6>
                          <VariantOptions variantIndex={index} control={control} register={register} />
                        </Col>
                        <Col md={6}>
                          <h6>Параметры</h6>
                          <Form.Group><Form.Label>Цена</Form.Label><Form.Control type="number" step="0.01" {...register(`variants.${index}.price`, { valueAsNumber: true })} /></Form.Group>
                          <Form.Group className="mt-2"><Form.Label>На складе</Form.Label><Form.Control type="number" {...register(`variants.${index}.countInStock`, { valueAsNumber: true })} /></Form.Group>
                          <Form.Group className="mt-2"><Form.Label>URL изображения</Form.Label><Form.Control type="text" placeholder="Оставьте пустым, чтобы использовать главное" {...register(`variants.${index}.image`)} /></Form.Group>
                        </Col>
                      </Row>
                    </Card.Body>
                  </Card>
              ))}
              <Button type="button" onClick={() => appendVariant({ options: [{ key: '', value: '' }], price: 0, countInStock: 0, image: '' })}>
                Добавить модификацию
              </Button>
            </div>

            <Button type="submit" variant="primary" className="mt-3">
              Сохранить изменения
            </Button>
          </Form>
        </FormContainer>
      </>
  );
};

export default ProductEditPage;