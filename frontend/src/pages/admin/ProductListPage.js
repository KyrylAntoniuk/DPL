import React, { useState, useMemo } from 'react';
import { LinkContainer } from 'react-router-bootstrap';
import { useNavigate } from 'react-router-dom';
import { Table, Button, Row, Col } from 'react-bootstrap';
import { FaEdit, FaTrash, FaFileImport } from 'react-icons/fa';
import { toast } from 'react-toastify';
import { useTranslation } from 'react-i18next'; // Импорт
import Message from '../../components/Message';
import Loader from '../../components/Loader';
import SearchAndSort from '../../components/SearchAndSort';
import {
  useGetProductsQuery,
  useDeleteProductMutation,
  useImportProductsMutation,
} from '../../redux/api/productsApiSlice';
import useTitle from '../../hooks/useTitle';

const ProductListPage = () => {
  const { t } = useTranslation(); // Хук
  useTitle(t('admin.products'));
  const navigate = useNavigate();
  const { data, isLoading, error, refetch } = useGetProductsQuery({});
  const [deleteProduct, { isLoading: loadingDelete }] = useDeleteProductMutation();
  const [importProducts, { isLoading: loadingImport }] = useImportProductsMutation();

  const [search, setSearch] = useState('');
  const [sort, setSort] = useState('name');
  const [sortDirection, setSortDirection] = useState('asc');

  const createProductHandler = () => {
    navigate('/admin/product/create');
  };

  const deleteHandler = async (id) => {
    if (window.confirm(t('admin.confirmDelete'))) {
      try {
        await deleteProduct(id);
        refetch();
        toast.success(t('admin.productDeleted'));
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
        toast.success(t('admin.productCreated')); // Используем похожий ключ или добавим новый
        refetch();
      } catch (err) {
        toast.error(t('common.error') + ': ' + (err?.data?.message || err.message));
      }
    };
    reader.readAsText(file);
    e.target.value = null;
  };

  const filteredProducts = useMemo(() => {
    if (!data?.products) return [];

    let result = [...data.products];

    if (search) {
      const lowerSearch = search.toLowerCase();
      result = result.filter(p => 
        p.name.toLowerCase().includes(lowerSearch) ||
        p.brand.toLowerCase().includes(lowerSearch) ||
        p.category.toLowerCase().includes(lowerSearch)
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
  }, [data, search, sort, sortDirection]);

  const sortOptions = [
    { value: 'name', label: t('auth.name') }, // Используем общие ключи
    { value: 'basePrice', label: t('product.price') },
    { value: 'category', label: t('home.category') },
    { value: 'brand', label: t('admin.brand') },
  ];

  return (
    <>
      <Row className="align-items-center">
        <Col>
          <h1>{t('admin.products')}</h1>
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
            <FaFileImport /> {t('admin.importJson')}
          </Button>

          <Button className="btn-sm m-3" onClick={createProductHandler}>
            <FaEdit /> {t('admin.createProduct')}
          </Button>
        </Col>
      </Row>

      <SearchAndSort 
        search={search}
        setSearch={setSearch}
        sort={sort}
        setSort={setSort}
        sortOptions={sortOptions}
        sortDirection={sortDirection}
        setSortDirection={setSortDirection}
      />

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
                <th>{t('auth.name').toUpperCase()}</th>
                <th>{t('product.price').toUpperCase()}</th>
                <th>{t('home.category').toUpperCase()}</th>
                <th>{t('admin.brand').toUpperCase()}</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.map((product) => (
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
