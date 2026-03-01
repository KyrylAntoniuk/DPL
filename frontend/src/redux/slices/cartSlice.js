import { createSlice } from '@reduxjs/toolkit';
import { updateCart } from '../../utils/cartUtils';

const initialState = localStorage.getItem('cart')
    ? JSON.parse(localStorage.getItem('cart'))
    : { cartItems: [], shippingAddress: {}, paymentMethod: 'PayPal' };

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    addToCart: (state, action) => {
      const newItem = action.payload;

      const existItem = state.cartItems.find(
          (x) => x._id === newItem._id && x.variantId === newItem.variantId
      );

      if (existItem) {
        state.cartItems = state.cartItems.map((x) =>
            x._id === existItem._id && x.variantId === existItem.variantId ? newItem : x
        );
      } else {
        state.cartItems = [...state.cartItems, newItem];
      }

      return updateCart(state);
    },
    removeFromCart: (state, action) => {
      const { productId, variantId } = action.payload;
      state.cartItems = state.cartItems.filter(
          (x) => !(x._id === productId && x.variantId === variantId)
      );
      return updateCart(state);
    },
    saveShippingAddress: (state, action) => {
      state.shippingAddress = action.payload;
      return updateCart(state);
    },
    savePaymentMethod: (state, action) => {
      state.paymentMethod = action.payload;
      return updateCart(state);
    },
    clearCartItems: (state) => {
      state.cartItems = [];
      return updateCart(state);
    },
  },
});

export const {
  addToCart,
  removeFromCart,
  saveShippingAddress,
  savePaymentMethod,
  clearCartItems,
} = cartSlice.actions;

export default cartSlice.reducer;
