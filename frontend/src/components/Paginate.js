import React from 'react';
import { Pagination } from 'react-bootstrap';
import { LinkContainer } from 'react-router-bootstrap';

const Paginate = ({ pages, page, isAdmin = false, keyword = '', category = '' }) => {
  // Не показываем пагинацию, если всего одна страница
  if (pages <= 1) {
    return null;
  }

  const getLink = (p) => {
    if (isAdmin) {
      // Логика для админских страниц (пока не реализована)
      return `/admin/products/${p}`;
    } else if (keyword) {
      return `/search/${keyword}/page/${p}`;
    } else if (category) {
      return `/catalog/${category}/page/${p}`;
    } else {
      return `/page/${p}`;
    }
  };

  return (
    <Pagination>
      {[...Array(pages).keys()].map((x) => (
        <LinkContainer key={x + 1} to={getLink(x + 1)}>
          <Pagination.Item active={x + 1 === page}>{x + 1}</Pagination.Item>
        </LinkContainer>
      ))}
    </Pagination>
  );
};

export default Paginate;
