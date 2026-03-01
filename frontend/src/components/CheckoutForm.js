import React, { useState, useEffect } from 'react';
import { useStripe, useElements, PaymentElement } from '@stripe/react-stripe-js';
import { Button } from 'react-bootstrap';
import { toast } from 'react-toastify';
import { useTranslation } from 'react-i18next';
import { usePayOrderMutation } from '../redux/api/ordersApiSlice';
import Loader from './Loader';

const CheckoutForm = ({ orderId, clientSecret }) => {
  const stripe = useStripe();
  const elements = useElements();
  const { t } = useTranslation();
  const [payOrder] = usePayOrderMutation();

  const [message, setMessage] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    console.log('CheckoutForm mounted');
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!stripe || !elements) return;

    setIsProcessing(true);

    try {
      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        confirmParams: { return_url: `${window.location.origin}/order/${orderId}` },
        redirect: 'if_required',
      });

      if (error) {
        setMessage(error.message);
        toast.error(error.message);
      } else if (paymentIntent && paymentIntent.status === 'succeeded') {
        setMessage(t('payment.success'));
        toast.success(t('payment.success'));
        
        await payOrder({
          orderId,
          details: {
            id: paymentIntent.id,
            status: paymentIntent.status,
            update_time: String(paymentIntent.created),
            email_address: paymentIntent.receipt_email,
          },
        }).unwrap();
      } else {
        setMessage(t('payment.unexpected'));
      }
    } catch (err) {
      toast.error(err.message || t('common.error'));
    }

    setIsProcessing(false);
  };

  return (
    <form id="payment-form" onSubmit={handleSubmit}>
      <div style={{ border: '1px solid #e0e0e0', padding: '15px', marginBottom: '15px', borderRadius: '5px' }}>
        <PaymentElement id="payment-element" />
      </div>
      
      <Button 
        disabled={isProcessing || !stripe || !elements} 
        id="submit" 
        className="mt-3 w-100"
        type="submit"
      >
        <span id="button-text">
          {isProcessing ? <Loader /> : t('payment.payNow')}
        </span>
      </Button>
      {message && <div id="payment-message" className="text-danger mt-2">{message}</div>}
    </form>
  );
};

export default CheckoutForm;
