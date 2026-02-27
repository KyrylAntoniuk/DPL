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

      // Ищем товар по ID продукта И по ID варианта
      const existItem = state.cartItems.find(
        (x) => x._id === newItem._id && x.variantId === newItem.variantId
      );

      if (existItem) {
        // Если такой товар (с таким же вариантом) уже есть, обновляем его
        state.cartItems = state.cartItems.map((x) =>
          x._id === existItem._id && x.variantId === existItem.variantId ? newItem : x
        );
      } else {
        // Иначе, добавляем новый товар в корзину
        state.cartItems = [...state.cartItems, newItem];
      }

      return updateCart(state);
    },
    removeFromCart: (state, action) => {
      // При удалении также нужно учитывать и ID варианта
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
    clearCartItems: (state, action) => {
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
