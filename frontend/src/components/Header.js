import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Navbar, Nav, Container, NavDropdown } from 'react-bootstrap';
import { LinkContainer } from 'react-router-bootstrap';
import { useSelector, useDispatch } from 'react-redux';
import { useTranslation } from 'react-i18next'; // Импорт хука
import { useLogoutMutation } from '../redux/api/usersApiSlice';
import { logout } from '../redux/slices/authSlice';
import { toast } from 'react-toastify';
import LanguageSwitcher from './LanguageSwitcher'; // Импорт переключателя

const Header = () => {
  const { userInfo } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { t } = useTranslation(); // Инициализация

  const [logoutApiCall] = useLogoutMutation();

  const logoutHandler = async () => {
    try {
      await logoutApiCall().unwrap();
      dispatch(logout());
      navigate('/login');
      toast.success(t('header.logoutSuccess') || 'Вы вышли из системы');
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
              <LanguageSwitcher /> {/* Переключатель языка */}
              
              <LinkContainer to="/cart">
                <Nav.Link>
                  <i className="fas fa-shopping-cart"></i> {t('header.cart')}
                </Nav.Link>
              </LinkContainer>
              
              {userInfo ? (
                <NavDropdown title={userInfo.name} id="username">
                  <LinkContainer to="/profile">
                    <NavDropdown.Item>{t('header.profile')}</NavDropdown.Item>
                  </LinkContainer>
                  <NavDropdown.Item onClick={logoutHandler}>
                    {t('header.logout')}
                  </NavDropdown.Item>
                </NavDropdown>
              ) : (
                <LinkContainer to="/login">
                  <Nav.Link>
                    <i className="fas fa-user"></i> {t('header.login')}
                  </Nav.Link>
                </LinkContainer>
              )}

              {/* Меню для Админа/Менеджера */}
              {userInfo && (userInfo.role === 'manager' || userInfo.role === 'admin') && (
                <NavDropdown title={t('header.admin')} id="adminmenu">
                  <LinkContainer to="/admin/products">
                    <NavDropdown.Item>{t('header.products')}</NavDropdown.Item>
                  </LinkContainer>
                  <LinkContainer to="/admin/orders">
                    <NavDropdown.Item>{t('header.orders')}</NavDropdown.Item>
                  </LinkContainer>
                  <LinkContainer to="/admin/filters">
                    <NavDropdown.Item>{t('header.filters')}</NavDropdown.Item>
                  </LinkContainer>
                  {userInfo.role === 'admin' && (
                    <LinkContainer to="/admin/users">
                      <NavDropdown.Item>{t('header.users')}</NavDropdown.Item>
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
