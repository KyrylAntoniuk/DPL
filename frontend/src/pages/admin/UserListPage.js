import React, { useState, useMemo } from 'react';
import { LinkContainer } from 'react-router-bootstrap';
import { Table, Button } from 'react-bootstrap';
import { FaTrash, FaEdit, FaCheck, FaTimes } from 'react-icons/fa';
import { toast } from 'react-toastify';
import { useTranslation } from 'react-i18next';
import Message from '../../components/Message';
import Loader from '../../components/Loader';
import SearchAndSort from '../../components/SearchAndSort';
import { useGetUsersQuery, useDeleteUserMutation } from '../../redux/api/usersApiSlice';
import useTitle from '../../hooks/useTitle';

const UserListPage = () => {
  const { t } = useTranslation();
  useTitle(t('admin.users'));
  const { data: users, refetch, isLoading, error } = useGetUsersQuery();
  const [deleteUser, { isLoading: loadingDelete }] = useDeleteUserMutation();

  const [search, setSearch] = useState('');
  const [sort, setSort] = useState('name');
  const [sortDirection, setSortDirection] = useState('asc');

  const deleteHandler = async (id) => {
    if (window.confirm(t('admin.confirmDeleteUser'))) {
      try {
        await deleteUser(id);
        refetch();
        toast.success(t('admin.userDeleted'));
      } catch (err) {
        toast.error(err?.data?.message || err.error);
      }
    }
  };

  const filteredUsers = useMemo(() => {
    if (!users) return [];

    let result = [...users];

    if (search) {
      const lowerSearch = search.toLowerCase();
      result = result.filter(u => 
        u.name.toLowerCase().includes(lowerSearch) ||
        u.email.toLowerCase().includes(lowerSearch)
      );
    }

    result.sort((a, b) => {
      let valA = a[sort];
      let valB = b[sort];

      if (typeof valA === 'string') valA = valA.toLowerCase();
      if (typeof valB === 'string') valB = valB.toLowerCase();

      if (valA < valB) return sortDirection === 'asc' ? -1 : 1;
      if (valA > valB) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

    return result;
  }, [users, search, sort, sortDirection]);

  const sortOptions = [
    { value: 'name', label: t('auth.name') },
    { value: 'email', label: t('auth.email') },
    { value: 'role', label: 'Role' },
  ];

  return (
    <>
      <h1>{t('admin.users')}</h1>
      
      <SearchAndSort 
        search={search} setSearch={setSearch} sort={sort} setSort={setSort}
        sortOptions={sortOptions} sortDirection={sortDirection} setSortDirection={setSortDirection}
      />

      {loadingDelete && <Loader />}
      {isLoading ? <Loader /> : error ? (
        <Message variant="danger">{error?.data?.message || error.error}</Message>
      ) : (
        <Table striped bordered hover responsive className="table-sm">
          <thead>
            <tr>
              <th>ID</th>
              <th>{t('auth.name').toUpperCase()}</th>
              <th>{t('auth.email').toUpperCase()}</th>
              <th>ADMIN</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map((user) => (
              <tr key={user._id}>
                <td>{user._id}</td>
                <td>{user.name}</td>
                <td><a href={`mailto:${user.email}`}>{user.email}</a></td>
                <td>{user.role === 'admin' ? <FaCheck style={{ color: 'green' }} /> : <FaTimes style={{ color: 'red' }} />}</td>
                <td>
                  <LinkContainer to={`/admin/user/${user._id}/edit`}>
                    <Button variant="light" className="btn-sm"><FaEdit /></Button>
                  </LinkContainer>
                  <Button variant="danger" className="btn-sm" onClick={() => deleteHandler(user._id)}>
                    <FaTrash style={{ color: 'white' }} />
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}
    </>
  );
};

export default UserListPage;
