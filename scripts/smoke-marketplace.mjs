import assert from 'node:assert/strict';

const base = 'http://127.0.0.1:4000/api';
const headers = { 'content-type': 'application/json', 'x-demo-session': 'marketplace-ci' };
async function request(path, options = {}) {
  const response = await fetch(base + path, { ...options, headers });
  const data = await response.json();
  assert.ok(response.ok, JSON.stringify({ path, status: response.status, data }));
  return data;
}
const health = await request('/health');
assert.equal(health.ok, true);
const products = await request('/products');
assert.ok(products.length >= 24, 'expected rich auto-seeded catalog');
const categories = await request('/categories');
assert.ok(categories.length >= 6, 'expected diverse departments');
const product = products.find(p => p.stock > 0 && p.price > 0);
assert.ok(product?.image && product?.brand && product?.mrp, 'product metadata');
assert.equal((await request('/products/' + product._id)).sku, product.sku);

await request('/wishlist/' + product._id, { method: 'POST' });
assert.ok((await request('/wishlist')).some(p => p._id === product._id));
await request('/wishlist/' + product._id, { method: 'DELETE' });
assert.ok(!(await request('/wishlist')).some(p => p._id === product._id));

await request('/cart/items', { method: 'POST', body: JSON.stringify({ productId: product._id, quantity: 2 }) });
const cart = await request('/cart?coupon=SAVE10');
assert.equal(cart.items.length, 1);
assert.equal(cart.items[0].quantity, 2);
assert.equal(cart.subtotal, product.price * 2);

const delivery = { fullName: 'Demo Shopper', phone: '9876543210', address: '123 Demo Street',
  city: 'Kolkata', state: 'West Bengal', pincode: '700001' };
const checkout = await request('/orders', { method: 'POST', body: JSON.stringify({
  delivery, paymentMethod: 'cod', coupon: 'SAVE10'
}) });
assert.ok(checkout.orderId);
const order = await request('/orders/' + checkout.orderId);
assert.equal(order.delivery.fullName, delivery.fullName);
assert.equal(order.paymentMethod, 'cod');
assert.equal(order.lines[0].quantity, 2);
assert.ok((await request('/orders')).some(o => o._id === checkout.orderId));
assert.equal((await request('/cart')).items.length, 0);
console.log('Marketplace smoke test passed: catalog, categories, product details, wishlist, cart, address checkout, order history.');
