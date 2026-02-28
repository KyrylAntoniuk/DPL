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
    // --- Admin/Manager ---
    getOrders: builder.query({
      query: () => ({
        url: ORDERS_URL,
      }),
      providesTags: ['Order'],
      keepUnusedDataFor: 5,
    }),
    updateOrderStatus: builder.mutation({ // <-- Новая мутация
      query: (data) => ({
        url: `${ORDERS_URL}/${data.orderId}/status`,
        method: 'PUT',
        body: { status: data.status },
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
  useUpdateOrderStatusMutation, // <-- Экспорт
} = ordersApiSlice;
