import { apiSlice } from './apiSlice';
import { ORDERS_URL } from '../../utils/constants';

export const ordersApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    createOrder: builder.mutation({
      query: (order) => ({
        url: ORDERS_URL,
        method: 'POST',
        body: { ...order },
      }),
    }),
    getOrderById: builder.query({
      query: (orderId) => ({
        url: `${ORDERS_URL}/${orderId}`,
      }),
      providesTags: (result, error, orderId) => [{ type: 'Order', id: orderId }],
    }),
    getMyOrders: builder.query({
      query: () => ({
        url: `${ORDERS_URL}/myorders`,
      }),
      providesTags: ['Order'],
      keepUnusedDataFor: 5,
    }),
    getOrders: builder.query({
      query: () => ({
        url: ORDERS_URL,
      }),
      providesTags: ['Order'],
      keepUnusedDataFor: 5,
    }),
    updateOrderStatus: builder.mutation({
      query: (data) => ({
        url: `${ORDERS_URL}/${data.orderId}/status`,
        method: 'PUT',
        body: { status: data.status },
      }),
      invalidatesTags: ['Order'],
    }),
    // --- Stripe ---
    getStripePublishableKey: builder.query({
      query: () => ({
        url: '/api/config/stripe',
      }),
    }),
    createPaymentIntent: builder.mutation({
      query: (data) => ({
        url: '/api/create-payment-intent',
        method: 'POST',
        body: data,
      }),
    }),
    payOrder: builder.mutation({
      query: ({ orderId, details }) => ({
        url: `${ORDERS_URL}/${orderId}/pay`,
        method: 'PUT',
        body: details,
      }),
      invalidatesTags: ['Order'],
    }),
  }),
});

export const {
  useCreateOrderMutation,
  useGetOrderByIdQuery,
  useGetMyOrdersQuery,
  useGetOrdersQuery,
  useUpdateOrderStatusMutation,
  useGetStripePublishableKeyQuery, // <-- Экспорт
  useCreatePaymentIntentMutation, // <-- Экспорт
  usePayOrderMutation, // <-- Экспорт
} = ordersApiSlice;
