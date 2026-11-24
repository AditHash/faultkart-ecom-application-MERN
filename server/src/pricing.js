export function summarizeCart(items, coupon = '') {
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  let discount = 0;
  const code = typeof coupon === 'string' ? coupon.trim().toUpperCase() : '';
  if (code === 'SAVE10') discount = Math.round(subtotal * 0.1);
  if (code === 'FLAT100') discount = Math.min(subtotal, 100);
  const total = Math.max(0, subtotal - discount);
  return { subtotal, discount, total };
}
