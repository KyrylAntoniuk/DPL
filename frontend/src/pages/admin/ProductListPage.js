import React from 'react';
import { LinkContainer } from 'react-router-bootstrap';
import { useNavigate } from 'react-router-dom';
import { Table, Button, Row, Col } from 'react-bootstrap';
import { FaEdit, FaTrash, FaFileImport } from 'react-icons/fa';
import { toast } from 'react-toastify';
import Message from '../../components/Message';
import Loader from '../../components/Loader';
import {
  useGetProductsQuery,
  useDeleteProductMutation,
  useImportProductsMutation, // Импортируем хук
} from '../../redux/api/productsApiSlice';
import useTitle from '../../hooks/useTitle';

const ProductListPage = () => {
  useTitle('Товары');
  const navigate = useNavigate();
  const { data, isLoading, error, refetch } = useGetProductsQuery({});
  const [deleteProduct, { isLoading: loadingDelete }] = useDeleteProductMutation();
  const [importProducts, { isLoading: loadingImport }] = useImportProductsMutation();

  const createProductHandler = () => {
    navigate('/admin/product/create');
  };

  const deleteHandler = async (id) => {
    if (window.confirm('Вы уверены, что хотите удалить товар?')) {
      try {
        await deleteProduct(id);
        refetch();
        toast.success('Товар удален');
      } catch (err) {
        toast.error(err?.data?.message || err.error);
      }
    }
  };

  const uploadFileHandler = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const json = JSON.parse(event.target.result);
        await importProducts(json).unwrap();
        toast.success('Товары успешно импортированы');
        refetch();
      } catch (err) {
        toast.error('Ошибка импорта: ' + (err?.data?.message || err.message || 'Неверный формат JSON'));
      }
    };
    reader.readAsText(file);
    e.target.value = null; // Сбрасываем инпут
  };

  return (
    <>
      <Row className="align-items-center">
        <Col>
          <h1>Товары</h1>
        </Col>
        <Col className="text-end">
          <input
            type="file"
            id="json-upload"
            style={{ display: 'none' }}
            accept=".json"
            onChange={uploadFileHandler}
          />
          <Button 
            className="btn-sm m-3" 
            variant="outline-primary"
            onClick={() => document.getElementById('json-upload').click()}
          >
            <FaFileImport /> Импорт JSON
          </Button>

          <Button className="btn-sm m-3" onClick={createProductHandler}>
            <FaEdit /> Создать товар
          </Button>
        </Col>
      </Row>

      {loadingDelete && <Loader />}
      {loadingImport && <Loader />}
      {isLoading ? (
        <Loader />
      ) : error ? (
        <Message variant="danger">{error?.data?.message || error.error}</Message>
      ) : (
        <>
          <Table striped bordered hover responsive className="table-sm">
            <thead>
              <tr>
                <th>ID</th>
                <th>НАЗВАНИЕ</th>
                <th>ЦЕНА</th>
                <th>КАТЕГОРИЯ</th>
                <th>БРЕНД</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {data.products.map((product) => (
                <tr key={product._id}>
                  <td>{product._id}</td>
                  <td>{product.name}</td>
                  <td>${product.basePrice}</td>
                  <td>{product.category}</td>
                  <td>{product.brand}</td>
                  <td>
                    <LinkContainer to={`/admin/product/${product._id}/edit`}>
                      <Button variant="light" className="btn-sm mx-2">
                        <FaEdit />
                      </Button>
                    </LinkContainer>
                    <Button
                      variant="danger"
                      className="btn-sm"
                      onClick={() => deleteHandler(product._id)}
                    >
                      <FaTrash style={{ color: 'white' }} />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </>
      )}
    </>
  );
};

export default ProductListPage;
