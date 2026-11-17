import React, { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import './style.css';

const storedSession = localStorage.getItem('faultkart-session') || Math.random().toString(36).slice(2, 12);
localStorage.setItem('faultkart-session', storedSession);
async function api(path, options = {}) {
  const response = await fetch('/api' + path, {
    ...options,
    headers: { 'Content-Type': 'application/json', 'x-demo-session': 'demo-' + storedSession, ...(options.headers || {}) }
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || 'Request failed');
  return data;
}
const money = amount => '₹' + Number(amount).toFixed(2);

function App() {
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState({ items: [], subtotal: 0, discount: 0, total: 0 });
  const [orders, setOrders] = useState([]);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [sort, setSort] = useState('name');
  const [coupon, setCoupon] = useState('');
  const [status, setStatus] = useState('');
  const [busy, setBusy] = useState(false);

  async function refreshCart() {
    setCart(await api('/cart?coupon=' + encodeURIComponent(coupon)));
  }
  async function refreshProducts() {
    const params = new URLSearchParams({ q: search, category, sort });
    setProducts(await api('/products?' + params.toString()));
  }
  async function refreshOrders() {
    setOrders(await api('/orders'));
  }
  useEffect(() => {
    refreshProducts().catch(e => setStatus(e.message));
  }, [search, category, sort]);
  useEffect(() => {
    refreshCart().catch(e => setStatus(e.message));
  }, [coupon]);
  useEffect(() => { refreshOrders().catch(e => setStatus(e.message)); }, []);

  async function run(action) {
    setBusy(true);
    try {
      await action();
      await Promise.all([refreshCart(), refreshProducts(), refreshOrders()]);
      setStatus('Action completed.');
    } catch (error) { setStatus(error.message); }
    finally { setBusy(false); }
  }
  const json = value => JSON.stringify(value);
  const cartQuantity = id => cart.items.find(i => i.productId === id)?.quantity || 0;
  return <main>
    <header><div><h1>FaultKart</h1><p>An intentionally imperfect e-commerce playground</p></div><span className="tag">LOCAL DEMO • NO REAL PAYMENTS</span></header>
    <section className="notice">Intern challenge: investigate unexpected behavior, reproduce it, write tests, and propose scoped fixes. See the repository guides.</section>
    {status && <div className="status" role="status">{status}</div>}
    <div className="layout">
      <section>
        <div className="section-title"><h2>Explore products</h2><span>{products.length} items</span></div>
        <div className="filters">
          <input aria-label="Search products" placeholder="Search products..." value={search} onChange={e => setSearch(e.target.value)} />
          <select aria-label="Filter category" value={category} onChange={e => setCategory(e.target.value)}>
            <option value="">All categories</option><option>Electronics</option><option>Accessories</option><option>Home</option>
          </select>
          <select aria-label="Sort products" value={sort} onChange={e => setSort(e.target.value)}>
            <option value="name">Name</option><option value="price-asc">Price: low to high</option><option value="price-desc">Price: high to low</option>
          </select>
        </div>
        <div className="products">
          {products.map(p => <article className="product" key={p._id}>
            <div className="art" aria-hidden="true">{p.category === 'Electronics' ? '⌘' : p.category === 'Home' ? '⌂' : '◇'}</div>
            <div className="small">{p.category} · {p.sku}</div>
            <h3>{p.name}</h3>
            <p>Stock: {p.stock}</p>
            <div className="product-bottom"><strong>{money(p.price)}</strong><button disabled={busy} onClick={() => run(() => api('/cart/items', { method: 'POST', body: json({ productId: p._id, quantity: cartQuantity(p._id) + 1 }) }))}>Add to cart</button></div>
          </article>)}
          {products.length === 0 && <p>No products found. Run the seed command if the catalog is empty.</p>}
        </div>
      </section>
      <aside>
        <div className="panel"><div className="section-title"><h2>Your cart</h2><span>{cart.items.length} lines</span></div>
          {cart.items.length === 0 && <p className="muted">Your cart is empty.</p>}
          {cart.items.map(item => <div className="cart-line" key={item.productId}>
            <div><strong>{item.name}</strong><div className="small">{money(item.price)} each</div></div>
            <div className="controls">
              <button aria-label={'Decrease ' + item.name} disabled={busy} onClick={() => run(() => api('/cart/items/' + item.productId, { method: 'PATCH', body: json({ quantity: item.quantity - 1 }) }))}>−</button>
              <span>{item.quantity}</span>
              <button aria-label={'Increase ' + item.name} disabled={busy} onClick={() => run(() => api('/cart/items/' + item.productId, { method: 'PATCH', body: json({ quantity: item.quantity + 1 }) }))}>+</button>
              <button aria-label={'Remove ' + item.name} disabled={busy} onClick={() => run(() => api('/cart/items/' + item.productId, { method: 'DELETE' }))}>×</button>
            </div>
          </div>)}
          <label className="small" htmlFor="coupon">Demo coupon</label>
          <input id="coupon" placeholder="e.g. SAVE10" value={coupon} onChange={e => setCoupon(e.target.value)} />
          <div className="totals"><div><span>Subtotal</span><strong>{money(cart.subtotal)}</strong></div><div><span>Discount</span><strong>−{money(cart.discount)}</strong></div><div className="grand"><span>Total</span><strong>{money(cart.total)}</strong></div></div>
          <button className="primary" disabled={busy || !cart.items.length} onClick={() => run(() => api('/orders', { method: 'POST', body: json({ coupon }) }))}>Place demo order</button>
        </div>
        <div className="panel"><div className="section-title"><h2>Order history</h2><span>{orders.length}</span></div>
          {orders.length === 0 && <p className="muted">No demo orders yet.</p>}
          {orders.map(o => <div className="order" key={o._id}><span>{new Date(o.createdAt).toLocaleDateString()}</span><strong>{money(o.total)}</strong><div className="small">{o.lines.map(l => l.name + ' × ' + l.quantity).join(', ')}</div></div>)}
        </div>
      </aside>
    </div>
    <footer>FaultKart is a debugging training environment. Never use real personal or payment information.</footer>
  </main>;
}
createRoot(document.getElementById('root')).render(<App />);
