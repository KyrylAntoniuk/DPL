import React, { useEffect } from 'react';
import { Form, Button, Row, Col } from 'react-bootstrap';
import { useForm, useFieldArray } from 'react-hook-form';
import { toast } from 'react-toastify';
import Loader from '../../components/Loader';
import FormContainer from '../../components/FormContainer';
import { useGetFilterConfigQuery, useUpdateFilterConfigMutation } from '../../redux/api/productsApiSlice';

const FilterConfigPage = () => {
  const { data: config, isLoading } = useGetFilterConfigQuery();
  const [updateConfig, { isLoading: loadingUpdate }] = useUpdateFilterConfigMutation();

  const { register, control, handleSubmit, reset } = useForm({
    defaultValues: {
      filterableFields: []
    }
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'filterableFields'
  });

  useEffect(() => {
    if (config) {
      reset(config);
    }
  }, [config, reset]);

  const onSubmit = async (data) => {
    try {
      await updateConfig(data).unwrap();
      toast.success('Настройки фильтров обновлены');
    } catch (err) {
      toast.error(err?.data?.message || err.error);
    }
  };

  if (isLoading) return <Loader />;

  return (
    <FormContainer>
      <h1>Настройка фильтров</h1>
      {loadingUpdate && <Loader />}
      <Form onSubmit={handleSubmit(onSubmit)}>
        {fields.map((field, index) => (
          <Row key={field.id} className="mb-2 align-items-center">
            <Col md={5}>
              <Form.Control
                type="text"
                placeholder="Ключ в БД (напр. specifications.RAM)"
                {...register(`filterableFields.${index}.key`, { required: true })}
              />
            </Col>
            <Col md={5}>
              <Form.Control
                type="text"
                placeholder="Название (напр. Оперативная память)"
                {...register(`filterableFields.${index}.label`, { required: true })}
              />
            </Col>
            <Col md={2}>
              <Button variant="danger" onClick={() => remove(index)}>Удалить</Button>
            </Col>
          </Row>
        ))}
        
        <Button 
          type="button" 
          variant="outline-secondary" 
          className="mb-3"
          onClick={() => append({ key: '', label: '' })}
        >
          Добавить фильтр
        </Button>

        <Button type="submit" variant="primary" className="w-100">
          Сохранить
        </Button>
      </Form>
    </FormContainer>
  );
};

export default FilterConfigPage;
