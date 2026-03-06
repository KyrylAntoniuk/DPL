import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Form, Button, Row, Col, Card } from 'react-bootstrap';
import { useForm, useFieldArray } from 'react-hook-form';
import { toast } from 'react-toastify';
import { useTranslation } from 'react-i18next';
import Loader from '../../components/Loader';
import FormContainer from '../../components/FormContainer';
import { useCreateProductMutation } from '../../redux/api/productsApiSlice';

const VariantOptions = ({ variantIndex, control, register, t }) => {
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
              type="text" placeholder={t('admin.addOption')}
              {...register(`variants.${variantIndex}.options.${optionIndex}.key`)}
            />
          </Col>
          <Col md={5}>
            <Form.Control
              type="text" placeholder="Value"
              {...register(`variants.${variantIndex}.options.${optionIndex}.value`)}
            />
          </Col>
          <Col md={2}>
            <Button variant="danger" size="sm" onClick={() => remove(optionIndex)}>&times;</Button>
          </Col>
        </Row>
      ))}
      <Button
        type="button" variant="outline-secondary" size="sm"
        onClick={() => append({ key: '', value: '' })}
      >
        {t('admin.addOption')}
      </Button>
    </>
  );
};

const ProductCreatePage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [createProduct, { isLoading: loadingCreate }] = useCreateProductMutation();

  const { register, handleSubmit, control } = useForm({
    defaultValues: {
      name: '', basePrice: 0, discountPrice: 0, discountEndDate: '', brand: '', category: '', description: '', specifications: [], variants: [],
    },
  });

  const { fields: specFields, append: appendSpec, remove: removeSpec } = useFieldArray({ control, name: 'specifications' });
  const { fields: variantFields, append: appendVariant, remove: removeVariant } = useFieldArray({ control, name: 'variants' });

  const onSubmit = async (data) => {
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
      await createProduct(transformedData).unwrap();
      toast.success(t('admin.productCreated'));
      navigate('/admin/products');
    } catch (err) {
      toast.error(err?.data?.message || err.error);
    }
  };

  return (
    <>
      <Link to="/admin/products" className="btn btn-light my-3">{t('common.back')}</Link>
      <FormContainer>
        <h1>{t('admin.createProductTitle')}</h1>
        {loadingCreate && <Loader />}
        <Form onSubmit={handleSubmit(onSubmit)}>
          <div className="form-section">
            <h4>{t('admin.basicInfo')}</h4>
            <Form.Group controlId="name" className="my-2">
              <Form.Label>{t('auth.name')}</Form.Label>
              <Form.Control type="text" {...register('name', { required: true })} />
            </Form.Group>
            <Row>
              <Col><Form.Group controlId="basePrice" className="my-2"><Form.Label>{t('admin.basePrice')}</Form.Label><Form.Control type="number" step="0.01" {...register('basePrice', { valueAsNumber: true })} /></Form.Group></Col>
              <Col><Form.Group controlId="discountPrice" className="my-2"><Form.Label>{t('admin.discountPrice') || 'Discount Price'}</Form.Label><Form.Control type="number" step="0.01" {...register('discountPrice', { valueAsNumber: true })} /></Form.Group></Col>
              <Col><Form.Group controlId="discountEndDate" className="my-2"><Form.Label>{t('admin.discountEndDate') || 'Discount End Date'}</Form.Label><Form.Control type="date" {...register('discountEndDate')} /></Form.Group></Col>
            </Row>
            <Row>
              <Col><Form.Group controlId="brand" className="my-2"><Form.Label>{t('admin.brand')}</Form.Label><Form.Control type="text" {...register('brand')} /></Form.Group></Col>
              <Col><Form.Group controlId="category" className="my-2"><Form.Label>{t('admin.category')}</Form.Label><Form.Control type="text" {...register('category')} /></Form.Group></Col>
            </Row>
            <Form.Group controlId="description" className="my-2"><Form.Label>{t('product.description')}</Form.Label><Form.Control as="textarea" rows={3} {...register('description')} /></Form.Group>
          </div>

          <div className="form-section">
            <h4>{t('product.specifications')}</h4>
            {specFields.map((field, index) => (
              <Row key={field.id} className="dynamic-row align-items-center mb-2">
                <Col md={5}><Form.Control type="text" placeholder="Name" {...register(`specifications.${index}.key`)} /></Col>
                <Col md={5}><Form.Control type="text" placeholder="Value" {...register(`specifications.${index}.value`)} /></Col>
                <Col md={2}><Button variant="danger" onClick={() => removeSpec(index)}>{t('common.delete')}</Button></Col>
              </Row>
            ))}
            <Button type="button" onClick={() => appendSpec({ key: '', value: '' })}>{t('admin.addSpec')}</Button>
          </div>

          <div className="form-section">
            <h4>{t('admin.variants')}</h4>
            {variantFields.map((field, index) => (
              <Card key={field.id} className="variant-card">
                <Card.Header>
                  <div className="d-flex justify-content-between">
                    Variant #{index + 1}
                    <Button variant="danger" size="sm" onClick={() => removeVariant(index)}>{t('common.delete')}</Button>
                  </div>
                </Card.Header>
                <Card.Body>
                  <Row>
                    <Col md={6}>
                      <h6>{t('admin.options')}</h6>
                      <VariantOptions variantIndex={index} control={control} register={register} t={t} />
                    </Col>
                    <Col md={6}>
                      <h6>{t('admin.parameters')}</h6>
                      <Form.Group><Form.Label>{t('product.price')}</Form.Label><Form.Control type="number" step="0.01" {...register(`variants.${index}.price`, { valueAsNumber: true })} /></Form.Group>
                      <Form.Group className="mt-2"><Form.Label>{t('product.inStock')}</Form.Label><Form.Control type="number" {...register(`variants.${index}.countInStock`, { valueAsNumber: true })} /></Form.Group>
                      <Form.Group className="mt-2"><Form.Label>Image URL</Form.Label><Form.Control type="text" {...register(`variants.${index}.image`)} /></Form.Group>
                    </Col>
                  </Row>
                </Card.Body>
              </Card>
            ))}
            <Button type="button" onClick={() => appendVariant({ options: [{ key: '', value: '' }], price: 0, countInStock: 0, image: '' })}>
              {t('admin.addVariant')}
            </Button>
          </div>

          <Button type="submit" variant="primary" className="mt-3">{t('common.create')}</Button>
        </Form>
      </FormContainer>
    </>
  );
};

export default ProductCreatePage;
