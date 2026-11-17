export function summarizeCart(items, coupon = '') {
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  let discount = 0;
  if (coupon.toUpperCase() === 'SAVE10') discount = subtotal * 0.1;
  if (coupon.toUpperCase() === 'FLAT100') discount = 100;
  return { subtotal, discount, total: subtotal - discount };
}
