import React, { useState, useEffect } from 'react';
import { useStripe, useElements, PaymentElement } from '@stripe/react-stripe-js';
import { Button } from 'react-bootstrap';
import { toast } from 'react-toastify';
import { usePayOrderMutation } from '../redux/api/ordersApiSlice';
import Loader from './Loader';

const CheckoutForm = ({ orderId, clientSecret }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [payOrder, { isLoading: loadingPay }] = usePayOrderMutation();

  const [message, setMessage] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // Лог при монтировании
  useEffect(() => {
    console.log('CheckoutForm mounted');
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('CheckoutForm: handleSubmit called');

    if (!stripe || !elements) {
      console.log('CheckoutForm: Stripe or Elements not loaded');
      return;
    }

    setIsProcessing(true);

    try {
      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/order/${orderId}`,
        },
        redirect: 'if_required',
      });

      if (error) {
        console.log('CheckoutForm: Payment error', error);
        setMessage(error.message);
        toast.error(error.message);
      } else if (paymentIntent && paymentIntent.status === 'succeeded') {
        console.log('CheckoutForm: Payment succeeded', paymentIntent);
        setMessage('Оплата прошла успешно!');
        toast.success('Оплата прошла успешно!');
        
        await payOrder({
          orderId,
          details: {
            id: paymentIntent.id,
            status: paymentIntent.status,
            update_time: String(paymentIntent.created),
            email_address: paymentIntent.receipt_email,
          },
        }).unwrap();
        console.log('CheckoutForm: Order updated in DB');
      } else {
        console.log('CheckoutForm: Unexpected state', paymentIntent);
        setMessage('Неожиданное состояние.');
      }
    } catch (err) {
      console.error('CheckoutForm: Exception', err);
      toast.error(err.message || 'Произошла ошибка при оплате');
    }

    setIsProcessing(false);
  };

  return (
    <form id="payment-form" onSubmit={handleSubmit}>
      {/* Отладочный текст */}
      <div style={{ border: '1px solid blue', padding: '10px', marginBottom: '10px' }}>
        <small>Stripe Form Container</small>
        <PaymentElement id="payment-element" />
      </div>

      <Button 
        disabled={isProcessing || !stripe || !elements} 
        id="submit" 
        className="mt-3 w-100"
        type="submit"
      >
        <span id="button-text">
          {isProcessing ? <Loader /> : 'Оплатить сейчас'}
        </span>
      </Button>
      {message && <div id="payment-message" className="text-danger mt-2">{message}</div>}
    </form>
  );
};

export default CheckoutForm;
