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
    // --- New Endpoints for Landing Page ---
    getTopProducts: builder.query({
      query: () => ({
        url: PRODUCTS_URL,
        params: { sort: '-rating', pageSize: 4 },
      }),
      keepUnusedDataFor: 5,
    }),
    getNewProducts: builder.query({
      query: () => ({
        url: PRODUCTS_URL,
        params: { sort: '-createdAt', pageSize: 4 },
      }),
      keepUnusedDataFor: 5,
    }),
    // --------------------------------------
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
    uploadProductImage: builder.mutation({ // <-- Новая мутация
      query: (data) => ({
        url: '/api/upload',
        method: 'POST',
        body: data,
      }),
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
  useGetFilterConfigQuery,
  useUpdateFilterConfigMutation,
  useGetDynamicFiltersQuery,
  useGetTopProductsQuery,
  useGetNewProductsQuery,
  useCreateReviewMutation,
  useUpdateProductMutation,
  useCreateProductMutation,
  useUploadProductImageMutation, // <-- Экспорт
  useImportProductsMutation,
  useDeleteProductMutation,
} = productsApiSlice;
