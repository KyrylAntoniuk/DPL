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
    getProductDetails: builder.query({
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
    getProductFilters: builder.query({
      query: (params) => ({
        url: `${PRODUCTS_URL}/filters`,
        params,
      }),
      keepUnusedDataFor: 60,
    }),
    // --- Новые эндпоинты для динамических фильтров ---
    getFilterConfig: builder.query({
      query: () => ({
        url: '/api/filters/config',
      }),
    }),
    updateFilterConfig: builder.mutation({
      query: (data) => ({
        url: '/api/filters/config',
        method: 'PUT',
        body: data,
      }),
    }),
    getDynamicFilters: builder.query({
      query: (params) => ({
        url: '/api/filters',
        params,
      }),
    }),
    // ------------------------------------------------
    createReview: builder.mutation({
      query: (data) => ({
        url: `${PRODUCTS_URL}/${data.productId}/reviews`,
        method: 'POST',
        body: data,
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
    createProduct: builder.mutation({
      query: (data) => ({
        url: PRODUCTS_URL,
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Product'],
    }),
    importProducts: builder.mutation({
      query: (products) => ({
        url: `${PRODUCTS_URL}/import`,
        method: 'POST',
        body: products,
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
  useGetProductDetailsQuery,
  useGetProductCategoriesQuery,
  useGetProductFiltersQuery,
  useGetFilterConfigQuery, // <-- Экспорт
  useUpdateFilterConfigMutation, // <-- Экспорт
  useGetDynamicFiltersQuery, // <-- Экспорт
  useCreateReviewMutation,
  useUpdateProductMutation,
  useCreateProductMutation,
  useImportProductsMutation,
  useDeleteProductMutation,
} = productsApiSlice;
