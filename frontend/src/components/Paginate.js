import React from 'react';
import { Pagination } from 'react-bootstrap';
import { LinkContainer } from 'react-router-bootstrap';
import { useLocation } from 'react-router-dom';

const Paginate = ({ pages, page, isAdmin = false, keyword = '', category = '' }) => {
  const { search } = useLocation();

  if (pages <= 1) return null;

  const getLink = (p) => {
    let pathname = '';

    if (isAdmin) pathname = `/admin/products/${p}`;
    else if (keyword) pathname = `/search/${keyword}/page/${p}`;
    else if (category) pathname = `/catalog/${category}/page/${p}`;
    else pathname = `/page/${p}`;

    return { pathname, search };
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
