import { apiSlice } from './apiSlice';
import { USERS_URL } from '../../utils/constants';

export const usersApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    login: builder.mutation({
      query: (data) => ({
        url: `${USERS_URL}/login`,
        method: 'POST',
        body: data,
      }),
    }),
    register: builder.mutation({
      query: (data) => ({
        url: `${USERS_URL}/register`,
        method: 'POST',
        body: data,
      }),
    }),
    logout: builder.mutation({
      query: () => ({
        url: `${USERS_URL}/logout`,
        method: 'POST',
      }),
    }),
    updateProfile: builder.mutation({
      query: (data) => ({
        url: `${USERS_URL}/profile`,
        method: 'PUT',
        body: data,
      }),
    }),
    // --- Favorites ---
    addFavorite: builder.mutation({
      query: (productId) => ({
        url: `${USERS_URL}/favorites`,
        method: 'POST',
        body: { productId },
      }),
    }),
    removeFavorite: builder.mutation({
      query: (productId) => ({
        url: `${USERS_URL}/favorites/${productId}`,
        method: 'DELETE',
      }),
    }),
    // --- Admin ---
    getUsers: builder.query({
      query: () => ({
        url: USERS_URL,
      }),
      providesTags: ['User'],
      keepUnusedDataFor: 5,
    }),
    getUserById: builder.query({
      query: (id) => ({
        url: `${USERS_URL}/${id}`,
      }),
      keepUnusedDataFor: 5,
    }),
    updateUser: builder.mutation({
      query: (data) => ({
        url: `${USERS_URL}/${data.userId}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['User'],
    }),
    deleteUser: builder.mutation({
      query: (userId) => ({
        url: `${USERS_URL}/${userId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['User'],
    }),
  }),
});

export const {
  useLoginMutation,
  useRegisterMutation,
  useLogoutMutation,
  useUpdateProfileMutation,
  useAddFavoriteMutation,
  useRemoveFavoriteMutation,
  useGetUsersQuery,
  useGetUserByIdQuery,
  useUpdateUserMutation,
  useDeleteUserMutation,
} = usersApiSlice;
