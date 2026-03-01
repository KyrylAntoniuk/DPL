import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Navbar, Nav, Container, NavDropdown } from 'react-bootstrap';
import { LinkContainer } from 'react-router-bootstrap';
import { useSelector, useDispatch } from 'react-redux';
import { useLogoutMutation } from '../redux/api/usersApiSlice';
import { logout } from '../redux/slices/authSlice';
import { toast } from 'react-toastify';

const Header = () => {
  const { userInfo } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [logoutApiCall] = useLogoutMutation();

  const logoutHandler = async () => {
    try {
      await logoutApiCall().unwrap();
      dispatch(logout());
      navigate('/login');
      toast.success('Вы вышли из системы');
    } catch (err) {
      toast.error(err?.data?.message || err.error);
    }
  };

  return (
    <header>
      <Navbar bg="dark" variant="dark" expand="lg" collapseOnSelect>
        <Container>
          <LinkContainer to="/">
            <Navbar.Brand>DPL-Shop</Navbar.Brand>
          </LinkContainer>
          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          <Navbar.Collapse id="basic-navbar-nav">
            <Nav className="ms-auto">
              <LinkContainer to="/cart">
                <Nav.Link>
                  <i className="fas fa-shopping-cart"></i> Корзина
                </Nav.Link>
              </LinkContainer>
              {userInfo ? (
                <NavDropdown title={userInfo.name} id="username">
                  <LinkContainer to="/profile">
                    <NavDropdown.Item>Профиль</NavDropdown.Item>
                  </LinkContainer>
                  <NavDropdown.Item onClick={logoutHandler}>
                    Выйти
                  </NavDropdown.Item>
                </NavDropdown>
              ) : (
                <LinkContainer to="/login">
                  <Nav.Link>
                    <i className="fas fa-user"></i> Войти
                  </Nav.Link>
                </LinkContainer>
              )}

              {/* Меню для Админа/Менеджера */}
              {userInfo && (userInfo.role === 'manager' || userInfo.role === 'admin') && (
                <NavDropdown title="Админ" id="adminmenu">
                  <LinkContainer to="/admin/products">
                    <NavDropdown.Item>Товары</NavDropdown.Item>
                  </LinkContainer>
                  <LinkContainer to="/admin/orders">
                    <NavDropdown.Item>Заказы</NavDropdown.Item>
                  </LinkContainer>
                  <LinkContainer to="/admin/filters">
                    <NavDropdown.Item>Фильтры</NavDropdown.Item>
                  </LinkContainer>
                  {userInfo.role === 'admin' && (
                    <LinkContainer to="/admin/users">
                      <NavDropdown.Item>Пользователи</NavDropdown.Item>
                    </LinkContainer>
                  )}
                </NavDropdown>
              )}
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>
    </header>
  );
};

export default Header;
