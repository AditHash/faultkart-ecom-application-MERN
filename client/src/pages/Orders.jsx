import React, { useState } from 'react';
import { Package, CheckCircle2, Search, Printer, HelpCircle, ShoppingCart, XCircle, MapPin, Coins } from 'lucide-react';
import { api, money, navigate, useStore, shortId, formatDate, sessionId } from '../lib.js';
import { Breadcrumbs, Empty, ProductImage } from '../components.jsx';

const statusClass = status => status === 'Cancelled' ? 'red' : status === 'Delivered' ? 'green' : 'blue';
const paymentNames = { cod: 'Cash on Delivery', 'demo-online': 'Online (simulated)', upi: 'UPI (simulated)', card: 'Card (simulated)', netbanking: 'Net Banking (simulated)', wallet: 'Gift card balance' };

export function Success() {
  const { route, orders } = useStore();
  const currentOrder = orders.find(o => o._id === route.id);
  return <div className="success-page"><div className="success-icon"><CheckCircle2 size={48}/></div><span className="eyebrow">ORDER CONFIRMED</span>
    <h1>It's officially on the list!</h1><p>Your demo order was placed successfully. No real payment or delivery will take place.</p>
    <div className="success-details"><span>Order ID</span><strong>#{route.id.slice(-8).toUpperCase()}</strong>
      {currentOrder && <><span>Order total</span><strong>{money(currentOrder.total)}</strong><span>Status</span><strong>Placed</strong>
        {currentOrder.coinsEarned > 0 && <><span>SuperCoins earned</span><strong>{currentOrder.coinsEarned}</strong></>}</>}</div>
    <div className="success-actions"><button className="btn btn-primary" onClick={() => navigate('orders')}>View my orders <Package size={18}/></button>
      <button className="btn btn-outline" onClick={() => navigate('orders/' + route.id)}>Track order</button>
      <button className="btn btn-outline" onClick={() => navigate('shop')}>Continue shopping</button></div></div>;
}

export function OrderList() {
  const { orders } = useStore();
  const [term, setTerm] = useState('');
  const [statuses, setStatuses] = useState([]);
  const [days, setDays] = useState(0);
  const toggle = s => setStatuses(statuses.includes(s) ? statuses.filter(x => x !== s) : [...statuses, s]);
  const bucket = order => order.displayStatus === 'Cancelled' ? 'Cancelled' : order.displayStatus === 'Delivered' ? 'Delivered' : 'On the way';
  const list = orders.filter(order =>
    (!statuses.length || statuses.includes(bucket(order))) &&
    (!days || Date.now() - new Date(order.createdAt) <= days * 864e5) &&
    (!term.trim() || order.lines.some(l => l.name.toLowerCase().includes(term.trim().toLowerCase())) || shortId(order._id).includes(term.trim().toUpperCase())));
  return <div className="inner-page">
    <Breadcrumbs items={[{ label: 'My Account', to: 'account' }, { label: 'My Orders' }]}/>
    {orders.length ? <div className="orders-layout">
      <aside className="filter-sidebar static"><div className="filter-title"><h3>Filters</h3></div>
        <div className="filter-group"><h4>ORDER STATUS</h4>{['On the way', 'Delivered', 'Cancelled'].map(s => <label key={s} className="check"><input type="checkbox" checked={statuses.includes(s)} onChange={() => toggle(s)}/>{s}</label>)}</div>
        <div className="filter-group"><h4>ORDER TIME</h4>{[[30, 'Last 30 days'], [365, 'Last 12 months'], [0, 'All time']].map(([d, label]) => <label key={d} className="check"><input type="radio" name="order-days" checked={days === d} onChange={() => setDays(d)}/>{label}</label>)}</div>
      </aside>
      <section>
        <h1 className="page-title">My orders</h1>
        <form className="order-search" onSubmit={e => e.preventDefault()}><input aria-label="Search your orders" placeholder="Search your orders here" value={term} onChange={e => setTerm(e.target.value)}/><button aria-label="Search orders"><Search size={16}/> Search Orders</button></form>
        {list.length ? <div className="order-list">{list.map(order => <button className="order-card" key={order._id} onClick={() => navigate('orders/' + order._id)}>
          <div className="order-line-main">{order.lines.slice(0, 1).map((item, idx) => <React.Fragment key={idx}><ProductImage product={item} className="order-thumb" width={200}/>
            <div><strong>{item.name}</strong><small>{order.lines.length > 1 ? '+' + (order.lines.length - 1) + ' more item(s) · ' : ''}Qty: {item.quantity}</small><small>#{shortId(order._id)}</small></div></React.Fragment>)}</div>
          <strong>{money(order.total)}</strong>
          <div className="order-status-text"><span className={'dot ' + statusClass(order.displayStatus)}/><strong>{order.displayStatus === 'Delivered' ? 'Delivered on ' + formatDate(order.expectedDelivery, { month: 'short', day: 'numeric' })
            : order.displayStatus === 'Cancelled' ? 'Cancelled' : order.displayStatus + ' · Delivery by ' + formatDate(order.expectedDelivery, { month: 'short', day: 'numeric' })}</strong>
            <small>Placed {formatDate(order.createdAt)}</small></div>
        </button>)}</div> : <Empty icon={Search} title="No matching orders" description="Try a different search or filter."/>}
      </section>
    </div> : <Empty icon={Package} title="No orders yet" description="Your demo orders will show up here after checkout." action={() => navigate('shop')}/>}
  </div>;
}

export function OrderDetail() {
  const { route, orders, products, addToCart, busy, act } = useStore();
  const order = orders.find(o => o._id === route.id);
  if (!order) return <Empty icon={Package} title="Order not found" description="It may belong to a different demo session." action={() => navigate('orders')} actionLabel="My orders"/>;
  async function cancel() {
    await act(() => api('/orders/' + order._id + '/cancel', { method: 'POST' }), 'Order cancelled');
  }
  function buyAgain() {
    const product = products.find(p => p.sku === order.lines[0].sku);
    if (product) addToCart(product);
  }
  const d = order.delivery || {};
  return <div className="inner-page order-detail">
    <Breadcrumbs items={[{ label: 'My Orders', to: 'orders' }, { label: '#' + shortId(order._id) }]}/>
    <div className="detail-cards">
      <section className="panel"><h3><MapPin size={16}/> Delivery Address</h3>{order.delivery ? <p><strong>{d.fullName}</strong><br/>{d.address}, {d.city}, {d.state} - {d.pincode}<br/>Phone: {d.phone}</p> : <p className="muted">No address recorded</p>}</section>
      <section className="panel"><h3><Coins size={16}/> Your Rewards</h3><p>{order.coinsEarned || 0} SuperCoins {order.displayStatus === 'Cancelled' ? 'reversed' : 'earned'} on this order</p></section>
      <section className="panel"><h3>More actions</h3><div className="action-col">
        <button className="btn btn-outline small" onClick={() => window.open('/api/orders/' + order._id + '/invoice?s=' + encodeURIComponent(sessionId), '_blank', 'noopener')}><Printer size={15}/> Download Invoice</button>
        <button className="btn btn-outline small" onClick={() => navigate('help?order=' + order._id)}><HelpCircle size={15}/> Need help?</button></div></section>
    </div>
    <section className="panel">
      {order.lines.map((item, idx) => <div className="order-line" key={idx}><ProductImage product={item} className="order-thumb" width={200}/><div><strong>{item.name}</strong><small>Qty: {item.quantity} · {money(item.unitPrice)} each</small></div><strong>{money(item.unitPrice * item.quantity)}</strong></div>)}
      <ol className={'tracker' + (order.displayStatus === 'Cancelled' ? ' cancelled' : '')}>{order.tracking.map(stage => <li key={stage.label} className={stage.done ? 'done' : ''}>
        <span className="tracker-dot"/><strong>{stage.label}</strong><small>{formatDate(stage.at, { weekday: 'short', day: 'numeric', month: 'short' })}{stage.done ? ', ' + new Date(stage.at).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) : ''}</small></li>)}</ol>
      <div className="order-actions">
        {order.cancellable && <button className="btn btn-outline danger" disabled={busy} onClick={cancel}><XCircle size={16}/> Cancel order</button>}
        <button className="btn btn-primary" disabled={busy} onClick={buyAgain}><ShoppingCart size={16}/> Buy again</button>
      </div>
    </section>
    <section className="panel price-summary"><h3>Payment</h3>
      <div className="price-line"><span>Subtotal</span><span>{money(order.subtotal)}</span></div>
      <div className="price-line"><span>Discount</span><span className="green">−{money(order.discount)}</span></div>
      <div className="price-line"><span>Delivery</span><span className="green">FREE</span></div>
      <div className="price-total"><strong>Total</strong><strong>{money(order.total)}</strong></div>
      <p className="muted">Paid via {paymentNames[order.paymentMethod] || order.paymentMethod} · Placed {formatDate(order.createdAt)}</p>
    </section>
  </div>;
}
