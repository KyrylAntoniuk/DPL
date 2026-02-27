import React from 'react';
import { Outlet } from 'react-router-dom';
import { Container } from 'react-bootstrap'; // Предполагаем, что react-bootstrap будет использоваться
import Header from './components/Header';
import Footer from './components/Footer';
import { ToastContainer } from 'react-toastify';

const App = () => {
  return (
    <>
      <Header />
      <main className="py-3">
        <Container>
          <Outlet />
        </Container>
      </main>
      <Footer />
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar />
    </>
  );
};

export default App;
