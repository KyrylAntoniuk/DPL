import React from 'react';
import { Form, InputGroup, Button, Row, Col } from 'react-bootstrap';
import { FaSortAmountDown, FaSortAmountUp } from 'react-icons/fa';

const SearchAndSort = ({ 
  search, setSearch, sort, setSort, sortOptions, sortDirection, setSortDirection 
}) => {
  return (
    <Row className="mb-3 align-items-center">
      <Col md={6}>
        <InputGroup>
          <InputGroup.Text><i className="fas fa-search"></i></InputGroup.Text>
          <Form.Control
            placeholder="Search..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </InputGroup>
      </Col>
      <Col md={4}>
        <Form.Select value={sort} onChange={(e) => setSort(e.target.value)}>
          {sortOptions.map(option => (
            <option key={option.value} value={option.value}>{option.label}</option>
          ))}
        </Form.Select>
      </Col>
      <Col md={2}>
        <Button 
          variant="outline-secondary" className="w-100"
          onClick={() => setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc')}
        >
          {sortDirection === 'asc' ? <FaSortAmountUp /> : <FaSortAmountDown />}
        </Button>
      </Col>
    </Row>
  );
};

export default SearchAndSort;
