import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Form, Button } from 'react-bootstrap';
import { toast } from 'react-toastify';
import { useTranslation } from 'react-i18next';
import Message from '../../components/Message';
import Loader from '../../components/Loader';
import FormContainer from '../../components/FormContainer';
import { useGetUserByIdQuery, useUpdateUserMutation } from '../../redux/api/usersApiSlice';

const UserEditPage = () => {
  const { t } = useTranslation();
  const { id: userId } = useParams();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('user');

  const { data: user, isLoading, error, refetch } = useGetUserByIdQuery(userId);
  const [updateUser, { isLoading: loadingUpdate }] = useUpdateUserMutation();

  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      setName(user.name);
      setEmail(user.email);
      setRole(user.role);
    }
  }, [user]);

  const submitHandler = async (e) => {
    e.preventDefault();
    try {
      await updateUser({ userId, name, email, role });
      toast.success(t('common.save'));
      refetch();
      navigate('/admin/users');
    } catch (err) {
      toast.error(err?.data?.message || err.error);
    }
  };

  return (
    <>
      <Link to="/admin/users" className="btn btn-light my-3">{t('common.back')}</Link>
      <FormContainer>
        <h1>{t('common.edit')} {t('header.users')}</h1>
        {loadingUpdate && <Loader />}
        {isLoading ? <Loader /> : error ? (
          <Message variant="danger">{error?.data?.message || error.error}</Message>
        ) : (
          <Form onSubmit={submitHandler}>
            <Form.Group className="my-2" controlId="name">
              <Form.Label>{t('auth.name')}</Form.Label>
              <Form.Control
                type="text" placeholder={t('auth.name')} value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </Form.Group>

            <Form.Group className="my-2" controlId="email">
              <Form.Label>{t('auth.email')}</Form.Label>
              <Form.Control
                type="email" placeholder={t('auth.email')} value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </Form.Group>

            <Form.Group className="my-2" controlId="role">
              <Form.Label>Role</Form.Label>
              <Form.Select value={role} onChange={(e) => setRole(e.target.value)}>
                <option value="user">User</option>
                <option value="manager">Manager</option>
                <option value="admin">Admin</option>
              </Form.Select>
            </Form.Group>

            <Button type="submit" variant="primary" className="my-2">{t('common.update')}</Button>
          </Form>
        )}
      </FormContainer>
    </>
  );
};

export default UserEditPage;
