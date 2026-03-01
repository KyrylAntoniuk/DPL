import React, { Suspense } from 'react'; // Импорт Suspense
import ReactDOM from 'react-dom/client';
import {
    createBrowserRouter,
    createRoutesFromElements,
    Route,
    RouterProvider,
} from 'react-router-dom';
import { Provider } from 'react-redux';
import { store } from './redux/store';
import './i18n'; // Импорт конфигурации i18n

// Стили
import 'bootstrap/dist/css/bootstrap.min.css';
import './scss/global.scss';
import 'react-toastify/dist/ReactToastify.css';

// Компоненты
import App from './App';
import HomePage from './pages/HomePage';
import ProductPage from './pages/ProductPage';
import CartPage from './pages/CartPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ShippingPage from './pages/ShippingPage';
import PaymentPage from './pages/PaymentPage';
import PlaceOrderPage from './pages/PlaceOrderPage';
import OrderPage from './pages/OrderPage';
import ProfilePage from './pages/ProfilePage';
import NotFoundPage from './pages/NotFoundPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import Loader from './components/Loader'; // Импорт Loader

// Защищенные маршруты
import PrivateRoute from './components/PrivateRoute';
import ManagerRoute from './components/ManagerRoute';
import AdminRoute from './components/AdminRoute';

// Страницы админки
import OrderListPage from './pages/admin/OrderListPage';
import ProductListPage from './pages/admin/ProductListPage';
import UserListPage from './pages/admin/UserListPage';
import UserEditPage from './pages/admin/UserEditPage';
import ProductEditPage from './pages/admin/ProductEditPage';
import ProductCreatePage from './pages/admin/ProductCreatePage';
import FilterConfigPage from './pages/admin/FilterConfigPage';

const router = createBrowserRouter(
    createRoutesFromElements(
        <Route path="/" element={<App />}>
            {/* Публичные маршруты */}
            <Route index={true} path="/" element={<HomePage />} />
            <Route path="/page/:pageNumber" element={<HomePage />} />
            <Route path="/catalog/:category" element={<HomePage />} />
            <Route path="/catalog/:category/page/:pageNumber" element={<HomePage />} />

            <Route path="/product/:id" element={<ProductPage />} />
            <Route path="/cart" element={<CartPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/forgotpassword" element={<ForgotPasswordPage />} />
            <Route path="/resetpassword/:token" element={<ResetPasswordPage />} />

            {/* Приватные маршруты */}
            <Route path="" element={<PrivateRoute />}>
                <Route path="/profile" element={<ProfilePage />} />
                <Route path="/checkout/shipping" element={<ShippingPage />} />
                <Route path="/checkout/payment" element={<PaymentPage />} />
                <Route path="/checkout/placeorder" element={<PlaceOrderPage />} />
                <Route path="/order/:id" element={<OrderPage />} />
            </Route>

            {/* Маршруты для Менеджера и Админа */}
            <Route path="" element={<ManagerRoute />}>
                <Route path="/admin/orders" element={<OrderListPage />} />
                <Route path="/admin/products" element={<ProductListPage />} />
                <Route path="/admin/product/create" element={<ProductCreatePage />} />
                <Route path="/admin/product/:id/edit" element={<ProductEditPage />} />
                <Route path="/admin/filters" element={<FilterConfigPage />} />
            </Route>

            {/* Маршруты только для Админа */}
            <Route path="" element={<AdminRoute />}>
                <Route path="/admin/users" element={<UserListPage />} />
                <Route path="/admin/user/:id/edit" element={<UserEditPage />} />
            </Route>

            {/* Fallback маршрут */}
            <Route path="*" element={<NotFoundPage />} />
        </Route>
    )
);

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
    <React.StrictMode>
        <Provider store={store}>
            <Suspense fallback={<Loader />}>
                <RouterProvider router={router} />
            </Suspense>
        </Provider>
    </React.StrictMode>
);