import React from 'react';
import { LinkContainer } from 'react-router-bootstrap';
import { Table, Button, Badge } from 'react-bootstrap';
import { toast } from 'react-toastify';
import Message from '../../components/Message';
import Loader from '../../components/Loader';
import { useGetOrdersQuery, useDeliverOrderMutation } from '../../redux/api/ordersApiSlice';
import useTitle from '../../hooks/useTitle';

const OrderListPage = () => {
  useTitle('Заказы');
  const { data: orders, isLoading, error } = useGetOrdersQuery();
  const [deliverOrder, { isLoading: loadingDeliver }] = useDeliverOrderMutation();

  const deliverHandler = async (id) => {
    try {
      await deliverOrder(id);
      toast.success('Заказ доставлен');
    } catch (err) {
      toast.error(err?.data?.message || err.error);
    }
  };

  return (
    <>
      <h1>Заказы</h1>
      {loadingDeliver && <Loader />}
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
              <th>ДОСТАВКА</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
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
                  {order.isDelivered ? (
                    <Badge bg="success">Доставлено {order.deliveredAt.substring(0, 10)}</Badge>
                  ) : (
                    <Button 
                      variant="outline-primary" 
                      size="sm"
                      onClick={() => deliverHandler(order._id)}
                    >
                      Отметить как доставленный
                    </Button>
                  )}
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
