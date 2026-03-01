import React, { useState, useMemo } from 'react';
import { LinkContainer } from 'react-router-bootstrap';
import { Table, Button, Badge, Form } from 'react-bootstrap';
import { toast } from 'react-toastify';
import Message from '../../components/Message';
import Loader from '../../components/Loader';
import SearchAndSort from '../../components/SearchAndSort';
import { useGetOrdersQuery, useUpdateOrderStatusMutation } from '../../redux/api/ordersApiSlice';
import useTitle from '../../hooks/useTitle';

const OrderListPage = () => {
  useTitle('Заказы');
  const { data: orders, isLoading, error } = useGetOrdersQuery();
  const [updateOrderStatus, { isLoading: loadingUpdate }] = useUpdateOrderStatusMutation();

  // Состояние для поиска и сортировки
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState('createdAt');
  const [sortDirection, setSortDirection] = useState('desc');

  const statusHandler = async (id, status) => {
    try {
      await updateOrderStatus({ orderId: id, status });
      toast.success('Статус заказа обновлен');
    } catch (err) {
      toast.error(err?.data?.message || err.error);
    }
  };

  // Логика фильтрации и сортировки
  const filteredOrders = useMemo(() => {
    if (!orders) return [];

    let result = [...orders];

    // Поиск
    if (search) {
      const lowerSearch = search.toLowerCase();
      result = result.filter(o => 
        o._id.toLowerCase().includes(lowerSearch) ||
        (o.user && o.user.name.toLowerCase().includes(lowerSearch))
      );
    }

    // Сортировка
    result.sort((a, b) => {
      let valA = a[sort];
      let valB = b[sort];

      // Специальная обработка для вложенного поля user
      if (sort === 'user') {
        valA = a.user?.name || '';
        valB = b.user?.name || '';
      }

      if (valA < valB) return sortDirection === 'asc' ? -1 : 1;
      if (valA > valB) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

    return result;
  }, [orders, search, sort, sortDirection]);

  const sortOptions = [
    { value: 'createdAt', label: 'Дата' },
    { value: 'totalPrice', label: 'Сумма' },
    { value: 'user', label: 'Пользователь' },
    { value: 'isPaid', label: 'Оплачено' },
    { value: 'status', label: 'Статус' },
  ];

  return (
    <>
      <h1>Заказы</h1>
      
      <SearchAndSort 
        search={search}
        setSearch={setSearch}
        sort={sort}
        setSort={setSort}
        sortOptions={sortOptions}
        sortDirection={sortDirection}
        setSortDirection={setSortDirection}
      />

      {loadingUpdate && <Loader />}
      {isLoading ? (
        <Loader />
      ) : error ? (
        <Message variant="danger">{error?.data?.message || error.error}</Message>
      ) : (
        <Table striped bordered hover responsive className="table-sm">
          <thead>
            <tr>
              <th>ID</th>
              <th>ПОЛЬЗОВАТЕЛЬ</th>
              <th>ДАТА</th>
              <th>ИТОГО</th>
              <th>ОПЛАТА</th>
              <th>СТАТУС</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {filteredOrders.map((order) => (
              <tr key={order._id}>
                <td>{order._id}</td>
                <td>{order.user && order.user.name}</td>
                <td>{order.createdAt.substring(0, 10)}</td>
                <td>${order.totalPrice}</td>
                <td>
                  {order.isPaid ? (
                    <Badge bg="success">Оплачено {order.paidAt.substring(0, 10)}</Badge>
                  ) : (
                    <Badge bg="danger">Не оплачено</Badge>
                  )}
                </td>
                <td>
                  <Form.Select 
                    size="sm" 
                    value={order.status} 
                    onChange={(e) => statusHandler(order._id, e.target.value)}
                    style={{ width: '140px' }}
                  >
                    <option value="Новый">Новый</option>
                    <option value="В обработке">В обработке</option>
                    <option value="Отправлен">Отправлен</option>
                    <option value="Доставлен">Доставлен</option>
                    <option value="Отменен">Отменен</option>
                  </Form.Select>
                </td>
                <td>
                  <LinkContainer to={`/order/${order._id}`}>
                    <Button variant="light" className="btn-sm">
                      Детали
                    </Button>
                  </LinkContainer>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}
    </>
  );
};

export default OrderListPage;
