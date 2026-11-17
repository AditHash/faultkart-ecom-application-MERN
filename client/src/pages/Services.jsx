import React, { useEffect, useState } from 'react';
import {
  Store, TrendingUp, Truck, Wallet, HelpCircle, ChevronDown, Plane, Users, Zap, Clock, Ticket, Copy, ShieldCheck, CheckCircle2, Smartphone
} from 'lucide-react';
import { api, money, navigate, useStore, formatDate, isoDay, savings, shortId } from '../lib.js';
import { Breadcrumbs, Empty, ProductCard, Shelf, Tile, Modal } from '../components.jsx';

export function Login() {
  const { route, me, login } = useStore();
  const signup = route.params.get('mode') === 'signup';
  const next = route.params.get('next') || '';
  const [form, setForm] = useState({ name: '', phone: '', email: '' });
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  function requestOtp(event) {
    event.preventDefault();
    if (!/^[6-9]\d{9}$/.test(form.phone)) { setError('Please enter a valid 10-digit mobile number'); return; }
    if (signup && !form.name.trim()) { setError('Please enter your name'); return; }
    setError(''); setOtpSent(true);
  }
  async function verify(event) {
    event.preventDefault();
    if (otp !== '123456') { setError('Incorrect OTP. The demo OTP is 123456.'); return; }
    try { await login(form); navigate(next || ''); }
    catch (err) { setError(err.message); }
  }
  if (me?.loggedIn) return <Empty icon={CheckCircle2} title={'You are logged in as ' + me.name} description="Manage your account or continue shopping." action={() => navigate('account')} actionLabel="My account"/>;
  return <div className="login-page">
    <div className="login-art"><h1>{signup ? "Looks like you're new here!" : 'Login'}</h1><p>{signup ? 'Sign up with your mobile number to get started' : 'Get access to your Orders, Wishlist and Recommendations'}</p><Smartphone size={110} strokeWidth={1}/></div>
    {!otpSent ? <form className="login-form" onSubmit={requestOtp}>
      {signup && <label>Your name <input value={form.name} maxLength={60} onChange={e => setForm({ ...form, name: e.target.value })}/></label>}
      <label>Enter Mobile number <input inputMode="numeric" maxLength={10} value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })}/></label>
      {signup && <label>Email (optional) <input type="email" maxLength={120} value={form.email} onChange={e => setForm({ ...form, email: e.target.value })}/></label>}
      <p className="muted small-text">By continuing, you agree to FaultKart's demo <button type="button" className="text-link" onClick={() => navigate('page/terms')}>Terms of Use</button> and <button type="button" className="text-link" onClick={() => navigate('page/privacy')}>Privacy Policy</button>.</p>
      {error && <p className="form-error">{error}</p>}
      <button className="btn btn-orange full">Request OTP</button>
      <button type="button" className="text-link center" onClick={() => navigate(signup ? 'login' : 'login?mode=signup')}>{signup ? 'Existing user? Log in' : 'New to FaultKart? Create an account'}</button>
    </form> : <form className="login-form" onSubmit={verify}>
      <p>Enter the OTP sent to <strong>+91 {form.phone}</strong> <button type="button" className="text-link" onClick={() => setOtpSent(false)}>Change</button></p>
      <label>One-time password <input inputMode="numeric" maxLength={6} value={otp} onChange={e => setOtp(e.target.value)} autoFocus/></label>
      <p className="demo-note">Demo mode: no SMS is sent. Use OTP <strong>123456</strong>.</p>
      {error && <p className="form-error">{error}</p>}
      <button className="btn btn-orange full">Verify</button>
    </form>}
  </div>;
}

export function Seller() {
  const { notify } = useStore();
  const [form, setForm] = useState({ businessName: '', contactName: '', email: '', phone: '', gstin: '', category: 'Fashion' });
  const [apps, setApps] = useState([]);
  const [error, setError] = useState('');
  const load = () => api('/seller/applications').then(setApps).catch(() => {});
  useEffect(() => { load(); }, []);
  async function submit(event) {
    event.preventDefault();
    try { await api('/seller/applications', { method: 'POST', body: JSON.stringify(form) }); notify('Seller application submitted'); setError(''); load(); }
    catch (err) { setError(err.message); }
  }
  const set = key => e => setForm({ ...form, [key]: key === 'gstin' ? e.target.value.toUpperCase() : e.target.value });
  return <div className="inner-page seller-page">
    <section className="seller-hero"><div><span className="eyebrow">FAULTKART SELLER HUB (DEMO)</span><h1>Sell online to millions of demo customers</h1><p>Start selling with 0% commission on your first 30 days. Practice the onboarding flow — no real business is registered.</p></div><Store size={110} strokeWidth={1}/></section>
    <div className="seller-benefits">{[[Users, 'Huge customer base'], [TrendingUp, 'Grow with ads & insights'], [Truck, 'Pick-up & delivery handled'], [Wallet, 'Payments in 7 days']]
      .map(([Icon, label]) => <div key={label}><Icon size={28}/><strong>{label}</strong></div>)}</div>
    <div className="seller-grid">
      <form className="panel" onSubmit={submit}><h2>Register as a seller</h2>
        <div className="form-grid">
          <label>Business name <input maxLength={100} value={form.businessName} onChange={set('businessName')}/></label>
          <label>Contact person <input maxLength={60} value={form.contactName} onChange={set('contactName')}/></label>
          <label>Business email <input type="email" maxLength={120} value={form.email} onChange={set('email')}/></label>
          <label>Seller mobile <input inputMode="numeric" maxLength={10} value={form.phone} onChange={set('phone')}/></label>
          <label>GSTIN (optional) <input maxLength={15} value={form.gstin} onChange={set('gstin')} placeholder="15-character demo GSTIN"/></label>
          <label>Primary category <select value={form.category} onChange={set('category')}>{['Fashion', 'Mobiles', 'Electronics', 'Home', 'Grocery', 'Books', 'Toys', 'Furniture', 'Beauty'].map(c => <option key={c}>{c}</option>)}</select></label>
        </div>
        {error && <p className="form-error">{error}</p>}
        <button className="btn btn-orange">Start selling</button>
      </form>
      <div className="panel"><h2>Your applications</h2>{apps.length ? apps.map(a => <div className="ticket" key={a._id}><strong>{a.businessName}</strong><span className="tag">{a.status}</span><small>{a.category} · {formatDate(a.createdAt)}</small></div>)
        : <p className="muted">No applications yet.</p>}</div>
    </div>
  </div>;
}

const faqs = {
  'Order related': [['How do I track my order?', 'Open My Orders and pick the order to see its live (demo) tracking timeline.'], ['Can I cancel my order?', 'Yes, until it is out for delivery. Open the order and press “Cancel order”.']],
  'Returns & refunds': [['When will I get my refund?', 'Demo refunds for prepaid orders are shown instantly as a notification; gift card payments return to your balance.']],
  Payments: [['Which payment options are available?', 'UPI, cards, net banking, gift card balance and cash on delivery — all simulated. No money is ever charged.']],
  Account: [['How do I log in?', 'Use any 10-digit mobile number and the demo OTP 123456.']],
  Delivery: [['How is the delivery date calculated?', 'It is estimated from your pincode. This is demo data.']]
};
export function Help() {
  const { route, notify, orders } = useStore();
  const [open, setOpen] = useState('');
  const [form, setForm] = useState({ topic: route.params.get('order') ? 'Order related' : 'Other', orderId: route.params.get('order') || '', message: '' });
  const [tickets, setTickets] = useState([]);
  const [error, setError] = useState('');
  const [viewing, setViewing] = useState(null);
  const [track, setTrack] = useState({ phone: '', pincode: '' });
  const [tracked, setTracked] = useState(null);
  async function lookup(event) {
    event.preventDefault();
    try { setTracked(await api('/orders/lookup?' + new URLSearchParams(track))); }
    catch (err) { setTracked({ error: err.message }); }
  }
  const load = () => api('/support/tickets').then(setTickets).catch(() => {});
  useEffect(() => { load(); }, []);
  async function submit(event) {
    event.preventDefault();
    try { await api('/support/tickets', { method: 'POST', body: JSON.stringify(form) }); notify('Support ticket created'); setForm({ ...form, message: '' }); setError(''); load(); }
    catch (err) { setError(err.message); }
  }
  return <div className="inner-page help-page">
    <Breadcrumbs items={[{ label: 'Help Centre' }]}/>
    <section className="help-hero"><HelpCircle size={40}/><div><h1>FaultKart Help Centre | 24x7 Customer Care Support</h1><p>Demo support — tickets are stored locally and answered by nobody.</p></div></section>
    <div className="seller-grid">
      <div className="panel"><h2>Frequently asked questions</h2>{Object.entries(faqs).map(([topic, list]) => <div key={topic} className="faq-group"><h4>{topic}</h4>
        {list.map(([q, a]) => <div key={q} className="faq"><button aria-expanded={open === q} onClick={() => setOpen(open === q ? '' : q)}>{q}<ChevronDown size={16}/></button>{open === q && <p>{a}</p>}</div>)}</div>)}</div>
      <div>
        <form className="panel" onSubmit={submit}><h2>Raise a ticket</h2>
          <label>Topic <select value={form.topic} onChange={e => setForm({ ...form, topic: e.target.value })}>{['Order related', 'Returns & refunds', 'Payments', 'Account', 'Delivery', 'Other'].map(t => <option key={t}>{t}</option>)}</select></label>
          <label>Order (optional) <select value={form.orderId} onChange={e => setForm({ ...form, orderId: e.target.value })}><option value="">Not about an order</option>{orders.map(o => <option key={o._id} value={o._id}>#{shortId(o._id)} · {o.lines[0]?.name}</option>)}</select></label>
          <label>Describe the issue <textarea rows={4} maxLength={1000} value={form.message} onChange={e => setForm({ ...form, message: e.target.value })}/></label>
          {error && <p className="form-error">{error}</p>}
          <button className="btn btn-primary">Submit</button>
        </form>
        <div className="panel"><h2>My tickets</h2>{tickets.length ? tickets.map(t => <div className="ticket" key={t._id}><strong>#{shortId(t._id)} · {t.topic}</strong><span className="tag">{t.status}</span><p>{t.message}</p><small>{formatDate(t.createdAt)} · <button className="text-link" onClick={() => api('/support/tickets/' + t._id).then(setViewing).catch(err => notify(err.message))}>View</button></small></div>) : <p className="muted">No tickets yet.</p>}</div>
        <form className="panel" onSubmit={lookup}><h2>Track an order without logging in</h2>
          <label>Mobile number used for the order <input inputMode="numeric" maxLength={10} value={track.phone} onChange={e => setTrack({ ...track, phone: e.target.value })}/></label>
          <label>Delivery pincode <input inputMode="numeric" maxLength={6} value={track.pincode} onChange={e => setTrack({ ...track, pincode: e.target.value })}/></label>
          <button className="btn btn-outline">Track</button>
          {tracked && (tracked.error ? <p className="form-error">{tracked.error}</p>
            : <div className="ticket"><strong>#{shortId(tracked._id)} · {tracked.displayStatus}</strong><small>{tracked.lines.map(l => l.name).join(', ')} · Expected {formatDate(tracked.expectedDelivery)}</small></div>)}
        </form>
      </div>
      {viewing && <Modal title={'Ticket #' + shortId(viewing._id)} onClose={() => setViewing(null)}><p><strong>{viewing.topic}</strong> · <span className="tag">{viewing.status}</span></p><p>{viewing.message}</p><small className="muted">Created {formatDate(viewing.createdAt)}{viewing.orderId ? ' · Order #' + shortId(viewing.orderId) : ''}</small></Modal>}
    </div>
  </div>;
}

export function Travel() {
  const { notify, refreshMe } = useStore();
  const [airports, setAirports] = useState({});
  const [query, setQuery] = useState({ from: 'CCU', to: 'DEL', date: isoDay(new Date()), passengers: 1 });
  const [flights, setFlights] = useState(null);
  const [trips, setTrips] = useState([]);
  const [error, setError] = useState('');
  const loadTrips = () => api('/travel/trips').then(setTrips).catch(() => {});
  useEffect(() => { api('/travel/airports').then(setAirports).catch(() => {}); loadTrips(); }, []);
  async function search(event) {
    event.preventDefault();
    try { setFlights(await api('/travel/flights?' + new URLSearchParams(query))); setError(''); }
    catch (err) { setError(err.message); setFlights(null); }
  }
  async function book(flight) {
    try {
      const booking = await api('/travel/bookings', { method: 'POST', body: JSON.stringify({ ...query, flightId: flight.id }) });
      notify('Trip booked (demo) · PNR ' + booking.pnr); loadTrips(); refreshMe();
    } catch (err) { notify(err.message); }
  }
  const swap = () => setQuery({ ...query, from: query.to, to: query.from });
  return <div className="inner-page travel-page">
    <section className="travel-hero"><Plane size={40}/><div><h1>Book flights (demo)</h1><p>Search fictional flights between Indian cities. No tickets are issued and no payment is taken.</p></div></section>
    <form className="panel flight-form" onSubmit={search}>
      <label>From <select value={query.from} onChange={e => setQuery({ ...query, from: e.target.value })}>{Object.entries(airports).map(([code, city]) => <option key={code} value={code}>{city} ({code})</option>)}</select></label>
      <button type="button" className="swap" aria-label="Swap cities" onClick={swap}>⇄</button>
      <label>To <select value={query.to} onChange={e => setQuery({ ...query, to: e.target.value })}>{Object.entries(airports).map(([code, city]) => <option key={code} value={code}>{city} ({code})</option>)}</select></label>
      <label>Depart <input type="date" value={query.date} onChange={e => setQuery({ ...query, date: e.target.value })}/></label>
      <label>Travellers <select value={query.passengers} onChange={e => setQuery({ ...query, passengers: Number(e.target.value) })}>{[1, 2, 3, 4, 5, 6].map(n => <option key={n} value={n}>{n}</option>)}</select></label>
      <button className="btn btn-orange">Search</button>
    </form>
    {error && <p className="form-error">{error}</p>}
    {flights && <div className="panel"><h2>{flights.length} flights · {airports[query.from]} → {airports[query.to]}</h2>
      {flights.map(f => <div key={f.id} className="flight">
        <div><strong>{f.airline}</strong><small>{f.flightNo}</small></div>
        <div className="times"><strong>{f.depart}</strong><span>{Math.floor(f.duration / 60)}h {f.duration % 60}m · {f.stops ? '1 stop' : 'Non stop'}</span><strong>{f.arrive}</strong></div>
        <div><strong>{money(f.price)}</strong><small>per adult</small></div>
        <button className="btn btn-primary small" onClick={() => book(f)}>Book</button>
      </div>)}</div>}
    <div className="panel"><h2>My trips</h2>{trips.length ? trips.map(t => <div className="ticket" key={t.pnr + t.createdAt}><strong>{t.from} → {t.to} · {t.airline} {t.flightNo}</strong><span className="tag">PNR {t.pnr}</span>
      <small>{formatDate(t.date)} · {t.depart}–{t.arrive} · {t.passengers} traveller(s) · {money(t.price)}</small></div>) : <p className="muted">No trips booked yet.</p>}</div>
  </div>;
}

export function Minutes() {
  const { products } = useStore();
  const grocery = products.filter(p => p.category === 'Grocery');
  const quick = products.filter(p => ['Grocery', 'Beauty', 'Home'].includes(p.category) && p.price < 1000);
  return <div className="inner-page minutes-page">
    <section className="minutes-hero"><Zap size={44} fill="currentColor"/><div><h1>FaultKart Minutes</h1><p><Clock size={15}/> Delivery in 10 minutes* to select demo pincodes</p></div></section>
    <div className="product-grid">{grocery.map(product => <ProductCard key={product._id} product={product}/>)}</div>
    {Shelf({ title: 'Daily needs under ₹1,000', items: quick.slice(0, 8), tiles: true })}
  </div>;
}

export function Offers() {
  const { products, notify } = useStore();
  const [coupons, setCoupons] = useState([]);
  useEffect(() => { api('/coupons').then(setCoupons).catch(() => {}); }, []);
  const top = [...products].sort((a, b) => savings(b) - savings(a));
  return <div className="inner-page offers-page">
    <section className="offer-hero"><Ticket size={40}/><div><h1>Offer Zone</h1><p>Top discounts, coupons and bank offers (demo).</p></div></section>
    <div className="coupon-strip">{coupons.map(c => <button key={c.code} className="coupon-chip" onClick={() => { navigator.clipboard?.writeText(c.code).catch(() => {}); notify('Copied ' + c.code); }}><Copy size={14}/><strong>{c.code}</strong><span>{c.title}</span></button>)}
      <div className="coupon-chip static"><ShieldCheck size={14}/><strong>BANK10</strong><span>10% off with demo bank cards (display only)</span></div></div>
    {Shelf({ title: 'Biggest discounts', items: top.slice(0, 8), target: 'shop?sort=discount' })}
    <section className="shelf"><h2>Under ₹499</h2><div className="tile-row">{products.filter(p => p.price < 499).map(p => <Tile key={p._id} product={p}/>)}</div></section>
  </div>;
}

export function Wishlist() {
  const { wishlist, notify } = useStore();
  async function share() {
    try {
      const { token } = await api('/wishlist/share');
      const link = location.origin + '/#/shared/' + token;
      await navigator.clipboard?.writeText(link).catch(() => {});
      notify('Share link copied: ' + link);
    } catch (err) { notify(err.message); }
  }
  return <div className="inner-page">
    <Breadcrumbs items={[{ label: 'My Wishlist' }]}/>
    <div className="panel-head"><h1 className="page-title">My Wishlist ({wishlist.length})</h1>{wishlist.length > 0 && <button className="btn btn-outline small" onClick={share}>Share wishlist</button>}</div>
    {wishlist.length ? <div className="product-grid">{wishlist.map(product => <ProductCard key={product._id} product={product}/>)}</div>
      : <Empty title="Empty Wishlist" description="You have no items in your wishlist. Start adding!" action={() => navigate('shop')}/>}
  </div>;
}

const pages = {
  about: ['About FaultKart', ['FaultKart is a fictional, educational e-commerce marketplace built with MongoDB, Express, React and Node.js.', 'It exists to practise debugging, testing and secure software engineering.']],
  careers: ['Careers', ['We are always looking for curious engineers who love finding bugs. (This is a demo page.)']],
  stories: ['FaultKart Stories', ['Stories from our demo sellers and shoppers will appear here.']],
  press: ['Press', ['FaultKart is not a real company. There are no press releases.']],
  payments: ['Payments', ['All payment options in FaultKart are simulated. No card, UPI or bank details are collected or charged.']],
  shipping: ['Shipping', ['Delivery dates are estimates computed from your pincode. Nothing is physically shipped.']],
  returns: ['Cancellation & Returns', ['Orders can be cancelled until they are out for delivery. Prepaid demo refunds are shown as notifications.']],
  terms: ['Terms of Use', ['Use FaultKart only for learning and testing. Do not enter real personal or payment information.']],
  security: ['Security', ['Report vulnerabilities in this training app through your instructor. Never test third-party systems.']],
  privacy: ['Privacy Policy', ['FaultKart stores demo data per browser session in a local MongoDB database.']],
  advertise: ['Advertise with FaultKart', ['Sponsored placements on this demo are illustrative only.']],
  app: ['Download the app', ['There is no FaultKart mobile app — the website is fully responsive instead.']]
};
export function InfoPage() {
  const { route } = useStore();
  const page = pages[route.id];
  if (!page) return <Empty title="Page not found" description="This page does not exist." action={() => navigate('')} actionLabel="Go home"/>;
  return <div className="inner-page"><Breadcrumbs items={[{ label: page[0] }]}/><div className="panel info-page"><h1>{page[0]}</h1>{page[1].map(p => <p key={p}>{p}</p>)}</div></div>;
}

export function SharedWishlist() {
  const { route } = useStore();
  const [data, setData] = useState(null);
  useEffect(() => { api('/wishlist/shared/' + encodeURIComponent(route.id)).then(setData).catch(err => setData({ error: err.message })); }, [route.id]);
  if (!data) return <div className="loading-block">Loading wishlist…</div>;
  if (data.error) return <Empty title="Wishlist unavailable" description={data.error} action={() => navigate('')} actionLabel="Go home"/>;
  return <div className="inner-page"><h1 className="page-title">{data.owner}'s wishlist</h1>
    <div className="product-grid">{data.products.map(product => <ProductCard key={product._id} product={product}/>)}</div></div>;
}
