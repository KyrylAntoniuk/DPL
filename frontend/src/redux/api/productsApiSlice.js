import { apiSlice } from './apiSlice';
import { PRODUCTS_URL } from '../../utils/constants';

export const productsApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getProducts: builder.query({
      query: (params) => ({
        url: PRODUCTS_URL,
        params,
      }),
      providesTags: ['Product'],
      keepUnusedDataFor: 5,
    }),
    getProductById: builder.query({
      query: (productId) => ({
        url: `${PRODUCTS_URL}/${productId}`,
      }),
      providesTags: (result, error, productId) => [{ type: 'Product', id: productId }],
    }),
    getProductCategories: builder.query({
      query: () => ({
        url: `${PRODUCTS_URL}/categories`,
      }),
      keepUnusedDataFor: 60,
    }),
    // Новый эндпоинт для получения фильтров
    getProductFilters: builder.query({
      query: (params) => ({
        url: `${PRODUCTS_URL}/filters`,
        params, // Передаем текущие фильтры (например, категорию)
      }),
      keepUnusedDataFor: 60,
    }),
    // --- Admin/Manager ---
    createProduct: builder.mutation({
      query: () => ({
        url: PRODUCTS_URL,
        method: 'POST',
      }),
      invalidatesTags: ['Product'],
    }),
    updateProduct: builder.mutation({
      query: (data) => ({
        url: `${PRODUCTS_URL}/${data.productId}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['Product'],
    }),
    deleteProduct: builder.mutation({
      query: (productId) => ({
        url: `${PRODUCTS_URL}/${productId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Product'],
    }),
  }),
});

export const {
  useGetProductsQuery,
  useGetProductByIdQuery,
  useGetProductCategoriesQuery,
  useGetProductFiltersQuery, // Экспортируем новый хук
  useCreateProductMutation,
  useUpdateProductMutation,
  useDeleteProductMutation,
} = productsApiSlice;
