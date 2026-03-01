import React, { useEffect } from 'react';
import { Form, Button, Row, Col } from 'react-bootstrap';
import { useForm, useFieldArray } from 'react-hook-form';
import { toast } from 'react-toastify';
import { useTranslation } from 'react-i18next';
import Loader from '../../components/Loader';
import FormContainer from '../../components/FormContainer';
import { useGetFilterConfigQuery, useUpdateFilterConfigMutation } from '../../redux/api/productsApiSlice';

const FilterConfigPage = () => {
  const { t } = useTranslation();
  const { data: config, isLoading } = useGetFilterConfigQuery();
  const [updateConfig, { isLoading: loadingUpdate }] = useUpdateFilterConfigMutation();

  const { register, control, handleSubmit, reset } = useForm({ defaultValues: { filterableFields: [] } });
  const { fields, append, remove } = useFieldArray({ control, name: 'filterableFields' });

  useEffect(() => {
    if (config) reset(config);
  }, [config, reset]);

  const onSubmit = async (data) => {
    try {
      await updateConfig(data).unwrap();
      toast.success(t('common.save'));
    } catch (err) {
      toast.error(err?.data?.message || err.error);
    }
  };

  if (isLoading) return <Loader />;

  return (
    <FormContainer>
      <h1>{t('admin.filterConfig')}</h1>
      {loadingUpdate && <Loader />}
      <Form onSubmit={handleSubmit(onSubmit)}>
        {fields.map((field, index) => (
          <div key={field.id} className="mb-3 p-3 border rounded">
            <Row className="mb-2">
              <Col>
                <Form.Label>{t('admin.dbKey')}</Form.Label>
                <Form.Control
                  type="text" placeholder="specifications.RAM"
                  {...register(`filterableFields.${index}.key`, { required: true })}
                />
              </Col>
              <Col xs="auto" className="d-flex align-items-end">
                <Button variant="danger" onClick={() => remove(index)}>{t('common.delete')}</Button>
              </Col>
            </Row>
            <Row>
              <Col>
                <Form.Label>{t('admin.nameEn')}</Form.Label>
                <Form.Control
                  type="text" placeholder="RAM"
                  {...register(`filterableFields.${index}.label.en`, { required: true })}
                />
              </Col>
              <Col>
                <Form.Label>{t('admin.nameRu')}</Form.Label>
                <Form.Control
                  type="text" placeholder="Оперативная память"
                  {...register(`filterableFields.${index}.label.uk`, { required: true })}
                />
              </Col>
            </Row>
          </div>
        ))}
        
        <Button 
          type="button" variant="outline-secondary" className="mb-3"
          onClick={() => append({ key: '', label: { en: '', uk: '' } })}
        >
          {t('admin.addFilter')}
        </Button>

        <Button type="submit" variant="primary" className="w-100">
          {t('common.save')}
        </Button>
      </Form>
    </FormContainer>
  );
};

export default FilterConfigPage;
