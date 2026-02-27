// Вспомогательная функция для округления до 2 знаков после запятой
export const addDecimals = (num) => {
    return (Math.round(num * 100) / 100).toFixed(2);
  };
  
  // Функция для обновления состояния корзины
  export const updateCart = (state) => {
    // 1. Рассчитываем стоимость всех товаров (itemsPrice)
    state.itemsPrice = addDecimals(
      state.cartItems.reduce((acc, item) => acc + item.basePrice * item.qty, 0)
    );
  
    // 2. Рассчитываем стоимость доставки (shippingPrice)
    // (Если сумма больше 5000 - доставка бесплатная)
    state.shippingPrice = addDecimals(state.itemsPrice > 5000 ? 0 : 500);
  
    // 3. Рассчитываем налог (taxPrice) - например, 15%
    state.taxPrice = addDecimals(Number((0.15 * state.itemsPrice).toFixed(2)));
  
    // 4. Рассчитываем итоговую стоимость (totalPrice)
    state.totalPrice = (
      Number(state.itemsPrice) +
      Number(state.shippingPrice) +
      Number(state.taxPrice)
    ).toFixed(2);
  
    // Сохраняем обновленное состояние корзины в localStorage
    localStorage.setItem('cart', JSON.stringify(state));
  
    return state;
  };