import React, { useEffect, useState } from 'react';
import { ShoppingCart, Zap, Heart, Tag, MapPin, Truck, RotateCcw, ShieldCheck, Star, CheckCircle2, Store, BadgeCheck } from 'lucide-react';
import { api, money, savings, navigate, useStore, savedPincode, formatDate, isoDay } from '../lib.js';
import { Breadcrumbs, Empty, ProductImage, Rating, Shelf, Assured } from '../components.jsx';

const views = [{ label: 'Front', style: {} }, { label: 'Detail', style: { transform: 'scale(1.6)', transformOrigin: '30% 40%' } },
  { label: 'Side', style: { transform: 'scale(1.35)', transformOrigin: '75% 60%' } }, { label: 'Close-up', style: { transform: 'scale(2)', transformOrigin: '50% 50%' } }];

function DeliveryCheck() {
  const [pincode, setPincode] = useState(savedPincode());
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  async function check(event) {
    event?.preventDefault();
    if (!pincode) return;
    try { setResult(await api('/delivery/' + encodeURIComponent(pincode))); setError(''); }
    catch (err) { setResult(null); setError(err.message); }
  }
  useEffect(() => { if (pincode) check(); }, []);
  return <div className="delivery-check">
    <span className="label">Delivery</span>
    <div>
      <form className="pin-form" onSubmit={check}><MapPin size={16}/><input aria-label="Check delivery pincode" inputMode="numeric" maxLength={6} placeholder="Enter delivery pincode" value={pincode} onChange={e => setPincode(e.target.value)}/><button>Check</button></form>
      {result && <p className="delivery-result"><Truck size={15}/> Delivery by <strong>{formatDate(isoDay(result.date), { day: 'numeric', month: 'short', weekday: 'short' })}</strong> | <span className="green">Free</span>{result.fastDelivery && <em> · Fast delivery</em>}</p>}
      {error && <p className="field-error">{error}</p>}
      {!result && !error && <p className="muted">Enter pincode to check delivery date</p>}
    </div>
  </div>;
}

function Reviews({ product }) {
  const { notify } = useStore();
  const [data, setData] = useState(null);
  const [form, setForm] = useState({ rating: 0, title: '', body: '' });
  const [writing, setWriting] = useState(false);
  const load = () => api('/products/' + product._id + '/reviews').then(next => {
    setData(next);
    if (next.mine) setForm(next.mine);
  }).catch(() => setData(null));
  useEffect(() => { load(); }, [product._id]);
  async function submit(event) {
    event.preventDefault();
    try {
      await api('/products/' + product._id + '/reviews', { method: 'POST', body: JSON.stringify(form) });
      notify('Thanks! Your review was saved'); setWriting(false); load();
    } catch (error) { notify(error.message); }
  }
  if (!data) return null;
  const max = Math.max(1, ...Object.values(data.breakdown));
  return <section className="reviews-box" id="reviews">
    <div className="reviews-head"><h2>Ratings & Reviews</h2><button className="btn btn-outline" onClick={() => setWriting(!writing)}>{data.mine ? 'Edit your review' : 'Rate Product'}</button></div>
    <div className="reviews-summary">
      <div className="big-rating"><strong>{Number(data.average).toFixed(1)}<Star size={22} fill="currentColor"/></strong><span>{data.count.toLocaleString('en-IN')} Ratings &<br/>{Math.round(data.count / 7).toLocaleString('en-IN')} Reviews</span></div>
      <div className="bars">{[5, 4, 3, 2, 1].map(star => <div key={star} className="bar-row"><span>{star}★</span>
        <div className="bar"><i className={'s' + star} style={{ width: (data.breakdown[star] / max * 100) + '%' }}/></div><small>{data.breakdown[star].toLocaleString('en-IN')}</small></div>)}</div>
    </div>
    {writing && <form className="review-form" onSubmit={submit}>
      <div className="star-picker" role="radiogroup" aria-label="Your rating">{[1, 2, 3, 4, 5].map(star => <button type="button" key={star} role="radio" aria-checked={form.rating === star} aria-label={star + ' star'}
        className={form.rating >= star ? 'on' : ''} onClick={() => setForm({ ...form, rating: star })}><Star size={26} fill="currentColor"/></button>)}</div>
      <label>Review title <input maxLength={80} value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="Review title"/></label>
      <label>Your review <textarea rows={4} maxLength={1000} value={form.body} onChange={e => setForm({ ...form, body: e.target.value })} placeholder="What did you like or dislike?"/></label>
      <button className="btn btn-orange">Submit review</button>
    </form>}
    <div className="review-list">{data.reviews.map(review => <article key={review._id} className="review">
      <div><Rating value={review.rating}/><strong>{review.title}</strong>{review.mine && <em className="mine">Your review</em>}</div>
      <p className="review-body">{review.body}</p>
      <small>{review.author} · <BadgeCheck size={13}/> Certified Buyer · {formatDate(review.createdAt, { month: 'short', year: 'numeric' })}</small>
    </article>)}</div>
  </section>;
}

export default function Product() {
  const { route, products, busy, addToCart, toggleWish, wishSet, rememberView } = useStore();
  const product = products.find(p => p._id === route.id);
  const [view, setView] = useState(0);
  useEffect(() => { setView(0); if (product) rememberView(product); }, [route.id, Boolean(product)]);
  if (!products.length) return <div className="loading-block">Loading product…</div>;
  if (!product) return <Empty title="Product not found" description="The product may no longer be available." action={() => navigate('shop')}/>;
  const saved = wishSet.has(product._id);
  const similar = products.filter(p => p.category === product.category && p._id !== product._id).slice(0, 5);
  const specs = [['Brand', product.brand], ['Model name', product.name], ['Category', product.category], ['SKU', product.sku],
    ['In the box', '1 x ' + product.name + ', user guide'], ['Warranty', '1 year demo manufacturer warranty'], ['Country of origin', 'India (demo)']];
  return <>
    <div className="detail-layout">
      <div className="detail-media">
        <div className="detail-gallery">
          <div className="thumbs">{views.map((v, i) => <button key={v.label} aria-label={'Show ' + v.label + ' view'} className={view === i ? 'on' : ''} onMouseEnter={() => setView(i)} onClick={() => setView(i)}>
            <div style={v.style} className="thumb-inner"><ProductImage product={product} width={200}/></div></button>)}</div>
          <div className="detail-photo-wrap">
            <div className="zoom-frame" style={views[view].style}><ProductImage product={product} className="detail-photo" width={850}/></div>
            <button className={'wish-float' + (saved ? ' saved' : '')} aria-label={saved ? 'Remove from wishlist' : 'Save to wishlist'} onClick={() => toggleWish(product)} disabled={busy}><Heart size={20} fill={saved ? 'currentColor' : 'none'}/></button>
          </div>
        </div>
        <div className="detail-actions">
          <button className="btn btn-yellow" disabled={busy || product.stock <= 0} onClick={() => addToCart(product)}><ShoppingCart size={20}/> ADD TO CART</button>
          <button className="btn btn-orange" disabled={busy || product.stock <= 0} onClick={() => addToCart(product, true)}><Zap size={18}/> BUY NOW</button>
        </div>
      </div>
      <div className="detail-info">
        <Breadcrumbs items={[{ label: product.category, to: 'shop?category=' + encodeURIComponent(product.category) }, { label: product.name }]}/>
        <div className="eyebrow">{product.brand}</div>
        <h1>{product.name}</h1>
        <div className="detail-review"><Rating product={product}/><a href="#reviews" onClick={e => { e.preventDefault(); document.getElementById('reviews')?.scrollIntoView({ behavior: 'smooth' }); }}>{Number(product.reviewCount || 0).toLocaleString('en-IN')} Ratings & Reviews</a><Assured/></div>
        <span className="detail-price-kicker green">Special price</span>
        <div className="detail-prices"><strong>{money(product.price)}</strong><del>{money(product.mrp || product.price)}</del><b>{savings(product)}% off</b></div>
        {product.stock > 0 && product.stock <= 5 && <p className="hurry">Hurry, only {product.stock} left!</p>}
        {product.stock <= 0 && <p className="hurry">Currently out of stock</p>}
        <div className="offer-box"><h3>Available offers</h3>
          <p><Tag size={15}/> <strong>Bank Offer</strong> 10% off with demo bank cards (simulated) <span className="tnc">T&C</span></p>
          <p><Tag size={15}/> <strong>Special Price</strong> Get extra {Math.max(5, savings(product) - 20)}% off (price inclusive of discount)</p>
          <p><Tag size={15}/> <strong>Coupon</strong> Use SAVE10 in cart for 10% off · FLAT100 for ₹100 off</p>
          <p><Tag size={15}/> <strong>SuperCoins</strong> Earn up to {Math.min(100, Math.floor(product.price / 100) * 2)} coins on this item</p>
        </div>
        <DeliveryCheck/>
        <div className="detail-row"><span className="label">Services</span><ul className="services">
          <li><RotateCcw size={15}/> 7 days replacement (demo)</li><li><Truck size={15}/> Cash on Delivery available</li><li><ShieldCheck size={15}/> 1 year warranty</li></ul></div>
        <div className="detail-row"><span className="label">Seller</span><div><strong className="seller-name"><Store size={15}/> {product.brand} Retail <span className="seller-rating">4.6★</span></strong><p className="muted">GST invoice available · Demo seller</p></div></div>
        <div className="detail-row"><span className="label">Highlights</span><ul className="feature-list">{(product.features || []).map(feature => <li key={feature}><CheckCircle2 size={15}/>{feature}</li>)}</ul></div>
        <div className="detail-row"><span className="label">Description</span><p className="description">{product.description}</p></div>
        <button className="wish-inline" onClick={() => toggleWish(product)} disabled={busy}><Heart size={18} fill={saved ? 'currentColor' : 'none'}/>{saved ? 'Saved to wishlist' : 'Add to wishlist'}</button>
        <section className="specs"><h2>Specifications</h2><table><tbody>{specs.map(([k, v]) => <tr key={k}><th>{k}</th><td>{v}</td></tr>)}</tbody></table></section>
        <Reviews product={product}/>
      </div>
    </div>
    {Shelf({ title: 'Similar products', subtitle: 'More from ' + product.category, items: similar, target: 'shop?category=' + encodeURIComponent(product.category) })}
  </>;
}
